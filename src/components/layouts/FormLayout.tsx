import { Outlet, Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

const FormLayout = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-sm font-semibold text-white">
              M
            </div>
            <span className="text-[17px] font-semibold tracking-[-0.02em]">MoviCrédito</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-5">
            <Link to="/login" className="hidden text-sm font-medium text-black/65 transition hover:text-black sm:inline">
              Administrar
            </Link>
            <Link
              to="/formulario"
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/80"
            >
              Solicitar crédito
              <ArrowRight size={15} />
            </Link>
          </div>
        </nav>
      </header>

      <main className="min-h-screen pt-16">
        <Outlet />
      </main>

      <footer className="border-t border-black/5 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-2 md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck size={18} />
              Crédito claro. Tecnología segura.
            </div>
            <p className="max-w-md text-sm leading-6 text-black/55">
              MoviCrédito conecta venta de equipos, financiamiento y administración del crédito en una sola experiencia digital.
            </p>
          </div>

          <div className="text-sm text-black/45 md:text-right">
            © {new Date().getFullYear()} MoviCrédito · SWS Souls Web Solutions
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FormLayout;
