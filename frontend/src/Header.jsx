    import { useNavigate, useLocation } from "react-router-dom";
    import { useState, useEffect } from "react";
    import { LoginPop } from "./Components/LoginPop";

    export function Header() {
        const navigate = useNavigate();
        const location = useLocation();
        const backToHome = () => {
            navigate("/")
        }
        const [userInitial, setUserInitial] = useState("@");
        useEffect(() => {
            const user = localStorage.getItem("name");
            if (user) {
                setUserInitial(user.charAt(0).toUpperCase());
            }
        }, [location]);

        const [showPop, setShowPop] = useState(false);


        return (
            <div className="flex justify-between items-center px-5 shadow-md p-2">
                <div onClick={backToHome} className="flex items-center">
                    <img src="/lighthouse.png" alt="logo" className="w-8 h-8 cursor-pointer select-none" />
                    <h1 className="text-2xl m-2 font-bold cursor-pointer select-none">SiteBeacon</h1>
                </div>
                <div className="relative">
                    <h1
                        className="text-xl text-gray-600 p-0.5 font-semibold rounded-full border-1 border-gray-300 shadow-md h-9 w-9 cursor-pointer text-center select-none"
                        onClick={() => setShowPop((prev) => !prev)}
                    >
                        {userInitial}
                    </h1>
                    {showPop && (
                        <div className="absolute right-0 mt-5 z-50">
                            <LoginPop />
                        </div>
                    )}
                </div>
            </div>
        );
    }