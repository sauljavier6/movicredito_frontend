import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaSpinner } from "react-icons/fa";

type Product = {
  ID_Catalogo_Equipo: number;
  Marca: string;
  Modelo: string;
  Precio_Venta: number;
};

type FormValues = {
  fullName: string;
  email: string; 
  phone: string;
  address: string;
  idNumber: string;
  productId: number;
  downPayment: number;
  termMonths: number;
  monthlyIncome: number;
  idDocument?: FileList;
  incomeProof?: FileList;
  agreeBlocking: boolean;
};

const schema: yup.ObjectSchema<FormValues> = yup
  .object({
    fullName: yup.string().required("Nombre completo es requerido"),
    email: yup.string().email("Email inválido").required("Email requerido"),
    phone: yup.string().required("Teléfono requerido"),
    address: yup.string().required("Dirección requerida"),
    idNumber: yup.string().required("Identificación requerida"),
    productId: yup.number().required("Selecciona un equipo").typeError("Selecciona un equipo"),
    downPayment: yup
      .number()
      .min(0, "El enganche no puede ser negativo")
      .required("Ingresa el enganche"),
    termMonths: yup
      .number()
      .oneOf([6, 12, 18, 24, 36], "Plazo inválido")
      .required("Selecciona un plazo"),
    monthlyIncome: yup.number().min(0, "Ingresos inválidos").required("Ingresa tus ingresos"),
    idDocument: yup.mixed<FileList>().optional(),
    incomeProof: yup.mixed<FileList>().optional(),
    agreeBlocking: yup
      .boolean()
      .oneOf([true], "Debes aceptar que el dispositivo puede ser bloqueado por impago")
      .required("Debes aceptar que el dispositivo puede ser bloqueado por impago"),
  })
  .required();


const sampleProducts: Product[] = [
  { ID_Catalogo_Equipo: 1, Marca: "Xiaomi", Modelo: "Redmi Note 8", Precio_Venta: 4500 },
  { ID_Catalogo_Equipo: 2, Marca: "Samsung", Modelo: "Galaxy A52", Precio_Venta: 7200 },
  { ID_Catalogo_Equipo: 3, Marca: "Apple", Modelo: "iPhone 13", Precio_Venta: 15999 },
];

export default function ApplicationForm() {
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {register,control,handleSubmit,reset,formState: { errors },} = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      idNumber: "",
      productId: sampleProducts[0].ID_Catalogo_Equipo,
      downPayment: 0,
      termMonths: 12,
      monthlyIncome: 0,
      agreeBlocking: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      // Prepara FormData para incluir archivos
      const fd = new FormData();
      fd.append("fullName", data.fullName);
      fd.append("email", data.email);
      fd.append("phone", data.phone);
      fd.append("address", data.address);
      fd.append("idNumber", data.idNumber);
      fd.append("productId", String(data.productId));
      fd.append("downPayment", String(data.downPayment));
      fd.append("termMonths", String(data.termMonths));
      fd.append("monthlyIncome", String(data.monthlyIncome));
      fd.append("agreeBlocking", data.agreeBlocking ? "1" : "0");

      if (data.idDocument && data.idDocument.length > 0) {
        fd.append("idDocument", data.idDocument[0]);
      }
      if (data.incomeProof && data.incomeProof.length > 0) {
        fd.append("incomeProof", data.incomeProof[0]);
      }

      // Llamada a tu API (ajusta la URL)
      const resp = await fetch("/api/credit/apply", {
        method: "POST",
        body: fd,
        // no set headers; browser manejara multipart/form-data
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ message: "Error en el servidor" }));
        throw new Error(err.message || "Error en la solicitud");
      }

      const body = await resp.json();
      setSuccessMessage("Solicitud enviada correctamente. ID: " + (body.applicationId ?? "—"));
      reset();
    } catch (e: any) {
      setServerError(e.message || "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-gray-900 ">
      <div className="max-w-3xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-green-400 mb-4">Solicitud de Crédito</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">Nombre completo</label>
              <input
                {...register("fullName")}
                className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-red-400 mt-1">{errors.fullName?.message}</p>
            </div>

            <div>
              <label className="text-sm text-gray-300">Correo electrónico</label>
              <input
                {...register("email")}
                type="email"
                className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-red-400 mt-1">{errors.email?.message}</p>
            </div>

            <div>
              <label className="text-sm text-gray-300">Teléfono</label>
              <input
                {...register("phone")}
                className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-red-400 mt-1">{errors.phone?.message}</p>
            </div>

            <div>
              <label className="text-sm text-gray-300">Dirección</label>
              <input
                {...register("address")}
                className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-red-400 mt-1">{errors.address?.message}</p>
            </div>

            <div>
              <label className="text-sm text-gray-300">Identificación (RFC/ID/IMEI opc.)</label>
              <input
                {...register("idNumber")}
                className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-red-400 mt-1">{errors.idNumber?.message}</p>
            </div>

            <div>
              <label className="text-sm text-gray-300">Ingresos mensuales</label>
              <input
                {...register("monthlyIncome")}
                type="number"
                className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-red-400 mt-1">{errors.monthlyIncome?.message}</p>
            </div>
          </div>

          <hr className="border-gray-700 my-2" />

          {/* Selección de equipo y condiciones */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm text-gray-300">Equipo</label>
              <Controller
                control={control}
                name="productId"
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-green-500"
                  >
                    {sampleProducts.map((p) => (
                      <option key={p.ID_Catalogo_Equipo} value={p.ID_Catalogo_Equipo}>
                        {p.Marca} {p.Modelo} — ${p.Precio_Venta.toLocaleString()}
                      </option>
                    ))}
                  </select>
                )}
              />
              <p className="text-xs text-red-400 mt-1">{errors.productId?.message}</p>
            </div>

            <div>
              <label className="text-sm text-gray-300">Enganche</label>
              <input
                {...register("downPayment")}
                type="number"
                className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-red-400 mt-1">{errors.downPayment?.message}</p>
            </div>

            <div>
              <label className="text-sm text-gray-300">Plazo (meses)</label>
              <Controller
                control={control}
                name="termMonths"
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full mt-1 p-2 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-green-500"
                  >
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={18}>18</option>
                    <option value={24}>24</option>
                    <option value={36}>36</option>
                  </select>
                )}
              />
              <p className="text-xs text-red-400 mt-1">{errors.termMonths?.message}</p>
            </div>
          </div>

          {/* Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">Documento de identidad (jpg/pdf)</label>
              <input
                {...register("idDocument")}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="w-full mt-1 text-sm text-gray-200"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Comprobante de ingresos (opcional)</label>
              <input
                {...register("incomeProof")}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="w-full mt-1 text-sm text-gray-200"
              />
            </div>
          </div>

          {/* Consentimiento bloqueo */}
          <div className="flex items-start gap-3">
            <input {...register("agreeBlocking")} type="checkbox" className="mt-1" />
            <div>
              <p className="text-sm text-gray-300">
                Entiendo y acepto que, en caso de incumplimiento de pago, el dispositivo puede ser bloqueado
                remotamente por Movicrédito según lo especificado en mi contrato.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                (La aceptación es obligatoria para continuar.)
              </p>
              <p className="text-xs text-red-400 mt-1">{errors.agreeBlocking?.message}</p>
            </div>
          </div>

          {/* Errores y estados */}
          {serverError && <p className="text-sm text-red-400">{serverError}</p>}
          {successMessage && <p className="text-sm text-green-400">{successMessage}</p>}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                reset();
                setServerError(null);
                setSuccessMessage(null);
              }}
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
            >
              Limpiar
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded bg-green-600 hover:bg-green-700 disabled:opacity-60 flex items-center gap-2"
            >
              {submitting && <FaSpinner className="animate-spin" />}
              <span>{submitting ? "Enviando..." : "Solicitar Crédito"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
