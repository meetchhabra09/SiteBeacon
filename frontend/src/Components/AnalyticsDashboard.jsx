import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AnalyticsDashboard = ({ beaconId, beaconTitle, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [beaconId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/analytics/beacon/${beaconId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalytics(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setSendingEmail(true);
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3001/analytics/beacon/${beaconId}/send-email`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Analytics report sent to your email!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // Prepare chart data
  const chartData = {
    labels: analytics.dailyStats?.map(stat => {
      const date = new Date(stat._id.year, stat._id.month - 1, stat._id.day);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Uptime %',
        data: analytics.dailyStats?.map(stat =>
          stat.totalCount > 0 ? ((stat.upCount / stat.totalCount) * 100).toFixed(2) : 100
        ) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-3xl font-bold text-gray-800">📊 Analytics Dashboard</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Beacon Title */}
        <h3 className="text-xl font-semibold text-purple-600 mb-6">{beaconTitle}</h3>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Uptime */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
            <div className="text-sm text-gray-600 font-semibold mb-2">UPTIME</div>
            <div className="text-3xl font-bold text-green-600">{analytics.uptimePercentage}%</div>
            <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
          </div>

          {/* Downtime Events */}
          <div className={`bg-gradient-to-br ${analytics.downCount > 0 ? 'from-red-50 to-red-100' : 'from-green-50 to-green-100'} p-4 rounded-lg border-l-4 ${analytics.downCount > 0 ? 'border-red-500' : 'border-green-500'}`}>
            <div className="text-sm text-gray-600 font-semibold mb-2">DOWNTIME EVENTS</div>
            <div className={`text-3xl font-bold ${analytics.downCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{analytics.downCount}</div>
            <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
          </div>

          {/* Notifications */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 font-semibold mb-2">NOTIFICATIONS</div>
            <div className="text-3xl font-bold text-blue-600">{analytics.notificationCount}</div>
            <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
          </div>

          {/* Avg Response Time */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-l-4 border-purple-500">
            <div className="text-sm text-gray-600 font-semibold mb-2">AVG RESPONSE</div>
            <div className="text-3xl font-bold text-purple-600">{analytics.avgResponseTime}ms</div>
            <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
          </div>
        </div>

        {/* Chart */}
        {analytics.dailyStats && analytics.dailyStats.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">7-Day Performance Trend</h4>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

        {/* Downtime Incidents */}
        {analytics.downtimeIncidents && analytics.downtimeIncidents.length > 0 && (
          <div className="bg-red-50 p-6 rounded-lg mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Downtime Incidents</h4>
            <div className="space-y-2">
              {analytics.downtimeIncidents.slice(0, 5).map((incident, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-3 rounded border-l-4 border-red-500">
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {new Date(incident.timestamp).toLocaleString()}
                    </div>
                    {incident.errorMessage && (
                      <div className="text-xs text-gray-600">{incident.errorMessage}</div>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-red-200 text-red-800 rounded text-xs font-semibold">DOWN</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 mt-8 pt-6 border-t">
          <button
            onClick={handleSendEmail}
            disabled={sendingEmail}
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            {sendingEmail ? 'Sending...' : '📧 Email Report'}
          </button>
          <button
            onClick={fetchAnalytics}
            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            🔄 Refresh
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
