export function ResponseTimeMax({ maxTime }) {
    let bgColor = "bg-[#00A1E0]";
    
    if (maxTime > 400) {
        bgColor = "bg-red-600";
    } else if (maxTime > 200) {
        bgColor = "bg-orange-500";
    }
    
    return (
        <div className={`${bgColor} rounded-lg shadow-md p-6 text-white transform hover:shadow-xl transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </div>
                <div className="text-4xl font-bold">{maxTime}</div>
            </div>
            <h2 className="text-lg font-semibold mb-1">Max Response Time</h2>
            <p className="text-white/80 text-sm">Highest across all beacons</p>
        </div>
    );
}
