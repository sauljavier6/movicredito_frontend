import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, ClipboardCheck, RefreshCw, ShieldCheck, X, XCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

type Application = {
  id: string; folio: string; fullName: string; email: string; phone: string; productId: number;
  downPayment: number | string; termMonths: number; monthlyIncome: number | string; status: string; createdAt: string;
  curp?: string; rfc?: string; address?: string; postalCode?: string; occupation?: string; employer?: string;
};
type Product = { id: number; brand: string; model: string; storage: string; price: number | string };
type Device = { id: string; productId: number; imei: string; serial?: string; status: string };
type Document = { id: string; type: string; originalName: string; mimeType: string; size: number; reviewStatus: "pending" | "accepted" | "rejected" };
type Reference = { id: string; fullName: string; phone: string; relationship?: string };
type Factor = { points: number; detail: string };
type Risk = { id: string; score: number; riskLevel: "low" | "medium" | "high" | "very_high"; recommendation: "approve" | "manual_review" | "reject"; factors: Record<string, Factor> };
type Review = { application: Application; product: Product | null; documents: Document[]; references: Reference[]; risk: Risk | null };
type Fulfillment = {
  id: string; applicationId: string; deviceId?: string;
  status: "contract_pending" | "down_payment_pending" | "device_pending" | "ready_for_activation" | "active" | "cancelled";
  contractStatus: "pending" | "signed"; downPaymentStatus: "pending" | "paid";
  financingSnapshot: Record<string, unknown>;
};

const riskLabels = { low: "Bajo", medium: "Medio", high: "Alto", very_high: "Muy alto" } as const;
const recommendationLabels = { approve: "Recomienda aprobar", manual_review: "Revisión manual", reject: "Recomienda rechazar" } as const;
const fulfillmentLabels: Record<Fulfillment["status"], string> = {
  contract_pending: "Contrato pendiente", down_payment_pending: "Enganche pendiente", device_pending: "IMEI pendiente",
  ready_for_activation: "Listo para activar", active: "Crédito activo", cancelled: "Cancelado",
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
  const [fulfillment, setFulfillment] = useState<Fulfillment | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [decisionReason, setDecisionReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const [a, p, d] = await Promise.all([
      fetch(`${API_URL}/api/credit-applications`, { headers: authHeaders }),
      fetch(`${API_URL}/api/products`),
      fetch(`${API_URL}/api/devices`, { headers: authHeaders }),
    ]);
    if (a.ok) setApplications(await a.json());
    if (p.ok) setProducts(await p.json());
    if (d.ok) setDevices(await d.json());
  };

  useEffect(() => { void load(); }, []);
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const loadFulfillment = async (applicationId: string) => {
    const response = await fetch(`${API_URL}/api/credit-applications/${applicationId}/fulfillment`, { headers: authHeaders });
    if (response.ok) {
      const body = await response.json();
      setFulfillment(body);
      setSelectedDeviceId(body.deviceId || "");
    } else {
      setFulfillment(null);
    }
  };

  const openReview = async (applicationId: string) => {
    setSelectedId(applicationId); setReview(null); setFulfillment(null); setDecisionReason(""); setMessage(null);
    const response = await fetch(`${API_URL}/api/credit-applications/${applicationId}/review`, { headers: authHeaders });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setMessage(body.message || "No fue posible cargar el expediente."); return; }
    setReview(body);
    if (body.application?.status === "approved") await loadFulfillment(applicationId);
  };

  const evaluateRisk = async () => {
    if (!selectedId) return;
    setBusy("risk"); setMessage(null);
    const response = await fetch(`${API_URL}/api/risk/applications/${selectedId}/evaluate`, { method: "POST", headers: authHeaders });
    const body = await response.json().catch(() => ({})); setBusy(null);
    if (!response.ok) { setMessage(body.message || "No fue posible evaluar el riesgo."); return; }
    await openReview(selectedId);
  };

  const reviewDocument = async (document: Document, reviewStatus: "accepted" | "rejected") => {
    if (!selectedId) return;
    const reason = reviewStatus === "rejected" ? window.prompt("Motivo de rechazo del documento:")?.trim() || "" : "";
    if (reviewStatus === "rejected" && reason.length < 4) return;
    setBusy(document.id);
    const response = await fetch(`${API_URL}/api/credit-applications/${selectedId}/documents/${document.id}/review`, {
      method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ reviewStatus, reason }),
    });
    const body = await response.json().catch(() => ({})); setBusy(null);
    if (!response.ok) { setMessage(body.message || "No fue posible revisar el documento."); return; }
    await openReview(selectedId);
  };

  const decide = async (decision: "approve" | "reject") => {
    if (!review) return;
    if (decisionReason.trim().length < 8) { setMessage("Captura un motivo de decisión de al menos 8 caracteres."); return; }
    setBusy(decision); setMessage(null);
    const response = await fetch(`${API_URL}/api/credit-applications/${review.application.id}/${decision}`, {
      method: "POST", headers: jsonHeaders, body: JSON.stringify({ reason: decisionReason.trim() }),
    });
    const body = await response.json().catch(() => ({})); setBusy(null);
    if (!response.ok) { setMessage(body.message || "No fue posible procesar la decisión."); return; }
    setMessage(decision === "approve" ? `Solicitud ${review.application.folio} aprobada. Sigue contrato, enganche e IMEI antes de activar.` : `Solicitud ${review.application.folio} rechazada.`);
    await load(); await openReview(review.application.id);
  };

  const fulfillmentAction = async (path: string, body?: Record<string, unknown>) => {
    if (!review) return;
    setBusy(path); setMessage(null);
    const response = await fetch(`${API_URL}/api/credit-applications/${review.application.id}/${path}`, {
      method: "POST", headers: jsonHeaders, body: body ? JSON.stringify(body) : undefined,
    });
    const result = await response.json().catch(() => ({})); setBusy(null);
    if (!response.ok) { setMessage(result.message || "No fue posible completar la operación."); return; }
    await load(); await openReview(review.application.id);
  };

  const compatibleDevices = review ? devices.filter((d) => d.productId === review.application.productId && (d.status === "available" || d.id === fulfillment?.deviceId)) : [];

  return (
    <section className="min-h-screen bg-[#f5f5f7] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4"><div><p className="text-sm text-black/40">Originación</p><h1 className="mt-1 text-4xl font-semibold tracking-[-0.045em]">Solicitudes de crédito</h1><p className="mt-2 text-sm text-black/45">KYC, riesgo, aprobación y preparación de entrega en un solo flujo.</p></div><button onClick={() => void load()} className="rounded-full bg-white p-3 shadow-sm ring-1 ring-black/5"><RefreshCw size={17} /></button></div>
        {message && <div className="mt-6 rounded-2xl bg-white px-5 py-4 text-sm text-black/60 shadow-sm ring-1 ring-black/5">{message}</div>}
        <div className="mt-7 overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-[#fafafa] text-xs uppercase tracking-wide text-black/35"><tr><th className="px-6 py-4">Folio</th><th className="px-6 py-4">Cliente</th><th className="px-6 py-4">Equipo</th><th className="px-6 py-4">Ingreso</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4">Revisión</th></tr></thead><tbody className="divide-y divide-black/5">
          {applications.map((app) => { const product = productMap.get(app.productId); return <tr key={app.id}><td className="px-6 py-4 font-mono text-xs">{app.folio}</td><td className="px-6 py-4"><p className="font-medium">{app.fullName}</p><p className="text-xs text-black/35">{app.email} · {app.phone}</p></td><td className="px-6 py-4">{product ? `${product.brand} ${product.model}` : `Producto ${app.productId}`}</td><td className="px-6 py-4">${Number(app.monthlyIncome).toLocaleString("es-MX")}</td><td className="px-6 py-4"><span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-medium capitalize text-black/60">{app.status}</span></td><td className="px-6 py-4"><button onClick={() => void openReview(app.id)} className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-medium"><ClipboardCheck size={14}/> Revisar</button></td></tr>; })}
          {!applications.length && <tr><td colSpan={6} className="px-6 py-12 text-center text-black/35">No hay solicitudes para mostrar.</td></tr>}
        </tbody></table></div></div>
      </div>

      {selectedId && <div className="fixed inset-0 z-50 flex justify-end bg-black/25 backdrop-blur-sm"><div className="h-full w-full max-w-2xl overflow-y-auto bg-[#f5f5f7] shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/90 px-6 py-5 backdrop-blur-xl"><div><p className="text-xs uppercase tracking-[.14em] text-black/35">Expediente</p><h2 className="mt-1 text-xl font-semibold">{review?.application.folio || "Cargando…"}</h2></div><button onClick={() => { setSelectedId(null); setReview(null); setFulfillment(null); }} className="rounded-full bg-[#f5f5f7] p-2"><X size={18}/></button></div>
        {!review ? <div className="p-8 text-sm text-black/40">Cargando expediente…</div> : <div className="space-y-5 p-6">
          <Card><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-black/40">Solicitante</p><h3 className="mt-1 text-2xl font-semibold">{review.application.fullName}</h3><p className="mt-1 text-sm text-black/45">{review.application.curp || "CURP pendiente"} · {review.application.rfc || "RFC pendiente"}</p></div><ShieldCheck className="text-black/25"/></div><div className="mt-5 grid gap-3 sm:grid-cols-2 text-sm"><Info label="Domicilio" value={`${review.application.address || "—"} ${review.application.postalCode || ""}`}/><Info label="Ocupación" value={`${review.application.occupation || "—"}${review.application.employer ? ` · ${review.application.employer}` : ""}`}/><Info label="Ingreso mensual" value={`$${Number(review.application.monthlyIncome).toLocaleString("es-MX")}`}/><Info label="Plazo" value={`${review.application.termMonths} meses`}/></div></Card>

          <Card><div className="flex items-center justify-between gap-4"><div><p className="text-sm text-black/40">Riesgo interno</p><h3 className="mt-1 text-lg font-semibold">{review.risk ? `${review.risk.score} puntos · ${riskLabels[review.risk.riskLevel]}` : "Sin evaluar"}</h3></div>{review.application.status === "pending" && <button disabled={busy === "risk"} onClick={() => void evaluateRisk()} className="rounded-full bg-black px-4 py-2 text-xs font-medium text-white disabled:opacity-40">{review.risk ? "Reevaluar" : "Evaluar riesgo"}</button>}</div>{review.risk && <><p className="mt-3 text-sm font-medium">{recommendationLabels[review.risk.recommendation]}</p><div className="mt-5 space-y-2">{Object.entries(review.risk.factors || {}).map(([key, factor]) => <div key={key} className="flex items-center justify-between gap-4 rounded-2xl bg-[#f5f5f7] px-4 py-3 text-sm"><span className="text-black/60">{factor.detail}</span><span className={`font-semibold ${factor.points >= 0 ? "text-black" : "text-red-600"}`}>{factor.points >= 0 ? "+" : ""}{factor.points}</span></div>)}</div></>}</Card>

          <Card><p className="text-sm text-black/40">Documentos KYC</p><div className="mt-4 space-y-2">{review.documents.map((document) => <div key={document.id} className="rounded-2xl bg-[#f5f5f7] p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium capitalize">{document.type.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-black/35">{document.originalName} · {document.reviewStatus}</p></div>{review.application.status === "pending" && <div className="flex gap-1"><button disabled={busy === document.id} onClick={() => void reviewDocument(document, "accepted")} className="rounded-full bg-white p-2 text-emerald-700 ring-1 ring-black/5" title="Aceptar"><Check size={14}/></button><button disabled={busy === document.id} onClick={() => void reviewDocument(document, "rejected")} className="rounded-full bg-white p-2 text-red-600 ring-1 ring-black/5" title="Rechazar"><X size={14}/></button></div>}</div></div>)}</div></Card>

          <Card><p className="text-sm text-black/40">Referencias</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{review.references.map((reference) => <div key={reference.id} className="rounded-2xl bg-[#f5f5f7] px-4 py-3"><p className="text-sm font-medium">{reference.fullName}</p><p className="mt-1 text-xs text-black/35">{reference.relationship || "Referencia"} · {reference.phone}</p></div>)}</div></Card>

          {review.application.status === "pending" && <Card><p className="text-sm text-black/40">Decisión administrativa</p><h3 className="mt-1 text-lg font-semibold">Aprobar no activa todavía el crédito</h3><textarea value={decisionReason} onChange={(e) => setDecisionReason(e.target.value)} rows={4} placeholder="Motivo de la decisión…" className="mt-4 w-full resize-none rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 py-3 text-sm outline-none"/><div className="mt-4 flex gap-2"><button disabled={busy === "approve" || !review.risk} onClick={() => void decide("approve")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-40"><CheckCircle2 size={16}/> Aprobar</button><button disabled={busy === "reject"} onClick={() => void decide("reject")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-red-200 px-5 py-3 text-sm font-medium text-red-600 disabled:opacity-40"><XCircle size={16}/> Rechazar</button></div></Card>}

          {review.application.status === "approved" && fulfillment && <Card><div className="flex items-center justify-between"><div><p className="text-sm text-black/40">Preparación de entrega</p><h3 className="mt-1 text-lg font-semibold">{fulfillmentLabels[fulfillment.status]}</h3></div>{fulfillment.status === "active" && <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-700"><CheckCircle2 size={18}/></span>}</div>
            <div className="mt-5 space-y-3">
              <Step done={fulfillment.contractStatus === "signed"} title="Contrato firmado" action={fulfillment.contractStatus !== "signed" ? <button onClick={() => void fulfillmentAction("fulfillment/contract-signed")} className="rounded-full bg-black px-3 py-2 text-xs text-white">Confirmar firma</button> : null}/>
              <Step done={fulfillment.downPaymentStatus === "paid"} title="Enganche confirmado" action={fulfillment.downPaymentStatus !== "paid" ? <button onClick={() => void fulfillmentAction("fulfillment/down-payment-paid")} className="rounded-full bg-black px-3 py-2 text-xs text-white">Confirmar pago</button> : null}/>
              <div className="rounded-2xl bg-[#f5f5f7] p-4"><div className="flex items-center gap-3"><span className={`grid h-7 w-7 place-items-center rounded-full ${fulfillment.deviceId ? "bg-black text-white" : "bg-white text-black/30"}`}>{fulfillment.deviceId ? <Check size={14}/> : "3"}</span><div className="flex-1"><p className="text-sm font-medium">Reservar IMEI</p><select value={selectedDeviceId} onChange={(e) => setSelectedDeviceId(e.target.value)} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-xs"><option value="">Selecciona dispositivo</option>{compatibleDevices.map((device) => <option key={device.id} value={device.id}>{device.imei}{device.serial ? ` · ${device.serial}` : ""}</option>)}</select></div><button disabled={!selectedDeviceId || selectedDeviceId === fulfillment.deviceId} onClick={() => void fulfillmentAction("fulfillment/device", { deviceId: selectedDeviceId })} className="rounded-full bg-black px-3 py-2 text-xs text-white disabled:opacity-30">Reservar</button></div></div>
              <Step done={fulfillment.status === "active"} title="Activar crédito" action={fulfillment.status === "ready_for_activation" ? <button onClick={() => void fulfillmentAction("activate")} className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white">Activar</button> : null}/>
            </div>
          </Card>}
        </div>}
      </div></div>}
    </section>
  );
}

function Card({ children }: { children: React.ReactNode }) { return <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5">{children}</div>; }
function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-black/35">{label}</p><p className="mt-1 text-black/70">{value}</p></div>; }
function Step({ done, title, action }: { done: boolean; title: string; action: React.ReactNode }) { return <div className="flex items-center gap-3 rounded-2xl bg-[#f5f5f7] p-4"><span className={`grid h-7 w-7 place-items-center rounded-full ${done ? "bg-black text-white" : "bg-white text-black/30"}`}>{done ? <Check size={14}/> : "•"}</span><p className="flex-1 text-sm font-medium">{title}</p>{action}</div>; }
