import { ArrowUpRight, ShieldCheck, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

export interface CatalogProduct {
  id: number;
  brand: string;
  model: string;
  storage: string;
  ram?: string;
  processor?: string;
  display?: string;
  battery?: string;
  camera?: string;
  price: number | string;
  imageUrl?: string;
  supportsKnoxGuard?: boolean;
}

const ProductCard = ({ product }: { product: CatalogProduct }) => {
  const price = Number(product.price);
  const estimatedPayment = Math.ceil(price / 12);

  return (
    <article className="group overflow-hidden rounded-[30px] border border-black/5 bg-[#f5f5f7] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(0,0,0,0.09)]">
      <div className="relative flex h-72 items-center justify-center overflow-hidden bg-gradient-to-b from-white to-[#f2f2f4] p-8">
        <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-black/60 shadow-sm backdrop-blur">
          {product.brand}
        </div>
        {product.supportsKnoxGuard && (
          <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white">
            <ShieldCheck size={13} /> Protegible
          </div>
        )}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={`${product.brand} ${product.model}`}
            className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <Smartphone className="h-28 w-28 text-black/15" strokeWidth={1.1} />
        )}
      </div>

      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-[-0.035em] text-[#1d1d1f]">{product.model}</h3>
            <p className="mt-1 text-sm text-black/45">
              {product.storage}{product.ram ? ` · ${product.ram} RAM` : ""}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black/60 shadow-sm">
            <Smartphone size={18} />
          </div>
        </div>

        <div className="mt-6 border-t border-black/5 pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-black/35">Precio desde</p>
          <p className="mt-1 text-2xl font-semibold tracking-[-0.03em]">${price.toLocaleString("es-MX")}</p>
          <p className="mt-1 text-sm text-black/45">Referencia: ~${estimatedPayment.toLocaleString("es-MX")}/mes a 12 meses*</p>
        </div>

        <Link
          to={`/formulario?productId=${product.id}`}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3.5 text-sm font-medium text-white transition hover:bg-black/80"
        >
          Solicitar este equipo
          <ArrowUpRight size={16} />
        </Link>

        <p className="mt-3 text-center text-[11px] leading-4 text-black/35">
          *Estimación ilustrativa. El pago final depende de aprobación, enganche, plazo y condiciones del crédito.
        </p>
      </div>
    </article>
  );
};

export default ProductCard;
