
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Download, FileText, CircleX, Loader } from "lucide-react";

interface ExportFile {
  name: string;
  type: "pdf" | "csv" | "zip";
  status: "ready" | "generating" | "error";
  size?: number;
}

interface ExportPackageProps {
  files: ExportFile[];
  onDownload: (fileType: "complaint" | "exhibits" | "all") => void;
  onPreview: () => void;
  isExporting: boolean;
}

const ExportPackage: React.FC<ExportPackageProps> = ({
  files,
  onDownload,
  onPreview,
  isExporting,
}) => {
  const getFileIcon = (file: ExportFile) => {
    if (file.status === "generating") return <Loader className="h-5 w-5 text-amber animate-spin" />;
    if (file.status === "error") return <CircleX className="h-5 w-5 text-red-500" />;
    return <FileText className="h-5 w-5 text-teal-600" />;
  };

  const getStatusText = (file: ExportFile) => {
    switch (file.status) {
      case "generating":
        return <span className="text-amber">Generating...</span>;
      case "error":
        return <span className="text-red-500">Error</span>;
      case "ready":
        return <span className="text-green-600">Ready</span>;
      default:
        return null;
    }
  };

  const allReady = files.every((file) => file.status === "ready");

  if (isExporting) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader className="h-8 w-8 text-teal-600 animate-spin" />
        <p className="text-lg font-medium">Preparing your legal package...</p>
        <p className="text-sm text-gray-500 text-center max-w-md">
          Compiling all documents for download
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Export Legal Package</h2>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Package Contents</h3>
          <div className="space-y-4">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between border-b pb-3"
              >
                <div className="flex items-center">
                  {getFileIcon(file)}
                  <span className="ml-2">{file.name}</span>
                  {file.size && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                  )}
                </div>
                {getStatusText(file)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col space-y-4">
        <div className="bg-teal-50 rounded-lg p-4 mb-4 flex items-start">
          <div className="mt-1">
            <Check className="h-5 w-5 text-teal-700" />
          </div>
          <div className="ml-3">
            <p className="text-teal-700 font-medium">Privacy Preserved</p>
            <p className="text-sm text-teal-600">
              Your documents have been processed entirely on your device.
              No personal data was sent to external servers.
            </p>
          </div>
        </div>

        <Button
          onClick={onPreview}
          variant="outline"
          className="text-teal-700 border-teal-700 hover:bg-teal-50"
        >
          Preview Complaint
        </Button>

        <Button
          onClick={() => onDownload("all")}
          disabled={!allReady}
          className="bg-amber hover:bg-amber-600 text-white"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Complete Package
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Button
            onClick={() => onDownload("complaint")}
            variant="outline"
            disabled={!allReady}
          >
            Download Complaint Only
          </Button>
          <Button
            onClick={() => onDownload("exhibits")}
            variant="outline"
            disabled={!allReady}
          >
            Download Exhibits Only
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportPackage;
