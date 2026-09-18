import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { CreditCard, Plus, RefreshCw, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

type Payment = {
  id: string;
  creditId: string;
  amount: number | string;
  method: string;
  externalReference?: string;
  status: string;
  paidAt: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [creditId, setCreditId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [externalReference, setExternalReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
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

  useEffect(() => { void loadPayments(); }, []);

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
          <button onClick={() => void loadPayments()} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium shadow-sm ring-1 ring-black/5"><RefreshCw size={16} /> Actualizar</button>
        </div>

        <div className="mt-8 flex justify-end"><button onClick={()=>setModalOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white"><Plus size={16}/> Registrar pago</button></div>
        <div className="mt-5"><div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
            <div className="border-b border-black/5 px-6 py-5"><h2 className="font-semibold">Movimientos recientes</h2></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#fafafa] text-xs uppercase tracking-wide text-black/35"><tr><th className="px-6 py-4">Fecha</th><th className="px-6 py-4">Crédito</th><th className="px-6 py-4">Método</th><th className="px-6 py-4">Referencia</th><th className="px-6 py-4 text-right">Monto</th></tr></thead><tbody className="divide-y divide-black/5">{payments.map((payment) => <tr key={payment.id}><td className="px-6 py-4 text-black/55">{new Date(payment.paidAt).toLocaleString("es-MX")}</td><td className="px-6 py-4 font-mono text-xs">{payment.creditId}</td><td className="px-6 py-4 capitalize">{payment.method}</td><td className="px-6 py-4 text-black/45">{payment.externalReference || "—"}</td><td className="px-6 py-4 text-right font-semibold">${Number(payment.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td></tr>)}{!payments.length && <tr><td colSpan={5} className="px-6 py-12 text-center text-black/35">No hay pagos registrados todavía.</td></tr>}</tbody></table></div>
          </div>
      </div>
      {modalOpen&&<div className="fixed inset-0 z-[70] grid place-items-center bg-black/30 p-4 backdrop-blur-sm"><form onSubmit={submitPayment} className="w-full max-w-lg rounded-[30px] bg-white p-7 shadow-2xl"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-white"><CreditCard size={20}/></div><div><h2 className="text-xl font-semibold">Registrar pago</h2><p className="text-xs text-black/40">Se aplica a las cuotas más antiguas primero.</p></div></div><button type="button" onClick={()=>setModalOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-[#f5f5f7]"><X size={17}/></button></div><div className="mt-6 space-y-4"><label className="block text-sm font-medium text-black/60">ID del crédito<input value={creditId} onChange={e=>setCreditId(e.target.value)} required className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 outline-none"/></label><label className="block text-sm font-medium text-black/60">Monto<input value={amount} onChange={e=>setAmount(e.target.value)} type="number" min="0.01" step="0.01" required className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 outline-none"/></label><label className="block text-sm font-medium text-black/60">Método<select value={method} onChange={e=>setMethod(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 outline-none"><option value="cash">Efectivo</option><option value="transfer">Transferencia</option><option value="card">Tarjeta</option><option value="mercadopago">Mercado Pago</option><option value="other">Otro</option></select></label><label className="block text-sm font-medium text-black/60">Referencia externa<input value={externalReference} onChange={e=>setExternalReference(e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 outline-none"/></label></div>{message&&<div className="mt-4 rounded-2xl bg-[#f5f5f7] px-4 py-3 text-sm">{message}</div>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={()=>setModalOpen(false)} className="rounded-full px-5 py-3 text-sm text-black/50">Cancelar</button><button disabled={loading} className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-50">{loading?"Procesando…":"Aplicar pago"}</button></div></form></div>}
    </section>
  );
}
