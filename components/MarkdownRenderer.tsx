import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copied, setCopied] = React.useState<string | null>(null);

  const handleCopy = (text: string, codeBlockId: string) => {
    navigator.clipboard.writeText(text);
    setCopied(codeBlockId);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="prose prose-invert prose-slate max-w-none leading-relaxed text-slate-300 font-[400]">
      <ReactMarkdown
        components={{
          // Style code blocks specifically to match the "Copy & Paste" requirement
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeContent = String(children).replace(/\n$/, '');
            const isMultiLine = !inline && match;
            const blockId = Math.random().toString(36).substr(2, 9);

            return isMultiLine ? (
              <div className="relative group my-4 rounded-lg overflow-hidden border border-slate-700 bg-[#0b1120]">
                <div className="flex justify-between items-center px-4 py-2 bg-slate-800/50 border-b border-slate-700 text-xs text-slate-400 font-mono">
                  <span>{match ? match[1].toUpperCase() : 'TEXT'}</span>
                  <button
                    onClick={() => handleCopy(codeContent, blockId)}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    {copied === blockId ? (
                      <>
                        <Check size={14} className="text-green-400" />
                        <span className="text-green-400">완료</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>복사</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-sm font-mono text-blue-100">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            ) : (
              <code className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-sm" {...props}>
                {children}
              </code>
            );
          },
          // Style headers
          h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-white mt-8 mb-4 border-b border-slate-700 pb-2" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-2xl font-semibold text-blue-400 mt-8 mb-4" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-blue-200 mt-6 mb-3" {...props} />,
          h4: ({node, ...props}) => <h4 className="text-lg font-medium text-indigo-300 mt-4 mb-2" {...props} />,
          // Style lists
          ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 my-4 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-6 my-4 space-y-1" {...props} />,
          // Style emphasis
          strong: ({node, ...props}) => <strong className="text-white font-bold" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-4 bg-slate-800/30 italic text-slate-400 rounded-r" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;