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
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

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

        const socket = io("http://localhost:3000", {
            query: { userId: userId },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
        });

        socket.on("beaconUpdate", (updatedBeacon) => {
            console.log("Beacon update received:", updatedBeacon);
            setBeacons(prev => {
                const exists = prev.find(b => b._id === updatedBeacon._id);
                if (exists) {
                    return prev.map(b => (b._id === updatedBeacon._id ? updatedBeacon : b));
                } else {
                    return [...prev, updatedBeacon];
                }
            });
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });

        return () => {
            socket.disconnect();
        };
    }, [navigate]);

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

    const filteredBeacons = beacons.filter((beacon) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesQuery = !query
            || (beacon.title || "").toLowerCase().includes(query)
            || (beacon.url || "").toLowerCase().includes(query);

        const isOnline = beacon.lastStatus === "UP";
        const matchesStatus = statusFilter === "all"
            || (statusFilter === "online" && isOnline)
            || (statusFilter === "offline" && !isOnline);

        return matchesQuery && matchesStatus;
    });

    useEffect(() => {
        if (filteredBeacons.length > 0) {
            const avg = findAvgTime(filteredBeacons);
            const max = findMaxTime(filteredBeacons);
            setAvgTime(avg);
            setMaxTime(max);
        } else {
            setAvgTime(0);
            setMaxTime(0);
        }
    }, [filteredBeacons]);

    const handleDeleteBeacon = (beaconId) => {
        setBeacons(prev => prev.filter(b => b._id !== beaconId));
    };

    const refreshBeacons = async () => {
        setRefreshing(true);
        try {
            const token = localStorage.getItem("token");
            const response = await api.get("/jobsRefresh", {
                headers: { Authorization: `${token}` },
            });
            
            setBeacons(response.data.beacons);
        } catch (error) {
            console.error("Failed to refresh beacons", error);
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F6F9]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-[#002855] mb-2">
                            Dashboard
                        </h1>
                        <p className="text-gray-600 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Your watchtower for website reliability
                        </p>
                    </div>
                    <button 
                        onClick={goToAddBeacon} 
                        className="group bg-[#0073E6] hover:bg-[#002855] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Beacon
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <BeaconCount count={filteredBeacons.length} />
                    <ResponseTimeAvg avgTime={avgTime} />
                    <ResponseTimeMax maxTime={maxTime} />
                </div>

                {/* Beacons Section */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-[#002855] flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0073E6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Your Beacons
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or URL"
                                    className="w-full sm:w-72 border border-gray-300 focus:border-[#0073E6] focus:ring-2 focus:ring-[#00A1E0]/20 rounded-lg pl-10 pr-4 py-2.5 outline-none transition-all"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                                </svg>
                            </div>
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full sm:w-44 border border-gray-300 focus:border-[#0073E6] focus:ring-2 focus:ring-[#00A1E0]/20 rounded-lg pl-3 pr-8 py-2.5 outline-none transition-all appearance-none bg-white"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="online">Online</option>
                                    <option value="offline">Offline</option>
                                </select>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            <button 
                                onClick={refreshBeacons} 
                                disabled={refreshing}
                                className={`flex items-center justify-center gap-2 bg-[#00A1E0] hover:bg-[#0073E6] text-white px-4 py-2.5 rounded-lg font-semibold transition-all shadow-md
                                    ${refreshing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
                                `}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {refreshing ? 'Refreshing...' : 'Refresh All'}
                            </button>
                        </div>
                    </div>

                    {beacons.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No beacons yet</h3>
                            <p className="text-gray-500 mb-6">Start monitoring your websites by creating your first beacon</p>
                            <button 
                                onClick={goToAddBeacon}
                                className="inline-flex items-center gap-2 bg-[#0073E6] hover:bg-[#002855] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Your First Beacon
                            </button>
                        </div>
                    ) : filteredBeacons.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No matches found</h3>
                            <p className="text-gray-500">Try a different name or URL</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBeacons.map((beacon) => (
                                <BeaconDetails key={beacon._id} beacon={beacon} updateDelete={handleDeleteBeacon} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
