import React, { useState } from 'react';
import { Folder, FileText, List, ChevronDown, ChevronRight, Search, ChevronLeftIcon, ChevronRightIcon, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FilePreview } from '@/utils/FilePreview';

interface Source {
  digit: string;
  path: string;
}

interface DirectoryStructurePaneProps {
  data: any;
  width: number;
  onResize: (width: number) => void;
  onSelectFolder: () => void;
  sources: Source[];
  selectedFileHandle?: FileSystemFileHandle | null;
  onFileSelect: (fileHandle: FileSystemFileHandle | null) => void;
}

export const DirectoryStructurePane: React.FC<DirectoryStructurePaneProps> = ({ 
  data, 
  width,
  onResize,
  onSelectFolder,
  sources,
  selectedFileHandle,
  onFileSelect,
}) => {
  const [selectedPath, setSelectedPath] = useState('/');
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['/']));

  const logDirectoryStructure = (node) => {
    console.log('Current Node:', node); // Log the current node
    if (node.children) {
      node.children.forEach(child => logDirectoryStructure(child)); // Recursively log children
    }
  };

  // Call this function to log the entire structure
  React.useEffect(() => {
    logDirectoryStructure(data);
  }, [data]);

  const TreeNode = ({ node, isFiltered = false }) => {
    const isExpanded = expandedNodes.has(node.path);
    const shouldShow = !isFiltered || 
      node.path === selectedPath || 
      node.path.startsWith(selectedPath + '/');

    if (!shouldShow) return null;

    console.log('Node path:', node.path);
    
    const pathSegments = node.path.split('/').filter(segment => segment.length > 0);
    const depth = pathSegments.length;
    console.log('Path segments:', pathSegments, 'Depth:', depth);
    
    const indentation = depth * 24;

    const toggleExpand = () => {
      const newExpanded = new Set(expandedNodes);
      if (isExpanded) {
        newExpanded.delete(node.path);
      } else {
        newExpanded.add(node.path);
      }
      setExpandedNodes(newExpanded);
    };

    const getIcon = () => {
      switch (node.type) {
        case 'excel':
          return <FileText className="text-green-500" size={16} />;
        case 'folder':
          return <Folder className="text-blue-500" size={16} />;
        case 'list':
          return <List className="text-indigo-500" size={16} />;
        default:
          return <Folder className="text-gray-500" size={16} />;
      }
    };

    const isSource = sources.find(source => source.path === node.path);

    const handleNodeClick = async (node) => {
      setSelectedPath(node.path);
      
      // Only attempt to get file handle if it's a file (not a folder)
      if (node.type !== 'folder' && node.type !== 'root') {
        try {
          // The handle is already stored in the node
          onFileSelect(node.handle as FileSystemFileHandle);
        } catch (error) {
          console.error('Error accessing file handle:', error);
          onFileSelect(null);
        }
      } else {
        onFileSelect(null);
      }
    };

    const getSourceDigit = (nodePath: string) => {
      // Find any source that matches this path or has this path as a parent
      const matchingSource = sources.find(source => 
        source.path === nodePath || source.path.startsWith(nodePath + '/')
      );

      if (!matchingSource) return null;

      // Check if this node has any expanded children that are also in the source path
      const hasExpandedMatchingChild = node.children?.some(child => 
        expandedNodes.has(child.path) && // Check if child is expanded
        (child.path === matchingSource.path || matchingSource.path.startsWith(child.path + '/'))
      );

      // Show digit only if there are no expanded children that match the source path
      return hasExpandedMatchingChild ? null : matchingSource.digit;
    };

    return (
      <div>
        <div
          className={`flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer ${
            selectedPath === node.path ? 'bg-gray-100' : ''
          }`}
          onClick={() => handleNodeClick(node)}
          style={{ paddingLeft: `${indentation}px` }}
        >
          {node.children?.length > 0 && (
            <button onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}>
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          )}
          {getIcon()}
          <span className="text-sm">{node.name}</span>
          {getSourceDigit(node.path) && (
            <span className="text-red-500">[{getSourceDigit(node.path)}]</span>
          )}
        </div>
        
        {isExpanded && node.children?.map((child, index) => (
          <TreeNode key={child.path} node={child} isFiltered={isFiltered} />
        ))}
      </div>
    );
  }

  return (
    <div className={`relative border-r p-4 bg-white transition-all duration-300 ${
      isExpanded ? `w-[${width}px]` : 'w-[50px]'
    }`}
    style={{ width: isExpanded ? width : 50 }}>
      <div className="flex items-center justify-between mb-4">
        {isExpanded && (
          <>
            <h2 className="text-xl font-bold">
              {selectedPath === '/' ? 'Directory Structure' : 'File Preview'}
            </h2>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Search size={16} />
                  Restrict Search
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select Directory</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                  <Button onClick={() => { 
                    onSelectFolder(); 
                    setIsOpen(false); // Close the dialog after selecting a folder
                    setSelectedPath('/')
                  }} className="w-full">
                    Choose Local Folder
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0"
        >
          {isExpanded ? <ChevronLeftIcon size={16} /> : <ChevronRightIcon size={16} />}
        </Button>
      </div>

      {isExpanded && (
        <>
          {selectedPath === '/' ? (
            // Show directory structure when at root
            <>
              {/* Legend for file types */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="text-green-500" size={16} />
                  <span className="text-sm">Excel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Folder className="text-blue-500" size={16} />
                  <span className="text-sm">Folder</span>
                </div>
                <div className="flex items-center gap-2">
                  <List className="text-indigo-500" size={16} />
                  <span className="text-sm">List</span>
                </div>
              </div>

              {/* Directory tree */}
              <ScrollArea className="h-[calc(100vh-180px)] w-full rounded-md border">
                <TreeNode node={data} isFiltered={false} />
              </ScrollArea>
            </>
          ) : (
            // Show file preview when a file is selected
            <>
              <div className="mb-4 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedPath('/');
                    onFileSelect(null);
                  }}
                  className="shrink-0"
                  title="Back to directory"
                >
                  <ArrowLeft size={16} />
                </Button>
                <div className="text-sm text-gray-600">
                  Current path: {selectedPath}
                </div>
              </div>

              <div className="h-[calc(100vh-180px)]">
                <FilePreview fileHandle={selectedFileHandle} />
              </div>
            </>
          )}
        </>
      )}

      {isExpanded && (
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-gray-300 active:bg-gray-400"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.pageX;
            const startWidth = width;

            const onMouseMove = (e: MouseEvent) => {
              const delta = e.pageX - startX;
              const newWidth = Math.max(200, startWidth + delta); // Min width of 200px
              onResize(newWidth);
            };

            const onMouseUp = () => {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }}
        />
      )}
    </div>
  );
};