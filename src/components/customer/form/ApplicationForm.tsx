import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, Check, ShieldCheck, Smartphone } from "lucide-react";

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  idNumber: string;
  monthlyIncome: number;
  productId: number;
  downPayment: number;
  termMonths: number;
  agreeBlocking: boolean;
};

const products = [
  { id: 1, name: "Samsung Galaxy A55", price: 8999 },
  { id: 2, name: "Samsung Galaxy S24", price: 17999 },
  { id: 3, name: "iPhone 15", price: 18999 },
];

export default function ApplicationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch("/api/credit-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("No pudimos enviar tu solicitud.");
      const body = await response.json();
      setMessage(`Solicitud recibida. Folio ${body.folio ?? body.id ?? "generado"}.`);
      reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ocurrió un error inesperado.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-[15px] text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-950/5";
  const labelClass = "text-sm font-medium text-slate-700";

  return (
    <div className="min-h-screen bg-[#f5f5f7] px-4 py-12 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-3xl">
          <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-black/5">Solicitud MoviCrédito</span>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-6xl">Tu próximo celular, a tu ritmo.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Completa tus datos para iniciar la evaluación. Antes de contratar conocerás las condiciones, calendario de pagos y políticas aplicables a tu equipo.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-10">
            <div className="mb-9 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white"><Smartphone size={20} /></div>
              <div><h2 className="text-xl font-semibold text-slate-950">Datos de tu solicitud</h2><p className="text-sm text-slate-500">Información personal y financiera básica.</p></div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className={labelClass}>Nombre completo<input {...register("fullName", { required: true })} className={inputClass} placeholder="Nombre y apellidos" />{errors.fullName && <span className="mt-1 block text-xs text-red-600">Campo requerido</span>}</label>
              <label className={labelClass}>Correo electrónico<input {...register("email", { required: true })} type="email" className={inputClass} placeholder="correo@ejemplo.com" /></label>
              <label className={labelClass}>Teléfono<input {...register("phone", { required: true })} className={inputClass} placeholder="10 dígitos" /></label>
              <label className={labelClass}>Identificación<input {...register("idNumber", { required: true })} className={inputClass} placeholder="CURP, RFC o identificación" /></label>
              <label className={`${labelClass} sm:col-span-2`}>Dirección<input {...register("address", { required: true })} className={inputClass} placeholder="Calle, número, colonia, ciudad y CP" /></label>
              <label className={labelClass}>Ingreso mensual<input {...register("monthlyIncome", { required: true, valueAsNumber: true })} type="number" min="0" className={inputClass} placeholder="$0" /></label>
              <label className={labelClass}>Equipo<select {...register("productId", { valueAsNumber: true })} className={inputClass}>{products.map((p) => <option key={p.id} value={p.id}>{p.name} · ${p.price.toLocaleString("es-MX")}</option>)}</select></label>
              <label className={labelClass}>Enganche<input {...register("downPayment", { required: true, valueAsNumber: true })} type="number" min="0" className={inputClass} placeholder="$0" /></label>
              <label className={labelClass}>Plazo<select {...register("termMonths", { valueAsNumber: true })} className={inputClass}><option value={6}>6 meses</option><option value={12}>12 meses</option><option value={18}>18 meses</option><option value={24}>24 meses</option></select></label>
            </div>

            <label className="mt-8 flex cursor-pointer gap-3 rounded-2xl bg-[#f5f5f7] p-4 text-sm leading-6 text-slate-600">
              <input {...register("agreeBlocking", { required: true })} type="checkbox" className="mt-1 h-4 w-4 accent-slate-950" />
              <span>Entiendo que el equipo financiado estará sujeto a medidas de protección y que cualquier restricción por incumplimiento se aplicará únicamente conforme al contrato y las políticas aceptadas.</span>
            </label>
            {errors.agreeBlocking && <p className="mt-2 text-xs text-red-600">Debes aceptar las condiciones para continuar.</p>}

            {message && <div className="mt-6 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white">{message}</div>}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => reset()} className="rounded-full px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100">Limpiar</button>
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50">{submitting ? "Enviando…" : "Enviar solicitud"}<ArrowRight size={16} /></button>
            </div>
          </form>

          <aside className="h-fit rounded-[32px] bg-slate-950 p-7 text-white lg:sticky lg:top-28">
            <ShieldCheck size={28} />
            <h3 className="mt-5 text-2xl font-semibold tracking-tight">Proceso claro y seguro.</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">La solicitud inicia una evaluación; no representa una aprobación automática.</p>
            <div className="mt-7 space-y-4 text-sm text-slate-200">
              {["Revisión de identidad", "Evaluación de capacidad de pago", "Condiciones visibles antes de contratar", "Equipo vinculado al crédito aprobado"].map((item) => <div key={item} className="flex gap-3"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-slate-950"><Check size={12} /></span>{item}</div>)}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
