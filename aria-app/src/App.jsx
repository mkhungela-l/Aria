import React, { useState, useEffect, useRef } from "react";
import {
  Brain, Shield, Activity, AlertTriangle, Check, X, Send, ChevronDown, ChevronRight,
  ArrowRight, Plus, Download, Upload, Settings, Lock, Users, Workflow, FileText,
  FlaskConical, MessageSquareQuote, ShieldAlert, Eye, RefreshCw, Link2, BarChart2,
  Inbox, Calendar, Archive, Sparkles, UserCheck, Bot, Layers, GitBranch, Code2,
  Building2, Search, Bell, Database, Zap, TrendingUp, Clock, CheckCircle2,
  MessageCircle, Star, Pencil, Wallet, BookOpen, Globe, AlertCircle, Share2,
  Tag, Filter, ToggleLeft, ToggleRight, ChevronUp, Hash, Cpu, Radio, AlignLeft, 
  LayoutDashboard, Copy, Info, History
} from "lucide-react";

/* ════════════════════════════════════════════════════
   ARIA — Adaptive Requirements & Intelligence Architecture
   iOCO's Internal AI Platform | Role-Based SDLC Workflow
════════════════════════════════════════════════════ */

const C = {
  teal:"#059669",tealDk:"#065F46",tealLt:"#D1FAE5",tealMid:"#34D399",
  amber:"#D97706",amberLt:"#FEF3C7",amberMid:"#F59E0B",
  coral:"#DC2626",coralLt:"#FEE2E2",coralMid:"#EF4444",
  blue:"#2563EB",blueLt:"#DBEAFE",blueM:"#3B82F6",
  purple:"#7C3AED",purpleLt:"#EDE9FE",
  ink:"#0D1117",mid:"#374151",muted:"#6B7280",
  border:"#E5E7EB",soft:"#F9FAFB",paper:"#FFFFFF",
};

const ROLES = {
  ba:{ key:"ba",name:"Naledi Mokoena",title:"Senior Business Analyst",avatar:"NM",color:C.amber,team:"Standard Bank · CX",focus:"Requirements quality" },
  ux:{ key:"ux",name:"Rachel van Wyk",title:"UX Designer",avatar:"RV",color:C.purple,team:"Standard Bank · CX",focus:"User Experience" },
  qa:{ key:"qa",name:"Thabo Sithole",title:"QA Lead",avatar:"TS",color:C.teal,team:"Sasol · OT",focus:"Test coverage" },
  dev:{ key:"dev",name:"Imran Patel",title:"Tech Lead",avatar:"IP",color:C.coral,team:"Discovery · Claims",focus:"Sprint delivery" },
  pm:{ key:"pm",name:"Sipho Khumalo",title:"Delivery Manager",avatar:"SK",color:C.blue,team:"Cross-portfolio",focus:"Sprint readiness" },
  admin:{ key:"admin",name:"Kagiso Moyo",title:"Platform Administrator",avatar:"KM",color:C.blueM,team:"iOCO IT Governance",focus:"Platform governance" },
};

const INIT_SHADOW = [
  { id:"SA-1",user:"Thabo S.",dept:"Delivery",action:"Accessed chat.openai.com",data:"Pasted Sasol contract text",risk:"HIGH",time:"09:14",resolved:false },
  { id:"SA-2",user:"Rachel v.W.",dept:"UX",action:"Accessed gemini.google.com",data:"Uploaded client presentation",risk:"HIGH",time:"09:47",resolved:false }
];

const INIT_AUDIT = [
  { id:"AL-001",user:"Naledi M.",module:"Requirements",action:"Analysed PRJ-118 requirements",classification:"Client-Confidential",tokens:1847,time:"08:32",status:"ok" }
];

const DEPT_USAGE = [
  { dept:"Delivery",users:48,interactions:1203,tokens:2840000,saved:"34.2 hrs",score:87 },
  { dept:"Development",users:63,interactions:892,tokens:1960000,saved:"28.1 hrs",score:91 }
];

const SAMPLE_REQS = `Client Portal Requirements — Standard Bank Managed Services\n\nThe portal should allow clients to view their IT infrastructure status. Users need to be able to log tickets when something breaks. The system must be fast and work on mobile devices.\n\nAdmins should have more access than regular users. Monthly reports need to be generated automatically and emailed to clients. Data must be kept safe and comply with regulations.\n\nThe password reset process must work. Users should receive notifications when ticket statuses change. The system needs to handle a lot of users at the same time and should be available most of the time. Integration with the existing monitoring platform is required.`;

const INIT_DOCS = [
  { id: "DOC-1", title: "Standard Bank Portal Req", content: SAMPLE_REQS, lastEdited: "09:41 AM", analysis: null }
];

const INIT_ISSUES = [
  { id:"I-01",severity:"critical",cat:"Unmeasurable",quote:'"the system must be fast"',problem:"No latency target.",fix:"Dashboard ≤ 1.5s P95. Ticket submit ≤ 800ms P95.",state:null,comments:[], docId: "DOC-1" },
  { id:"I-02",severity:"critical",cat:"POPIA",quote:'"data must be kept safe and comply with regulations"',problem:"POPIA Section 19 safeguards missing.",fix:"Name data classes, AES-256 encryption, Azure af-south-1 SA-only residency.",state:null,comments:[], docId: "DOC-1" },
  { id:"I-03",severity:"high",cat:"Missing",quote:'"admins should have more access"',problem:"RBAC matrix undefined.",fix:"Define: Client Viewer, Client Admin, iOCO Operator, Super Admin with capability matrix.",state:null,comments:[], docId: "DOC-1" },
];

const DEPT_MODULES = [
  { id:"requirements",name:"Requirements Intelligence",icon:"📋",dept:"Delivery",users:48,desc:"Analyse requirement documents." },
  { id:"design",name:"Design Intelligence",icon:"🎨",dept:"UX",users:19,desc:"Analyse wireframes and UX flows." },
];

// ENHANCED CLASSIFICATION ENGINE WITH CONTEXT
const classifyData = (text) => {
  const t = text.toLowerCase();
  const patterns = {
    "Client-Confidential": {
      keywords: ["client","contract","proposal","standard bank","sasol","discovery","multichoice","account","invoice","salary","revenue","budget"],
      desc: "Contains client-specific project details, financial data, or external contracts."
    },
    "iOCO-Internal": {
      keywords: ["ioco","internal","sprint","jira","confluence","team","project","delivery","employee"],
      desc: "Contains internal operational data, sprint planning, or company proprietary methodologies."
    },
    "Restricted": {
      keywords: ["password","secret","key","token","credential","private","id number","sa id"],
      desc: "Contains highly sensitive credentials or regulated Personal Identifiable Information (PII)."
    },
    "Public": {
      keywords: ["hello","hi","what is","explain","define","how does"],
      desc: "General knowledge or non-sensitive technical queries."
    }
  };
  
  const pii = ["id number","email","@","phone","address","salary","account number","date of birth"];
  const foundPII = pii.filter(p => t.includes(p));

  let classification = "Public";
  let matchedKeywords = [];
  let contextDesc = patterns["Public"].desc;

  for (const [cls, data] of Object.entries(patterns)) {
    const matches = data.keywords.filter(k => t.includes(k));
    if (matches.length > 0) {
      classification = cls;
      matchedKeywords = matches;
      contextDesc = data.desc;
      break;
    }
  }

  // Force Restricted if PII is found
  if (foundPII.length > 0 && classification !== "Restricted") {
    classification = "Restricted";
    contextDesc = "Regulated PII was detected. Immediate policy enforcement required.";
  }

  return { 
    classification, 
    piiDetected: foundPII, 
    matchedKeywords,
    contextDesc,
    riskLevel: classification === "Restricted" ? "HIGH" : classification === "Client-Confidential" ? "MED" : "LOW" 
  };
};

const classColor = c => c==="Client-Confidential"?C.amber:c==="Restricted"?C.coral:c==="iOCO-Internal"?C.blue:C.teal;
const sevColor = s => s==="critical"?C.coral:s==="high"?C.amber:s==="medium"?C.blue:C.muted;
const sevBg = s => s==="critical"?C.coralLt:s==="high"?C.amberLt:s==="medium"?C.blueLt:C.soft;

// ── UI ATOMS ─────────────────────────────────────────────────────────────────
function Badge({children,color=C.muted,bg=C.soft,style={}}) {
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 10px",borderRadius:99,fontSize:11,fontWeight:600,color,background:bg,letterSpacing:"0.02em",...style}}>{children}</span>;
}

function Btn({children,onClick,primary,danger,small,disabled,full,style={}}) {
  const bg=disabled?"#E5E7EB":danger?C.coral:primary?C.ink:C.paper;
  const col=disabled?C.muted:danger||primary?"#fff":C.ink;
  return <button onClick={disabled?undefined:onClick} disabled={disabled} style={{display:"inline-flex",alignItems:"center",gap:6,padding:small?"5px 12px":"8px 16px",borderRadius:8,fontSize:small?12:13,fontWeight:600,background:bg,color:col,border:!primary&&!danger&&!disabled?`1px solid ${C.border}`:"none",cursor:disabled?"not-allowed":"pointer",width:full?"100%":"auto",justifyContent:full?"center":"flex-start",opacity:disabled?.5:1,transition:"all 0.15s",...style}}>{children}</button>;
}

function Card({children,style={}}) {
  return <div style={{background:C.paper,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px",...style}}>{children}</div>;
}

function SectionH({title,sub,right,icon:Icon}) {
  return <div style={{marginBottom:20}}>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
      <div style={{display:"flex",gap:12}}>
        {Icon && <div style={{width:40,height:40,borderRadius:10,background:C.ink,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><Icon size={20}/></div>}
        <div>
          <h2 style={{fontSize:24,fontWeight:800,color:C.ink,margin:"0 0 6px",letterSpacing:"-0.02em"}}>{title}</h2>
          {sub&&<p style={{fontSize:13,color:C.muted,margin:0,lineHeight:1.6,maxWidth:800}}>{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  </div>;
}

function useToasts() {
  const [toasts,set]=useState([]);
  const add=(msg,type="ok")=>{const id=Date.now()+Math.random();set(t=>[...t,{id,msg,type}]);setTimeout(()=>set(t=>t.filter(x=>x.id!==id)),4500);};
  return{toasts,add};
}

function Toasts({toasts}) {
  return <div style={{position:"fixed",top:16,right:16,zIndex:999,display:"flex",flexDirection:"column",gap:8,width:340}}>
    {toasts.map(t=><div key={t.id} style={{background:t.type==="ok"?C.teal:t.type==="warn"?C.amber:t.type==="alert"?C.coral:C.ink,color:"#fff",borderRadius:10,padding:"12px 16px",fontSize:13,lineHeight:1.5,boxShadow:"0 4px 20px rgba(0,0,0,.15)"}}>{t.msg}</div>)}
  </div>;
}

function Modal({title,children,onClose,wide}) {
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24}} onClick={onClose}>
    <div style={{background:C.paper,borderRadius:16,padding:28,width:"100%",maxWidth:wide?640:500,maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{fontSize:18,fontWeight:700,color:C.ink,margin:0}}>{title}</h3>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:C.muted}}>×</button>
      </div>
      {children}
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════════════════════
//  ENTERPRISE HUB
// ══════════════════════════════════════════════════════════════════════════════
function EnterpriseHub({setView,shadowAlerts}) {
  const stats=[
    {v:"847",l:"AI interactions today",sub:"across all departments",c:C.teal},
    {v:"0",l:"client data records exposed",sub:"to external AI agents",c:C.teal},
    {v:"3",l:"shadow AI alerts",sub:"employees intercepted",c:C.coral},
    {v:"R2.4M",l:"projected annual savings",sub:"from external AI replaced",c:C.amber},
  ];
  return <div>
    <SectionH title="Enterprise Hub" icon={Building2} sub="iOCO's internal AI platform — real-time view of every AI interaction, every data protection decision, and every cost saving across all departments."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginBottom:20}}>
      {stats.map(s=><Card key={s.l}>
        <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{s.l}</div>
        <div style={{fontSize:28,fontWeight:800,color:s.c,lineHeight:1}}>{s.v}</div>
        <div style={{fontSize:12,color:C.muted,marginTop:4}}>{s.sub}</div>
      </Card>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card>
        <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:12}}>Platform health</div>
        {[{l:"Private AI core",v:"Healthy",c:C.teal},{l:"Data sovereignty",v:"100% — af-south-1",c:C.teal},{l:"POPIA compliance",v:"94% — review needed",c:C.amber}].map(h=><div key={h.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13,alignItems:"center"}}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{width:7,height:7,borderRadius:"50%",background:h.c,flexShrink:0}}/><span style={{color:C.muted}}>{h.l}</span></div>
          <span style={{fontWeight:600,color:h.c}}>{h.v}</span>
        </div>)}
      </Card>
      <Card style={{background: C.soft, border: `1px solid ${C.blueLt}`}}>
        <h3 style={{fontSize:15, fontWeight: 700, marginBottom: 8, color: C.ink}}><Globe size={16} style={{display:'inline', verticalAlign:'middle', marginRight: 6}}/>Live Data Sovereignty Map</h3>
        <p style={{fontSize:12, color: C.muted, marginBottom: 12}}>Visualizing routing of internal queries vs blocked external AI calls.</p>
        <div style={{display:"flex", alignItems:"center", gap: 10, fontSize:12, background: C.paper, padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`}}>
          <Badge color={C.teal} bg={C.tealLt}>af-south-1 (Azure)</Badge> 
          <ArrowRight size={12} color={C.teal}/>
          <span style={{fontWeight: 600}}>Internal Processing (Allowed)</span>
        </div>
        <div style={{display:"flex", alignItems:"center", gap: 10, fontSize:12, marginTop: 8, background: C.paper, padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`}}>
          <Badge color={C.coral} bg={C.coralLt}>us-east (OpenAI)</Badge> 
          <X size={12} color={C.coral}/>
          <span style={{color: C.coral, fontWeight: 600}}>Blocked by ARIA Interceptor</span>
        </div>
      </Card>
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════════════════════
//  DATA SHIELD (ENHANCED WITH INTERACTIVITY AND CONTEXT)
// ══════════════════════════════════════════════════════════════════════════════
function DataShieldView({toast, scanHistory, setScanHistory, docs, setDocs, setView}) {
  const [input,setInput]=useState("");
  const [activeResult,setActiveResult]=useState(null);
  const [scanning,setScanning]=useState(false);
  
  const examples=[
    {label:"Client contract snippet",text:"Standard Bank requires all transaction data to be encrypted. Employee ID numbers and account balances must comply with POPIA Section 19."},
    {label:"Internal sprint note",text:"Team: let's discuss the PRJ-118 sprint velocity in tomorrow's standup. Jira board has been updated."},
    {label:"Public knowledge query",text:"What is the definition of a REST API and how does it differ from GraphQL?"},
  ];

  const classify=()=>{
    if(!input.trim()) return;
    setScanning(true);
    setActiveResult(null);
    setTimeout(()=>{
      setScanning(false);
      const res = classifyData(input);
      const newScan = { id: `SCAN-${Date.now().toString().slice(-4)}`, text: input, result: res, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
      setActiveResult(newScan);
      setScanHistory([newScan, ...scanHistory]);
    },1000);
  };

  const sendToDocHub = () => {
    if(!activeResult) return;
    const newDoc = { id: `DOC-${docs.length+1}`, title: `Imported from Shield (${activeResult.id})`, content: activeResult.text, lastEdited: "Just now", analysis: null };
    setDocs([...docs, newDoc]);
    toast("Document safely imported to Doc Hub.","ok");
    setView("doc-hub");
  };

  return <div>
    <SectionH title="Data Shield — Contextual Classification" icon={Lock} sub="Understand exactly how ARIA interprets and protects your data. Scan text to see its classification, the rules it matched, and recommended actions."/>
    
    <div style={{display:"grid",gridTemplateColumns:"1fr 380px",gap:20}}>
      {/* LEFT COLUMN: SCANNER & HISTORY */}
      <div style={{display:"flex", flexDirection:"column", gap:14}}>
        <Card>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:600,color:C.ink}}>Input Scanner</div>
            <div style={{fontSize:11, color:C.muted}}>Try an example:</div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
            {examples.map(e=><button key={e.label} onClick={()=>{setInput(e.text); setActiveResult(null);}} style={{fontSize:11,padding:"4px 10px",borderRadius:20,background:C.soft,border:`1px solid ${C.border}`,cursor:"pointer",color:C.mid, transition:"background 0.2s"}} onMouseOver={(e)=>e.target.style.background=C.border} onMouseOut={(e)=>e.target.style.background=C.soft}>{e.label}</button>)}
          </div>
          <textarea value={input} onChange={e=>{setInput(e.target.value);setActiveResult(null);}} rows={6} placeholder="Paste any text here to preview its classification..." style={{width:"100%",padding:14,border:`1px solid ${C.border}`,borderRadius:8,fontSize:14,lineHeight:1.6,resize:"vertical",fontFamily:"inherit"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}>
            <span style={{fontSize:12,color:C.muted}}>{input.length} characters</span>
            <Btn primary onClick={classify} disabled={!input.trim()||scanning}>{scanning?<><RefreshCw className="spin" size={14}/> Scanning Policies...</>:<><Shield size={14}/> Analyze Data</>}</Btn>
          </div>
        </Card>

        {scanHistory.length > 0 && (
          <Card style={{padding: 0, overflow: 'hidden'}}>
            <div style={{padding:"12px 16px", background:C.soft, borderBottom:`1px solid ${C.border}`, fontSize:12, fontWeight:700, color:C.muted, display:"flex", alignItems:"center", gap:6}}>
              <History size={14}/> Scan History
            </div>
            <div style={{maxHeight: 250, overflowY: "auto"}}>
              {scanHistory.map(scan => (
                <div key={scan.id} onClick={()=>setActiveResult(scan)} style={{padding:"12px 16px", borderBottom:`1px solid ${C.border}`, cursor:"pointer", background: activeResult?.id === scan.id ? C.blueLt : "transparent", transition: "background 0.2s"}}>
                  <div style={{display:"flex", justifyContent:"space-between", marginBottom:4}}>
                    <span style={{fontSize:13, fontWeight:600, color:C.ink}}>{scan.id}</span>
                    <span style={{fontSize:11, color:C.muted}}>{scan.time}</span>
                  </div>
                  <div style={{fontSize:12, color:C.muted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginBottom:8}}>{scan.text}</div>
                  <Badge color={classColor(scan.result.classification)} bg={classColor(scan.result.classification)+"22"}>{scan.result.classification}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* RIGHT COLUMN: CONTEXT & RULES */}
      <div style={{display:"flex", flexDirection:"column", gap:14}}>
        {!activeResult && !scanning ? (
          <Card style={{textAlign:"center",padding:"80px 20px",color:C.muted, height:"100%"}}>
            <Lock style={{width:48,height:48,margin:"0 auto 16px",opacity:.2}}/>
            <div style={{fontSize:16,fontWeight:600, color:C.ink, marginBottom:8}}>Awaiting Input</div>
            <div style={{fontSize:13, lineHeight:1.5}}>Paste text and click Analyze to view detailed classification context and reasoning.</div>
          </Card>
        ) : activeResult ? (
          <Card style={{display:"flex", flexDirection:"column", gap:16}}>
            {/* The Result Header */}
            <div style={{background:classColor(activeResult.result.classification)+"15",border:`2px solid ${classColor(activeResult.result.classification)}30`,borderRadius:12,padding:20,textAlign:"center"}}>
              <div style={{fontSize:11,fontWeight:800,color:classColor(activeResult.result.classification),textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Detected Classification</div>
              <div style={{fontSize:26,fontWeight:800,color:classColor(activeResult.result.classification),marginBottom:8}}>{activeResult.result.classification}</div>
              <Badge color={activeResult.result.riskLevel==="HIGH"?C.coral:activeResult.result.riskLevel==="MED"?C.amber:C.teal} bg="rgba(255,255,255,0.8)">Risk Level: {activeResult.result.riskLevel}</Badge>
            </div>

            {/* Context & Reasoning */}
            <div>
              <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:8, display:"flex", alignItems:"center", gap:6}}><Info size={14} color={C.blue}/> Classification Context</div>
              <div style={{fontSize:13, color:C.mid, lineHeight:1.6, background:C.soft, padding:12, borderRadius:8, border:`1px solid ${C.border}`}}>
                <span style={{fontWeight:600}}>{activeResult.result.contextDesc}</span>
                {activeResult.result.matchedKeywords.length > 0 && (
                  <div style={{marginTop: 8}}>
                    <span style={{color:C.muted, fontSize:12}}>Matched Keywords: </span>
                    <div style={{display:"flex", gap:4, flexWrap:"wrap", marginTop:4}}>
                      {activeResult.result.matchedKeywords.map(k=><Badge key={k} color={C.mid} bg={C.border}>"{k}"</Badge>)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PII Alert */}
            {activeResult.result.piiDetected.length > 0 && (
              <div style={{border:`1px solid ${C.coral}40`, background:C.coralLt, borderRadius:8, padding:12}}>
                <div style={{fontSize:13,fontWeight:700,color:C.coral,marginBottom:6, display:"flex", alignItems:"center", gap:6}}><AlertTriangle size={14}/> PII Detected</div>
                <div style={{display:"flex", gap:4, flexWrap:"wrap", marginBottom:8}}>
                  {activeResult.result.piiDetected.map(p=><Badge key={p} color={C.coral} bg="white">{p}</Badge>)}
                </div>
                <div style={{fontSize:11, color:C.coralMid, lineHeight:1.5}}>Data contains regulated personal info. Do not export outside iOCO.</div>
              </div>
            )}

            {/* Actions */}
            <div style={{marginTop:"auto", paddingTop:16, borderTop:`1px solid ${C.border}`}}>
              {activeResult.result.classification === "Restricted" ? (
                <Btn full danger onClick={()=>toast("Exception request sent to CISO for review.", "ok")}>Request Restricted Exception</Btn>
              ) : (
                <Btn full primary onClick={sendToDocHub}>Safe: Send to Doc Hub for Editing <ArrowRight size={14}/></Btn>
              )}
            </div>
          </Card>
        ) : (
          <Card style={{display:"flex", alignItems:"center", justifyContent:"center", height:"100%"}}>
            <div style={{display:"flex", flexDirection:"column", alignItems:"center", color:C.teal}}>
              <RefreshCw className="spin" size={32} style={{marginBottom:16}}/>
              <div style={{fontSize:14, fontWeight:600}}>Analyzing text against 42 policy rules...</div>
            </div>
          </Card>
        )}
      </div>
    </div>
    <style>{`
      @keyframes spin { 100% { transform: rotate(360deg); } }
      .spin { animation: spin 1.2s linear infinite; }
    `}</style>
  </div>;
}

// ══════════════════════════════════════════════════════════════════════════════
//  DOC HUB
// ══════════════════════════════════════════════════════════════════════════════
function DocHubView({docs, setDocs, setView, toast, setSelectedDocId}) {
  const [activeDoc, setActiveDoc] = useState(docs[0] || null);

  const handleCreate = () => {
    const newDoc = { id: `DOC-${docs.length+1}`, title: "Untitled Document", content: "", lastEdited: "Just now", analysis: null };
    setDocs([...docs, newDoc]);
    setActiveDoc(newDoc);
  };

  const handleUpdate = (val) => {
    const updated = { ...activeDoc, content: val, lastEdited: "Just now" };
    setActiveDoc(updated);
    setDocs(docs.map(d => d.id === updated.id ? updated : d));
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target.result;
      const newDoc = { id: `DOC-${docs.length+1}`, title: file.name, content: result.length < 50 ? SAMPLE_REQS : result, lastEdited: "Just now", analysis: null };
      setDocs([...docs, newDoc]);
      setActiveDoc(newDoc);
      toast(`Imported ${file.name}`, "ok");
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  return <div>
    <SectionH title="Document Hub" icon={FileText} sub="Import, edit, and organize your tasks/requirements here. When you are ready, send the document to ARIA for a full SDLC analysis." 
      right={<div>
        <label style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:8,fontSize:13,fontWeight:600,background:C.paper,color:C.ink,border:`1px solid ${C.border}`,cursor:"pointer",marginRight:8, transition:"all 0.15s"}} onMouseOver={(e)=>e.target.style.background=C.soft} onMouseOut={(e)=>e.target.style.background=C.paper}>
          <Upload style={{width:14,height:14}}/> Import Doc
          <input type="file" style={{display:'none'}} accept=".txt,.pdf,.docx,.md" onChange={handleUpload}/>
        </label>
        <Btn primary onClick={handleCreate}><Plus style={{width:14,height:14}}/> New Doc</Btn>
      </div>}/>
    
    <div style={{display: "grid", gridTemplateColumns: "250px 1fr", gap: 14}}>
      <Card style={{padding: 0, height: 'calc(100vh - 200px)', overflowY: 'auto'}}>
        <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",padding:"16px 16px 8px"}}>Your Documents</div>
        {docs.length === 0 && <div style={{padding:"20px 16px", fontSize:13, color:C.muted, textAlign:"center"}}>No documents yet.</div>}
        {docs.map(d => (
          <div key={d.id} onClick={()=>setActiveDoc(d)} style={{padding: "12px 16px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", background: activeDoc?.id === d.id ? C.soft : "transparent", borderLeft: activeDoc?.id === d.id ? `3px solid ${C.teal}` : `3px solid transparent`, transition:"all 0.15s"}}>
            <div style={{fontSize: 13, fontWeight: 600, color: C.ink, marginBottom: 4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{d.title}</div>
            <div style={{display: "flex", justifyContent: "space-between", alignItems:"center"}}>
              <span style={{fontSize: 11, color: C.muted}}>{d.lastEdited}</span>
              {d.analysis && <Badge color={C.teal} bg={C.tealLt}>Analysed</Badge>}
            </div>
          </div>
        ))}
      </Card>
      
      {activeDoc ? (
        <Card style={{display:"flex", flexDirection:"column", height: 'calc(100vh - 200px)', gap:12}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <input value={activeDoc.title} onChange={(e)=>{
              const updated = {...activeDoc, title: e.target.value};
              setActiveDoc(updated); setDocs(docs.map(d=>d.id===updated.id?updated:d));
            }} style={{fontSize: 20, fontWeight: 800, border: "none", outline: "none", width: "100%", color: C.ink, background:"transparent"}} placeholder="Document Title"/>
            <Btn primary onClick={()=>{
              setSelectedDocId(activeDoc.id);
              setView("internal-ai");
              toast("Document loaded into ARIA. Ask for analysis.", "ok");
            }}><Brain style={{width:14,height:14}}/> Ask ARIA</Btn>
          </div>
          
          {/* Helpful context banner */}
          <div style={{background:C.blueLt, border:`1px solid ${C.blue}40`, borderRadius:8, padding:"10px 14px", display:"flex", gap:10, alignItems:"center", fontSize:12, color:C.mid}}>
            <Info size={16} color={C.blue} style={{flexShrink:0}}/>
            <span>Edit your content below. When ready, click <strong>Ask ARIA</strong> to hand this document over to the AI for an SDLC breakdown (Design, QA, Dev, etc).</span>
          </div>

          <textarea value={activeDoc.content} onChange={e=>handleUpdate(e.target.value)} style={{flex:1, width:"100%", padding: 14, border:`1px solid ${C.border}`, borderRadius:8, fontSize:14, lineHeight:1.6, resize:"none", fontFamily:"inherit", background: C.soft, outline:"none"}} placeholder="Write or paste your requirements/task details here..."/>
        </Card>
      ) : (
        <Card style={{display:"flex", alignItems:"center", justifyContent:"center", color: C.muted, height: 'calc(100vh - 200px)'}}>
          <div style={{textAlign: "center"}}>
            <FileText style={{width: 48, height: 48, margin: "0 auto 16px", opacity: 0.2}}/>
            <div style={{fontSize: 16, fontWeight: 600, color:C.ink}}>No Document Selected</div>
            <div style={{fontSize: 13, marginTop: 6, maxWidth:300, lineHeight:1.5}}>Select a document from the left, import a file, or create a new one to begin your workflow.</div>
          </div>
        </Card>
      )}
    </div>
  </div>;
}

// ══════════════════════════════════════════════════════════════════════════════
//  INTERNAL AI & ANALYSIS 
// ══════════════════════════════════════════════════════════════════════════════
function InternalAIAndAnalysisView({role, docs, setDocs, selectedDocId, setSelectedDocId, issues, setIssues, toast}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {role:"aria", text:`Good morning, ${role.name.split(' ')[0]}. I'm ARIA. I am ready to analyze documents for your ${role.title} tasks today.`, time:"Now"}
  ]);
  const [thinking, setThinking] = useState(false);
  const [awaitingReason, setAwaitingReason] = useState(null); 
  const [activeAnalysisTab, setActiveAnalysisTab] = useState(role.key);

  const bottomRef = useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages, thinking]);

  const activeDoc = docs.find(d => d.id === selectedDocId);

  const generateSDLCAnalysis = (docId) => {
    return {
      ba: { state: "pending", content: "**Business Analysis:**\n- Core objective: Enable mobile ticket logging.\n- Edge case: Users dropping offline.\n- Identified 3 ambiguous clauses requiring client clarity." },
      ux: { state: "pending", content: "**Design/UX Analysis:**\n- Interface must support 4 required fields maximum.\n- WCAG AA contrast compliance required on the dashboard.\n- Recommended flow: Auth -> Dashboard -> Floating Action Button for Tickets." },
      dev: { state: "pending", content: "**Architecture/Dev Analysis:**\n- Latency target: ≤ 800ms P95.\n- Backend API must support partial saves for offline mobile resilience.\n- Data residency: Azure af-south-1 only." },
      qa: { state: "pending", content: "**Testing/QA Strategy:**\n- Performance testing: Load test 2,500 concurrent users.\n- Security: Verify tenant isolation (HTTP 403 checks).\n- Functional: Form submission with empty state errors." },
      pm: { state: "pending", content: "**Scrum/Delivery:**\n- Estimated effort: 21 story points total.\n- Blocker: Missing monitoring platform name.\n- Risk: High impact POPIA exposure via email PDFs." }
    };
  };

  const handleSend = () => {
    if(!input.trim()) return;
    const text = input;
    setInput("");
    
    setMessages(m => [...m, {role: "user", text, time: new Date().toLocaleTimeString("en-ZA",{hour:"2-digit",minute:"2-digit"})}]);
    setThinking(true);

    setTimeout(() => {
      setThinking(false);

      if (awaitingReason) {
        setMessages(m => [...m, {role: "aria", text: `Reason logged. Routing request to ${awaitingReason.targetRole.toUpperCase()} model for full SDLC breakdown...`, time: new Date().toLocaleTimeString("en-ZA",{hour:"2-digit",minute:"2-digit"})}]);
        setAwaitingReason(null);
        
        setTimeout(() => {
          const newAnalysis = generateSDLCAnalysis(activeDoc?.id);
          setDocs(docs.map(d => d.id === activeDoc?.id ? {...d, analysis: newAnalysis} : d));
          setMessages(m => [...m, {role: "aria", text: "SDLC Analysis complete. The results are available in the Analysis Panel on the right.", time: new Date().toLocaleTimeString()}]);
          toast("Analysis generated for all roles.", "ok");
        }, 1500);
        return;
      }

      if (!activeDoc) {
        setMessages(m => [...m, {role: "aria", text: "Please select a document from the Doc Hub first so I know what to analyze.", time: new Date().toLocaleTimeString()}]);
        return;
      }

      const t = text.toLowerCase();
      let targetRole = role.key; 
      if(t.includes('design') || t.includes('ux') || t.includes('wireframe')) targetRole = 'ux';
      else if(t.includes('test') || t.includes('qa') || t.includes('quality')) targetRole = 'qa';
      else if(t.includes('dev') || t.includes('code') || t.includes('architecture')) targetRole = 'dev';
      else if(t.includes('ba') || t.includes('requirement')) targetRole = 'ba';

      if (targetRole !== role.key && targetRole !== 'admin') {
        setMessages(m => [...m, {role: "aria", text: `I noticed you are requesting analysis from the ${targetRole.toUpperCase()} Model, but you are assigned to ${role.title} work. Please provide a business reason for this cross-domain request so it can be logged in the audit trail.`, time: new Date().toLocaleTimeString()}]);
        setAwaitingReason({ targetRole, docId: activeDoc.id });
        return;
      }

      setMessages(m => [...m, {role: "aria", text: `Running analysis via the ${targetRole.toUpperCase()} Model for your role...`, time: new Date().toLocaleTimeString()}]);
      setTimeout(() => {
        const newAnalysis = generateSDLCAnalysis(activeDoc.id);
        setDocs(docs.map(d => d.id === activeDoc.id ? {...d, analysis: newAnalysis} : d));
        setActiveAnalysisTab(targetRole);
        setMessages(m => [...m, {role: "aria", text: "SDLC Analysis complete. I've generated insights across all disciplines. Review your specific output in the right panel.", time: new Date().toLocaleTimeString()}]);
        toast("Analysis generated.", "ok");
      }, 1500);

    }, 800);
  };

  const handleApprove = () => {
    if(!activeDoc || !activeDoc.analysis) return;
    const currentA = activeDoc.analysis;
    const updatedA = { ...currentA, [activeAnalysisTab]: { ...currentA[activeAnalysisTab], state: "approved" } };
    setDocs(docs.map(d => d.id === activeDoc.id ? {...d, analysis: updatedA} : d));
    toast(`${activeAnalysisTab.toUpperCase()} analysis approved.`, "ok");
  };

  const [revertModal, setRevertModal] = useState(null);
  const [revertReason, setRevertReason] = useState("");

  const handleRevertIssue = (iss) => {
    setRevertModal(iss);
    setRevertReason("");
  };

  const confirmRevert = () => {
    if(!revertReason.trim()) { toast("Please provide a reason.","warn"); return; }
    setIssues(issues.map(i => i.id === revertModal.id ? {...i, state: null, dismissReason: null, fixedAt: null} : i));
    toast(`Issue ${revertModal.id} reverted to Ambiguity list. Reason logged.`, "warn");
    setRevertModal(null);
  };

  const approvedRoles = activeDoc?.analysis ? Object.entries(activeDoc.analysis).filter(([k,v]) => v.state === "approved").map(([k])=>k) : [];
  const resolvedIssues = issues.filter(i => i.docId === activeDoc?.id && i.state === 'fixed');

  return <div>
    <SectionH title="Internal AI & Analysis" icon={Bot} sub="Chat with ARIA to analyze your selected document. Review cross-role SDLC outputs, approve them for delivery, and manage resolved issues."/>
    
    <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20}}>
      {/* LEFT: Chat Interface */}
      <Card style={{padding:0, display:"flex", flexDirection:"column", height: 'calc(100vh - 180px)'}}>
        <div style={{padding:"12px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div style={{fontSize: 14, fontWeight: 700, color:C.ink, display:"flex", alignItems:"center", gap:6}}><MessageCircle size={16}/> Chat Workspace</div>
          <div style={{fontSize: 11, color: C.muted, display:"flex", alignItems:"center", gap:6}}>
            Active Doc: {activeDoc ? <Badge color={C.ink} bg={C.soft}>{activeDoc.title}</Badge> : <span style={{color:C.coral}}>None Selected</span>}
          </div>
        </div>
        
        <div style={{flex: 1, overflowY:"auto", padding:"16px 20px", display:"flex", flexDirection:"column", gap:14}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:"flex",flexDirection:m.role==="user"?"row-reverse":"row",gap:10,alignItems:"flex-start"}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:m.role==="user"?role.color:C.ink,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",flexShrink:0}}>
                {m.role==="user"?role.avatar:"AI"}
              </div>
              <div style={{maxWidth:"80%"}}>
                <div style={{fontSize:11,color:C.muted,marginBottom:4,textAlign:m.role==="user"?"right":"left"}}>{m.role==="user"?role.name:"ARIA"} <span style={{marginLeft:6}}>{m.time}</span></div>
                <div style={{background:m.role==="user"?C.ink:C.soft,color:m.role==="user"?"#fff":C.mid,borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px",padding:"12px 16px",fontSize:13,lineHeight:1.65, whiteSpace:"pre-wrap"}}>{m.text}</div>
              </div>
            </div>
          ))}
          {thinking && <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:C.ink,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0}}>AI</div>
            <div style={{background:C.soft,borderRadius:"12px 12px 12px 4px",padding:"12px 16px"}}><div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:C.muted,display:"inline-block"}}/>)}</div></div>
          </div>}
          <div ref={bottomRef}/>
        </div>

        <div style={{padding:"12px 20px", borderTop:`1px solid ${C.border}`, display:"flex", gap:8}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSend();}}} rows={2} placeholder="Ask ARIA to analyze this document for your role..." style={{flex:1,padding:"10px 14px",border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,resize:"none",fontFamily:"inherit", outline:"none"}}/>
          <Btn primary onClick={handleSend} disabled={!input.trim()||thinking}><Send style={{width:14,height:14}}/>Send</Btn>
        </div>
      </Card>

      {/* RIGHT: Document & Analysis View */}
      <div style={{display: "flex", flexDirection: "column", gap: 14, height: 'calc(100vh - 180px)', overflowY: 'auto'}}>
        {!activeDoc ? (
          <Card style={{textAlign: "center", padding: "80px 20px", color: C.muted, height:"100%", display:"flex", flexDirection:"column", justifyContent:"center"}}>
            <FileText style={{width:48,height:48,margin:"0 auto 16px",opacity:.2}}/>
            <div style={{fontSize:16,fontWeight:600, color:C.ink}}>No Document Selected</div>
            <div style={{fontSize:13,marginTop:6, maxWidth:300, margin:"0 auto", lineHeight:1.5}}>Go to the Doc Hub to import or select a document to analyze.</div>
          </Card>
        ) : (
          <>
            <Card style={{padding: 0}}>
              <div style={{padding: "12px 16px", background: C.soft, borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700, display:"flex", alignItems:"center", gap:6}}>
                <FileText size={16} color={C.mid}/> Snapshot: {activeDoc.title}
              </div>
              <div style={{padding: "16px", fontSize: 13, color: C.muted, height: 100, overflowY: "auto", fontStyle: "italic", whiteSpace: "pre-wrap", background:"#FAFAFA"}}>
                {activeDoc.content}
              </div>
            </Card>

            {activeDoc.analysis ? (
              <Card style={{padding: 0, flex: 1, display: "flex", flexDirection: "column"}}>
                <div style={{display: "flex", borderBottom: `1px solid ${C.border}`, background: C.soft, overflowX: "auto"}}>
                  {['ba', 'ux', 'dev', 'qa', 'pm'].map(r => (
                    <button key={r} onClick={()=>setActiveAnalysisTab(r)} style={{flex:1, padding: "12px 0", background: "none", border: "none", borderBottom: activeAnalysisTab === r ? `2px solid ${C.teal}` : `2px solid transparent`, fontWeight: activeAnalysisTab === r ? 700 : 500, color: activeAnalysisTab === r ? C.teal : C.muted, cursor: "pointer", fontSize: 12, textTransform: "uppercase", whiteSpace: "nowrap", transition:"all 0.15s"}}>
                      {r} {activeDoc.analysis[r].state === "approved" && "✓"}
                    </button>
                  ))}
                </div>
                
                <div style={{padding: "20px", flex: 1}}>
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20}}>
                    <div>
                      <div style={{fontSize: 15, fontWeight: 700, color: C.ink, marginBottom:4}}>{ROLES[activeAnalysisTab]?.title} Analysis</div>
                      {activeAnalysisTab !== role.key && <Badge color={C.amber} bg={C.amberLt}>View Only (Not your role)</Badge>}
                    </div>
                    {activeAnalysisTab === role.key && activeDoc.analysis[activeAnalysisTab].state !== "approved" && (
                      <div style={{display: "flex", gap: 8}}>
                        <Btn small onClick={()=>{toast("Rerunning analysis for this role...","ok")}}><RefreshCw size={12}/> Rerun</Btn>
                        <Btn small primary onClick={handleApprove}><Check style={{width:12,height:12}}/> Approve</Btn>
                      </div>
                    )}
                    {activeDoc.analysis[activeAnalysisTab].state === "approved" && (
                      <Btn small onClick={()=>toast(`Exported ${activeAnalysisTab.toUpperCase()} artifacts to Jira.`,"ok")}><Share2 style={{width:12,height:12}}/> Export to Jira</Btn>
                    )}
                  </div>

                  <div style={{fontSize: 14, color: C.mid, whiteSpace: "pre-wrap", lineHeight: 1.7, background:C.soft, padding:16, borderRadius:8, border:`1px solid ${C.border}`}}>
                    {activeDoc.analysis[activeAnalysisTab].content}
                  </div>
                </div>
              </Card>
            ) : (
              <Card style={{textAlign: "center", padding: "60px 20px", color: C.muted, flex:1, display:"flex", flexDirection:"column", justifyContent:"center"}}>
                <Brain style={{width:40,height:40,margin:"0 auto 12px",opacity:.3}}/>
                <div style={{fontSize:15,fontWeight:600, color:C.ink}}>Not Analyzed Yet</div>
                <div style={{fontSize:13,marginTop:6, maxWidth:280, margin:"0 auto", lineHeight:1.5}}>Ask ARIA in the chat to analyze this document for your role's SDLC requirements.</div>
              </Card>
            )}

            {/* Analysis History & Resolved Issues Accordion */}
            {(approvedRoles.length > 0 || resolvedIssues.length > 0) && (
              <Card style={{border:`1px solid ${C.teal}30`, background:C.tealLt}}>
                <div style={{fontSize: 13, fontWeight: 700, color: C.tealDk, marginBottom: 12, display:"flex", alignItems:"center", gap:6}}><Archive style={{width:14,height:14}}/> Analysed History & Resolved Issues</div>
                
                {approvedRoles.length > 0 && <div style={{marginBottom: 12}}>
                  <div style={{fontSize: 11, fontWeight: 700, color: C.tealDk, opacity:0.8, textTransform: "uppercase", marginBottom: 6}}>Approved Analyses</div>
                  <div style={{display: "flex", gap: 6, flexWrap: "wrap"}}>
                    {approvedRoles.map(r => <Badge key={r} color={C.tealDk} bg="#fff">{r.toUpperCase()} Analysis ✓</Badge>)}
                  </div>
                </div>}

                {resolvedIssues.length > 0 && <div>
                  <div style={{fontSize: 11, fontWeight: 700, color: C.tealDk, opacity:0.8, textTransform: "uppercase", marginBottom: 6}}>Resolved Issues & Ambiguities</div>
                  {resolvedIssues.map(iss => (
                    <div key={iss.id} style={{padding: "10px 14px", background: "#fff", borderRadius: 6, marginBottom: 6, border: `1px solid ${C.teal}30`, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                      <div>
                        <div style={{fontSize: 12, fontWeight: 700, color: C.tealDk}}>{iss.id}: {iss.cat}</div>
                        <div style={{fontSize: 11, color: C.mid, marginTop: 2}}>Fix: {iss.fix}</div>
                      </div>
                      <button onClick={()=>handleRevertIssue(iss)} style={{background:"none", border:"none", cursor:"pointer", color: C.coral, fontSize: 11, fontWeight:600, textDecoration:"underline"}}>Revert</button>
                    </div>
                  ))}
                </div>}
              </Card>
            )}
          </>
        )}
      </div>
    </div>

    {/* Revert Modal */}
    {revertModal && <Modal title="Revert to Issues & Ambiguity" onClose={()=>setRevertModal(null)}>
      <div style={{fontSize:13,color:C.muted,marginBottom:12}}>Please provide a reason for reverting <strong style={{color:C.ink}}>{revertModal.id}</strong> back to the unresolved issues list. This will be logged in the audit trail.</div>
      <textarea value={revertReason} onChange={e=>setRevertReason(e.target.value)} rows={3} placeholder="e.g., Client changed their mind on latency requirements..." style={{width:"100%",padding:10,border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,fontFamily:"inherit",marginBottom:14, outline:"none"}}/>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn onClick={()=>setRevertModal(null)}>Cancel</Btn>
        <Btn danger onClick={confirmRevert}>Revert & Log Reason</Btn>
      </div>
    </Modal>}
  </div>;
}

// ══════════════════════════════════════════════════════════════════════════════
//  ISSUES & AMBIGUITY
// ══════════════════════════════════════════════════════════════════════════════
function IssuesView({issues,setIssues,docs,toast}) {
  const [filter,setFilter]=useState("all");
  const [modal,setModal]=useState(null);
  
  const list=issues.filter(i=> (filter==="all"||i.severity===filter) && i.state !== 'fixed');
  const counts={critical:issues.filter(i=>i.severity==="critical" && i.state !== 'fixed').length,high:issues.filter(i=>i.severity==="high" && i.state !== 'fixed').length,medium:issues.filter(i=>i.severity==="medium" && i.state !== 'fixed').length};

  const acceptFix=(iss)=>setModal({type:"accept",iss});

  return <div>
    <SectionH title="Issues & Ambiguity" icon={AlertTriangle} sub={`ARIA found ${list.length} unresolved issues across documents. Accept fixes to modify requirements and push them to Analysis History.`}/>
    
    <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
      {[["all","All",list.length],["critical","🔴 Critical",counts.critical],["high","🟠 High",counts.high],["medium","🔵 Medium",counts.medium]].map(([k,l,n])=>(
        <button key={k} onClick={()=>setFilter(k)} style={{padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:filter===k?700:500,background:filter===k?C.ink:C.paper,color:filter===k?"#fff":C.mid,border:`1px solid ${C.border}`,cursor:"pointer", transition:"all 0.15s"}}>{l} · {n}</button>
      ))}
    </div>

    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {list.length === 0 ? (
        <Card style={{textAlign: "center", padding: "60px 20px", color: C.muted}}>
          <CheckCircle2 style={{width:48,height:48,margin:"0 auto 16px",color:C.teal,opacity:.5}}/>
          <div style={{fontSize:16,fontWeight:600,color:C.ink}}>All Clear!</div>
          <div style={{fontSize:13,marginTop:6}}>No active issues pending review.</div>
        </Card>
      ) : list.map(iss=>{
        const col=sevColor(iss.severity),bg=sevBg(iss.severity);
        const docTitle = docs.find(d=>d.id===iss.docId)?.title || iss.docId;
        return <Card key={iss.id} style={{borderLeft:`4px solid ${col}`,borderRadius:"0 12px 12px 0"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:10}}>
                <Badge color={col} bg={bg}>{iss.severity.toUpperCase()}</Badge>
                <span style={{fontSize:12,color:C.muted,fontFamily:"monospace"}}>{iss.id}</span>
                <Badge color={C.mid} bg={C.soft}><FileText size={10}/> Doc: {docTitle}</Badge>
              </div>
              <div style={{fontSize:14,color:C.muted,fontStyle:"italic",marginBottom:8}}>From spec: <strong style={{color:C.amber}}>{iss.quote}</strong></div>
              <div style={{fontSize:14,color:C.ink,lineHeight:1.65,marginBottom:12}}><strong style={{color:C.coral}}>Problem:</strong> {iss.problem}</div>
              <div style={{background:C.tealLt,borderRadius:8,padding:"12px 16px",marginBottom:12, border:`1px solid ${C.teal}30`}}>
                <div style={{fontSize:11,fontWeight:800,color:C.tealDk,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>ARIA recommends</div>
                <div style={{fontSize:14,color:C.tealDk,lineHeight:1.6}}>{iss.fix}</div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                <Btn primary onClick={()=>acceptFix(iss)}>✓ Accept Fix & Move to Analysis History</Btn>
              </div>
            </div>
          </div>
        </Card>;
      })}
    </div>

    {modal?.type==="accept"&&<Modal title="Accept fix & push to history?" onClose={()=>setModal(null)}>
      <div style={{background:C.soft,borderRadius:8,padding:16,marginBottom:16,fontSize:13,lineHeight:1.7, border:`1px solid ${C.border}`}}>
        This will update the document's metadata and move this issue into the <strong>Analysed History & Resolved Issues</strong> section inside the Internal AI tab.
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <Btn onClick={()=>setModal(null)}>Cancel</Btn>
        <Btn primary onClick={()=>{
          setIssues(issues.map(i=>i.id===modal.iss.id?{...i,state:"fixed",fixedAt:new Date().toLocaleTimeString()}:i));
          setModal(null);
          toast(`${modal.iss.id} resolved and moved to Analysis History.`,"ok");
        }}><Check size={14}/> Accept & Move</Btn>
      </div>
    </Modal>}
  </div>;
}


// ══════════════════════════════════════════════════════════════════════════════
//  GOVERNANCE
// ══════════════════════════════════════════════════════════════════════════════
function GovernanceView({audit,toast}) {
  return <div>
    <SectionH title="AI Governance Dashboard" icon={Shield} sub="Complete visibility into every AI interaction across iOCO."/>
    <Card style={{padding:0}}>
      <div style={{display:"grid",gridTemplateColumns:"80px 140px 160px 1fr 160px 80px 70px",background:C.ink,color:"#fff",padding:"10px 20px",borderRadius:"12px 12px 0 0",fontSize:11,fontWeight:700,gap:12}}>
        <div>REF</div><div>USER</div><div>MODULE</div><div>ACTION</div><div>CLASSIFICATION</div><div>TOKENS</div><div>STATUS</div>
      </div>
      {audit.map((a,i)=>(
        <div key={a.id} style={{display:"grid",gridTemplateColumns:"80px 140px 160px 1fr 160px 80px 70px",gap:12,padding:"12px 20px",borderTop:`1px solid ${C.border}`,fontSize:12,alignItems:"center"}}>
          <div style={{fontFamily:"monospace",color:C.muted}}>{a.id}</div><div style={{color:C.mid, fontWeight:600}}>{a.user}</div>
          <div><Badge color={a.module==="BLOCKED"?C.coral:C.teal} bg={a.module==="BLOCKED"?C.coralLt:C.tealLt}>{a.module}</Badge></div>
          <div style={{color:C.mid}}>{a.action}</div><div><Badge color={classColor(a.classification)} bg={classColor(a.classification)+"15"}>{a.classification}</Badge></div>
          <div style={{color:C.muted}}>{a.tokens>0?a.tokens.toLocaleString():"—"}</div>
          <div><Badge color={a.status==="ok"?C.teal:a.status==="blocked"?C.coral:C.amber} bg={a.status==="ok"?C.tealLt:a.status==="blocked"?C.coralLt:C.amberLt}>{a.status.toUpperCase()}</Badge></div>
        </div>
      ))}
    </Card>
  </div>;
}


// ══════════════════════════════════════════════════════════════════════════════
//  SIDEBAR
// ══════════════════════════════════════════════════════════════════════════════
function Sidebar({view,setView,role,setRole}) {
  const NAV=[
    {group:"PLATFORM",items:[
      {id:"enterprise-hub",l:"Enterprise Hub",I:Building2},
      {id:"data-shield",l:"Data Shield",I:Lock},
    ]},
    {group:"ROLE-BASED WORKFLOW",items:[
      {id:"doc-hub",l:"1. Doc Hub",I:FileText},
      {id:"internal-ai",l:"2. AI & Analysis",I:Bot, badge: "LIVE"},
      {id:"issues",l:"3. Issues",I:AlertTriangle},
    ]},
  ];

  if(role.key === 'admin' || role.key === 'assurance') {
    NAV.push({group:"ADMINISTRATION",items:[
      {id:"governance",l:"AI Governance",I:Shield}
    ]});
  }

  return <aside style={{width:250,background:C.paper,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",height:"100vh",overflowY:"auto",flexShrink:0}}>
    <div style={{padding:"20px 20px 16px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
        <div style={{width:36,height:36,background:C.ink,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}><Brain style={{width:20,height:20,color:"#fff"}}/></div>
        <div><div style={{fontSize:22,fontWeight:800,color:C.ink,letterSpacing:"-0.03em",lineHeight:1}}>ARIA</div><div style={{fontSize:11,color:C.muted, marginTop:2}}>iOCO Internal AI</div></div>
      </div>
    </div>
    
    <div style={{padding:"16px 16px",borderBottom:`1px solid ${C.border}`, background:C.soft}}>
      <div style={{fontSize:10,fontWeight:800,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Simulate Role</div>
      <select value={role.key} onChange={e=>{setRole(e.target.value); setView('doc-hub');}} style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:13,fontWeight:600,background:"#fff", color:C.ink, outline:"none", cursor:"pointer"}}>
        {Object.values(ROLES).map(r=><option key={r.key} value={r.key}>{r.title}</option>)}
      </select>
      <div style={{display:"flex",gap:10,marginTop:12,alignItems:"center"}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:role.color,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{role.avatar}</div>
        <div style={{fontSize:12,color:C.muted,lineHeight:1.4}}><strong style={{color:C.ink}}>{role.name}</strong><br/>{role.team}</div>
      </div>
    </div>

    <nav style={{flex:1,padding:"16px 12px",overflowY:"auto"}}>
      {NAV.map(({group,items})=><div key={group} style={{marginBottom:20}}>
        <div style={{fontSize:10,fontWeight:800,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",padding:"0 8px 8px"}}>{group}</div>
        <div style={{display:"flex", flexDirection:"column", gap:4}}>
          {items.map(n=>{
            const Icon=n.I,active=view===n.id;
            return <button key={n.id} onClick={()=>setView(n.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,background:active?C.ink:"transparent",color:active?"#fff":C.mid,border:"none",cursor:"pointer",textAlign:"left",transition:"all .2s ease", fontWeight:active?600:500}}>
              <Icon style={{width:16,height:16,flexShrink:0, color:active?"#fff":C.muted}}/>
              <span style={{fontSize:13,flex:1}}>{n.l}</span>
              {n.badge&&<span style={{fontSize:10,padding:"2px 6px",borderRadius:99,background:active?"rgba(255,255,255,.2)":C.teal,color:"#fff",fontWeight:800, letterSpacing:"0.05em"}}>{n.badge}</span>}
            </button>;
          })}
        </div>
      </div>)}
    </nav>
  </aside>;
}

// ══════════════════════════════════════════════════════════════════════════════
//  APP SHELL
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [view,setView] = useState("data-shield");
  const [roleKey,setRoleKey] = useState("ux");
  
  // State
  const [docs, setDocs] = useState(INIT_DOCS);
  const [selectedDocId, setSelectedDocId] = useState(INIT_DOCS[0].id);
  const [issues, setIssues] = useState(INIT_ISSUES);
  const [audit, setAudit] = useState(INIT_AUDIT);
  const [shadow, setShadow] = useState(INIT_SHADOW);
  const [scanHistory, setScanHistory] = useState([]);

  const {toasts,add:toast}=useToasts();
  const role=ROLES[roleKey];

  return <div style={{display:"flex",minHeight:"100vh",fontFamily:"'Inter','DM Sans',system-ui,sans-serif",background:C.soft,color:C.ink}}>
    <Sidebar view={view} setView={setView} role={role} setRole={setRoleKey} />
    <main style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      {/* Topbar */}
      <div style={{background:C.paper,borderBottom:`1px solid ${C.border}`,padding:"12px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:C.muted, fontWeight:500}}>
          <Badge color={C.blue} bg={C.blueLt}>{role.title} Session Active</Badge>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["🔒 Data sovereign","🇿🇦 af-south-1 only","📋 POPIA-compliant"].map(t=><span key={t} style={{fontSize:11,padding:"4px 12px",background:C.tealLt,borderRadius:20,color:C.tealDk,fontWeight:600}}>{t}</span>)}
        </div>
      </div>
      
      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:"32px 32px 60px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          {view==="enterprise-hub"&&<EnterpriseHub setView={setView} shadowAlerts={shadow} />}
          {view==="data-shield"&&<DataShieldView toast={toast} scanHistory={scanHistory} setScanHistory={setScanHistory} docs={docs} setDocs={setDocs} setView={setView}/>}
          {view==="doc-hub"&&<DocHubView docs={docs} setDocs={setDocs} setView={setView} toast={toast} setSelectedDocId={setSelectedDocId}/>}
          {view==="internal-ai"&&<InternalAIAndAnalysisView role={role} docs={docs} setDocs={setDocs} selectedDocId={selectedDocId} setSelectedDocId={setSelectedDocId} issues={issues} setIssues={setIssues} toast={toast}/>}
          {view==="issues"&&<IssuesView issues={issues} setIssues={setIssues} docs={docs} toast={toast} setView={setView}/>}
          {view==="governance"&&<GovernanceView audit={audit} toast={toast}/>}
        </div>
      </div>
    </main>
    <Toasts toasts={toasts}/>
  </div>;
}