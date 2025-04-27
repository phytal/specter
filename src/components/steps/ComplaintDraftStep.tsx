import React, { useState, useEffect } from "react";
import ComplaintDraft from "@/components/ComplaintDraft";
import { ComplaintSection, Fact } from "@/lib/mockData";
import { openai } from "@/lib/openai";
import { toast } from "sonner";

interface ComplaintDraftStepProps {
  sections: ComplaintSection[];
  onSectionUpdate: (id: string, content: string) => void;
  onRegenerateSection: (id: string) => void;
  isGenerating?: boolean;
  facts?: Fact[];
  selectedClassId?: string;
  firecrawlResults?: Record<string, string>;
  setComplaintSections?: (sections: ComplaintSection[]) => void;
}

const ComplaintDraftStep: React.FC<ComplaintDraftStepProps> = ({
  sections,
  onSectionUpdate,
  onRegenerateSection,
  isGenerating: externalIsGenerating,
  facts = [],
  selectedClassId = "",
  firecrawlResults = {},
  setComplaintSections,
}) => {
  const [localIsGenerating, setLocalIsGenerating] = useState(false);
  const isGenerating = externalIsGenerating || localIsGenerating;
  
  // Generate complaint when component mounts if sections are empty or need refreshing
  useEffect(() => {
    const shouldGenerateComplaint = sections.length === 0 || 
      sections.every(section => !section.content || section.content.trim() === '');
      
    if (shouldGenerateComplaint && selectedClassId && facts.length > 0) {
      generateComplaint();
    }
  }, [selectedClassId, facts, sections]);
  
  const generateComplaint = async () => {
    if (!setComplaintSections) return;
    
    try {
      setLocalIsGenerating(true);
      
      // Get the firecrawl results text for the selected class
      const classActionText = firecrawlResults[selectedClassId] || "";
      
      // Prepare facts data
      const factsData = facts.map(fact => `${fact.type}: ${fact.value}`).join("\n");

      // Create prompt with structured data - including sample format
      const prompt = `
Generate a complete legal complaint document for a class action lawsuit based on the following:

FACTS FROM EVIDENCE:
${factsData}

CLASS ACTION INFORMATION:
${classActionText}

Your response should be formatted exactly like this example, with these exact section headings (COMPLAINT, INTRODUCTION, PARTIES, etc.):

COMPLAINT
INTRODUCTION
This section introduces the case, what damages are being sought, and a brief overview.

PARTIES
Information about plaintiff and defendant.

JURISDICTION AND VENUE
Legal basis for the court's authority.

FACTUAL ALLEGATIONS
Detailed allegations based on provided facts.

CLASS ACTION ALLEGATIONS
Requirements for class certification.

CAUSES OF ACTION
Legal claims being asserted.

PRAYER FOR RELIEF
Specific relief requested.
`;

      // Call OpenAI to generate the complaint
      const completion = await openai.chat.completions.create({
        model: "webai-llm",
        messages: [{ role: "user", content: prompt }],
      });
      
      const complaintText = completion.choices[0].message.content || "";
      
      // Parse the response into sections based on headings
      const sectionMapping = [
        { heading: "COMPLAINT", id: "complaint-title" },
        { heading: "INTRODUCTION", id: "introduction" },
        { heading: "PARTIES", id: "parties" },
        { heading: "JURISDICTION AND VENUE", id: "jurisdiction" },
        { heading: "FACTUAL ALLEGATIONS", id: "factual-allegations" },
        { heading: "CLASS ACTION ALLEGATIONS", id: "class-allegations" },
        { heading: "CAUSES OF ACTION", id: "causes-of-action" },
        { heading: "PRAYER FOR RELIEF", id: "prayer-for-relief" }
      ];
      
      const generatedSections: ComplaintSection[] = [];
      
      // Extract each section using the section mapping
      for (let i = 0; i < sectionMapping.length; i++) {
        const currentSection = sectionMapping[i];
        const nextSection = sectionMapping[i + 1];
        
        let sectionContent = "";
        
        if (nextSection) {
          // Get content between current heading and next heading
          const startRegex = new RegExp(`${currentSection.heading}\\s*`, 'i');
          const endRegex = new RegExp(`${nextSection.heading}\\s*`, 'i');
          
          const startMatch = complaintText.match(startRegex);
          const endMatch = complaintText.match(endRegex);
          
          if (startMatch && endMatch) {
            const startIdx = startMatch.index + startMatch[0].length;
            const endIdx = endMatch.index;
            sectionContent = complaintText.substring(startIdx, endIdx).trim();
          }
        } else {
          // For the last section, get all remaining content
          const startRegex = new RegExp(`${currentSection.heading}\\s*`, 'i');
          const startMatch = complaintText.match(startRegex);
          
          if (startMatch) {
            const startIdx = startMatch.index + startMatch[0].length;
            sectionContent = complaintText.substring(startIdx).trim();
          }
        }
        
        // Add the section if content was found
        if (sectionContent) {
          generatedSections.push({
            id: currentSection.id,
            title: currentSection.heading,
            content: sectionContent,
            isEditable: true
          });
        }
      }
      
      // If no sections were extracted, create a single section with the entire content
      if (generatedSections.length === 0 && complaintText.trim() !== "") {
        generatedSections.push({
          id: "complaint-content",
          title: "Complaint",
          content: complaintText,
          isEditable: true
        });
      }
      
      // Update the complaint sections
      if (generatedSections.length > 0) {
        setComplaintSections(generatedSections);
        toast.success("Complaint draft generated successfully");
      } else {
        toast.error("Failed to parse complaint sections", {
          description: "Please try generating again"
        });
      }
    } catch (error) {
      console.error("Error generating complaint:", error);
      toast.error("Failed to generate complaint", {
        description: "Please try again or create manually"
      });
    } finally {
      setLocalIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Review Complaint Draft</h2>
      <p className="mb-6 text-gray-600">
        We've generated a legal complaint based on your evidence and the selected class action.
        Review and edit as needed before finalizing.
      </p>
      {sections.length === 0 && !isGenerating && (
        <div className="flex justify-center my-8">
          <button 
            onClick={generateComplaint}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Generate Complaint
          </button>
        </div>
      )}
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
