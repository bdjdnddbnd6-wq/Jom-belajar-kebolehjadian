import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Shuffle, Play, CheckCircle2 } from 'lucide-react';
import { Language, translations, LIKELIHOOD_STEPS } from '../utils/translations';
import { getLikelihoodFromCount } from '../utils/probability';
import { soundEngine } from '../utils/audio';
import { MarblePhysicsCanvas, MarblePhysicsHandle } from './MarblePhysicsCanvas';

interface MarbleBagLabProps {
  lang: Language;
  reducedMotion: boolean;
}

export const MarbleBagLab: React.FC<MarbleBagLabProps> = ({ lang, reducedMotion }) => {
  const t = translations[lang];

  // Marble state
  const [redCount, setRedCount] = useState<number>(2);
  const [blueCount, setBlueCount] = useState<number>(1);
  const [targetColor, setTargetColor] = useState<'red' | 'blue'>('red');

  // Animation states
  const [drawnMarble, setDrawnMarble] = useState<'red' | 'blue' | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const physicsRef = useRef<MarblePhysicsHandle | null>(null);

  // 100-Trial Simulation Modal state
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);
  const [simResults, setSimResults] = useState<{ red: number; blue: number } | null>(null);
  const [simProgress, setSimProgress] = useState<number>(0);
  const [isSimRunning, setIsSimRunning] = useState(false);

  const totalMarbles = redCount + blueCount;
  const maxTotal = 12;
  const minTotal = 1;

  // On initial mount: drop 3 marbles one by one into the physics bag
  const hasMounted = useRef(false);
  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    if (reducedMotion) {
      physicsRef.current?.resetAll(2, 1);
      return;
    }

    const timers = [
      setTimeout(() => {
        soundEngine.playMarbleDrop(0.9);
        physicsRef.current?.addMarble('red');
      }, 350),
      setTimeout(() => {
        soundEngine.playMarbleDrop(1.0);
        physicsRef.current?.addMarble('red');
      }, 800),
      setTimeout(() => {
        soundEngine.playMarbleDrop(1.15);
        physicsRef.current?.addMarble('blue');
      }, 1250),
    ];

    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  // Add red marble
  const handleAddRed = () => {
    if (totalMarbles >= maxTotal) return;
    soundEngine.playMarbleDrop(1.05);
    setRedCount((prev) => prev + 1);
    physicsRef.current?.addMarble('red');
  };

  // Remove red marble
  const handleRemoveRed = () => {
    if (redCount <= 0 || totalMarbles <= minTotal) return;
    soundEngine.playMarblePop();
    setRedCount((prev) => prev - 1);
    physicsRef.current?.removeMarble('red');
  };

  // Add blue marble
  const handleAddBlue = () => {
    if (totalMarbles >= maxTotal) return;
    soundEngine.playMarbleDrop(1.2);
    setBlueCount((prev) => prev + 1);
    physicsRef.current?.addMarble('blue');
  };

  // Remove blue marble
  const handleRemoveBlue = () => {
    if (blueCount <= 0 || totalMarbles <= minTotal) return;
    soundEngine.playMarblePop();
    setBlueCount((prev) => prev - 1);
    physicsRef.current?.removeMarble('blue');
  };

  // Draw 1 random marble with physics lifting and return
  const handleDrawOne = () => {
    if (isDrawing || totalMarbles === 0) return;
    setIsDrawing(true);
    setDrawnMarble(null);
    physicsRef.current?.drawOneMarble((pickedColor) => {
      setDrawnMarble(pickedColor);
    });
  };

  // Run 100 trials simulation
  const handleRun100Sim = () => {
    setIsSimModalOpen(true);
    setIsSimRunning(true);
    setSimProgress(0);
    setSimResults(null);

    let redWins = 0;
    let blueWins = 0;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep += 4;
      for (let k = 0; k < 4; k++) {
        const roll = Math.random() * totalMarbles;
        if (roll < redCount) redWins++;
        else blueWins++;
      }
      setSimProgress(currentStep);
      setSimResults({ red: redWins, blue: blueWins });
      soundEngine.playSpinnerTick(500 + currentStep * 3);

      if (currentStep >= 100) {
        clearInterval(interval);
        setIsSimRunning(false);
        soundEngine.playCorrect();
      }
    }, reducedMotion ? 15 : 45);
  };

  // Calculate likelihood using pure mathematical engine
  const targetCount = targetColor === 'red' ? redCount : blueCount;
  const otherCount = targetColor === 'red' ? blueCount : redCount;
  const targetNameMs = targetColor === 'red' ? 'guli merah' : 'guli biru';
  const targetNameEn = targetColor === 'red' ? 'red marble' : 'blue marble';
  const otherNameMs = targetColor === 'red' ? 'guli biru' : 'guli merah';
  const otherNameEn = targetColor === 'red' ? 'blue marble' : 'red marble';

  const likelihood = getLikelihoodFromCount(
    targetCount,
    totalMarbles,
    targetNameMs,
    targetNameEn,
    otherCount,
    otherNameMs,
    otherNameEn
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Title & Guidance Header */}
      <div className="bg-gradient-to-r from-amber-100/90 via-orange-100/70 to-rose-100/90 rounded-3xl p-6 border-2 border-amber-300 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-black tracking-wide mb-2 uppercase">
              DSKP KSSR 8.2.2 • Eksplorasi Visual
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t.marbleBagTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-700 font-medium mt-1 max-w-3xl">
              {t.marbleBagSub}
            </p>
          </div>

          {/* Quick Target Color Switcher */}
          <div className="bg-white/90 p-3.5 rounded-2xl border-2 border-amber-300 shadow-xs flex flex-col gap-1.5 self-start md:self-auto min-w-[240px]">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
              {t.targetSelectLabel}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setTargetColor('red');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer min-h-[44px] ${
                  targetColor === 'red'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-400'
                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                <span>🔴</span> {lang === 'ms' ? 'Merah' : 'Red'}
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setTargetColor('blue');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-black text-xs transition-all cursor-pointer min-h-[44px] ${
                  targetColor === 'blue'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400'
                    : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                <span>🔵</span> {lang === 'ms' ? 'Biru' : 'Blue'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Bag & Controls, Right = 5-Step Ladder & Reason */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 Cols): Animated Marble Bag & Counter Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border-3 border-amber-200 shadow-md p-6 flex flex-col items-center relative overflow-hidden">
            {/* Physics Marble Container Canvas */}
            <div className="relative flex items-center justify-center select-none">
              <MarblePhysicsCanvas
                ref={physicsRef}
                lang={lang}
                reducedMotion={reducedMotion}
                onDrawStateChange={(drawing, color) => {
                  setIsDrawing(drawing);
                  if (color) setDrawnMarble(color);
                }}
              />

              {/* Random Drawn Showcase Bubble Animation */}
              {isDrawing && (
                <div className="absolute top-1 inset-x-0 flex flex-col items-center justify-center z-30 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border-3 border-amber-400 shadow-2xl flex flex-col items-center min-w-[190px]">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      {t.drawnResult}
                    </span>
                    {drawnMarble ? (
                      <div className="flex items-center gap-3 my-1">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-lg shadow-lg border-2 border-white ${
                            drawnMarble === 'red'
                              ? 'bg-gradient-to-tr from-red-600 to-rose-400 ring-2 ring-red-400'
                              : 'bg-gradient-to-tr from-blue-700 to-sky-400 ring-2 ring-blue-400'
                          }`}
                        >
                          {drawnMarble === 'red' ? '★' : '◆'}
                        </div>
                        <div className="text-left">
                          <p className="font-black text-slate-800 text-sm">
                            {drawnMarble === 'red'
                              ? lang === 'ms'
                                ? 'Guli Merah'
                                : 'Red Marble'
                              : lang === 'ms'
                              ? 'Guli Biru'
                              : 'Blue Marble'}
                          </p>
                          <p className="text-[11px] text-emerald-600 font-bold">
                            {drawnMarble === targetColor
                              ? lang === 'ms'
                                ? 'Padan Sasaran! ✨'
                                : 'Matched Target! ✨'
                              : lang === 'ms'
                              ? 'Bukan Sasaran'
                              : 'Not Target'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 py-2 text-xs font-bold text-amber-700 animate-pulse">
                        <Shuffle className="w-4 h-4 animate-spin" />
                        <span>{t.drawingText}</span>
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 font-semibold mt-1">
                      {t.returnedToBag}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Draw 1 Marble Button */}
            <button
              type="button"
              disabled={isDrawing || totalMarbles === 0}
              onClick={handleDrawOne}
              className="mt-4 w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-sm tracking-wide shadow-md shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              <Shuffle className={`w-4 h-4 ${isDrawing ? 'animate-spin' : ''}`} />
              <span>{t.drawOneBtn}</span>
            </button>
          </div>

          {/* Stepper Controls for Red & Blue Marbles */}
          <div className="bg-white rounded-3xl border-3 border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-extrabold text-slate-800 text-sm">{t.totalMarbles}</span>
              <span className="px-3 py-1 rounded-full font-black text-sm bg-slate-100 text-slate-800 border border-slate-300">
                {totalMarbles} / {maxTotal}
              </span>
            </div>

            {/* Red Marble Controls */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/70 border border-rose-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-sm shadow-sm">
                  ★
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-xs sm:text-sm">
                    {t.redMarbles}
                  </h4>
                  <span className="text-[11px] font-bold text-rose-600">
                    {redCount} {lang === 'ms' ? 'biji' : 'marbles'} ({Math.round((redCount / Math.max(1, totalMarbles)) * 100)}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Kurangkan guli merah"
                  disabled={redCount <= 0 || totalMarbles <= minTotal}
                  onClick={handleRemoveRed}
                  className="w-11 h-11 rounded-xl bg-white border-2 border-rose-300 text-rose-700 hover:bg-rose-100 active:scale-95 flex items-center justify-center font-black text-lg transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed min-w-[44px]"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 text-center font-black text-lg text-slate-900">
                  {redCount}
                </span>
                <button
                  type="button"
                  aria-label="Tambah guli merah"
                  disabled={totalMarbles >= maxTotal}
                  onClick={handleAddRed}
                  className="w-11 h-11 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-rose-500/25 transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed min-w-[44px]"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Blue Marble Controls */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/70 border border-blue-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                  ◆
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-xs sm:text-sm">
                    {t.blueMarbles}
                  </h4>
                  <span className="text-[11px] font-bold text-blue-600">
                    {blueCount} {lang === 'ms' ? 'biji' : 'marbles'} ({Math.round((blueCount / Math.max(1, totalMarbles)) * 100)}%)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Kurangkan guli biru"
                  disabled={blueCount <= 0 || totalMarbles <= minTotal}
                  onClick={handleRemoveBlue}
                  className="w-11 h-11 rounded-xl bg-white border-2 border-blue-300 text-blue-700 hover:bg-blue-100 active:scale-95 flex items-center justify-center font-black text-lg transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed min-w-[44px]"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-8 text-center font-black text-lg text-slate-900">
                  {blueCount}
                </span>
                <button
                  type="button"
                  aria-label="Tambah guli biru"
                  disabled={totalMarbles >= maxTotal}
                  onClick={handleAddBlue}
                  className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed min-w-[44px]"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Try 100 Times Simulation Support Button */}
            <button
              type="button"
              onClick={handleRun100Sim}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-300 text-indigo-900 font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Play className="w-4 h-4 text-indigo-600" />
              <span>{t.simulate100Btn}</span>
            </button>
          </div>
        </div>

        {/* Right Column (7 Cols): 5-Step Likelihood Ladder & Dynamic Reason */}
        <div className="lg:col-span-7 space-y-6">
          {/* 5-Step Staircase / Ladder Gauge */}
          <div className="bg-white rounded-3xl border-3 border-amber-200 shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {t.scaleLadderTitle}
              </h3>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border text-xs font-black text-slate-700">
                <span>{lang === 'ms' ? 'Sasaran:' : 'Target:'}</span>
                <span className={targetColor === 'red' ? 'text-rose-600' : 'text-blue-600'}>
                  {targetColor === 'red' ? t.targetMerah : t.targetBiru} ({likelihood.fractionText})
                </span>
              </div>
            </div>

            {/* 5 Rungs Ladder View */}
            <div className="space-y-2.5">
              {LIKELIHOOD_STEPS.map((step) => {
                const isActive = likelihood.level === step.key;
                const label = lang === 'ms' ? step.labelMs : step.labelEn;
                const desc = lang === 'ms' ? step.shortDescMs : step.shortDescEn;

                return (
                  <div
                    key={step.key}
                    className={`relative rounded-2xl border-2 transition-all p-3 sm:p-4 flex items-center justify-between gap-3 ${
                      isActive
                        ? `${step.colorBg} ${step.colorBorder} shadow-lg ring-3 ring-amber-400 scale-[1.015]`
                        : 'bg-slate-50/70 border-slate-200 opacity-60 hover:opacity-85'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Step index badge */}
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-black text-sm flex items-center justify-center shadow-xs ${
                          isActive
                            ? `${step.badgeBg} text-white`
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {step.index}
                      </div>

                      {/* Step details */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className={`font-black text-sm sm:text-base ${
                              isActive ? step.colorText : 'text-slate-800'
                            }`}
                          >
                            {label}
                          </h4>
                          {isActive && (
                            <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-white animate-pulse shadow-xs">
                              {t.activeLadderBadge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">{desc}</p>
                      </div>
                    </div>

                    {/* Math Fraction indicator */}
                    <div className="text-right">
                      {isActive ? (
                        <div className="flex flex-col items-end">
                          <span className={`text-base sm:text-lg font-black ${step.colorText}`}>
                            {likelihood.percentageText}
                          </span>
                          <span className="text-[11px] font-extrabold text-slate-500">
                            {likelihood.fractionText}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">
                          {step.fractionExample}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Reason Explanation Box */}
          <div className="bg-gradient-to-br from-amber-50 via-white to-amber-100/50 rounded-3xl border-3 border-amber-300 shadow-md p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-900">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
              <h3 className="font-black text-base sm:text-lg">{t.reasonTitle}</h3>
            </div>
            <p className="text-sm sm:text-base text-slate-800 font-bold leading-relaxed bg-white/90 p-4 rounded-2xl border border-amber-200 shadow-xs">
              {lang === 'ms' ? likelihood.reasonMs : likelihood.reasonEn}
            </p>

            {/* Mathematical Rule Benchmark Note */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="font-extrabold text-slate-600">
                {lang === 'ms' ? 'Rujukan Penanda Aras:' : 'Benchmark Reference:'}
              </span>
              <span className="px-3 py-1 rounded-full font-black bg-amber-100 text-amber-900 border border-amber-300">
                {lang === 'ms'
                  ? `Separuh jumlah guli = ${totalMarbles / 2}`
                  : `Half of total marbles = ${totalMarbles / 2}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: 100-Trial Simulation Demonstration */}
      {isSimModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-amber-300 shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-lg sm:text-xl text-slate-900">{t.simTitle}</h3>
                <p className="text-xs text-slate-500 font-semibold">{t.simSub}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                <span>{isSimRunning ? t.runningSim : t.simFinished}</span>
                <span>{simProgress} / 100</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden border">
                <div
                  className="h-full bg-amber-500 transition-all duration-100"
                  style={{ width: `${simProgress}%` }}
                />
              </div>
            </div>

            {/* Comparative Bars */}
            {simResults && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {/* Red Count Bar */}
                <div>
                  <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
                    <span className="flex items-center gap-1 text-rose-700">
                      <span>🔴</span> {t.simRedCount}
                    </span>
                    <span className="font-extrabold text-rose-800">
                      {simResults.red} {lang === 'ms' ? 'kali' : 'times'} ({simResults.red}%)
                    </span>
                  </div>
                  <div className="w-full h-5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all"
                      style={{ width: `${simResults.red}%` }}
                    />
                  </div>
                </div>

                {/* Blue Count Bar */}
                <div>
                  <div className="flex justify-between text-xs font-black text-slate-700 mb-1">
                    <span className="flex items-center gap-1 text-blue-700">
                      <span>🔵</span> {t.simBlueCount}
                    </span>
                    <span className="font-extrabold text-blue-800">
                      {simResults.blue} {lang === 'ms' ? 'kali' : 'times'} ({simResults.blue}%)
                    </span>
                  </div>
                  <div className="w-full h-5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${simResults.blue}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Explanation of Experimental Findings */}
            {!isSimRunning && simResults && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                <span className="font-black text-amber-900 block mb-1">
                  {t.simResultMsg}
                </span>
                {lang === 'ms' ? (
                  <>
                    Daripada 100 kali cubaan, sasaran {targetNameMs} diperolehi sebanyak{' '}
                    <span className="text-amber-900 font-black">
                      {targetColor === 'red' ? simResults.red : simResults.blue} kali
                    </span>
                    . Ini membuktikan bahawa teori kebolehjadian iaitu{' '}
                    <span className="text-rose-700 font-black uppercase">
                      {likelihood.level}
                    </span>{' '}
                    adalah tepat dan selaras dengan eksperimen dunia sebenar!
                  </>
                ) : (
                  <>
                    Out of 100 trials, the target {targetNameEn} occurred{' '}
                    <span className="text-amber-900 font-black">
                      {targetColor === 'red' ? simResults.red : simResults.blue} times
                    </span>
                    . This proves that theoretical likelihood (
                    <span className="text-rose-700 font-black uppercase">
                      {likelihood.level}
                    </span>
                    ) accurately reflects empirical probability!
                  </>
                )}
              </div>
            )}

            {/* Close Button */}
            <button
              type="button"
              disabled={isSimRunning}
              onClick={() => {
                soundEngine.playClick();
                setIsSimModalOpen(false);
              }}
              className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-900 active:scale-98 text-white font-black text-sm transition-all cursor-pointer disabled:opacity-40 min-h-[48px]"
            >
              {t.simCloseBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
