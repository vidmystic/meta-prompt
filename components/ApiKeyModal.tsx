import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, AlertCircle, ExternalLink, RefreshCw, CheckCircle2 } from 'lucide-react';
import { testApiConnection, resetSession } from '../services/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Fixed: Removed the local 'declare global' block for window.aistudio.
// The environment already defines aistudio: AIStudio on the Window interface.
// Redefining it locally with a literal type caused modifier and type mismatch errors.

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isOpen) {
      checkKeyStatus();
    }
  }, [isOpen]);

  const checkKeyStatus = async () => {
    setIsChecking(true);
    try {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    } catch (e) {
      console.error("Failed to check key status", e);
    } finally {
      setIsChecking(false);
    }
  };

  const handleOpenSelect = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Per instructions, assume success and proceed
      setHasKey(true);
      resetSession(); // Clear session to use new key
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
            <h2 className="text-lg font-bold text-white">API 키 설정</h2>
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
            <label className="text-sm font-medium text-slate-400">연결 상태</label>
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              hasKey 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {hasKey ? <ShieldCheck size={24} /> : <AlertCircle size={24} />}
              <div className="flex-1">
                <p className="font-bold">{hasKey ? '연결됨' : '연결되지 않음'}</p>
                <p className="text-xs opacity-80">
                  {hasKey ? '유효한 API 키가 선택되었습니다.' : '서비스를 이용하려면 API 키를 선택해야 합니다.'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              이 앱은 고성능 추론을 위해 <span className="text-blue-400 font-mono">Gemini 3 Pro</span> 모델을 사용합니다. 
              결제가 활성화된 Google Cloud 프로젝트의 API 키가 필요합니다.
            </p>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:underline"
            >
              <ExternalLink size={14} />
              결제 및 관리 가이드 확인하기
            </a>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleOpenSelect}
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20"
            >
              <Key size={18} />
              <span>API 키 선택/변경</span>
            </button>
            
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
              연결에 실패했습니다. 유료 프로젝트의 키인지 확인해 주세요.
            </p>
          )}
          {testStatus === 'success' && (
            <p className="text-xs text-green-400 text-center flex items-center justify-center gap-1">
              <CheckCircle2 size={14} />
              연결 성공! 모든 기능을 사용할 수 있습니다.
            </p>
          )}
        </div>

        <div className="p-4 bg-slate-800/30 border-t border-slate-800 flex justify-center">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Secure Local Management via AI Studio</p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;