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
import type { FirecrawlContext } from "@/components/ClassMatching";
import type { ClassMatch } from "@/lib/mockData";

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
  setComplaintSections: (sections: ComplaintSection[]) => void;
  searchQuery: string;
  onSearchQueryExtracted: (searchQuery: string) => void;
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
    setComplaintSections,
    searchQuery,
    onSearchQueryExtracted,
  }) => {
    const [pdfText, setPdfText] = React.useState<string>("");
    const [firecrawlResults, setFirecrawlResults] = React.useState<Record<string, FirecrawlContext>>({});
    const [isGeneratingDraft, setIsGeneratingDraft] = React.useState(false);
    const [isFirecrawlLoading, setIsFirecrawlLoading] = React.useState(false);

    const { matches, loading, error } = useSerpApiClassMatches(
      searchQuery,
      currentStep === 3
    );

    React.useEffect(() => {
      const generateInitialComplaint = async () => {
        if (currentStep === 4 && complaintSections.length === 0 && !isGeneratingDraft) {
          setIsGeneratingDraft(true);
          toast("Generating initial complaint draft", { description: "This may take a moment..." });
          try {
            const firecrawlText = matches
              .map(match => {
                const context = firecrawlResults[match.id];
                if (!context || context.error) return `### ${match.name}\nError fetching context or no context available.`;
                const content = context.rawData?.markdown || context.rawData?.text || context.text || JSON.stringify(context.rawData);
                return `### ${match.name}\n${content}`;
              })
              .join("\n\n");

            const consolidatedInfo = `
## Relevant Class Action Contexts:
${firecrawlText}

## Raw Text from Uploaded Documents:
${pdfText}
            `;
            const prompt = `You are a legal assistant. Draft a clear and concise class action lawsuit complaint as a markdown document based *only* on the provided information. Use standard legal section headings (e.g., INTRODUCTION, PARTIES, JURISDICTION AND VENUE, FACTUAL ALLEGATIONS, CLASS ACTION ALLEGATIONS, CAUSES OF ACTION, PRAYER FOR RELIEF) and numbered paragraphs within each section. Ensure the output is valid markdown.

${consolidatedInfo}`;

            const stream = await openai.chat.completions.create({
              model: "webai-llm",
              messages: [{ role: "user", content: prompt }],
              stream: true,
            });

            let markdownDraft = "";
            for await (const chunk of stream) {
              const choiceAny = chunk.choices?.[0] as any;
              const rawToken = choiceAny.delta?.content ?? choiceAny.message?.content ?? "";
              markdownDraft += rawToken;
            }

            setComplaintSections([{ id: 'draft', title: 'Draft', content: markdownDraft, isEditable: true }]);
            toast.success("Initial complaint draft generated");

          } catch (err) {
            console.error("Initial LLM complaint draft error:", err);
            toast.error("Failed to generate initial draft");
            setComplaintSections([{ id: 'error', title: 'Error', content: 'Failed to generate draft. Please try again or contact support.', isEditable: false }]);
          } finally {
            setIsGeneratingDraft(false);
          }
        }
      };

      generateInitialComplaint();
    }, [currentStep, pdfText, matches, firecrawlResults, complaintSections.length, isGeneratingDraft, setComplaintSections]);

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
              documentName={uploadedFiles[0]?.name || ""}
              file={uploadedFiles[0]}
              facts={facts}
              onFactsUpdate={onFactsUpdate}
              isProcessing={isProcessing}
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
              isProcessing={loading}
              error={error}
              onNext={onNext}
              rawContextModal={null}
              setRawContextModal={null}
              onFirecrawlResultsUpdate={setFirecrawlResults}
              firecrawlResults={firecrawlResults}
              onLoadingUpdate={setIsFirecrawlLoading} // Pass the setter for the loading state
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
                    messages: [{ role: "user", content: prompt }],
                    stream: true,
                  });
                  let text = "";
                  for await (const chunk of stream) {
                    const choiceAny = chunk.choices?.[0] as any;
                    const rawToken = choiceAny.delta?.content ?? choiceAny.message?.content ?? "";
                    text += rawToken;
                    onSectionUpdate(id, text);
                  }
                  toast.success("Section regenerated");
                } catch (err) {
                  console.error("LLM complaint draft error:", err);
                  toast.error("Regeneration failed");
                }
              }}
              isGenerating={isGeneratingDraft || isProcessing}
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
      pdfText,
      firecrawlResults,
      isGeneratingDraft,
      setComplaintSections,
      setIsFirecrawlLoading, // Add setter to dependency array
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
