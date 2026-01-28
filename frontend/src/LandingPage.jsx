import { useNavigate } from "react-router-dom";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-[#F4F6F9] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-[#002855] mb-6 leading-tight">
                Your Website's 24/7 Guardian
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                SiteBeacon monitors your websites continuously, alerting you instantly when issues occur. Stay ahead of downtime and keep your users happy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-[#0073E6] hover:bg-[#002855] text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all text-lg"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="border-2 border-[#0073E6] text-[#0073E6] hover:bg-[#0073E6] hover:text-white px-8 py-3 rounded-lg font-semibold transition-all text-lg"
                >
                  Sign In
                </button>
              </div>
              <p className="text-gray-500 mt-6">
                ✓ No credit card required • ✓ 3-minute setup • ✓ Real-time monitoring
              </p>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-full h-96">
                <div className="absolute inset-0 bg-gradient-to-r from-[#0073E6]/10 to-[#00A1E0]/10 rounded-2xl"></div>
                <div className="absolute inset-4 bg-white rounded-xl shadow-xl p-6 border border-gray-200">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="font-semibold text-[#002855]">api.example.com</span>
                      <span className="text-[#84BD00] font-bold">● Online</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="font-semibold text-[#002855]">app.example.com</span>
                      <span className="text-[#84BD00] font-bold">● Online</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="font-semibold text-[#002855]">cdn.example.com</span>
                      <span className="text-red-600 font-bold">● Offline</span>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Average Response Time</div>
                      <div className="text-3xl font-bold text-[#0073E6]">145ms</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#002855] mb-4">
              Powerful Features for Website Monitoring
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to ensure your websites are always up and running
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-[#0073E6] rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#002855] mb-2">Real-Time Monitoring</h3>
              <p className="text-gray-600">Check website status every 10 seconds. Get instant alerts the moment something goes wrong.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-[#00A1E0] rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#002855] mb-2">Performance Analytics</h3>
              <p className="text-gray-600">Track response times and uptime statistics. Understand your website's performance at a glance.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-[#84BD00] rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 1118 14.158V11m-6 0h6m0 0h5l-1.405-1.405A2.032 2.032 0 0012 6.158V3m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#002855] mb-2">Email Alerts</h3>
              <p className="text-gray-600">Receive instant email notifications when your websites go offline. Never miss an outage.</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-[#0073E6] rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#002855] mb-2">Uptime Tracking</h3>
              <p className="text-gray-600">Monitor uptime percentage for each endpoint. Ensure SLA compliance with detailed reports.</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-[#00A1E0] rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#002855] mb-2">Easy Setup</h3>
              <p className="text-gray-600">Add beacons in seconds. No complex configuration needed. Start monitoring immediately.</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-[#84BD00] rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#002855] mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Instantly see your website status with our responsive dashboard. Updates in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-[#F4F6F9] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#002855] mb-4">
              How SiteBeacon Works
            </h2>
            <p className="text-xl text-gray-600">Get your first beacon running in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -left-4 top-0 w-8 h-8 bg-[#0073E6] text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="bg-white rounded-lg p-8 border border-gray-200 ml-4">
                <h3 className="text-2xl font-bold text-[#002855] mb-3">Sign Up</h3>
                <p className="text-gray-600 mb-4">Create your free SiteBeacon account in less than a minute. No credit card required.</p>
                <div className="flex items-center text-[#0073E6] font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  1 minute
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -left-4 top-0 w-8 h-8 bg-[#00A1E0] text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="bg-white rounded-lg p-8 border border-gray-200 ml-4">
                <h3 className="text-2xl font-bold text-[#002855] mb-3">Add Beacons</h3>
                <p className="text-gray-600 mb-4">Enter your website URLs. Customize monitoring frequency and alert preferences.</p>
                <div className="flex items-center text-[#00A1E0] font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  2 minutes
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -left-4 top-0 w-8 h-8 bg-[#84BD00] text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="bg-white rounded-lg p-8 border border-gray-200 ml-4">
                <h3 className="text-2xl font-bold text-[#002855] mb-3">Monitor & Relax</h3>
                <p className="text-gray-600 mb-4">SiteBeacon continuously monitors your sites. Receive alerts if anything goes wrong.</p>
                <div className="flex items-center text-[#84BD00] font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Forever
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#0073E6] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start Monitoring Your Websites Today
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of developers and teams trusting SiteBeacon for uptime monitoring
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="bg-white text-[#0073E6] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#002855] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#0073E6] rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">SiteBeacon</span>
              </div>
              <p className="text-blue-200">24/7 website monitoring you can trust.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">Working</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-blue-700 pt-8 text-center text-blue-200">
            <p>&copy; 2026 SiteBeacon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
