import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Boxes, Plus, RefreshCw } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

type Product = { id: number; brand: string; model: string; storage: string };
type Summary = { productId: number; brand: string; model: string; storage: string; supportsKnoxGuard: boolean; total: number; available: number; reserved: number; assigned: number; locked: number; managed: number };

export default function InventoryPage() {
  const token = sessionStorage.getItem("movicredito_token");
  const [summary, setSummary] = useState<Summary[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ productId: "", imei: "", serial: "", color: "", knoxDeviceId: "" });
  const [message, setMessage] = useState<string | null>(null);

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    const [inventoryResponse, productsResponse] = await Promise.all([
      fetch(`${API_URL}/api/devices/inventory-summary`, { headers }),
      fetch(`${API_URL}/api/products`),
    ]);
    if (inventoryResponse.ok) setSummary(await inventoryResponse.json());
    if (productsResponse.ok) setProducts(await productsResponse.json());
  };

  useEffect(() => { void load(); }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    const response = await fetch(`${API_URL}/api/devices`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...form, productId: Number(form.productId) }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return setMessage(body.message || "No fue posible registrar el equipo.");
    setMessage(`Equipo registrado: ${body.imei}`);
    setForm({ productId: "", imei: "", serial: "", color: "", knoxDeviceId: "" });
    await load();
  };

  const input = "w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 py-3 text-sm outline-none focus:bg-white";

  return <section className="min-h-screen bg-[#f5f5f7] px-4 py-8 md:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-sm text-black/40">Control físico</p><h1 className="mt-1 text-4xl font-semibold tracking-[-0.045em]">Inventario</h1><p className="mt-2 text-sm text-black/45">Cada celular se controla individualmente por IMEI.</p></div>
        <button onClick={() => void load()} className="rounded-full bg-white p-3 shadow-sm ring-1 ring-black/5"><RefreshCw size={17}/></button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summary.map(item => <div key={item.productId} className="rounded-[26px] bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="flex justify-between"><div><p className="text-xs uppercase tracking-[.12em] text-black/35">{item.brand}</p><h2 className="mt-1 text-xl font-semibold">{item.model}</h2><p className="text-sm text-black/40">{item.storage}</p></div><Boxes className="text-black/30"/></div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center"><Stat label="Disponibles" value={item.available}/><Stat label="Asignados" value={item.assigned}/><Stat label="Total" value={item.total}/></div>
          <p className="mt-4 text-xs text-black/35">Knox: {item.supportsKnoxGuard ? "Compatible" : "No marcado"} · Administrados: {item.managed}</p>
        </div>)}
      </div>

      <form onSubmit={submit} className="mt-8 rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
        <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-white"><Plus size={18}/></div><div><h2 className="font-semibold">Registrar equipo</h2><p className="text-sm text-black/40">Alta física del dispositivo recibido.</p></div></div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <select className={input} value={form.productId} onChange={e => setForm(v => ({...v, productId:e.target.value}))} required><option value="">Producto</option>{products.map(p => <option key={p.id} value={p.id}>{p.brand} {p.model} {p.storage}</option>)}</select>
          <input className={input} placeholder="IMEI" value={form.imei} onChange={e => setForm(v => ({...v, imei:e.target.value}))} required/>
          <input className={input} placeholder="Serie" value={form.serial} onChange={e => setForm(v => ({...v, serial:e.target.value}))}/>
          <input className={input} placeholder="Color" value={form.color} onChange={e => setForm(v => ({...v, color:e.target.value}))}/>
          <input className={input} placeholder="Knox Device ID (opcional)" value={form.knoxDeviceId} onChange={e => setForm(v => ({...v, knoxDeviceId:e.target.value}))}/>
        </div>
        {message && <p className="mt-4 text-sm text-black/60">{message}</p>}
        <button className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-medium text-white">Agregar a inventario</button>
      </form>
    </div>
  </section>;
}

function Stat({label,value}:{label:string;value:number}){return <div className="rounded-2xl bg-[#f5f5f7] p-3"><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-black/35">{label}</p></div>}
