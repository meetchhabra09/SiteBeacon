export function BeaconCount({ count }) {
    return (
        <div className="bg-[#0073E6] rounded-lg shadow-md p-6 text-white transform hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div className="text-4xl font-bold">{count}</div>
            </div>
            <h2 className="text-lg font-semibold mb-1">Total Beacons</h2>
            <p className="text-blue-100 text-sm">Active beacon endpoints</p>
        </div>
    );
}
