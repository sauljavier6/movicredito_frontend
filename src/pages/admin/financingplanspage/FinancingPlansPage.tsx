import { useEffect, useState } from "react";
import { Plus, RefreshCw, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

type Plan = {
  id: string;
  name: string;
  termMonths: number;
  annualInterestRate: number | string;
  minimumDownPaymentRatio: number | string;
  priority: number;
  active: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  description?: string | null;
};

type FormState = {
  name: string;
  termMonths: number;
  annualInterestRatePct: number;
  minimumDownPaymentPct: number;
  priority: number;
  description: string;
};

const emptyForm: FormState = {
  name: "",
  termMonths: 12,
  annualInterestRatePct: 0,
  minimumDownPaymentPct: 0,
  priority: 0,
  description: "",
};

export default function FinancingPlansPage() {
  const token = sessionStorage.getItem("movicredito_token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const response = await fetch(`${API_URL}/api/financing/plans/admin`, { headers: { Authorization: `Bearer ${token}` } });
    const body = await response.json().catch(() => []);
    if (response.ok) setPlans(Array.isArray(body) ? body : []);
    else setMessage(body.message || "No fue posible cargar los planes.");
  };

  useEffect(() => { void load(); }, []);

  const createPlan = async () => {
    setBusy(true);
    setMessage(null);
    const response = await fetch(`${API_URL}/api/financing/plans`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: form.name,
        termMonths: form.termMonths,
        annualInterestRate: form.annualInterestRatePct / 100,
        minimumDownPaymentRatio: form.minimumDownPaymentPct / 100,
        priority: form.priority,
        description: form.description,
        active: true,
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(body.message || "No fue posible crear el plan.");
    else {
      setMessage(`Plan ${body.name} creado.`);
      setForm(emptyForm);
      setModalOpen(false);
      await load();
    }
    setBusy(false);
  };

  const togglePlan = async (plan: Plan) => {
    const response = await fetch(`${API_URL}/api/financing/plans/${plan.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ active: !plan.active }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(body.message || "No fue posible actualizar el plan.");
    else await load();
  };

  const input = "mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30";

  return (
    <section className="min-h-screen bg-[#f5f5f7] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-black/40">Configuración comercial</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-[-0.045em]">Planes de financiamiento</h1>
            <p className="mt-2 max-w-2xl text-sm text-black/45">Define plazo, tasa y enganche mínimo. Catálogo, solicitud y aprobación usan estas mismas reglas.</p>
          </div>
          <button onClick={() => void load()} className="rounded-full bg-white p-3 shadow-sm ring-1 ring-black/5"><RefreshCw size={17} /></button>
        </div>

        {message && <div className="mt-6 rounded-2xl bg-white px-5 py-4 text-sm text-black/60 shadow-sm ring-1 ring-black/5">{message}</div>}

        <div className="mt-7 flex justify-end"><button onClick={()=>setModalOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white"><Plus size={16}/> Nuevo plan</button></div>
        <div className="mt-5 overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#fafafa] text-xs uppercase tracking-wide text-black/35"><tr><th className="px-6 py-4">Plan</th><th className="px-6 py-4">Plazo</th><th className="px-6 py-4">Tasa anual</th><th className="px-6 py-4">Enganche mín.</th><th className="px-6 py-4">Prioridad</th><th className="px-6 py-4">Estado</th></tr></thead><tbody className="divide-y divide-black/5">{plans.map(plan=><tr key={plan.id}><td className="px-6 py-4"><p className="font-medium">{plan.name}</p><p className="mt-1 text-xs text-black/35">{plan.description||"Sin descripción"}</p></td><td className="px-6 py-4">{plan.termMonths} meses</td><td className="px-6 py-4">{(Number(plan.annualInterestRate)*100).toFixed(2)}%</td><td className="px-6 py-4">{(Number(plan.minimumDownPaymentRatio)*100).toFixed(2)}%</td><td className="px-6 py-4">{plan.priority}</td><td className="px-6 py-4"><button onClick={()=>void togglePlan(plan)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${plan.active?"bg-black text-white":"bg-black/5 text-black/45"}`}>{plan.active?"Activo":"Inactivo"}</button></td></tr>)}{!plans.length&&<tr><td colSpan={6} className="px-6 py-12 text-center text-black/35">Todavía no hay planes configurados.</td></tr>}</tbody></table></div>
        </div>
      </div>
      {modalOpen&&<div className="fixed inset-0 z-[70] grid place-items-center bg-black/30 p-4 backdrop-blur-sm"><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[30px] bg-white p-7 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="text-2xl font-semibold">Nuevo plan</h2><p className="mt-1 text-sm text-black/45">Configura las condiciones que se ofrecerán al cliente.</p></div><button onClick={()=>setModalOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-[#f5f5f7]"><X size={17}/></button></div><div className="mt-6 space-y-4"><label className="block text-sm text-black/55">Nombre<input className={input} value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label className="block text-sm text-black/55">Plazo<select className={input} value={form.termMonths} onChange={e=>setForm({...form,termMonths:Number(e.target.value)})}><option value={6}>6 meses</option><option value={12}>12 meses</option><option value={18}>18 meses</option><option value={24}>24 meses</option></select></label><label className="block text-sm text-black/55">Tasa anual (%)<input className={input} type="number" min="0" max="200" step="0.01" value={form.annualInterestRatePct} onChange={e=>setForm({...form,annualInterestRatePct:Number(e.target.value)})}/></label><label className="block text-sm text-black/55">Enganche mínimo (%)<input className={input} type="number" min="0" max="99" step="0.01" value={form.minimumDownPaymentPct} onChange={e=>setForm({...form,minimumDownPaymentPct:Number(e.target.value)})}/></label><label className="block text-sm text-black/55">Prioridad<input className={input} type="number" min="0" value={form.priority} onChange={e=>setForm({...form,priority:Number(e.target.value)})}/></label><label className="block text-sm text-black/55">Descripción<textarea className={`${input} min-h-24`} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><div className="flex justify-end gap-3 pt-2"><button onClick={()=>setModalOpen(false)} className="rounded-full px-5 py-3 text-sm text-black/50">Cancelar</button><button disabled={busy||!form.name.trim()} onClick={()=>void createPlan()} className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-40">{busy?"Guardando…":"Crear plan"}</button></div></div></div></div>}
    </section>
  );
}
