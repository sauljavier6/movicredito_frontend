import { ArrowRight, BadgeCheck, ShieldCheck, Sparkles } from "lucide-react";
import ProductList from "../../../components/customer/product/ProductList";

const CatalogoPage = () => {
  return (
    <div className="overflow-hidden bg-white">
      <section className="relative bg-gradient-to-b from-[#eef7ff] via-white to-white px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
              <Sparkles size={15} />
              Tecnología hoy. Págala a tu ritmo.
            </div>

            <h1 className="text-balance text-5xl font-semibold tracking-[-0.055em] text-[#1d1d1f] sm:text-6xl lg:text-7xl">
              Estrena tu próximo celular sin complicarte.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-black/55 sm:text-xl">
              Elige tu equipo, solicita tu crédito en línea y administra tus pagos desde una experiencia simple, transparente y segura.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#equipos"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:w-auto"
              >
                Ver equipos
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
            {[
              { icon: BadgeCheck, title: "Solicitud digital", text: "Proceso claro desde tu celular o computadora." },
              { icon: ShieldCheck, title: "Compra protegida", text: "Crédito y dispositivo vinculados de forma segura." },
              { icon: Sparkles, title: "Sin vueltas", text: "Consulta tu saldo, pagos y vencimientos desde un solo lugar." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-[28px] border border-black/5 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/15">
                  <Icon size={20} />
                </div>
                <h2 className="text-base font-semibold tracking-[-0.02em]">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-black/50">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="equipos" className="bg-white px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <span className="text-sm font-semibold text-black/45">CATÁLOGO</span>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Encuentra el equipo ideal para ti.</h2>
            <p className="mt-4 text-base leading-7 text-black/50">
              Explora modelos disponibles y comienza tu solicitud de crédito cuando encuentres el indicado.
            </p>
          </div>
          <ProductList />
        </div>
      </section>
    </div>
  );
};

export default CatalogoPage;
