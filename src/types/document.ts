
export type DocumentStatus = "analyzing" | "completed" | "error";
export type RiskLevel = "low" | "medium" | "high";

export interface CompletedDocument {
  id: string;
  title: string;
  date: string;
  status: "completed";
  riskLevel: RiskLevel;
  riskScore: number;
  findings: string[];
}

export interface AnalyzingDocument {
  id: string;
  title: string;
  date: string;
  status: "analyzing";
  progress: number;
}

export interface ErrorDocument {
  id: string;
  title: string;
  date: string;
  status: "error";
  error: string;
}

export type Document = CompletedDocument | AnalyzingDocument | ErrorDocument;
