import { FaUsers, FaCreditCard, FaMoneyBillWave, FaChartLine } from "react-icons/fa";

export default function HomePage() {
  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6 text-green-400">Dashboard</h1>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <FaUsers className="text-3xl text-green-400" />
            <div>
              <p className="text-gray-300 text-sm">Clientes</p>
              <p className="text-xl font-bold">1,250</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <FaCreditCard className="text-3xl text-green-400" />
            <div>
              <p className="text-gray-300 text-sm">Créditos Activos</p>
              <p className="text-xl font-bold">875</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <FaMoneyBillWave className="text-3xl text-green-400" />
            <div>
              <p className="text-gray-300 text-sm">Pagos Recientes</p>
              <p className="text-xl font-bold">$235,600</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <FaChartLine className="text-3xl text-green-400" />
            <div>
              <p className="text-gray-300 text-sm">Mora</p>
              <p className="text-xl font-bold">12%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica o contenido adicional */}
      <div className="bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-green-400 mb-4">Actividad de Créditos</h2>
        <p className="text-gray-300">Aquí puedes agregar gráficas, tablas o resúmenes de los créditos y pagos recientes.</p>
      </div>
    </div>
  );
}
