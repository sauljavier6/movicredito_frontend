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
    imagen: [
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-product-red-select-2021?wid=470&hei=556&fmt=png-alpha&.v=1645572315935",
    ],
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
    imagen: [
      "https://i01.appmifile.com/webfile/globalimg/products/pc/redmi-note-8/specs01.jpg",
    ],
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
    imagen: [
      "https://images.samsung.com/is/image/samsung/p6pim/mx/sm-a525mzkegtc/gallery/mx-galaxy-a52-a525-366992-sm-a525mzkegtc-368215492?$650_519_PNG$",
    ],
  },
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
    imagen: [
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-product-red-select-2021?wid=470&hei=556&fmt=png-alpha&.v=1645572315935",
    ],
  },
  // 👉 agrega más para probar
];

const ProductList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 4;

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = mockProducts.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(mockProducts.length / productsPerPage);

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-green-400 text-center">
        Catálogo de Productos
      </h1>

      {/* Productos paginados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {currentProducts.map((product) => (
          <ProductCard key={product.ID_Catalogo_Equipo} product={product} />
        ))}
      </div>

      {/* Paginación */}
      <div className="flex justify-end mt-8">
        <nav className="flex items-center gap-2">
          {/* Botón anterior */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded bg-gray-700 hover:bg-green-600 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Números de páginas */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? "bg-green-500 text-white font-bold"
                  : "bg-gray-700 hover:bg-green-600"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Botón siguiente */}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="p-2 rounded bg-gray-700 hover:bg-green-600 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default ProductList;
