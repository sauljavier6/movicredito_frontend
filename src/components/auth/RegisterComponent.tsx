import { useState } from "react";
import { FaUser, FaEnvelope, FaLock, FaPhone } from "react-icons/fa";

interface LoginProps {
  onBack?: (onBack: boolean) => void;
}

export default function RegisterComponent({ onBack }: LoginProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registro:", formData);
    // Aquí llamas tu API para registrar usuario
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-green-900">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo.jpg"
            alt="Movicrédito"
            className="w-16 h-16 mb-2"
          />
          <h1 className="text-2xl font-bold text-gray-800">Crear Cuenta</h1>
          <p className="text-gray-500 text-sm">Completa tus datos para registrarte</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>

          {/* Correo */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>

          {/* Teléfono */}
          <div className="relative">
            <FaPhone className="absolute left-3 top-3 text-gray-400" />
            <input
              type="tel"
              name="phone"
              placeholder="Teléfono"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>

          {/* Contraseña */}
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>

          {/* Confirmar contraseña */}
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>

          {/* Botón registro */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Crear Cuenta
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <a className="text-green-500 hover:text-green-600 font-medium" onClick={() => onBack?.(false)}>
            Inicia sesión
          </a>
        </div>
      </div>
    </div>
  );
}
