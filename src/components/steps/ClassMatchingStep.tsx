
import React from "react";
import ClassMatching from "@/components/ClassMatching";
import { ClassMatch } from "@/lib/mockData";

interface ClassMatchingStepProps {
  matches: ClassMatch[];
  selectedClassId: string | null;
  onClassSelect: (classId: string) => void;
  onCreateNewClass: () => void;
  isProcessing: boolean;
}

const ClassMatchingStep: React.FC<ClassMatchingStepProps> = ({
  matches,
  selectedClassId,
  onClassSelect,
  onCreateNewClass,
  isProcessing,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Find Matching Class Actions</h2>
      <p className="mb-6 text-gray-600">
        Based on your case details, we've found potential matching class actions.
        Select one to join or create a new class action.
      </p>
      <ClassMatching
        possibleMatches={matches}
        selectedClassId={selectedClassId}
        onClassSelect={onClassSelect}
        onCreateNewClass={onCreateNewClass}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default ClassMatchingStep;
