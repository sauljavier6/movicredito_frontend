import { useState } from "react";
import { FaBell, FaLock, FaUnlock, FaEdit, FaTrash, FaSearch } from "react-icons/fa";

interface Credito {
  id: number;
  cliente: string;
  equipo: string;
  monto: number;
  mensualidad: number;
  estado: "Activo" | "Moroso" | "Pagado";
  bloqueado: boolean;
}

export default function FinancedComponent() {
  const [creditos, setCreditos] = useState<Credito[]>([
    { id: 1, cliente: "Juan Pérez", equipo: "iPhone 15", monto: 25000, mensualidad: 2000, estado: "Activo", bloqueado: false },
    { id: 2, cliente: "María López", equipo: "Galaxy S23", monto: 18000, mensualidad: 1500, estado: "Moroso", bloqueado: true },
    { id: 3, cliente: "Carlos Ramírez", equipo: "Xiaomi 13", monto: 12000, mensualidad: 1000, estado: "Pagado", bloqueado: false },
  ]);

  const [search, setSearch] = useState("");

  const enviarAlerta = (id: number) => {
    alert(`Se envió alerta de pago para el crédito ${id}`);
  };

  const toggleBloqueo = (id: number) => {
    setCreditos(prev =>
      prev.map(c => (c.id === id ? { ...c, bloqueado: !c.bloqueado } : c))
    );
  };

  const filteredCreditos = creditos.filter(c =>
    c.cliente.toLowerCase().includes(search.toLowerCase()) ||
    c.equipo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6 text-green-400">Créditos</h1>

      {/* Buscador y botón agregar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente o equipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      </div>

      {/* Tabla de créditos */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
        <table className="w-full text-left text-white min-w-max">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Equipo</th>
              <th className="px-4 py-2">Monto</th>
              <th className="px-4 py-2">Mensualidad</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Bloqueo</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCreditos.map((credito) => (
              <tr
                key={credito.id}
                className="border-b border-gray-700 hover:bg-gray-700"
              >
                <td className="px-4 py-2">{credito.cliente}</td>
                <td className="px-4 py-2">{credito.equipo}</td>
                <td className="px-4 py-2">
                  ${credito.monto.toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  ${credito.mensualidad.toLocaleString()}
                </td>
                <td
                  className={`px-4 py-2 font-semibold ${
                    credito.estado === "Activo"
                      ? "text-green-400"
                      : credito.estado === "Moroso"
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {credito.estado}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => toggleBloqueo(credito.id)}
                    className={
                      credito.bloqueado
                        ? "text-red-500 hover:text-red-700"
                        : "text-green-400 hover:text-green-600"
                    }
                  >
                    {credito.bloqueado ? <FaLock /> : <FaUnlock />}
                  </button>
                  <button
                    onClick={() => enviarAlerta(credito.id)}
                    className="text-yellow-400 hover:text-yellow-500"
                  >
                    <FaBell />
                  </button>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button className="text-green-400 hover:text-green-600">
                    <FaEdit />
                  </button>
                  <button className="text-red-500 hover:text-red-700">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
            {filteredCreditos.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-400">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
