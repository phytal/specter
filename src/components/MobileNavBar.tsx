
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Step } from "./WorkflowSidebar";

interface MobileNavBarProps {
  steps: Step[];
  currentStep: number;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onStepClick?: (step: number) => void;
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({
  steps,
  currentStep,
  isMenuOpen,
  onToggleMenu,
  onStepClick,
}) => {
  const currentStepObj = steps.find((step) => step.id === currentStep);

  return (
    <div className="md:hidden w-full">
      <div className="bg-teal-700 text-white p-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold">Specter</h1>
          <p className="text-xs opacity-80">Step {currentStep}: {currentStepObj?.name}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white"
          onClick={onToggleMenu}
        >
          {isMenuOpen ? (
            <ChevronUp className="h-6 w-6" />
          ) : (
            <ChevronDown className="h-6 w-6" />
          )}
        </Button>
      </div>

      {isMenuOpen && (
        <div className="bg-teal-50 border-b border-teal-100">
          <div className="p-2">
            {steps.map((step) => (
              <button
                key={step.id}
                className={cn(
                  "w-full text-left p-3 rounded-md flex items-center space-x-3 transition-colors",
                  step.status === "current" && "bg-teal-100 text-teal-700",
                  step.status === "completed" && "text-teal-700",
                  step.status === "upcoming" && "text-teal-400",
                  step.status !== "upcoming" && onStepClick && "cursor-pointer hover:bg-teal-100"
                )}
                onClick={() => {
                  if (onStepClick && step.status !== "upcoming") {
                    onStepClick(step.id);
                    onToggleMenu();
                  }
                }}
                disabled={step.status === "upcoming"}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border",
                    step.status === "completed" && "bg-teal-700 border-teal-700",
                    step.status === "current" && "border-teal-700",
                    step.status === "upcoming" && "border-teal-300"
                  )}
                >
                  {step.status === "completed" ? (
                    <Check className="w-4 h-4 text-white" />
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
        </div>
      )}
    </div>
  );
};

export default MobileNavBar;
