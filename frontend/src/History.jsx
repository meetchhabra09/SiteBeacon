import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

export function History() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [beaconName, setBeaconName] = useState("");
  const [actionType, setActionType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchHistory();
    fetchSummary();
  }, [navigate]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (beaconName) params.append("beaconName", beaconName);
      if (actionType) params.append("actionType", actionType);
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);
      params.append("page", page);
      params.append("limit", limit);

      const response = await api.get(`/history?${params.toString()}`);

      setHistory(response.data.history || []);
      setPagination(response.data.pagination || null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch history"
      );
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get("/history/summary");
      setSummary(response.data);
    } catch (err) {
      console.error("Summary fetch error:", err);
    }
  };

  const handleFilter = () => {
    setPage(1);
    fetchHistory();
  };

  const handleReset = () => {
    setBeaconName("");
    setActionType("");
    setFromDate("");
    setToDate("");
    setPage(1);
    fetchHistory();
  };

  const getActionBadge = (actionType) => {
    const badges = {
      add: "bg-green-100 text-green-800 border-green-300",
      edit: "bg-blue-100 text-blue-800 border-blue-300",
      delete: "bg-red-100 text-red-800 border-red-300",
    };
    return badges[actionType] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-[90vh] bg-[#F4F6F9] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 mb-6">
          <h1 className="text-4xl font-bold text-[#002855] mb-2">
            Beacon History
          </h1>
          <p className="text-gray-600">
            Track all changes to your beacons - additions, edits, and deletions
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md border-l-4 border-gray-400 p-6">
              <div className="text-3xl font-bold text-gray-700">
                {summary.total}
              </div>
              <div className="text-gray-600 mt-2">Total Actions</div>
            </div>
            <div className="bg-white rounded-lg shadow-md border-l-4 border-green-400 p-6">
              <div className="text-3xl font-bold text-green-700">
                {summary.add}
              </div>
              <div className="text-gray-600 mt-2">Added</div>
            </div>
            <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-400 p-6">
              <div className="text-3xl font-bold text-blue-700">
                {summary.edit}
              </div>
              <div className="text-gray-600 mt-2">Edited</div>
            </div>
            <div className="bg-white rounded-lg shadow-md border-l-4 border-red-400 p-6">
              <div className="text-3xl font-bold text-red-700">
                {summary.delete}
              </div>
              <div className="text-gray-600 mt-2">Deleted</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-[#002855] mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="font-semibold text-gray-700 block mb-2">
                Beacon Name
              </label>
              <input
                type="text"
                value={beaconName}
                onChange={(e) => setBeaconName(e.target.value)}
                placeholder="Search beacon..."
                className="w-full border border-gray-300 focus:border-[#0073E6] focus:ring-2 focus:ring-[#00A1E0]/20 rounded-lg px-3 py-2 outline-none transition-all"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-2">
                Action Type
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full border border-gray-300 focus:border-[#0073E6] focus:ring-2 focus:ring-[#00A1E0]/20 rounded-lg px-3 py-2 outline-none transition-all"
              >
                <option value="">All Actions</option>
                <option value="add">Added</option>
                <option value="edit">Edited</option>
                <option value="delete">Deleted</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-2">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border border-gray-300 focus:border-[#0073E6] focus:ring-2 focus:ring-[#00A1E0]/20 rounded-lg px-3 py-2 outline-none transition-all"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 block mb-2">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border border-gray-300 focus:border-[#0073E6] focus:ring-2 focus:ring-[#00A1E0]/20 rounded-lg px-3 py-2 outline-none transition-all"
              />
            </div>

            <div className="flex gap-2 pt-6">
              <button
                onClick={handleFilter}
                className="flex-1 bg-[#0073E6] hover:bg-[#005AB3] text-white py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Filter
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 py-3 px-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* History Table */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No history records found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Beacon Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Beacon URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Changes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date & Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record, idx) => (
                      <tr
                        key={record._id || idx}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getActionBadge(
                              record.actionType
                            )}`}
                          >
                            {record.actionType.charAt(0).toUpperCase() +
                              record.actionType.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium">
                          {record.beaconTitle}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          <a
                            href={record.beaconUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0073E6] hover:underline truncate max-w-xs block"
                          >
                            {record.beaconUrl}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {record.changedFields &&
                          Object.keys(record.changedFields).length > 0 ? (
                            <details className="cursor-pointer">
                              <summary className="font-medium text-[#0073E6]">
                                {Object.keys(record.changedFields).length} field
                                {Object.keys(record.changedFields).length > 1
                                  ? "s"
                                  : ""}{" "}
                                changed
                              </summary>
                              <div className="mt-2 bg-gray-50 p-2 rounded text-xs space-y-1">
                                {Object.entries(record.changedFields).map(
                                  ([field, values]) => (
                                    <div key={field}>
                                      <strong>{field}:</strong>{" "}
                                      <span className="text-red-600">
                                        {JSON.stringify(values.old)}
                                      </span>{" "}
                                      →{" "}
                                      <span className="text-green-600">
                                        {JSON.stringify(values.new)}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </details>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                          {formatDate(record.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages} (Total:{" "}
                    {pagination.total})
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 rounded-lg font-medium transition-all"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setPage(Math.min(pagination.pages, page + 1))
                      }
                      disabled={page === pagination.pages}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 rounded-lg font-medium transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
}
