import type { ReactNode } from "react";

interface AdminModulePageProps {
  title: string;
  description: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export default function AdminModulePage({
  title,
  description,
  icon,
  children,
}: AdminModulePageProps) {
  return (
    <section className="min-h-screen bg-slate-950 px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
          {icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-400">{description}</p>
          </div>
        </div>

        {children ?? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-8 text-center">
            <p className="font-medium text-slate-200">Módulo preparado para MoviCrédito V1</p>
            <p className="mt-2 text-sm text-slate-500">
              La interfaz y los datos se conectarán con MoviCredito-API en la siguiente etapa.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
