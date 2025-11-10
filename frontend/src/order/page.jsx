import React, { useState, useEffect } from "react";
import Navbar from "../navbar/page";

export default function OrderingPage({ customerId }) {
  const [restaurants, setRestaurants] = useState([]);
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("COD");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/restaurants").then(r => r.json()).then(setRestaurants);
  }, []);

  // Add item to cart
  const addToCart = (item) => {
    setCart((prev) => {
      const found = prev.find(ci => ci.item_id === item.id);
      if (found) {
        return prev.map(ci =>
          ci.item_id === item.id
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [...prev, { item_id: item.id, item_name: item.item_name, price: item.price, quantity: 1 }];
    });
  };

  // Remove from cart
  const removeFromCart = (item_id) => {
    setCart(cart.filter(ci => ci.item_id !== item_id));
  };

  // Place order
  const submitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
   const userData = JSON.parse(localStorage.getItem("user"));
const userId = userData?.id;
console.log(userId);
    const payload = {
      customer_id: userId,
      items: cart.map(({ item_id, quantity }) => ({ item_id, quantity })),
      address,
      payment_method: payment,
    };
    const res = await fetch("http://127.0.0.1:5000/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMessage(data.message || "Order placed");
    setCart([]);
    setAddress("");
    setPayment("COD");
    setLoading(false);
  };

  const cartTotal = cart.reduce((a, b) => a + b.price * b.quantity, 0);

  return (
    <>
    <Navbar/>
    <div className="w-screen h-screen bg-gradient-to-br from-indigo-50 to-indigo-200 flex justify-center items-start pt-12">
      <div className="bg-white shadow-2xl rounded-xl w-full max-w-3xl p-8">
        <h1 className="text-2xl font-bold mb-6">Place Your Order</h1>
        {/* Restaurant Menus */}
        <div className="mb-6">
          {restaurants.map(rest => (
            <div key={rest.id} className="mb-4">
              <h2 className="text-xl font-semibold mb-2 text-indigo-700">{rest.name}</h2>
              <p className="mb-1 text-gray-600">{rest.address}</p>
              <div className="flex flex-wrap gap-4">
                {rest.menu && rest.menu.map(item => (
                  <div key={item.id} className="border p-4 rounded-lg bg-gray-50 flex flex-col items-center min-w-[150px]">
                    <div className="font-semibold text-black">{item.item_name}</div>
                    <div className="text-indigo-700 mb-2">₹{item.price}</div>
                    <button
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      onClick={() => addToCart(item)}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Cart Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-indigo-700">Your Cart</h3>
          {cart.length === 0 ? (
            <div className="text-gray-500">Your cart is empty.</div>
          ) : (
            <table className="w-full mb-4 text-black">
              <thead>
                <tr className="bg-indigo-50">
                  <th className="text-left p-2">Item</th>
                  <th className="text-left p-2">Qty</th>
                  <th className="text-left p-2">Price</th>
                  <th className="text-left p-2">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(ci => (
                  <tr key={ci.item_id}>
                    <td className="p-2">{ci.item_name}</td>
                    <td className="p-2">{ci.quantity}</td>
                    <td className="p-2">₹{ci.price}</td>
                    <td className="p-2">₹{ci.price * ci.quantity}</td>
                    <td className="p-2">
                      <button
                        className="text-red-500 hover:underline"
                        onClick={() => removeFromCart(ci.item_id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="text-right text-lg font-bold">
            Total: ₹{cartTotal}
          </div>
        </div>
        {/* Order Form */}
        <form onSubmit={submitOrder} className="space-y-4">
          <input
            type="text"
            placeholder="Delivery Address"
            className="w-full p-3 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
            value={address}
            onChange={e => setAddress(e.target.value)}
          />
          <div className="flex gap-4">
            <label className="font-semibold">Payment:</label>
            <select
              className="border rounded-lg p-2 bg-white text-black"
              value={payment}
              onChange={e => setPayment(e.target.value)}
            >
              <option value="COD">Cash on Delivery</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={cart.length === 0 || loading}
            className={`w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>
        {message && <div className="mt-4 text-green-700 font-medium">{message}</div>}
      </div>
    </div>
    </>
  );
}
