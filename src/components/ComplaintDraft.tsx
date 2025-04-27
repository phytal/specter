import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ComplaintSection {
  id: string;
  title: string;
  content: string;
  isEditable: boolean;
}

interface ComplaintDraftProps {
  sections: ComplaintSection[];
  onSectionUpdate: (id: string, content: string) => void;
  isGenerating: boolean;
  className?: string;
  onRegenerateSection?: (id: string) => void;
}

const ComplaintDraft: React.FC<ComplaintDraftProps> = ({
  sections,
  onSectionUpdate,
  isGenerating,
  className = "",
  onRegenerateSection,
}) => {
  const [activeTab, setActiveTab] = useState("preview");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const handleEditClick = (section: ComplaintSection) => {
    if (!section.isEditable) return;
    setEditingSectionId(section.id);
    setEditingContent(section.content);
  };

  const handleSaveClick = () => {
    if (editingSectionId) {
      onSectionUpdate(editingSectionId, editingContent);
      setEditingSectionId(null);
    }
  };

  const handleCancelClick = () => {
    setEditingSectionId(null);
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader className="h-8 w-8 text-teal-600 animate-spin" />
        <p className="text-lg font-medium">Generating complaint draft...</p>
        <p className="text-sm text-gray-500 text-center max-w-md">
          Creating a legal complaint based on your evidence without sending data off your device
        </p>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-teal-600 animate-progress"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Complaint Draft</h2>
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="preview" className="mt-0">
          <div className="bg-white shadow-lg rounded-md p-8 md:p-12 max-w-4xl mx-auto border border-gray-200">
            <article className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:font-semibold prose-headings:mt-6 prose-headings:mb-2 prose-p:leading-relaxed">
              <h1 className="text-2xl font-bold text-center mb-8 border-b pb-2">COMPLAINT</h1>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {sections.map(s => `## ${s.title}\n\n${s.content}`).join('\n\n')}
              </ReactMarkdown>
            </article>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplaintDraft;
