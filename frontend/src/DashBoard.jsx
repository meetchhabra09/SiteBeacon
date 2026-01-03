import { BeaconDetails } from "./Components/BeaconDetails";
import { BeaconCount } from "./Components/BeaconCount";
import { ResponseTimeAvg } from "./Components/ResponseTimeAvg";
import { ResponseTimeMax } from "./Components/ResponseTimeMax";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "./api";

export function DashBoard() {
    const [beacons, setBeacons] = useState([]);

    const navigate = useNavigate();
    const goToAddBeacon = () => {
        navigate("/add-beacon");
    };
    useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("email");
    const userId = localStorage.getItem("userId");

    if (!token) {
        navigate("/login");
        return;
    }

    // CONNECT SOCKET
    const socket = io("http://localhost:3000", {
        query: { userId: userId }
    });

    // RECEIVE LIVE BEACON UPDATES
    socket.on("beaconUpdate", (updatedBeacon) => {
        setBeacons(prev => {
        const exists = prev.find(b => b._id === updatedBeacon._id);
        if (exists) {
            return prev.map(b => (b._id === updatedBeacon._id ? updatedBeacon : b));
        } else {
            return [...prev, updatedBeacon];
        }
        });

    });

    return () => {
        socket.disconnect();
    };
}, []);


    useEffect(() => {
      const fetchBeacons = async () => {
        try {
            const token = localStorage.getItem("token");
          const response = await api.get("/jobs", {
            headers: { Authorization: `${token}` },
          });
          setBeacons(response.data.beacons);
        } catch (error) {
          console.error(error);
        }
      };

      fetchBeacons();
    }, []);

    const findAvgTime = (beacons) => {
    const valid = beacons.filter(b => typeof b.lastDuration === "number");
    if (valid.length === 0) return 0;
    return (valid.reduce((a, b) => a + b.lastDuration, 0) / valid.length).toFixed(2);
    };
    
    const findMaxTime = (beacons) => {
    const valid = beacons.filter(
        b => typeof b.lastDuration === "number" && !isNaN(b.lastDuration)
    );

    if (valid.length === 0) return 0;

    const maxValue = Math.max(...valid.map(b => b.lastDuration));
    return parseFloat(maxValue.toFixed(2));
};


    const [avgTime, setAvgTime] = useState(0);
    const [maxTime, setMaxTime] = useState(0);

    useEffect(() => {
        if (beacons.length > 0) {
            const avg = findAvgTime(beacons);
            const max = findMaxTime(beacons);
            setAvgTime(avg);
            setMaxTime(max);
        } else {
            setAvgTime(0);
            setMaxTime(0);
        }
    }, [beacons]);


    const handleDeleteBeacon = (beaconId) => {
        setBeacons(prev => prev.filter(b => b._id !== beaconId));
    };

    const refreshBeacons = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/jobsRefresh", {
            headers: { Authorization: `${token}` },
            });
            
            setBeacons(response.data.beacons); // update state with new data
        } catch (error) {
            console.error("Failed to refresh beacons", error);
        }
    };



    return (
        <div className="m-5">
            <div className="flex justify-between items-center">
                <div className="text-3xl font-bold m-3">DashBoard</div>
                <button onClick={goToAddBeacon} className="bg-gray-800 rounded-xl m-3 px-5 py-2 text-sm cursor-pointer hover:bg-black text-white">
                    +Add
                </button>
            </div>
            <div className="mx-3">Your watchtower for website reliability.</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full p-5">
                <BeaconCount count={beacons.length} />
                <ResponseTimeAvg avgTime={avgTime} />
                <ResponseTimeMax maxTime={maxTime} />
            </div>

            <div className="flex justify-between items-center">
                <div className="text-2xl font-bold m-3">Your Beacons</div>
                <button onClick={refreshBeacons} className="bg-blue-600 text-sm text-white px-4 py-2 rounded-xl hover:bg-blue-800 cursor-pointer">Refresh All</button>
            </div>

            <div className="p-5 flex flex-wrap gap-10">
                {beacons.map((beacon) => (
                    <BeaconDetails key={beacon._id} beacon={beacon} updateDelete={handleDeleteBeacon} />
                ))}
            </div>
        </div>
    );
}
