
export type DocumentStatus = "analyzing" | "completed" | "error";
export type RiskLevel = "low" | "medium" | "high";

export interface CompletedDocument {
  id: string;
  title: string;
  date?: string;
  status: "completed";
  riskLevel: RiskLevel;
  riskScore: number;
  findings: string[];
  recommendations?: string;
}

export interface AnalyzingDocument {
  id: string;
  title: string;
  date?: string;
  status: "analyzing";
  progress: number;
}

export interface ErrorDocument {
  id: string;
  title: string;
  date?: string;
  status: "error";
  error: string;
}

export type DocumentType = CompletedDocument | AnalyzingDocument | ErrorDocument;

export const CONTRACT_TYPES = [
  // Most popular agreements first
  "Non-Disclosure Agreement (NDA)",
  "Employment Agreement",
  "Service Agreement",
  "Consulting Agreement",
  "Sales Contract",
  "Lease Agreement",
  "Term Sheet",
  "SAFE Note Agreement",
  "Convertible Note Agreement",
  "Equity Vesting Agreement",
  "Partnership Agreement",
  // Less common agreements
  "Distribution Agreement",
  "Licensing Agreement",
  "Software License Agreement",
  "Freelancer Contract",
  "Intellectual Property Assignment",
  "Co-Founder Agreement",
  "Stock Option Agreement",
  "Investment Agreement",
  "Terms of Service",
  "Privacy Policy",
  "Data Processing Agreement",
  "SAAS Agreement",
];

export const JURISDICTIONS = [
  "United States",
  "United Kingdom",
  "European Union",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Singapore",
  "Japan",
  "China",
  "India",
  "Brazil",
  "South Africa",
  "Other"
];
