import { Link, Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6 lg:px-10">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="MoviCrédito" className="h-9 w-9 rounded-xl object-cover" />
            <div>
              <p className="text-sm font-semibold tracking-[-0.02em]">MoviCrédito</p>
              <p className="text-[11px] text-black/35">Administración</p>
            </div>
          </Link>

          <Link to="/" className="text-sm font-medium text-black/45 transition hover:text-black">
            Volver al portal
          </Link>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
