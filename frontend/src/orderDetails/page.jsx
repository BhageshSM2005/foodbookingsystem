import React, { useEffect, useState } from "react";
import Navbar from "../navbar/page";

export default function OwnerOrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Owner ID from localStorage
  const ownerId = localStorage.getItem("owner_id");

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/owner/orders?owner_id=${1}`)
      .then(r => r.json())
      .then(data => { setOrders(data); setLoading(false); });
  }, [ownerId]);

  return (
    <>
    <Navbar/>
    <div className="w-screen h-screen bg-gradient-to-br from-indigo-50 to-indigo-200 flex justify-center items-start pt-10">
      <div className="bg-black shadow-2xl rounded-xl w-full max-w-3xl p-8">
        <h1 className="text-2xl font-bold mb-6">Orders for My Restaurant</h1>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-500">No orders found.</div>
        ) : (
          orders.map(order => (
            <div key={order.order_id} className="mb-6 border-b pb-4">
              <div className="flex justify-between mb-2 font-semibold">
                <span>Order ID: {order.order_id}</span>
                <span>Placed: {order.placed_at}</span>
              </div>
              <div className="mb-2 text-gray-700">Address: {order.address}</div>
              <div className="mb-2 text-gray-700">Customer ID: {order.customer_id}</div>
              <div className="mb-2 text-gray-700">Payment: {order.payment_method} ({order.payment_status})</div>
              <div>
                <table className="w-full mb-2 text-black">
                  <thead>
                    <tr className="bg-indigo-50">
                      <th className="text-left p-2">Item</th>
                      <th className="text-left p-2">Qty</th>
                      <th className="text-left p-2">Unit Price</th>
                      <th className="text-left p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2">{item.item_name}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">₹{item.unit_price}</td>
                        <td className="p-2">₹{item.unit_price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-right font-bold">Total: ₹{order.total_price}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
}
