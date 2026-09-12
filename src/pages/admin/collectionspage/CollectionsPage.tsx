import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BellRing, LockKeyhole, RefreshCw, ShieldAlert } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

type CollectionItem = {
  creditId: string;
  status: string;
  balance: number;
  overdueCount: number;
  overdueAmount: number;
  maxDaysLate: number;
  recommendedAction: "none" | "reminder" | "escalate" | "restrict" | "lock";
};

type PortfolioResponse = {
  summary: {
    total: number;
    overdueAmount: number;
    none: number;
    reminder: number;
    escalate: number;
    restrict: number;
    lock: number;
  };
  results: CollectionItem[];
};

const labels: Record<CollectionItem["recommendedAction"], string> = {
  none: "Sin acción",
  reminder: "Recordatorio",
  escalate: "Escalar cobranza",
  restrict: "Restricción preventiva",
  lock: "Elegible para bloqueo",
};

export default function CollectionsPage() {
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = sessionStorage.getItem("movicredito_token");

  const loadPortfolio = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/collections/portfolio`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "No fue posible evaluar la cartera.");
      setData(body);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPortfolio();
  }, []);

  const atRisk = useMemo(() => data?.results.filter((item) => item.recommendedAction !== "none") ?? [], [data]);

  return (
    <section className="min-h-screen bg-[#f5f5f7] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-black/40">Recuperación de cartera</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-[-0.045em] text-[#1d1d1f]">Cobranza</h1>
            <p className="mt-2 text-sm text-black/45">Evalúa atrasos y prioriza acciones antes de cualquier restricción del equipo.</p>
          </div>
          <button onClick={() => void loadPortfolio()} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium shadow-sm ring-1 ring-black/5">
            <RefreshCw size={16} /> {loading ? "Evaluando…" : "Actualizar cartera"}
          </button>
        </div>

        {error && <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Créditos evaluados" value={String(data?.summary.total ?? 0)} icon={<BellRing size={18} />} />
          <Metric label="Monto vencido" value={`$${Number(data?.summary.overdueAmount ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`} icon={<AlertTriangle size={18} />} />
          <Metric label="Restricción sugerida" value={String(data?.summary.restrict ?? 0)} icon={<ShieldAlert size={18} />} />
          <Metric label="Bloqueo sugerido" value={String(data?.summary.lock ?? 0)} icon={<LockKeyhole size={18} />} />
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
          <div className="border-b border-black/5 px-6 py-5">
            <h2 className="font-semibold">Prioridad de cobranza</h2>
            <p className="mt-1 text-xs text-black/40">Las acciones son recomendaciones operativas; no ejecutan un bloqueo físico por sí solas.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-[#fafafa] text-xs uppercase tracking-wide text-black/35"><tr><th className="px-6 py-4">Crédito</th><th className="px-6 py-4">Atraso máx.</th><th className="px-6 py-4">Cuotas vencidas</th><th className="px-6 py-4">Monto vencido</th><th className="px-6 py-4">Saldo</th><th className="px-6 py-4">Acción</th></tr></thead>
              <tbody className="divide-y divide-black/5">
                {atRisk.map((item) => <tr key={item.creditId}><td className="px-6 py-4 font-mono text-xs">{item.creditId}</td><td className="px-6 py-4 font-semibold">{item.maxDaysLate} días</td><td className="px-6 py-4">{item.overdueCount}</td><td className="px-6 py-4">${item.overdueAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td><td className="px-6 py-4">${item.balance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td><td className="px-6 py-4"><span className={`rounded-full px-3 py-1.5 text-xs font-medium ${item.recommendedAction === "lock" ? "bg-red-50 text-red-700" : item.recommendedAction === "restrict" ? "bg-amber-50 text-amber-700" : "bg-[#f5f5f7] text-black/60"}`}>{labels[item.recommendedAction]}</span></td></tr>)}
                {!atRisk.length && <tr><td colSpan={6} className="px-6 py-12 text-center text-black/35">No hay créditos que requieran acción de cobranza.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5"><div className="flex items-center justify-between text-black/40"><span className="text-xs font-medium uppercase tracking-[0.12em]">{label}</span>{icon}</div><p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#1d1d1f]">{value}</p></div>;
}
