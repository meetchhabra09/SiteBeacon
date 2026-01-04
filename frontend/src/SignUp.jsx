import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "./api";

export function SignUp() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
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
  const [success, setSuccess] = useState(false);

  const goToLogin = () => {
    navigate("/login");
  };

  const handleSignup = async () => {
    if (loading) return;

    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      await api.post("/user/signup", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center bg-[#F4F6F9]">
        <div className="text-center bg-white p-12 rounded-lg shadow-lg border border-gray-200">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#84BD00] flex items-center justify-center text-white shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[#002855] mb-2">
            Registration Successful! 🎉
          </h2>
          <p className="text-gray-600">
            Redirecting you to login…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-[#F4F6F9] py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-[#0073E6] flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="font-bold text-3xl text-[#002855] mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">Join SiteBeacon today</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-semibold text-gray-700 block mb-2">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full border border-gray-300 focus:border-[#0073E6] focus:ring-2 focus:ring-[#00A1E0]/20 rounded-lg px-4 py-3 outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
              onClick={handleSignup}
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
                  Creating Account...
                </span>
              ) : "Create Account"}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}
          </div>

          <div className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <span
              className="font-semibold text-[#0073E6] hover:text-[#002855] cursor-pointer"
              onClick={goToLogin}
            >
              Login
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
