import React, { useState, useEffect } from "react";
import Navbar from "../navbar/page";

export default function RestaurantMenuManager() {
  const [restaurants, setRestaurants] = useState([]);
  const [restData, setRestData] = useState({ name: "", address: "" });
  const [selected, setSelected] = useState(null);
  const [menuItem, setMenuItem] = useState({ item_name: "", price: "" });
  const [message, setMessage] = useState("");

 useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  fetch(`http://127.0.0.1:5000/api/order/restaurants?owner_id=${user.id}`)
    .then(r => r.json())
    .then(setRestaurants)
    .catch(console.error);
}, []);


  const addRestaurant = async (e) => {
    e.preventDefault();
    const res = await fetch("http://127.0.0.1:5000/api/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(restData)
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Restaurant added");
      setRestaurants([...restaurants, { id: data.restaurant_id, ...restData }]);
      setRestData({ name: "", address: "" });
    } else setMessage(data.message);
  };

  const addMenuItem = async (e) => {
    e.preventDefault();
    const res = await fetch(`http://127.0.0.1:5000/api/restaurants/${selected.id}/menu_items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(menuItem)
    });
    const data = await res.json();
    setMessage(data.message);
    setMenuItem({ item_name: "", price: "" });
  };

  return (
    <>
        <Navbar/>
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-200">
      <div className="bg-white shadow-2xl rounded-xl w-full max-w-lg p-8 mb-8">
        <h2 className="text-xl font-bold mb-4">Add Restaurant</h2>
        <form onSubmit={addRestaurant} className="space-y-4">
          <input 
            type="text"
            placeholder="Name"
            className="w-full p-3 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
            value={restData.name}
            onChange={e => setRestData({ ...restData, name: e.target.value })}
          />
          <input 
            type="text"
            placeholder="Address"
            className="w-full p-3 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={restData.address}
            onChange={e => setRestData({ ...restData, address: e.target.value })}
          />
          <button className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Add Restaurant
          </button>
        </form>
      </div>
      <div className="bg-white shadow-xl rounded-xl w-full max-w-lg p-8 mb-8">
        <h2 className="text-xl font-bold mb-4">Select Restaurant</h2>
        <div className="flex flex-wrap gap-4">
          {restaurants.map(r =>
            <button key={r.id}
              className={`py-2 px-4 rounded border transition duration-150 ${
                selected?.id === r.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-indigo-600 hover:bg-indigo-100"
              }`}
              onClick={() => setSelected(r)}>
              {r.name}
            </button>
          )}
        </div>
      </div>
      {selected && (
        <div className="bg-white shadow-xl rounded-xl w-full max-w-lg p-8">
          <h2 className="text-xl font-bold mb-4">Add Menu Item for {selected.name}</h2>
          <form onSubmit={addMenuItem} className="space-y-4">
            <input 
              type="text"
              placeholder="Item Name"
              className="w-full p-3 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
              value={menuItem.item_name}
              onChange={e => setMenuItem({ ...menuItem, item_name: e.target.value })}
            />
            <input 
              type="number"
              placeholder="Price"
              className="w-full p-3 border rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
              value={menuItem.price}
              onChange={e => setMenuItem({ ...menuItem, price: e.target.value })}
            />
            <button className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Add Item
            </button>
          </form>
        </div>
      )}
      {message && <div className="mt-4 text-green-600 font-medium">{message}</div>}
    </div>
    </>
  );
}
