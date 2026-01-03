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

      navigate("/"); // dashboard
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-[90vh]">
      <div className="p-6 flex flex-col w-fit shadow border border-gray-200 rounded-2xl">
        <div className="font-bold text-2xl mb-2">Verify OTP</div>

        <div className="text-sm text-gray-600 mb-4">
          Enter the code sent to <span className="font-semibold">{email}</span>
        </div>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border border-gray-200 shadow rounded-md p-2 my-2 text-center tracking-widest"
        />

        {error && (
          <div className="text-red-500 text-sm text-center my-2">
            {error}
          </div>
        )}

        <button
          disabled={loading}
          onClick={handleVerifyOtp}
          className={`bg-gray-800 rounded-md w-full my-2 py-3 text-sm text-white
            ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-black"}`}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div
          className="text-center text-sm text-blue-500 cursor-pointer hover:text-blue-700 mt-2"
          onClick={() => navigate("/login")}
        >
          Back to login
        </div>
      </div>
    </div>
  );
}
