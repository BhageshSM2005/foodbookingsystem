CREATE DATABASE IF NOT EXISTS food_ordering_db;
USE food_ordering_db;

-- Customers (with is_admin)
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_admin TINYINT(1) DEFAULT 0
);

-- Restaurants
CREATE TABLE IF NOT EXISTS restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  address VARCHAR(255),
  rating FLOAT DEFAULT 0
);

-- Menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  item_name VARCHAR(150) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status ENUM('PLACED','CONFIRMED','PREPARING','OUT_FOR_DELIVERY','DELIVERED','CANCELLED') DEFAULT 'PLACED',
  payment_method ENUM('COD','CARD','UPI') DEFAULT 'COD',
  payment_status ENUM('PENDING','PAID','FAILED') DEFAULT 'PENDING',
  address VARCHAR(500),
  placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Payments (log)
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  amount DECIMAL(10,2),
  method ENUM('COD','CARD','UPI'),
  transaction_id VARCHAR(200),
  status ENUM('PENDING','PAID','FAILED'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Sample data: restaurants + menu items
INSERT INTO restaurants (name, address, rating) VALUES
('Pizza Palace','MG Road, Bengaluru',4.5),
('Spicy Treats','BTM Layout, Bengaluru',4.3),
('Burger Hub','Jayanagar, Bengaluru',4.6);

INSERT INTO menu_items (restaurant_id, item_name, price) VALUES
(1,'Margherita Pizza',249.00),
(1,'Farmhouse Pizza',349.00),
(2,'Paneer Butter Masala',199.00),
(2,'Chicken Biryani',249.00),
(3,'Veg Burger',119.00),
(3,'Cheese Burger',149.00);

-- Optional: create an initial admin user (replace password hash later)
-- Use registration to create a user, then set is_admin=1 manually:
-- UPDATE customers SET is_admin=1 WHERE email='you@example.com';
