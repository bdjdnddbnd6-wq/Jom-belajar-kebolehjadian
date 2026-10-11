import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Play, Languages, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { soundEngine } from '../utils/audio';

interface LoginScreenProps {
  lang: Language;
  onToggleLang: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onStart: (name: string) => void;
  onOpenTeachersGuide: () => void;
  reducedMotion: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  lang,
  onToggleLang,
  isMuted,
  onToggleMute,
  onStart,
  onOpenTeachersGuide,
  reducedMotion,
}) => {
  const t = translations[lang];
  const [name, setName] = useState('');
  const [error, setError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Attempt to load existing student name from localStorage
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('kssr_student_name');
      if (savedName) {
        setName(savedName);
      }
    } catch {
      // localStorage may fail in restricted iframe mode; gracefully handled
    }
  }, []);

  // Floating animated Marbles and Dice background on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface FloatingItem {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      type: 'red_marble' | 'blue_marble' | 'dice';
      rotation: number;
      vRot: number;
      pip: number;
    }

    const items: FloatingItem[] = Array.from({ length: 22 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * (reducedMotion ? 0.2 : 0.6),
      vy: (Math.random() - 0.5) * (reducedMotion ? 0.2 : 0.6),
      size: 18 + Math.random() * 22,
      type: Math.random() > 0.4 ? (Math.random() > 0.5 ? 'red_marble' : 'blue_marble') : 'dice',
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.02,
      pip: 1 + Math.floor(Math.random() * 6),
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      items.forEach((item) => {
        item.x += item.vx;
        item.y += item.vy;
        item.rotation += item.vRot;

        if (item.x < -item.size) item.x = width + item.size;
        if (item.x > width + item.size) item.x = -item.size;
        if (item.y < -item.size) item.y = height + item.size;
        if (item.y > height + item.size) item.y = -item.size;

        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);

        if (item.type === 'red_marble') {
          ctx.beginPath();
          ctx.arc(0, 0, item.size, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(
            -item.size * 0.3,
            -item.size * 0.3,
            item.size * 0.1,
            0,
            0,
            item.size
          );
          grad.addColorStop(0, '#fca5a5');
          grad.addColorStop(0.5, '#ef4444');
          grad.addColorStop(1, '#991b1b');
          ctx.fillStyle = grad;
          ctx.shadowColor = 'rgba(239, 68, 68, 0.25)';
          ctx.shadowBlur = 8;
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${item.size * 0.8}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', 0, 1);
        } else if (item.type === 'blue_marble') {
          ctx.beginPath();
          ctx.arc(0, 0, item.size, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(
            -item.size * 0.3,
            -item.size * 0.3,
            item.size * 0.1,
            0,
            0,
            item.size
          );
          grad.addColorStop(0, '#93c5fd');
          grad.addColorStop(0.5, '#3b82f6');
          grad.addColorStop(1, '#1e3a8a');
          ctx.fillStyle = grad;
          ctx.shadowColor = 'rgba(59, 130, 246, 0.25)';
          ctx.shadowBlur = 8;
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${item.size * 0.8}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('◆', 0, 1);
        } else {
          const dSize = item.size * 1.5;
          ctx.beginPath();
          ctx.roundRect(-dSize / 2, -dSize / 2, dSize, dSize, 8);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0,0,0,0.12)';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#e2e8f0';
          ctx.stroke();

          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(0, 0, dSize * 0.14, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [reducedMotion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError(true);
      soundEngine.playWrong();
      return;
    }
    setError(false);
    try {
      localStorage.setItem('kssr_student_name', cleanName);
    } catch {
      // Safe fallback
    }

    soundEngine.playCorrect();
    soundEngine.startBGM();
    onStart(cleanName);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden select-none">
      {/* Background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-45" />

      {/* Floating Top Bar for Language & Audio */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onToggleLang();
          }}
          className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold bg-white/90 backdrop-blur-md hover:bg-white text-amber-900 rounded-2xl border-2 border-amber-300 shadow-sm cursor-pointer transition-transform active:scale-95 min-h-[48px]"
        >
          <Languages className="w-4 h-4 text-amber-700" />
          <span className="font-extrabold">{lang === 'ms' ? 'English' : 'Bahasa Melayu'}</span>
        </button>
        <button
          type="button"
          onClick={onToggleMute}
          className={`flex items-center justify-center p-3 rounded-2xl border-2 shadow-sm cursor-pointer transition-transform active:scale-95 min-h-[48px] min-w-[48px] ${
            isMuted
              ? 'bg-rose-100/90 text-rose-700 border-rose-300'
              : 'bg-emerald-100/90 text-emerald-800 border-emerald-300'
          }`}
          title={isMuted ? t.soundOff : t.soundOn}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl border-4 border-amber-300 shadow-2xl p-6 sm:p-9 text-center animate-in fade-in zoom-in-95 duration-300">
        {/* Header Icon & Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold mb-4">
          <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
          <span>{lang === 'ms' ? 'DSKP MATEMATIK TAHUN 6' : 'YEAR 6 MATHEMATICS DSKP'}</span>
        </div>

        {/* Big Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2 drop-shadow-xs">
          {t.loginTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium mb-6 leading-relaxed">
          {t.loginSub}
        </p>

        {/* DSKP Standards Highlights */}
        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs text-left mb-6">
          <span className="font-extrabold text-amber-900 block mb-0.5">
            DSKP KSSR Semakan 2017: Standard Pembelajaran 8.2.2
          </span>
          <span className="text-slate-700 font-semibold">
            {lang === 'ms'
              ? 'Menyatakan kebolehjadian sebagai mustahil, kecil kemungkinan, sama kemungkinan, besar kemungkinan atau pasti, serta memberi sebab yang munasabah.'
              : 'Stating likelihood as impossible, unlikely, equally likely, likely or certain, and giving reasonable justifications.'}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label
              htmlFor="student-name-input"
              className="block text-xs sm:text-sm font-extrabold text-slate-700 mb-1.5"
            >
              {t.nameLabel}
            </label>
            <input
              id="student-name-input"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(false);
              }}
              placeholder={t.inputNamePlaceholder}
              autoFocus
              className={`w-full px-4 py-3.5 rounded-2xl text-base font-bold bg-slate-50 border-2 transition-all outline-hidden min-h-[48px] ${
                error
                  ? 'border-rose-400 bg-rose-50 focus:border-rose-500 text-rose-900'
                  : 'border-slate-300 focus:border-amber-500 focus:bg-white text-slate-800'
              }`}
            />
            {error && (
              <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1">
                <span>⚠️</span> {t.needNameAlert}
              </p>
            )}
          </div>

          {/* Big Start Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-black text-lg tracking-wide shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:brightness-105 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-3 min-h-[52px]"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{t.startButton}</span>
          </button>
        </form>

        {/* Teacher's Guide Direct Access Link */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onOpenTeachersGuide();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-amber-100/90 hover:bg-amber-200 text-amber-900 font-extrabold text-xs sm:text-sm border border-amber-300 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>📖</span>
            <span>{t.openTeachersGuideLogin}</span>
          </button>
        </div>

        {/* Friendly offline badge */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>
            {lang === 'ms'
              ? '100% Bebas internet, selamat & mesra sekolah'
              : '100% Offline, safe & classroom-friendly'}
          </span>
        </div>
      </div>
    </div>
  );
};
