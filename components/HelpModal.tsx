import React from 'react';
import { X, Zap, MessageCircle, Terminal, Copy, CheckCircle2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#0f172a] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#1e293b]">
          <div className="flex items-center gap-2">
            <Zap className="text-blue-400" size={20} />
            <h2 className="text-lg font-bold text-white">생존니킥의 메타프롬프트 사용 가이드</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-8 text-slate-300 custom-scrollbar">
          
          {/* Section 1: Intro */}
          <section>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-bold">WHAT</span>
              생존니킥의 메타프롬프트란?
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              생존니킥의 메타프롬프트는 단순히 질문에 답하는 AI가 아닙니다. 
              <strong className="text-blue-300"> 다른 AI(ChatGPT, Claude 등)가 최고의 성능을 낼 수 있도록, 완벽한 '지시어(Prompt)'를 대신 짜주는 설계자</strong>입니다.
            </p>
          </section>

          {/* Section 2: Workflow */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2 text-green-400">
                <Terminal size={18} />
                <span className="font-bold text-sm">모드 A: 즉시 실행</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">요청이 구체적일 때, 추가 질문 없이 즉시 프롬프트를 생성합니다.</p>
              <div className="bg-slate-900 p-2 rounded text-xs font-mono text-slate-300 border-l-2 border-green-500">
                "영어 비즈니스 이메일 번역 프롬프트 짜줘"
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2 mb-2 text-purple-400">
                <MessageCircle size={18} />
                <span className="font-bold text-sm">모드 B: 심층 인터뷰</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">목표가 모호할 때, 메타프롬프트가 역으로 질문을 던져 내용을 구체화합니다.</p>
              <div className="bg-slate-900 p-2 rounded text-xs font-mono text-slate-300 border-l-2 border-purple-500">
                "유튜브 채널을 시작하고 싶은데 도와줘"
              </div>
            </div>
          </section>

          {/* Section 3: Examples */}
          <section>
            <h3 className="text-base font-semibold text-white mb-3">💡 실전 입력 예시</h3>
            <div className="space-y-3">
              <div className="group flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors cursor-default">
                <CheckCircle2 size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-sm font-medium text-white">보고서 작성용 프롬프트</span>
                  <span className="text-xs text-slate-500">"신사업 기획안의 서론과 시장 분석 파트를 작성해주는 프롬프트가 필요해."</span>
                </div>
              </div>
              <div className="group flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors cursor-default">
                <CheckCircle2 size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-sm font-medium text-white">역할 부여 (페르소나)</span>
                  <span className="text-xs text-slate-500">"나를 20년 차 심리 상담가처럼 위로해주는 AI 챗봇을 만들고 싶어. 프롬프트 짜줘."</span>
                </div>
              </div>
              <div className="group flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors cursor-default">
                <CheckCircle2 size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-sm font-medium text-white">코딩/개발 보조</span>
                  <span className="text-xs text-slate-500">"리액트로 투두 리스트를 만드는 전체 코드를 짜주는 프롬프트 설계해 줘."</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: How to use output */}
          <section className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/20">
             <h3 className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
               <Copy size={16} />
               사용 방법
             </h3>
             <p className="text-xs text-blue-200/80 leading-relaxed">
               메타프롬프트가 답변 마지막에 제공하는 <strong>[복사해서 바로 쓰세요]</strong> 박스 안의 내용을 복사하여, 
               ChatGPT나 Claude 같은 AI에게 붙여넣으세요. 일반적인 질문보다 훨씬 뛰어난 답변을 얻을 수 있습니다.
             </p>
          </section>

        </div>
        
        <div className="p-4 border-t border-slate-800 bg-[#1e293b] flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;