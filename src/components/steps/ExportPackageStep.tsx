
import React from "react";
import ExportPackage from "@/components/ExportPackage";
import { ExportFile } from "@/lib/mockData";

interface ExportPackageStepProps {
  files: ExportFile[];
  onDownload: (type: "complaint" | "exhibits" | "all") => void;
  onPreview: () => void;
  isExporting: boolean;
}

const ExportPackageStep: React.FC<ExportPackageStepProps> = ({
  files,
  onDownload,
  onPreview,
  isExporting,
}) => {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Export Your Legal Package</h2>
      <p className="mb-6 text-gray-600">
        Your class action complaint package is ready to export.
        All documents are processed locally on your device for privacy.
      </p>
      <ExportPackage
        files={files}
        onDownload={onDownload}
        onPreview={onPreview}
        isExporting={isExporting}
      />
    </div>
  );
};

export default ExportPackageStep;
