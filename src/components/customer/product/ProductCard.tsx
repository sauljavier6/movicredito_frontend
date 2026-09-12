import { ArrowUpRight, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: {
    ID_Catalogo_Equipo: number;
    Precio_Venta: number;
    Marca: string;
    Modelo: string;
    Almacenamiento: string;
    Ram: string;
    Cpu_Gpu: string;
    Pantalla: string;
    Bateria: string;
    Camara: string;
    imagen: string[];
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const estimatedPayment = Math.ceil(product.Precio_Venta / 12);

  return (
    <article className="group overflow-hidden rounded-[30px] border border-black/5 bg-[#f5f5f7] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(0,0,0,0.09)]">
      <div className="relative flex h-72 items-center justify-center overflow-hidden bg-gradient-to-b from-white to-[#f2f2f4] p-8">
        <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-black/60 shadow-sm backdrop-blur">
          {product.Marca}
        </div>
        <img
          src={product.imagen[0]}
          alt={`${product.Marca} ${product.Modelo}`}
          className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.04]"
        />
      </div>

      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-[-0.035em] text-[#1d1d1f]">{product.Modelo}</h3>
            <p className="mt-1 text-sm text-black/45">{product.Almacenamiento} · {product.Ram} RAM</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black/60 shadow-sm">
            <Smartphone size={18} />
          </div>
        </div>

        <div className="mt-6 border-t border-black/5 pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.13em] text-black/35">Precio desde</p>
          <div className="mt-1 flex items-end justify-between gap-4">
            <div>
              <p className="text-2xl font-semibold tracking-[-0.03em]">${product.Precio_Venta.toLocaleString("es-MX")}</p>
              <p className="mt-1 text-sm text-black/45">Referencia: ~${estimatedPayment.toLocaleString("es-MX")}/mes a 12 meses*</p>
            </div>
          </div>
        </div>

        <Link
          to="/formulario"
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
