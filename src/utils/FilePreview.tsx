import { useState, useEffect } from 'react';
import { CSVPreview } from './CSVPreview'
import { PDFPreview } from './PDFPreview';

interface FilePreviewProps {
  fileHandle: FileSystemFileHandle | null;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ fileHandle }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    const loadFile = async () => {
      if (!fileHandle) return;

      try {
        setLoading(true);
        setError(null);
        const file = await fileHandle.getFile();
        setFileName(file.name);
        setFileType(getFileType(file.name));
      } catch (err) {
        setError('Error loading file');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [fileHandle]);

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (['csv', 'xlsx', 'xls'].includes(extension)) return 'spreadsheet';
    if (extension === 'pdf') return 'pdf';
    return 'unsupported';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        {error}
      </div>
    );
  }

  if (!fileHandle) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a file to preview
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">{fileName}</h2>
      </div>
      <div className="h-[calc(100%-4rem)] overflow-auto">
        {fileType === 'spreadsheet' && <CSVPreview fileHandle={fileHandle} />}
        {fileType === 'pdf' && <PDFPreview fileHandle={fileHandle} />}
        {fileType === 'unsupported' && (
          <div className="flex items-center justify-center h-full text-gray-500">
            This file type is not supported for preview
          </div>
        )}
      </div>
    </div>
  );
};