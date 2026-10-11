import React from 'react';
import { Volume2, VolumeX, Music, Languages, Sparkles, User, Activity } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { soundEngine } from '../utils/audio';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  studentName: string;
  onSwitchStudent: () => void;
  activeTab: 'marble' | 'tools' | 'daily' | 'quiz';
  onSelectTab: (tab: 'marble' | 'tools' | 'daily' | 'quiz') => void;
  onOpenTeachersGuide: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isBgmActive: boolean;
  onToggleBgm: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  studentName,
  onSwitchStudent,
  activeTab,
  onSelectTab,
  onOpenTeachersGuide,
  isMuted,
  onToggleMute,
  isBgmActive,
  onToggleBgm,
  reducedMotion,
  onToggleReducedMotion,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-amber-200/80 shadow-xs">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Greeting */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight leading-tight">
                {t.appTitle}
              </h1>
              <span className="hidden md:inline-block px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                DSKP 8.2
              </span>
            </div>
            {studentName && (
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-600 inline" />
                <span className="text-amber-800 font-bold">{studentName}</span>
                <button
                  type="button"
                  onClick={onSwitchStudent}
                  className="ml-1 text-[11px] text-slate-400 hover:text-rose-600 underline cursor-pointer"
                  title={t.switchStudent}
                >
                  ({t.switchStudent})
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Global Controls: Language, Sound, BGM, Motion */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Toggle (Always Visible) */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onToggleLang();
            }}
            aria-label="Tukar Bahasa / Change Language"
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl border border-amber-300 transition-all shadow-xs cursor-pointer active:scale-95 min-h-[44px]"
          >
            <Languages className="w-4 h-4 text-amber-700" />
            <span className="font-extrabold">{lang === 'ms' ? 'BM' : 'EN'}</span>
            <span className="text-amber-600 text-[11px] font-medium hidden sm:inline">
              ({lang === 'ms' ? 'English' : 'B. Melayu'})
            </span>
          </button>

          {/* Panduan Guru Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onOpenTeachersGuide();
            }}
            aria-label={t.teachersGuideNav}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-extrabold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 min-h-[44px]"
            title={t.teachersGuideNav}
          >
            <span>📖</span>
            <span className="hidden sm:inline">{t.teachersGuideNav}</span>
          </button>

          {/* Master Mute / Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              onToggleMute();
            }}
            aria-label={isMuted ? t.soundOff : t.soundOn}
            className={`flex items-center gap-1 px-3 py-2 text-xs sm:text-sm font-bold rounded-xl border transition-all cursor-pointer min-h-[44px] active:scale-95 ${
              isMuted
                ? 'bg-rose-100 text-rose-700 border-rose-300 hover:bg-rose-200'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
            }`}
            title={isMuted ? t.soundOff : t.soundOn}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline font-bold">{isMuted ? t.soundOff : t.soundOn}</span>
          </button>

          {/* Background Music Toggle */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onToggleBgm();
            }}
            aria-label={isBgmActive ? t.musicOn : t.musicOff}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 ${
              isBgmActive && !isMuted
                ? 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200'
                : 'bg-slate-100 text-slate-400 border-slate-300 hover:bg-slate-200'
            }`}
            title={isBgmActive ? t.musicOn : t.musicOff}
          >
            <Music className="w-4 h-4" />
          </button>

          {/* Reduced Motion Toggle */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onToggleReducedMotion();
            }}
            aria-label={reducedMotion ? t.motionReduced : t.motionNormal}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95 ${
              reducedMotion
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
            }`}
            title={reducedMotion ? t.motionReduced : t.motionNormal}
          >
            <Activity className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <nav aria-label="Tab Navigation" className="border-t border-amber-100 bg-amber-50/70 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-1 sm:gap-2 py-1.5 min-w-max">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onSelectTab('marble');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 min-h-[44px] ${
              activeTab === 'marble'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-[1.02]'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-amber-800 border border-amber-200/60'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
            {t.tabMarble}
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onSelectTab('tools');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 min-h-[44px] ${
              activeTab === 'tools'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-[1.02]'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-amber-800 border border-amber-200/60'
            }`}
          >
            <span>🎲</span>
            {t.tabTools}
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onSelectTab('daily');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 min-h-[44px] ${
              activeTab === 'daily'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 scale-[1.02]'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-amber-800 border border-amber-200/60'
            }`}
          >
            <span>🌍</span>
            {t.tabDaily}
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onSelectTab('quiz');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 min-h-[44px] ${
              activeTab === 'quiz'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-[1.02]'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-800 border border-amber-200/60'
            }`}
          >
            <span>🏆</span>
            {t.tabQuiz}
          </button>
        </div>
      </nav>
    </header>
  );
};
