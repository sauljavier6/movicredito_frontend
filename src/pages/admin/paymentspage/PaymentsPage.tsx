import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CreditCard, Eye, Plus, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

type CreditOption = { id:string; balance:number|string; status:string; customer?:{fullName:string;email:string}; device?:{imei:string}; product?:{brand:string;model:string;storage:string} };
type Payment = {
  id: string;
  creditId?: string;
  applicationId?: string;
  type?: "credit_payment" | "down_payment";
  providerPaymentId?: string;
  amount: number | string;
  method: string;
  externalReference?: string;
  status: string;
  paidAt: string;
};

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [credits, setCredits] = useState<CreditOption[]>([]);
  const [creditId, setCreditId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [externalReference, setExternalReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPayment,setSelectedPayment]=useState<Payment|null>(null);
  const token = sessionStorage.getItem("movicredito_token");

  const loadPayments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/payments`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("No fue posible consultar los pagos.");
      setPayments(await response.json());
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadCredits = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/credits`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) return;
      const rows = await response.json();
      setCredits((Array.isArray(rows) ? rows : []).filter((credit:CreditOption) => ['active','overdue'].includes(credit.status)));
    } catch {}
  };
  useEffect(() => { void loadPayments(); void loadCredits(); }, []);

  const submitPayment = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ creditId, amount: Number(amount), method, externalReference: externalReference || undefined }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "No fue posible aplicar el pago.");
      setMessage(body.idempotent ? "El pago ya había sido registrado; no se duplicó." : "Pago aplicado correctamente.");
      setAmount("");
      setExternalReference("");
      setModalOpen(false);
      await loadPayments();
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#f5f5f7] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-medium text-black/40">Operación financiera</p><h1 className="mt-1 text-4xl font-semibold tracking-[-0.045em] text-[#1d1d1f]">Pagos</h1><p className="mt-2 text-sm text-black/45">Aplica pagos y revisa los movimientos recientes.</p></div>

        </div>

        <div className="mt-8 flex justify-end"><button onClick={()=>setModalOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white"><Plus size={16}/> Registrar pago</button></div>
        <div className="mt-5"><div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
            <div className="border-b border-black/5 px-6 py-5"><h2 className="font-semibold">Movimientos recientes</h2></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#fafafa] text-xs uppercase tracking-wide text-black/35"><tr><th className="px-6 py-4">Fecha</th><th className="px-6 py-4">Tipo</th><th className="px-6 py-4">Crédito / Solicitud</th><th className="px-6 py-4">Método</th><th className="px-6 py-4">Referencia</th><th className="px-6 py-4 text-right">Monto</th><th className="px-6 py-4">Acción</th></tr></thead><tbody className="divide-y divide-black/5">{payments.map((payment) => <tr key={payment.id}><td className="px-6 py-4 text-black/55">{new Date(payment.paidAt).toLocaleString("es-MX")}</td><td className="px-6 py-4">{payment.type==="down_payment"?"Enganche":"Pago de crédito"}</td><td className="px-6 py-4 font-mono text-xs">{payment.creditId||payment.applicationId||"—"}</td><td className="px-6 py-4 capitalize">{payment.method}</td><td className="px-6 py-4 text-black/45">{payment.externalReference || "—"}</td><td className="px-6 py-4 text-right font-semibold">${Number(payment.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td><td className="px-6 py-4"><button onClick={()=>setSelectedPayment(payment)} className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3 py-2 text-xs"><Eye size={14}/> Ver</button></td></tr>)}{!payments.length && <tr><td colSpan={7} className="px-6 py-12 text-center text-black/35">No hay pagos registrados todavía.</td></tr>}</tbody></table></div>
          </div>
      </div>
      </div>
      {selectedPayment&&<div className="fixed inset-0 z-[70] grid place-items-center bg-black/30 p-4 backdrop-blur-sm"><div className="w-full max-w-xl rounded-[30px] bg-white p-7 shadow-2xl"><div className="flex justify-between"><div><p className="text-sm text-black/40">Movimiento financiero</p><h2 className="text-xl font-semibold">{selectedPayment.type==="down_payment"?"Enganche":"Pago de crédito"}</h2></div><button onClick={()=>setSelectedPayment(null)} className="rounded-full bg-[#f5f5f7] p-2"><X size={17}/></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><Detail label="Monto" value={`${Number(selectedPayment.amount).toLocaleString("es-MX",{minimumFractionDigits:2})}`}/><Detail label="Estado" value={selectedPayment.status}/><Detail label="Método" value={selectedPayment.method}/><Detail label="Fecha" value={new Date(selectedPayment.paidAt).toLocaleString("es-MX")}/><Detail label="Crédito" value={selectedPayment.creditId}/><Detail label="Solicitud" value={selectedPayment.applicationId}/><Detail label="Referencia" value={selectedPayment.externalReference}/><Detail label="ID proveedor" value={selectedPayment.providerPaymentId}/></div><p className="mt-6 rounded-2xl bg-[#f5f5f7] p-4 text-xs text-black/45">Movimiento de solo lectura. Los pagos aplicados no se editan para conservar la integridad financiera y la trazabilidad.</p></div></div>}
      {modalOpen&&<div className="fixed inset-0 z-[70] grid place-items-center bg-black/30 p-4 backdrop-blur-sm"><form onSubmit={submitPayment} className="w-full max-w-lg rounded-[30px] bg-white p-7 shadow-2xl"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-white"><CreditCard size={20}/></div><div><h2 className="text-xl font-semibold">Registrar pago</h2><p className="text-xs text-black/40">Se aplica a las cuotas más antiguas primero.</p></div></div><button type="button" onClick={()=>setModalOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-[#f5f5f7]"><X size={17}/></button></div><div className="mt-6 space-y-4"><label className="block text-sm font-medium text-black/60">Crédito
<select value={creditId} onChange={e=>setCreditId(e.target.value)} required className="mt-2 h-14 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 outline-none">
<option value="">Selecciona cliente y crédito</option>
{credits.map(credit=><option key={credit.id} value={credit.id}>{credit.customer?.fullName||"Cliente"} · {credit.product?`${credit.product.brand} ${credit.product.model} ${credit.product.storage}`:"Crédito"} · Saldo ${Number(credit.balance).toLocaleString("es-MX",{minimumFractionDigits:2})}</option>)}
</select>
{creditId&&(()=>{const credit=credits.find(item=>item.id===creditId);return credit?<div className="mt-2 rounded-2xl bg-[#f5f5f7] p-3 text-xs text-black/50"><span className="font-medium text-black/70">{credit.customer?.fullName}</span>{credit.product&&<> · {credit.product.brand} {credit.product.model}</>} {credit.device?.imei&&<> · IMEI {credit.device.imei}</>}<br/>Saldo actual: <span className="font-semibold text-black">${Number(credit.balance).toLocaleString("es-MX",{minimumFractionDigits:2})}</span></div>:null})()}</label><label className="block text-sm font-medium text-black/60">Monto<input value={amount} onChange={e=>setAmount(e.target.value)} type="number" min="0.01" step="0.01" required className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 outline-none"/></label><label className="block text-sm font-medium text-black/60">Método<select value={method} onChange={e=>setMethod(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 outline-none"><option value="cash">Efectivo</option><option value="transfer">Transferencia</option><option value="card">Tarjeta</option><option value="mercadopago">Mercado Pago</option><option value="other">Otro</option></select></label><label className="block text-sm font-medium text-black/60">Referencia externa<input value={externalReference} onChange={e=>setExternalReference(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 outline-none"/></label></div>{message&&<div className="mt-4 rounded-2xl bg-[#f5f5f7] px-4 py-3 text-sm">{message}</div>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={()=>setModalOpen(false)} className="rounded-full px-5 py-3 text-sm text-black/50">Cancelar</button><button disabled={loading} className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-50">{loading?"Procesando…":"Aplicar pago"}</button></div></form></div>}
    </section>
  );
}

function Detail({label,value}:{label:string;value?:string}){return <div className="rounded-2xl bg-[#f5f5f7] p-4"><p className="text-xs text-black/40">{label}</p><p className="mt-1 break-all text-sm font-medium capitalize">{value||"—"}</p></div>}
