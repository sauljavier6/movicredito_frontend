import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, Check, FileCheck2, LoaderCircle, ShieldCheck, Smartphone } from "lucide-react";
import type { CatalogProduct } from "../product/ProductCard";

type FormValues = {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  curp: string;
  rfc: string;
  address: string;
  postalCode: string;
  occupation: string;
  employer: string;
  idNumber: string;
  monthlyIncome: number;
  productId: number;
  downPayment: number;
  termMonths: number;
  reference1Name: string;
  reference1Phone: string;
  reference1Relationship: string;
  reference2Name: string;
  reference2Phone: string;
  reference2Relationship: string;
  agreeBlocking: boolean;
  agreeCreditBureau: boolean;
  agreePrivacy: boolean;
};

type KycFiles = {
  idFront?: File;
  idBack?: File;
  addressProof?: File;
  incomeProof?: File;
  selfie?: File;
};

const API_URL = import.meta.env.VITE_API_URL || "";

export default function ApplicationForm() {
  const [searchParams] = useSearchParams();
  const selectedProductId = Number(searchParams.get("productId") || 0);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [files, setFiles] = useState<KycFiles>({});
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: { termMonths: 12, downPayment: 0 },
  });

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        if (!response.ok) throw new Error("No fue posible cargar los equipos.");
        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        setProducts(list);
        const preferred = list.find((product: CatalogProduct) => product.id === selectedProductId) ?? list[0];
        if (preferred) setValue("productId", preferred.id);
      } catch {
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }
    void loadProducts();
  }, [selectedProductId, setValue]);

  const setFile = (key: keyof KycFiles, file?: File) => setFiles((current) => ({ ...current, [key]: file }));

  const onSubmit = async (data: FormValues) => {
    if (!files.idFront || !files.addressProof || !files.incomeProof) {
      setMessage("Adjunta identificación, comprobante de domicilio y comprobante de ingresos para continuar.");
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const references = [
        { fullName: data.reference1Name, phone: data.reference1Phone, relationship: data.reference1Relationship },
        { fullName: data.reference2Name, phone: data.reference2Phone, relationship: data.reference2Relationship },
      ];

      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        curp: data.curp,
        rfc: data.rfc,
        address: data.address,
        postalCode: data.postalCode,
        occupation: data.occupation,
        employer: data.employer,
        idNumber: data.idNumber,
        monthlyIncome: data.monthlyIncome,
        productId: data.productId,
        downPayment: data.downPayment,
        termMonths: data.termMonths,
        agreeBlocking: data.agreeBlocking,
        agreeCreditBureau: data.agreeCreditBureau,
        agreePrivacy: data.agreePrivacy,
        references,
      };

      const response = await fetch(`${API_URL}/api/credit-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "No pudimos enviar tu solicitud.");

      const documentData = new FormData();
      documentData.append("idFront", files.idFront);
      if (files.idBack) documentData.append("idBack", files.idBack);
      documentData.append("addressProof", files.addressProof);
      documentData.append("incomeProof", files.incomeProof);
      if (files.selfie) documentData.append("selfie", files.selfie);

      const documentResponse = await fetch(`${API_URL}/api/credit-applications/${body.id}/documents`, {
        method: "POST",
        headers: { "x-application-token": body.trackingToken },
        body: documentData,
      });
      const documentBody = await documentResponse.json().catch(() => ({}));
      if (!documentResponse.ok) throw new Error(documentBody.message || "La solicitud se creó, pero no fue posible cargar todos los documentos.");

      setMessage(`Solicitud recibida. Folio ${body.folio}. Conserva este folio para seguimiento.`);
      reset({ termMonths: 12, downPayment: 0, productId: data.productId });
      setFiles({});
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
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Completa tu expediente para iniciar la evaluación. Enviar la solicitud no significa que el crédito haya sido aprobado.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <form onSubmit={handleSubmit(onSubmit)} className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-10">
            <Section title="1. Datos personales" subtitle="Identidad y medios de contacto." />
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Nombre completo" error={!!errors.fullName}><input {...register("fullName", { required: true })} className={inputClass} /></Field>
              <Field label="Fecha de nacimiento"><input {...register("dateOfBirth", { required: true })} type="date" className={inputClass} /></Field>
              <Field label="Correo electrónico"><input {...register("email", { required: true })} type="email" className={inputClass} /></Field>
              <Field label="Teléfono"><input {...register("phone", { required: true })} inputMode="numeric" className={inputClass} placeholder="10 dígitos" /></Field>
              <Field label="CURP"><input {...register("curp", { required: true, minLength: 18, maxLength: 18 })} className={inputClass} maxLength={18} /></Field>
              <Field label="RFC"><input {...register("rfc", { required: true })} className={inputClass} maxLength={13} /></Field>
              <Field label="Folio de identificación"><input {...register("idNumber", { required: true })} className={inputClass} placeholder="Número OCR/CIC u otro folio" /></Field>
              <Field label="Código postal"><input {...register("postalCode", { required: true })} inputMode="numeric" className={inputClass} /></Field>
              <label className={`${labelClass} sm:col-span-2`}>Domicilio completo<input {...register("address", { required: true })} className={inputClass} placeholder="Calle, número, colonia, ciudad y estado" /></label>
            </div>

            <div className="my-10 border-t border-black/5" />
            <Section title="2. Ingresos y financiamiento" subtitle="Información para evaluar capacidad de pago." />
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Ocupación"><input {...register("occupation", { required: true })} className={inputClass} /></Field>
              <Field label="Empresa o actividad"><input {...register("employer", { required: true })} className={inputClass} /></Field>
              <Field label="Ingreso mensual"><input {...register("monthlyIncome", { required: true, valueAsNumber: true })} type="number" min="1" className={inputClass} /></Field>
              <label className={labelClass}>Equipo<select {...register("productId", { required: true, valueAsNumber: true })} className={inputClass} disabled={loadingProducts || products.length === 0}>{products.length === 0 && <option value="">Sin equipos disponibles</option>}{products.map((product) => <option key={product.id} value={product.id}>{product.brand} {product.model} · ${Number(product.price).toLocaleString("es-MX")}</option>)}</select>{loadingProducts && <LoaderCircle className="mt-2 animate-spin text-black/30" size={18} />}</label>
              <Field label="Enganche"><input {...register("downPayment", { required: true, valueAsNumber: true })} type="number" min="0" className={inputClass} /></Field>
              <label className={labelClass}>Plazo<select {...register("termMonths", { valueAsNumber: true })} className={inputClass}><option value={6}>6 meses</option><option value={12}>12 meses</option><option value={18}>18 meses</option><option value={24}>24 meses</option></select></label>
            </div>

            <div className="my-10 border-t border-black/5" />
            <Section title="3. Referencias" subtitle="Personas que podamos contactar para validar información del expediente." />
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Referencia 1"><input {...register("reference1Name", { required: true })} className={inputClass} placeholder="Nombre completo" /></Field>
              <Field label="Teléfono"><input {...register("reference1Phone", { required: true })} className={inputClass} /></Field>
              <Field label="Relación"><input {...register("reference1Relationship", { required: true })} className={inputClass} placeholder="Familiar, amigo, etc." /></Field>
              <div />
              <Field label="Referencia 2"><input {...register("reference2Name", { required: true })} className={inputClass} placeholder="Nombre completo" /></Field>
              <Field label="Teléfono"><input {...register("reference2Phone", { required: true })} className={inputClass} /></Field>
              <Field label="Relación"><input {...register("reference2Relationship", { required: true })} className={inputClass} /></Field>
            </div>

            <div className="my-10 border-t border-black/5" />
            <Section title="4. Documentos" subtitle="Los archivos se almacenan de forma privada y solo son accesibles para revisión autorizada." icon={<FileCheck2 size={20} />} />
            <div className="grid gap-5 sm:grid-cols-2">
              <FileField label="Identificación - frente *" onFile={(file) => setFile("idFront", file)} />
              <FileField label="Identificación - reverso" onFile={(file) => setFile("idBack", file)} />
              <FileField label="Comprobante de domicilio *" onFile={(file) => setFile("addressProof", file)} />
              <FileField label="Comprobante de ingresos *" onFile={(file) => setFile("incomeProof", file)} />
              <FileField label="Selfie" onFile={(file) => setFile("selfie", file)} />
            </div>
            <p className="mt-3 text-xs text-black/40">Formatos permitidos: JPG, PNG, WEBP o PDF. Máximo 8 MB por archivo.</p>

            <div className="my-10 border-t border-black/5" />
            <Section title="5. Autorizaciones" subtitle="Cada consentimiento se solicita por separado." />
            <div className="space-y-3">
              <Consent register={register("agreePrivacy", { required: true })}>He leído y acepto el aviso de privacidad y el tratamiento de mis datos para evaluar y administrar mi solicitud.</Consent>
              <Consent register={register("agreeCreditBureau", { required: true })}>Autorizo expresamente la consulta de mi historial crediticio ante una Sociedad de Información Crediticia, cuando MoviCrédito tenga habilitado dicho servicio y conforme a la documentación contractual aplicable.</Consent>
              <Consent register={register("agreeBlocking", { required: true })}>Entiendo que el equipo financiado podrá estar sujeto a medidas de protección o restricción por incumplimiento únicamente conforme al contrato, políticas aceptadas y proceso de cobranza autorizado.</Consent>
            </div>

            {message && <div className="mt-6 rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white">{message}</div>}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => { reset({ termMonths: 12, downPayment: 0 }); setFiles({}); }} className="rounded-full px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100">Limpiar</button>
              <button type="submit" disabled={submitting || loadingProducts || products.length === 0} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50">{submitting ? "Enviando expediente…" : "Enviar solicitud"}<ArrowRight size={16} /></button>
            </div>
          </form>

          <aside className="h-fit rounded-[32px] bg-slate-950 p-7 text-white lg:sticky lg:top-28">
            <ShieldCheck size={28} />
            <h3 className="mt-5 text-2xl font-semibold tracking-tight">Tu expediente, protegido.</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">La información se usa para evaluar la solicitud, documentar el crédito y reducir fraude.</p>
            <div className="mt-7 space-y-4 text-sm text-slate-200">{["Validación de identidad", "Capacidad de pago", "Referencias y documentación", "Consentimientos separados", "Equipo vinculado al crédito aprobado"].map((item) => <div key={item} className="flex gap-3"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-slate-950"><Check size={12} /></span>{item}</div>)}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Section({ title, subtitle, icon }: { title: string; subtitle: string; icon?: React.ReactNode }) {
  return <div className="mb-7 flex items-center gap-3">{icon ? <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white">{icon}</div> : <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white"><Smartphone size={20} /></div>}<div><h2 className="text-xl font-semibold text-slate-950">{title}</h2><p className="text-sm text-slate-500">{subtitle}</p></div></div>;
}

function Field({ label, children, error = false }: { label: string; children: React.ReactNode; error?: boolean }) {
  return <label className="text-sm font-medium text-slate-700">{label}{children}{error && <span className="mt-1 block text-xs text-red-600">Campo requerido</span>}</label>;
}

function FileField({ label, onFile }: { label: string; onFile: (file?: File) => void }) {
  return <label className="rounded-2xl border border-dashed border-black/15 bg-[#fafafa] p-4 text-sm font-medium text-slate-700">{label}<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => onFile(event.target.files?.[0])} className="mt-3 block w-full text-xs text-slate-500 file:mr-3 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-xs file:font-medium file:text-white" /></label>;
}

function Consent({ register, children }: { register: ReturnType<ReturnType<typeof useForm<FormValues>>["register"]>; children: React.ReactNode }) {
  return <label className="flex cursor-pointer gap-3 rounded-2xl bg-[#f5f5f7] p-4 text-sm leading-6 text-slate-600"><input {...register} type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-slate-950" /><span>{children}</span></label>;
}
