import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";

  interface LoginProps {
    onRegister?: (register: boolean) => void;
  }

export default function LoginComponent({ onRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login con:", { email, password });
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
          <h1 className="text-2xl font-bold text-gray-800">Movicrédito</h1>
          <p className="text-gray-500 text-sm">Accede a tu cuenta</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="relative">
            <FaUser className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              required
            />
          </div>

          {/* Botón login */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Iniciar sesión
          </button>
        </form>

        {/* Extras */}
        <div className="flex justify-between text-sm text-gray-500 mt-4">
          <a href="/recuperar" className="hover:text-green-600">
            ¿Olvidaste tu contraseña?
          </a>
          <a className="hover:text-green-600" onClick={() => onRegister?.(true)}>
            Crear cuenta
          </a>
        </div>
      </div>
    </div>
  );
}
