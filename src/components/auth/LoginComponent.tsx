import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function LoginComponent() {
  const navigate = useNavigate();
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [remember,setRemember]=useState(true); const [challengeId,setChallengeId]=useState<string|null>(null);
  const [emailMasked,setEmailMasked]=useState(""); const [code,setCode]=useState("");
  const [loading,setLoading]=useState(false); const [error,setError]=useState<string|null>(null);

  const finish=(body:any)=>{sessionStorage.setItem("movicredito_token",body.token);sessionStorage.setItem("movicredito_user",JSON.stringify(body.user));navigate("/admin");};

  const handleSubmit=async(event:React.FormEvent)=>{
    event.preventDefault();setLoading(true);setError(null);
    try{
      const url=challengeId?"/api/auth/verify-login":"/api/auth/login";
      const payload=challengeId?{challengeId,code}:{email,password,remember};
      const response=await fetch(`${API_URL}${url}`,{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const body=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(body.message||"No fue posible iniciar sesión.");
      if(body.requiresVerification){setChallengeId(body.challengeId);setEmailMasked(body.emailMasked||email);setCode("");return;}
      finish(body);
    }catch(err){setError((err as Error).message||"No fue posible iniciar sesión.");}
    finally{setLoading(false);}
  };

  return <section className="mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-6xl items-center gap-12 px-6 py-14 lg:grid-cols-[1.05fr_.95fr] lg:px-10">
    <div className="hidden lg:block"><div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3.5 py-2 text-xs font-medium text-black/55 shadow-sm"><ShieldCheck size={14}/> Acceso administrativo protegido</div><h1 className="mt-7 max-w-xl text-6xl font-semibold tracking-[-0.055em] text-[#1d1d1f]">Control claro para una operación financiera seria.</h1><p className="mt-6 max-w-lg text-lg leading-8 text-black/50">Gestiona solicitudes, créditos, pagos, inventario y dispositivos desde un solo lugar.</p></div>
    <div className="rounded-[32px] border border-black/5 bg-white p-7 shadow-[0_30px_90px_rgba(0,0,0,0.08)] sm:p-10">
      <p className="text-sm font-medium text-black/40">MoviCrédito Admin</p><h2 className="mt-2 text-4xl font-semibold tracking-[-0.045em] text-[#1d1d1f]">{challengeId?"Verifica tu acceso":"Inicia sesión"}</h2>
      <p className="mt-3 text-sm leading-6 text-black/45">{challengeId?`Enviamos un código de 6 dígitos a ${emailMasked}.`:"Usa una cuenta administrativa autorizada."}</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {!challengeId?<><label className="block"><span className="mb-2 block text-sm font-medium text-black/60">Correo electrónico</span><div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-[#f5f5f7] px-4"><Mail size={18} className="text-black/35"/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="h-14 w-full bg-transparent text-sm outline-none" autoComplete="email" required/></div></label>
        <label className="block"><span className="mb-2 block text-sm font-medium text-black/60">Contraseña</span><div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-[#f5f5f7] px-4"><LockKeyhole size={18} className="text-black/35"/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="h-14 w-full bg-transparent text-sm outline-none" autoComplete="current-password" required/></div></label>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-black/60"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} className="h-4 w-4"/> Recordarme en este equipo</label></>
        :<label className="block"><span className="mb-2 block text-sm font-medium text-black/60">Código de seguridad</span><input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))} className="h-16 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 text-center text-2xl font-semibold tracking-[0.35em] outline-none" autoComplete="one-time-code" required/></label>}
        {error&&<div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <button type="submit" disabled={loading} className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-black px-5 text-sm font-medium text-white disabled:opacity-50">{loading?"Validando…":challengeId?"Verificar y entrar":"Continuar"} {!loading&&<ArrowRight size={17}/>}</button>
        {challengeId&&<button type="button" onClick={()=>{setChallengeId(null);setCode("");setError(null)}} className="w-full text-sm text-black/45">Volver al inicio de sesión</button>}
      </form>
      <p className="mt-6 text-center text-xs leading-5 text-black/35">El acceso se registra y está sujeto a los permisos asignados a cada usuario.</p>
    </div>
  </section>;
}
