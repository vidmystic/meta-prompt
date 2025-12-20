
import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, AlertCircle, ExternalLink, RefreshCw, CheckCircle2, Save, Eye, EyeOff } from 'lucide-react';
import { testApiConnection, setApiKey, getApiKey } from '../services/gemini';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const savedKey = getApiKey();
      if (savedKey) setInputValue(savedKey);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!inputValue.trim()) {
      setErrorMessage('API 키를 입력해 주세요.');
      return;
    }

    setTestStatus('testing');
    setErrorMessage('');

    const isValid = await testApiConnection(inputValue.trim());
    
    if (isValid) {
      setApiKey(inputValue.trim());
      setTestStatus('success');
      setTimeout(() => {
        onClose();
        setTestStatus('idle');
      }, 1000);
    } else {
      setTestStatus('error');
      setErrorMessage('유효하지 않은 API 키입니다. 키와 결제 설정을 확인해 주세요.');
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
            <h2 className="text-lg font-bold text-white">Gemini API 키 설정</h2>
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
          <div className="space-y-4">
            <p className="text-sm text-slate-400 leading-relaxed">
              본인의 <span className="text-blue-400 font-bold">Google Gemini API Key</span>를 입력해 주세요. 
              키는 브라우저 로컬 저장소에만 안전하게 보관됩니다.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">API KEY</label>
              <div className="relative group">
                <input
                  type={showKey ? "text" : "password"}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 pr-12 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3">
            <div className="flex items-start gap-3 text-xs text-slate-400">
              <ShieldCheck className="text-green-500 shrink-0 mt-0.5" size={16} />
              <p>무료 키(Free tier)도 사용 가능하지만, 안정적인 성능을 위해 유료 프로젝트 키를 권장합니다.</p>
            </div>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:underline font-medium"
            >
              <ExternalLink size={14} />
              Google AI Studio에서 키 발급받기
            </a>
          </div>

          <button
            onClick={handleSave}
            disabled={testStatus === 'testing' || !inputValue.trim()}
            className={`flex items-center justify-center gap-2 w-full py-3 font-bold rounded-xl transition-all shadow-lg ${
              testStatus === 'success' 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {testStatus === 'testing' ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : testStatus === 'success' ? (
              <CheckCircle2 size={18} />
            ) : (
              <Save size={18} />
            )}
            <span>{testStatus === 'testing' ? '연결 확인 중...' : testStatus === 'success' ? '저장 완료!' : '키 저장 및 연결 테스트'}</span>
          </button>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs animate-in slide-in-from-top-1">
              <AlertCircle size={14} className="shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-800/30 border-t border-slate-800 flex justify-center">
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={10} />
            Client-Side Secure Storage
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
