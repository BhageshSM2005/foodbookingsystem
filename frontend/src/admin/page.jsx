import React, { useEffect, useState } from "react";
import Navbar from "../navbar/page";

export default function AdminDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    restaurant_name: "",
    from_date: "",
    to_date: ""
  });
  const [loading, setLoading] = useState(false);

  // Fetch restaurants on mount
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/admin/restaurants")
      .then(r => r.json())
      .then(setRestaurants);
  }, []);

  // Fetch orders with current filters
  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();

    if (filters.restaurant_name)
      params.append("restaurant_name", filters.restaurant_name);
    if (filters.from_date)
      params.append("from_date", filters.from_date);
    if (filters.to_date)
      params.append("to_date", filters.to_date);

    fetch("http://127.0.0.1:5000/api/admin/orders?" + params.toString())
      .then(r => r.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      });
  };

  // Fetch on first load and when filters change
  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
        <Navbar/>
    <div className="min-h-screen bg-indigo-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-indigo-900">Admin Dashboard</h1>

      {/* Filters */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-md flex flex-wrap gap-4 items-end">
        <div>
          <label className="block font-semibold mb-1">Restaurant Name</label>
          <input
            type="text"
            className="border text-black rounded p-2 w-64"
            value={filters.restaurant_name}
            onChange={e => setFilters({...filters, restaurant_name: e.target.value})}
            placeholder="Filter by restaurant"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">From Date</label>
          <input
            type="date"
            className="border text-black rounded p-2"
            value={filters.from_date}
            onChange={e => setFilters({...filters, from_date: e.target.value})}
          />
        </div>
        <button
          onClick={fetchOrders}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
        >
          Apply Filters
        </button>
      </div>

      {/* Restaurant List */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-indigo-800">All Restaurants</h2>
        {restaurants.length === 0 ? (
          <div className="text-gray-500">No restaurants found.</div>
        ) : (
          <ul className="list-disc list-inside text-indigo-900">
            {restaurants.map(r => (
              <li key={r.id}>
                <span className="font-semibold">{r.name}</span> — {r.address} (Rating: {r.rating || "N/A"})
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Orders List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-indigo-800">Orders</h2>
        {loading ? (
          <p className="text-gray-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">No orders match the criteria.</p>
        ) : (
          orders.map(order => (
            <div key={order.order_id} className="border text-black-b border-gray-300 pb-4 mb-4">
              <div className="flex justify-between mb-1 text-indigo-900 font-semibold">
                <span>Order ID: {order.order_id}</span>
                <span>Date: {new Date(order.placed_at).toLocaleString()}</span>
              </div>
              <div className="mb-1 text-indigo-700">Restaurant: {order.restaurant_name}</div>
              <div className="mb-1 text-indigo-700">Status: {order.status} | Payment: {order.payment_method} ({order.payment_status})</div>
              <div className="mb-1 text-indigo-700">Delivery Address: {order.address}</div>
              <table className="w-full text-indigo-900 mb-2">
                <thead>
                  <tr className="bg-indigo-100">
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">Qty</th>
                    <th className="p-2 text-left">Unit Price</th>
                    <th className="p-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2">{item.item_name}</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">₹{item.unit_price}</td>
                      <td className="p-2">₹{(item.quantity * item.unit_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right font-semibold text-indigo-900">Order Total: ₹{order.total_price}</div>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
}
