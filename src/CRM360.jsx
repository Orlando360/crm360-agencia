import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

// ═══════════════════════════════════════════════════════════════════
//  CRM 360™ AGENCIA — Orlando Iguarán
//  Módulos: Dashboard · Clientes · Contenido · Pautas · Finanzas · Equipo · IA
// ═══════════════════════════════════════════════════════════════════

const G     = "#F5C518";
const BG    = "#0C0C0E";
const S1    = "#141418";
const S2    = "#1C1C22";
const GREEN = "#34D399";
const RED   = "#F87171";
const BLUE  = "#60A5FA";
const PURPLE= "#A78BFA";
const ORANGE= "#FB923C";

async function callClaude(system, user) {
  try {
    const r = await fetch("/api/claude", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-5-20251001", max_tokens:1000, system, messages:[{role:"user",content:user}] })
    });
    const d = await r.json();
    return d.content?.[0]?.text || "Sin respuesta.";
  } catch { return "Error de conexión con la API."; }
}

// ─── PILARES ────────────────────────────────────────────────────────
const PILARES = ["marca","ventas","marketing","operaciones","finanzas","equipo","clientes","tecnologia","estrategia"];
const PL = {marca:"Marca",ventas:"Ventas",marketing:"Mktg",operaciones:"Ops",finanzas:"Finanzas",equipo:"Equipo",clientes:"Clientes",tecnologia:"Tech",estrategia:"Estrategia"};

// ─── DATA DEMO ───────────────────────────────────────────────────────
const HOY = new Date().toISOString().split("T")[0];
const semana = (offset=0) => {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
};

const CLIENTES_INIT = [
  {
    id:"c1", nombre:"Di Lusso", sector:"Moda · Retail", contacto:"Carlos Álvarez",
    email:"carlos@dilusso.co", wa:"+573000000001", ingresos:"$150M–$300M",
    color:"#A78BFA", fase:"Activo", score:62,
    scores:{marca:70,ventas:55,marketing:60,operaciones:65,finanzas:58,equipo:72,clientes:60,tecnologia:45,estrategia:68},
    // CONTRATO
    contrato:8500000, pagado:8500000, inicio:"2025-09-01", tipoServicio:"Estrategia Digital + Alianzas",
    resumen:"Multimarca premium 267K seguidores. Canalización vs Monastery y SBQ.",
    notas:"Alto potencial upsell campaña influencers.",
    // CONTENIDO SEMANAL
    contenido:[
      {id:"co1",semana:semana(-7),tipo:"Reels",descripcion:"3 Reels colección nueva temporada",estado:"publicado",responsable:"Ana García",observacion:"Buen engagement"},
      {id:"co2",semana:semana(0), tipo:"Carrusel",descripcion:"Carrusel comparativo multimarca",estado:"en produccion",responsable:"Ana García",observacion:""},
      {id:"co3",semana:semana(0), tipo:"Stories",descripcion:"5 stories behind the scenes",estado:"aprobado",responsable:"Luis Torres",observacion:""},
      {id:"co4",semana:semana(7), tipo:"Reels",descripcion:"Colaboración con influencer TikTok",estado:"pendiente",responsable:"Ana García",observacion:""},
    ],
    // PAUTAS
    pautas:[
      {id:"p1",plataforma:"Meta Ads",presupuesto:2000000,gastado:2000000,inicio:"2025-10-01",fin:"2025-10-31",objetivo:"Tráfico web",resultado:"4.200 clics / CPC $476",estado:"finalizada"},
      {id:"p2",plataforma:"Instagram",presupuesto:1500000,gastado:800000,inicio:semana(-14),fin:semana(14),objetivo:"Reconocimiento marca",resultado:"En curso",estado:"activa"},
    ],
    // ENTREGABLES
    entregables:[
      {id:"e1",nombre:"Auditoría canales digitales",estado:"entregado",fecha:"2025-10-01",tipo:"Informe"},
      {id:"e2",nombre:"Estrategia TikTok Q1 2026",estado:"en proceso",fecha:"2026-01-15",tipo:"Estrategia"},
      {id:"e3",nombre:"Propuesta alianza influencer",estado:"pendiente",fecha:"2026-02-01",tipo:"Propuesta"},
    ],
    alertas:[],
  },
  {
    id:"c2", nombre:"The Grill Station", sector:"Restaurantes", contacto:"Alejo Mesa",
    email:"alejo@grillstation.co", wa:"+573000000002", ingresos:"$20M–$50M",
    color:"#34D399", fase:"Entregado", score:71,
    scores:{marca:75,ventas:70,marketing:65,operaciones:60,finanzas:72,equipo:80,clientes:75,tecnologia:55,estrategia:70},
    contrato:4500000, pagado:4500000, inicio:"2025-08-15", tipoServicio:"Diagnóstico 360™ Completo",
    resumen:"Plan 2 nuevas sedes. Reto crítico: estandarización operacional.",
    notas:"Potencial renovación apertura sedes.",
    contenido:[
      {id:"co5",semana:semana(-7),tipo:"Reels",descripcion:"Reel menú destacado semana",estado:"publicado",responsable:"Luis Torres",observacion:""},
      {id:"co6",semana:semana(0), tipo:"Stories",descripcion:"Detrás de cámaras cocina",estado:"pendiente",responsable:"Luis Torres",observacion:""},
    ],
    pautas:[
      {id:"p3",plataforma:"Google Ads",presupuesto:800000,gastado:800000,inicio:"2025-09-01",fin:"2025-09-30",objetivo:"Reservas",resultado:"120 reservas / CPA $6.667",estado:"finalizada"},
    ],
    entregables:[
      {id:"e4",nombre:"Diagnóstico 360™ completo",estado:"entregado",fecha:"2025-09-30",tipo:"Diagnóstico"},
      {id:"e5",nombre:"Plan estandarización operacional",estado:"entregado",fecha:"2025-10-15",tipo:"Estrategia"},
      {id:"e6",nombre:"Kit expansión 2 sedes",estado:"pendiente",fecha:"2026-03-01",tipo:"Consultoría"},
    ],
    alertas:["Apertura nueva sede Q2 — oportunidad renovación"],
  },
  {
    id:"c3", nombre:"Fraterna Catering", sector:"Catering · Eventos", contacto:"Leo",
    email:"leo@fraternacatering.co", wa:"+573000000003", ingresos:"$10M–$20M",
    color:"#F5C518", fase:"Activo", score:55,
    scores:{marca:50,ventas:60,marketing:45,operaciones:65,finanzas:55,equipo:60,clientes:58,tecnologia:35,estrategia:52},
    contrato:3500000, pagado:1750000, inicio:"2025-11-01", tipoServicio:"Estrategia + Contenido Mensual",
    resumen:"Catering B2B, 6 bloques estratégicos. Plan 30-60-90 en ejecución.",
    notas:"Pago pendiente 50%. Seguimiento urgente.",
    contenido:[
      {id:"co7",semana:semana(-7),tipo:"Carrusel",descripcion:"Portafolio menús corporativos",estado:"publicado",responsable:"Ana García",observacion:""},
      {id:"co8",semana:semana(0), tipo:"Reels",descripcion:"Montaje evento empresarial",estado:"en produccion",responsable:"Ana García",observacion:"Pendiente aprobación cliente"},
      {id:"co9",semana:semana(7), tipo:"Stories",descripcion:"Testimonios clientes",estado:"pendiente",responsable:"Luis Torres",observacion:""},
    ],
    pautas:[],
    entregables:[
      {id:"e7",nombre:"PDF Estrategia completa",estado:"entregado",fecha:"2025-11-15",tipo:"Estrategia"},
      {id:"e8",nombre:"Deck 10 slides presentación",estado:"entregado",fecha:"2025-11-20",tipo:"Presentación"},
      {id:"e9",nombre:"Review 60 días",estado:"pendiente",fecha:"2026-01-01",tipo:"Consultoría"},
    ],
    alertas:["⚠ Pago pendiente $1.750.000 COP"],
  },
  {
    id:"c4", nombre:"The Buy Squad", sector:"E-commerce · Cosmética", contacto:"Por definir",
    email:"info@thebuysquad.co", wa:"+573000000004", ingresos:"$5M–$10M",
    color:"#60A5FA", fase:"Propuesta", score:0,
    scores:Object.fromEntries(PILARES.map(p=>[p,0])),
    contrato:6000000, pagado:0, inicio:null, tipoServicio:"Diagnóstico 360™ + Estrategia Digital",
    resumen:"Prospect: reventa cosméticos premium USA→Colombia. Propuesta enviada.",
    notas:"$6M propuesta enviada. Sin respuesta en 5 días.",
    contenido:[], pautas:[],
    entregables:[
      {id:"e10",nombre:"Propuesta comercial",estado:"enviado",fecha:semana(-5),tipo:"Propuesta"},
    ],
    alertas:["🎯 Lead caliente — sin respuesta 5 días"],
  },
];

const EQUIPO_INIT = [
  {id:"eq1",nombre:"Ana García",rol:"Content Creator",especialidad:"Video · Fotografía",
   email:"ana@orlando360.co",pago:2500000,tipoPago:"Mensual fijo",estado:"activo",
   clientes:["c1","c3"],color:"#A78BFA",
   pagos:[
     {id:"pg1",mes:"Noviembre 2025",monto:2500000,estado:"pagado",fecha:"2025-11-30"},
     {id:"pg2",mes:"Diciembre 2025",monto:2500000,estado:"pagado",fecha:"2025-12-31"},
     {id:"pg3",mes:"Enero 2026",monto:2500000,estado:"pendiente",fecha:"2026-01-31"},
   ]},
  {id:"eq2",nombre:"Luis Torres",rol:"Social Media Manager",especialidad:"Community · Ads",
   email:"luis@orlando360.co",pago:2000000,tipoPago:"Mensual fijo",estado:"activo",
   clientes:["c1","c2","c3"],color:"#34D399",
   pagos:[
     {id:"pg4",mes:"Noviembre 2025",monto:2000000,estado:"pagado",fecha:"2025-11-30"},
     {id:"pg5",mes:"Diciembre 2025",monto:2000000,estado:"pagado",fecha:"2025-12-31"},
     {id:"pg6",mes:"Enero 2026",monto:2000000,estado:"pendiente",fecha:"2026-01-31"},
   ]},
  {id:"eq3",nombre:"Marcela Ruiz",rol:"Diseñadora Gráfica",especialidad:"Branding · Motion",
   email:"marcela@orlando360.co",pago:1800000,tipoPago:"Por proyecto",estado:"activo",
   clientes:["c1","c2"],color:"#FB923C",
   pagos:[
     {id:"pg7",mes:"Noviembre 2025",monto:1800000,estado:"pagado",fecha:"2025-11-30"},
     {id:"pg8",mes:"Diciembre 2025",monto:0,estado:"sin trabajo",fecha:""},
     {id:"pg9",mes:"Enero 2026",monto:1800000,estado:"pendiente",fecha:"2026-01-31"},
   ]},
  {id:"eq4",nombre:"Camilo Estrada",rol:"Media Buyer",especialidad:"Meta Ads · Google Ads",
   email:"camilo@orlando360.co",pago:1500000,tipoPago:"Por cliente activo",estado:"activo",
   clientes:["c1"],color:"#60A5FA",
   pagos:[
     {id:"pg10",mes:"Noviembre 2025",monto:1500000,estado:"pagado",fecha:"2025-11-30"},
     {id:"pg11",mes:"Diciembre 2025",monto:1500000,estado:"pagado",fecha:"2025-12-31"},
     {id:"pg12",mes:"Enero 2026",monto:1500000,estado:"pendiente",fecha:"2026-01-31"},
   ]},
];

// ─── HELPERS ─────────────────────────────────────────────────────────
const sc = s => s>=70?GREEN:s>=50?G:s===0?"#555":RED;
const sl = s => s>=85?"ÉLITE":s>=70?"SÓLIDO":s>=50?"EN DESARROLLO":s===0?"SIN DIAG.":"ZONA CRÍTICA";
const fc = {Activo:GREEN,Entregado:"#94A3B8",Propuesta:G,Pausado:RED};
const fmt = n => n===0?"$0":n>=1000000?`$${(n/1000000).toFixed(n%1000000===0?0:1)}M`:`$${(n/1000).toFixed(0)}K`;

const ESTADO_CONTENIDO = {
  publicado:{c:GREEN,l:"Publicado"},
  aprobado:{c:BLUE,l:"Aprobado"},
  "en produccion":{c:G,l:"En producción"},
  pendiente:{c:"rgba(255,255,255,0.3)",l:"Pendiente"},
  rechazado:{c:RED,l:"Rechazado"},
};
const ESTADO_ENTREGABLE = {
  entregado:{c:GREEN,l:"Entregado"},
  "en proceso":{c:G,l:"En proceso"},
  pendiente:{c:"rgba(255,255,255,0.3)",l:"Pendiente"},
  enviado:{c:BLUE,l:"Enviado"},
  revision:{c:ORANGE,l:"En revisión"},
};
const ESTADO_PAUTA = {
  activa:{c:GREEN,l:"Activa"},
  finalizada:{c:"rgba(255,255,255,0.3)",l:"Finalizada"},
  pausada:{c:G,l:"Pausada"},
  planificada:{c:BLUE,l:"Planificada"},
};
const PAGO_ESTADO = {
  pagado:{c:GREEN,l:"Pagado"},
  pendiente:{c:RED,l:"Pendiente"},
  "sin trabajo":{c:"rgba(255,255,255,0.2)",l:"Sin trabajo"},
};

// ─── SUB-COMPONENTES ─────────────────────────────────────────────────

function Gauge({val,size=80,stroke=6,color=G}) {
  const r=(size-stroke*2)/2, circ=2*Math.PI*r;
  const dash=circ*(Math.min(Math.max(val,0),100)/100);
  const cx=size/2, cy=size/2;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{transition:"stroke-dasharray .7s cubic-bezier(.4,0,.2,1)"}}/>
    </svg>
  );
}

function Radar({scores,size=130}) {
  const cx=size/2, cy=size/2, r=size*0.35;
  const ang=i=>(Math.PI*2*i/PILARES.length)-Math.PI/2;
  const poly=PILARES.map((p,i)=>{const a=ang(i),rv=((scores[p]||0)/100)*r; return `${cx+rv*Math.cos(a)},${cy+rv*Math.sin(a)}`}).join(" ");
  return (
    <svg width={size} height={size} style={{overflow:"visible"}}>
      {[25,50,75,100].map(v=>(
        <polygon key={v} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"
          points={PILARES.map((_,i)=>{const a=ang(i),rv=(v/100)*r; return `${cx+rv*Math.cos(a)},${cy+rv*Math.sin(a)}`}).join(" ")}/>
      ))}
      {PILARES.map((_,i)=>{
        const [x2,y2]=[cx+r*Math.cos(ang(i)),cy+r*Math.sin(ang(i))];
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>;
      })}
      <polygon points={poly} fill={`${G}15`} stroke={G} strokeWidth="1.5"/>
      {PILARES.map((p,i)=>{
        const a=ang(i), lx=cx+(r+15)*Math.cos(a), ly=cy+(r+15)*Math.sin(a);
        return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.3)" fontSize="6.5" fontFamily="Inter,sans-serif">{PL[p]}</text>;
      })}
    </svg>
  );
}

const Spin = ({sz=16}) => (
  <div style={{width:sz,height:sz,border:`2px solid rgba(245,197,24,0.12)`,borderTop:`2px solid ${G}`,
    borderRadius:"50%",animation:"spin .7s linear infinite",flexShrink:0}}/>
);

// ═══════════════════════════════════════════════════════════════════
//  APP PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
export default function CRM360() {
  const [clientes,setClientes]   = useState(CLIENTES_INIT);
  const [equipo,setEquipo]       = useState(EQUIPO_INIT);
  const [vista,setVista]         = useState("dashboard");
  const [sel,setSel]             = useState(null);           // cliente seleccionado
  const [selEq,setSelEq]         = useState(null);           // miembro equipo seleccionado
  const [panelTab,setPanelTab]   = useState("resumen");
  const [filtroFase,setFiltroFase] = useState("Todos");
  const [busq,setBusq]           = useState("");
  const [chat,setChat]           = useState([]);
  const [chatInp,setChatInp]     = useState("");
  const [chatLoad,setChatLoad]   = useState(false);
  const [iaGlobal,setIaGlobal]   = useState("");
  const [iaLoad,setIaLoad]       = useState(false);
  const [modal,setModal]         = useState(null);  // "cliente"|"equipo"|"contenido"|"pauta"|"entregable"
  const [modalData,setModalData] = useState({});
  const [stagger,setStagger]     = useState(false);
  const chatRef = useRef(null);

  useEffect(()=>{ setTimeout(()=>setStagger(true),50); },[]);
  useEffect(()=>{ if(chatRef.current) chatRef.current.scrollTop=chatRef.current.scrollHeight; },[chat]);

  // ─── Supabase: carga inicial ─────────────────────────────────────
  useEffect(()=>{
    async function cargar() {
      const { data: dc } = await supabase.from("clientes").select("*");
      if(dc && dc.length>0) setClientes(dc);
      const { data: de } = await supabase.from("equipo").select("*");
      if(de && de.length>0) setEquipo(de);
    }
    cargar();
  },[]);

  // ─── Supabase: guardar clientes al mutar ─────────────────────────
  useEffect(()=>{
    clientes.forEach(c=>{
      supabase.from("clientes").upsert(c).then(()=>{});
    });
  },[clientes]);

  useEffect(()=>{
    equipo.forEach(e=>{
      supabase.from("equipo").upsert(e).then(()=>{});
    });
  },[equipo]);

  // ─── KPIs globales ──────────────────────────────────────────────
  const activos       = clientes.filter(c=>c.fase==="Activo").length;
  const facturadoT    = clientes.reduce((a,c)=>a+c.contrato,0);
  const cobradoT      = clientes.reduce((a,c)=>a+c.pagado,0);
  const pendienteT    = facturadoT-cobradoT;
  const scoreProm     = clientes.filter(c=>c.score>0).length
    ? Math.round(clientes.filter(c=>c.score>0).reduce((a,c)=>a+c.score,0)/clientes.filter(c=>c.score>0).length) : 0;
  const alertCount    = clientes.reduce((a,c)=>a+c.alertas.length,0);
  const costoEquipoMes= equipo.reduce((a,e)=>a+e.pago,0);
  const contenidoSemana = clientes.flatMap(c=>c.contenido.filter(co=>co.semana>=semana(-3)&&co.semana<=semana(7)));
  const pautasActivas = clientes.flatMap(c=>c.pautas.filter(p=>p.estado==="activa"));
  const presupuestoPautas = pautasActivas.reduce((a,p)=>a+p.presupuesto,0);
  const pendienteEquipo = equipo.flatMap(e=>e.pagos.filter(p=>p.estado==="pendiente")).reduce((a,p)=>a+p.monto,0);

  // ─── Filtros clientes ────────────────────────────────────────────
  const clientesFilt = clientes.filter(c=>{
    const f=filtroFase==="Todos"||c.fase===filtroFase;
    const s=c.nombre.toLowerCase().includes(busq.toLowerCase())||c.sector.toLowerCase().includes(busq.toLowerCase());
    return f&&s;
  });

  // ─── Acciones panel cliente ──────────────────────────────────────
  const abrirCliente = c => { setSel(c); setSelEq(null); setPanelTab("resumen"); setChat([]); };
  const abrirEquipo  = e => { setSelEq(e); setSel(null); };

  const mutarCliente = (id, fn) => {
    setClientes(prev => prev.map(c => c.id===id ? fn(c) : c));
    if(sel?.id===id) setSel(prev => fn(prev));
  };

  const cicloEstadoContenido = (cid,coid) => {
    const ciclo={pendiente:"en produccion","en produccion":"aprobado",aprobado:"publicado",publicado:"pendiente"};
    mutarCliente(cid, c=>({...c,contenido:c.contenido.map(co=>co.id!==coid?co:{...co,estado:ciclo[co.estado]||"pendiente"})}));
  };
  const cicloEstadoEntregable = (cid,eid) => {
    const ciclo={pendiente:"en proceso","en proceso":"revision",revision:"entregado",entregado:"pendiente",enviado:"entregado"};
    mutarCliente(cid, c=>({...c,entregables:c.entregables.map(e=>e.id!==eid?e:{...e,estado:ciclo[e.estado]||"pendiente"})}));
  };

  // ─── Chat IA por cliente ────────────────────────────────────────
  const enviarChat = async () => {
    if(!chatInp.trim()||!sel) return;
    const msg=chatInp.trim(); setChatInp(""); setChat(m=>[...m,{r:"user",t:msg}]); setChatLoad(true);
    const ctx=`Cliente: ${sel.nombre} | Score: ${sel.score}/100 | Fase: ${sel.fase}\nServicio: ${sel.tipoServicio}\nResumen: ${sel.resumen}\nNotas: ${sel.notas}\nContenido semana: ${sel.contenido.filter(c=>c.semana>=semana(-3)).length} piezas\nPautas activas: ${sel.pautas.filter(p=>p.estado==="activa").length}\nEntregables pendientes: ${sel.entregables.filter(e=>e.estado==="pendiente").length}`;
    const resp = await callClaude("Eres el asistente estratégico de Orlando Iguarán 360. Analista de agencia de marketing, responde sobre clientes. Directo, máx 150 palabras.",`${ctx}\n\nPregunta: ${msg}`);
    setChat(m=>[...m,{r:"ai",t:resp}]); setChatLoad(false);
  };

  // ─── IA Cartera ─────────────────────────────────────────────────
  const analizarCartera = async () => {
    setIaLoad(true); setVista("ia");
    const res=clientes.map(c=>`${c.nombre} (${c.sector}) — Score: ${c.score}/100 — ${c.fase} — ${fmt(c.contrato)} — Contenido: ${c.contenido.filter(co=>co.estado!=="publicado").length} piezas pendientes — Pautas activas: ${c.pautas.filter(p=>p.estado==="activa").length}`).join("\n");
    const r = await callClaude(
      "Eres Orlando Iguarán, consultor estratégico y director de agencia en Colombia. Directo, ejecutivo, máx 280 palabras.",
      `Analiza esta cartera de agencia:\n\n${res}\n\nEntrega: 1) Estado general de la operación, 2) Cliente que más atención necesita esta semana, 3) Riesgo de churn, 4) Oportunidad de upsell inmediata, 5) Una acción concreta para los próximos 3 días.`
    );
    setIaGlobal(r); setIaLoad(false);
  };

  // ─── Agregar desde modal ─────────────────────────────────────────
  const guardarModal = () => {
    if(!modal) return;
    if(modal==="contenido" && sel) {
      const nuevo={id:`co${Date.now()}`,semana:modalData.semana||HOY,tipo:modalData.tipo||"Reels",
        descripcion:modalData.descripcion||"Sin descripción",estado:"pendiente",
        responsable:modalData.responsable||"—",observacion:modalData.observacion||""};
      mutarCliente(sel.id, c=>({...c,contenido:[...c.contenido,nuevo]}));
    }
    if(modal==="pauta" && sel) {
      const nueva={id:`p${Date.now()}`,plataforma:modalData.plataforma||"Meta Ads",
        presupuesto:parseInt(modalData.presupuesto)||0,gastado:0,
        inicio:modalData.inicio||HOY,fin:modalData.fin||HOY,
        objetivo:modalData.objetivo||"—",resultado:"En curso",estado:"planificada"};
      mutarCliente(sel.id, c=>({...c,pautas:[...c.pautas,nueva]}));
    }
    if(modal==="entregable" && sel) {
      const nuevo={id:`e${Date.now()}`,nombre:modalData.nombre||"Entregable",
        estado:"pendiente",fecha:modalData.fecha||HOY,tipo:modalData.tipo||"Estrategia"};
      mutarCliente(sel.id, c=>({...c,entregables:[...c.entregables,nuevo]}));
    }
    if(modal==="cliente") {
      if(!modalData.nombre?.trim()) return;
      const nuevo={id:`c${Date.now()}`,nombre:modalData.nombre,sector:modalData.sector||"Sin definir",
        contacto:modalData.contacto||"—",email:modalData.email||"—",wa:modalData.wa||"—",
        ingresos:modalData.ingresos||"—",color:BLUE,fase:"Propuesta",score:0,
        scores:Object.fromEntries(PILARES.map(p=>[p,0])),tipoServicio:modalData.servicio||"—",
        contrato:parseInt(modalData.contrato)||0,pagado:0,inicio:null,
        resumen:"Cliente nuevo — diagnóstico pendiente.",notas:"",
        contenido:[],pautas:[],entregables:[],alertas:["🆕 Agendar discovery call"]};
      setClientes(p=>[nuevo,...p]);
    }
    if(modal==="equipo") {
      if(!modalData.nombre?.trim()) return;
      const nuevo={id:`eq${Date.now()}`,nombre:modalData.nombre,rol:modalData.rol||"Colaborador",
        especialidad:modalData.especialidad||"—",email:modalData.email||"—",
        pago:parseInt(modalData.pago)||0,tipoPago:modalData.tipoPago||"Mensual fijo",
        estado:"activo",clientes:[],color:PURPLE,pagos:[]};
      setEquipo(p=>[...p,nuevo]);
    }
    setModal(null); setModalData({});
  };

  // ─── ESTILOS BASE ────────────────────────────────────────────────
  const card = (x={}) => ({
    background:S1,borderRadius:18,padding:18,
    boxShadow:"0 4px 28px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04) inset",
    border:"1px solid rgba(255,255,255,0.05)",...x
  });
  const pill=(color,bg)=>({display:"inline-flex",alignItems:"center",padding:"3px 9px",borderRadius:20,
    fontSize:10,fontWeight:700,background:bg||`${color}18`,color,whiteSpace:"nowrap"});
  const BtnG  = {border:"none",borderRadius:11,padding:"9px 16px",fontWeight:700,fontSize:12,cursor:"pointer",background:G,color:BG};
  const BtnO  = {border:"1px solid rgba(255,255,255,0.08)",borderRadius:11,padding:"9px 16px",fontWeight:600,fontSize:12,cursor:"pointer",background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.55)"};
  const INP   = {background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"9px 12px",color:"#fff",fontSize:12,outline:"none",width:"100%",boxSizing:"border-box",fontFamily:"inherit"};

  // ─── NAVEGACIÓN ──────────────────────────────────────────────────
  const NAV = [
    {id:"dashboard",lbl:"Dashboard",  icon:"M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"},
    {id:"clientes", lbl:"Clientes",   icon:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"},
    {id:"contenido",lbl:"Contenido",  icon:"M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"},
    {id:"pautas",   lbl:"Pautas",     icon:"M18 20V10M12 20V4M6 20v-6"},
    {id:"finanzas", lbl:"Finanzas",   icon:"M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"},
    {id:"equipo",   lbl:"Equipo",     icon:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"},
    {id:"ia",       lbl:"IA",         icon:"M13 2L3 14h9l-1 8 10-12h-9l1-8z"},
  ];

  // ─── PANEL TABS según vista ──────────────────────────────────────
  const PANEL_TABS_CLIENTE = [
    ["resumen","Resumen"],["contenido","Contenido"],["pautas","Pautas"],
    ["entregables","Entregables"],["pagos","Pagos"],["ia","Chat IA"]
  ];

  return (
    <div style={{display:"flex",minHeight:"100vh",background:BG,fontFamily:"'Inter','DM Sans',sans-serif",color:"#fff"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes slideR{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
        @keyframes staggerIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(245,197,24,0.12);border-radius:2px}
        .hov:hover{background:rgba(255,255,255,0.035)!important;cursor:pointer}
        .hov2:hover{opacity:.8;cursor:pointer}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.18)}
        select option{background:#1C1C22}
      `}</style>

      {/* ══ SIDEBAR ══════════════════════════════════════════════════ */}
      <div style={{width:220,background:S1,display:"flex",flexDirection:"column",padding:"22px 0",
        borderRight:"1px solid rgba(255,255,255,0.04)",flexShrink:0,position:"sticky",top:0,height:"100vh",overflow:"hidden"}}>
        {/* Logo */}
        <div style={{padding:"0 18px 20px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,background:G,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={BG} strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:800,letterSpacing:"0.02em"}}>CRM 360™</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.22)",letterSpacing:"0.1em"}}>AGENCIA ORLANDO</div>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav style={{padding:"12px 8px",flex:1,overflowY:"auto"}}>
          {NAV.map((n,idx)=>{
            const active=vista===n.id;
            return (
              <div key={n.id} onClick={()=>{setVista(n.id);setSel(null);setSelEq(null);}}
                className={active?"":"hov"}
                style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,
                  cursor:"pointer",marginBottom:2,transition:"all .15s",
                  background:active?"rgba(245,197,24,0.1)":"transparent",
                  color:active?G:"rgba(255,255,255,0.38)",fontWeight:active?700:400,fontSize:12,
                  border:`1px solid ${active?"rgba(245,197,24,0.12)":"transparent"}`,
                  animation:stagger?`staggerIn .4s ease ${idx*0.05}s both`:"none"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
                  <path d={n.icon}/>
                </svg>
                <span>{n.lbl}</span>
                {n.id==="ia"&&<span style={{marginLeft:"auto",fontSize:8,background:G,color:BG,padding:"1px 5px",borderRadius:3,fontWeight:800}}>AI</span>}
                {n.id==="pautas"&&pautasActivas.length>0&&<span style={{marginLeft:"auto",fontSize:8,background:`${GREEN}22`,color:GREEN,padding:"1px 5px",borderRadius:3,fontWeight:700}}>{pautasActivas.length}</span>}
              </div>
            );
          })}
        </nav>
        {/* Alertas sidebar */}
        {alertCount>0&&(
          <div style={{margin:"0 8px 14px",padding:"10px 12px",background:"rgba(248,113,113,0.07)",
            border:"1px solid rgba(248,113,113,0.14)",borderRadius:12}}>
            <div style={{fontSize:9,color:RED,fontWeight:700,marginBottom:6,letterSpacing:"0.08em"}}>⚠ {alertCount} ALERTA{alertCount>1?"S":""}</div>
            {clientes.filter(c=>c.alertas.length>0).map(c=>c.alertas.map((a,i)=>(
              <div key={`${c.id}${i}`} style={{fontSize:9,color:"rgba(255,255,255,0.35)",marginBottom:2,lineHeight:1.4}}>{a}</div>
            )))}
          </div>
        )}
        <div style={{padding:"0 18px"}}><div style={{fontSize:8,color:"rgba(255,255,255,0.1)",letterSpacing:"0.08em"}}>MÉTODO 360™ v3.0</div></div>
      </div>

      {/* ══ MAIN ═════════════════════════════════════════════════════ */}
      <div style={{flex:1,overflow:"auto",padding:24,minWidth:0}}>

        {/* ─── DASHBOARD ─── */}
        {vista==="dashboard"&&(
          <div style={{animation:"fadeUp .3s ease"}}>
            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <div>
                <div style={{fontSize:22,fontWeight:800}}>Buen día, Orlando 👋</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginTop:3}}>
                  {new Date().toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"})}
                </div>
              </div>
              <button style={BtnG} onClick={()=>{setModal("cliente");setModalData({})}}>+ Nuevo cliente</button>
            </div>

            {/* KPI Row 1 — gauges */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:14}}>
              {/* Score gauge */}
              {[
                {lbl:"SCORE PROMEDIO",val:scoreProm,valDisplay:`${scoreProm}`,sub:"/100",color:sc(scoreProm),gauge:scoreProm,tipo:"gauge"},
                {lbl:"CLIENTES ACTIVOS",val:activos,valDisplay:String(activos),sub:`/ ${clientes.length}`,color:GREEN,gauge:(activos/clientes.length)*100,tipo:"number"},
                {lbl:"FACTURADO",val:fmt(facturadoT),valDisplay:fmt(facturadoT),sub:"COP",color:G,gauge:(cobradoT/facturadoT)*100,tipo:"string"},
                {lbl:"PAUTAS ACTIVAS",val:pautasActivas.length,valDisplay:String(pautasActivas.length),sub:`${fmt(presupuestoPautas)} activo`,color:BLUE,gauge:(pautasActivas.length/Math.max(clientes.length,1))*100,tipo:"number"},
                {lbl:"EQUIPO — HON. MES",val:fmt(costoEquipoMes),valDisplay:fmt(costoEquipoMes),sub:`${fmt(pendienteEquipo)} pend.`,color:pendienteEquipo>0?RED:GREEN,gauge:100-((pendienteEquipo/costoEquipoMes)*100),tipo:"string"},
              ].map((k,i)=>(
                <div key={i} style={{...card(),display:"flex",flexDirection:"column",alignItems:"center",padding:"18px 12px",
                  animation:stagger?`staggerIn .4s ease ${i*0.08}s both`:"none"}}>
                  <div style={{fontSize:8,color:"rgba(255,255,255,0.28)",letterSpacing:"0.12em",marginBottom:10,textAlign:"center"}}>{k.lbl}</div>
                  <div style={{position:"relative",width:76,height:76}}>
                    <Gauge val={k.gauge} size={76} stroke={6} color={k.color}/>
                    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                      <span style={{fontSize:k.tipo==="string"?11:18,fontWeight:800,color:k.color,lineHeight:1,textAlign:"center"}}>{k.valDisplay}</span>
                    </div>
                  </div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",marginTop:8,textAlign:"center"}}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Row 2 — contenido semana + actividad */}
            <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:14,marginBottom:14}}>
              {/* Contenido esta semana */}
              <div style={card({padding:0})}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 18px 12px"}}>
                  <div style={{fontSize:13,fontWeight:700}}>📅 Contenido esta semana</div>
                  <button style={{...BtnO,padding:"5px 10px",fontSize:11}} onClick={()=>setVista("contenido")}>Ver todo →</button>
                </div>
                {contenidoSemana.length===0&&(
                  <div style={{padding:"20px 18px",fontSize:12,color:"rgba(255,255,255,0.2)"}}>Sin piezas programadas esta semana</div>
                )}
                {contenidoSemana.slice(0,5).map(co=>{
                  const cl=clientes.find(c=>c.contenido.some(x=>x.id===co.id));
                  const es=ESTADO_CONTENIDO[co.estado]||{c:"#555",l:co.estado};
                  return (
                    <div key={co.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 18px",
                      borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:es.c,flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{co.descripcion}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:1}}>{cl?.nombre} · {co.tipo} · {co.responsable}</div>
                      </div>
                      <span style={pill(es.c)}>{es.l}</span>
                    </div>
                  );
                })}
              </div>

              {/* Actividad pautas + equipo */}
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={card({padding:"14px 16px"})}>
                  <div style={{fontSize:11,fontWeight:700,marginBottom:10,color:G}}>💰 Pautas activas</div>
                  {pautasActivas.length===0&&<div style={{fontSize:11,color:"rgba(255,255,255,0.2)"}}>Sin pautas activas</div>}
                  {pautasActivas.map(p=>{
                    const cl=clientes.find(c=>c.pautas.some(x=>x.id===p.id));
                    const pct=Math.round((p.gastado/p.presupuesto)*100)||0;
                    return (
                      <div key={p.id} style={{marginBottom:10}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:3}}>
                          <span style={{fontWeight:600}}>{cl?.nombre} · {p.plataforma}</span>
                          <span style={{color:G,fontWeight:700}}>{fmt(p.presupuesto)}</span>
                        </div>
                        <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                          <div style={{width:`${pct}%`,height:"100%",background:G,borderRadius:2}}/>
                        </div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",marginTop:2}}>Gastado {pct}% · {p.objetivo}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={card({padding:"14px 16px"})}>
                  <div style={{fontSize:11,fontWeight:700,marginBottom:10,color:PURPLE}}>👥 Honorarios pendientes</div>
                  {equipo.map(e=>{
                    const pend=e.pagos.filter(p=>p.estado==="pendiente");
                    if(pend.length===0) return null;
                    return (
                      <div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,fontSize:11}}>
                        <span>{e.nombre}</span>
                        <span style={{color:RED,fontWeight:700}}>{fmt(pend.reduce((a,p)=>a+p.monto,0))}</span>
                      </div>
                    );
                  })}
                  {pendienteEquipo===0&&<div style={{fontSize:11,color:GREEN}}>✓ Todo al día</div>}
                </div>
              </div>
            </div>

            {/* Tabla clientes */}
            <div style={card({padding:0})}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 18px 12px"}}>
                <div style={{fontSize:13,fontWeight:700}}>Cartera de clientes</div>
                <button style={{...BtnO,padding:"5px 10px",fontSize:11}} onClick={()=>setVista("clientes")}>Ver todos →</button>
              </div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                    {["CLIENTE","FASE","SCORE","CONTENIDO","PAUTAS","CONTRATO",""].map((h,i)=>(
                      <th key={i} style={{textAlign:"left",padding:"8px 18px",fontSize:9,color:"rgba(255,255,255,0.2)",
                        letterSpacing:"0.1em",fontWeight:600,background:"rgba(255,255,255,0.015)"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c,i)=>(
                    <tr key={c.id} className="hov" onClick={()=>abrirCliente(c)}
                      style={{borderTop:"1px solid rgba(255,255,255,0.03)",transition:"background .12s",
                        animation:stagger?`staggerIn .4s ease ${i*0.06+0.2}s both`:"none"}}>
                      <td style={{padding:"11px 18px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:30,height:30,borderRadius:8,background:`${c.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:c.color,flexShrink:0}}>{c.nombre.charAt(0)}</div>
                          <div>
                            <div style={{fontWeight:700,fontSize:12}}>{c.nombre}</div>
                            <div style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>{c.sector}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{padding:"11px 18px"}}><span style={pill(fc[c.fase]||G)}>{c.fase}</span></td>
                      <td style={{padding:"11px 18px"}}>
                        {c.score>0?(
                          <div style={{display:"flex",alignItems:"center",gap:7}}>
                            <div style={{position:"relative",width:28,height:28}}>
                              <Gauge val={c.score} size={28} stroke={2.5} color={sc(c.score)}/>
                              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:sc(c.score)}}>{c.score}</div>
                            </div>
                            <span style={{fontSize:9,color:sc(c.score),fontWeight:700}}>{sl(c.score)}</span>
                          </div>
                        ):<span style={{fontSize:10,color:"rgba(255,255,255,0.15)"}}>—</span>}
                      </td>
                      <td style={{padding:"11px 18px"}}>
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                          {["publicado","en produccion","pendiente"].map(e=>{
                            const cnt=c.contenido.filter(co=>co.estado===e).length;
                            if(!cnt) return null;
                            return <span key={e} style={pill(ESTADO_CONTENIDO[e]?.c||"#555")}>{cnt} {ESTADO_CONTENIDO[e]?.l}</span>;
                          })}
                          {c.contenido.length===0&&<span style={{fontSize:9,color:"rgba(255,255,255,0.2)"}}>—</span>}
                        </div>
                      </td>
                      <td style={{padding:"11px 18px"}}>
                        {c.pautas.filter(p=>p.estado==="activa").length>0
                          ?<span style={pill(GREEN)}>{c.pautas.filter(p=>p.estado==="activa").length} activa{c.pautas.filter(p=>p.estado==="activa").length>1?"s":""}</span>
                          :<span style={{fontSize:9,color:"rgba(255,255,255,0.2)"}}>—</span>}
                      </td>
                      <td style={{padding:"11px 18px"}}>
                        <div style={{fontSize:12,fontWeight:700}}>{fmt(c.contrato)}</div>
                        <div style={{fontSize:9,color:c.pagado===c.contrato?GREEN:RED}}>{c.pagado===c.contrato?"✓ Cobrado":"⚠ Parcial"}</div>
                      </td>
                      <td style={{padding:"11px 18px",color:G,fontSize:11}}>Ver →</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── CLIENTES ─── */}
        {vista==="clientes"&&(
          <div style={{animation:"fadeUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:22,fontWeight:800}}>Clientes</div>
              <div style={{display:"flex",gap:10}}>
                <input style={{...INP,width:200}} placeholder="Buscar..." value={busq} onChange={e=>setBusq(e.target.value)}/>
                <button style={BtnG} onClick={()=>{setModal("cliente");setModalData({})}}>+ Nuevo</button>
              </div>
            </div>
            <div style={{display:"flex",gap:7,marginBottom:18}}>
              {["Todos","Activo","Propuesta","Entregado","Pausado"].map(f=>(
                <button key={f} onClick={()=>setFiltroFase(f)} style={{padding:"6px 14px",borderRadius:20,fontSize:11,
                  fontWeight:filtroFase===f?700:500,background:filtroFase===f?G:"rgba(255,255,255,0.04)",
                  color:filtroFase===f?BG:"rgba(255,255,255,0.4)",
                  border:filtroFase===f?"none":"1px solid rgba(255,255,255,0.06)",cursor:"pointer"}}>
                  {f}
                </button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
              {clientesFilt.map((c,i)=>(
                <div key={c.id} className="hov" onClick={()=>abrirCliente(c)}
                  style={{...card(),cursor:"pointer",animation:stagger?`staggerIn .35s ease ${i*0.07}s both`:"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:38,height:38,borderRadius:11,background:`${c.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:c.color}}>{c.nombre.charAt(0)}</div>
                      <div>
                        <div style={{fontWeight:800,fontSize:13}}>{c.nombre}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:1}}>{c.tipoServicio}</div>
                      </div>
                    </div>
                    <span style={pill(fc[c.fase]||G)}>{c.fase}</span>
                  </div>
                  {/* Score mini */}
                  {c.score>0&&(
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,padding:10,background:"rgba(255,255,255,0.02)",borderRadius:10,border:"1px solid rgba(255,255,255,0.04)"}}>
                      <div style={{position:"relative",width:52,height:52,flexShrink:0}}>
                        <Gauge val={c.score} size={52} stroke={4.5} color={sc(c.score)}/>
                        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:sc(c.score)}}>{c.score}</div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:9,color:sc(c.score),fontWeight:700,marginBottom:5}}>{sl(c.score)}</div>
                        {PILARES.slice(0,3).map(p=>(
                          <div key={p} style={{marginBottom:4}}>
                            <div style={{display:"flex",justifyContent:"space-between",fontSize:8,marginBottom:1}}>
                              <span style={{color:"rgba(255,255,255,0.3)"}}>{PL[p]}</span>
                              <span style={{color:sc(c.scores[p]),fontWeight:700}}>{c.scores[p]}</span>
                            </div>
                            <div style={{height:2.5,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                              <div style={{width:`${c.scores[p]}%`,height:"100%",background:sc(c.scores[p]),borderRadius:2}}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Stats rápidas */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
                    {[
                      {lbl:"Contenido",val:c.contenido.length,color:"rgba(255,255,255,0.5)"},
                      {lbl:"Pautas",val:c.pautas.filter(p=>p.estado==="activa").length,color:GREEN},
                      {lbl:"Entregables",val:c.entregables.filter(e=>e.estado!=="entregado").length,color:c.entregables.some(e=>e.estado==="pendiente")?G:"rgba(255,255,255,0.5)"},
                    ].map(k=>(
                      <div key={k.lbl} style={{background:"rgba(255,255,255,0.025)",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                        <div style={{fontSize:14,fontWeight:800,color:k.color}}>{k.val}</div>
                        <div style={{fontSize:8,color:"rgba(255,255,255,0.25)",marginTop:1}}>{k.lbl}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:800}}>{fmt(c.contrato)}</div>
                      <div style={{fontSize:9,color:c.pagado===c.contrato?GREEN:RED}}>{c.pagado===c.contrato?"✓ Cobrado":`⚠ ${fmt(c.contrato-c.pagado)} pend.`}</div>
                    </div>
                    {c.alertas.length>0&&<div style={{fontSize:9,color:RED,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.15)",padding:"3px 8px",borderRadius:7,lineHeight:1.4,maxWidth:120,textAlign:"right"}}>{c.alertas[0]}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── CONTENIDO ─── */}
        {vista==="contenido"&&(
          <div style={{animation:"fadeUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <div style={{fontSize:22,fontWeight:800}}>📅 Calendario de Contenido</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginTop:3}}>Todas las piezas — semana actual y próximas</div>
              </div>
            </div>
            {/* Por cliente */}
            {clientes.filter(c=>c.fase!=="Propuesta").map(c=>(
              <div key={c.id} style={{...card({padding:0}),marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px 10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:28,height:28,borderRadius:8,background:`${c.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:c.color}}>{c.nombre.charAt(0)}</div>
                    <div style={{fontWeight:700,fontSize:13}}>{c.nombre}</div>
                    <span style={pill(fc[c.fase]||G)}>{c.fase}</span>
                  </div>
                  <button style={{...BtnO,padding:"5px 10px",fontSize:10}} onClick={()=>{setSel(c);setModal("contenido");setModalData({})}}>+ Agregar</button>
                </div>
                {c.contenido.length===0&&<div style={{padding:"12px 18px",fontSize:11,color:"rgba(255,255,255,0.2)"}}>Sin piezas de contenido</div>}
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                      {["SEMANA","TIPO","DESCRIPCIÓN","RESPONSABLE","ESTADO","OBS."].map((h,i)=>(
                        <th key={i} style={{textAlign:"left",padding:"7px 18px",fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:"0.1em",fontWeight:600,background:"rgba(255,255,255,0.015)"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {c.contenido.sort((a,b)=>a.semana>b.semana?1:-1).map(co=>{
                      const es=ESTADO_CONTENIDO[co.estado]||{c:"#555",l:co.estado};
                      const esHoy=co.semana>=semana(-3)&&co.semana<=semana(7);
                      return (
                        <tr key={co.id} className="hov" onClick={()=>cicloEstadoContenido(c.id,co.id)}
                          style={{borderTop:"1px solid rgba(255,255,255,0.03)",background:esHoy?"rgba(245,197,24,0.02)":"transparent"}}>
                          <td style={{padding:"10px 18px",fontSize:10,color:esHoy?G:"rgba(255,255,255,0.4)",fontWeight:esHoy?700:400}}>{co.semana}</td>
                          <td style={{padding:"10px 18px"}}><span style={{...pill(c.color),fontSize:9}}>{co.tipo}</span></td>
                          <td style={{padding:"10px 18px",fontSize:11,maxWidth:200}}>{co.descripcion}</td>
                          <td style={{padding:"10px 18px",fontSize:10,color:"rgba(255,255,255,0.4)"}}>{co.responsable}</td>
                          <td style={{padding:"10px 18px"}}><span style={pill(es.c)}>{es.l}</span></td>
                          <td style={{padding:"10px 18px",fontSize:10,color:"rgba(255,255,255,0.3)",maxWidth:120}}>{co.observacion||"—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* ─── PAUTAS ─── */}
        {vista==="pautas"&&(
          <div style={{animation:"fadeUp .3s ease"}}>
            <div style={{fontSize:22,fontWeight:800,marginBottom:6}}>📊 Pautas Publicitarias</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginBottom:20}}>Control de presupuesto, plataformas y resultados</div>
            {/* KPIs pautas */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
              {[
                {lbl:"PAUTAS ACTIVAS",val:pautasActivas.length,color:GREEN},
                {lbl:"PRESUPUESTO ACTIVO",val:fmt(presupuestoPautas),color:G},
                {lbl:"TOTAL HISTÓRICO",val:fmt(clientes.flatMap(c=>c.pautas).reduce((a,p)=>a+p.presupuesto,0)),color:BLUE},
                {lbl:"CLIENTES CON PAUTA",val:clientes.filter(c=>c.pautas.some(p=>p.estado==="activa")).length,color:PURPLE},
              ].map((k,i)=>(
                <div key={i} style={{...card(),padding:"14px 16px"}}>
                  <div style={{fontSize:8,color:"rgba(255,255,255,0.28)",letterSpacing:"0.1em",marginBottom:6}}>{k.lbl}</div>
                  <div style={{fontSize:22,fontWeight:800,color:k.color}}>{k.val}</div>
                </div>
              ))}
            </div>
            {clientes.filter(c=>c.pautas.length>0).map(c=>(
              <div key={c.id} style={{...card({padding:0}),marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px 10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:26,height:26,borderRadius:7,background:`${c.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:c.color}}>{c.nombre.charAt(0)}</div>
                    <span style={{fontWeight:700,fontSize:13}}>{c.nombre}</span>
                  </div>
                  <button style={{...BtnO,padding:"5px 10px",fontSize:10}} onClick={()=>{setSel(c);setModal("pauta");setModalData({})}}>+ Pauta</button>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                      {["PLATAFORMA","PRESUPUESTO","GASTADO","PERÍODO","OBJETIVO","RESULTADO","ESTADO"].map((h,i)=>(
                        <th key={i} style={{textAlign:"left",padding:"7px 18px",fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:"0.1em",fontWeight:600,background:"rgba(255,255,255,0.015)"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {c.pautas.map(p=>{
                      const es=ESTADO_PAUTA[p.estado]||{c:"#555",l:p.estado};
                      const pct=Math.round((p.gastado/p.presupuesto)*100)||0;
                      return (
                        <tr key={p.id} style={{borderTop:"1px solid rgba(255,255,255,0.03)"}}>
                          <td style={{padding:"10px 18px",fontWeight:700,fontSize:12}}>{p.plataforma}</td>
                          <td style={{padding:"10px 18px",color:G,fontWeight:700,fontSize:12}}>{fmt(p.presupuesto)}</td>
                          <td style={{padding:"10px 18px",fontSize:11}}>
                            <div style={{fontSize:11,fontWeight:700}}>{fmt(p.gastado)}</div>
                            <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,marginTop:4,width:60}}>
                              <div style={{width:`${pct}%`,height:"100%",background:G,borderRadius:2}}/>
                            </div>
                            <div style={{fontSize:8,color:"rgba(255,255,255,0.3)",marginTop:2}}>{pct}%</div>
                          </td>
                          <td style={{padding:"10px 18px",fontSize:10,color:"rgba(255,255,255,0.4)"}}>{p.inicio} → {p.fin}</td>
                          <td style={{padding:"10px 18px",fontSize:10}}>{p.objetivo}</td>
                          <td style={{padding:"10px 18px",fontSize:10,color:GREEN}}>{p.resultado}</td>
                          <td style={{padding:"10px 18px"}}><span style={pill(es.c)}>{es.l}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* ─── FINANZAS ─── */}
        {vista==="finanzas"&&(
          <div style={{animation:"fadeUp .3s ease"}}>
            <div style={{fontSize:22,fontWeight:800,marginBottom:6}}>💰 Finanzas</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginBottom:20}}>Ingresos · Pagos clientes · Costos de agencia</div>
            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
              {[
                {lbl:"FACTURADO TOTAL",val:fmt(facturadoT),color:G,pct:100},
                {lbl:"COBRADO",val:fmt(cobradoT),color:GREEN,pct:Math.round((cobradoT/facturadoT)*100)},
                {lbl:"POR COBRAR CLIENTES",val:fmt(pendienteT),color:pendienteT>0?RED:GREEN,pct:Math.round((pendienteT/facturadoT)*100)},
                {lbl:"COSTO EQUIPO MES",val:fmt(costoEquipoMes),color:PURPLE,pct:100},
              ].map((k,i)=>(
                <div key={i} style={{...card(),display:"flex",flexDirection:"column",alignItems:"center",padding:"18px 12px"}}>
                  <div style={{fontSize:8,color:"rgba(255,255,255,0.28)",letterSpacing:"0.1em",marginBottom:10,textAlign:"center"}}>{k.lbl}</div>
                  <div style={{position:"relative",width:72,height:72}}>
                    <Gauge val={k.pct} size={72} stroke={5.5} color={k.color}/>
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:k.color,textAlign:"center"}}>{k.val}</div>
                  </div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",marginTop:8}}>{k.pct}%</div>
                </div>
              ))}
            </div>
            {/* Tabla clientes */}
            <div style={{...card({padding:0}),marginBottom:14}}>
              <div style={{padding:"14px 18px 10px",fontSize:13,fontWeight:700,borderBottom:"1px solid rgba(255,255,255,0.05)"}}>Cobros clientes</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr>{["CLIENTE","SERVICIO","CONTRATO","COBRADO","PENDIENTE","PROGRESO"].map((h,i)=>(
                    <th key={i} style={{textAlign:"left",padding:"7px 18px",fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:"0.1em",fontWeight:600,background:"rgba(255,255,255,0.015)"}}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {clientes.filter(c=>c.contrato>0).map(c=>{
                    const pct=Math.round((c.pagado/c.contrato)*100)||0;
                    return (
                      <tr key={c.id} style={{borderTop:"1px solid rgba(255,255,255,0.03)"}}>
                        <td style={{padding:"10px 18px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:24,height:24,borderRadius:6,background:`${c.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:c.color}}>{c.nombre.charAt(0)}</div>
                            <span style={{fontWeight:600,fontSize:12}}>{c.nombre}</span>
                          </div>
                        </td>
                        <td style={{padding:"10px 18px",fontSize:10,color:"rgba(255,255,255,0.4)"}}>{c.tipoServicio}</td>
                        <td style={{padding:"10px 18px",fontWeight:700,fontSize:12}}>{fmt(c.contrato)}</td>
                        <td style={{padding:"10px 18px",color:GREEN,fontWeight:700,fontSize:12}}>{fmt(c.pagado)}</td>
                        <td style={{padding:"10px 18px",color:c.pagado<c.contrato?RED:GREEN,fontWeight:700,fontSize:12}}>{fmt(c.contrato-c.pagado)}</td>
                        <td style={{padding:"10px 18px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{flex:1,height:4,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                              <div style={{width:`${pct}%`,height:"100%",background:pct===100?GREEN:G,borderRadius:2}}/>
                            </div>
                            <span style={{fontSize:10,fontWeight:700,color:pct===100?GREEN:G,minWidth:28}}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Tabla equipo */}
            <div style={card({padding:0})}>
              <div style={{padding:"14px 18px 10px",fontSize:13,fontWeight:700,borderBottom:"1px solid rgba(255,255,255,0.05)"}}>Honorarios equipo</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr>{["NOMBRE","ROL","PAGO MES","TIPO","ESTADO ÚLTIMO MES"].map((h,i)=>(
                    <th key={i} style={{textAlign:"left",padding:"7px 18px",fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:"0.1em",fontWeight:600,background:"rgba(255,255,255,0.015)"}}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {equipo.map(e=>{
                    const ultimo=e.pagos[e.pagos.length-1];
                    const pe=PAGO_ESTADO[ultimo?.estado||"pendiente"];
                    return (
                      <tr key={e.id} className="hov" onClick={()=>abrirEquipo(e)} style={{borderTop:"1px solid rgba(255,255,255,0.03)"}}>
                        <td style={{padding:"10px 18px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:26,height:26,borderRadius:7,background:`${e.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:e.color}}>{e.nombre.charAt(0)}</div>
                            <span style={{fontWeight:600,fontSize:12}}>{e.nombre}</span>
                          </div>
                        </td>
                        <td style={{padding:"10px 18px",fontSize:10,color:"rgba(255,255,255,0.4)"}}>{e.rol}</td>
                        <td style={{padding:"10px 18px",fontWeight:700,color:G,fontSize:12}}>{fmt(e.pago)}</td>
                        <td style={{padding:"10px 18px",fontSize:10,color:"rgba(255,255,255,0.4)"}}>{e.tipoPago}</td>
                        <td style={{padding:"10px 18px"}}><span style={pill(pe?.c||RED)}>{pe?.l||"—"}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── EQUIPO ─── */}
        {vista==="equipo"&&(
          <div style={{animation:"fadeUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <div style={{fontSize:22,fontWeight:800}}>👥 Equipo</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginTop:3}}>Colaboradores, roles y honorarios</div>
              </div>
              <button style={BtnG} onClick={()=>{setModal("equipo");setModalData({})}}>+ Agregar</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
              {equipo.map((e,i)=>{
                const pendEq=e.pagos.filter(p=>p.estado==="pendiente").reduce((a,p)=>a+p.monto,0);
                const clientesNombres=e.clientes.map(cid=>clientes.find(c=>c.id===cid)?.nombre).filter(Boolean);
                return (
                  <div key={e.id} className="hov" onClick={()=>abrirEquipo(e)}
                    style={{...card(),cursor:"pointer",animation:stagger?`staggerIn .35s ease ${i*0.08}s both`:"none"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                      <div style={{width:44,height:44,borderRadius:12,background:`${e.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:e.color}}>{e.nombre.charAt(0)}</div>
                      <div>
                        <div style={{fontWeight:800,fontSize:14}}>{e.nombre}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:1}}>{e.rol}</div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.2)"}}>{e.especialidad}</div>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                      <div style={{background:"rgba(255,255,255,0.025)",borderRadius:8,padding:"8px 10px"}}>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:2}}>HONORARIO MES</div>
                        <div style={{fontSize:14,fontWeight:800,color:G}}>{fmt(e.pago)}</div>
                      </div>
                      <div style={{background:"rgba(255,255,255,0.025)",borderRadius:8,padding:"8px 10px"}}>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:2}}>PENDIENTE</div>
                        <div style={{fontSize:14,fontWeight:800,color:pendEq>0?RED:GREEN}}>{pendEq>0?fmt(pendEq):"Al día ✓"}</div>
                      </div>
                    </div>
                    <div style={{marginBottom:10}}>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:5}}>CLIENTES ASIGNADOS</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        {clientesNombres.length>0
                          ?clientesNombres.map(n=><span key={n} style={pill(e.color)}>{n}</span>)
                          :<span style={{fontSize:9,color:"rgba(255,255,255,0.2)"}}>Sin asignar</span>}
                      </div>
                    </div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.25)"}}>{e.tipoPago} · {e.email}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── IA ─── */}
        {vista==="ia"&&(
          <div style={{animation:"fadeUp .3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
              <div>
                <div style={{fontSize:22,fontWeight:800}}>✦ Análisis IA</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginTop:3}}>Diagnóstico estratégico de la operación completa</div>
              </div>
              <button style={BtnG} onClick={analizarCartera} disabled={iaLoad}>
                {iaLoad?<span style={{display:"flex",alignItems:"center",gap:8}}><Spin sz={13}/>Analizando...</span>:"Analizar operación →"}
              </button>
            </div>
            {!iaGlobal&&!iaLoad&&(
              <div style={{...card(),textAlign:"center",padding:"60px 20px"}}>
                <div style={{fontSize:40,marginBottom:12,opacity:.15}}>✦</div>
                <div style={{fontSize:16,fontWeight:700,marginBottom:8}}>Diagnóstico de agencia</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.3)",maxWidth:380,margin:"0 auto 24px",lineHeight:1.7}}>
                  Estado operación · Cliente prioritario · Riesgo churn · Upsell · Acción 3 días
                </div>
                <button style={BtnG} onClick={analizarCartera}>Iniciar →</button>
              </div>
            )}
            {iaLoad&&<div style={{...card(),textAlign:"center",padding:"60px 20px"}}><Spin sz={30}/><div style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginTop:14}}>Procesando operación con Método 360™...</div></div>}
            {iaGlobal&&!iaLoad&&(
              <div style={card()}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                  <div style={{width:34,height:34,background:`${G}18`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:G}}>✦</div>
                  <div>
                    <div style={{fontSize:11,fontWeight:700,color:G}}>ANÁLISIS IA — MÉTODO 360™</div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>{new Date().toLocaleDateString("es-CO")}</div>
                  </div>
                </div>
                <div style={{fontSize:12,lineHeight:1.9,color:"rgba(255,255,255,0.72)",whiteSpace:"pre-wrap",borderLeft:`2px solid ${G}`,paddingLeft:14}}>{iaGlobal}</div>
                <button style={{...BtnO,marginTop:16}} onClick={analizarCartera}>Regenerar →</button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ══ PANEL LATERAL CLIENTE ════════════════════════════════════ */}
      {sel&&(
        <div style={{width:400,background:S1,borderLeft:"1px solid rgba(255,255,255,0.04)",
          display:"flex",flexDirection:"column",animation:"slideR .25s ease",flexShrink:0,
          position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
          {/* Header */}
          <div style={{padding:"20px 20px 12px",borderBottom:"1px solid rgba(255,255,255,0.05)",flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:40,height:40,borderRadius:11,background:`${sel.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:sel.color}}>{sel.nombre.charAt(0)}</div>
                <div>
                  <div style={{fontWeight:800,fontSize:14}}>{sel.nombre}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:1}}>{sel.tipoServicio}</div>
                </div>
              </div>
              <button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.2)",cursor:"pointer",fontSize:17,lineHeight:1}}>✕</button>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <span style={pill(fc[sel.fase]||G)}>{sel.fase}</span>
              {sel.score>0&&<span style={pill(sc(sel.score))}>{sel.score}/100</span>}
              <span style={pill(sel.pagado===sel.contrato?GREEN:RED)}>{sel.pagado===sel.contrato?"Pagado":"Cobro pendiente"}</span>
            </div>
          </div>
          {/* Tabs */}
          <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.05)",flexShrink:0,overflowX:"auto"}}>
            {PANEL_TABS_CLIENTE.map(([id,lbl])=>(
              <div key={id} onClick={()=>setPanelTab(id)} style={{flexShrink:0,padding:"10px 12px",textAlign:"center",fontSize:11,cursor:"pointer",
                fontWeight:panelTab===id?700:400,color:panelTab===id?G:"rgba(255,255,255,0.28)",
                borderBottom:`2px solid ${panelTab===id?G:"transparent"}`,whiteSpace:"nowrap"}}>
                {lbl}
              </div>
            ))}
          </div>
          {/* Body */}
          <div style={{flex:1,overflow:"auto",padding:"16px 20px"}}>

            {/* RESUMEN */}
            {panelTab==="resumen"&&(
              <div>
                {sel.score>0&&(
                  <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16,padding:12,background:"rgba(255,255,255,0.02)",borderRadius:12,border:"1px solid rgba(255,255,255,0.04)"}}>
                    <div style={{position:"relative",width:72,height:72,flexShrink:0}}>
                      <Gauge val={sel.score} size={72} stroke={6} color={sc(sel.score)}/>
                      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                        <span style={{fontSize:18,fontWeight:800,color:sc(sel.score),lineHeight:1}}>{sel.score}</span>
                        <span style={{fontSize:8,color:"rgba(255,255,255,0.25)"}}>score</span>
                      </div>
                    </div>
                    <Radar scores={sel.scores} size={100}/>
                  </div>
                )}
                {sel.score>0&&(
                  <div style={{marginBottom:14}}>
                    {PILARES.map(p=>(
                      <div key={p} style={{marginBottom:6}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}>
                          <span style={{color:"rgba(255,255,255,0.38)"}}>{PL[p]}</span>
                          <span style={{color:sc(sel.scores[p]),fontWeight:700}}>{sel.scores[p]}</span>
                        </div>
                        <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                          <div style={{width:`${sel.scores[p]}%`,height:"100%",background:sc(sel.scores[p]),borderRadius:2}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{fontSize:9,color:"rgba(255,255,255,0.22)",letterSpacing:"0.1em",marginBottom:4}}>RESUMEN</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.7,marginBottom:12}}>{sel.resumen}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.22)",letterSpacing:"0.1em",marginBottom:4}}>NOTAS</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",lineHeight:1.7,marginBottom:16}}>{sel.notas||"—"}</div>
                <div style={{display:"flex",gap:8}}>
                  <a href={`mailto:${sel.email}`} style={{...BtnO,textDecoration:"none",fontSize:11,padding:"8px 12px"}}>✉ Email</a>
                  <a href={`https://wa.me/${sel.wa.replace(/\D/g,"")}`} target="_blank" rel="noreferrer"
                    style={{...BtnG,textDecoration:"none",fontSize:11,padding:"8px 12px"}}>WhatsApp →</a>
                </div>
              </div>
            )}

            {/* CONTENIDO panel */}
            {panelTab==="contenido"&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{sel.contenido.length} piezas totales</div>
                  <button style={{...BtnO,padding:"5px 10px",fontSize:10}} onClick={()=>setModal("contenido")}>+ Agregar</button>
                </div>
                {sel.contenido.length===0&&<div style={{fontSize:11,color:"rgba(255,255,255,0.2)"}}>Sin piezas.</div>}
                {sel.contenido.sort((a,b)=>a.semana>b.semana?1:-1).map(co=>{
                  const es=ESTADO_CONTENIDO[co.estado]||{c:"#555",l:co.estado};
                  return (
                    <div key={co.id} className="hov" onClick={()=>cicloEstadoContenido(sel.id,co.id)}
                      style={{padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:"pointer"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{co.descripcion}</div>
                          <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginTop:2}}>{co.semana} · {co.tipo} · {co.responsable}</div>
                        </div>
                        <span style={{...pill(es.c),marginLeft:8}}>{es.l}</span>
                      </div>
                      {co.observacion&&<div style={{fontSize:9,color:"rgba(255,255,255,0.25)",fontStyle:"italic"}}>{co.observacion}</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* PAUTAS panel */}
            {panelTab==="pautas"&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{sel.pautas.length} pautas</div>
                  <button style={{...BtnO,padding:"5px 10px",fontSize:10}} onClick={()=>setModal("pauta")}>+ Pauta</button>
                </div>
                {sel.pautas.length===0&&<div style={{fontSize:11,color:"rgba(255,255,255,0.2)"}}>Sin pautas registradas.</div>}
                {sel.pautas.map(p=>{
                  const es=ESTADO_PAUTA[p.estado]||{c:"#555",l:p.estado};
                  const pct=Math.round((p.gastado/p.presupuesto)*100)||0;
                  return (
                    <div key={p.id} style={{padding:"12px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div>
                          <div style={{fontWeight:700,fontSize:12}}>{p.plataforma}</div>
                          <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginTop:1}}>{p.inicio} → {p.fin}</div>
                        </div>
                        <span style={pill(es.c)}>{es.l}</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                        <div style={{background:"rgba(255,255,255,0.025)",borderRadius:7,padding:"6px 8px"}}>
                          <div style={{fontSize:8,color:"rgba(255,255,255,0.3)"}}>PRESUPUESTO</div>
                          <div style={{fontSize:12,fontWeight:700,color:G}}>{fmt(p.presupuesto)}</div>
                        </div>
                        <div style={{background:"rgba(255,255,255,0.025)",borderRadius:7,padding:"6px 8px"}}>
                          <div style={{fontSize:8,color:"rgba(255,255,255,0.3)"}}>GASTADO</div>
                          <div style={{fontSize:12,fontWeight:700}}>{fmt(p.gastado)}</div>
                        </div>
                      </div>
                      <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,marginBottom:6}}>
                        <div style={{width:`${pct}%`,height:"100%",background:G,borderRadius:2}}/>
                      </div>
                      <div style={{fontSize:10,color:GREEN}}>{p.resultado}</div>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginTop:2}}>Objetivo: {p.objetivo}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ENTREGABLES panel */}
            {panelTab==="entregables"&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{sel.entregables.filter(e=>e.estado!=="entregado").length} pendientes</div>
                  <button style={{...BtnO,padding:"5px 10px",fontSize:10}} onClick={()=>setModal("entregable")}>+ Agregar</button>
                </div>
                {sel.entregables.length===0&&<div style={{fontSize:11,color:"rgba(255,255,255,0.2)"}}>Sin entregables.</div>}
                {sel.entregables.map(e=>{
                  const es=ESTADO_ENTREGABLE[e.estado]||{c:"#555",l:e.estado};
                  return (
                    <div key={e.id} className="hov" onClick={()=>cicloEstadoEntregable(sel.id,e.id)}
                      style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:"pointer"}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:es.c,flexShrink:0,marginTop:4}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600,color:e.estado==="entregado"?"rgba(255,255,255,0.3)":"#fff",textDecoration:e.estado==="entregado"?"line-through":"none"}}>{e.nombre}</div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",marginTop:2}}>{e.tipo} · {e.fecha}</div>
                      </div>
                      <span style={pill(es.c)}>{es.l}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PAGOS panel */}
            {panelTab==="pagos"&&(
              <div>
                <div style={{padding:14,background:"rgba(255,255,255,0.02)",borderRadius:12,border:"1px solid rgba(255,255,255,0.04)",marginBottom:14}}>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    <div style={{position:"relative",width:68,height:68,flexShrink:0}}>
                      <Gauge val={sel.contrato>0?Math.round((sel.pagado/sel.contrato)*100):0} size={68} stroke={5} color={sel.pagado===sel.contrato?GREEN:G}/>
                      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:sel.pagado===sel.contrato?GREEN:G}}>
                        {sel.contrato>0?Math.round((sel.pagado/sel.contrato)*100):0}%
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:3}}>CONTRATO TOTAL</div>
                      <div style={{fontSize:22,fontWeight:800,color:G}}>{fmt(sel.contrato)}</div>
                    </div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                  <div style={card({padding:12})}>
                    <div style={{fontSize:9,color:GREEN,letterSpacing:"0.1em",marginBottom:3}}>COBRADO</div>
                    <div style={{fontSize:16,fontWeight:800,color:GREEN}}>{fmt(sel.pagado)}</div>
                  </div>
                  <div style={card({padding:12})}>
                    <div style={{fontSize:9,color:sel.pagado<sel.contrato?RED:GREEN,letterSpacing:"0.1em",marginBottom:3}}>PENDIENTE</div>
                    <div style={{fontSize:16,fontWeight:800,color:sel.pagado<sel.contrato?RED:GREEN}}>{fmt(sel.contrato-sel.pagado)}</div>
                  </div>
                </div>
                <div style={{marginBottom:8}}>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",marginBottom:4}}>INICIO</div>
                  <div style={{fontSize:13,fontWeight:600}}>{sel.inicio||"No definido"}</div>
                </div>
                <div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",marginBottom:4}}>INGRESOS CLIENTE</div>
                  <div style={{fontSize:13,fontWeight:600}}>{sel.ingresos}</div>
                </div>
              </div>
            )}

            {/* CHAT IA */}
            {panelTab==="ia"&&(
              <div style={{display:"flex",flexDirection:"column",minHeight:360}}>
                <div ref={chatRef} style={{flex:1,marginBottom:10,display:"flex",flexDirection:"column",gap:8,maxHeight:360,overflow:"auto"}}>
                  {chat.length===0&&(
                    <div style={{textAlign:"center",padding:"28px 0",color:"rgba(255,255,255,0.18)"}}>
                      <div style={{fontSize:22,marginBottom:6}}>✦</div>
                      <div style={{fontSize:11}}>Pregunta sobre {sel.nombre}</div>
                    </div>
                  )}
                  {chat.map((m,i)=>(
                    <div key={i} style={{alignSelf:m.r==="user"?"flex-end":"flex-start",maxWidth:"86%",
                      padding:"9px 12px",borderRadius:m.r==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",
                      background:m.r==="user"?"rgba(245,197,24,0.1)":"rgba(255,255,255,0.04)",
                      border:`1px solid ${m.r==="user"?"rgba(245,197,24,0.18)":"rgba(255,255,255,0.06)"}`}}>
                      {m.r==="ai"&&<div style={{fontSize:8,color:G,fontWeight:700,marginBottom:3,letterSpacing:"0.1em"}}>✦ IA 360™</div>}
                      <div style={{fontSize:11,color:m.r==="user"?G:"rgba(255,255,255,0.78)",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{m.t}</div>
                    </div>
                  ))}
                  {chatLoad&&(
                    <div style={{alignSelf:"flex-start",display:"flex",gap:7,padding:"7px 12px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"1px solid rgba(255,255,255,0.06)"}}>
                      <Spin sz={11}/><span style={{fontSize:10,color:"rgba(255,255,255,0.28)"}}>Analizando...</span>
                    </div>
                  )}
                </div>
                <div style={{display:"flex",gap:7}}>
                  <input style={{...INP,flex:1,fontSize:11}} placeholder={`Pregunta sobre ${sel.nombre}...`}
                    value={chatInp} onChange={e=>setChatInp(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();enviarChat();}}}/>
                  <button onClick={enviarChat} disabled={chatLoad||!chatInp.trim()}
                    style={{...BtnG,opacity:chatInp.trim()?1:0.35,padding:"9px 13px"}}>→</button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ══ PANEL LATERAL EQUIPO ═════════════════════════════════════ */}
      {selEq&&!sel&&(
        <div style={{width:360,background:S1,borderLeft:"1px solid rgba(255,255,255,0.04)",
          display:"flex",flexDirection:"column",animation:"slideR .25s ease",flexShrink:0,
          position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
          <div style={{padding:"20px 20px 14px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:42,height:42,borderRadius:12,background:`${selEq.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:800,color:selEq.color}}>{selEq.nombre.charAt(0)}</div>
                <div>
                  <div style={{fontWeight:800,fontSize:14}}>{selEq.nombre}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:1}}>{selEq.rol} · {selEq.especialidad}</div>
                </div>
              </div>
              <button onClick={()=>setSelEq(null)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.2)",cursor:"pointer",fontSize:17}}>✕</button>
            </div>
          </div>
          <div style={{flex:1,overflow:"auto",padding:"16px 20px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              <div style={card({padding:12})}>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:3}}>HONORARIO</div>
                <div style={{fontSize:16,fontWeight:800,color:G}}>{fmt(selEq.pago)}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",marginTop:2}}>{selEq.tipoPago}</div>
              </div>
              <div style={card({padding:12})}>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:3}}>EMAIL</div>
                <div style={{fontSize:10,fontWeight:600,color:BLUE}}>{selEq.email}</div>
              </div>
            </div>
            {/* Clientes asignados */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:700,marginBottom:8,color:"rgba(255,255,255,0.5)",letterSpacing:"0.08em"}}>CLIENTES ASIGNADOS</div>
              {selEq.clientes.map(cid=>{
                const c=clientes.find(x=>x.id===cid);
                if(!c) return null;
                return (
                  <div key={cid} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:22,height:22,borderRadius:6,background:`${c.color}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:c.color}}>{c.nombre.charAt(0)}</div>
                      <span style={{fontSize:12,fontWeight:600}}>{c.nombre}</span>
                    </div>
                    <span style={pill(fc[c.fase]||G)}>{c.fase}</span>
                  </div>
                );
              })}
              {selEq.clientes.length===0&&<div style={{fontSize:11,color:"rgba(255,255,255,0.2)"}}>Sin clientes asignados.</div>}
            </div>
            {/* Historial pagos */}
            <div>
              <div style={{fontSize:10,fontWeight:700,marginBottom:8,color:"rgba(255,255,255,0.5)",letterSpacing:"0.08em"}}>HISTORIAL PAGOS</div>
              {selEq.pagos.length===0&&<div style={{fontSize:11,color:"rgba(255,255,255,0.2)"}}>Sin registros.</div>}
              {selEq.pagos.map(p=>{
                const pe=PAGO_ESTADO[p.estado]||{c:"#555",l:p.estado};
                return (
                  <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:600}}>{p.mes}</div>
                      {p.fecha&&<div style={{fontSize:9,color:"rgba(255,255,255,0.25)",marginTop:1}}>{p.estado==="pagado"?`Pagado ${p.fecha}`:""}</div>}
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:12,fontWeight:700,color:pe.c}}>{p.monto>0?fmt(p.monto):"—"}</div>
                      <span style={pill(pe.c)}>{pe.l}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ MODALES ══════════════════════════════════════════════════ */}
      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
          onClick={()=>{setModal(null);setModalData({})}}>
          <div style={{...card(),width:420,maxWidth:"95vw",animation:"fadeUp .2s ease"}}
            onClick={e=>e.stopPropagation()}>

            {/* CLIENTE */}
            {modal==="cliente"&&(
              <>
                <div style={{fontWeight:800,fontSize:15,marginBottom:16}}>+ Nuevo cliente</div>
                {[["nombre","Nombre del negocio *","text"],["sector","Sector","text"],["contacto","Contacto","text"],
                  ["email","Email","email"],["wa","WhatsApp","text"],["servicio","Tipo de servicio","text"],
                  ["ingresos","Rango de ingresos","text"],["contrato","Valor contrato COP","number"]].map(([f,l,t])=>(
                  <div key={f} style={{marginBottom:10}}>
                    <div style={{fontSize:8,color:"rgba(255,255,255,0.25)",letterSpacing:"0.1em",marginBottom:4}}>{l.toUpperCase()}</div>
                    <input type={t} style={INP} placeholder={l} value={modalData[f]||""} onChange={e=>setModalData(p=>({...p,[f]:e.target.value}))}/>
                  </div>
                ))}
              </>
            )}

            {/* CONTENIDO */}
            {modal==="contenido"&&(
              <>
                <div style={{fontWeight:800,fontSize:15,marginBottom:16}}>+ Pieza de contenido — {sel?.nombre}</div>
                {[["semana","Semana (fecha)","date"],["tipo","Tipo (Reels / Carrusel / Stories / Post)","text"],
                  ["descripcion","Descripción","text"],["responsable","Responsable","text"],["observacion","Observación","text"]].map(([f,l,t])=>(
                  <div key={f} style={{marginBottom:10}}>
                    <div style={{fontSize:8,color:"rgba(255,255,255,0.25)",letterSpacing:"0.1em",marginBottom:4}}>{l.toUpperCase()}</div>
                    <input type={t} style={INP} placeholder={l} value={modalData[f]||""} onChange={e=>setModalData(p=>({...p,[f]:e.target.value}))}/>
                  </div>
                ))}
              </>
            )}

            {/* PAUTA */}
            {modal==="pauta"&&(
              <>
                <div style={{fontWeight:800,fontSize:15,marginBottom:16}}>+ Nueva pauta — {sel?.nombre}</div>
                {[["plataforma","Plataforma (Meta Ads / Google / TikTok)","text"],["presupuesto","Presupuesto COP","number"],
                  ["inicio","Fecha inicio","date"],["fin","Fecha fin","date"],["objetivo","Objetivo (Tráfico / Ventas / Marca)","text"]].map(([f,l,t])=>(
                  <div key={f} style={{marginBottom:10}}>
                    <div style={{fontSize:8,color:"rgba(255,255,255,0.25)",letterSpacing:"0.1em",marginBottom:4}}>{l.toUpperCase()}</div>
                    <input type={t} style={INP} placeholder={l} value={modalData[f]||""} onChange={e=>setModalData(p=>({...p,[f]:e.target.value}))}/>
                  </div>
                ))}
              </>
            )}

            {/* ENTREGABLE */}
            {modal==="entregable"&&(
              <>
                <div style={{fontWeight:800,fontSize:15,marginBottom:16}}>+ Entregable — {sel?.nombre}</div>
                {[["nombre","Nombre del entregable","text"],["tipo","Tipo (Estrategia / Informe / Propuesta / Diagnóstico)","text"],
                  ["fecha","Fecha límite","date"]].map(([f,l,t])=>(
                  <div key={f} style={{marginBottom:10}}>
                    <div style={{fontSize:8,color:"rgba(255,255,255,0.25)",letterSpacing:"0.1em",marginBottom:4}}>{l.toUpperCase()}</div>
                    <input type={t} style={INP} placeholder={l} value={modalData[f]||""} onChange={e=>setModalData(p=>({...p,[f]:e.target.value}))}/>
                  </div>
                ))}
              </>
            )}

            {/* EQUIPO */}
            {modal==="equipo"&&(
              <>
                <div style={{fontWeight:800,fontSize:15,marginBottom:16}}>+ Nuevo miembro</div>
                {[["nombre","Nombre completo *","text"],["rol","Rol (Content Creator / Diseñador / Media Buyer)","text"],
                  ["especialidad","Especialidad","text"],["email","Email","email"],
                  ["pago","Honorario COP mensual","number"],["tipoPago","Tipo pago (Mensual fijo / Por proyecto / Por cliente)","text"]].map(([f,l,t])=>(
                  <div key={f} style={{marginBottom:10}}>
                    <div style={{fontSize:8,color:"rgba(255,255,255,0.25)",letterSpacing:"0.1em",marginBottom:4}}>{l.toUpperCase()}</div>
                    <input type={t} style={INP} placeholder={l} value={modalData[f]||""} onChange={e=>setModalData(p=>({...p,[f]:e.target.value}))}/>
                  </div>
                ))}
              </>
            )}

            <div style={{display:"flex",gap:8,marginTop:16}}>
              <button style={{...BtnO,flex:1}} onClick={()=>{setModal(null);setModalData({})}}>Cancelar</button>
              <button style={{...BtnG,flex:1}} onClick={guardarModal}>Guardar →</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
