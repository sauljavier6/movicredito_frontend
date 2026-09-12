import { useState } from "react";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const mockProducts = [
  {
    ID_Catalogo_Equipo: 3,
    Precio_Venta: 15999,
    Marca: "Apple",
    Modelo: "iPhone 13",
    Almacenamiento: "128GB",
    Ram: "4GB",
    Cpu_Gpu: "A15 Bionic",
    Pantalla: "6.1'' Super Retina XDR",
    Bateria: "3227mAh",
    Camara: "12MP + 12MP",
    imagen: ["https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-product-red-select-2021?wid=470&hei=556&fmt=png-alpha&.v=1645572315935"],
  },
  {
    ID_Catalogo_Equipo: 1,
    Precio_Venta: 4500,
    Marca: "Xiaomi",
    Modelo: "Redmi Note 8",
    Almacenamiento: "128GB",
    Ram: "6GB",
    Cpu_Gpu: "Snapdragon 665",
    Pantalla: "6.3'' FHD+",
    Bateria: "4000mAh",
    Camara: "48MP + 8MP + 2MP + 2MP",
    imagen: ["https://i01.appmifile.com/webfile/globalimg/products/pc/redmi-note-8/specs01.jpg"],
  },
  {
    ID_Catalogo_Equipo: 2,
    Precio_Venta: 7200,
    Marca: "Samsung",
    Modelo: "Galaxy A52",
    Almacenamiento: "256GB",
    Ram: "8GB",
    Cpu_Gpu: "Snapdragon 720G",
    Pantalla: "6.5'' Super AMOLED",
    Bateria: "4500mAh",
    Camara: "64MP + 12MP + 5MP + 5MP",
    imagen: ["https://images.samsung.com/is/image/samsung/p6pim/mx/sm-a525mzkegtc/gallery/mx-galaxy-a52-a525-366992-sm-a525mzkegtc-368215492?$650_519_PNG$"],
  },
];

const ProductList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = mockProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(mockProducts.length / productsPerPage));

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {currentProducts.map((product) => (
          <ProductCard key={`${product.ID_Catalogo_Equipo}-${product.Modelo}`} product={product} />
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
                className={`h-9 min-w-9 rounded-full px-3 text-sm font-medium transition ${
                  currentPage === page ? "bg-black text-white" : "hover:bg-white"
                }`}
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
