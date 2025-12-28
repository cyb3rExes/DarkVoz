
import React, { useState, useCallback, useMemo } from 'react';
import { Language, AppState, ScriptResult, VoiceOption } from './types';
import { VOICES, LANGUAGES } from './constants';
import { GeminiService } from './services/geminiService';
import { 
  Trophy, 
  Settings, 
  Mic2, 
  Type, 
  Play, 
  Download, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle,
  FileText,
  Search,
  MessageSquare,
  Volume2,
  Zap
} from 'lucide-react';

const gemini = new GeminiService();

export default function App() {
  const [state, setState] = useState<AppState>({
    language: Language.PORTUGUESE,
    selectedVoice: VOICES[0].geminiVoice,
    newsText: '',
    isProcessing: false,
    result: null,
    error: null,
  });

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleVoicePreview = async (voice: VoiceOption) => {
    try {
      setPreviewingVoice(voice.id);
      const blob = await gemini.previewVoice(voice.geminiVoice, state.language);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => setPreviewingVoice(null);
      await audio.play();
    } catch (err) {
      console.error(err);
      setPreviewingVoice(null);
    }
  };

  const handleGenerateContent = async () => {
    if (!state.newsText.trim()) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    try {
      const result = await gemini.generateScriptAndMetadata(state.newsText, state.language);
      setState(prev => ({ ...prev, result, isProcessing: false }));
    } catch (err) {
      setState(prev => ({ ...prev, error: "Falha ao gerar o conteúdo. Tente novamente.", isProcessing: false }));
    }
  };

  const handleGenerateAudioPart = async (partIndex: number) => {
    if (!state.result) return;

    const newResult = { ...state.result };
    newResult.parts[partIndex].isGeneratingAudio = true;
    setState(prev => ({ ...prev, result: newResult }));

    try {
      const blob = await gemini.generateAudio(newResult.parts[partIndex].text, state.selectedVoice);
      newResult.parts[partIndex].audioBlob = blob;
    } catch (err) {
      console.error(err);
    } finally {
      newResult.parts[partIndex].isGeneratingAudio = false;
      setState(prev => ({ ...prev, result: { ...newResult } }));
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-8 max-w-5xl mx-auto bg-black text-slate-100">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 rotate-3">
            <Trophy className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-600 uppercase">
              DarkLeitor
            </h1>
            <p className="text-emerald-500/60 text-xs font-bold tracking-widest uppercase">Cyb3r Vozes</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase">Sistema Online</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Configuration */}
        <div className="space-y-6">
          <section className="bg-zinc-900/50 border border-emerald-900/30 rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6 text-emerald-400 font-bold uppercase tracking-wider text-sm">
              <Settings className="w-4 h-4" />
              <h2>Setup de Produção</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] uppercase text-zinc-500 font-black mb-2 block">Idioma de Saída</label>
                <select 
                  className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-emerald-50 font-medium"
                  value={state.language}
                  onChange={(e) => setState(prev => ({ ...prev, language: e.target.value as Language }))}
                >
                  {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-zinc-500 font-black mb-2 block">Voz Narradora</label>
                <div className="space-y-3">
                  {VOICES.map((voice) => (
                    <div 
                      key={voice.id}
                      onClick={() => setState(prev => ({ ...prev, selectedVoice: voice.geminiVoice }))}
                      className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
                        state.selectedVoice === voice.geminiVoice 
                          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                          : 'bg-black/40 border-zinc-800 hover:border-emerald-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${state.selectedVoice === voice.geminiVoice ? 'text-emerald-400' : 'text-zinc-300'}`}>
                            {voice.name}
                          </p>
                          <p className="text-[10px] text-zinc-500 mt-1 leading-tight">{voice.description}</p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleVoicePreview(voice); }}
                          disabled={previewingVoice !== null}
                          className={`p-2 rounded-xl transition-colors ${
                            state.selectedVoice === voice.geminiVoice ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          }`}
                        >
                          {previewingVoice === voice.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4 fill-current" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {state.error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold">{state.error}</p>
            </div>
          )}
        </div>

        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-zinc-900/50 border border-emerald-900/30 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-24 h-24 text-emerald-500" />
            </div>
            
            <div className="flex items-center gap-2 mb-6 text-emerald-400 font-bold uppercase tracking-wider text-sm relative">
              <MessageSquare className="w-4 h-4" />
              <h2>Input de Notícia</h2>
            </div>
            <textarea
              className="w-full h-56 bg-black border border-zinc-800 rounded-2xl p-6 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none placeholder:text-zinc-700 text-emerald-50 font-medium leading-relaxed"
              placeholder="Cole aqui a notícia bruta que você quer transformar em um roteiro viral..."
              value={state.newsText}
              onChange={(e) => setState(prev => ({ ...prev, newsText: e.target.value }))}
            />
            <button
              onClick={handleGenerateContent}
              disabled={state.isProcessing || !state.newsText.trim()}
              className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-green-600 text-black font-black uppercase tracking-tighter py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 shadow-xl shadow-emerald-500/20"
            >
              {state.isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sincronizando Inteligência...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Gerar Máquina de Views
                </>
              )}
            </button>
          </section>

          {state.result && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Metadata Section */}
              <section className="bg-zinc-900/50 border border-emerald-900/30 rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-emerald-500/10 px-8 py-4 border-b border-emerald-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest text-xs">
                    <Search className="w-4 h-4" />
                    <h2>Estratégia SEO & Viralização</h2>
                  </div>
                </div>
                
                <div className="p-8 space-y-8">
                  {/* Titles */}
                  <div>
                    <h3 className="text-[10px] uppercase text-emerald-500/50 font-black mb-4 tracking-widest">Títulos de Alto CTR</h3>
                    <div className="space-y-2">
                      {state.result.titles.map((title, i) => (
                        <div key={i} className="flex items-center gap-3 bg-black/60 p-4 rounded-xl text-sm border border-zinc-800 hover:border-emerald-500/30 transition-colors group">
                          <span className="text-emerald-500 font-black text-xs opacity-50">{String(i + 1).padStart(2, '0')}</span>
                          <span className="flex-1 font-bold text-zinc-200">{title}</span>
                          <button 
                            onClick={() => handleCopy(title, i + 100)}
                            className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors text-zinc-600 hover:text-emerald-400"
                          >
                            {copiedIndex === i + 100 ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] uppercase text-emerald-500/50 font-black tracking-widest">Descrição Profissional</h3>
                        <button 
                          onClick={() => handleCopy(state.result?.description || '', 200)}
                          className="text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-[9px] font-black uppercase"
                        >
                          {copiedIndex === 200 ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Copiar
                        </button>
                      </div>
                      <div className="bg-black/60 p-5 rounded-2xl text-[11px] text-zinc-400 leading-relaxed border border-zinc-800 italic h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-900">
                        {state.result.description}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] uppercase text-emerald-500/50 font-black mb-4 tracking-widest">Tags Estratégicas</h3>
                      <div className="bg-black/60 p-5 rounded-2xl border border-zinc-800 h-40">
                        <div className="flex flex-wrap gap-2">
                          {state.result.tags.map((tag, i) => (
                            <span key={i} className="bg-emerald-500/5 text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/20 text-emerald-400 font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <button 
                          onClick={() => handleCopy(state.result?.tags.join(', ') || '', 300)}
                          className="mt-4 w-full text-center py-2 text-[10px] font-black uppercase text-emerald-500 hover:text-emerald-400 transition-colors"
                        >
                          {copiedIndex === 300 ? 'Copiado para o Clip' : 'Copiar Todas as Tags'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Script Parts Section */}
              <section className="bg-zinc-900/50 border border-emerald-900/30 rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-emerald-500/10 px-8 py-4 border-b border-emerald-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-black uppercase tracking-widest text-xs">
                    <FileText className="w-4 h-4" />
                    <h2>Roteiro Master & Masterização de Áudio</h2>
                  </div>
                </div>

                <div className="p-8 space-y-12">
                  {state.result.parts.map((part, idx) => (
                    <div key={idx} className="space-y-4 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <span className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-black text-[10px] font-black rounded-lg">
                             {idx + 1}
                           </span>
                           <h4 className="text-xs font-black uppercase text-zinc-300 tracking-widest">Bloco de Áudio {idx + 1}</h4>
                        </div>
                        <button 
                          onClick={() => handleCopy(part.text, idx)}
                          className="text-zinc-600 hover:text-emerald-400 flex items-center gap-1.5 text-[9px] uppercase font-black transition-colors"
                        >
                          {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          Copiar Texto
                        </button>
                      </div>
                      
                      <div className="bg-black/60 p-6 rounded-2xl text-sm border border-zinc-800 leading-relaxed text-zinc-300 font-medium group-hover:border-emerald-500/20 transition-all">
                        {part.text}
                      </div>

                      <div className="pt-2">
                        {!part.audioBlob ? (
                          <button
                            onClick={() => handleGenerateAudioPart(idx)}
                            disabled={part.isGeneratingAudio}
                            className="w-full bg-zinc-800 hover:bg-emerald-500 hover:text-black text-emerald-400 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-30"
                          >
                            {part.isGeneratingAudio ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                            Renderizar Áudio Realista
                          </button>
                        ) : (
                          <div className="flex items-center gap-4 bg-black border border-emerald-500/30 p-4 rounded-2xl animate-in zoom-in-95 duration-300">
                            <div className="bg-emerald-500/10 p-2 rounded-lg">
                              <Play className="w-4 h-4 text-emerald-500 fill-current" />
                            </div>
                            <audio controls className="h-8 flex-1 invert brightness-125" src={URL.createObjectURL(part.audioBlob)} />
                            <a 
                              href={URL.createObjectURL(part.audioBlob)} 
                              download={`parte_${idx + 1}_${state.selectedVoice}.wav`}
                              className="bg-emerald-500 hover:bg-emerald-400 text-black p-3 rounded-xl flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                              title="Baixar Arquivo .WAV"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar (Mobile) */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-xl border-t border-emerald-900/30 md:hidden z-50">
         <button
            onClick={handleGenerateContent}
            disabled={state.isProcessing || !state.newsText.trim()}
            className="w-full bg-emerald-500 text-black font-black uppercase text-xs py-4 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all"
         >
            {state.isProcessing ? 'Processando Roteiro...' : 'Gerar Conteúdo Viral'}
         </button>
      </footer>
    </div>
  );
}
