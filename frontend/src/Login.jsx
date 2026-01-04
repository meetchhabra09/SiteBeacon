import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";


export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

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
    <div className="min-h-[90vh] flex items-center justify-center bg-[#F4F6F9] py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-[#0073E6] flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="font-bold text-3xl text-[#002855] mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">Login to your account</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-semibold text-gray-700 block mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border border-gray-300 focus:border-[#0073E6] focus:ring-2 focus:ring-[#00A1E0]/20 rounded-lg px-4 py-3 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-300 focus:border-[#0073E6] focus:ring-2 focus:ring-[#00A1E0]/20 rounded-lg px-4 py-3 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              disabled={loading}
              onClick={handleLogin}
              className={`w-full py-3 rounded-lg font-semibold text-white bg-[#0073E6] shadow-md transition-all mt-6
                ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#002855] hover:shadow-lg"}
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending OTP...
                </span>
              ) : "Sign In"}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}
          </div>

          <div className="text-center mt-6 text-gray-600">
            Don't have an account?{" "}
            <span
              className="font-semibold text-[#0073E6] hover:text-[#002855] cursor-pointer"
              onClick={goToSignUp}
            >
              Sign Up
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
