import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CreditCard, Eye, Plus, X } from "lucide-react";
import Pagination from "../../../components/admin/shared/Pagination";

const API_URL = import.meta.env.VITE_API_URL || "";

type CreditOption = { id:string; balance:number|string; status:string; customer?:{fullName:string;email:string}; device?:{imei:string}; product?:{brand:string;model:string;storage:string} };
type PaymentDetail = { payment: Payment; credit?: {id:string;balance:number|string;status:string}; application?: {id:string;folio:string;fullName:string}; customer?: {fullName:string;email:string;phone?:string}; device?: {imei:string;serial?:string}; product?: {brand:string;model:string;storage:string}; allocations: Array<{id:string;amount:number|string;installment?:{number:number;dueDate:string;amount:number|string;paidAmount:number|string;status:string}}> };
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
  customer?: { fullName:string; email:string };
  product?: { brand:string; model:string; storage:string };
  application?: { id:string; folio:string; fullName:string };
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
  const [paymentDetail,setPaymentDetail]=useState<PaymentDetail|null>(null);
  const [detailLoading,setDetailLoading]=useState(false);
  const [creditSearch,setCreditSearch]=useState("");
  const token = sessionStorage.getItem("movicredito_token");
  const [page,setPage]=useState(1); const pageSize=10;

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

  const openPayment = async (payment:Payment) => {
    if (!token) return;
    setSelectedPayment(payment); setPaymentDetail(null); setDetailLoading(true);
    try {
      const response=await fetch(`${API_URL}/api/payments/${payment.id}`,{headers:{Authorization:`Bearer ${token}`}});
      if(!response.ok) throw new Error("No fue posible consultar el detalle.");
      setPaymentDetail(await response.json());
    } catch(error){setMessage((error as Error).message);} finally {setDetailLoading(false);}
  };

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
            <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#fafafa] text-xs uppercase tracking-wide text-black/35"><tr><th className="px-6 py-4">Fecha</th><th className="px-6 py-4">Tipo</th><th className="px-6 py-4">Cliente / Equipo</th><th className="px-6 py-4">Crédito / Solicitud</th><th className="px-6 py-4">Método</th><th className="px-6 py-4">Referencia</th><th className="px-6 py-4 text-right">Monto</th><th className="px-6 py-4">Acción</th></tr></thead><tbody className="divide-y divide-black/5">{payments.slice((page-1)*pageSize,page*pageSize).map((payment) => <tr key={payment.id}><td className="px-6 py-4 text-black/55">{new Date(payment.paidAt).toLocaleString("es-MX")}</td><td className="px-6 py-4">{payment.type==="down_payment"?"Enganche":"Pago de crédito"}</td><td className="px-6 py-4"><span className="block font-medium text-black/75">{payment.customer?.fullName||payment.application?.fullName||"—"}</span><span className="mt-0.5 block text-xs text-black/40">{payment.product?`${payment.product.brand} ${payment.product.model} ${payment.product.storage}`:payment.type==="down_payment"?"Solicitud de crédito":"—"}</span></td><td className="px-6 py-4"><span className="block text-xs font-medium text-black/65">{payment.application?.folio||"Crédito activo"}</span><span className="mt-0.5 block max-w-[130px] truncate font-mono text-[10px] text-black/30" title={payment.creditId||payment.applicationId}>{payment.creditId||payment.applicationId||"—"}</span></td><td className="px-6 py-4 capitalize">{payment.method}</td><td className="px-6 py-4 text-black/45">{payment.externalReference || "—"}</td><td className="px-6 py-4 text-right font-semibold">${Number(payment.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td><td className="px-6 py-4"><button onClick={()=>void openPayment(payment)} className="inline-flex items-center gap-2 rounded-full bg-[#f5f5f7] px-3 py-2 text-xs"><Eye size={14}/> Ver</button></td></tr>)}{!payments.length && <tr><td colSpan={8} className="px-6 py-12 text-center text-black/35">No hay pagos registrados todavía.</td></tr>}</tbody></table></div><Pagination page={page} total={payments.length} pageSize={pageSize} onPageChange={setPage}/>
          </div>
      </div>
      </div>
      {selectedPayment&&<div className="fixed inset-0 z-[70] grid place-items-center bg-black/30 p-4 backdrop-blur-sm"><div className="w-full max-w-2xl rounded-[30px] bg-white p-7 shadow-2xl"><div className="flex justify-between gap-4"><div><p className="text-sm text-black/40">Movimiento financiero</p><h2 className="text-xl font-semibold">{selectedPayment.type==="down_payment"?"Enganche":"Pago de crédito"}</h2>{paymentDetail?.customer&&<p className="mt-1 text-sm text-black/45">{paymentDetail.customer.fullName}{paymentDetail.product?` · ${paymentDetail.product.brand} ${paymentDetail.product.model}`:""}</p>}</div><button onClick={()=>{setSelectedPayment(null);setPaymentDetail(null)}} className="h-9 w-9 shrink-0 rounded-full bg-[#f5f5f7] p-2"><X size={17}/></button></div>{detailLoading?<div className="py-12 text-center text-sm text-black/35">Cargando detalle…</div>:<><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Detail label="Monto" value={`$${Number(selectedPayment.amount).toLocaleString("es-MX",{minimumFractionDigits:2})}`}/><Detail label="Estado" value={selectedPayment.status}/><Detail label="Método" value={selectedPayment.method}/><Detail label="Fecha" value={new Date(selectedPayment.paidAt).toLocaleString("es-MX")}/></div>{paymentDetail?.allocations?.length>0&&<div className="mt-6"><div className="mb-3 flex items-end justify-between"><div><h3 className="font-semibold">Aplicación a cuotas</h3><p className="text-xs text-black/40">Distribución registrada para este pago.</p></div></div><div className="overflow-hidden rounded-2xl border border-black/5"><table className="w-full text-left text-sm"><thead className="bg-[#f5f5f7] text-[11px] uppercase text-black/35"><tr><th className="px-4 py-3">Cuota</th><th className="px-4 py-3">Vencimiento</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">Aplicado</th></tr></thead><tbody className="divide-y divide-black/5">{paymentDetail.allocations.map(allocation=><tr key={allocation.id}><td className="px-4 py-3 font-medium">#{allocation.installment?.number||"—"}</td><td className="px-4 py-3 text-black/55">{allocation.installment?.dueDate||"—"}</td><td className="px-4 py-3 capitalize text-black/55">{allocation.installment?.status||"—"}</td><td className="px-4 py-3 text-right font-semibold">$${Number(allocation.amount).toLocaleString("es-MX",{minimumFractionDigits:2})}</td></tr>)}</tbody></table></div></div>}<div className="mt-5 grid gap-3 sm:grid-cols-2"><Detail label="Referencia" value={selectedPayment.externalReference}/><Detail label="ID proveedor" value={selectedPayment.providerPaymentId}/></div><p className="mt-5 rounded-2xl bg-[#f5f5f7] p-4 text-xs text-black/45">Movimiento de solo lectura. Los pagos aplicados no se editan para conservar la integridad financiera y la trazabilidad.</p></>}</div></div>}
      {modalOpen&&<div className="fixed inset-0 z-[70] grid place-items-center bg-black/30 p-4 backdrop-blur-sm"><form onSubmit={submitPayment} className="w-full max-w-xl rounded-[30px] bg-white p-6 shadow-2xl sm:p-7"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-white"><CreditCard size={20}/></div><div><h2 className="text-xl font-semibold">Registrar pago</h2><p className="text-xs text-black/40">Se aplica a las cuotas más antiguas primero.</p></div></div><button type="button" onClick={()=>setModalOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-[#f5f5f7]"><X size={17}/></button></div><div className="mt-6 space-y-4"><div><label className="block text-sm font-medium text-black/60">Crédito</label><div className="relative mt-2"><input value={creditSearch} onChange={e=>{setCreditSearch(e.target.value);setCreditId("");}} placeholder="Buscar cliente, equipo o IMEI" className="h-14 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 outline-none focus:bg-white"/>{creditSearch&&!creditId&&<div className="absolute left-0 right-0 top-[62px] z-20 max-h-56 overflow-y-auto rounded-2xl border border-black/10 bg-white p-1.5 shadow-xl">{credits.filter(credit=>[credit.customer?.fullName,credit.customer?.email,credit.product?.brand,credit.product?.model,credit.product?.storage,credit.device?.imei].filter(Boolean).join(" ").toLowerCase().includes(creditSearch.toLowerCase())).map(credit=><button type="button" key={credit.id} onClick={()=>{setCreditId(credit.id);setCreditSearch(credit.customer?.fullName||credit.id)}} className="flex w-full items-start justify-between gap-3 rounded-xl px-3 py-3 text-left hover:bg-[#f5f5f7]"><span className="min-w-0"><span className="block truncate text-sm font-medium">{credit.customer?.fullName||"Cliente"}</span><span className="block truncate text-xs text-black/40">{credit.product?`${credit.product.brand} ${credit.product.model} ${credit.product.storage}`:"Crédito"}{credit.device?.imei?` · IMEI ${credit.device.imei}`:""}</span></span><span className="shrink-0 text-xs font-semibold">$${Number(credit.balance).toLocaleString("es-MX",{minimumFractionDigits:2})}</span></button>)}</div>}</div>{creditId&&(()=>{const credit=credits.find(item=>item.id===creditId);return credit?<div className="mt-2 flex items-start justify-between gap-3 rounded-2xl bg-[#f5f5f7] p-3"><div className="min-w-0 text-xs text-black/45"><span className="block truncate font-medium text-black/75">{credit.customer?.fullName}</span><span className="mt-1 block truncate">{credit.product&&<>{credit.product.brand} {credit.product.model}</>}{credit.device?.imei&&<> · IMEI {credit.device.imei}</>}</span></div><div className="shrink-0 text-right"><span className="block text-[10px] uppercase text-black/35">Saldo</span><span className="text-sm font-semibold">$${Number(credit.balance).toLocaleString("es-MX",{minimumFractionDigits:2})}</span></div></div>:null})()}<input type="hidden" value={creditId} required/></div><label className="block text-sm font-medium text-black/60">Monto<input value={amount} onChange={e=>setAmount(e.target.value)} type="number" min="0.01" step="0.01" required className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 outline-none"/></label><label className="block text-sm font-medium text-black/60">Método<select value={method} onChange={e=>setMethod(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 outline-none"><option value="cash">Efectivo</option><option value="transfer">Transferencia</option><option value="card">Tarjeta</option><option value="mercadopago">Mercado Pago</option><option value="other">Otro</option></select></label><label className="block text-sm font-medium text-black/60">Referencia externa<input value={externalReference} onChange={e=>setExternalReference(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 outline-none"/></label></div>{message&&<div className="mt-4 rounded-2xl bg-[#f5f5f7] px-4 py-3 text-sm">{message}</div>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={()=>setModalOpen(false)} className="rounded-full px-5 py-3 text-sm text-black/50">Cancelar</button><button disabled={loading} className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-50">{loading?"Procesando…":"Aplicar pago"}</button></div></form></div>}
    </section>
  );
}

function Detail({label,value}:{label:string;value?:string}){return <div className="rounded-2xl bg-[#f5f5f7] p-4"><p className="text-xs text-black/40">{label}</p><p className="mt-1 break-all text-sm font-medium capitalize">{value||"—"}</p></div>}
