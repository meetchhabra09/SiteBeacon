import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PROFILE_STORAGE_KEY = "profileDetails";

const defaultProfile = {
  phone: "",
  company: "",
  role: "",
};

export function Profile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setName(localStorage.getItem("name") || "");
    setEmail(localStorage.getItem("email") || "");

    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : defaultProfile;
    setPhone(parsed.phone || "");
    setCompany(parsed.company || "");
    setRole(parsed.role || "");
  }, [navigate]);

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      setStatus("⚠️ Name and email are required");
      return;
    }

    localStorage.setItem("name", name.trim());
    localStorage.setItem("email", email.trim());

    const payload = {
      phone: phone.trim(),
      company: company.trim(),
      role: role.trim(),
    };

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload));
    setStatus("✅ Profile updated");

    setTimeout(() => setStatus(""), 2000);
  };

  return (
    <div className="min-h-[90vh] bg-[#F4F6F9] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0073E6] text-white font-bold text-2xl flex items-center justify-center shadow-md">
              {name ? name.charAt(0).toUpperCase() : "U"}
            </div>
            <h1 className="text-4xl font-bold text-[#002855] mb-2">Profile</h1>
            <p className="text-gray-600">Manage your personal information</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold text-gray-700 block mb-2">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full border border-gray-300 focus:border-[#0073E6] focus:ring-2 focus:ring-[#00A1E0]/20 rounded-lg px-4 py-3 outline-none transition-all"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-2">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-300 focus:border-[#0073E6] focus:ring-2 focus:ring-[#00A1E0]/20 rounded-lg px-4 py-3 outline-none transition-all"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                className="w-full border border-gray-300 focus:border-[#0073E6] focus:ring-2 focus:ring-[#00A1E0]/20 rounded-lg px-4 py-3 outline-none transition-all"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-2">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company name"
                className="w-full border border-gray-300 focus:border-[#0073E6] focus:ring-2 focus:ring-[#00A1E0]/20 rounded-lg px-4 py-3 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-semibold text-gray-700 block mb-2">Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. SRE Manager"
                className="w-full border border-gray-300 focus:border-[#0073E6] focus:ring-2 focus:ring-[#00A1E0]/20 rounded-lg px-4 py-3 outline-none transition-all"
              />
            </div>
          </div>

          {status && (
            <div className={`mt-6 text-center font-semibold py-3 px-4 rounded-lg ${
              status.includes("✅")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
            }`}>
              {status}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#0073E6] hover:bg-[#002855] text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Save Changes
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
