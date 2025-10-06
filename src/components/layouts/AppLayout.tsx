import { Outlet } from "react-router-dom";
import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";


const AppLayout = () => {
  const [isLoggedIn] = useState(false); //setIsLoggedIn
  const profileImage = "https://i.pravatar.cc/150?img=32";


  return (
    <>
      {/* Navbar */}
      <header className="hidden md:block">
        <nav className="fixed top-0 z-50 w-full bg-gray-900 border-b border-green-500 shadow-lg">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img
                src="/logo.jpg"
                alt="Movicrédito Logo"
                className="h-8 w-8 md:h-10 md:w-10 object-contain"
              />
              <span className="text-white font-bold text-xl tracking-wide">
                Movicrédito
              </span>
            </div>

            {/* Navegación */}
            <div className="flex gap-6 text-white font-medium items-center">
              <a href="/admin" className="hover:text-green-400 transition">Inicio</a>
              <a href="/admin/clientes" className="hover:text-green-400 transition">Clientes</a>
              <a href="/admin/catalogo" className="hover:text-green-400 transition">Catalogo</a>
              <a href="/admin/creditos" className="hover:text-green-400 transition">Créditos</a>
              <a href="/admin/reportes" className="hover:text-green-400 transition">Reportes</a>

              {/* Icono o foto de usuario */}
              {!isLoggedIn ? (
                <a href="/login" className="text-3xl hover:text-green-400 transition">
                  <FaUserCircle />
                </a>
              ) : (
                <img
                  src={profileImage}
                  alt="Perfil"
                  className="w-10 h-10 rounded-full border-2 border-green-500 cursor-pointer"
                />
              )}
            </div>

          </div>
        </nav>
      </header>


      <main className="pt-[70px] md:pt-[70px] w-full bg-gray-50 min-h-screen">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white border-t-4 border-green-500">
        <div className="container mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
          {/* Información de sucursales */}
          <div className="md:w-1/2">
            <h3 className="text-lg font-semibold mb-4 text-green-400">Nuestras Sucursales</h3>
            <div className="text-sm space-y-3 text-gray-300">
              <p><span className="font-semibold text-white">Teléfono:</span> +52 646 278 1997</p>
              <p><span className="font-semibold text-white">Zona Centro:</span> 206 Calle Sexta, Ensenada, BC</p>
              <p><span className="font-semibold text-white">Valle Dorado:</span> Blvd. Zertuche 937, Ensenada, BC</p>
              <p><span className="font-semibold text-white">Hidalgo:</span> Av. Diamante 2057, Ensenada, BC</p>
            </div>
          </div>

          {/* Mapa */}
          <div className="md:w-1/2 w-full h-60 md:h-44 rounded-lg overflow-hidden shadow-md border border-green-700">
            <iframe
              title="Mapa de ubicación"
              src="https://www.google.com/maps/d/u/0/embed?mid=12zu-u-wFLP80AqhFmDAMPwjnRexPOjg&ehbc=2E312F&noprof=1"
              width="100%"
              height="100%"
              allowFullScreen
              loading="lazy"
              className="border-0 w-full h-full"
            ></iframe>
          </div>
        </div>

        {/* Derechos */}
        <div className="bg-black text-center py-4 text-xs text-gray-400">
          © 2025 Movicrédito. Todos los derechos reservados. Powered by{" "}
          <span className="font-semibold text-green-400">SWS Souls Web Solutions</span>.
        </div>
      </footer>
    </>
  );
};

export default AppLayout;      

