
import React from "react";
import ComplaintDraft from "@/components/ComplaintDraft";
import { ComplaintSection } from "@/lib/mockData";

interface ComplaintDraftStepProps {
  sections: ComplaintSection[];
  onSectionUpdate: (id: string, content: string) => void;
  onRegenerateSection: (id: string) => void;
  isGenerating: boolean;
}

const ComplaintDraftStep: React.FC<ComplaintDraftStepProps> = ({
  sections,
  onSectionUpdate,
  onRegenerateSection,
  isGenerating,
}) => {
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Review Complaint Draft</h2>
      <p className="mb-6 text-gray-600">
        We've generated a legal complaint based on your evidence and the selected class action.
        Review and edit as needed before finalizing.
      </p>
      <ComplaintDraft
        sections={sections}
        onSectionUpdate={onSectionUpdate}
        isGenerating={isGenerating}
        onRegenerateSection={onRegenerateSection}
      />
    </div>
  );
};

export default ComplaintDraftStep;
