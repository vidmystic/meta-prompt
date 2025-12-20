
import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, HelpCircle, Upload, ArrowRight, FileText, X, Key, Settings, AlertTriangle } from 'lucide-react';
import { Message, Role } from './types';
import ChatInterface from './components/ChatInterface';
import HelpModal from './components/HelpModal';
import ApiKeyModal from './components/ApiKeyModal';
import { sendMessageToGemini, resetSession, getApiKey } from './services/gemini';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [attachment, setAttachment] = useState<{name: string, content: string} | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for API Key in localStorage on mount
  useEffect(() => {
    const key = getApiKey();
    if (!key) {
      setIsApiModalOpen(true);
    }
  }, []);

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    // Double check key before sending
    if (!getApiKey()) {
      setIsApiModalOpen(true);
      return;
    }

    if (!hasStarted) {
      setHasStarted(true);
    }

    let displayContent = textToSend;
    let actualPrompt = textToSend;

    if (attachment) {
      displayContent = `${textToSend}\n\n📎 [파일 첨부: ${attachment.name}]`;
      actualPrompt = `${textToSend}\n\n---\n[시스템 지침: 지식 파일 분석 요청]\n사용자가 참고용 파일을 첨부했습니다. 아래 파일의 내용과 의도를 심층 분석하여 프롬프트 설계 시 핵심 맥락으로 반영하십시오.\n\n파일명: ${attachment.name}\n파일 내용:\n${attachment.content}\n---`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: displayContent,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(actualPrompt);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        content: responseText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Failed to send message", error);
      
      let errorMsg = "**시스템 오류**: 요청을 처리할 수 없습니다.";
      
      if (error.message === "API_KEY_MISSING") {
        setIsApiModalOpen(true);
        errorMsg = "**API 키 미설정**: 서비스 이용을 위해 API 키 설정이 필요합니다. 상단의 열쇠 아이콘을 클릭해 주세요.";
      } else if (error.message === "API_KEY_INVALID") {
        setIsApiModalOpen(true);
        errorMsg = "**API 키 유효성 오류**: 설정된 API 키가 올바르지 않거나 결제 설정이 활성화되지 않았습니다. 상단 열쇠 아이콘을 클릭해 키를 다시 설정해 주세요.";
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        content: errorMsg,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    if (window.confirm("처음으로 돌아가시겠습니까? 현재 작업 내용이 모두 삭제됩니다.")) {
      resetSession();
      setMessages([]);
      setHasStarted(false);
      setInput('');
      setAttachment(null);
      setIsLoading(false);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("파일 크기가 너무 큽니다. 2MB 이하의 텍스트 파일을 올려주세요.");
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAttachment({
        name: file.name,
        content: content
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const clearAttachment = () => {
    setAttachment(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-slate-200 overflow-hidden selection:bg-blue-500/30 font-[family-name:var(--font-noto-sans-kr)]">
      
      {/* Header Container */}
      <div className={`${!hasStarted ? 'absolute top-6 right-6 z-50 flex gap-2' : ''}`}>
        {!hasStarted && (
          <>
            <button 
              onClick={() => setIsApiModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors text-slate-300 text-sm"
            >
              <Key size={18} className="text-blue-400" />
              <span>API 설정</span>
            </button>
            <button 
              onClick={() => setIsHelpOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors text-slate-300 text-sm"
            >
              <HelpCircle size={18} />
              <span>도움말</span>
            </button>
          </>
        )}
      </div>

      {hasStarted && (
        <header className="h-16 border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur z-10 flex items-center justify-between px-6 shadow-lg flex-shrink-0">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleReset}>
            <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
              <Zap className="text-blue-400" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white">
                생존니킥의 <span className="text-blue-500">메타프롬프트</span>
              </h1>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Master Prompt Architect</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsApiModalOpen(true)}
              className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-blue-400 transition-colors"
              title="API 설정"
            >
              <Key size={20} />
            </button>
            <button 
              onClick={() => setIsHelpOpen(true)}
              className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-blue-400 transition-colors"
              title="사용 가이드"
            >
              <HelpCircle size={20} />
            </button>
          </div>
        </header>
      )}

      {/* Hidden File Input */}
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".txt,.md,.csv,.json,.js,.jsx,.ts,.tsx,.py,.html,.css,.xml,.yaml,.yml"
        onChange={handleFileChange}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative w-full overflow-hidden">
        {!hasStarted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-12 space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 pb-2">
                생존니킥의 메타프롬프트
              </h1>
              <p className="text-lg text-slate-400 font-light tracking-wide">
                AI의 잠재력을 100% 끌어내는 최고의 프롬프트를 설계해 보세요.
              </p>
            </div>

            <div className="w-full max-w-3xl bg-[#1e293b]/50 border border-slate-700/50 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
              <label className="block text-lg font-semibold text-slate-200 mb-4 ml-1">
                어떤 목표를 이루고 싶으신가요?
              </label>
              
              <div className="relative bg-[#0f172a] rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/50 p-4">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="예: 구글 SEO에 최적화된 블로그 글을 쓰고 싶어"
                  className="w-full bg-transparent text-slate-200 placeholder-slate-600 text-lg resize-none focus:outline-none leading-relaxed min-h-[120px]"
                  rows={3}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                {attachment ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900/30 text-blue-200 border border-blue-500/50 text-sm font-medium w-full sm:w-auto justify-between sm:justify-start group animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={18} className="shrink-0 text-blue-400" />
                      <span className="truncate max-w-[200px]">{attachment.name}</span>
                    </div>
                    <button 
                      onClick={clearAttachment} 
                      className="p-1 ml-2 hover:bg-blue-800 rounded-full text-blue-300 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleFileUpload}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-all border border-slate-700 text-sm font-medium w-full sm:w-auto justify-center"
                  >
                    <Upload size={18} />
                    <span>지식 파일 첨부 (선택사항)</span>
                  </button>
                )}

                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim() || isLoading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-200 w-full sm:w-auto justify-center ${
                      input.trim() && !isLoading
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-900/20 translate-y-0'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>프롬프트 생성하기</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ChatInterface messages={messages} isLoading={isLoading} />
        )}
      </main>

      {hasStarted && (
        <footer className="p-4 sm:p-6 bg-[#0f172a] border-t border-slate-800 flex-shrink-0">
          <div className="max-w-5xl mx-auto relative">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
              <div className="relative flex items-end gap-2 bg-[#1e293b] rounded-xl p-2 border border-slate-700 shadow-2xl">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="추가 요청사항이 있다면 말씀해 주세요..."
                  className="w-full bg-transparent text-slate-200 placeholder-slate-500 resize-none focus:outline-none p-3 min-h-[60px] max-h-[200px] overflow-y-auto font-medium leading-relaxed"
                  rows={1}
                  style={{ height: 'auto', minHeight: '60px' }} 
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  className={`p-3 mb-1 rounded-lg transition-all duration-200 ${
                    input.trim() && !isLoading
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <ApiKeyModal isOpen={isApiModalOpen} onClose={() => setIsApiModalOpen(false)} />
    </div>
  );
};

export default App;
