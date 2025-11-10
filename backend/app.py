# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import mysql.connector
import os
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "Bhagesh@2005")   # put your mysql password
DB_NAME = os.getenv("DB_NAME", "food_ordering_db")


# Get all restaurants (no filter)
@app.route('/api/admin/restaurants', methods=['GET'])
def admin_restaurants():
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM restaurants ORDER BY name")
    restaurants = cur.fetchall()
    cur.close(); conn.close()
    return jsonify(restaurants)
@app.route('/api/order/restaurants', methods=['GET'])
def get_restaurants():
    owner_id = request.args.get('owner_id')  # get from query param

    cur = mysql.connection.cursor(dictionary=True)
    if owner_id:
        cur.execute("SELECT * FROM restaurants WHERE owner_id = %s", (owner_id,))
    else:
        cur.execute("SELECT * FROM restaurants")
    
    restaurants = cur.fetchall()
    cur.close()
    
    return jsonify(restaurants)



# Get all orders with filters: date range and restaurant name
@app.route('/api/admin/orders', methods=['GET'])
def admin_orders():
    from_date = request.args.get('from_date')  # YYYY-MM-DD, optional
    to_date = request.args.get('to_date')      # YYYY-MM-DD, optional
    restaurant_name = request.args.get('restaurant_name', '').strip()

    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)
    
    # Base query
    query = """
        SELECT o.id, o.customer_id, o.total_price, o.status, o.payment_method, o.payment_status,
               o.address, o.placed_at, r.name AS restaurant_name,
               m.item_name, oi.quantity, oi.unit_price
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN menu_items m ON oi.menu_item_id = m.id
        JOIN restaurants r ON m.restaurant_id = r.id
        WHERE 1=1
    """
    params = []

    # Filter by restaurant name (partial match)
    if restaurant_name:
        query += " AND r.name LIKE %s"
        params.append(f"%{restaurant_name}%")

    # Filter by date range
    if from_date:
        query += " AND o.placed_at >= %s"
        params.append(from_date)
    if to_date:
        query += " AND o.placed_at <= %s"
        params.append(to_date + " 23:59:59")

    query += " ORDER BY o.placed_at DESC"

    cur.execute(query, params)
    rows = cur.fetchall()

    # Group by order id
    orders = {}
    for row in rows:
        oid = row['id']
        if oid not in orders:
            orders[oid] = {
                "order_id": oid,
                "customer_id": row['customer_id'],
                "total_price": row['total_price'],
                "status": row['status'],
                "payment_method": row['payment_method'],
                "payment_status": row['payment_status'],
                "address": row['address'],
                "placed_at": row['placed_at'],
                "restaurant_name": row['restaurant_name'],
                "items": []
            }
        orders[oid]["items"].append({
            "item_name": row["item_name"],
            "quantity": row["quantity"],
            "unit_price": row["unit_price"],
        })

    cur.close(); conn.close()
    return jsonify(list(orders.values()))

def get_db_connection():
    return mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)

def user_by_email(email):
    conn = get_db_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM customers WHERE email=%s", (email,))
    u = cur.fetchone()
    cur.close(); conn.close()
    return u

@app.route('/')
def home():
    return jsonify({"ok": True, "msg": "Backend running"})

# REGISTER
@app.route('/api/register', methods=['POST'])
def register():
    d = request.get_json() or {}
    name = d.get('name'); email = d.get('email'); password = d.get('password');role=d.get('role')
    if not (name and email and password):
        return jsonify({"success": False, "message": "name,email,password required"}), 400
    if user_by_email(email):
        return jsonify({"success": False, "message": "email already registered"}), 400
    pw_hash = generate_password_hash(password)
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute("INSERT INTO customers (name,email,password_hash,role) VALUES (%s,%s,%s,%s)", (name,email,pw_hash,role))
    conn.commit(); cur.close(); conn.close()
    return jsonify({"success": True, "message": "registration successful"})

# LOGIN
@app.route('/api/login', methods=['POST'])
def login():
    d = request.get_json() or {}
    email = d.get('email')
    password = d.get('password')
    role = d.get('role', 'user')  # default role if not sent

    if not (email and password):
        return jsonify({"success": False, "message": "Email and password required"}), 400

    # Fetch user by email
    user = user_by_email(email)

    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    # Check password hash
    if not check_password_hash(user['password_hash'], password):
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    # Optional: validate role if your DB has it
    if 'role' in user and user['role'] != role:
        return jsonify({
            "success": False,
            "message": f"Invalid role for this account. Try logging in as {user['role']}."
        }), 403

    # Prepare response data
    user_info = {
        "id": user['id'],
        "name": user['name'],
        "email": user['email'],
        "role": user.get('role', 'user'),
        "is_admin": bool(user.get('is_admin'))
    }

    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": user_info
    }), 200


# GET RESTAURANTS + MENU
@app.route('/api/restaurants', methods=['GET'])
def restaurants():
    conn = get_db_connection(); cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM restaurants")
    restaurants = cur.fetchall()
    for r in restaurants:
        cur.execute("SELECT id, item_name, price FROM menu_items WHERE restaurant_id=%s", (r['id'],))
        r['menu'] = cur.fetchall()
    cur.close(); conn.close()
    return jsonify(restaurants)

@app.route('/api/restaurants', methods=['POST'])
def add_restaurant():
    d = request.get_json() or {}
    name = d.get('name')
    address = d.get('address')
    if not name:
        return jsonify({"success": False, "message": "name required"}), 400
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute("INSERT INTO restaurants (name, address) VALUES (%s, %s)", (name, address))
    conn.commit()
    restaurant_id = cur.lastrowid
    cur.close(); conn.close()
    return jsonify({"success": True, "message": "restaurant added", "restaurant_id": restaurant_id})

@app.route('/api/restaurants/<int:restaurant_id>/menu_items', methods=['POST'])
def add_menu_item(restaurant_id):
    d = request.get_json() or {}
    item_name = d.get('item_name')
    price = d.get('price')
    if not item_name or price is None:
        return jsonify({"success": False, "message": "item_name and price required"}), 400
    conn = get_db_connection(); cur = conn.cursor()
    cur.execute("INSERT INTO menu_items (restaurant_id, item_name, price) VALUES (%s,%s,%s)", (restaurant_id, item_name, price))
    conn.commit()
    menu_item_id = cur.lastrowid
    cur.close(); conn.close()
    return jsonify({"success": True, "message": "menu item added", "menu_item_id": menu_item_id})


# CHECKOUT (place order)
# payload: { customer_id, items: [{ item_id, quantity }], address, payment_method }
@app.route('/api/checkout', methods=['POST'])
def checkout():
    d = request.get_json() or {}
    customer_id =  int(d.get('customer_id'))
    items = d.get('items') or []
    address = d.get('address', '')
    payment_method = d.get('payment_method', 'COD')  # COD, CARD, UPI

    if not (customer_id and items):
        return jsonify({"success": False, "message": "customer_id and items required"}), 400

    conn = get_db_connection(); cur = conn.cursor(dictionary=True)
    # compute total and validate items
    total = 0.0
    item_rows = []
    for it in items:
        cur.execute("SELECT id, item_name, price, restaurant_id FROM menu_items WHERE id=%s", (it['item_id'],))
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return jsonify({"success": False, "message": f"menu item {it['item_id']} not found"}), 404
        qty = int(it.get('quantity',1))
        total += float(row['price']) * qty
        item_rows.append({'menu_item_id': row['id'], 'quantity': qty, 'unit_price': float(row['price'])})

    total = round(total, 2)
    # insert order
    cur.execute("INSERT INTO orders (customer_id, total_price, payment_method, payment_status, address) VALUES (%s,%s,%s,%s,%s)",
                (customer_id, total, payment_method, 'PENDING', address))
    order_id = cur.lastrowid

    # insert order_items
    for ir in item_rows:
        cur.execute("INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price) VALUES (%s,%s,%s,%s)",
                    (order_id, ir['menu_item_id'], ir['quantity'], ir['unit_price']))

    # simulate payment
    transaction_id = str(uuid.uuid4())
    payment_status = 'PENDING'
    if payment_method in ('CARD','UPI'):
        payment_status = 'PAID'
    elif payment_method == 'COD':
        payment_status = 'PENDING'

    cur.execute("INSERT INTO payments (order_id, amount, method, transaction_id, status) VALUES (%s,%s,%s,%s,%s)",
                (order_id, total, payment_method, transaction_id, payment_status))

    # update order payment_status
    cur.execute("UPDATE orders SET payment_status=%s WHERE id=%s", (payment_status, order_id))

    conn.commit()
    cur.close(); conn.close()

    return jsonify({"success": True, "message": "order placed", "order_id": order_id, "payment_status": payment_status})

@app.route('/api/owner/orders', methods=['GET'])
def owner_orders():
    owner_id = request.args.get('owner_id')
    if not owner_id:
        return jsonify({"success": False, "message": "owner_id required as query param"}), 400
    conn = get_db_connection(); cur = conn.cursor(dictionary=True)
    # Fetch restaurants owned by this owner
    cur.execute("SELECT id FROM restaurants WHERE owner_id=%s", (owner_id,))
    rest_rows = cur.fetchall()
    restaurant_ids = [r['id'] for r in rest_rows]
    if not restaurant_ids:
        cur.close(); conn.close()
        return jsonify([])
    # Fetch all orders for these restaurants (assuming order_items, orders, menu_items)
    cur.execute("""
        SELECT o.id AS order_id, o.customer_id, o.total_price, o.payment_method, o.payment_status, o.address, o.placed_at,
               m.item_name, oi.quantity, oi.unit_price, m.restaurant_id
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN menu_items m ON oi.menu_item_id = m.id
        WHERE m.restaurant_id IN (%s)
        ORDER BY o.placed_at DESC
    """ % (",".join(str(rid) for rid in restaurant_ids)))
    orders_raw = cur.fetchall()
    # Group items by order
    orders = {}
    for row in orders_raw:
        oid = row['order_id']
        if oid not in orders:
            orders[oid] = {
                "order_id": oid,
                "customer_id": row['customer_id'],
                "total_price": row['total_price'],
                "payment_method": row['payment_method'],
                "payment_status": row['payment_status'],
                "address": row['address'],
                "placed_at": row['placed_at'],
                "items": []
            }
        orders[oid]["items"].append({
            "item_name": row["item_name"],
            "quantity": row["quantity"],
            "unit_price": row["unit_price"]
        })
    cur.close(); conn.close()
    return jsonify(list(orders.values()))


# GET MY ORDERS
@app.route('/api/myorders', methods=['GET'])
def myorders():
    customer_id = request.args.get('customer_id')
    if not customer_id:
        return jsonify({"success": False, "message": "customer_id required in query param"}), 400
    conn = get_db_connection(); cur = conn.cursor(dictionary=True)
    cur.execute("""
        SELECT o.id, o.total_price, o.status, o.payment_method, o.payment_status, o.address, o.placed_at
        FROM orders o WHERE o.customer_id=%s ORDER BY o.placed_at DESC
    """, (customer_id,))
    orders = cur.fetchall()
    for o in orders:
        cur.execute("SELECT oi.menu_item_id, m.item_name, oi.quantity, oi.unit_price FROM order_items oi JOIN menu_items m ON oi.menu_item_id=m.id WHERE oi.order_id=%s", (o['id'],))
        o['items'] = cur.fetchall()
    cur.close(); conn.close()
    return jsonify(orders)

# GET single order
@app.route('/api/order/<int:order_id>', methods=['GET'])
def get_order(order_id):
    conn = get_db_connection(); cur = conn.cursor(dictionary=True)
    cur.execute("SELECT * FROM orders WHERE id=%s", (order_id,))
    o = cur.fetchone()
    if not o:
        cur.close(); conn.close()
        return jsonify({"success": False, "message": "order not found"}), 404
    cur.execute("SELECT oi.menu_item_id, m.item_name, oi.quantity, oi.unit_price FROM order_items oi JOIN menu_items m ON oi.menu_item_id=m.id WHERE oi.order_id=%s", (order_id,))
    o['items'] = cur.fetchall()
    cur.execute("SELECT * FROM payments WHERE order_id=%s", (order_id,))
    o['payments'] = cur.fetchall()
    cur.close(); conn.close()
    return jsonify(o)

# ADMIN: list all orders (requires admin user id param)
# @app.route('/api/admin/orders', methods=['GET'])
# def admin_orders():
#     admin_user_id = request.args.get('admin_user_id')
#     if not admin_user_id:
#         return jsonify({"success": False, "message":"admin_user_id required"}), 400
#     conn = get_db_connection(); cur = conn.cursor(dictionary=True)
#     cur.execute("SELECT is_admin FROM customers WHERE id=%s", (admin_user_id,))
#     u = cur.fetchone()
#     if not u or not u.get('is_admin'):
#         cur.close(); conn.close()
#         return jsonify({"success": False, "message":"not an admin"}), 403
#     cur.execute("""
#         SELECT o.id, c.name as customer_name, o.total_price, o.status, o.payment_status, o.payment_method, o.placed_at
#         FROM orders o JOIN customers c ON o.customer_id = c.id
#         ORDER BY o.placed_at DESC
#     """)
#     orders = cur.fetchall()
#     cur.close(); conn.close()
#     return jsonify(orders)

# ADMIN: update order status (requires admin_user_id in body)
@app.route('/api/admin/order/<int:order_id>/status', methods=['PUT'])
def admin_update_status(order_id):
    d = request.get_json() or {}
    admin_user_id = d.get('admin_user_id')
    new_status = d.get('status')
    if not (admin_user_id and new_status):
        return jsonify({"success": False, "message":"admin_user_id and status required"}), 400
    conn = get_db_connection(); cur = conn.cursor(dictionary=True)
    cur.execute("SELECT is_admin FROM customers WHERE id=%s", (admin_user_id,))
    u = cur.fetchone()
    if not u or not u.get('is_admin'):
        cur.close(); conn.close()
        return jsonify({"success": False, "message":"not an admin"}), 403
    cur.execute("UPDATE orders SET status=%s WHERE id=%s", (new_status, order_id))
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"success": True, "message": "order status updated"})

if __name__ == '__main__':
    # quick check DB connection
    try:
        conn = get_db_connection(); conn.close()
    except Exception as e:
        print("ERROR connecting to DB:", e)
    app.run(debug=True)
