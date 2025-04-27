
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WorkflowNavigationProps {
  currentStep: number;
  totalSteps: number;
  isProcessing: boolean;
  uploadedFiles: File[];
  selectedClassId: string | null;
  onNext: () => void;
  onPrevious: () => void;
}

const WorkflowNavigation: React.FC<WorkflowNavigationProps> = ({
  currentStep,
  totalSteps,
  isProcessing,
  uploadedFiles,
  selectedClassId,
  onNext,
  onPrevious,
}) => {
  return (
    <div className="flex justify-between mt-8 pt-4 border-t">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1 || isProcessing}
        className="px-8"
      >
        Back
      </Button>
      
      {currentStep < totalSteps ? (
        <Button
          onClick={onNext}
          disabled={
            (currentStep === 1 && uploadedFiles.length === 0) ||
            (currentStep === 3 && !selectedClassId) ||
            isProcessing
          }
          className="px-8 bg-teal-700 hover:bg-teal-800"
        >
          {isProcessing ? "Processing..." : "Next"}
        </Button>
      ) : (
        <Button
          onClick={() => {
            toast.success("Process completed!", {
              description: "Thank you for using Class-Action Copilot.",
            });
          }}
          className="px-8 bg-amber hover:bg-amber-600 text-white"
        >
          Finish
        </Button>
      )}
    </div>
  );
};

export default WorkflowNavigation;
