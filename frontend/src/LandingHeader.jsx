import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function LandingHeader() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
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

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden flex flex-col gap-1.5 w-8 h-8 justify-center items-center focus:outline-none"
                    aria-label="Toggle menu"
                >
                    <span className={`w-6 h-0.5 bg-[#002855] transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                    <span className={`w-6 h-0.5 bg-[#002855] transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`w-6 h-0.5 bg-[#002855] transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-64 border-t border-gray-200' : 'max-h-0'}`}>
                <nav className="flex flex-col gap-2 px-6 py-4 bg-white">
                    <a 
                        href="#about" 
                        className="text-gray-700 hover:text-[#0073E6] font-medium transition-colors py-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        About Us
                    </a>
                    <button
                        onClick={() => {
                            navigate("/login");
                            setIsMenuOpen(false);
                        }}
                        className="text-left text-gray-700 hover:text-[#0073E6] font-medium transition-colors py-2"
                    >
                        Login
                    </button>
                    <button
                        onClick={() => {
                            navigate("/signup");
                            setIsMenuOpen(false);
                        }}
                        className="bg-[#0073E6] hover:bg-[#002855] text-white px-6 py-2 rounded-lg font-semibold shadow-md transition-all mt-2"
                    >
                        Get Started
                    </button>
                </nav>
            </div>
        </header>
    );
}
