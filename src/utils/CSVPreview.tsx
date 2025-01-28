import { useState, useEffect } from 'react';
import Papa from 'papaparse'; // You'll need to install this package

interface CSVPreviewProps {
  fileHandle: FileSystemFileHandle;
}

export const CSVPreview: React.FC<CSVPreviewProps> = ({ fileHandle }) => {
  const [data, setData] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCSV = async () => {
      try {
        const file = await fileHandle.getFile();
        const text = await file.text();
        
        Papa.parse(text, {
          complete: (results) => {
            setData(results.data as string[][]);
            setLoading(false);
          },
          error: (error: Error) => {
            console.error('Error reading CSV:', error);
            setError(error.message);
            setLoading(false);
          }
        });
      } catch (err) {
        setError('Error reading file');
        setLoading(false);
      }
    };

    loadCSV();
  }, [fileHandle]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-200">
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td 
                  key={cellIndex} 
                  className="border border-gray-200 px-4 py-2"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};