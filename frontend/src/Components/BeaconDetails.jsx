import api from "../api";
import { useNavigate } from "react-router-dom";

export function BeaconDetails({ beacon, updateDelete }) {
    const navigate = useNavigate();

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.delete("/jobs/" + beacon._id, {
                headers: { Authorization: `${token}` },
            });

            updateDelete(beacon._id);
        } catch (error) {
            console.error(error);
        }
    }

    const handleEdit = () => {
        navigate(`/edit-beacon/${beacon._id}`);
    }

    let duration = beacon.lastDuration ?? 0;
    let textColor = "text-[#84BD00]";
    let bgColor = "bg-green-50";
    let borderColor = "border-green-200";
    
    if (duration > 400) {
        textColor = "text-red-600";
        bgColor = "bg-red-50";
        borderColor = "border-red-200";
    } else if (duration > 200) {
        textColor = "text-yellow-600";
        bgColor = "bg-yellow-50";
        borderColor = "border-yellow-200";
    }

    const isOnline = beacon.lastStatus === "UP";

    return (
        <div className="group bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-[#002855] line-clamp-1 flex-1">
                    {beacon.title}
                </h3>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isOnline 
                        ? 'bg-green-100 text-[#84BD00]' 
                        : 'bg-red-100 text-red-700'
                }`}>
                    <span className={`w-2 h-2 rounded-full ${
                        isOnline ? 'bg-[#84BD00] pulse-online' : 'bg-red-500'
                    }`}></span>
                    {isOnline ? "Online" : "Offline"}
                </div>
            </div>

            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="line-clamp-1">{beacon.url}</span>
            </div>

            <div className={`flex justify-between items-center p-3 rounded-lg mb-4 ${bgColor} border ${borderColor}`}>
                <div className="flex items-center gap-2 text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="font-medium text-sm">Response Time</span>
                </div>
                <div className={`font-bold text-lg ${textColor}`}>{duration}ms</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-medium">Mumbai</span>
                    </div>
                    <span className="text-sm font-semibold">
                        {isOnline ? "✅ 200" : "❌ 400"}
                    </span>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={handleEdit}
                    className="flex-1 py-2.5 rounded-lg font-semibold text-white bg-[#0073E6] border-2 border-[#0073E6] hover:bg-[#0066CC] hover:border-[#0066CC] transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Beacon
                </button>
                <button
                    onClick={handleDelete}
                    className="flex-1 py-2.5 rounded-lg font-semibold text-gray-700 bg-white border-2 border-gray-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200 flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    );
}
