
import { useState } from "react";
import { FileText, Trash2, ExternalLink, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import RiskIndicator from "./RiskIndicator";
import { Document, DocumentStatus, RiskLevel } from "@/types/document";

interface DocumentCardProps {
  id: string;
  title: string;
  date: string;
  status: DocumentStatus;
  progress?: number;
  riskLevel?: RiskLevel;
  riskScore?: number;
  findings?: string[];
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
  transitionDelay?: string;
}

const DocumentCard = ({
  id,
  title,
  date,
  status,
  progress = 0,
  riskLevel = "low",
  riskScore,
  findings = [],
  onDelete,
  onView,
  className,
  style,
  transitionDelay,
}: DocumentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusIcon = () => {
    switch (status) {
      case "analyzing":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "analyzing":
        return "Analyzing";
      case "completed":
        return "Analysis Complete";
      case "error":
        return "Analysis Failed";
      default:
        return "";
    }
  };

  return (
    <div
      className={cn(
        "relative glass-card p-6 overflow-hidden transition-all duration-300",
        isHovered && "shadow-lg",
        className
      )}
      style={{ 
        ...style,
        transitionDelay: transitionDelay 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mr-3">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-lg leading-tight">{title}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <span>{date}</span>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                {getStatusIcon()}
                <span className="ml-1">{getStatusText()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          {onView && (
            <button
              onClick={() => onView(id)}
              className="p-2 rounded-lg text-foreground/70 hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="View document"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="p-2 rounded-lg text-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Delete document"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {status === "analyzing" && (
        <div className="mb-4">
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-muted-foreground mt-1 text-right">{progress}% complete</div>
        </div>
      )}

      {status === "completed" && riskLevel && (
        <div className="mb-4">
          <RiskIndicator level={riskLevel} score={riskScore} />
        </div>
      )}

      {status === "completed" && findings.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Key Findings</h4>
          <ul className="text-sm space-y-1">
            {findings.slice(0, 3).map((finding, index) => (
              <li key={index} className="text-muted-foreground">{finding}</li>
            ))}
            {findings.length > 3 && (
              <li className="text-primary text-xs font-medium cursor-pointer hover:underline">
                + {findings.length - 3} more findings
              </li>
            )}
          </ul>
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20 text-sm text-destructive">
          Analysis failed. Please try again or contact support.
        </div>
      )}
    </div>
  );
};

export default DocumentCard;
