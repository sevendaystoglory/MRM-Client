import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf'; // You'll need to install react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFPreviewProps {
  fileHandle: FileSystemFileHandle;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ fileHandle }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        const file = await fileHandle.getFile();
        setUrl(URL.createObjectURL(file));
      } catch (err) {
        setError('Error loading PDF');
      }
    };

    loadPDF();
    
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [fileHandle]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!url) {
    return <div>Loading...</div>;
  }

  return (
    <div className="overflow-auto">
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={(error) => setError('Error loading PDF')}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page 
            key={`page_${index + 1}`} 
            pageNumber={index + 1} 
            className="mb-4"
          />
        ))}
      </Document>
    </div>
  );
};