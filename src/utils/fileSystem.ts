interface DirectoryNode {
  name: string;
  type: 'root' | 'folder' | 'excel' | 'list';
  path: string;
  children?: DirectoryNode[];
  handle?: FileSystemHandle;
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
      path: joinPaths(parentPath, handle.name),
      children: [],
      handle: handle
    };

    // Iterate over the entries in the directory
    for await (const entry of handle.values()) {
      if (entry.kind === 'directory') {
        // For directories, recursively call the function
        const childHandle = await handle.getDirectoryHandle(entry.name);
        const childNode = await generateDirectoryStructure(childHandle, node.path);
        node.children?.push(childNode);
      } else if (entry.kind === 'file') {
        // For files, get the file handle and store it
        const fileHandle = await handle.getFileHandle(entry.name);
        const fileType = entry.name.toLowerCase().endsWith('.xlsx') ? 'excel' : 'list';
        node.children?.push({
          name: entry.name,
          type: fileType,
          path: joinPaths(node.path, entry.name),
          handle: fileHandle
        });
      }
    }

    return node;
  } catch (error) {
    console.error('Error generating directory structure:', error);
    return null;
  }
}