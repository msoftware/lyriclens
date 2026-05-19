import React, { useState, useRef, useEffect } from 'react';
import { analyzeLyrics, AnalysisMetrics, LANGUAGES } from './services/analyzeService';
import Markdown from 'react-markdown';
import { Upload, Music, Loader2, FileText, Sparkles, Globe, History, ChevronRight, Heart, Tags, BarChart3, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useTranslation } from 'react-i18next';
import config from "./config";

interface AnalysisHistoryItem {
  id: string;
  lyrics: string;
  analysis: string;
  language: string;
  timestamp: number;
  metrics?: AnalysisMetrics | null;
}

export default function App() {

  const { t, i18n } = useTranslation();
  const [lyrics, setLyrics] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [metrics, setMetrics] = useState<AnalysisMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(config.api.historyUrl)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
        }
      })
      .catch(e => console.error('Failed to fetch history from server', e));
  }, []);

  const handleAnalyze = async () => {
    if (!lyrics.trim()) {
      setError('Please enter or upload some lyrics first.');
      return;
    }
    setError('');
    setIsAnalyzing(true);
    try {

      const selectedLanguage = LANGUAGES.find(
        (lang) => lang.key === language
      );

      const result = await analyzeLyrics(lyrics, language); 
      setAnalysis(result.analysis);
      setMetrics(result.metrics);
      
      const newItem: AnalysisHistoryItem = {
        id: Date.now().toString(),
        lyrics: lyrics,
        analysis: result.analysis,
        language: selectedLanguage?.label || 'English',
        timestamp: Date.now(),
        metrics: result.metrics || null
      };
      
      const updatedHistory = [newItem, ...history].slice(0, 9); 
      setHistory(updatedHistory);
      
      fetch(config.api.historyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      }).catch(e => console.error('Failed to save history to server', e));
      
    } catch (err) {
      console.error(err);
      setError('Failed to analyze lyrics. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setLyrics(content);
      setError('');
    };
    reader.onerror = () => {
      setError('Failed to read file.');
    };
    reader.readAsText(file);
  };

  const loadHistoryItem = (item: AnalysisHistoryItem) => {
    setLyrics(item.lyrics);
    setAnalysis(item.analysis);
    setLanguage(item.language);
    setMetrics(item.metrics || null);
    // and scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderInsightCards = () => {
    if (!metrics) return null;

    const cards = [
      {
        title: 'primaryTheme',
        value: metrics.PrimaryTheme || 'Unknown',
        icon: Tags,
      },
      {
        title: 'dominantEmotion',
        value: metrics.DominantEmotion || 'Neutral',
        icon: Heart,
      },
      {
        title: 'complexityLevel',
        value: metrics.ComplexityLevel || 'Medium',
        icon: BarChart3,
      },
      {
        title: 'narrativeStyle',
        value: metrics.NarrativeStyle || 'Unknown',
        icon: User,
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-3 hover:border-[#ff4e00]/40 transition-all"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_top_left,#ff4e0015,transparent_60%)]"></div>

              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/50 mb-1">
                    {t(card.title)}
                  </p>

                  <h3 className="text-sm font-semibold text-[#ff7b3d]">
                    {card.value}
                  </h3>
                </div>

                <div className="w-7 h-7 rounded-xl bg-[#ff4e00]/10 border border-[#ff4e00]/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#ff7b3d]" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderRadarChart = () => {
    if (!metrics) return null;
     const data =[
      { subject: t('metrics.emotion'), A: metrics.Emotion || 0, fullMark: 10 },
      { subject: t('metrics.complexity'), A: metrics.Complexity || 0, fullMark: 10 },
      { subject: t('metrics.storytelling'), A: metrics.Storytelling || 0, fullMark: 10 },
      { subject: t('metrics.imagery'), A: metrics.Imagery || 0, fullMark: 10 },
      { subject: t('metrics.repetition'), A: metrics.Repetition || 0, fullMark: 10 },
      { subject: t('metrics.intensity'), A: metrics.Intensity || 0, fullMark: 10 },
      { subject: t('metrics.originality'), A: metrics.Originality || 0, fullMark: 10 },
      { subject: t('metrics.depth'), A: metrics.Depth || 0, fullMark: 10 },
    ];

    return (
      <div className="w-full h-80 mb-8 pb-8 border-b border-white/10 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.2)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
            
            <Radar
              name="Song Metrics"
              dataKey="A"
              stroke="#ff4e00"
              strokeWidth={1}  
              fill="#ff4e00"
              fillOpacity={0.4}
              
              dot={{ 
                r: 3, 
                fill: '#ffffff', 
                stroke: '#ff4e00',
                strokeWidth: 1 
              }} 
              
              activeDot={{ 
                r: 4, 
                fill: '#ffffff', 
                stroke: '#ff4e00', 
                strokeWidth: 1
              }}
              
              style={{
                filter: 'drop-shadow(0px 0px 10px rgba(255, 78, 0, 0.8))'
              }}
            />
            
            <RechartsTooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '8px', 
                color: '#fff' 
              }}
              itemStyle={{ color: '#ff4e00' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-white font-sans selection:bg-[#ff4e00] selection:text-white">
      {/* background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#3a1510_0%,transparent_50%)] opacity-60 blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_80%,#ff4e00_0%,transparent_40%)] opacity-20 blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20">
        <header className="mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/10 mb-6 backdrop-blur-md"
          >
            <Music className="w-8 h-8 text-[#ff4e00]" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif tracking-tight mb-4"
          >
            Lyric<span className="text-[#ff4e00] italic">Lens</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60 max-w-2xl mx-auto"
          >
            {t('intro')}
          </motion.p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#ff4e00]" />
                {t('lyrics')}
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative flex items-center">
                  <Globe className="w-4 h-4 absolute left-3 text-white/50 pointer-events-none" />
                  <select
                    value={language}
                    onChange={(e) => {
                      const lang = e.target.value;

                      setLanguage(lang);
                      i18n.changeLanguage(lang);
                    }}
                    className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-sm rounded-full pl-9 pr-8 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/50 cursor-pointer text-white"
                    >
                    {LANGUAGES.map((lang) => (
                      <option
                        key={lang.key}
                        value={lang.key}
                        className="bg-[#1a1a1a]"
                      >
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 pointer-events-none">
                    <svg className="w-3 h-3 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload.txt
                </button>
              </div>
              <input 
                type="file" 
                accept=".txt" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </div>
            
            <div className="relative flex-grow min-h-[400px]">
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder={t('pasteLyrics')}
                className="w-full h-full min-h-[400px] p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/50 focus:border-[#ff4e00]/50 transition-all resize-none font-serif text-lg leading-relaxed text-white/90 placeholder:text-white/30 custom-scrollbar"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm px-4">{error}</p>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !lyrics.trim()}
              className="w-full py-4 px-8 bg-[#ff4e00] hover:bg-[#ff6a2b] disabled:bg-white/10 disabled:text-white/40 text-white rounded-2xl font-medium text-lg transition-all flex items-center justify-center gap-3 group"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('analyzing')}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {t('analyzeLyrics')}
                </>
              )}
            </button>
          </motion.section>

          {/* Output Section */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-4 h-full"
          >
            <h2 className="text-xl font-serif flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#ff4e00]" />
              {t('analysis')}
            </h2>
            
            <div className="flex-grow bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md p-6 overflow-y-auto max-h-[600px] lg:max-h-none custom-scrollbar">
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-white/40 gap-4 min-h-[300px]"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#ff4e00] blur-xl opacity-20 rounded-full animate-pulse"></div>
                      <Loader2 className="w-10 h-10 animate-spin text-[#ff4e00] relative z-10" />
                    </div>
                    <p className="font-serif italic text-lg">{t('deconstructingVerses')}</p>
                  </motion.div>
                ) : analysis ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-invert prose-orange max-w-none font-sans"
                  >
                    {renderRadarChart()}
                    {renderInsightCards()}
                    <div className="markdown-body">
                      <Markdown>{analysis}</Markdown>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-white/30 gap-4 min-h-[300px]"
                  >
                    <Music className="w-12 h-12 opacity-20" />
                    <p className="font-serif italic text-lg text-center max-w-xs">
                      {t('emptyState')}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </main>

        {/* History Section */}
        {history.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 pt-12 border-t border-white/10"
          >
            <h2 className="text-xl font-serif flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-[#ff4e00]" />
              {t('recentAnalyses')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 cursor-pointer transition-all hover:border-[#ff4e00]/30 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-1 rounded-md">
                      {item.language}
                    </span>
                    <span className="text-xs text-white/30">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 italic font-serif line-clamp-2 mb-4">
                    "{item.lyrics}"
                  </p>
                  <div className="flex items-center text-[#ff4e00] text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                    {t('viewAnalysis')} <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        <footer className="mt-16 py-8 border-t border-white/10 text-center text-white/40 text-sm">
          <a href="https://jentsch.io/" target="_blank" className="hover:text-[#ff4e00] transition-colors">Copyright &copy; 2026 by Michael Jentsch</a>
        </footer>
      </div>
    </div>
  );
}

