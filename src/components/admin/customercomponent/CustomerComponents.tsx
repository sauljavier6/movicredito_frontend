import { useState } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  estado: string;
}

export default function CustomerComponents() {
  const [clientes, setClientes] = useState<Cliente[]>([
    { id: 1, nombre: "Juan Pérez", email: "juan@mail.com", telefono: "6461234567", estado: "Activo" },
    { id: 2, nombre: "María López", email: "maria@mail.com", telefono: "6469876543", estado: "Activo" },
    // Más clientes de ejemplo
  ]);

  const [search, setSearch] = useState("");

  const filteredClientes = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.telefono.includes(search)
  );

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6 text-green-400">Clientes</h1>

      {/* Buscador y botón agregar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cliente por nombre, email o teléfono"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold transition">
          <FaPlus /> Agregar Cliente
        </button>
      </div>

      {/* Tabla de clientes */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
        <table className="w-full text-left text-white min-w-max">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Teléfono</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClientes.map(cliente => (
              <tr key={cliente.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="px-4 py-2">{cliente.nombre}</td>
                <td className="px-4 py-2">{cliente.email}</td>
                <td className="px-4 py-2">{cliente.telefono}</td>
                <td className="px-4 py-2">{cliente.estado}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button className="text-green-400 hover:text-green-600"><FaEdit /></button>
                  <button className="text-red-500 hover:text-red-700"><FaTrash /></button>
                </td>
              </tr>
            ))}
            {filteredClientes.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-400">
                  No se encontraron clientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
