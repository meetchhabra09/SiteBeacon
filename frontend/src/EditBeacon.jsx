import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "./api";

export function EditBeacon() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        const fetchBeacon = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await api.get(`/jobs/${id}`, {
                    headers: { Authorization: `${token}` },
                });
                
                setName(response.data.title || "");
                setUrl(response.data.url || "");
                setLoading(false);
            } catch (error) {
                console.error(error);
                setStatus("❌ Failed to load beacon details");
                setLoading(false);
            }
        };

        if (id) {
            fetchBeacon();
        }
    }, [id]);

    const handleUpdate = async () => {
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

            await api.put(
                `/jobs/${id}`,
                payload,
                {
                    headers: { Authorization: `${token}` },
                }
            );

            setStatus(`✅ Beacon "${name}" updated successfully`);
            setTimeout(() => {
                navigate("/dashboard");
            }, 1500);

        } catch (error) {
            console.error(error);
            setStatus("❌ Failed to update beacon");
        }
    };

    if (loading) {
        return (
            <div className="min-h-[90vh] bg-[#F4F6F9] py-12 px-4 flex items-center justify-center">
                <div className="text-gray-600">Loading beacon details...</div>
            </div>
        );
    }

    return (
        <div className="min-h-[90vh] bg-[#F4F6F9] py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
                    <div className="mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-[#0073E6] flex items-center justify-center shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-center text-[#002855] mb-2">
                            Edit Beacon
                        </h1>
                        <p className="text-center text-gray-600">
                            Update your beacon's endpoint details
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="font-semibold text-gray-700 block mb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0073E6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                Beacon Name
                            </label>
                            <input
                                type="text"
                                placeholder="My Awesome Project"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-300 focus:border-[#0073E6] focus:ring-2 focus:ring-[#00A1E0]/20 rounded-lg px-4 py-3 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="font-semibold text-gray-700 block mb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#0073E6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                </svg>
                                Website URL
                            </label>
                            <input
                                type="text"
                                placeholder="https://www.my-awesome-project.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full border border-gray-300 focus:border-[#0073E6] focus:ring-2 focus:ring-[#00A1E0]/20 rounded-lg px-4 py-3 outline-none transition-all"
                            />
                        </div>

                        {status && (
                            <div className={`p-4 rounded-lg font-semibold text-center ${
                                status.includes("✅") 
                                    ? "bg-green-100 text-green-700" 
                                    : status.includes("❌")
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                            }`}>
                                {status}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={handleUpdate}
                                className="flex-1 bg-[#0073E6] hover:bg-[#0066CC] text-white font-semibold py-3.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Update Beacon
                            </button>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
