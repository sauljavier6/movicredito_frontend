import { Outlet, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const FormLayout = () => {
  return (
    <div className="min-h-screen bg-white text-[#151515]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="MoviCrédito" className="h-10 w-10 rounded-xl object-cover shadow-sm" />
            <span className="text-[17px] font-semibold tracking-[-0.02em]">MoviCrédito</span>
          </Link>

          <div className="flex items-center gap-5">
            <a href="/#equipos" className="text-sm font-medium text-black/60 transition hover:text-black">Equipos</a>
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
