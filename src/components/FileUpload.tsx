
import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type AcceptedFileType = "application/pdf" | "image/jpeg" | "image/png" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: AcceptedFileType[];
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-all",
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
        
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
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
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Uploaded Files</h3>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-white border rounded-md"
              >
                <div className="flex items-center">
                  <File className="h-5 w-5 text-teal-600 mr-2" />
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
