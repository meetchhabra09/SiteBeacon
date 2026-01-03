import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";


export function AddBeacon() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
      }
    }, [navigate]);

    const handleAdd = async () => {
  if (!name || !url) {
    setStatus("⚠️ Please enter both name and URL");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const payload = {
      title: name.trim(),
      url: url.trim(),
    };

    const response = await api.post(
      "/jobs",
      payload,
      {
        headers: { Authorization: `${token}` },
      }
    );

    setStatus(`✅ Beacon "${name}" created`);
    setName("");
    setUrl("");
    navigate("/");

  } catch (error) {
    console.error(error);
    setStatus("❌ Failed to create beacon");
  }
};


    return (<div className="p-10 flex flex-col shadow m-5 border border-gray-200 rounded-2xl">
        <div className="text-4xl font-semibold">Create a new beacon:</div>
        <div className="text-sm text-gray-600 mb-3">Add a new endpoint to monitor its uptime and performance</div>
        <div className="font-semibold">Beacon Name:</div>
        <input type="text" placeholder="My Project" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 shadow rounded-md p-2 my-2" />
        <div className="font-semibold">URL:</div>
        <input type="text" placeholder="https://www.my-project.com" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full border border-gray-200 shadow rounded-md p-2 my-2" />
        <div className="flex flex-col gap-2 sm:flex-row mt-3">
            <button onClick={handleAdd} className="bg-gray-800 w-full rounded-md my-2 py-3 text-sm cursor-pointer hover:bg-black text-white shadow">Add</button>
            <button onClick={() => navigate("/")} className="bg-white w-full rounded-md my-2 py-3 text-sm cursor-pointer hover:bg-gray-100 font-semibold shadow text-black">Cancel</button>
        </div>
        <div className="text-center font-semibold text-red-500 cursor-pointer hover:text-red-600">
            {status}
        </div>    
    </div>)
}