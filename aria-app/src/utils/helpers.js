import { C } from '../data/mockData';

export const classifyData = (text) => {
  const t = text.toLowerCase();
  const patterns = {
    "Client-Confidential":["client","contract","proposal","standard bank","sasol","discovery","multichoice","account","invoice","salary","revenue","budget"],
    "iOCO-Internal":["ioco","internal","sprint","jira","confluence","team","project","delivery","employee"],
    "Restricted":["password","secret","key","token","credential","private","id number","sa id"],
    "Public":["hello","hi","what is","explain","define","how does"]
  };
  const pii = ["id number","email","@","phone","address","salary","account number","date of birth"];
  const foundPII = pii.filter(p => t.includes(p));

  let classification = "Public";
  for (const [cls, kws] of Object.entries(patterns)) {
    if (kws.some(k => t.includes(k))) { classification = cls; break; }
  }
  return { classification, piiDetected: foundPII, riskLevel: classification === "Restricted" ? "HIGH" : classification === "Client-Confidential" ? "MED" : "LOW" };
};

export const classColor = c => c==="Client-Confidential"?C.amber:c==="Restricted"?C.coral:c==="iOCO-Internal"?C.blue:C.teal;
export const sevColor = s => s==="critical"?C.coral:s==="high"?C.amber:s==="medium"?C.blue:C.muted;
export const sevBg = s => s==="critical"?C.coralLt:s==="high"?C.amberLt:s==="medium"?C.blueLt:C.soft;
