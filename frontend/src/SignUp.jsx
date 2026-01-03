import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "./api";

export function SignUp() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      <div className="flex justify-center items-center h-[90vh]">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">
            Registration successful 🎉
          </div>
          <div className="text-gray-600">
            Redirecting you to login…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center h-[90vh]">
      <div className="p-8 flex flex-col justify-center w-fit shadow border border-gray-200 rounded-2xl">
        <div className="font-bold text-2xl mb-3">
          Create your new account!
        </div>

        <div className="font-semibold">Name</div>
        <input
          type="text"
          placeholder="Yaksh"
          className="w-full border border-gray-200 shadow rounded-md p-2 my-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
          onClick={handleSignup}
          className={`bg-gray-800 rounded-md w-full my-2 py-3 text-sm text-white
            ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-black"}
          `}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        {error && (
          <div className="text-red-500 text-center mt-2">
            {error}
          </div>
        )}

        <div className="text-center mt-3">
          Already have an account?{" "}
          <span
            className="font-semibold text-blue-500 hover:text-blue-700 cursor-pointer"
            onClick={goToLogin}
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
}
