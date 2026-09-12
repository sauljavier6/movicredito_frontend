import { useEffect, useState } from "react";
import { Search, Smartphone } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";
type Device={id:string;productId:number;imei:string;serial?:string;color?:string;status:string;creditId?:string;customerId?:string;knoxDeviceId?:string;managementStatus:string};

export default function DevicesPage(){
  const token=sessionStorage.getItem("movicredito_token");
  const headers={Authorization:`Bearer ${token}`};
  const [devices,setDevices]=useState<Device[]>([]);
  const [query,setQuery]=useState("");
  const [error,setError]=useState<string|null>(null);

  const load=async()=>{const r=await fetch(`${API_URL}/api/devices`,{headers});if(r.ok)setDevices(await r.json());};
  useEffect(()=>{void load();},[]);
  const search=async()=>{if(!query.trim())return void load();setError(null);const r=await fetch(`${API_URL}/api/devices/lookup/${encodeURIComponent(query.trim())}`,{headers});const b=await r.json().catch(()=>({}));if(!r.ok){setError(b.message||"No encontrado");setDevices([]);return;}setDevices([b]);};

  return <section className="min-h-screen bg-[#f5f5f7] px-4 py-8 md:px-8"><div className="mx-auto max-w-7xl">
    <div><p className="text-sm text-black/40">Protección y trazabilidad</p><h1 className="mt-1 text-4xl font-semibold tracking-[-0.045em]">Dispositivos</h1><p className="mt-2 text-sm text-black/45">Consulta IMEI, crédito asociado y estado de administración Knox.</p></div>
    <div className="mt-7 flex max-w-xl gap-2 rounded-full bg-white p-1.5 shadow-sm ring-1 ring-black/5"><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')void search()}} placeholder="IMEI, serie o Knox Device ID" className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none"/><button onClick={()=>void search()} className="grid h-10 w-10 place-items-center rounded-full bg-black text-white"><Search size={16}/></button></div>
    {error&&<p className="mt-4 text-sm text-red-600">{error}</p>}
    <div className="mt-7 overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-[#fafafa] text-xs uppercase tracking-wide text-black/35"><tr><th className="px-6 py-4">IMEI</th><th className="px-6 py-4">Serie</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Administración</th><th className="px-6 py-4">Crédito</th><th className="px-6 py-4">Knox ID</th></tr></thead><tbody className="divide-y divide-black/5">{devices.map(d=><tr key={d.id}><td className="px-6 py-4 font-mono text-xs"><span className="inline-flex items-center gap-2"><Smartphone size={14}/>{d.imei}</span></td><td className="px-6 py-4">{d.serial||'—'}</td><td className="px-6 py-4"><Badge>{d.status}</Badge></td><td className="px-6 py-4"><Badge>{d.managementStatus}</Badge></td><td className="px-6 py-4 font-mono text-xs">{d.creditId||'—'}</td><td className="px-6 py-4 font-mono text-xs">{d.knoxDeviceId||'—'}</td></tr>)}{!devices.length&&<tr><td colSpan={6} className="px-6 py-12 text-center text-black/35">No hay dispositivos para mostrar.</td></tr>}</tbody></table></div></div>
  </div></section>
}
function Badge({children}:{children:string}){return <span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium text-black/60">{children}</span>}
