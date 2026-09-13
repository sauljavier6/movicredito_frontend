import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Search, UserRound } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

type Customer = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  curp?: string;
  rfc?: string;
  address?: string;
  status: string;
  createdAt?: string;
};

export default function CustomerComponents() {
  const token = sessionStorage.getItem("movicredito_token");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json().catch(() => []);
      if (!response.ok) throw new Error(body?.message || "No fue posible consultar los clientes.");
      setCustomers(Array.isArray(body) ? body : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible consultar los clientes.");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return customers;
    return customers.filter((customer) =>
      [customer.fullName, customer.email, customer.phone, customer.curp, customer.rfc]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value)),
    );
  }, [customers, search]);

  return (
    <section className="min-h-screen bg-[#f5f5f7] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-black/40">Expedientes activos</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-[-0.045em] text-[#1d1d1f]">Clientes</h1>
            <p className="mt-2 text-sm text-black/45">Clientes creados por el flujo real de aprobación y activación de crédito.</p>
          </div>
          <button onClick={() => void load()} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5" aria-label="Actualizar clientes">
            <RefreshCw size={17} />
          </button>
        </div>

        <div className="mt-7 flex max-w-xl items-center gap-2 rounded-full bg-white p-1.5 shadow-sm ring-1 ring-black/5">
          <Search size={17} className="ml-3 text-black/30" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nombre, correo, teléfono, CURP o RFC"
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
          />
        </div>

        {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="mt-7 overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-[#fafafa] text-xs uppercase tracking-wide text-black/35">
                <tr>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">CURP</th>
                  <th className="px-6 py-4">RFC</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Alta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-black/[0.015]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#f5f5f7] text-black/45"><UserRound size={16} /></div>
                        <div><p className="font-medium text-[#1d1d1f]">{customer.fullName}</p><p className="mt-0.5 text-xs text-black/40">{customer.email}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{customer.phone || "—"}</td>
                    <td className="px-6 py-4 font-mono text-xs">{customer.curp || "—"}</td>
                    <td className="px-6 py-4 font-mono text-xs">{customer.rfc || "—"}</td>
                    <td className="px-6 py-4"><span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium text-black/60">{customer.status}</span></td>
                    <td className="px-6 py-4 text-black/45">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("es-MX") : "—"}</td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-14 text-center text-black/35">No hay clientes para mostrar.</td></tr>
                )}
                {loading && (
                  <tr><td colSpan={6} className="px-6 py-14 text-center text-black/35">Consultando clientes…</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
