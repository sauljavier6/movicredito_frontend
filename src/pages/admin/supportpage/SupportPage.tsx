import { useEffect, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { useAutoRefresh } from "../../../hooks/useAutoRefresh";
const API_URL=import.meta.env.VITE_API_URL||"";
type Customer={id:string;customerNumber:string;fullName:string;email:string;phone:string};
type Ticket={id:string;subject:string;category:string;status:string;priority:string;lastMessageAt?:string;createdAt:string;unread:number;customer:Customer|null};
type Msg={id:string;senderType:"customer"|"admin";message:string;createdAt:string};
export default function SupportPage(){
 const token=sessionStorage.getItem("movicredito_token");const headers={Authorization:`Bearer ${token}`};const json={...headers,"Content-Type":"application/json"};
 const [tickets,setTickets]=useState<Ticket[]>([]),[selected,setSelected]=useState<Ticket|null>(null),[messages,setMessages]=useState<Msg[]>([]),[reply,setReply]=useState(""),[busy,setBusy]=useState(false);
 const load=async()=>{const r=await fetch(`${API_URL}/api/support`,{headers});if(r.ok){const b=await r.json();setTickets(b.items||[]);}};
 const open=async(t:Ticket)=>{setSelected(t);const r=await fetch(`${API_URL}/api/support/${t.id}/messages`,{headers});if(r.ok){const b=await r.json();setMessages(b.messages||[]);}await load();};
 const send=async()=>{if(!selected||!reply.trim())return;const text=reply.trim();const optimistic:Msg={id:`local-${Date.now()}`,senderType:"admin",message:text,createdAt:new Date().toISOString()};setReply("");setMessages(current=>[...current,optimistic]);setBusy(true);const r=await fetch(`${API_URL}/api/support/${selected.id}/messages`,{method:"POST",headers:json,body:JSON.stringify({message:text})});setBusy(false);if(r.ok){await open(selected);}else{setMessages(current=>current.filter(m=>m.id!==optimistic.id));setReply(text);}};
 const status=async(value:string)=>{if(!selected)return;await fetch(`${API_URL}/api/support/${selected.id}`,{method:"PATCH",headers:json,body:JSON.stringify({status:value})});setSelected({...selected,status:value});await load();};
 useEffect(()=>{void load();},[]);
 useAutoRefresh(async()=>{await load();if(selected){const r=await fetch(`${API_URL}/api/support/${selected.id}/messages`,{headers});if(r.ok){const b=await r.json();setMessages(b.messages||[]);}}},3000);
 return <section className="min-h-screen px-4 py-8 md:px-8"><div className="mx-auto max-w-7xl">
  <div><p className="text-sm text-slate-500">Atención al cliente</p><h1 className="mt-1 text-4xl font-semibold tracking-[-0.045em]">Centro de soporte</h1><p className="mt-2 text-sm text-slate-600">Consultas y mensajes enviados desde la app de MoviCrédito.</p></div>
  <div className="mt-7 grid min-h-[650px] overflow-hidden rounded-[28px] bg-white shadow-sm lg:grid-cols-[380px_1fr]">
   <aside className="border-r border-blue-100">{tickets.length===0?<div className="p-8 text-sm text-slate-500">No hay solicitudes de soporte.</div>:tickets.map(t=><button key={t.id} onClick={()=>void open(t)} className={`block w-full border-b border-blue-50 p-5 text-left hover:bg-blue-50 ${selected?.id===t.id?"bg-blue-50":""}`}><div className="flex items-center gap-2"><p className="flex-1 truncate font-semibold">{t.subject}</p>{t.unread>0&&<span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">{t.unread}</span>}</div><p className="mt-1 text-xs font-medium text-blue-700">{t.customer?.customerNumber} · {t.customer?.fullName||"Cliente"}</p><p className="mt-1 text-xs text-slate-400">{t.status} · {t.category}</p></button>)}</aside>
   {!selected?<div className="grid place-items-center p-10 text-center text-slate-400"><div><MessageCircle className="mx-auto mb-3" size={42}/><p>Selecciona una conversación.</p></div></div>:<div className="flex min-h-[650px] flex-col">
    <div className="border-b border-blue-100 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">{selected.subject}</h2><p className="text-sm text-slate-500">Cliente {selected.customer?.customerNumber} · {selected.customer?.fullName}</p></div><select value={selected.status} onChange={e=>void status(e.target.value)} className="rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm"><option value="open">Abierto</option><option value="in_progress">En atención</option><option value="resolved">Resuelto</option><option value="closed">Cerrado</option></select></div></div>
    <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-5">{messages.map(m=><div key={m.id} className={`flex ${m.senderType==="admin"?"justify-end":"justify-start"}`}><div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${m.senderType==="admin"?"bg-blue-600 text-white":"bg-white text-slate-800 shadow-sm"}`}><p>{m.message}</p><p className={`mt-1 text-[10px] ${m.senderType==="admin"?"text-white/60":"text-slate-400"}`}>{new Date(m.createdAt).toLocaleString("es-MX")}</p></div></div>)}</div>
    <div className="border-t border-blue-100 p-4"><div className="flex gap-2"><textarea value={reply} onChange={e=>setReply(e.target.value)} rows={2} placeholder="Responder al cliente..." className="flex-1 resize-none rounded-2xl border border-blue-100 p-3 text-sm"/><button disabled={busy||!reply.trim()} onClick={()=>void send()} className="self-end rounded-full bg-blue-600 p-3 text-white disabled:opacity-40"><Send size={18}/></button></div></div>
   </div>}
  </div>
 </div></section>;
}
