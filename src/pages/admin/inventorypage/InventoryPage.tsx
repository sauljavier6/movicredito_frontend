import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Pencil, Plus, RefreshCw, Search, X } from "lucide-react";
import Pagination from "../../../components/admin/shared/Pagination";

const API_URL = import.meta.env.VITE_API_URL || "";

type Product = { id:number; brand:string; model:string; storage:string; ram?:string; price:number|string; imageUrl?:string; supportsKnoxGuard:boolean; active:boolean };
type Summary = { productId:number; brand:string; model:string; storage:string; supportsKnoxGuard:boolean; total:number; available:number; reserved:number; assigned:number; locked:number; managed:number };
type ProductForm = { brand:string; model:string; storage:string; ram:string; price:string; imageUrl:string; supportsKnoxGuard:boolean };
const emptyProduct:ProductForm={brand:"",model:"",storage:"",ram:"",price:"",imageUrl:"",supportsKnoxGuard:false};
const emptyUnit={productId:"",imei:"",serial:"",color:"",knoxDeviceId:""};

export default function InventoryPage(){
  const token=sessionStorage.getItem("movicredito_token");
  const auth={Authorization:`Bearer ${token}`};
  const json={...auth,"Content-Type":"application/json"};
  const [products,setProducts]=useState<Product[]>([]);
  const [summary,setSummary]=useState<Summary[]>([]);
  const [search,setSearch]=useState("");
  const [productModal,setProductModal]=useState(false);
  const [unitModal,setUnitModal]=useState(false);
  const [editingId,setEditingId]=useState<number|null>(null);
  const [productForm,setProductForm]=useState<ProductForm>(emptyProduct);
  const [unitForm,setUnitForm]=useState(emptyUnit);
  const [message,setMessage]=useState<string|null>(null);
  const [error,setError]=useState<string|null>(null);
  const [page,setPage]=useState(1); const pageSize=10; const [total,setTotal]=useState(0);

  const load=async()=>{
    setError(null);
    const [p,s]=await Promise.all([
      fetch(`${API_URL}/api/products/admin?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search.trim())}`,{headers:auth}),
      fetch(`${API_URL}/api/devices/inventory-summary`,{headers:auth})
    ]);
    const pb=await p.json().catch(()=>[]);
    const sb=await s.json().catch(()=>[]);
    if(!p.ok||!s.ok){setError(pb?.message||sb?.message||"No fue posible cargar el inventario.");return;}
    setProducts(pb.items||[]);setTotal(pb.pagination?.total||0);
    setSummary(Array.isArray(sb)?sb:[]);
  };
  useEffect(()=>{const id=setTimeout(()=>void load(),250);return()=>clearTimeout(id);},[page,search]);

  const summaryMap=useMemo(()=>new Map(summary.map(x=>[x.productId,x])),[summary]);

  useEffect(()=>setPage(1),[search]);

  const openNewProduct=()=>{setEditingId(null);setProductForm(emptyProduct);setProductModal(true);setError(null);};
  const openEdit=(p:Product)=>{setEditingId(p.id);setProductForm({brand:p.brand,model:p.model,storage:p.storage,ram:p.ram||"",price:String(p.price),imageUrl:p.imageUrl||"",supportsKnoxGuard:!!p.supportsKnoxGuard});setProductModal(true);setError(null);};
  const saveProduct=async(e:FormEvent)=>{e.preventDefault();setError(null);const r=await fetch(editingId?`${API_URL}/api/products/${editingId}`:`${API_URL}/api/products`,{method:editingId?"PATCH":"POST",headers:json,body:JSON.stringify({...productForm,price:Number(productForm.price),ram:productForm.ram||null,imageUrl:productForm.imageUrl||null})});const b=await r.json().catch(()=>({}));if(!r.ok)return setError(b.message||"No fue posible guardar el modelo.");setProductModal(false);setMessage(editingId?"Modelo actualizado.":"Modelo agregado al inventario.");await load();};
  const toggle=async(p:Product)=>{const r=await fetch(`${API_URL}/api/products/${p.id}`,{method:"PATCH",headers:json,body:JSON.stringify({active:!p.active})});if(!r.ok){const b=await r.json().catch(()=>({}));return setError(b.message||"No fue posible cambiar la publicación.");}await load();};

  const openUnit=(p?:Product)=>{setUnitForm({...emptyUnit,productId:p?String(p.id):""});setUnitModal(true);setError(null);};
  const saveUnit=async(e:FormEvent)=>{e.preventDefault();const r=await fetch(`${API_URL}/api/devices`,{method:"POST",headers:json,body:JSON.stringify({...unitForm,productId:Number(unitForm.productId)})});const b=await r.json().catch(()=>({}));if(!r.ok)return setError(b.message||"No fue posible registrar la unidad.");setUnitModal(false);setMessage(`Unidad ${b.imei} agregada al inventario.`);await load();};

  return <section className="min-h-screen bg-[#f5f5f7] px-4 py-8 md:px-8"><div className="mx-auto max-w-7xl">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm text-black/40">Equipos</p><h1 className="mt-1 text-4xl font-semibold tracking-[-0.045em]">Inventario</h1><p className="mt-2 text-sm text-black/45">Modelos que ve el cliente y existencias disponibles para venta.</p></div><div className="flex gap-2"><button onClick={()=>void load()} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5"><RefreshCw size={17}/></button><button onClick={openNewProduct} className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white"><Plus size={16}/> Nuevo modelo</button></div></div>
    {message&&<div className="mt-5 rounded-2xl bg-white px-5 py-4 text-sm text-emerald-700 ring-1 ring-black/5">{message}</div>}
    {error&&!productModal&&!unitModal&&<div className="mt-5 rounded-2xl bg-white px-5 py-4 text-sm text-red-700 ring-1 ring-red-100">{error}</div>}
    <div className="mt-7 flex max-w-xl items-center gap-2 rounded-full bg-white p-1.5 shadow-sm ring-1 ring-black/5"><Search size={17} className="ml-3 text-black/30"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Marca, modelo o almacenamiento" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"/></div>
    <div className="mt-7 overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="bg-[#fafafa] text-xs uppercase tracking-wide text-black/35"><tr><th className="px-6 py-4">Modelo</th><th className="px-6 py-4">Precio</th><th className="px-6 py-4">Disponibles</th><th className="px-6 py-4">Reservados</th><th className="px-6 py-4">Total</th><th className="px-6 py-4">Publicación</th><th className="px-6 py-4">Acciones</th></tr></thead><tbody className="divide-y divide-black/5">{products.map(p=>{const s=summaryMap.get(p.id);return <tr key={p.id} className="hover:bg-black/[0.015]"><td className="px-6 py-4"><p className="font-medium">{p.brand} {p.model}</p><p className="text-xs text-black/40">{p.storage}{p.ram?` · ${p.ram} RAM`:""}{p.supportsKnoxGuard?" · Knox":""}</p></td><td className="px-6 py-4 font-medium">{Number(p.price).toLocaleString("es-MX",{style:"currency",currency:"MXN"})}</td><td className="px-6 py-4"><Count value={s?.available||0}/></td><td className="px-6 py-4">{s?.reserved||0}</td><td className="px-6 py-4">{s?.total||0}</td><td className="px-6 py-4"><span className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-xs">{p.active?"Visible":"Oculto"}</span></td><td className="px-6 py-4"><div className="flex gap-2"><button onClick={()=>openUnit(p)} className="rounded-full bg-black px-3 py-2 text-xs text-white">+ Unidad</button><button onClick={()=>openEdit(p)} className="rounded-full bg-[#f5f5f7] px-3 py-2 text-xs"><Pencil size={13}/></button><button onClick={()=>void toggle(p)} className="rounded-full bg-[#f5f5f7] px-3 py-2 text-xs">{p.active?"Ocultar":"Publicar"}</button></div></td></tr>})}{!products.length&&<tr><td colSpan={7} className="px-6 py-14 text-center text-black/35">No hay modelos en inventario.</td></tr>}</tbody></table></div><Pagination page={page} total={total} pageSize={pageSize} onPageChange={setPage}/></div>
  </div>
  {productModal&&<Modal title={editingId?"Editar modelo":"Nuevo modelo"} subtitle="Define lo que verá el cliente en el catálogo público." onClose={()=>setProductModal(false)}><form onSubmit={saveProduct} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Input label="Marca" value={productForm.brand} set={v=>setProductForm(x=>({...x,brand:v}))}/><Input label="Modelo" value={productForm.model} set={v=>setProductForm(x=>({...x,model:v}))}/><Input label="Almacenamiento" value={productForm.storage} set={v=>setProductForm(x=>({...x,storage:v}))}/><Input label="RAM" value={productForm.ram} set={v=>setProductForm(x=>({...x,ram:v}))}/><Input label="Precio MXN" type="number" value={productForm.price} set={v=>setProductForm(x=>({...x,price:v}))}/><Input label="URL de imagen" value={productForm.imageUrl} set={v=>setProductForm(x=>({...x,imageUrl:v}))}/></div><label className="flex gap-3 rounded-2xl bg-[#f5f5f7] p-4 text-sm"><input type="checkbox" checked={productForm.supportsKnoxGuard} onChange={e=>setProductForm(x=>({...x,supportsKnoxGuard:e.target.checked}))}/> Compatible con Knox Guard</label>{error&&<p className="text-sm text-red-600">{error}</p>}<Actions cancel={()=>setProductModal(false)} save="Guardar modelo"/></form></Modal>}
  {unitModal&&<Modal title="Agregar unidad física" subtitle="Registra un teléfono recibido. Permanecerá en Inventario hasta asignarse a un crédito." onClose={()=>setUnitModal(false)}><form onSubmit={saveUnit} className="space-y-4"><label className="block text-sm font-medium">Modelo<select required value={unitForm.productId} onChange={e=>setUnitForm(x=>({...x,productId:e.target.value}))} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 py-3"><option value="">Selecciona</option>{products.filter(p=>p.active).map(p=><option key={p.id} value={p.id}>{p.brand} {p.model} · {p.storage}</option>)}</select></label><div className="grid gap-4 sm:grid-cols-2"><Input label="IMEI" value={unitForm.imei} set={v=>setUnitForm(x=>({...x,imei:v}))}/><Input label="Serie" value={unitForm.serial} set={v=>setUnitForm(x=>({...x,serial:v}))}/><Input label="Color" value={unitForm.color} set={v=>setUnitForm(x=>({...x,color:v}))}/><Input label="Knox Device ID (opcional)" value={unitForm.knoxDeviceId} set={v=>setUnitForm(x=>({...x,knoxDeviceId:v}))}/></div>{error&&<p className="text-sm text-red-600">{error}</p>}<Actions cancel={()=>setUnitModal(false)} save="Agregar unidad"/></form></Modal>}
  </section>;
}
function Count({value}:{value:number}){return <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${value>0?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-600"}`}>{value>0?value:"Agotado"}</span>}
function Modal({title,subtitle,onClose,children}:{title:string;subtitle:string;onClose:()=>void;children:React.ReactNode}){return <div className="fixed inset-0 z-[70] grid place-items-center bg-black/30 p-4 backdrop-blur-sm"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-white p-6 shadow-2xl md:p-8"><div className="mb-6 flex justify-between"><div><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-1 text-sm text-black/45">{subtitle}</p></div><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#f5f5f7]"><X size={17}/></button></div>{children}</div></div>}
function Input({label,value,set,type="text"}:{label:string;value:string;set:(v:string)=>void;type?:string}){return <label className="block text-sm font-medium">{label}<input required={label==="Marca"||label==="Modelo"||label==="Almacenamiento"||label==="Precio MXN"||label==="IMEI"} type={type} min={type==="number"?"0":undefined} step={type==="number"?"0.01":undefined} value={value} onChange={e=>set(e.target.value)} className="mt-2 w-full rounded-2xl border border-black/10 bg-[#f5f5f7] px-4 py-3 outline-none focus:bg-white"/></label>}
function Actions({cancel,save}:{cancel:()=>void;save:string}){return <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={cancel} className="rounded-full px-5 py-3 text-sm text-black/55">Cancelar</button><button className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white">{save}</button></div>}
