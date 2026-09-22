import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Play, RefreshCw, ShieldCheck, XCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

type DeviceAction = {
  id: string;
  deviceId: string;
  creditId?: string;
  action: "restrict" | "lock" | "unlock" | "release";
  status: "pending" | "approved" | "processing" | "completed" | "failed" | "cancelled";
  reasonCode?: string;
  reason?: string;
  provider?: string;
  providerReference?: string;
  lastError?: string;
  metadata?: { simulated?: boolean };
  createdAt: string;
};

type ApiResponse = {
  knox: {
    enabled: boolean;
    configured: boolean;
    mode: "simulation" | "live-ready";
    region?: string | null;
  };
  actions: DeviceAction[];
};

export default function DeviceActionsPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = sessionStorage.getItem("movicredito_token");

  const request = async (url: string, options?: RequestInit) => {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options?.headers || {}),
      },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || "No fue posible completar la operación.");
    return body;
  };

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setData(await request("/api/device-actions"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const act = async (id: string, operation: "approve" | "process" | "cancel") => {
    setBusyId(id);
    setError(null);
    try {
      await request(`/api/device-actions/${id}/${operation}`, {
        method: "POST",
        body: operation === "cancel" ? JSON.stringify({ reason: "Cancelada desde el panel administrativo" }) : undefined,
      });
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="min-h-screen bg-[#f5f5f7] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-black/40">Seguridad del dispositivo</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-[-0.045em] text-[#1d1d1f]">Órdenes de dispositivo</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
              Revisa, aprueba y ejecuta acciones sensibles. Restricciones y bloqueos nunca se ejecutan directamente desde el motor de cobranza.
            </p>
          </div>
          <button onClick={() => void load()} className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium shadow-sm ring-1 ring-black/5">
            <RefreshCw size={16} /> {loading ? "Actualizando…" : "Actualizar"}
          </button>
        </div>

        <div className="mt-7 rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex flex-wrap items-center gap-3">
            <div className={`grid h-10 w-10 place-items-center rounded-2xl ${data?.knox.mode === "live-ready" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
              <ShieldCheck size={19} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1d1d1f]">Knox Guard: {data?.knox.mode === "live-ready" ? "credenciales configuradas" : "modo simulación"}</p>
              <p className="mt-0.5 text-xs text-black/40">
                {data?.knox.mode === "live-ready"
                  ? "La configuración está presente, pero la ejecución live permanece protegida hasta completar la integración REST."
                  : "Las órdenes actualizan el flujo interno y auditoría, pero no bloquean físicamente ningún equipo."}
              </p>
            </div>
          </div>
        </div>

        {error && <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="mt-6 overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-[#fafafa] text-xs uppercase tracking-wide text-black/35">
                <tr>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Acción</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Crédito</th>
                  <th className="px-6 py-4">Dispositivo</th>
                  <th className="px-6 py-4">Motivo</th>
                  <th className="px-6 py-4 text-right">Controles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {(data?.actions ?? []).map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-xs text-black/45">{new Date(item.createdAt).toLocaleString("es-MX")}</td>
                    <td className="px-6 py-4 font-semibold capitalize">{item.action}</td>
                    <td className="px-6 py-4 align-middle"><StatusBadge status={item.status} simulated={item.metadata?.simulated} /></td>
                    <td className="px-6 py-4 font-mono text-xs">{item.creditId || "—"}</td>
                    <td className="px-6 py-4 font-mono text-xs">{item.deviceId}</td>
                    <td className="max-w-xs px-6 py-4 text-xs leading-5 text-black/50">{item.reason || item.reasonCode || item.lastError || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {item.status === "pending" && <ActionButton label="Aprobar" icon={<CheckCircle2 size={14} />} disabled={busyId === item.id} onClick={() => void act(item.id, "approve")} />}
                        {item.status === "approved" && <ActionButton label="Procesar" icon={<Play size={14} />} disabled={busyId === item.id} onClick={() => void act(item.id, "process")} />}
                        {["pending", "approved"].includes(item.status) && <ActionButton label="Cancelar" icon={<XCircle size={14} />} disabled={busyId === item.id} onClick={() => void act(item.id, "cancel")} muted />}
                        {busyId === item.id && <Loader2 size={16} className="animate-spin text-black/35" />}
                      </div>
                    </td>
                  </tr>
                ))}
                {!data?.actions?.length && <tr><td colSpan={7} className="px-6 py-14 text-center text-black/35">Todavía no existen órdenes de dispositivo.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActionButton({ label, icon, onClick, disabled, muted = false }: { label: string; icon: React.ReactNode; onClick: () => void; disabled?: boolean; muted?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition disabled:opacity-40 ${muted ? "bg-[#f5f5f7] text-black/55 hover:bg-black/10" : "bg-black text-white hover:bg-black/75"}`}>{icon}{label}</button>;
}

function StatusBadge({ status, simulated }: { status: DeviceAction["status"]; simulated?: boolean }) {
  const styles: Record<DeviceAction["status"], string> = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-blue-50 text-blue-700",
    processing: "bg-purple-50 text-purple-700",
    completed: "bg-green-50 text-green-700",
    failed: "bg-red-50 text-red-700",
    cancelled: "bg-[#f5f5f7] text-black/45",
  };
  return <span className={`inline-flex max-w-full items-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium leading-none ${styles[status]}`}>{status}{simulated ? " · simulado" : ""}</span>;
}
