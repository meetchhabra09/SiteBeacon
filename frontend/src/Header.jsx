import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { LoginPop } from "./Components/LoginPop";

export function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const backToHome = () => {
        navigate("/")
    }
    const [userInitial, setUserInitial] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    useEffect(() => {
        const user = localStorage.getItem("name");
        const token = localStorage.getItem("token");
        if (user) {
            setUserInitial(user.charAt(0).toUpperCase());
            setIsLoggedIn(!!token);
        }
    }, [location]);

    const [showPop, setShowPop] = useState(false);

    const handleProfileClick = () => {
        if (!isLoggedIn) {
            alert("Please login to view your profile");
            navigate("/login");
            return;
        }
        setShowPop((prev) => !prev);
    }

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
            <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
                <div onClick={backToHome} className="flex items-center gap-3 cursor-pointer group">
                    <img 
                        src="/lighthouse.png" 
                        alt="SiteBeacon Logo" 
                        className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                    />
                    <h1 className="text-2xl font-bold text-[#002855] select-none">
                        SiteBeacon
                    </h1>
                </div>
                <div className="relative">
                    <button
                        className="h-10 w-10 rounded-full bg-[#0073E6] text-white font-bold text-lg flex items-center justify-center cursor-pointer hover:bg-[#002855] transition-colors shadow-md select-none"
                        onClick={handleProfileClick}
                    >
                        {userInitial ? userInitial : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        )}
                    </button>
                    {showPop && isLoggedIn && (
                        <div className="absolute right-0 mt-3 z-50">
                            <LoginPop onClose={() => setShowPop(false)} />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
