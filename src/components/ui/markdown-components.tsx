import { Components } from 'react-markdown';

export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold mb-4">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-semibold mb-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-medium mb-2">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-lg font-medium mb-2">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-gray-600 mb-2">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc ml-4 mb-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal ml-4 mb-2">{children}</ol>
  ),
  code: ({ children }) => (
    <code className="bg-gray-100 px-1 rounded">{children}</code>
  ),
  img: () => null,
}; 