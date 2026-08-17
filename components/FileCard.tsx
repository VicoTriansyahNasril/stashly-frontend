import { Card, CardContent, CardFooter } from "./ui/card";
import { formatFileSize, getFileIcon, formatDate } from "../lib/utils";
import { StashlyFile } from "../types/file";
import { FileIcon, ImageIcon, FileTextIcon, PackageIcon, Download, Eye } from "lucide-react";
import { Button } from "./ui/button";

interface FileCardProps {
  file: StashlyFile;
}

export function FileCard({ file }: FileCardProps) {
  const iconType = getFileIcon(file.fileType);

  const renderIcon = () => {
    switch (iconType) {
      case 'image':
        return <ImageIcon className="h-16 w-16 text-blue-500" />;
      case 'pdf':
        return <FileTextIcon className="h-16 w-16 text-red-500" />;
      case 'apk':
        return <PackageIcon className="h-16 w-16 text-green-500" />;
      default:
        return <FileIcon className="h-16 w-16 text-gray-500" />;
    }
  };

  const handleDownload = () => {
    if (file.webContentLink) {
      window.open(file.webContentLink, '_blank');
    } else {
      alert('Download link not available for this file.');
    }
  };

  const handlePreview = () => {
    if (file.webViewLink) {
      window.open(file.webViewLink, '_blank');
    } else {
      alert('Preview link not available for this file.');
    }
  };

  return (
    <Card className="rounded-xl overflow-hidden border-border/50 hover:border-blue-500/50 transition-all shadow-sm hover:shadow-md group flex flex-col h-full">
      <CardContent className="p-6 flex flex-col items-center justify-center bg-muted/20 min-h-[160px] relative">
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
          {/* Overlay actions can be placed here if desired */}
        </div>
        {renderIcon()}
      </CardContent>
      <CardFooter className="p-4 flex flex-col items-start gap-3 bg-card mt-auto border-t">
        <div className="w-full">
          <h3 className="font-medium text-sm truncate w-full" title={file.fileName}>
            {file.fileName}
          </h3>
          <div className="flex justify-between items-center w-full mt-1.5">
            <p className="text-xs text-muted-foreground font-medium">
              {formatFileSize(file.fileSize)}
            </p>
            <p className="text-[10px] text-muted-foreground/70 bg-secondary px-2 py-0.5 rounded-full">
              {formatDate(file.uploadedAt)}
            </p>
          </div>
        </div>
        
        <div className="flex w-full gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs h-8"
            onClick={handlePreview}
            disabled={!file.webViewLink}
          >
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700"
            onClick={handleDownload}
            disabled={!file.webContentLink}
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
