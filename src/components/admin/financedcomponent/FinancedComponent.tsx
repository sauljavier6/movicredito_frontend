import { useEffect, useMemo, useState } from "react";
import Pagination from "../shared/Pagination";
import { Eye, Pencil, Search, X } from "lucide-react";
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
  customer?:Customer|null;device?:Device|null;product?:Product|null;
};
type Customer = { id: string; fullName: string; email: string };
type Device = { id: string; productId: number; imei: string; status: string; managementStatus: string };
type Product = { id: number; brand: string; model: string; storage: string };

const money = (value: number | string) => Number(value || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

export default function FinancedComponent() {
  const token = sessionStorage.getItem("movicredito_token");
  const queryClient=useQueryClient();
  const [editing,setEditing]=useState<Credit|null>(null);
  const [statement,setStatement]=useState<any|null>(null);
  const [statementLoading,setStatementLoading]=useState(false);
  const headers = { Authorization: `Bearer ${token}` };
  const [credits, setCredits] = useState<Credit[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page,setPage]=useState(1);const [total,setTotal]=useState(0);const pageSize=10;

  const load = async () => {
    setLoading(true);setError(null);
    try{const params=new URLSearchParams({page:String(page),pageSize:String(pageSize)});if(search.trim())params.set("search",search.trim());const response=await fetch(`${API_URL}/api/credits?${params}`,{headers});const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error(body.message||"No fue posible consultar los créditos.");setCredits(body.items||[]);setTotal(body.pagination?.total||0);}
    catch(err){setError(err instanceof Error?err.message:"No fue posible consultar los créditos.");setCredits([]);}finally{setLoading(false);}
  };

  useEffect(() => { const id=setTimeout(()=>void load(),250);return()=>clearTimeout(id); }, [page,search]);
  useEffect(()=>setPage(1),[search]);

  const openStatement=async(id:string)=>{setStatementLoading(true);setError(null);try{const r=await fetch(`${API_URL}/api/credits/${id}/schedule`,{headers});const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(b.message||"No fue posible consultar el estado de cuenta.");setStatement(b);}catch(e){setError((e as Error).message);}finally{setStatementLoading(false);}};
  const save=async(e:React.FormEvent)=>{e.preventDefault();if(!editing)return;const r=await fetch(`${API_URL}/api/credits/${editing.id}`,{method:"PATCH",headers:{...headers,"Content-Type":"application/json"},body:JSON.stringify({status:editing.status,startDate:editing.startDate})});const b=await r.json().catch(()=>({}));if(!r.ok){setError(b.message||"No fue posible actualizar el crédito.");return;}setEditing(null);await queryClient.invalidateQueries({queryKey:["dashboard"]});await load();};
  const rows = useMemo(() => credits.map((credit) => ({...credit,customerName:credit.customer?.fullName||`Cliente ${credit.customerId.slice(0,8)}`,customerEmail:credit.customer?.email||"",deviceName:credit.product?`${credit.product.brand} ${credit.product.model} ${credit.product.storage}`:"Sin equipo",imei:credit.device?.imei||"",managementStatus:credit.device?.managementStatus||"—",installment:credit.termMonths>0?Number(credit.totalAmount)/credit.termMonths:0})),[credits]);



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
                {rows.map((credit) => (
                  <tr key={credit.id} className="hover:bg-black/[0.015]">
                    <td className="px-6 py-4"><p className="font-medium">{credit.customerName}</p><p className="mt-0.5 text-xs text-black/40">{credit.customerEmail || credit.customerId}</p></td>
                    <td className="px-6 py-4"><p>{credit.deviceName}</p><p className="mt-0.5 font-mono text-xs text-black/40">{credit.imei || "—"}</p></td>
                    <td className="px-6 py-4">{money(credit.principal)}</td>
                    <td className="px-6 py-4 font-medium">{money(credit.balance)}</td>
                    <td className="px-6 py-4">{money(credit.installment)}</td>
                    <td className="px-6 py-4">{credit.termMonths} meses</td>
                    <td className="px-6 py-4"><span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium text-black/60">{credit.status}</span></td>
                    <td className="px-6 py-4"><span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium text-black/60">{credit.managementStatus}</span></td><td className="px-6 py-4"><div className="flex gap-2"><button title="Ver estado de cuenta" onClick={()=>void openStatement(credit.id)} className="rounded-full bg-[#f5f5f7] p-2"><Eye size={14}/></button><button title="Editar" onClick={()=>setEditing(credits.find(x=>x.id===credit.id)||null)} className="rounded-full bg-[#f5f5f7] p-2"><Pencil size={14}/></button></div></td>
                  </tr>
                ))}
                {!loading && rows.length === 0 && <tr><td colSpan={9} className="px-6 py-14 text-center text-black/35">No hay créditos para mostrar.</td></tr>}
                {loading && <tr><td colSpan={8} className="px-6 py-14 text-center text-black/35">Consultando créditos…</td></tr>}
              </tbody>
            </table>
          </div><Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage}/>
        </div>
      </div>
      {(statementLoading||statement)&&<div className="fixed inset-0 z-[75] flex justify-end bg-black/30 backdrop-blur-sm"><div className="h-full w-full max-w-4xl overflow-y-auto bg-[#f5f5f7] p-5 shadow-2xl sm:p-8">{statementLoading?<div className="grid h-full place-items-center text-sm text-black/40">Consultando estado de cuenta…</div>:statement&&<><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-black/40">Estado de cuenta</p><h2 className="mt-1 text-3xl font-semibold tracking-[-.04em]">{statement.customer?.fullName||"Crédito"}</h2><p className="mt-1 text-sm text-black/45">{statement.product?`${statement.product.brand} ${statement.product.model} ${statement.product.storage}`:""}{statement.device?.imei?` · IMEI ${statement.device.imei}`:""}</p></div><button onClick={()=>setStatement(null)} className="rounded-full bg-white p-3 shadow-sm"><X size={18}/></button></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Summary label="Saldo actual" value={money(statement.credit.balance)}/><Summary label="Monto total" value={money(statement.credit.totalAmount)}/><Summary label="Mensualidad" value={money(Number(statement.credit.totalAmount)/statement.credit.termMonths)}/><Summary label="Plazo" value={`${statement.credit.termMonths} meses`}/></div><div className="mt-6 overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-black/5"><div className="px-5 py-4"><h3 className="font-semibold">Plan de pagos</h3><p className="text-xs text-black/40">Calendario y avance de cada mensualidad.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-sm"><thead className="bg-[#fafafa] text-left text-[11px] uppercase text-black/35"><tr><th className="px-5 py-3">#</th><th className="px-5 py-3">Vencimiento</th><th className="px-5 py-3">Cuota</th><th className="px-5 py-3">Pagado</th><th className="px-5 py-3">Pendiente</th><th className="px-5 py-3">Estado</th></tr></thead><tbody className="divide-y divide-black/5">{statement.installments?.map((item:any)=><tr key={item.id}><td className="px-5 py-3 font-medium">{item.number}</td><td className="px-5 py-3">{item.dueDate}</td><td className="px-5 py-3">{money(item.amount)}</td><td className="px-5 py-3">{money(item.paidAmount)}</td><td className="px-5 py-3 font-medium">{money(Math.max(0,Number(item.amount)-Number(item.paidAmount)))}</td><td className="px-5 py-3"><span className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-xs capitalize">{item.status}</span></td></tr>)}</tbody></table></div></div><div className="mt-6 overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-black/5"><div className="px-5 py-4"><h3 className="font-semibold">Historial de pagos</h3><p className="text-xs text-black/40">Movimientos aplicados a este crédito.</p></div>{statement.payments?.length?<div className="divide-y divide-black/5">{statement.payments.map((p:any)=><div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><p className="text-sm font-medium">{new Date(p.paidAt).toLocaleString("es-MX")}</p><p className="text-xs text-black/40">{p.method} · {p.externalReference||"Sin referencia"}</p></div><div className="text-right"><p className="font-semibold">{money(p.amount)}</p><p className="text-xs capitalize text-black/40">{p.status}</p></div></div>)}</div>:<p className="px-5 pb-5 text-sm text-black/35">Aún no hay pagos registrados.</p>}</div></>}</div></div>}
      {editing&&<div className="fixed inset-0 z-[70] grid place-items-center bg-black/30 p-4 backdrop-blur-sm"><form onSubmit={save} className="w-full max-w-lg rounded-[30px] bg-white p-7 shadow-2xl"><div className="flex justify-between"><div><h2 className="text-xl font-semibold">Editar crédito</h2><p className="text-sm text-black/40">Solo campos operativos seguros. Los importes y calendario no se alteran manualmente.</p></div><button type="button" onClick={()=>setEditing(null)} className="rounded-full bg-[#f5f5f7] p-2"><X size={17}/></button></div><div className="mt-6 space-y-4"><label className="block text-sm">Estado<select value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 py-3"><option value="pending">Pendiente</option><option value="active">Activo</option><option value="overdue">Vencido</option><option value="paid">Pagado</option><option value="cancelled">Cancelado</option></select></label><label className="block text-sm">Fecha de inicio<input type="date" value={editing.startDate||""} onChange={e=>setEditing({...editing,startDate:e.target.value})} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 py-3"/></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={()=>setEditing(null)} className="rounded-full px-5 py-3 text-sm">Cancelar</button><button className="rounded-full bg-black px-6 py-3 text-sm text-white">Guardar cambios</button></div></form></div>}
    </section>
  );
}

function Summary({label,value}:{label:string;value:string}){return <div className="rounded-[22px] bg-white p-5 shadow-sm ring-1 ring-black/5"><p className="text-xs uppercase tracking-wide text-black/35">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></div>}
