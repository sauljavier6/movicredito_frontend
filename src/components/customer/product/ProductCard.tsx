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
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-4 hover:shadow-green-500/40 hover:scale-105 transition transform">
      {/* Imagen */}
      <img
        src={product.imagen[0]}
        alt={`${product.Marca} ${product.Modelo}`}
        className="w-full h-40 object-cover rounded"
      />

      {/* Marca + Modelo */}
      <h2 className="text-lg font-bold text-green-400 mt-3">
        {product.Marca} {product.Modelo}
      </h2>

      {/* Especificaciones */}
      <p className="text-gray-300 text-sm">
        {product.Almacenamiento} | {product.Ram} RAM
      </p>
      <p className="text-gray-300 text-sm">
        {product.Cpu_Gpu} | {product.Pantalla}
      </p>
      <p className="text-gray-300 text-sm">
        Batería: {product.Bateria} | Cámara: {product.Camara}
      </p>

      {/* Precio */}
      <p className="text-green-400 font-bold mt-3 text-lg">
        ${product.Precio_Venta}
      </p>

      {/* Botón */}
      <button disabled className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-3 w-full font-semibold transition">
        Agregar al carrito
      </button>
    </div>
  );
};

export default ProductCard;
