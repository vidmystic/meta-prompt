
import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, AlertCircle, ExternalLink, RefreshCw, CheckCircle2, Monitor } from 'lucide-react';
import { testApiConnection, resetSession } from '../services/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [isAiStudio, setIsAiStudio] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      checkEnvironment();
    }
  }, [isOpen]);

  const checkEnvironment = async () => {
    // Check if running in AI Studio environment
    const aiStudioAvailable = typeof window.aistudio !== 'undefined';
    setIsAiStudio(aiStudioAvailable);

    if (aiStudioAvailable) {
      try {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } catch (e) {
        console.error("Failed to check key status", e);
      }
    } else {
      // For Local/Vercel, check if process.env.API_KEY is defined
      const envKey = process.env.API_KEY;
      setHasKey(!!envKey);
    }
  };

  const handleOpenSelect = async () => {
    if (typeof window.aistudio === 'undefined') return;

    try {
      await window.aistudio.openSelectKey();
      setHasKey(true);
      resetSession();
      handleTestConnection();
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    const success = await testApiConnection();
    setTestStatus(success ? 'success' : 'error');
    if (success) {
      setHasKey(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Key className="text-blue-400" size={20} />
            <h2 className="text-lg font-bold text-white">API 연결 설정</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">환경 감지 및 상태</label>
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              hasKey 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {hasKey ? <ShieldCheck size={24} /> : <AlertCircle size={24} />}
              <div className="flex-1">
                <p className="font-bold">{hasKey ? '연결 준비 완료' : '연결 필요'}</p>
                <p className="text-xs opacity-80">
                  {isAiStudio ? 'AI Studio 보안 브릿지 활성화' : '외부 서버/로컬 환경 감지됨'}
                </p>
              </div>
            </div>
          </div>

          {!isAiStudio && !hasKey && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2 text-amber-200">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Monitor size={16} />
                <span>배포 환경 가이드</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                로컬 또는 Vercel 환경에서는 <strong>API_KEY</strong> 환경 변수를 직접 설정해야 합니다. 
                Vercel Dashboard의 프로젝트 설정에서 Environment Variables에 키를 추가해 주세요.
              </p>
            </div>
          )}

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              최상의 성능을 위해 <span className="text-blue-400 font-mono">Gemini 3 Pro</span> 모델을 사용합니다. 
              유료 프로젝트의 API 키가 필수적입니다.
            </p>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:underline"
            >
              <ExternalLink size={14} />
              Google AI 결제 가이드
            </a>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {isAiStudio ? (
              <button
                onClick={handleOpenSelect}
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20"
              >
                <Key size={18} />
                <span>API 키 선택/변경</span>
              </button>
            ) : null}
            
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-all disabled:opacity-50"
            >
              {testStatus === 'testing' ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : testStatus === 'success' ? (
                <CheckCircle2 size={18} className="text-green-400" />
              ) : (
                <RefreshCw size={18} />
              )}
              <span>연결 테스트 수행</span>
            </button>
          </div>

          {testStatus === 'error' && (
            <p className="text-xs text-red-400 text-center flex items-center justify-center gap-1 animate-pulse">
              <AlertCircle size={14} />
              연결 실패. 환경 변수나 키 유효성을 확인해 주세요.
            </p>
          )}
          {testStatus === 'success' && (
            <p className="text-xs text-green-400 text-center flex items-center justify-center gap-1">
              <CheckCircle2 size={14} />
              정상 연결됨. 서비스를 이용할 수 있습니다.
            </p>
          )}
        </div>

        <div className="p-4 bg-slate-800/30 border-t border-slate-800 flex justify-center">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
            {isAiStudio ? 'AI Studio Secure Management' : 'Environment Variable Mode'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
