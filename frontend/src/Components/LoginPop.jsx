import { useNavigate } from "react-router-dom";

export function LoginPop() {
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    const navigate = useNavigate();
    

     const handleSignOut = () => {
        localStorage.clear()
        navigate("/login");
        window.location.reload();
    }

    return (
        <div className="flex flex-col p-3 shadow-md rounded-xl bg-gray-100 w-fit"> 
            <div className="text-md font-semibold ">Name: {name}</div>
            <hr className="border w-full border-gray-200 my-2" />
            <div className="text-md font-semibold">Email: {email}</div>
            <hr className="border w-full border-gray-200 my-2" />
            <button onClick={handleSignOut} className="w-full text-sm hover:text-white hover:bg-red-500 cursor-pointer font-semibold border-gray-300 border p-2 mt-3 rounded-lg transition-all bg-white">Signout</button>
        </div>
    )
}