
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
            <TabsTrigger value="sections">Edit Sections</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="preview" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <h1 className="text-2xl font-bold text-center mb-6">COMPLAINT</h1>
                {sections.map((section, index) => (
                  <div key={section.id} className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
                    <div className="markdown-content">
                      <ReactMarkdown>{section.content}</ReactMarkdown>
                    </div>
                    {index < sections.length - 1 && <Separator className="my-6" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="mt-0 space-y-4">
          {sections.map((section) => (
            <Card key={section.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{section.title}</h3>
                  <div className="flex gap-2">
                    {section.isEditable && editingSectionId !== section.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(section)}
                        className="text-teal-700 border-teal-700 hover:bg-teal-50"
                      >
                        Edit
                      </Button>
                    )}
                    {onRegenerateSection && section.isEditable && (
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => onRegenerateSection(section.id)}
                        className="text-amber border-amber hover:bg-amber-50"
                      >
                        Regenerate
                      </Button>
                    )}
                  </div>
                </div>

                {editingSectionId === section.id ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={10}
                      className="w-full"
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline"
                        size="sm" 
                        onClick={handleCancelClick}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSaveClick}
                        className="bg-teal-700 hover:bg-teal-800"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <div className="line-clamp-3">
                      <ReactMarkdown>{section.content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplaintDraft;
