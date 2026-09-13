import { useEffect, useState } from "react";
import { CheckCircle2, Download, FileText, LoaderCircle, ShieldCheck } from "lucide-react";
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
    <div className="min-h-screen bg-[#f5f5f7] px-4 py-12 sm:px-6 lg:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-black/5">Contrato MoviCrédito</span>
          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-6xl">Revisa antes de aceptar.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">Consulta la versión vigente, descarga el PDF y confirma expresamente tu aceptación.</p>
        </div>

        {!contract && (
          <div className="mt-10 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">ID de solicitud<input value={applicationId} onChange={(e) => setApplicationId(e.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3" /></label>
              <label className="text-sm font-medium text-slate-700">Token de seguimiento<input value={token} onChange={(e) => setToken(e.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3" /></label>
            </div>
            <button onClick={() => void loadContract()} disabled={loading} className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white disabled:opacity-50">{loading ? <LoaderCircle className="animate-spin" size={16} /> : <FileText size={16} />} Consultar contrato</button>
          </div>
        )}

        {message && <div className="mt-6 rounded-2xl bg-white px-5 py-4 text-sm text-slate-600 shadow-sm ring-1 ring-black/5">{message}</div>}

        {contract && (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
              <div className="flex items-start justify-between gap-4"><div><p className="text-sm text-black/40">Versión contractual</p><h2 className="mt-1 text-2xl font-semibold">Versión {contract.version}</h2></div><span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs font-semibold capitalize">{contract.status}</span></div>
              <pre className="mt-6 whitespace-pre-wrap rounded-3xl bg-[#f5f5f7] p-5 font-sans text-sm leading-7 text-slate-700">{contract.contractText}</pre>
              <p className="mt-4 break-all text-xs text-black/30">SHA-256: {contract.documentHash}</p>
            </div>

            <aside className="h-fit rounded-[32px] bg-slate-950 p-7 text-white lg:sticky lg:top-28">
              <ShieldCheck size={26} />
              <h3 className="mt-5 text-xl font-semibold">Evidencia de aceptación</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">Al aceptar se registra la versión, hash del documento, fecha y evidencia técnica de la operación.</p>
              <button onClick={() => void downloadPdf()} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"><Download size={16} /> Descargar PDF</button>
              {contract.status === "accepted" ? (
                <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm"><div className="flex items-center gap-2 font-semibold"><CheckCircle2 size={17} /> Contrato aceptado</div>{contract.acceptedAt && <p className="mt-2 text-xs text-white/60">{new Date(contract.acceptedAt).toLocaleString("es-MX")}</p>}</div>
              ) : (
                <button onClick={() => void accept()} disabled={accepting} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold disabled:opacity-50">{accepting ? <LoaderCircle className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} ACEPTO el contrato</button>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
