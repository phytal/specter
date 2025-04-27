import React from "react";
import ClassMatching from "@/components/ClassMatching";
import { ClassMatch } from "@/lib/mockData";

interface ClassMatchingStepProps {
  matches: ClassMatch[];
  selectedClassId: string | null;
  onClassSelect: (classId: string) => void;
  onCreateNewClass: () => void;
  onNext: () => void;
  firecrawlResults: Record<string, string>;
  firecrawlProgress: number;
  rawContextModal: {
    open: boolean;
    context: any | null;
    match: ClassMatch | null;
  };
  setRawContextModal: (modal: {
    open: boolean;
    context: any | null;
    match: ClassMatch | null;
  }) => void;
}

const ClassMatchingStep: React.FC<ClassMatchingStepProps> = ({
  matches,
  selectedClassId,
  onClassSelect,
  onCreateNewClass,
  onNext,
  firecrawlResults,
  firecrawlProgress,
  rawContextModal,
  setRawContextModal,
}) => {
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Match Similar Class Actions</h2>
      <p className="mb-6 text-gray-600">
        We've found class actions that match your case. Join an existing class action
        to increase your chances of compensation.
      </p>
      
      <ClassMatching
        matches={matches}
        selectedClassId={selectedClassId}
        onClassSelect={onClassSelect}
        onCreateNewClass={onCreateNewClass}
        onNext={onNext}
        firecrawlResults={firecrawlResults}
        firecrawlProgress={firecrawlProgress}
        rawContextModal={rawContextModal}
        setRawContextModal={setRawContextModal}
      />
    </div>
  );
};

export default ClassMatchingStep;
