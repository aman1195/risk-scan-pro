export const CONTRACT_TYPES = [
  "Employment Agreement",
  "Non-Disclosure Agreement (NDA)",
  "Service Agreement",
  "Partnership Agreement",
  "Sales Agreement",
  "Lease Agreement",
  "Consulting Agreement",
  "Freelance Contract",
  "Website Terms of Service",
  "Privacy Policy",
];

export const JURISDICTIONS = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

// Document type definitions
export type RiskLevel = "low" | "medium" | "high";

export type AnalyzingDocument = {
  id: string;
  title: string;
  date: string;
  status: "analyzing";
  progress: number;
};

export type ErrorDocument = {
  id: string;
  title: string;
  date: string;
  status: "error";
  error: string;
};

export type CompletedDocument = {
  id: string;
  title: string;
  date: string;
  status: "completed";
  riskLevel: RiskLevel;
  riskScore: number;
  findings: string[];
  recommendations?: string;
};

export type DocumentType = AnalyzingDocument | ErrorDocument | CompletedDocument;

export interface DocumentCardProps {
  id: string;
  title: string;
  date: string;
  status: "analyzing" | "completed" | "error";
  riskLevel?: RiskLevel;
  riskScore?: number;
  findings?: string[];
  recommendations?: string;
  progress?: number;
  error?: string;
  onDelete?: () => void;
  onView?: (id: string) => void;
  className?: string;
}
