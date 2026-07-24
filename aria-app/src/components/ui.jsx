import React, { useState, useEffect } from 'react';
import { C } from '../data/mockData';

export function Badge({children,color=C.muted,bg=C.soft,style={}}) {
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 10px",borderRadius:99,fontSize:11,fontWeight:600,color,background:bg,letterSpacing:"0.02em",...style}}>{children}</span>;
}

export function Btn({children,onClick,primary,danger,small,disabled,full,style={}}) {
  const bg=disabled?"#E5E7EB":danger?C.coral:primary?C.ink:C.paper;
  const col=disabled?C.muted:danger||primary?"#fff":C.ink;
  return <button onClick={disabled?undefined:onClick} disabled={disabled} style={{display:"inline-flex",alignItems:"center",gap:6,padding:small?"5px 12px":"8px 16px",borderRadius:8,fontSize:small?12:13,fontWeight:600,background:bg,color:col,border:!primary&&!danger&&!disabled ? `1px solid ${C.border}` : "none",cursor:disabled?"not-allowed":"pointer",width:full?"100%":"auto",justifyContent:full?"center":"flex-start",opacity:disabled?.5:1,...style}}>{children}</button>;
}

export function Card({children,style={}}) {
  return <div style={{background:C.paper,border: `1px solid ${C.border}`,borderRadius:12,padding:"18px 20px",...style}}>{children}</div>;
}

export function SectionH({title,sub,right}) {
  return <div style={{marginBottom:20}}>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
      <div>
        <h2 style={{fontSize:24,fontWeight:800,color:C.ink,margin:"0 0 6px",letterSpacing:"-0.02em"}}>{title}</h2>
        {sub&&<p style={{fontSize:13,color:C.muted,margin:0,lineHeight:1.6}}>{sub}</p>}
      </div>
      {right}
    </div>
  </div>;
}

export function Bar({value,max=100,color=C.teal,height=5}) {
  return <div style={{height,background:C.border,borderRadius:3,overflow:"hidden"}}>
    <div style={{height:"100%",width: `${Math.min(100,(value/max)*100)}%`,background:color,borderRadius:3,transition:"width .7s ease"}}/>
  </div>;
}

export function Toggle({on,onToggle,label}) {
  return <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={onToggle}>
    <div style={{width:40,height:22,borderRadius:11,background:on?C.teal:C.border,position:"relative",transition:"background .2s",flexShrink:0}}>
      <div style={{width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:on?21:3,transition:"left .2s"}}/>
    </div>
    {label&&<span style={{fontSize:13,color:C.mid}}>{label}</span>}
  </div>;
}

export function useToasts() {
  const [toasts,set]=useState([]);
  const add=(msg,type="ok")=>{const id=Date.now()+Math.random();set(t=>[...t,{id,msg,type}]);setTimeout(()=>set(t=>t.filter(x=>x.id!==id)),4500);};
  return{toasts,add};
}

export function Toasts({toasts}) {
  return <div style={{position:"fixed",top:16,right:16,zIndex:999,display:"flex",flexDirection:"column",gap:8,width:340}}>
    {toasts.map(t=><div key={t.id} style={{background:t.type==="ok"?C.teal:t.type==="warn"?C.amber:t.type==="alert"?C.coral:C.ink,color:"#fff",borderRadius:10,padding:"12px 16px",fontSize:13,lineHeight:1.5,boxShadow:"0 4px 20px rgba(0,0,0,.15)"}}>{t.msg}</div>)}
  </div>;
}

export function Modal({title,children,onClose,wide}) {
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
