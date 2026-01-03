export function BeaconCount({ count }) {
    return (
        <div className="flex flex-col flex-1 min-w-[250px] py-12 pl-8 shadow-md justify-center items-start border-1 border-gray-300 rounded-xl ">
            <h1 className="text-2xl font-bold">Total Beacons</h1>
            <div className="text-gray-500">Active beacon endpoints</div>
            <div className="text-2xl font-bold">{count}</div>
        </div>
    );
}