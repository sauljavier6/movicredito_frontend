import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle, PackageOpen } from "lucide-react";
import ProductCard, { type CatalogProduct } from "./ProductCard";

const API_URL = import.meta.env.VITE_API_URL || "";

const ProductList = () => {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const productsPerPage = 6;

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/api/products`, { signal: controller.signal });
        if (!response.ok) throw new Error("No pudimos cargar los equipos disponibles.");
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message || "No pudimos cargar el catálogo.");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, []);

  const totalPages = Math.max(1, Math.ceil(products.length / productsPerPage));
  const currentProducts = useMemo(() => {
    const first = (currentPage - 1) * productsPerPage;
    return products.slice(first, first + productsPerPage);
  }, [currentPage, products]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-[30px] bg-[#f5f5f7]">
        <div className="text-center text-black/45">
          <LoaderCircle className="mx-auto mb-3 animate-spin" size={28} />
          <p className="text-sm">Cargando equipos disponibles…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[30px] border border-black/5 bg-[#f5f5f7] px-6 py-14 text-center">
        <PackageOpen className="mx-auto mb-4 text-black/20" size={38} />
        <p className="font-medium text-[#1d1d1f]">Catálogo temporalmente no disponible</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-black/45">{error}</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-[30px] border border-black/5 bg-[#f5f5f7] px-6 py-14 text-center">
        <PackageOpen className="mx-auto mb-4 text-black/20" size={38} />
        <p className="font-medium text-[#1d1d1f]">Próximamente nuevos equipos</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-black/45">El catálogo se actualizará en cuanto haya equipos activos disponibles para financiamiento.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {currentProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <nav className="flex items-center gap-2 rounded-full bg-[#f5f5f7] p-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-black hover:text-white disabled:opacity-30"
              aria-label="Página anterior"
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-9 min-w-9 rounded-full px-3 text-sm font-medium transition ${currentPage === page ? "bg-black text-white" : "hover:bg-white"}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-black hover:text-white disabled:opacity-30"
              aria-label="Página siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ProductList;
