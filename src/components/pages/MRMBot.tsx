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

  return (
    <div className="flex h-screen w-screen">
    {true ? (
        <DirectoryStructurePane 
          data={directoryData} 
          width={paneWidth}
          onResize={setPaneWidth}
          onSelectFolder={handleFolderSelect}
        />
      ) : (
        <div className="flex items-center justify-center w-full">
          <button
            onClick={handleFolderSelect}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Select Folder
          </button>
        </div>
      )}

    {/* Right panel ChatBot */}
      <ChatBot />
    </div>
  );
};

export default MRMBot;