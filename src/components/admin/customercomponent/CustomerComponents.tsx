import { useEffect, useState } from "react";
import Pagination from "../shared/Pagination";
import { Pencil, Search, UserRound, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient=useQueryClient();
  const [editing,setEditing]=useState<Customer|null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page,setPage]=useState(1);const [total,setTotal]=useState(0);const pageSize=10;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params=new URLSearchParams({page:String(page),pageSize:String(pageSize)});if(search.trim())params.set("search",search.trim());
      const response = await fetch(`${API_URL}/api/customers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json().catch(() => []);
      if (!response.ok) throw new Error(body?.message || "No fue posible consultar los clientes.");
      setCustomers(body.items||[]);setTotal(body.pagination?.total||0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible consultar los clientes.");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { const id=setTimeout(()=>void load(),250);return()=>clearTimeout(id); }, [page,search]);
  useEffect(()=>setPage(1),[search]);

  const save=async(e:React.FormEvent)=>{e.preventDefault();if(!editing)return;const r=await fetch(`${API_URL}/api/customers/${editing.id}`,{method:"PATCH",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify(editing)});const b=await r.json().catch(()=>({}));if(!r.ok){setError(b.message||"No fue posible actualizar el cliente.");return;}setEditing(null);await queryClient.invalidateQueries({queryKey:["dashboard"]});await load();};


  return (
    <section className="min-h-screen bg-[#f5f5f7] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-black/40">Expedientes activos</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-[-0.045em] text-[#1d1d1f]">Clientes</h1>
            <p className="mt-2 text-sm text-black/45">Clientes creados por el flujo real de aprobación y activación de crédito.</p>
          </div>
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
                  <th className="px-6 py-4">Alta</th><th className="px-6 py-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {customers.map((customer) => (
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
                    <td className="px-6 py-4 text-black/45">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString("es-MX") : "—"}</td><td className="px-6 py-4"><button onClick={()=>setEditing({...customer})} className="rounded-full bg-[#f5f5f7] p-2"><Pencil size={14}/></button></td>
                  </tr>
                ))}
                {!loading && customers.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-14 text-center text-black/35">No hay clientes para mostrar.</td></tr>
                )}
                {loading && (
                  <tr><td colSpan={6} className="px-6 py-14 text-center text-black/35">Consultando clientes…</td></tr>
                )}
              </tbody>
            </table>
          </div><Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage}/>
        </div>
      </div>
      {editing&&<div className="fixed inset-0 z-[70] grid place-items-center bg-black/30 p-4 backdrop-blur-sm"><form onSubmit={save} className="w-full max-w-xl rounded-[30px] bg-white p-7 shadow-2xl"><div className="flex justify-between"><div><h2 className="text-xl font-semibold">Editar cliente</h2><p className="text-sm text-black/40">Actualiza los datos de contacto y expediente.</p></div><button type="button" onClick={()=>setEditing(null)} className="rounded-full bg-[#f5f5f7] p-2"><X size={17}/></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{(["fullName","email","phone","curp","rfc","address"] as const).map(k=><label key={k} className={k==="address"?"sm:col-span-2 text-sm":"text-sm"}>{({fullName:"Nombre",email:"Correo",phone:"Teléfono",curp:"CURP",rfc:"RFC",address:"Dirección"} as const)[k]}<input value={editing[k]||""} onChange={e=>setEditing({...editing,[k]:e.target.value})} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 py-3"/></label>)}<label className="text-sm">Estado<select value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 py-3"><option value="active">Activo</option><option value="inactive">Inactivo</option></select></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={()=>setEditing(null)} className="rounded-full px-5 py-3 text-sm">Cancelar</button><button className="rounded-full bg-black px-6 py-3 text-sm text-white">Guardar cambios</button></div></form></div>}
    </section>
  );
}
