import { useState, useEffect } from 'react';

interface PDFPreviewProps {
  fileHandle: FileSystemFileHandle;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ fileHandle }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        const file = await fileHandle.getFile();
        const url = URL.createObjectURL(file);
        setPdfUrl(url);

        // Cleanup function
        return () => {
          if (url) URL.revokeObjectURL(url);
        };
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPDF();
  }, [fileHandle]);

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <iframe
      src={pdfUrl}
      className="w-full h-full"
      title="PDF Preview"
    />
  );
};