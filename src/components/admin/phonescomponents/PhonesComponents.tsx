import { useEffect, useState } from "react";
import Pagination from "../shared/Pagination";
import type { FormEvent } from "react";
import { Pencil, Plus, RefreshCw, Search, ShieldCheck } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

type Product = {
  id: number;
  brand: string;
  model: string;
  storage: string;
  ram?: string;
  processor?: string;
  display?: string;
  battery?: string;
  camera?: string;
  price: number | string;
  imageUrl?: string;
  supportsKnoxGuard: boolean;
  active: boolean;
};

type ProductForm = {
  brand: string;
  model: string;
  storage: string;
  ram: string;
  price: string;
  imageUrl: string;
  supportsKnoxGuard: boolean;
};

const emptyForm: ProductForm = { brand: "", model: "", storage: "", ram: "", price: "", imageUrl: "", supportsKnoxGuard: false };

export default function PhonesComponents() {
  const token = sessionStorage.getItem("movicredito_token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page,setPage]=useState(1);const [total,setTotal]=useState(0);const pageSize=10;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params=new URLSearchParams({page:String(page),pageSize:String(pageSize)});if(search.trim())params.set("search",search.trim());
      const response = await fetch(`${API_URL}/api/products/admin?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const body = await response.json().catch(() => []);
      if (!response.ok) throw new Error(body?.message || "No fue posible consultar el catálogo.");
      setProducts(body.items||[]);setTotal(body.pagination?.total||0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible consultar el catálogo.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { const id=setTimeout(()=>void load(),250);return()=>clearTimeout(id); }, [page,search]);
  useEffect(()=>setPage(1),[search]);



  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const payload = { ...form, price: Number(form.price), imageUrl: form.imageUrl || null, ram: form.ram || null };
    const response = await fetch(editingId ? `${API_URL}/api/products/${editingId}` : `${API_URL}/api/products`, {
      method: editingId ? "PATCH" : "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.message || "No fue posible guardar el equipo.");
      return;
    }
    setMessage(editingId ? "Equipo actualizado." : "Equipo agregado al catálogo.");
    setEditingId(null);
    setForm(emptyForm);
    await load();
  };

  const edit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      brand: product.brand,
      model: product.model,
      storage: product.storage,
      ram: product.ram || "",
      price: String(product.price),
      imageUrl: product.imageUrl || "",
      supportsKnoxGuard: Boolean(product.supportsKnoxGuard),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleActive = async (product: Product) => {
    setError(null);
    const response = await fetch(`${API_URL}/api/products/${product.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ active: !product.active }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.message || "No fue posible cambiar el estado del equipo.");
      return;
    }
    await load();
  };

  const input = "w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 py-3 text-sm outline-none focus:bg-white";

  return (
    <section className="min-h-screen bg-[#f5f5f7] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-black/40">Productos financiables</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-[-0.045em] text-[#1d1d1f]">Catálogo de equipos</h1>
            <p className="mt-2 text-sm text-black/45">Modelos y precios comerciales. Las unidades físicas y el stock se administran en Inventario.</p>
          </div>
          <button onClick={() => void load()} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5" aria-label="Actualizar catálogo"><RefreshCw size={17} /></button>
        </div>

        <form onSubmit={submit} className="mt-8 rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-white">{editingId ? <Pencil size={18} /> : <Plus size={18} />}</div>
            <div><h2 className="font-semibold">{editingId ? "Editar equipo" : "Agregar equipo"}</h2><p className="text-sm text-black/40">Sin stock ficticio: aquí sólo se define el producto.</p></div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <input className={input} placeholder="Marca" value={form.brand} onChange={(e) => setForm((v) => ({ ...v, brand: e.target.value }))} required />
            <input className={input} placeholder="Modelo" value={form.model} onChange={(e) => setForm((v) => ({ ...v, model: e.target.value }))} required />
            <input className={input} placeholder="Almacenamiento (ej. 128 GB)" value={form.storage} onChange={(e) => setForm((v) => ({ ...v, storage: e.target.value }))} required />
            <input className={input} placeholder="RAM" value={form.ram} onChange={(e) => setForm((v) => ({ ...v, ram: e.target.value }))} />
            <input className={input} type="number" min="1" step="0.01" placeholder="Precio MXN" value={form.price} onChange={(e) => setForm((v) => ({ ...v, price: e.target.value }))} required />
            <input className={`${input} md:col-span-2`} placeholder="URL de imagen" value={form.imageUrl} onChange={(e) => setForm((v) => ({ ...v, imageUrl: e.target.value }))} />
            <label className="flex items-center gap-3 rounded-2xl bg-[#f5f5f7] px-4 py-3 text-sm"><input type="checkbox" checked={form.supportsKnoxGuard} onChange={(e) => setForm((v) => ({ ...v, supportsKnoxGuard: e.target.checked }))} /> Compatible con Knox Guard</label>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white">{editingId ? "Guardar cambios" : "Agregar al catálogo"}</button>
            {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded-full bg-[#f5f5f7] px-6 py-3 text-sm font-medium">Cancelar edición</button>}
          </div>
          {message && <p className="mt-4 text-sm text-emerald-700">{message}</p>}
          {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        </form>

        <div className="mt-8 flex max-w-xl items-center gap-2 rounded-full bg-white p-1.5 shadow-sm ring-1 ring-black/5">
          <Search size={17} className="ml-3 text-black/30" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Marca, modelo o almacenamiento" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none" />
        </div>

        <div className="mt-7 overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead className="bg-[#fafafa] text-xs uppercase tracking-wide text-black/35"><tr><th className="px-6 py-4">Equipo</th><th className="px-6 py-4">Precio</th><th className="px-6 py-4">Knox</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Acciones</th></tr></thead>
              <tbody className="divide-y divide-black/5">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-black/[0.015]">
                    <td className="px-6 py-4"><p className="font-medium">{product.brand} {product.model}</p><p className="mt-0.5 text-xs text-black/40">{product.storage}{product.ram ? ` · ${product.ram} RAM` : ""}</p></td>
                    <td className="px-6 py-4 font-medium">{Number(product.price).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</td>
                    <td className="px-6 py-4">{product.supportsKnoxGuard ? <span className="inline-flex items-center gap-1.5 text-xs font-medium"><ShieldCheck size={14} /> Compatible</span> : <span className="text-xs text-black/40">No marcado</span>}</td>
                    <td className="px-6 py-4"><span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium text-black/60">{product.active ? "Activo" : "Inactivo"}</span></td>
                    <td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => edit(product)} className="rounded-full bg-[#f5f5f7] px-4 py-2 text-xs font-medium">Editar</button><button onClick={() => void toggleActive(product)} className="rounded-full bg-[#f5f5f7] px-4 py-2 text-xs font-medium">{product.active ? "Desactivar" : "Activar"}</button></div></td>
                  </tr>
                ))}
                {!loading && products.length === 0 && <tr><td colSpan={5} className="px-6 py-14 text-center text-black/35">No hay equipos en el catálogo.</td></tr>}
                {loading && <tr><td colSpan={5} className="px-6 py-14 text-center text-black/35">Consultando catálogo…</td></tr>}
              </tbody>
            </table>
          </div><Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage}/>
        </div>
      </div>
    </section>
  );
}
