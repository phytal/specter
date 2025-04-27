
import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Upload, File as FileIcon, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type AcceptedFileType = "application/pdf" | "image/jpeg" | "image/png" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: AcceptedFileType[];
}

interface SampleDocument {
  id: string;
  name: string;
  description: string;
  path: string;
  type: string;
  size: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles = 10,
  acceptedFileTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<globalThis.File[]>([]);
  const [sampleDocuments, setSampleDocuments] = useState<SampleDocument[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("upload");

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFiles = (files: File[]): File[] => {
    return files.filter(file => {
      if (!acceptedFileTypes.includes(file.type as AcceptedFileType)) {
        toast.error(`File type not supported: ${file.name}`);
        return false;
      }
      return true;
    });
  };

  const processFiles = useCallback((files: FileList | File[]) => {
    const validFiles = validateFiles(Array.from(files));
    
    if (selectedFiles.length + validFiles.length > maxFiles) {
      toast.error(`You can upload a maximum of ${maxFiles} files`);
      return;
    }
    
    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  }, [selectedFiles, maxFiles, acceptedFileTypes, onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const handleRemove = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
    
    // Clear selected sample if all files are removed
    if (newFiles.length === 0) {
      setSelectedSampleId(null);
    }
  };

  // Fetch sample documents
  useEffect(() => {
    const fetchSampleDocuments = async () => {
      try {
        const response = await fetch('/sample-documents/samples.json');
        const data = await response.json();
        setSampleDocuments(data);
      } catch (error) {
        console.error('Error loading sample documents:', error);
        toast.error('Failed to load sample documents');
      }
    };

    fetchSampleDocuments();
  }, []);

  // Handle sample document selection
  const handleSampleSelect = async (docId: string) => {
    // If the same document is selected again, deselect it
    if (selectedSampleId === docId) {
      setSelectedSampleId(null);
      setSelectedFiles([]);
      onFilesSelected([]);
      return;
    }

    const selectedDoc = sampleDocuments.find(doc => doc.id === docId);
    if (!selectedDoc) return;

    try {
      // Fetch the actual file
      const response = await fetch(selectedDoc.path);
      const blob = await response.blob();
      
      // Create a File object from the blob
      const file = new File([blob], selectedDoc.name, { type: selectedDoc.type });
      
      // Update state
      setSelectedSampleId(docId);
      setSelectedFiles([file]);
      onFilesSelected([file]);
    } catch (error) {
      console.error('Error loading sample document:', error);
      toast.error(`Failed to load ${selectedDoc.name}`);
    }
  };

  const fileTypesText = acceptedFileTypes.map(type => {
    if (type === "application/pdf") return "PDF";
    if (type === "image/jpeg") return "JPG";
    if (type === "image/png") return "PNG";
    if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "DOCX";
    return type;
  }).join(", ");

  return (
    <div className="w-full">
      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="samples">Use Sample Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <label
            htmlFor="file-upload"
            className={cn(
              "w-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-all cursor-pointer",
              dragActive ? "border-amber bg-amber-50" : "border-gray-300 bg-gray-50",
              "hover:border-amber hover:bg-amber-50"
            )}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleChange}
              accept={acceptedFileTypes.join(",")}
              className="hidden"
            />
            <Upload className={cn(
              "h-12 w-12 mb-4",
              dragActive ? "text-amber" : "text-gray-400"
            )} />
            <span className="font-medium text-lg mb-1">
              Drag and drop your files here
            </span>
            <span className="text-sm text-gray-500 mb-4">
              or click to browse ({fileTypesText})
            </span>
            <Button variant="secondary" className="bg-amber text-white hover:bg-amber-600">
              Browse Files
            </Button>
          </label>
        </TabsContent>
        
        <TabsContent value="samples">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleDocuments.map((doc) => (
              <Card 
                key={doc.id} 
                className={cn(
                  "cursor-pointer transition-all hover:border-amber hover:shadow-md",
                  selectedSampleId === doc.id ? "border-2 border-amber" : ""
                )}
                onClick={() => handleSampleSelect(doc.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-amber" />
                    {doc.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">{doc.description}</CardDescription>
                  <p className="text-xs text-gray-500 mt-2">
                    {(doc.size / 1024).toFixed(2)} KB • {doc.type.split('/')[1].toUpperCase()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Selected Files</h3>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-white border rounded-md"
              >
                <div className="flex items-center">
                  <FileIcon className="h-5 w-5 text-teal-600 mr-2" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
