
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type RiskLevel = "low" | "medium" | "high";

interface RiskIndicatorProps {
  level: RiskLevel;
  score?: number;
  animate?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const RiskIndicator = ({
  level,
  score,
  animate = true,
  size = "md",
  showLabel = true,
  className,
}: RiskIndicatorProps) => {
  const [isVisible, setIsVisible] = useState(!animate);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  const getColor = () => {
    switch (level) {
      case "low":
        return "bg-green-500";
      case "medium":
        return "bg-amber-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getLabelColor = () => {
    switch (level) {
      case "low":
        return "text-green-700 dark:text-green-400";
      case "medium":
        return "text-amber-700 dark:text-amber-400";
      case "high":
        return "text-red-700 dark:text-red-400";
      default:
        return "text-gray-700 dark:text-gray-400";
    }
  };

  const getLabel = () => {
    switch (level) {
      case "low":
        return "Low Risk";
      case "medium":
        return "Medium Risk";
      case "high":
        return "High Risk";
      default:
        return "Unknown";
    }
  };

  const sizeClasses = {
    sm: "h-1.5 w-16",
    md: "h-2 w-24",
    lg: "h-3 w-32",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className={cn("rounded-full bg-secondary overflow-hidden", sizeClasses[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            getColor(),
            isVisible ? "w-full" : "w-0"
          )}
          style={{
            width: score !== undefined ? `${score}%` : "100%",
            transitionDelay: "150ms",
          }}
        ></div>
      </div>
      {showLabel && (
        <span
          className={cn(
            "mt-1 font-medium transition-opacity duration-500",
            getLabelColor(),
            textSizeClasses[size],
            isVisible ? "opacity-100" : "opacity-0"
          )}
        >
          {getLabel()}
          {score !== undefined && ` (${score}%)`}
        </span>
      )}
    </div>
  );
};

export default RiskIndicator;
