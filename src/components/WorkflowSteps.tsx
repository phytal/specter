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
import type { FirecrawlContext } from "@/components/ClassMatching";
import type { ClassMatch } from "@/lib/mockData";
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
  setComplaintSections?: (sections: ComplaintSection[]) => void;
  onSectionUpdate: (id: string, content: string) => void;
  onRegenerateSection: (id: string) => void;
  exportFiles: ExportFile[];
  onDownload: (fileType: "complaint" | "exhibits" | "all") => void;
  onPreview: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSearchQueryExtracted: (query: string) => void;
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
    setComplaintSections, // Add this prop
    onSectionUpdate,
    onRegenerateSection,
    exportFiles,
    onDownload,
    onPreview,
    onNext,
    onPrevious,
    onSearchQueryExtracted,
  }) => {
    // Track extracted PDF text
    const [pdfText, setPdfText] = React.useState<string>("");
    // Store Firecrawl results (plain text format)
    const [firecrawlResults, setFirecrawlResults] = React.useState<Record<string, string>>({});
    // Modal state for raw context modal (fixes hook violation)
    const [rawContextModal, setRawContextModal] = React.useState({
      open: false,
      context: null,
      match: null,
    });

    // Hook for SERP API class matches
    const { matches, loading, error } = useSerpApiClassMatches(
      pdfText,
      currentStep === 3
    );

    const renderStepContent = React.useCallback(() => {
      switch (currentStep) {
        case 1:
          return (
            <UploadEvidenceStep
              onFilesSelected={onFilesSelected}
              onFactsExtracted={onFactsUpdate}
              onPdfTextExtracted={setPdfText}
            />
          );
        case 2:
          console.log("WorkflowSteps onSearchQueryExtracted:", onSearchQueryExtracted);
          return (
            <DocumentReviewStep
              documentName={uploadedFiles[0]?.name || "Document.pdf"}
              facts={facts}
              onFactsUpdate={onFactsUpdate}
              isProcessing={isProcessing}
              file={uploadedFiles[0]}
              rawText={pdfText}
              onSearchQueryExtracted={onSearchQueryExtracted}
            />
          );
        case 3:
          return (
            <ClassMatchingStep
              matches={matches}
              selectedClassId={selectedClassId}
              onClassSelect={onClassSelect}
              onCreateNewClass={onCreateNewClass}
              onNext={onNext}
              firecrawlResults={firecrawlResults}
              firecrawlProgress={0}
              rawContextModal={rawContextModal}
              setRawContextModal={setRawContextModal}
            />
          );
        case 4:
          return (
            <ComplaintDraftStep
              sections={complaintSections}
              onSectionUpdate={onSectionUpdate}
              facts={facts}
              selectedClassId={selectedClassId}
              firecrawlResults={firecrawlResults}
              setComplaintSections={setComplaintSections}
              onRegenerateSection={async (id: string) => {
                try {
                  const section = complaintSections.find((s) => s.id === id);
                  if (!section) return;

                  toast("Regenerating section", { 
                    description: "This may take a moment..." 
                  });
                  
                  // Get the firecrawl results text for the selected class
                  const classActionText = firecrawlResults[selectedClassId] || "";
                  
                  // Prepare facts data
                  const factsData = facts.map(fact => `${fact.type}: ${fact.value}`).join("\n");
                  
                  // Create a targeted prompt for the specific section
                  const prompt = `
Regenerate the '${section.title}' section of a class action complaint.

FACTS FROM EVIDENCE:
${factsData}

CLASS ACTION INFORMATION:
${classActionText}

Original section content:
${section.content}

Improve this section with more specific details, stronger legal arguments, and clearer structure.
Focus only on this section. Be specific and detailed with legal language appropriate for this section.
`;

                  const completion = await openai.chat.completions.create({
                    model: "webai-llm",
                    messages: [{ role: "user", content: prompt }],
                  });
                  
                  const regeneratedContent = completion.choices[0].message.content || "";
                  
                  // Update the section with regenerated content
                  onSectionUpdate(id, regeneratedContent);
                  toast.success("Section regenerated successfully");
                } catch (error) {
                  console.error("Error regenerating section:", error);
                  toast.error("Failed to regenerate section");
                }
              }}
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
      onSearchQueryExtracted,
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
