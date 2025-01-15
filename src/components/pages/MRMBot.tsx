import { useState } from 'react';
import { DirectoryStructurePane } from '@/components/pages/DirectoryStructurePane';
import { generateDirectoryStructure } from '@/utils/fileSystem';
import type { DirectoryNode } from '@/utils/fileSystem';
import sampleData from '@/utils/sampleDirectory.json';
import { ChatBot } from '@/components/pages/ChatBot';

const data: DirectoryNode = sampleData;

const MRMBot = () => {

    const [paneWidth, setPaneWidth] = useState(440);
    const [directoryData, setDirectoryData] = useState(data);
    const [selectedPath, setSelectedPath] = useState('');
    const [sources, setSources] = useState<{ digit: string; path: string }[]>([]);
    const [selectedFileHandle, setSelectedFileHandle] = useState<FileSystemFileHandle | null>(null);

    const handleFolderSelect = async () => {
      try {
        // Open folder picker dialog
        const handle = await window.showDirectoryPicker();
        
        // Generate directory structure using the handle
        const structure = await generateDirectoryStructure(handle, '/');
        
        // Log detailed information about the directory structure
        console.log('Directory Structure:', structure);
        structure.children.forEach(child => {
          console.log(`Child Name: ${child.name}, Type: ${child.type}, Path: ${child.path}`);
        });
        
        setDirectoryData(structure);
        
        // Set the selected path to the root of the new structure
        setSelectedPath(structure.path);
      } catch (error) {
        console.error('Error selecting folder:', error);
        // Keep existing data on error
        // This prevents white screen if folder selection fails
      }
    };

    const handleMessageSelect = (content: string) => {
        const sourcePaths = content.match(/!\[Source-(\d)\]\(([^)]+)\)/g) || [];
        const extractedSources = sourcePaths.map(path => {
            const match = path.match(/!\[Source-(\d)\]\(([^)]+)\)/);
            return match ? { digit: match[1], path: match[2] } : null;
        }).filter(Boolean); // Filter out any null values
        setSources(extractedSources);
    };

  return (
    <div className="flex h-screen w-screen">
        <DirectoryStructurePane 
          data={directoryData} 
          width={paneWidth}
          onResize={setPaneWidth}
          onSelectFolder={handleFolderSelect}
          sources={sources}
          selectedFileHandle={selectedFileHandle}
          onFileSelect={setSelectedFileHandle}
        />
      {/* Right panel ChatBot - we are passing a function as a prop to the chatbot. Done because we want to update a state in the parent component owing to a condition in the child component.*/}
      <ChatBot 
        onMessageSelect={handleMessageSelect} 
        directoryStructure={directoryData}
      /> 
    </div>
  );
};

export default MRMBot;