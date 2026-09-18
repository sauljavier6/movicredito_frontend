import { useEffect, useMemo, useState } from "react";
import { Pencil, Search, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "";

type Credit = {
  id: string;
  customerId: string;
  deviceId?: string;
  principal: number | string;
  downPayment: number | string;
  annualInterestRate: number | string;
  termMonths: number;
  totalAmount: number | string;
  balance: number | string;
  startDate?: string;
  status: string;
};
type Customer = { id: string; fullName: string; email: string };
type Device = { id: string; productId: number; imei: string; status: string; managementStatus: string };
type Product = { id: number; brand: string; model: string; storage: string };

const money = (value: number | string) => Number(value || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

export default function FinancedComponent() {
  const token = sessionStorage.getItem("movicredito_token");
  const queryClient=useQueryClient();
  const [editing,setEditing]=useState<Credit|null>(null);
  const headers = { Authorization: `Bearer ${token}` };
  const [credits, setCredits] = useState<Credit[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [creditsResponse, customersResponse, devicesResponse, productsResponse] = await Promise.all([
        fetch(`${API_URL}/api/credits`, { headers }),
        fetch(`${API_URL}/api/customers`, { headers }),
        fetch(`${API_URL}/api/devices`, { headers }),
        fetch(`${API_URL}/api/products/admin`, { headers }),
      ]);
      const responses = [creditsResponse, customersResponse, devicesResponse, productsResponse];
      if (responses.some((response) => !response.ok)) {
        const failed = responses.find((response) => !response.ok)!;
        const body = await failed.json().catch(() => ({}));
        throw new Error(body.message || "No fue posible consultar los créditos.");
      }
      const [creditRows, customerRows, deviceRows, productRows] = await Promise.all(responses.map((response) => response.json()));
      setCredits(Array.isArray(creditRows) ? creditRows : []);
      setCustomers(Array.isArray(customerRows) ? customerRows : []);
      setDevices(Array.isArray(deviceRows) ? deviceRows : []);
      setProducts(Array.isArray(productRows) ? productRows : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible consultar los créditos.");
      setCredits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const save=async(e:React.FormEvent)=>{e.preventDefault();if(!editing)return;const r=await fetch(`${API_URL}/api/credits/${editing.id}`,{method:"PATCH",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({status:editing.status,startDate:editing.startDate})});const b=await r.json().catch(()=>({}));if(!r.ok){setError(b.message||"No fue posible actualizar el crédito.");return;}setEditing(null);await queryClient.invalidateQueries({queryKey:["dashboard"]});await load();};
  const rows = useMemo(() => credits.map((credit) => {
    const customer = customers.find((item) => item.id === credit.customerId);
    const device = devices.find((item) => item.id === credit.deviceId);
    const product = products.find((item) => item.id === device?.productId);
    return {
      ...credit,
      customerName: customer?.fullName || `Cliente ${credit.customerId.slice(0, 8)}`,
      customerEmail: customer?.email || "",
      deviceName: product ? `${product.brand} ${product.model} ${product.storage}` : device ? `Equipo #${device.productId}` : "Sin equipo",
      imei: device?.imei || "",
      managementStatus: device?.managementStatus || "—",
      installment: credit.termMonths > 0 ? Number(credit.totalAmount) / credit.termMonths : 0,
    };
  }), [credits, customers, devices, products]);

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return rows;
    return rows.filter((row) => [row.customerName, row.customerEmail, row.deviceName, row.imei, row.id].some((field) => field.toLowerCase().includes(value)));
  }, [rows, search]);

  return (
    <section className="min-h-screen bg-[#f5f5f7] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-black/40">Cartera real</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-[-0.045em] text-[#1d1d1f]">Créditos</h1>
            <p className="mt-2 text-sm text-black/45">Créditos activados después de contrato, enganche y asignación de dispositivo.</p>
          </div>
        </div>

        <div className="mt-7 flex max-w-xl items-center gap-2 rounded-full bg-white p-1.5 shadow-sm ring-1 ring-black/5">
          <Search size={17} className="ml-3 text-black/30" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cliente, equipo, IMEI o crédito" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none" />
        </div>

        {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="mt-7 overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="bg-[#fafafa] text-xs uppercase tracking-wide text-black/35">
                <tr><th className="px-6 py-4">Cliente</th><th className="px-6 py-4">Equipo</th><th className="px-6 py-4">Principal</th><th className="px-6 py-4">Saldo</th><th className="px-6 py-4">Pago mensual</th><th className="px-6 py-4">Plazo</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Administración</th><th className="px-6 py-4">Acción</th></tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filtered.map((credit) => (
                  <tr key={credit.id} className="hover:bg-black/[0.015]">
                    <td className="px-6 py-4"><p className="font-medium">{credit.customerName}</p><p className="mt-0.5 text-xs text-black/40">{credit.customerEmail || credit.customerId}</p></td>
                    <td className="px-6 py-4"><p>{credit.deviceName}</p><p className="mt-0.5 font-mono text-xs text-black/40">{credit.imei || "—"}</p></td>
                    <td className="px-6 py-4">{money(credit.principal)}</td>
                    <td className="px-6 py-4 font-medium">{money(credit.balance)}</td>
                    <td className="px-6 py-4">{money(credit.installment)}</td>
                    <td className="px-6 py-4">{credit.termMonths} meses</td>
                    <td className="px-6 py-4"><span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium text-black/60">{credit.status}</span></td>
                    <td className="px-6 py-4"><span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium text-black/60">{credit.managementStatus}</span></td><td className="px-6 py-4"><button onClick={()=>setEditing(credits.find(x=>x.id===credit.id)||null)} className="rounded-full bg-[#f5f5f7] p-2"><Pencil size={14}/></button></td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 && <tr><td colSpan={9} className="px-6 py-14 text-center text-black/35">No hay créditos para mostrar.</td></tr>}
                {loading && <tr><td colSpan={8} className="px-6 py-14 text-center text-black/35">Consultando créditos…</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {editing&&<div className="fixed inset-0 z-[70] grid place-items-center bg-black/30 p-4 backdrop-blur-sm"><form onSubmit={save} className="w-full max-w-lg rounded-[30px] bg-white p-7 shadow-2xl"><div className="flex justify-between"><div><h2 className="text-xl font-semibold">Editar crédito</h2><p className="text-sm text-black/40">Solo campos operativos seguros. Los importes y calendario no se alteran manualmente.</p></div><button type="button" onClick={()=>setEditing(null)} className="rounded-full bg-[#f5f5f7] p-2"><X size={17}/></button></div><div className="mt-6 space-y-4"><label className="block text-sm">Estado<select value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 py-3"><option value="pending">Pendiente</option><option value="active">Activo</option><option value="overdue">Vencido</option><option value="paid">Pagado</option><option value="cancelled">Cancelado</option></select></label><label className="block text-sm">Fecha de inicio<input type="date" value={editing.startDate||""} onChange={e=>setEditing({...editing,startDate:e.target.value})} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 py-3"/></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={()=>setEditing(null)} className="rounded-full px-5 py-3 text-sm">Cancelar</button><button className="rounded-full bg-black px-6 py-3 text-sm text-white">Guardar cambios</button></div></form></div>}
    </section>
  );
}
