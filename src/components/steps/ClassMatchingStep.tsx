import React from "react";
import ClassMatchingContainer from "@/components/ClassMatching";
import { ClassMatch } from "@/lib/mockData";

import type { FirecrawlContext } from "@/components/ClassMatching";

interface ClassMatchingStepProps {
  matches: ClassMatch[];
  selectedClassId: string | null;
  onClassSelect: (classId: string) => void;
  onCreateNewClass: () => void;
  isProcessing: boolean;
  error?: string | null;
  onNext: () => void;
  firecrawlResults?: Record<string, FirecrawlContext>;
  firecrawlProgress?: number;
  rawContextModal: {
    open: boolean;
    context: FirecrawlContext | null;
    match: ClassMatch | null;
  };
  setRawContextModal: (modal: {
    open: boolean;
    context: FirecrawlContext | null;
    match: ClassMatch | null;
  }) => void;
  onFirecrawlResultsUpdate: (results: Record<string, FirecrawlContext>) => void;
  onLoadingUpdate: (isLoading: boolean) => void;
}

const ClassMatchingStep: React.FC<ClassMatchingStepProps> = ({
  matches,
  selectedClassId,
  onClassSelect,
  onCreateNewClass,
  isProcessing,
  error,
  onNext,
  firecrawlResults,
  firecrawlProgress,
  rawContextModal,
  setRawContextModal,
  onFirecrawlResultsUpdate,
  onLoadingUpdate,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Find Matching Class Actions</h2>
      <p className="mb-6 text-gray-600">
        Based on your case details, we've found potential matching class actions.
        Select one to join or create a new class action.
      </p>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <ClassMatchingContainer
        matches={matches}
        selectedClassId={selectedClassId}
        onClassSelect={onClassSelect}
        onCreateNewClass={onCreateNewClass}
        onNext={onNext}
        firecrawlResults={firecrawlResults}
        firecrawlProgress={firecrawlProgress}
        rawContextModal={rawContextModal}
        setRawContextModal={setRawContextModal}
        onFirecrawlResultsUpdate={onFirecrawlResultsUpdate}
        onLoadingUpdate={onLoadingUpdate}
      />
    </div>
  );
};

export default ClassMatchingStep;
