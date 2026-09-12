import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";
type Application={id:string;folio:string;fullName:string;email:string;phone:string;productId:number;downPayment:number;termMonths:number;monthlyIncome:number;status:string;createdAt:string};
type Product={id:number;brand:string;model:string;storage:string;price:number};

type Device={id:string;productId:number;imei:string;serial?:string;status:string};

export default function ApplicationsPage(){
  const token=sessionStorage.getItem("movicredito_token");
  const authHeaders={Authorization:`Bearer ${token}`};
  const jsonHeaders={...authHeaders,"Content-Type":"application/json"};
  const [applications,setApplications]=useState<Application[]>([]);
  const [products,setProducts]=useState<Product[]>([]);
  const [devices,setDevices]=useState<Device[]>([]);
  const [busy,setBusy]=useState<string|null>(null);
  const [message,setMessage]=useState<string|null>(null);

  const load=async()=>{
    const [a,p,d]=await Promise.all([
      fetch(`${API_URL}/api/credit-applications`,{headers:authHeaders}),
      fetch(`${API_URL}/api/products`),
      fetch(`${API_URL}/api/devices?status=available`,{headers:authHeaders}),
    ]);
    if(a.ok)setApplications(await a.json());
    if(p.ok)setProducts(await p.json());
    if(d.ok)setDevices(await d.json());
  };
  useEffect(()=>{void load();},[]);
  const productMap=useMemo(()=>new Map(products.map(p=>[p.id,p])),[products]);

  const approve=async(app:Application)=>{
    const compatible=devices.filter(d=>d.productId===app.productId&&d.status==='available');
    if(!compatible.length){setMessage("No hay un equipo disponible del modelo solicitado. Regístralo primero en Inventario.");return;}
    setBusy(app.id);setMessage(null);
    const response=await fetch(`${API_URL}/api/credit-applications/${app.id}/approve`,{method:"POST",headers:jsonHeaders,body:JSON.stringify({deviceId:compatible[0].id})});
    const body=await response.json().catch(()=>({}));
    if(!response.ok)setMessage(body.message||"No fue posible aprobar la solicitud.");
    else setMessage(`Solicitud ${app.folio} aprobada. Crédito ${body.credit?.id||"creado"}. IMEI ${body.device?.imei||"asignado"}.`);
    setBusy(null);await load();
  };

  const reject=async(app:Application)=>{
    setBusy(app.id);setMessage(null);
    const response=await fetch(`${API_URL}/api/credit-applications/${app.id}/reject`,{method:"POST",headers:jsonHeaders,body:JSON.stringify({reason:"Rechazo administrativo"})});
    const body=await response.json().catch(()=>({}));
    if(!response.ok)setMessage(body.message||"No fue posible rechazar la solicitud.");
    else setMessage(`Solicitud ${app.folio} rechazada.`);
    setBusy(null);await load();
  };

  return <section className="min-h-screen bg-[#f5f5f7] px-4 py-8 md:px-8"><div className="mx-auto max-w-7xl">
    <div className="flex items-end justify-between gap-4"><div><p className="text-sm text-black/40">Originación</p><h1 className="mt-1 text-4xl font-semibold tracking-[-0.045em]">Solicitudes de crédito</h1><p className="mt-2 text-sm text-black/45">Aprueba, rechaza y asigna un equipo físico disponible.</p></div><button onClick={()=>void load()} className="rounded-full bg-white p-3 shadow-sm ring-1 ring-black/5"><RefreshCw size={17}/></button></div>
    {message&&<div className="mt-6 rounded-2xl bg-white px-5 py-4 text-sm text-black/60 shadow-sm ring-1 ring-black/5">{message}</div>}
    <div className="mt-7 overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5"><div className="overflow-x-auto"><table className="w-full min-w-[1150px] text-left text-sm"><thead className="bg-[#fafafa] text-xs uppercase tracking-wide text-black/35"><tr><th className="px-6 py-4">Folio</th><th className="px-6 py-4">Cliente</th><th className="px-6 py-4">Equipo</th><th className="px-6 py-4">Ingreso</th><th className="px-6 py-4">Enganche</th><th className="px-6 py-4">Plazo</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Acciones</th></tr></thead><tbody className="divide-y divide-black/5">{applications.map(app=>{const p=productMap.get(app.productId);const available=devices.filter(d=>d.productId===app.productId&&d.status==='available').length;return <tr key={app.id}><td className="px-6 py-4 font-mono text-xs">{app.folio}</td><td className="px-6 py-4"><p className="font-medium">{app.fullName}</p><p className="text-xs text-black/35">{app.email} · {app.phone}</p></td><td className="px-6 py-4"><p>{p?`${p.brand} ${p.model}`:`Producto ${app.productId}`}</p><p className="text-xs text-black/35">Disponibles: {available}</p></td><td className="px-6 py-4">${Number(app.monthlyIncome).toLocaleString("es-MX")}</td><td className="px-6 py-4">${Number(app.downPayment).toLocaleString("es-MX")}</td><td className="px-6 py-4">{app.termMonths} meses</td><td className="px-6 py-4"><span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium capitalize text-black/60">{app.status}</span></td><td className="px-6 py-4">{app.status==='pending'?<div className="flex gap-2"><button disabled={busy===app.id} onClick={()=>void approve(app)} className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-2 text-xs font-medium text-white disabled:opacity-40"><CheckCircle2 size={14}/> Aprobar</button><button disabled={busy===app.id} onClick={()=>void reject(app)} className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-2 text-xs font-medium disabled:opacity-40"><XCircle size={14}/> Rechazar</button></div>:<span className="text-xs text-black/30">Procesada</span>}</td></tr>})}{!applications.length&&<tr><td colSpan={8} className="px-6 py-12 text-center text-black/35">No hay solicitudes para mostrar.</td></tr>}</tbody></table></div></div>
  </div></section>
}
