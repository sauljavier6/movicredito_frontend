import { useEffect, useState } from "react";
import { CheckCircle2, Download, FileText, LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "";

type Contract = {
  id: string;
  version: number;
  documentHash: string;
  contractText: string;
  status: "generated" | "accepted" | "void";
  acceptedAt?: string;
  acceptanceHash?: string;
};

export default function ContractPage() {
  const [searchParams] = useSearchParams();
  const [applicationId, setApplicationId] = useState(searchParams.get("applicationId") || "");
  const [token, setToken] = useState(searchParams.get("token") || sessionStorage.getItem("movicredito_application_token") || "");
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmedReading, setConfirmedReading] = useState(false);

  const loadContract = async () => {
    if (!applicationId.trim() || !token.trim()) {
      setMessage("Captura el identificador de solicitud y tu token de seguimiento.");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/credit-applications/${applicationId}/contract/customer`, {
        headers: { "x-application-token": token.trim() },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "El contrato aún no está disponible.");
      setContract(body);
      sessionStorage.setItem("movicredito_application_id", applicationId.trim());
      sessionStorage.setItem("movicredito_application_token", token.trim());
    } catch (error) {
      setContract(null);
      setMessage(error instanceof Error ? error.message : "No fue posible consultar el contrato.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId && token) void loadContract();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadPdf = async () => {
    setMessage(null);
    const response = await fetch(`${API_URL}/api/credit-applications/${applicationId}/contract/customer/pdf`, {
      headers: { "x-application-token": token.trim() },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setMessage(body.message || "No fue posible generar el PDF.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `movicredito-contrato-v${contract?.version || 1}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const accept = async () => {
    if (!contract || contract.status === "accepted") return;
    setAccepting(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_URL}/api/credit-applications/${applicationId}/contract/customer/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-application-token": token.trim() },
        body: JSON.stringify({ confirmation: "ACEPTO" }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "No fue posible aceptar el contrato.");
      setContract(body.contract);
      setMessage("Contrato aceptado. El siguiente paso es confirmar el enganche.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No fue posible aceptar el contrato.");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eaf5ff] via-white to-[#eef2ff] px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm ring-1 ring-blue-100"><ShieldCheck size={15}/> Contrato MoviCrédito</span>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-6xl">Revisa tu contrato antes de continuar.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-700">Consulta la versión vigente, descarga el PDF y confirma expresamente tu aceptación.</p>
        </div>

        {!contract && (
          <div className="mt-10 rounded-[32px] border border-blue-100 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(37,99,235,0.35)] sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">ID de solicitud<input value={applicationId} onChange={(e) => setApplicationId(e.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3" /></label>
              <label className="text-sm font-medium text-slate-700">Token de seguimiento<input value={token} onChange={(e) => setToken(e.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3" /></label>
            </div>
            <button onClick={() => void loadContract()} disabled={loading} className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">{loading ? <LoaderCircle className="animate-spin" size={16} /> : <FileText size={16} />} Consultar contrato</button>
          </div>
        )}

        {message && <div className="mt-6 rounded-2xl bg-white px-5 py-4 text-sm text-slate-700 shadow-sm ring-1 ring-black/5">{message}</div>}

        {contract && (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
              <div className="flex items-start justify-between gap-4"><div><p className="text-sm text-blue-700/70">Versión contractual</p><h2 className="mt-1 text-2xl font-semibold">Versión {contract.version}</h2></div><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold capitalize">{contract.status}</span></div>
              <div className="mt-6 max-h-[680px] overflow-y-auto rounded-3xl border border-blue-100 bg-gradient-to-b from-white to-blue-50/40 p-6 sm:p-8"><div className="whitespace-pre-wrap font-sans text-[15px] leading-8 text-slate-700">{contract.contractText}</div></div>
              <details className="mt-4 text-xs text-blue-700/60"><summary className="cursor-pointer select-none">Información de integridad del documento</summary><p className="mt-2 break-all rounded-xl bg-black/[.025] p-3">SHA-256: {contract.documentHash}</p></details>
            </div>

            <aside className="h-fit rounded-[32px] bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 p-7 text-white shadow-[0_24px_60px_-24px_rgba(37,99,235,0.65)] lg:sticky lg:top-28">
              <ShieldCheck size={26} />
              <h3 className="mt-5 text-xl font-semibold">Evidencia de aceptación</h3>
              <p className="mt-3 text-sm leading-6 text-blue-100">Al aceptar se registra la versión, integridad del documento, fecha y evidencia técnica de la operación.</p><div className="mt-5 flex items-start gap-3 rounded-2xl bg-white/10 p-4 text-xs leading-5 text-white/70"><LockKeyhole className="mt-0.5 shrink-0" size={16}/>Tu aceptación queda asociada exactamente a esta versión del contrato.</div>
              <button onClick={() => void downloadPdf()} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"><Download size={16} /> Descargar PDF</button>
              {contract.status === "accepted" ? (
                <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm"><div className="flex items-center gap-2 font-semibold"><CheckCircle2 size={17} /> Contrato aceptado</div>{contract.acceptedAt && <p className="mt-2 text-xs text-white/60">{new Date(contract.acceptedAt).toLocaleString("es-MX")}</p>}</div>
              ) : (
                <div className="mt-4"><label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/15 p-4 text-xs leading-5 text-white/75"><input type="checkbox" checked={confirmedReading} onChange={e=>setConfirmedReading(e.target.checked)} className="mt-1 accent-blue-500"/> <span>Confirmo que tuve oportunidad de leer y descargar esta versión del contrato y deseo aceptarla.</span></label><button onClick={() => void accept()} disabled={accepting || !confirmedReading} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40">{accepting ? <LoaderCircle className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Aceptar contrato</button></div>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
