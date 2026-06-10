export default function Admindashboard(){
    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <p className="text-3xl font-bold text-gray-800 mb-2">Dashboard admin</p>
                <p className="text-gray-500 mb-8">page ini dilindungi middleware server</p>
                <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-blue-50 text-blue-800 rounded-lg border vorder-blue-100">
                        <p className="text-xl font-semibold mb-2">total kunjungan</p>
                        <p className="text-4xl font-bold">dummy number</p>
                    </div>
                    <div className="p-6 bg-green-50 text-green-800 rounded-lg border border-green-100">
                        <p className="text-xl font-semibold mb-2">Total Produk</p>
                        <p className="text-4xl font-bold">dummy number</p>
                    </div>
                </div>
            </div>
        </div>
    )
}