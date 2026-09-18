import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CreditCard, Smartphone, Users, WalletCards } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";
type DashboardData = { metrics:{customers:number;activeCredits:number;monthCollections:number;financedDevices:number}; deviceSecurity:{protected:number;pendingEnrollment:number;restricted:number}; recentPayments:Array<{id:string;amount:number|string;method:string;type?:string;paidAt:string}> };



export default function HomePage() {
  const {data,error}=useQuery<DashboardData>({
    queryKey:["dashboard"],
    queryFn:async()=>{const token=sessionStorage.getItem("movicredito_token");if(!token)throw new Error("Sesión inválida.");const r=await fetch(`${API_URL}/api/dashboard`,{headers:{Authorization:`Bearer ${token}`}});const b=await r.json().catch(()=>({}));if(!r.ok)throw new Error(b.message||"No fue posible cargar el dashboard.");return b;},
    staleTime:0,
    refetchOnMount:"always",
    refetchOnWindowFocus:true,
  });
  const metrics=[
    {label:"Clientes",value:data?String(data.metrics.customers):"—",detail:"Clientes registrados",icon:Users},
    {label:"Créditos activos",value:data?String(data.metrics.activeCredits):"—",detail:"Cartera vigente y vencida",icon:CreditCard},
    {label:"Cobranza del mes",value:data?`${Number(data.metrics.monthCollections).toLocaleString("es-MX",{minimumFractionDigits:2})}`:"—",detail:"Pagos aplicados este mes",icon:WalletCards},
    {label:"Equipos financiados",value:data?String(data.metrics.financedDevices):"—",detail:"Dispositivos asignados",icon:Smartphone},
  ];
  return (
    <div className="min-h-[calc(100vh-72px)] bg-white px-6 py-8 sm:px-8 lg:px-12 lg:py-11">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-black/5 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/30">Resumen operativo</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#1d1d1f] sm:text-5xl">Todo bajo control.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/45">
              Solicitudes, cartera, cobranza y dispositivos en una vista simple. Los indicadores se alimentan directamente de la operación registrada en MoviCrédito.
            </p>
          </div>
          <div className="flex gap-2"><a
            href="/admin/solicitudes"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/80"
          >
            Revisar solicitudes <ArrowUpRight size={16} />
          </a></div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, detail, icon: Icon }) => (
            <article key={label} className="rounded-[26px] border border-black/5 bg-[#f5f5f7] p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-black/45">{label}</p>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black/45 shadow-sm">
                  <Icon size={18} strokeWidth={1.8} />
                </div>
              </div>
              <p className="mt-8 text-4xl font-semibold tracking-[-0.045em] text-[#1d1d1f]">{value}</p>
              <p className="mt-2 text-xs text-black/35">{detail}</p>
            </article>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
          <section className="rounded-[30px] border border-black/5 bg-white p-7 shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Actividad financiera</p>
                <p className="mt-1 text-xs text-black/35">Últimos movimientos relevantes</p>
              </div>
              <span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs text-black/40">Datos reales</span>
            </div>
            <div className="mt-8 min-h-56 overflow-hidden rounded-[24px] bg-[#f5f5f7]">{error?<div className="p-6 text-sm text-red-600">{error instanceof Error?error.message:"No fue posible cargar el dashboard."}</div>:data?.recentPayments.length?<div className="divide-y divide-black/5">{data.recentPayments.map(p=><div key={p.id} className="flex items-center justify-between px-5 py-4"><div><p className="text-sm font-medium">{p.type==="down_payment"?"Enganche":"Pago de crédito"}</p><p className="text-xs capitalize text-black/35">{p.method} · {new Date(p.paidAt).toLocaleString("es-MX")}</p></div><p className="font-semibold">${Number(p.amount).toLocaleString("es-MX",{minimumFractionDigits:2})}</p></div>)}</div>:<div className="flex min-h-56 items-center justify-center text-sm text-black/35">Sin pagos aplicados todavía.</div>}</div>
          </section>

          <section className="rounded-[30px] bg-[#1d1d1f] p-7 text-white">
            <p className="text-sm font-semibold">Seguridad de dispositivos</p>
            <p className="mt-2 text-sm leading-6 text-white/45">Estado de enrolamiento, restricciones y equipos financiados.</p>
            <div className="mt-10 space-y-3">
              {["Protección activa", "Pendientes de enrolar", "Con restricción"].map((label) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <span className="text-sm text-white/60">{label}</span>
                  <span className="text-lg font-semibold">{label==="Protección activa"?(data?.deviceSecurity.protected??"—"):label==="Pendientes de enrolar"?(data?.deviceSecurity.pendingEnrollment??"—"):(data?.deviceSecurity.restricted??"—")}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
