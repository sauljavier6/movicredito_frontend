import { useState } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

interface Equipo {
  id: number;
  modelo: string;
  marca: string;
  precio: number;
  stock: number;
  estado: string;
}

export default function PhonesComponents() {
  const [equipos] = useState<Equipo[]>([ //setEquipos
    { id: 1, modelo: "iPhone 15", marca: "Apple", precio: 25000, stock: 10, estado: "Disponible" },
    { id: 2, modelo: "Galaxy S23", marca: "Samsung", precio: 18000, stock: 15, estado: "Disponible" },
    // Más equipos de ejemplo
  ]);

  const [search, setSearch] = useState("");

  const filteredEquipos = equipos.filter(e =>
    e.modelo.toLowerCase().includes(search.toLowerCase()) ||
    e.marca.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6 text-green-400">Equipos</h1>

      {/* Buscador y botón agregar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar equipo por modelo o marca"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold transition">
          <FaPlus /> Agregar Equipo
        </button>
      </div>

      {/* Tabla de equipos */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
        <table className="w-full text-left text-white min-w-max">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2">Modelo</th>
              <th className="px-4 py-2">Marca</th>
              <th className="px-4 py-2">Precio</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipos.map(equipo => (
              <tr key={equipo.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="px-4 py-2">{equipo.modelo}</td>
                <td className="px-4 py-2">{equipo.marca}</td>
                <td className="px-4 py-2">${equipo.precio.toLocaleString()}</td>
                <td className="px-4 py-2">{equipo.stock}</td>
                <td className="px-4 py-2">{equipo.estado}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button className="text-green-400 hover:text-green-600"><FaEdit /></button>
                  <button className="text-red-500 hover:text-red-700"><FaTrash /></button>
                </td>
              </tr>
            ))}
            {filteredEquipos.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-400">
                  No se encontraron equipos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
