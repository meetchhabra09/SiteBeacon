import { useNavigate } from "react-router-dom";

export function LandingHeader() {
    const navigate = useNavigate();

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
            <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
                <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer group">
                    <img 
                        src="/lighthouse.png" 
                        alt="SiteBeacon Logo" 
                        className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                    />
                    <h1 className="text-2xl font-bold text-[#002855] select-none">
                        SiteBeacon
                    </h1>
                </div>

                <nav className="flex items-center gap-6">
                    <a href="#about" className="text-gray-700 hover:text-[#0073E6] font-medium transition-colors">
                        About Us
                    </a>
                    <button
                        onClick={() => navigate("/login")}
                        className="text-gray-700 hover:text-[#0073E6] font-medium transition-colors px-4 py-2"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => navigate("/signup")}
                        className="bg-[#0073E6] hover:bg-[#002855] text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all"
                    >
                        Get Started
                    </button>
                </nav>
            </div>
        </header>
    );
}
