import { join, extname } from 'path';

interface DirectoryNode {
  name: string;
  type: 'root' | 'folder' | 'excel' | 'list';
  path: string;
  children?: DirectoryNode[];
}

export async function generateDirectoryStructure(handle: FileSystemDirectoryHandle): Promise<DirectoryNode> {
  try {
    const node: DirectoryNode = {
      name: handle.name,
      type: 'root',
      path: '/',
      children: []
    };

    for await (const entry of handle.values()) {
      if (entry.kind === 'directory') {
        const childHandle = await handle.getDirectoryHandle(entry.name);
        const childNode = await generateDirectoryStructure(childHandle);
        childNode.path = `${node.path}${node.path.endsWith('/') ? '' : '/'}${entry.name}`;
        childNode.type = 'folder';
        node.children?.push(childNode);
      } else if (entry.kind === 'file') {
        const fileType = entry.name.toLowerCase().endsWith('.xlsx') ? 'excel' : 'list';
        node.children?.push({
          name: entry.name,
          type: fileType,
          path: `${node.path}${node.path.endsWith('/') ? '' : '/'}${entry.name}`
        });
      }
    }

    return node;
  } catch (error) {
    console.error('Error generating directory structure:', error);
    // Return a basic structure if there's an error
    return {
      name: handle.name,
      type: 'root',
      path: '/',
      children: []
    };
  }
} 