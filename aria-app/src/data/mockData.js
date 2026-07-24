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
  qa:{ key:"qa",name:"Thabo Sithole",title:"QA Lead",avatar:"TS",color:C.teal,team:"Sasol · OT",focus:"Test coverage" },
  dev:{ key:"dev",name:"Imran Patel",title:"Tech Lead",avatar:"IP",color:C.coral,team:"Discovery · Claims",focus:"Sprint delivery" },
  pm:{ key:"pm",name:"Sipho Khumalo",title:"Delivery Manager",avatar:"SK",color:C.blue,team:"Cross-portfolio",focus:"Sprint readiness" },
  assurance:{ key:"assurance",name:"Dr. Yumna Adams",title:"AI Assurance Lead",avatar:"YA",color:C.purple,team:"iOCO CoE",focus:"Validates ARIA outputs" },
  admin:{ key:"admin",name:"Kagiso Moyo",title:"Platform Administrator",avatar:"KM",color:C.blueM,team:"iOCO IT Governance",focus:"Platform governance" },
};

const INIT_SHADOW = [
  { id:"SA-1",user:"Thabo S.",dept:"Delivery",action:"Accessed chat.openai.com",data:"Pasted Sasol contract text",risk:"HIGH",time:"09:14",resolved:false },
  { id:"SA-2",user:"Rachel v.W.",dept:"UX",action:"Accessed gemini.google.com",data:"Uploaded client presentation",risk:"HIGH",time:"09:47",resolved:false },
  { id:"SA-3",user:"Imran P.",dept:"Development",action:"Accessed github.com/copilot",data:"Client codebase snippets",risk:"MED",time:"10:02",resolved:false },
];

const INIT_AUDIT = [
  { id:"AL-001",user:"Naledi M.",module:"Requirements",action:"Analysed PRJ-118 requirements",classification:"Client-Confidential",tokens:1847,time:"08:32",status:"ok" },
  { id:"AL-002",user:"Sipho K.",module:"Document",action:"Summarised Q2 delivery report",classification:"iOCO-Internal",tokens:923,time:"08:45",status:"ok" },
  { id:"AL-003",user:"Thabo S.",module:"BLOCKED",action:"External AI access attempt — blocked",classification:"Client-Confidential",tokens:0,time:"09:14",status:"blocked" },
  { id:"AL-004",user:"Naledi M.",module:"Communications",action:"Drafted client email re: PRJ-118",classification:"Client-Confidential",tokens:412,time:"09:28",status:"ok" },
  { id:"AL-005",user:"Rachel v.W.",module:"BLOCKED",action:"External AI access attempt — blocked",classification:"Unknown",tokens:0,time:"09:47",status:"blocked" },
  { id:"AL-006",user:"Sipho K.",module:"Requirements",action:"Pushed 4 stories to Jira SBPORT",classification:"Client-Confidential",tokens:0,time:"10:15",status:"export" },
];

const DEPT_USAGE = [
  { dept:"Delivery",users:48,interactions:1203,tokens:2840000,saved:"34.2 hrs",score:87 },
  { dept:"Development",users:63,interactions:892,tokens:1960000,saved:"28.1 hrs",score:91 },
  { dept:"Finance",users:15,interactions:234,tokens:510000,saved:"8.4 hrs",score:78 },
  { dept:"HR",users:8,interactions:89,tokens:190000,saved:"3.1 hrs",score:82 },
  { dept:"Legal",users:12,interactions:156,tokens:340000,saved:"5.8 hrs",score:94 },
  { dept:"UX",users:19,interactions:341,tokens:720000,saved:"11.2 hrs",score:85 },
];

const INIT_INTEGRATIONS = {
  "Microsoft Teams":{ connected:true, type:"M365", usage:892, desc:"ARIA bot in every channel" },
  "Microsoft Word":{ connected:true, type:"M365", usage:341, desc:"Inline analysis and rewrites" },
  "Microsoft Excel":{ connected:true, type:"M365", usage:156, desc:"Natural language data queries" },
  "Microsoft Outlook":{ connected:true, type:"M365", usage:478, desc:"Draft replies, POPIA risk flags" },
  "SharePoint":{ connected:true, type:"M365", usage:203, desc:"Search across all libraries" },
  "Power BI":{ connected:false, type:"M365", usage:0, desc:"Dashboard summaries" },
  "Confluence":{ connected:true, type:"Atlassian", usage:567, desc:"Read requirement pages" },
  "Jira":{ connected:true, type:"Atlassian", usage:1203, desc:"Push stories, receive sprint data" },
  "Xray for Jira":{ connected:true, type:"Atlassian", usage:89, desc:"Export test cases with links" },
  "GitHub":{ connected:true, type:"DevTools", usage:234, desc:"PR reviews, test gap alerts" },
  "Azure DevOps":{ connected:false, type:"DevTools", usage:0, desc:"Mirror stories to Work Items" },
  "VS Code Extension":{ connected:false, type:"DevTools", usage:0, desc:"ARIA inside the editor" },
  "SAP HR":{ connected:false, type:"Enterprise", usage:0, desc:"Org structure for role-based access" },
  "DocuSign":{ connected:false, type:"Enterprise", usage:0, desc:"Trigger contract review workflows" },
};

const SAMPLE_REQS = `Client Portal Requirements — Standard Bank Managed Services\n\nThe portal should allow clients to view their IT infrastructure status. Users need to be able to log tickets when something breaks. The system must be fast and work on mobile devices.\n\nAdmins should have more access than regular users. Monthly reports need to be generated automatically and emailed to clients. Data must be kept safe and comply with regulations.\n\nThe password reset process must work. Users should receive notifications when ticket statuses change. The system needs to handle a lot of users at the same time and should be available most of the time. Integration with the existing monitoring platform is required.`;

const INIT_ISSUES = [
  { id:"I-01",severity:"critical",cat:"Unmeasurable",quote:'"the system must be fast"',problem:"No latency target. 'Fast' cannot be tested or delivered to.",fix:"Dashboard ≤ 1.5s P95. Ticket submit ≤ 800ms P95.",state:null,comments:[] },
  { id:"I-02",severity:"critical",cat:"POPIA",quote:'"data must be kept safe and comply with regulations"',problem:"POPIA Section 19 safeguards and Section 71 cross-border transfer not specified.",fix:"Name data classes, AES-256 encryption, Azure af-south-1 SA-only residency.",state:null,comments:[] },
  { id:"I-03",severity:"high",cat:"Missing",quote:'"admins should have more access"',problem:"RBAC matrix undefined — no roles, no permission deltas.",fix:"Define: Client Viewer, Client Admin, iOCO Operator, Super Admin with capability matrix.",state:null,comments:[] },
  { id:"I-04",severity:"high",cat:"Unmeasurable",quote:'"handle a lot of users at the same time"',problem:"No concurrent-user target or peak profile for infrastructure sizing.",fix:"2,500 concurrent users. 99.9% monthly uptime. 50 req/s per pod.",state:null,comments:[] },
  { id:"I-05",severity:"medium",cat:"Vague",quote:'"available most of the time"',problem:"SLA not stated — contractually unenforceable.",fix:"99.9% monthly uptime. 4-hour RTO. 1-hour RPO. Align to Managed Services SLA template.",state:null,comments:[] },
  { id:"I-06",severity:"medium",cat:"Contradiction",quote:'"emailed to clients" vs "data must be safe"',problem:"Emailed PDF attachments create POPIA exposure — contradicts data safety requirement.",fix:"Replace attachments with signed portal links (7-day TTL, single-recipient scoped).",state:null,comments:[] },
  { id:"I-07",severity:"low",cat:"Missing name",quote:'"integration with existing monitoring platform"',problem:"Platform unnamed. Developer cannot start this work.",fix:"Confirm: SolarWinds Orion via REST or Datadog via webhook. Lock in ADR before sprint.",state:null,comments:[] },
];

const INIT_STORIES = [
  { id:"US-001",title:"Client views infrastructure status dashboard",role:"Client Viewer",goal:"see real-time status of my assets on one screen",benefit:"I can spot incidents before they affect my business",given:"I am logged in as a Client Viewer for tenant ACME",when:"I open the portal home screen",then:"I see a dashboard with environment health, incident count, and SLA window",ac:["Dashboard renders P95 ≤ 1.5s on 3G","Only ACME assets visible (multi-tenant isolation)","Status colours meet WCAG AA contrast"],points:5,status:"Refined",comments:[],starred:false },
  { id:"US-002",title:"Client logs a support ticket from mobile",role:"Client Viewer",goal:"report a problem from my phone in under one minute",benefit:"I can raise urgent issues even when away from my desk",given:"I am on a mobile device with the portal open",when:"I tap New Ticket, choose a category, describe the issue, and submit",then:"Ticket created, reference number issued, SLA timer starts within 800ms",ac:["Form requires ≤ 4 fields","Submit responds ≤ 800ms P95","Push + email notification within 30s"],points:8,status:"Ready for sprint",comments:[],starred:false },
  { id:"US-003",title:"Admin manages portal access for their organisation",role:"Client Admin",goal:"invite users and assign roles without raising a ticket with iOCO",benefit:"I control access independently and immediately",given:"I am authenticated as Client Admin for tenant ACME",when:"I invite a new user and assign the Viewer role",then:"Invite email sent with a one-time link expiring in 24 hours",ac:["RBAC enforced server-side","Invite link is single-use","Audit log entry written within 1s"],points:5,status:"Refined",comments:[],starred:false },
  { id:"US-004",title:"Admin receives monthly service report securely",role:"Client Admin",goal:"receive monthly report without a POPIA-risk email attachment",benefit:"I meet audit obligations without data exposure risk",given:"Calendar month has ended",when:"Report job runs at 02:00 SAST on the 1st",then:"Signed portal link emailed to all Client Admins — no PDF attached",ac:["No PDF attachment on email","Link is single-tenant scoped","Link expires after 7 days"],points:3,status:"Draft",comments:[],starred:false },
];

const INIT_TESTS = [
  { id:"TC-001",story:"US-001",title:"Dashboard loads within SLA on slow mobile",type:"Performance",priority:"High",steps:["Set Chrome DevTools to Slow 3G","Log in as viewer.acme@test","Navigate to /portal/home","Record page load time (50 runs)"],expected:"P95 load time < 1.5s. No run exceeds 3s.",result:null },
  { id:"TC-002",story:"US-001",title:"User cannot see another organisation's assets",type:"Security",priority:"High",steps:["Auth as viewer.acme@test","Call GET /api/assets?tenant=globex","Inspect response body"],expected:"HTTP 403. Zero asset data from other tenant in response.",result:null },
  { id:"TC-003",story:"US-002",title:"Ticket submission fails gracefully with empty description",type:"Negative",priority:"Medium",steps:["Open New Ticket on mobile","Select category 'Network'","Leave description empty","Tap Submit"],expected:"Inline error: 'Description required (min 10 chars)'. No API call fired.",result:null },
  { id:"TC-004",story:"US-002",title:"Push notification fires within 30s of status change",type:"Functional",priority:"High",steps:["Create test ticket","Change status to 'In Progress' as Operator","Start timer"],expected:"Push ≤ 10s. Email ≤ 30s. Both contain ticket reference number.",result:null },
  { id:"TC-005",story:"US-003",title:"Invite link is single-use",type:"Security",priority:"High",steps:["Admin invites new.user@acme","User accepts and registers","Open same invite URL again"],expected:"HTTP 410 Gone. Message: 'Invitation already used'.",result:null },
  { id:"TC-006",story:"US-004",title:"Monthly report email has no PDF attachment",type:"Security",priority:"High",steps:["Trigger monthly report job","Inspect outbound email"],expected:"Zero attachments. One signed link with exp=now+7d in URL.",result:null },
];

const INIT_QUESTIONS = [
  { id:"Q-1",text:"The requirements say 'fast' without a target. We propose: dashboard ≤ 1.5s, ticket submit ≤ 800ms. Please confirm.",to:"Lebo Mahlangu",status:"Draft",answer:null },
  { id:"Q-2",text:"Which monitoring platform should we integrate with?",to:"Lebo Mahlangu",status:"Draft",answer:null },
  { id:"Q-3",text:"Please confirm POPIA data residency requirement: SA-region only?",to:"Tumi Ndlovu",status:"Sent",answer:null },
  { id:"Q-4",text:"We are sizing for 2,500 concurrent users. Confirm 90-day historical peak?",to:"Lebo Mahlangu",status:"Draft",answer:null },
  { id:"Q-5",text:"We recommend replacing email PDF attachments with signed portal links. Approve?",to:"Lebo Mahlangu",status:"Answered",answer:"Agreed — 7-day signed link, no PDF attachments." },
];

const INIT_RISKS = [
  { id:"R-1",flag:"POPIA Section 19 — unencrypted PDF attachments.",impact:"High",owner:"Compliance",mitigated:false,notes:"" },
  { id:"R-2",flag:"Performance budget undefined.",impact:"High",owner:"Architecture",mitigated:false,notes:"" },
  { id:"R-3",flag:"Integration target ambiguous.",impact:"Medium",owner:"Tech Lead",mitigated:false,notes:"" },
];

const DEPT_MODULES = [
  { id:"requirements",name:"Requirements Intelligence",icon:"📋",dept:"Delivery",users:48,desc:"Analyse requirement documents.",tasks:["Analyse requirements doc","Check POPIA compliance"] },
  { id:"document",name:"Document Intelligence",icon:"📄",dept:"All",users:124,desc:"Summarise, compare, and draft any document.",tasks:["Summarise a document","Extract action items"] },
  { id:"communications",name:"Communications Intelligence",icon:"💬",dept:"All",users:89,desc:"Draft emails, Teams messages.",tasks:["Draft a client email","Review email for POPIA risk"] },
  { id:"code",name:"Code Intelligence",icon:"💻",dept:"Development",users:63,desc:"Review PRs, explain legacy code.",tasks:["Review this code for issues","Generate unit tests"] },
  { id:"data",name:"Data Intelligence",icon:"📊",dept:"Analytics",users:31,desc:"Query data in plain language.",tasks:["Answer a question about my data","Write SQL from plain English"] },
  { id:"legal",name:"Legal & Compliance",icon:"⚖️",dept:"Legal",users:12,desc:"Review contracts against templates.",tasks:["Review contract for POPIA issues","Check SLA"] },
];

export {
  C, ROLES, INIT_SHADOW, INIT_AUDIT, DEPT_USAGE, INIT_INTEGRATIONS,
  SAMPLE_REQS, INIT_ISSUES, INIT_STORIES, INIT_TESTS, INIT_QUESTIONS,
  INIT_RISKS, DEPT_MODULES
};
