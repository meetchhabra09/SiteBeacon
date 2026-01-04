import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "./api";

export function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  if (!email) return null;

  const handleVerifyOtp = async () => {
    if (loading) return;

    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post(
        "/user/verify-otp",
        {
          email,
          otp: otp.trim(),
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("name", response.data.user.name);
      localStorage.setItem("email", response.data.user.email);
      localStorage.setItem("userId", response.data.user.id);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Invalid OTP");
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="font-bold text-3xl text-[#002855] mb-2">
              Verify OTP
            </h2>
            <p className="text-gray-600 mt-2">
              Enter the code sent to
            </p>
            <p className="font-semibold text-gray-800">{email}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-semibold text-gray-700 block mb-2 text-center">One-Time Password</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border border-gray-300 focus:border-[#0073E6] focus:ring-2 focus:ring-[#00A1E0]/20 rounded-lg px-4 py-4 outline-none transition-all text-center text-2xl tracking-widest font-mono"
                maxLength={6}
              />
            </div>

            <button
              disabled={loading}
              onClick={handleVerifyOtp}
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
                  Verifying...
                </span>
              ) : "Verify & Continue"}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}
          </div>

          <div
            className="text-center text-sm mt-6 text-[#0073E6] cursor-pointer hover:text-[#002855] font-semibold"
            onClick={() => navigate("/login")}
          >
            ← Back to login
          </div>
        </div>
      </div>
    </div>
  );
}
