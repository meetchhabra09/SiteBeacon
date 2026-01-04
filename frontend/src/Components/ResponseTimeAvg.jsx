export function ResponseTimeAvg({ avgTime }) {
    let bgColor = "bg-[#84BD00]";
    
    if (avgTime > 400) {
        bgColor = "bg-red-500";
    } else if (avgTime > 200) {
        bgColor = "bg-yellow-500";
    }
    
    return (
        <div className={`${bgColor} rounded-lg shadow-md p-6 text-white transform hover:shadow-xl transition-all duration-300`}>
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="text-4xl font-bold">{avgTime}</div>
            </div>
            <h2 className="text-lg font-semibold mb-1">Avg Response Time</h2>
            <p className="text-white/80 text-sm">Average across all beacons</p>
        </div>
    );
}
