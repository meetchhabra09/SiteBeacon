import api from "../api";

export function BeaconDetails({ beacon, updateDelete }) {

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
    let duration = beacon.lastDuration ?? 0;
    let textColor = "text-green-500";
    if (duration > 400) {
        textColor = "text-red-500";
    } else if (duration > 200) {
        textColor = "text-yellow-400";
    }

    return (
        <div className="flex flex-col flex-1 min-w-[250px] max-w-sm p-8 shadow-md justify-center items-start border-1 border-gray-300 rounded-xl ">
            <div className="flex justify-between items-center w-full">
                <h1 className="text-xl font-bold">{beacon.title}</h1>
                <div className="text-white text-xs py-0.5 font-semibold bg-green-600 px-3 rounded-2xl">{beacon.lastStatus === "UP" ? "Online" : "Offline"}</div>
            </div>
            <div className="text-gray-500 line-clamp-1">{beacon.url}</div>
            <div className="flex justify-between items-center w-full">
                <div className="text-gray-500 ">Response Time</div>
                <div className={`font-semibold ${textColor}`}>{beacon.lastDuration}ms</div>
            </div>
            <hr className="border w-full border-gray-300 my-2" />
            <div className="w-full">
                <div className="flex justify-between items-center">
                    <div className="text-gray-700">Mumbai</div>
                    <div>{beacon.lastStatus === "UP"? "✅200" : "❌400"}</div>
                </div>
            </div>
            <button onClick={handleDelete} className="w-full text-sm hover:text-white hover:bg-red-500 cursor-pointer font-semibold border-gray-300 border-1 p-2 mt-3 rounded-lg transition-all">Delete</button>
        </div>
    );
}