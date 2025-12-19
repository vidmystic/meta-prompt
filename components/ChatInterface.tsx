import React, { useRef, useEffect } from 'react';
import { Message, Role } from '../types';
import MarkdownRenderer from './MarkdownRenderer';
import { Bot, User, Sparkles, Cpu } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    // Outer container handles the scrolling for the entire main area
    <div className="flex-1 overflow-y-auto relative scroll-smooth w-full">
      {/* Inner container handles the centering and width constraint */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 min-h-full">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${
              msg.role === Role.USER ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex gap-4 max-w-4xl ${
                msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                msg.role === Role.USER
                  ? 'bg-slate-700 text-slate-200'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white border border-blue-400/30'
              }`}>
                {msg.role === Role.USER ? <User size={20} /> : <Cpu size={20} />}
              </div>

              {/* Message Bubble */}
              <div
                className={`flex flex-col min-w-0 rounded-2xl px-6 py-4 shadow-md ${
                  msg.role === Role.USER
                    ? 'bg-slate-800 text-slate-100 border border-slate-700'
                    : 'bg-slate-900/80 border border-slate-800 backdrop-blur-sm w-full'
                }`}
              >
                {/* Name Label */}
                <span className={`text-xs font-bold mb-2 block opacity-50 ${
                   msg.role === Role.USER ? 'text-right' : 'text-left text-blue-400'
                }`}>
                  {msg.role === Role.USER ? '나' : '생존니킥의 메타프롬프트'}
                </span>

                <MarkdownRenderer content={msg.content} />
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start w-full">
            <div className="flex gap-4 max-w-3xl">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg animate-pulse">
                 <Sparkles size={20} />
              </div>
              <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-3 rounded-2xl border border-slate-800">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                </div>
                <span className="text-sm text-blue-400 font-mono">최적화 로직 설계 중...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-1" />
      </div>
    </div>
  );
};

export default ChatInterface;