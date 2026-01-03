import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";


export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const goToSignUp = () => {
    navigate("/signup");
  };

  const handleLogin = async () => {
    if (loading) return;

    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      await api.post("/user/login", {
        email: email.trim(),
        password,
      });

      // Login successful → OTP sent → go to OTP page
      navigate("/verify-otp", {
        state: { email: email.trim() },
      });

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-[90vh]">
      <div className="p-8 flex flex-col justify-center w-fit shadow border border-gray-200 rounded-2xl">
        <div className="font-bold text-2xl mb-3">
          Login to your account
        </div>

        <div className="font-semibold">Email</div>
        <input
          type="email"
          placeholder="yaksh@gmail.com"
          className="w-full border border-gray-200 shadow rounded-md p-2 my-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="font-semibold">Password</div>
        <input
          type="password"
          placeholder="********"
          className="w-full border border-gray-200 shadow rounded-md p-2 my-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          onClick={handleLogin}
          className={`bg-gray-800 rounded-md w-full my-2 py-3 text-sm text-white
            ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-black"}
          `}
        >
          {loading ? "Sending OTP..." : "Login"}
        </button>

        {error && (
          <div className="text-red-500 text-center mt-2">
            {error}
          </div>
        )}

        <div className="text-center mt-3">
          Don’t have an account?{" "}
          <span
            className="font-semibold text-blue-500 hover:text-blue-700 cursor-pointer"
            onClick={goToSignUp}
          >
            Sign Up
          </span>
        </div>
      </div>
    </div>
  );
}
