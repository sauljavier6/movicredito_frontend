import { ArrowUpRight, CreditCard, Smartphone, Users, WalletCards } from "lucide-react";

const metrics = [
  { label: "Clientes", value: "—", detail: "Sincronizado al conectar métricas", icon: Users },
  { label: "Créditos activos", value: "—", detail: "Cartera vigente", icon: CreditCard },
  { label: "Cobranza del mes", value: "—", detail: "Pagos aplicados", icon: WalletCards },
  { label: "Equipos financiados", value: "—", detail: "Dispositivos asignados", icon: Smartphone },
];

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-white px-6 py-8 sm:px-8 lg:px-12 lg:py-11">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 border-b border-black/5 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/30">Resumen operativo</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#1d1d1f] sm:text-5xl">Todo bajo control.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/45">
              Solicitudes, cartera, cobranza y dispositivos en una vista simple. Los indicadores aparecerán en cuanto el módulo de métricas esté conectado.
            </p>
          </div>
          <a
            href="/admin/solicitudes"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-black/80"
          >
            Revisar solicitudes <ArrowUpRight size={16} />
          </a>
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
              <span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs text-black/40">Próxima conexión API</span>
            </div>
            <div className="mt-8 flex min-h-56 items-center justify-center rounded-[24px] bg-[#f5f5f7] px-6 text-center">
              <div>
                <p className="font-medium text-black/55">Aún no hay datos operativos para mostrar</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/35">Aquí aparecerán colocación, pagos y mora usando datos reales del backend. No mostramos cifras ficticias.</p>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] bg-[#1d1d1f] p-7 text-white">
            <p className="text-sm font-semibold">Seguridad de dispositivos</p>
            <p className="mt-2 text-sm leading-6 text-white/45">Estado de enrolamiento, restricciones y equipos financiados.</p>
            <div className="mt-10 space-y-3">
              {["Protección activa", "Pendientes de enrolar", "Con restricción"].map((label) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <span className="text-sm text-white/60">{label}</span>
                  <span className="text-lg font-semibold">—</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
