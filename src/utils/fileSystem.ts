import { join } from 'path';

interface DirectoryNode {
  name: string;
  type: 'root' | 'folder' | 'excel' | 'list';
  path: string;
  children?: DirectoryNode[];
}

// Utility function to join paths
const joinPaths = (base: string, name: string) => {
  return `${base}${base.endsWith('/') ? '' : '/'}${name}`;
};

export async function generateDirectoryStructure(handle: FileSystemDirectoryHandle, parentPath: string = '/'): Promise<DirectoryNode> {
  try {
    // Create the root node
    const node: DirectoryNode = {
      name: handle.name,
      type: parentPath === '/' ? 'root' : 'folder',
      path: joinPaths(parentPath, handle.name), // Use the utility function
      children: []
    };

    // Iterate over the entries in the directory
    for await (const entry of handle.values()) {
      if (entry.kind === 'directory') {
        // For directories, recursively call the function
        const childHandle = await handle.getDirectoryHandle(entry.name);
        const childNode = await generateDirectoryStructure(childHandle, node.path);
        node.children?.push(childNode);
      } else if (entry.kind === 'file') {
        // For files, determine the type and create a node
        const fileType = entry.name.toLowerCase().endsWith('.xlsx') ? 'excel' : 'list';
        node.children?.push({
          name: entry.name,
          type: fileType,
          path: joinPaths(node.path, entry.name), // Use the utility function
        });
      }
    }

    return node;
  } catch (error) {
    console.error('Error generating directory structure:', error);
    return null;
  }
}