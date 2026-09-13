import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, RefreshCw, ShieldCheck, X, XCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

type Application = {
  id: string;
  folio: string;
  fullName: string;
  email: string;
  phone: string;
  productId: number;
  downPayment: number | string;
  termMonths: number;
  monthlyIncome: number | string;
  status: string;
  createdAt: string;
  curp?: string;
  rfc?: string;
  address?: string;
  postalCode?: string;
  occupation?: string;
  employer?: string;
};
type Product = { id: number; brand: string; model: string; storage: string; price: number | string };
type Device = { id: string; productId: number; imei: string; serial?: string; status: string };
type Document = { id: string; type: string; originalName: string; mimeType: string; size: number; reviewStatus: string };
type Reference = { id: string; fullName: string; phone: string; relationship?: string };
type Factor = { points: number; detail: string };
type Risk = {
  id: string;
  score: number;
  riskLevel: "low" | "medium" | "high" | "very_high";
  recommendation: "approve" | "manual_review" | "reject";
  paymentToIncomeRatio: number | string;
  downPaymentRatio: number | string;
  documentCount: number;
  referenceCount: number;
  modelVersion: string;
  factors: Record<string, Factor>;
};
type Review = { application: Application; product: Product | null; documents: Document[]; references: Reference[]; risk: Risk | null };

const riskLabels: Record<Risk["riskLevel"], string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
  very_high: "Muy alto",
};

const recommendationLabels: Record<Risk["recommendation"], string> = {
  approve: "Recomienda aprobar",
  manual_review: "Revisión manual",
  reject: "Recomienda rechazar",
};

export default function ApplicationsPage() {
  const token = sessionStorage.getItem("movicredito_token");
  const authHeaders = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...authHeaders, "Content-Type": "application/json" };
  const [applications, setApplications] = useState<Application[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const [a, p, d] = await Promise.all([
      fetch(`${API_URL}/api/credit-applications`, { headers: authHeaders }),
      fetch(`${API_URL}/api/products`),
      fetch(`${API_URL}/api/devices?status=available`, { headers: authHeaders }),
    ]);
    if (a.ok) setApplications(await a.json());
    if (p.ok) setProducts(await p.json());
    if (d.ok) setDevices(await d.json());
  };

  useEffect(() => { void load(); }, []);
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const openReview = async (applicationId: string) => {
    setSelectedId(applicationId);
    setReview(null);
    setDecisionReason("");
    setMessage(null);
    const response = await fetch(`${API_URL}/api/credit-applications/${applicationId}/review`, { headers: authHeaders });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(body.message || "No fue posible cargar el expediente.");
      return;
    }
    setReview(body);
  };

  const evaluateRisk = async () => {
    if (!selectedId) return;
    setBusy(selectedId);
    setMessage(null);
    const response = await fetch(`${API_URL}/api/risk/applications/${selectedId}/evaluate`, { method: "POST", headers: authHeaders });
    const body = await response.json().catch(() => ({}));
    setBusy(null);
    if (!response.ok) {
      setMessage(body.message || "No fue posible evaluar el riesgo.");
      return;
    }
    await openReview(selectedId);
  };

  const decide = async (decision: "approve" | "reject") => {
    if (!review) return;
    if (decisionReason.trim().length < 8) {
      setMessage("Captura un motivo de decisión de al menos 8 caracteres.");
      return;
    }

    const app = review.application;
    const compatible = devices.filter((d) => d.productId === app.productId && d.status === "available");
    if (decision === "approve" && !compatible.length) {
      setMessage("No hay un equipo disponible del modelo solicitado. Regístralo primero en Inventario.");
      return;
    }

    setBusy(app.id);
    setMessage(null);
    const response = await fetch(`${API_URL}/api/credit-applications/${app.id}/${decision}`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        reason: decisionReason.trim(),
        ...(decision === "approve" ? { deviceId: compatible[0].id } : {}),
      }),
    });
    const body = await response.json().catch(() => ({}));
    setBusy(null);
    if (!response.ok) {
      setMessage(body.message || `No fue posible ${decision === "approve" ? "aprobar" : "rechazar"} la solicitud.`);
      return;
    }

    setMessage(decision === "approve"
      ? `Solicitud ${app.folio} aprobada. Crédito ${body.credit?.id || "creado"}.`
      : `Solicitud ${app.folio} rechazada.`);
    setSelectedId(null);
    setReview(null);
    setDecisionReason("");
    await load();
  };

  return (
    <section className="min-h-screen bg-[#f5f5f7] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-black/40">Originación</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-[-0.045em]">Solicitudes de crédito</h1>
            <p className="mt-2 text-sm text-black/45">Revisa KYC, riesgo y disponibilidad física antes de tomar una decisión.</p>
          </div>
          <button onClick={() => void load()} className="rounded-full bg-white p-3 shadow-sm ring-1 ring-black/5"><RefreshCw size={17} /></button>
        </div>

        {message && <div className="mt-6 rounded-2xl bg-white px-5 py-4 text-sm text-black/60 shadow-sm ring-1 ring-black/5">{message}</div>}

        <div className="mt-7 overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="bg-[#fafafa] text-xs uppercase tracking-wide text-black/35">
                <tr><th className="px-6 py-4">Folio</th><th className="px-6 py-4">Cliente</th><th className="px-6 py-4">Equipo</th><th className="px-6 py-4">Ingreso</th><th className="px-6 py-4">Enganche</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Revisión</th></tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {applications.map((app) => {
                  const product = productMap.get(app.productId);
                  const available = devices.filter((d) => d.productId === app.productId && d.status === "available").length;
                  return (
                    <tr key={app.id}>
                      <td className="px-6 py-4 font-mono text-xs">{app.folio}</td>
                      <td className="px-6 py-4"><p className="font-medium">{app.fullName}</p><p className="text-xs text-black/35">{app.email} · {app.phone}</p></td>
                      <td className="px-6 py-4"><p>{product ? `${product.brand} ${product.model}` : `Producto ${app.productId}`}</p><p className="text-xs text-black/35">Disponibles: {available}</p></td>
                      <td className="px-6 py-4">${Number(app.monthlyIncome).toLocaleString("es-MX")}</td>
                      <td className="px-6 py-4">${Number(app.downPayment).toLocaleString("es-MX")}</td>
                      <td className="px-6 py-4"><span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium capitalize text-black/60">{app.status}</span></td>
                      <td className="px-6 py-4"><button onClick={() => void openReview(app.id)} className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-medium"><ClipboardCheck size={14} /> Revisar</button></td>
                    </tr>
                  );
                })}
                {!applications.length && <tr><td colSpan={7} className="px-6 py-12 text-center text-black/35">No hay solicitudes para mostrar.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/25 backdrop-blur-sm">
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-[#f5f5f7] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/90 px-6 py-5 backdrop-blur-xl">
              <div><p className="text-xs uppercase tracking-[.14em] text-black/35">Expediente</p><h2 className="mt-1 text-xl font-semibold">{review?.application.folio || "Cargando…"}</h2></div>
              <button onClick={() => { setSelectedId(null); setReview(null); }} className="rounded-full bg-[#f5f5f7] p-2"><X size={18} /></button>
            </div>

            {!review ? <div className="p-8 text-sm text-black/40">Cargando expediente…</div> : (
              <div className="space-y-5 p-6">
                <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5">
                  <div className="flex items-start justify-between gap-4"><div><p className="text-sm text-black/40">Solicitante</p><h3 className="mt-1 text-2xl font-semibold">{review.application.fullName}</h3><p className="mt-1 text-sm text-black/45">{review.application.curp || "CURP pendiente"} · {review.application.rfc || "RFC pendiente"}</p></div><ShieldCheck className="text-black/25" /></div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 text-sm"><Info label="Domicilio" value={`${review.application.address || "—"} ${review.application.postalCode || ""}`} /><Info label="Ocupación" value={`${review.application.occupation || "—"}${review.application.employer ? ` · ${review.application.employer}` : ""}`} /><Info label="Ingreso mensual" value={`$${Number(review.application.monthlyIncome).toLocaleString("es-MX")}`} /><Info label="Plazo" value={`${review.application.termMonths} meses`} /></div>
                </div>

                <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5">
                  <div className="flex items-center justify-between gap-4"><div><p className="text-sm text-black/40">Riesgo interno</p><h3 className="mt-1 text-lg font-semibold">{review.risk ? `${review.risk.score} puntos · ${riskLabels[review.risk.riskLevel]}` : "Sin evaluar"}</h3></div><button disabled={busy === selectedId} onClick={() => void evaluateRisk()} className="rounded-full bg-black px-4 py-2 text-xs font-medium text-white disabled:opacity-40">{review.risk ? "Reevaluar" : "Evaluar riesgo"}</button></div>
                  {review.risk && <><p className="mt-3 text-sm font-medium">{recommendationLabels[review.risk.recommendation]}</p><div className="mt-5 space-y-2">{Object.entries(review.risk.factors || {}).map(([key, factor]) => <div key={key} className="flex items-center justify-between gap-4 rounded-2xl bg-[#f5f5f7] px-4 py-3 text-sm"><span className="text-black/60">{factor.detail}</span><span className={`font-semibold ${factor.points >= 0 ? "text-black" : "text-red-600"}`}>{factor.points >= 0 ? "+" : ""}{factor.points}</span></div>)}</div><p className="mt-4 text-xs leading-5 text-black/35">Puntaje interno MoviCrédito; no es BC Score, FICO ni score de una SIC.</p></>}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5"><p className="text-sm text-black/40">Documentos KYC</p><h3 className="mt-1 text-lg font-semibold">{review.documents.length} cargados</h3><div className="mt-4 space-y-2">{review.documents.map((document) => <div key={document.id} className="rounded-2xl bg-[#f5f5f7] px-4 py-3"><p className="text-sm font-medium">{document.type.replaceAll("_", " ")}</p><p className="mt-1 truncate text-xs text-black/35">{document.originalName} · {document.reviewStatus}</p></div>)}</div></div>
                  <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5"><p className="text-sm text-black/40">Referencias</p><h3 className="mt-1 text-lg font-semibold">{review.references.length} registradas</h3><div className="mt-4 space-y-2">{review.references.map((reference) => <div key={reference.id} className="rounded-2xl bg-[#f5f5f7] px-4 py-3"><p className="text-sm font-medium">{reference.fullName}</p><p className="mt-1 text-xs text-black/35">{reference.relationship || "Referencia"} · {reference.phone}</p></div>)}</div></div>
                </div>

                {review.application.status === "pending" && <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5"><p className="text-sm text-black/40">Decisión administrativa</p><h3 className="mt-1 text-lg font-semibold">Motivo obligatorio</h3><textarea value={decisionReason} onChange={(e) => setDecisionReason(e.target.value)} rows={4} placeholder="Explica brevemente la razón de la decisión…" className="mt-4 w-full resize-none rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 py-3 text-sm outline-none focus:bg-white" /><div className="mt-4 flex flex-col gap-2 sm:flex-row"><button disabled={busy === review.application.id || !review.risk} onClick={() => void decide("approve")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-35"><CheckCircle2 size={16} /> Aprobar y crear crédito</button><button disabled={busy === review.application.id} onClick={() => void decide("reject")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-medium disabled:opacity-35"><XCircle size={16} /> Rechazar</button></div>{!review.risk && <p className="mt-3 text-xs text-black/35">Evalúa el riesgo antes de habilitar la aprobación.</p>}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-[#f5f5f7] p-4"><p className="text-[10px] uppercase tracking-[.12em] text-black/35">{label}</p><p className="mt-1 text-sm font-medium text-black/70">{value}</p></div>;
}
