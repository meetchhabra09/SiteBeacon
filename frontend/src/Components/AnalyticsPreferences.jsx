import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnalyticsPreferences = ({ onClose }) => {
  const [preferences, setPreferences] = useState({
    emailReports: true,
    reportFrequency: 'weekly',
    reportDay: 0,
    reportTime: '09:00'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/analytics/preferences', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.preferences) {
        setPreferences(response.data.preferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:3001/analytics/preferences', preferences, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">⚙️ Analytics Preferences</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
            {message.text}
          </div>
        )}

        {/* Email Reports Toggle */}
        <div className="mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="emailReports"
              checked={preferences.emailReports}
              onChange={handleChange}
              className="mr-3 w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-lg font-semibold text-gray-800">Enable Email Reports</span>
          </label>
          <p className="text-sm text-gray-600 mt-2">
            Receive periodic analytics reports via email
          </p>
        </div>

        {/* Report Frequency */}
        {preferences.emailReports && (
          <>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Report Frequency
              </label>
              <div className="space-y-2">
                {frequencies.map(freq => (
                  <label key={freq.value} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="reportFrequency"
                      value={freq.value}
                      checked={preferences.reportFrequency === freq.value}
                      onChange={handleChange}
                      className="mr-3 w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-700">{freq.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Report Day */}
            {preferences.reportFrequency === 'weekly' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Report Day
                </label>
                <select
                  name="reportDay"
                  value={preferences.reportDay}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {dayNames.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Report Time */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Report Time (24-hour format)
              </label>
              <input
                type="time"
                name="reportTime"
                value={preferences.reportTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-600 mt-2">
                Reports will be sent at this time in your timezone
              </p>
            </div>
          </>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>📊 Tip:</strong> Enable email reports to receive detailed analytics summaries with charts for all your beacons.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPreferences;
