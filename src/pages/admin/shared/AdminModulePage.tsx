import type { ReactNode } from "react";

interface AdminModulePageProps {
  title: string;
  description: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export default function AdminModulePage({ title, description, icon, children }: AdminModulePageProps) {
  return (
    <section className="min-h-[calc(100vh-72px)] bg-white px-6 py-8 sm:px-8 lg:px-12 lg:py-11">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start gap-4 border-b border-black/5 pb-8">
          {icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f5f5f7] text-black/55">
              {icon}
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/30">MoviCrédito Admin</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.045em] text-[#1d1d1f]">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-black/45">{description}</p>
          </div>
        </div>

        {children ?? (
          <div className="mt-8 rounded-[30px] border border-black/5 bg-[#f5f5f7] p-10 text-center">
            <p className="font-medium text-[#1d1d1f]">Módulo preparado para MoviCrédito V1</p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-black/40">
              La estructura ya está lista para conectar operaciones y datos reales del backend.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
