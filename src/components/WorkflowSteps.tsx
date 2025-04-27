import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import UploadEvidenceStep from "@/components/steps/UploadEvidenceStep";
import { useSerpApiClassMatches } from "@/hooks/useSerpApiClassMatches";
import WorkflowNavigation from "@/components/WorkflowNavigation";
import DocumentReviewStep from "@/components/steps/DocumentReviewStep";
import ClassMatchingStep from "@/components/steps/ClassMatchingStep";
import SerpApiClassMatchingStep from "@/components/SerpApiClassMatchingStep";
import ComplaintDraftStep from "@/components/steps/ComplaintDraftStep";
import ExportPackageStep from "@/components/steps/ExportPackageStep";
import { Step } from "@/components/WorkflowSidebar";
import { openai } from "@/lib/openai";
import { Fact, ComplaintSection, ExportFile } from "@/lib/mockData";

interface WorkflowStepsProps {
  currentStep: number;
  steps: Step[];
  isProcessing: boolean;
  uploadedFiles: File[];
  facts: Fact[];
  onFilesSelected: (files: File[]) => void;
  onFactsUpdate: (facts: Fact[]) => void;
  onClassSelect: (classId: string) => void;
  onCreateNewClass: () => void;
  selectedClassId: string | null;
  complaintSections: ComplaintSection[];
  onSectionUpdate: (id: string, content: string) => void;
  onRegenerateSection: (id: string) => void;
  exportFiles: ExportFile[];
  onDownload: (fileType: "complaint" | "exhibits" | "all") => void;
  onPreview: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const WorkflowStepsComponent: React.FC<WorkflowStepsProps> = memo(
  ({
    currentStep,
    steps,
    isProcessing,
    uploadedFiles,
    facts,
    onFilesSelected,
    onFactsUpdate,
    onClassSelect,
    onCreateNewClass,
    selectedClassId,
    complaintSections,
    onSectionUpdate,
    onRegenerateSection,
    exportFiles,
    onDownload,
    onPreview,
    onNext,
    onPrevious,
  }) => {
    // Modal state for raw context modal (fixes hook violation)
    const [rawContextModal, setRawContextModal] = React.useState({
      open: false,
      context: null,
      match: null,
    });
    // Move hook to component level
    const { matches, loading, error } = useSerpApiClassMatches(
      facts,
      currentStep === 3
    );

    const renderStepContent = React.useCallback(() => {
      switch (currentStep) {
        case 1:
          return (
            <UploadEvidenceStep
              onFilesSelected={onFilesSelected}
              onFactsExtracted={onFactsUpdate}
            />
          );
        case 2:
          return (
            <DocumentReviewStep
              documentName={uploadedFiles[0]?.name || "Document.pdf"}
              facts={facts}
              onFactsUpdate={onFactsUpdate}
              isProcessing={isProcessing}
              file={uploadedFiles[0]}
            />
          );
        case 3:
          return (
            <ClassMatchingStep
              matches={matches}
              selectedClassId={selectedClassId}
              onClassSelect={onClassSelect}
              onCreateNewClass={onCreateNewClass}
              isProcessing={loading}
              error={error}
              onNext={onNext}
              rawContextModal={rawContextModal}
              setRawContextModal={setRawContextModal}
            />
          );
        case 4:
          return (
            <ComplaintDraftStep
              sections={complaintSections}
              onSectionUpdate={onSectionUpdate}
              onRegenerateSection={async (id: string) => {
                toast("Regenerating section", { description: "This may take a moment..." });
                try {
                  const section = complaintSections.find((s) => s.id === id);
                  const prompt = `Draft complaint section '${section?.title}' using facts: ${JSON.stringify(facts)}. The output should be formatted using Markdown.`;
                  const stream = await openai.chat.completions.create({
                    model: "webai-llm",
                    // model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: prompt }],
                    stream: true,
                  });
                  let text = "";
                  for await (const chunk of stream) {
                    const choiceAny = chunk.choices?.[0] as any;
                    const rawToken = choiceAny.delta?.content ?? choiceAny.message?.content ?? "";
                    text += rawToken;
                    // Update in real-time to show streaming
                    onSectionUpdate(id, text);
                  }
                  toast.success("Section regenerated");
                } catch (err) {
                  console.error("LLM complaint draft error:", err);
                  toast.error("Regeneration failed");
                }
              }}
              isGenerating={isProcessing}
            />
          );
        case 5:
          return (
            <ExportPackageStep
              files={exportFiles}
              onDownload={onDownload}
              onPreview={onPreview}
              isExporting={isProcessing}
            />
          );
        default:
          return null;
      }
    }, [
      currentStep,
      uploadedFiles,
      facts,
      matches,
      loading,
      error,
      selectedClassId,
      complaintSections,
      exportFiles,
      isProcessing,
      onFilesSelected,
      onFactsUpdate,
      onClassSelect,
      onCreateNewClass,
      onSectionUpdate,
      onRegenerateSection,
      onDownload,
      onPreview,
      onNext,
      rawContextModal,
    ]);

    return (
      <div className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col min-h-screen">
        <div className="container mx-auto flex flex-col flex-1">
          <div className="flex-1">
            {renderStepContent()}
            <WorkflowNavigation
              currentStep={currentStep}
              totalSteps={steps.length}
              isProcessing={isProcessing}
              uploadedFiles={uploadedFiles}
              selectedClassId={selectedClassId}
              onNext={onNext}
              onPrevious={onPrevious}
            />
          </div>
          <div className="pt-4 border-t text-center text-sm text-gray-500 mt-auto">
            <p>
            Specter processes all data on-device for privacy.
            Always consult with a licensed attorney before legal filings.
            </p>
          </div>
        </div>
      </div>
    );
  }
);

WorkflowStepsComponent.displayName = "WorkflowSteps";

export default WorkflowStepsComponent;
