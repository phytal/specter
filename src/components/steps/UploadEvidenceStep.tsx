
import React from "react";
import FileUpload from "@/components/FileUpload";
import { toast } from "sonner";

interface UploadEvidenceStepProps {
  onFilesSelected: (files: File[]) => void;
}

const UploadEvidenceStep: React.FC<UploadEvidenceStepProps> = ({ onFilesSelected }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload Your Evidence</h2>
      <p className="mb-6 text-gray-600">
        Upload documents related to your potential class action claim.
        We accept PDF, Word documents, and images. Your files never leave your device.
      </p>
      <FileUpload 
        onFilesSelected={(files) => {
          onFilesSelected(files);
          if (files.length > 0) {
            toast.success("Files uploaded successfully");
          }
        }} 
      />
    </div>
  );
};

export default UploadEvidenceStep;
