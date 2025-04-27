
import React from "react";
import { cn } from "@/lib/utils";
import { Check, Loader } from "lucide-react";

export type Step = {
  id: number;
  name: string;
  description: string;
  status: "upcoming" | "current" | "completed" | "processing";
};

type WorkflowSidebarProps = {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
};

export const WorkflowSidebar: React.FC<WorkflowSidebarProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="bg-teal-50 border-r border-teal-100 w-64 min-h-screen p-4 hidden md:block">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-teal-700">Specter</h1>
        <p className="text-sm text-teal-600 mt-1">Privacy-Preserving Legal Assistant</p>
      </div>

      <div className="space-y-1">
        {steps.map((step) => (
          <button
            key={step.id}
            className={cn(
              "w-full text-left p-3 rounded-md flex items-center space-x-3 transition-colors",
              step.status === "current" && "bg-teal-100 text-teal-700",
              step.status === "completed" && "text-teal-700",
              step.status === "upcoming" && "text-teal-400",
              step.status === "processing" && "text-teal-600",
              step.status !== "upcoming" && onStepClick && "cursor-pointer hover:bg-teal-100"
            )}
            onClick={() => {
              if (onStepClick && step.status !== "upcoming") {
                onStepClick(step.id);
              }
            }}
            disabled={step.status === "upcoming"}
            aria-current={step.status === "current" ? "step" : undefined}
          >
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border",
                step.status === "completed" && "bg-teal-700 border-teal-700",
                step.status === "current" && "border-teal-700",
                step.status === "upcoming" && "border-teal-300",
                step.status === "processing" && "border-teal-500"
              )}
            >
              {step.status === "completed" ? (
                <Check className="w-4 h-4 text-white" />
              ) : step.status === "processing" ? (
                <Loader className="w-4 h-4 text-teal-500 animate-spin" />
              ) : (
                <span
                  className={cn(
                    step.status === "current" ? "text-teal-700" : "text-teal-400"
                  )}
                >
                  {step.id}
                </span>
              )}
            </div>
            <div>
              <div className="font-medium">{step.name}</div>
              <div className="text-xs text-teal-600">{step.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Progress & Privacy section - now in its own area */}
      <div className="mt-auto px-4 pt-6 pb-4 border-t border-teal-100">
        <div className="text-xs text-teal-600 mb-2">
          <strong>Privacy Guarantee:</strong> Your documents stay on your device.
        </div>
        {/* Progress percentage marker */}
        {steps.length > 0 && (
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-teal-700 font-medium">
              Progress
            </span>
            <span className="text-xs text-teal-700 font-semibold">
              {Math.round((currentStep / steps.length) * 100)}%
            </span>
          </div>
        )}
        <div className="h-2 w-full bg-teal-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-600 transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
