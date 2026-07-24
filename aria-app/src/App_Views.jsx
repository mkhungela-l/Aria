import React, { useState, useEffect, useRef } from "react";
import {
  Brain, Shield, Activity, AlertTriangle, Check, X, Send, ChevronDown, ChevronRight,
  ArrowRight, Plus, Download, Upload, Settings, Lock, Users, Workflow, FileText,
  FlaskConical, MessageSquareQuote, ShieldAlert, Eye, RefreshCw, Link2, BarChart2,
  Inbox, Calendar, Archive, Sparkles, UserCheck, Bot, Layers, GitBranch, Code2,
  Building2, Search, Bell, Database, Zap, TrendingUp, Clock, CheckCircle2,
  MessageCircle, Star, Pencil, Wallet, BookOpen, Globe, AlertCircle, Share2,
  Tag, Filter, ToggleLeft, ToggleRight, ChevronUp, Hash, Cpu, Radio
} from "lucide-react";
import ForceGraph2D from 'react-force-graph-2d';

// Data from mockData.js
import { C, ROLES, INIT_SHADOW, INIT_AUDIT, DEPT_USAGE, INIT_INTEGRATIONS, DEPT_MODULES, SAMPLE_REQS, INIT_ISSUES, INIT_STORIES, INIT_TESTS, INIT_QUESTIONS, INIT_RISKS } from './data/mockData';
import { classColor, classifyData, sevColor, sevBg } from './utils/helpers';
import { Badge, Btn, Card, SectionH, Bar, Toggle, useToasts, Toasts, Modal } from './components/ui';

// ══════════════════════════════════════════════════════════════════════════════
//  ENTERPRISE HUB (ENHANCED WITH INNOVATIVE FEATURES)
// ══════════════════════════════════════════════════════════════════════════════
function EnterpriseHub({setView,shadowAlerts,toast}) {
  const stats=[
    {v:"847",l:"AI interactions today",sub:"across all departments",c:C.teal},
    {v:"0",l:"client data records exposed",sub:"to external AI agents",c:C.teal},
    {v:"3",l:"shadow AI alerts",sub:"employees intercepted",c:C.coral},
    {v:"R2.4M",l:"projected annual savings",sub:"from external AI replaced",c:C.amber},
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
    <Card style={{marginBottom: 14, background: C.soft, border: `1px solid ${C.blueLt}`}}>
      <div style={{display:"flex", gap: 20, alignItems:"flex-start"}}>
        <div style={{flex: 1}}>
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
        </div>
        <div style={{flex: 1, borderLeft: `1px solid ${C.border}`, paddingLeft: 20}}>
          <h3 style={{fontSize:15, fontWeight: 700, marginBottom: 8, color: C.ink}}><Wallet size={16} style={{display:'inline', verticalAlign:'middle', marginRight: 6}}/>Real-time ROI Tracker</h3>
          <p style={{fontSize:12, color: C.muted, marginBottom: 12}}>Dynamic savings calculated from prevented rework and cancelled subscriptions.</p>
          <div style={{fontSize: 26, fontWeight: 800, color: C.teal}}>R2,450,000</div>
          <p style={{fontSize: 11, color: C.muted, marginTop: 4}}>Cumulative expected savings (YTD)</p>
          <div style={{marginTop: 8, height: 4, background: C.border, borderRadius: 2}}>
             <div style={{height: 4, background: C.teal, width: '65%', borderRadius: 2}}></div>
          </div>
          <p style={{fontSize: 10, color: C.muted, marginTop: 4, textAlign: 'right'}}>65% to target</p>
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

// ══════════════════════════════════════════════════════════════════════════════
//  TRACEABILITY (ENHANCED WITH FORCE GRAPH)
// ══════════════════════════════════════════════════════════════════════════════
function TraceabilityView({issues, stories, tests, setView}) {
  const fgRef = useRef();

  // Create graph data
  const nodes = [];
  const links = [];

  // Requirements node
  nodes.push({ id: "REQ", name: "Requirements Doc", group: "Req", val: 30, color: C.purple });

  issues.forEach(iss => {
    nodes.push({ id: iss.id, name: iss.id, group: "Issue", val: 20, color: sevColor(iss.severity) });
    links.push({ source: "REQ", target: iss.id });
  });

  const tmap = {"US-001":["TC-001","TC-002"],"US-002":["TC-003","TC-004"],"US-003":["TC-005"],"US-004":["TC-006"]};

  stories.forEach((story, i) => {
    nodes.push({ id: story.id, name: story.id, group: "Story", val: 15, color: C.blue });
    const linkedIssue = issues[i % issues.length];
    if (linkedIssue) {
      links.push({ source: linkedIssue.id, target: story.id });
    }
  });

  tests.forEach(test => {
    nodes.push({ id: test.id, name: test.id, group: "Test", val: 10, color: C.teal });
    links.push({ source: test.story, target: test.id });
  });

  const graphData = { nodes, links };

  return <div>
    <SectionH title="Traceability Matrix & Interactive Graph" sub="End-to-end chain: requirement issue → user story → test cases. Drag nodes to explore relationships."/>
    
    <Card style={{padding: 0, overflow: 'hidden', height: 400, marginBottom: 14, position: 'relative'}}>
       <div style={{position: 'absolute', top: 10, left: 10, zIndex: 10, background: 'rgba(255,255,255,0.8)', padding: '4px 8px', borderRadius: 4, fontSize: 11, border: `1px solid ${C.border}`}}>
         Interactive Traceability Visualization
       </div>
       <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel="name"
        nodeColor="color"
        nodeVal="val"
        linkColor={() => C.border}
        width={1000}
        height={400}
        onNodeClick={(node) => {
          if (node.group === "Issue") setView("issues");
          if (node.group === "Story") setView("stories");
          if (node.group === "Test") setView("tests");
        }}
      />
    </Card>

    <Card style={{padding:0}}>
      <div style={{display:"grid",gridTemplateColumns:"80px 1fr 200px 1fr",background:C.ink,color:"#fff",padding:"10px 20px",borderRadius:"12px 12px 0 0",fontSize:11,fontWeight:700,gap:12}}><div>ISSUE</div><div>PROBLEM → FIX</div><div>USER STORY</div><div>TEST CASES</div></div>
      {issues.slice(0,5).map((iss,i)=>{const story=stories[i%stories.length];const linked=(tmap[story.id]||[]);return(
        <div key={iss.id} style={{display:"grid",gridTemplateColumns:"80px 1fr 200px 1fr",gap:12,padding:"12px 20px",borderTop:`1px solid ${C.border}`,fontSize:12,alignItems:"start"}}>
          <div>
            <button onClick={()=>setView("issues")} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"monospace",fontSize:11,color:sevColor(iss.severity),textDecoration:"underline",padding:0}}>{iss.id}</button>
            <div style={{marginTop:3}}><Badge color={sevColor(iss.severity)} bg={sevBg(iss.severity)}>{iss.severity}</Badge></div>
          </div>
          <div><div style={{fontStyle:"italic",color:C.muted,marginBottom:4}}>{iss.quote}</div><div style={{color:C.mid,lineHeight:1.5}}>{iss.fix.slice(0,80)}…</div></div>
          <div><button onClick={()=>setView("stories")} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"monospace",fontSize:11,color:C.blue,textDecoration:"underline",padding:0}}>{story.id}</button><div style={{marginTop:2,color:C.muted}}>{story.title}</div></div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {linked.length>0?linked.map(id=><button key={id} onClick={()=>setView("tests")} style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:C.tealLt,color:C.teal,border:"none",cursor:"pointer",fontFamily:"monospace"}}>{id}</button>):<span style={{color:C.coral,fontWeight:600}}>⚠ No tests</span>}
          </div>
        </div>
      );})}
    </Card>
  </div>;
}
