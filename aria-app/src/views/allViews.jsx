import React, { useState, useEffect, useRef } from "react";
import {
  Brain, Shield, AlertTriangle, Check, X, Send, ChevronDown, ChevronRight,
  ArrowRight, Plus, Download, Upload, Settings, Lock, Workflow, FileText,
  FlaskConical, MessageSquareQuote, ShieldAlert, Eye, RefreshCw, Link2,
  Archive, Sparkles, UserCheck, Bot, Layers, Building2, Zap, Calendar, MessageCircle, Star, Pencil
} from "lucide-react";
import { C, ROLES, INIT_SHADOW, INIT_AUDIT, DEPT_USAGE, INIT_INTEGRATIONS, DEPT_MODULES, SAMPLE_REQS } from '../data/mockData';
import { classColor, classifyData, sevColor, sevBg } from '../utils/helpers';
import { Badge, Btn, Card, SectionH, Bar, Toggle, Modal } from '../components/ui';
import ForceGraph2D from 'react-force-graph-2d';

// We bundle all views here for brevity.

export function EnterpriseHub({setView,shadowAlerts,toast}) {
  const stats=[
    {v:"847",l:"AI interactions today",sub:"across all departments",c:C.teal},
    {v:"0",l:"client data records exposed",sub:"to external AI agents",c:C.teal},
    {v:"3",l:"shadow AI alerts",sub:"employees intercepted",c:C.coral},
    {v:"R124k",l:"projected annual savings",sub:"from external AI replaced",c:C.amber},
  ];
  const health=[
    {l:"Private AI core",v:"Healthy",c:C.teal},
    {l:"Data sovereignty",v:"100% — af-south-1",c:C.teal},
    {l:"POPIA compliance",v:"94% — review needed",c:C.amber},
    {l:"Audit log",v:"Live — 847 entries today",c:C.teal},
    {l:"Shadow AI monitor",v:"3 alerts unresolved",c:C.coral},
  ];
  return <div>
    <SectionH title="Enterprise Hub" sub="iOCO's internal AI platform — real-time view of every AI interaction, every data protection decision, and every cost saving across all departments."/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginBottom:20}}>
      {stats.map(s=><Card key={s.l}>
        <div style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{s.l}</div>
        <div style={{fontSize:28,fontWeight:800,color:s.c,lineHeight:1}}>{s.v}</div>
        <div style={{fontSize:12,color:C.muted,marginTop:4}}>{s.sub}</div>
      </Card>)}
    </div>
    
    {/* INNOVATION: Real-time Data Sovereignty visual & ROI Simulator placeholder */}
    <Card style={{marginBottom: 14, background: C.soft}}>
      <div style={{display:"flex", gap: 20, alignItems:"center"}}>
        <div style={{flex: 1}}>
          <h3 style={{fontSize:16, fontWeight: 700, marginBottom: 8}}>Live Data Sovereignty Map</h3>
          <p style={{fontSize:12, color: C.muted, marginBottom: 12}}>Visualizing routing of internal queries vs blocked external AI calls.</p>
          <div style={{display:"flex", alignItems:"center", gap: 10, fontSize:12}}>
            <Badge color={C.teal} bg={C.tealLt}>af-south-1 (Azure)</Badge> 
            <ArrowRight size={12}/>
            <span>Internal processing</span>
          </div>
          <div style={{display:"flex", alignItems:"center", gap: 10, fontSize:12, marginTop: 8}}>
            <Badge color={C.coral} bg={C.coralLt}>us-east (OpenAI)</Badge> 
            <X size={12} color={C.coral}/>
            <span style={{color: C.coral}}>Blocked by ARIA Interceptor</span>
          </div>
        </div>
        <div style={{flex: 1, borderLeft: `1px solid ${C.border}`, paddingLeft: 20}}>
          <h3 style={{fontSize:16, fontWeight: 700, marginBottom: 8}}>Real-time ROI Tracker</h3>
          <p style={{fontSize:12, color: C.muted, marginBottom: 12}}>Dynamic savings calculated from prevented rework and cancelled subscriptions.</p>
          <div style={{fontSize: 24, fontWeight: 800, color: C.teal}}>R2,450,000</div>
          <p style={{fontSize: 10, color: C.muted, marginTop: 4}}>Cumulative expected savings (YTD)</p>
        </div>
      </div>
    </Card>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <Card>
        <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:12}}>Platform health</div>
        {health.map(h=><div key={h.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13,alignItems:"center"}}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:h.c,flexShrink:0}}/>
            <span style={{color:C.muted}}>{h.l}</span>
          </div>
          <span style={{fontWeight:600,color:h.c}}>{h.v}</span>
        </div>)}
      </Card>
      <Card>
        <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:12}}>Department AI usage today</div>
        {DEPT_USAGE.slice(0,5).map(d=><div key={d.dept} style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
            <span style={{color:C.mid}}>{d.dept}</span>
            <span style={{color:C.muted}}>{d.interactions} interactions · {d.saved} saved</span>
          </div>
          <Bar value={d.interactions} max={1300} color={C.teal}/>
        </div>)}
      </Card>
    </div>
    {shadowAlerts.filter(a=>!a.resolved).length>0 && <Card style={{background:C.coralLt,borderColor:`${C.coral}30`,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:700,color:C.coral}}>⚠ Shadow AI alerts — employees accessing external AI</div>
        <Btn small onClick={()=>setView("governance")}>View all →</Btn>
      </div>
      {shadowAlerts.filter(a=>!a.resolved).map(a=><div key={a.id} style={{padding:"8px 0",borderBottom:`1px solid ${C.coralMid}30`,fontSize:13}}>
        <strong style={{color:C.coral}}>{a.user}</strong> <span style={{color:C.mid}}>({a.dept}) — {a.action}</span><br/>
        <span style={{fontSize:12,color:C.muted}}>Data: {a.data} · {a.time} · Risk: {a.risk}</span>
      </div>)}
    </Card>}
  </div>;
}

// Ensure you export the rest of the views similarly.
