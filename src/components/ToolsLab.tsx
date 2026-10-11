import React, { useState } from 'react';
import { Play, Sparkles, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Language, translations, LIKELIHOOD_STEPS } from '../utils/translations';
import { LikelihoodLevel } from '../utils/probability';
import { soundEngine } from '../utils/audio';

type ToolType = 'dice' | 'coin' | 'spinner' | 'cards';

const DICE_FACE_ROTATIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: 90, y: 0 },
  6: { x: 0, y: 180 },
};

interface ToolSituation {
  id: string;
  nameMs: string;
  nameEn: string;
  favorableCount: number;
  totalCount: number;
  favorableListMs: string;
  favorableListEn: string;
  level: LikelihoodLevel;
  checkMatch: (result: unknown) => boolean;
}

interface ToolsLabProps {
  lang: Language;
  reducedMotion: boolean;
}

export const ToolsLab: React.FC<ToolsLabProps> = ({ lang, reducedMotion }) => {
  const t = translations[lang];
  const [currentTool, setCurrentTool] = useState<ToolType>('dice');

  // Interactive Action States
  const [selectedSituationId, setSelectedSituationId] = useState<string>('dice_even');
  const [isSimulating, setIsSimulating] = useState(false);

  // Result States per tool
  const [diceResult, setDiceResult] = useState<number>(3);
  const [diceRotX, setDiceRotX] = useState<number>(0);
  const [diceRotY, setDiceRotY] = useState<number>(-90); // 3 starts facing front
  const [diceRotZ, setDiceRotZ] = useState<number>(0);
  const [isDiceRolling, setIsDiceRolling] = useState(false);

  const [coinResult, setCoinResult] = useState<'kepala' | 'ekor'>('kepala');
  const [coinFlipX, setCoinFlipX] = useState<number>(0);
  const [isCoinFlipping, setIsCoinFlipping] = useState(false);

  // Initial spinner angle aligned to center of sector 0 (Kuning): 360 - (45/2) = 337.5 deg
  const [spinnerAngle, setSpinnerAngle] = useState<number>(337.5);
  const [spinnerResult, setSpinnerResult] = useState<string>('Kuning');
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);

  const [cardResult, setCardResult] = useState<number>(5);
  const [isCardFlipping, setIsCardFlipping] = useState(false);

  // Trial Tracker
  const [trialsCount, setTrialsCount] = useState<number>(0);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [lastMatched, setLastMatched] = useState<boolean | null>(null);

  // Situations Data for Dadu (6-sided dice)
  const diceSituations: ToolSituation[] = [
    {
      id: 'dice_7',
      nameMs: 'Mendapat nombor 7',
      nameEn: 'Rolling number 7',
      favorableCount: 0,
      totalCount: 6,
      favorableListMs: 'Tiada muka dadu bernombor 7',
      favorableListEn: 'No face has number 7',
      level: 'mustahil',
      checkMatch: (val) => val === 7,
    },
    {
      id: 'dice_6',
      nameMs: 'Mendapat nombor 6',
      nameEn: 'Rolling number 6',
      favorableCount: 1,
      totalCount: 6,
      favorableListMs: '{6}',
      favorableListEn: '{6}',
      level: 'kecil',
      checkMatch: (val) => val === 6,
    },
    {
      id: 'dice_even',
      nameMs: 'Mendapat nombor genap',
      nameEn: 'Rolling an even number',
      favorableCount: 3,
      totalCount: 6,
      favorableListMs: '{2, 4, 6}',
      favorableListEn: '{2, 4, 6}',
      level: 'sama',
      checkMatch: (val) => (val as number) % 2 === 0,
    },
    {
      id: 'dice_less_5',
      nameMs: 'Mendapat nombor kurang daripada 5',
      nameEn: 'Rolling a number less than 5',
      favorableCount: 4,
      totalCount: 6,
      favorableListMs: '{1, 2, 3, 4}',
      favorableListEn: '{1, 2, 3, 4}',
      level: 'besar',
      checkMatch: (val) => (val as number) < 5,
    },
    {
      id: 'dice_less_7',
      nameMs: 'Mendapat nombor kurang daripada 7',
      nameEn: 'Rolling a number less than 7',
      favorableCount: 6,
      totalCount: 6,
      favorableListMs: '{1, 2, 3, 4, 5, 6} (Semua)',
      favorableListEn: '{1, 2, 3, 4, 5, 6} (All)',
      level: 'pasti',
      checkMatch: (val) => (val as number) < 7,
    },
    {
      id: 'dice_odd',
      nameMs: 'Mendapat nombor ganjil',
      nameEn: 'Rolling an odd number',
      favorableCount: 3,
      totalCount: 6,
      favorableListMs: '{1, 3, 5}',
      favorableListEn: '{1, 3, 5}',
      level: 'sama',
      checkMatch: (val) => (val as number) % 2 !== 0,
    },
  ];

  // Situations Data for Syiling (Coin)
  const coinSituations: ToolSituation[] = [
    {
      id: 'coin_head',
      nameMs: 'Mendapat Kepala (Bunga Raya)',
      nameEn: 'Flipping Heads',
      favorableCount: 1,
      totalCount: 2,
      favorableListMs: '{Kepala}',
      favorableListEn: '{Heads}',
      level: 'sama',
      checkMatch: (val) => val === 'kepala',
    },
    {
      id: 'coin_tail',
      nameMs: 'Mendapat Ekor (Nombor)',
      nameEn: 'Flipping Tails',
      favorableCount: 1,
      totalCount: 2,
      favorableListMs: '{Ekor}',
      favorableListEn: '{Tails}',
      level: 'sama',
      checkMatch: (val) => val === 'ekor',
    },
    {
      id: 'coin_head_or_tail',
      nameMs: 'Mendapat Kepala atau Ekor',
      nameEn: 'Flipping Heads or Tails',
      favorableCount: 2,
      totalCount: 2,
      favorableListMs: '{Kepala, Ekor} (Kedua-dua muka)',
      favorableListEn: '{Heads, Tails} (Both faces)',
      level: 'pasti',
      checkMatch: () => true,
    },
    {
      id: 'coin_both_simultaneous',
      nameMs: 'Mendapat Kepala dan Ekor serentak dalam 1 balingan',
      nameEn: 'Flipping both Heads and Tails at once',
      favorableCount: 0,
      totalCount: 2,
      favorableListMs: 'Tiada (Syiling hanya ada satu permukaan atas)',
      favorableListEn: 'None (A coin only lands on one face)',
      level: 'mustahil',
      checkMatch: () => false,
    },
  ];

  // Spinner Sectors: 4 Yellow, 2 Green, 1 Red, 1 Blue (Total 8)
  const spinnerSectors = [
    { color: '#eab308', nameMs: 'Kuning', nameEn: 'Yellow', code: 'yellow' },
    { color: '#eab308', nameMs: 'Kuning', nameEn: 'Yellow', code: 'yellow' },
    { color: '#22c55e', nameMs: 'Hijau', nameEn: 'Green', code: 'green' },
    { color: '#eab308', nameMs: 'Kuning', nameEn: 'Yellow', code: 'yellow' },
    { color: '#ef4444', nameMs: 'Merah', nameEn: 'Red', code: 'red' },
    { color: '#3b82f6', nameMs: 'Biru', nameEn: 'Blue', code: 'blue' },
    { color: '#22c55e', nameMs: 'Hijau', nameEn: 'Green', code: 'green' },
    { color: '#eab308', nameMs: 'Kuning', nameEn: 'Yellow', code: 'yellow' },
  ];

  const spinnerSituations: ToolSituation[] = [
    {
      id: 'spin_yellow',
      nameMs: 'Jarum berhenti pada warna Kuning',
      nameEn: 'Arrow stops on Yellow',
      favorableCount: 4,
      totalCount: 8,
      favorableListMs: '4 daripada 8 sektor (tepat separuh)',
      favorableListEn: '4 out of 8 sectors (exactly half)',
      level: 'sama',
      checkMatch: (val) => val === 'Kuning' || val === 'Yellow',
    },
    {
      id: 'spin_green',
      nameMs: 'Jarum berhenti pada warna Hijau',
      nameEn: 'Arrow stops on Green',
      favorableCount: 2,
      totalCount: 8,
      favorableListMs: '2 daripada 8 sektor (kurang separuh)',
      favorableListEn: '2 out of 8 sectors (less than half)',
      level: 'kecil',
      checkMatch: (val) => val === 'Hijau' || val === 'Green',
    },
    {
      id: 'spin_yellow_or_green',
      nameMs: 'Jarum berhenti pada Kuning atau Hijau',
      nameEn: 'Arrow stops on Yellow or Green',
      favorableCount: 6,
      totalCount: 8,
      favorableListMs: '6 daripada 8 sektor (lebih separuh)',
      favorableListEn: '6 out of 8 sectors (more than half)',
      level: 'besar',
      checkMatch: (val) =>
        val === 'Kuning' || val === 'Hijau' || val === 'Yellow' || val === 'Green',
    },
    {
      id: 'spin_purple',
      nameMs: 'Jarum berhenti pada warna Ungu',
      nameEn: 'Arrow stops on Purple',
      favorableCount: 0,
      totalCount: 8,
      favorableListMs: 'Tiada sektor ungu pada roda (0)',
      favorableListEn: 'No purple sector on the wheel (0)',
      level: 'mustahil',
      checkMatch: () => false,
    },
    {
      id: 'spin_any',
      nameMs: 'Jarum berhenti pada mana-mana warna pada pemutar',
      nameEn: 'Arrow stops on any color on the wheel',
      favorableCount: 8,
      totalCount: 8,
      favorableListMs: 'Kesemua 8 sektor berlabel warna',
      favorableListEn: 'All 8 sectors have color labels',
      level: 'pasti',
      checkMatch: () => true,
    },
  ];

  // Numbered Cards 1 to 10
  const cardSituations: ToolSituation[] = [
    {
      id: 'card_even',
      nameMs: 'Mencabut kad nombor genap',
      nameEn: 'Drawing an even card',
      favorableCount: 5,
      totalCount: 10,
      favorableListMs: '{2, 4, 6, 8, 10}',
      favorableListEn: '{2, 4, 6, 8, 10}',
      level: 'sama',
      checkMatch: (val) => (val as number) % 2 === 0,
    },
    {
      id: 'card_single_digit',
      nameMs: 'Mencabut kad nombor 1 digit',
      nameEn: 'Drawing a single digit card',
      favorableCount: 9,
      totalCount: 10,
      favorableListMs: '{1, 2, 3, 4, 5, 6, 7, 8, 9}',
      favorableListEn: '{1, 2, 3, 4, 5, 6, 7, 8, 9}',
      level: 'besar',
      checkMatch: (val) => (val as number) < 10,
    },
    {
      id: 'card_multiple_5',
      nameMs: 'Mencabut kad nombor gandaan 5',
      nameEn: 'Drawing a multiple of 5',
      favorableCount: 2,
      totalCount: 10,
      favorableListMs: '{5, 10}',
      favorableListEn: '{5, 10}',
      level: 'kecil',
      checkMatch: (val) => (val as number) % 5 === 0,
    },
    {
      id: 'card_more_10',
      nameMs: 'Mencabut nombor lebih besar daripada 10',
      nameEn: 'Drawing a number greater than 10',
      favorableCount: 0,
      totalCount: 10,
      favorableListMs: 'Tiada kad bernombor > 10',
      favorableListEn: 'No card numbered > 10',
      level: 'mustahil',
      checkMatch: (val) => (val as number) > 10,
    },
    {
      id: 'card_between_1_10',
      nameMs: 'Mencabut nombor antara 1 hingga 10',
      nameEn: 'Drawing a number from 1 to 10',
      favorableCount: 10,
      totalCount: 10,
      favorableListMs: 'Semua kad {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}',
      favorableListEn: 'All cards {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}',
      level: 'pasti',
      checkMatch: (val) => (val as number) >= 1 && (val as number) <= 10,
    },
  ];

  // Get active situations list
  const currentSituations =
    currentTool === 'dice'
      ? diceSituations
      : currentTool === 'coin'
      ? coinSituations
      : currentTool === 'spinner'
      ? spinnerSituations
      : cardSituations;

  const currentSituation =
    currentSituations.find((s) => s.id === selectedSituationId) || currentSituations[0];
  const currentStepMeta =
    LIKELIHOOD_STEPS.find((s) => s.key === currentSituation.level) || LIKELIHOOD_STEPS[2];

  // Dynamic Reason generator based on mathematical counts
  const generateToolReason = (sit: ToolSituation): { ms: string; en: string } => {
    const half = sit.totalCount / 2;
    const halfText = Number.isInteger(half) ? `${half}` : `${half}`;

    if (sit.favorableCount === 0) {
      return {
        ms: `Bilangan kesudahan yang dikehendaki ialah 0 daripada ${sit.totalCount} jumlah kesudahan. Tiada kemungkinan peristiwa ini berlaku, oleh itu kebolehjadiannya adalah MUSTAHIL.`,
        en: `The number of favorable outcomes is 0 out of ${sit.totalCount} total outcomes. There is no possibility of this happening, so the likelihood is IMPOSSIBLE.`,
      };
    }
    if (sit.favorableCount === sit.totalCount) {
      return {
        ms: `Kesemua ${sit.totalCount} kesudahan (${sit.favorableCount}/${sit.totalCount}) menepati peristiwa ini. Peristiwa ini semestinya berlaku tanpa ragu, jadi kebolehjadiannya adalah PASTI.`,
        en: `All ${sit.totalCount} outcomes (${sit.favorableCount}/${sit.totalCount}) satisfy this event. This will definitely occur, so the likelihood is CERTAIN.`,
      };
    }
    if (sit.favorableCount === half) {
      return {
        ms: `Bilangan kesudahan yang dikehendaki (${sit.favorableCount}) adalah TEPAT SEPARUH daripada jumlah ${sit.totalCount} kesudahan. Peluangnya adalah sama banyak (50%), jadi kebolehjadiannya adalah SAMA KEMUNGKINKAN.`,
        en: `The favorable outcomes (${sit.favorableCount}) are EXACTLY HALF of the ${sit.totalCount} total outcomes. The chance is balanced (50%), so the likelihood is EQUALLY LIKELY.`,
      };
    }
    if (sit.favorableCount < half) {
      return {
        ms: `Bilangan kesudahan yang dikehendaki (${sit.favorableCount}) adalah KURANG DARIPADA SEPARUH (${halfText}) daripada ${sit.totalCount} kesudahan. Oleh itu, kebolehjadiannya adalah KECIL KEMUNGKINKAN.`,
        en: `The favorable outcomes (${sit.favorableCount}) are LESS THAN HALF (${halfText}) of the ${sit.totalCount} outcomes. Therefore, the likelihood is UNLIKELY.`,
      };
    }
    return {
      ms: `Bilangan kesudahan yang dikehendaki (${sit.favorableCount}) adalah LEBIH DARIPADA SEPARUH (${halfText}) daripada ${sit.totalCount} kesudahan tetapi bukan semua. Oleh itu, kebolehjadiannya adalah BESAR KEMUNGKINKAN.`,
      en: `The favorable outcomes (${sit.favorableCount}) are MORE THAN HALF (${halfText}) of the ${sit.totalCount} outcomes, but not all. Therefore, the likelihood is LIKELY.`,
    };
  };

  const dynamicReason = generateToolReason(currentSituation);

  // Switch Tool Handler
  const handleSelectTool = (tool: ToolType) => {
    soundEngine.playClick();
    setCurrentTool(tool);
    setTrialsCount(0);
    setSuccessCount(0);
    setLastMatched(null);

    if (tool === 'dice') setSelectedSituationId('dice_even');
    else if (tool === 'coin') setSelectedSituationId('coin_head');
    else if (tool === 'spinner') setSelectedSituationId('spin_yellow');
    else setSelectedSituationId('card_even');
  };

  // Perform "Try It Yourself" Simulation action
  const handleTryYourself = () => {
    if (isSimulating) return;
    setIsSimulating(true);

    if (currentTool === 'dice') {
      soundEngine.playDiceRoll();
      setIsDiceRolling(true);

      const roll = 1 + Math.floor(Math.random() * 6);
      const targetAngles = DICE_FACE_ROTATIONS[roll];

      const extraSpinsX = (2 + Math.floor(Math.random() * 2)) * 360;
      const extraSpinsY = (2 + Math.floor(Math.random() * 2)) * 360;

      const currentModX = ((diceRotX % 360) + 360) % 360;
      const targetModX = ((targetAngles.x % 360) + 360) % 360;
      let diffX = targetModX - currentModX;
      if (diffX <= 0) diffX += 360;

      const currentModY = ((diceRotY % 360) + 360) % 360;
      const targetModY = ((targetAngles.y % 360) + 360) % 360;
      let diffY = targetModY - currentModY;
      if (diffY <= 0) diffY += 360;

      setDiceRotX(diceRotX + diffX + extraSpinsX);
      setDiceRotY(diceRotY + diffY + extraSpinsY);
      setDiceRotZ(diceRotZ + 360);

      setTimeout(() => {
        setDiceResult(roll);
        setIsDiceRolling(false);
        const matched = currentSituation.checkMatch(roll);
        setLastMatched(matched);
        setTrialsCount((c) => c + 1);
        if (matched) {
          setSuccessCount((s) => s + 1);
          soundEngine.playCorrect();
        } else {
          soundEngine.playWrong();
        }
        setIsSimulating(false);
      }, reducedMotion ? 200 : 1100);
    } else if (currentTool === 'coin') {
      soundEngine.playCoinFlip();
      setIsCoinFlipping(true);

      const flip: 'kepala' | 'ekor' = Math.random() > 0.5 ? 'kepala' : 'ekor';
      const targetRem = flip === 'kepala' ? 0 : 180;
      const currentRem = ((coinFlipX % 360) + 360) % 360;
      let diff = targetRem - currentRem;
      if (diff <= 0) diff += 360;
      const fullFlips = (6 + Math.floor(Math.random() * 2)) * 360;
      setCoinFlipX(coinFlipX + diff + fullFlips);

      if (!reducedMotion) {
        setTimeout(() => {
          soundEngine.playCoinLand();
        }, 920);
      }

      setTimeout(() => {
        setCoinResult(flip);
        setIsCoinFlipping(false);
        const matched = currentSituation.checkMatch(flip);
        setLastMatched(matched);
        setTrialsCount((c) => c + 1);
        if (matched) {
          setSuccessCount((s) => s + 1);
          soundEngine.playCorrect();
        } else {
          soundEngine.playWrong();
        }
        setIsSimulating(false);
      }, reducedMotion ? 200 : 1250);
    } else if (currentTool === 'spinner') {
      setIsWheelSpinning(true);
      const n = spinnerSectors.length;
      const s = 360 / n;
      const winningIndex = Math.floor(Math.random() * n);
      const segmentCenter = winningIndex * s + s / 2;

      const targetRemainder = ((-segmentCenter) % 360 + 360) % 360;
      const currentRemainder = ((spinnerAngle % 360) + 360) % 360;
      let forwardDiff = targetRemainder - currentRemainder;
      if (forwardDiff <= 0) {
        forwardDiff += 360;
      }
      const fullSpins = (5 + Math.floor(Math.random() * 2)) * 360;
      const targetAngle = spinnerAngle + forwardDiff + fullSpins;
      setSpinnerAngle(targetAngle);

      if (!reducedMotion) {
        const tickSchedule = [0, 80, 170, 280, 410, 570, 770, 1020, 1340, 1750, 2220];
        tickSchedule.forEach((delay, idx) => {
          setTimeout(() => {
            soundEngine.playSpinnerTick(520 + (tickSchedule.length - idx) * 25);
          }, delay);
        });
      } else {
        soundEngine.playSpinnerTick(700);
      }

      const winningSector = spinnerSectors[winningIndex];
      const resName = lang === 'ms' ? winningSector.nameMs : winningSector.nameEn;

      setTimeout(() => {
        setIsWheelSpinning(false);
        setSpinnerResult(resName);
        const matched = currentSituation.checkMatch(resName);
        setLastMatched(matched);
        setTrialsCount((c) => c + 1);
        if (matched) {
          setSuccessCount((s) => s + 1);
          soundEngine.playCorrect();
        } else {
          soundEngine.playWrong();
        }
        setIsSimulating(false);
      }, reducedMotion ? 300 : 2500);
    } else {
      // Cards 1-10
      soundEngine.playCardFlip();
      setIsCardFlipping(true);
      setTimeout(() => {
        const cardVal = 1 + Math.floor(Math.random() * 10);
        setCardResult(cardVal);
        setIsCardFlipping(false);
        const matched = currentSituation.checkMatch(cardVal);
        setLastMatched(matched);
        setTrialsCount((c) => c + 1);
        if (matched) {
          setSuccessCount((s) => s + 1);
          soundEngine.playCorrect();
        } else {
          soundEngine.playWrong();
        }
        setIsSimulating(false);
      }, reducedMotion ? 200 : 600);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 rounded-3xl p-6 border-2 border-amber-300 shadow-sm">
        <div className="inline-block px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-black tracking-wide mb-2 uppercase">
          DSKP KSSR 8.2 • Pelbagai Alat Kebolehjadian
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t.toolsTitle}
        </h2>
        <p className="text-sm sm:text-base text-slate-700 font-medium mt-1">
          {t.toolsSub}
        </p>

        {/* Tool Selectors Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <button
            type="button"
            onClick={() => handleSelectTool('dice')}
            className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[48px] ${
              currentTool === 'dice'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-400'
                : 'bg-white text-slate-700 border-2 border-amber-200 hover:bg-amber-50'
            }`}
          >
            <span className="text-lg">🎲</span>
            <span>{t.toolDice}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectTool('coin')}
            className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[48px] ${
              currentTool === 'coin'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-400'
                : 'bg-white text-slate-700 border-2 border-amber-200 hover:bg-amber-50'
            }`}
          >
            <span className="text-lg">🪙</span>
            <span>{t.toolCoin}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectTool('spinner')}
            className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[48px] ${
              currentTool === 'spinner'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 ring-2 ring-teal-400'
                : 'bg-white text-slate-700 border-2 border-amber-200 hover:bg-amber-50'
            }`}
          >
            <span className="text-lg">🎯</span>
            <span>{t.toolSpinner}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectTool('cards')}
            className={`py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[48px] ${
              currentTool === 'cards'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400'
                : 'bg-white text-slate-700 border-2 border-amber-200 hover:bg-amber-50'
            }`}
          >
            <span className="text-lg">🃏</span>
            <span>{t.toolCards}</span>
          </button>
        </div>
      </div>

      {/* Main Content: Situations List & Interactive Tool Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 Cols): Situation Selection */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border-3 border-amber-200 shadow-md p-5">
            <h3 className="font-black text-base sm:text-lg text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t.selectSituation}</span>
            </h3>
            <div className="space-y-2">
              {currentSituations.map((sit) => {
                const isSelected = sit.id === currentSituation.id;
                const sitMeta = LIKELIHOOD_STEPS.find((s) => s.key === sit.level);
                const title = lang === 'ms' ? sit.nameMs : sit.nameEn;
                const levelLabel =
                  lang === 'ms' ? sitMeta?.labelMs : sitMeta?.labelEn;

                return (
                  <button
                    key={sit.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedSituationId(sit.id);
                      setTrialsCount(0);
                      setSuccessCount(0);
                      setLastMatched(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer min-h-[48px] flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50 shadow-sm ring-2 ring-amber-300'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                        {title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        {lang === 'ms' ? sit.favorableListMs : sit.favorableListEn}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-black rounded-xl text-white whitespace-nowrap shadow-xs ${
                        sitMeta?.badgeBg || 'bg-slate-700'
                      }`}
                    >
                      {levelLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Visual Tool Demonstration Stage & Reasoning */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interactive Tool Visualizer Container */}
          <div className="bg-white rounded-3xl border-3 border-amber-200 shadow-md p-6 flex flex-col items-center">
            {/* Tool Render Area */}
            <div className="w-full h-56 flex items-center justify-center relative select-none">
              {/* TOOL 1: DADU (3D REALISTIC ROLLING DICE) */}
              {currentTool === 'dice' && (
                <div className="perspective-600 flex flex-col items-center justify-center relative w-full h-full">
                  <div
                    className="relative flex items-center justify-center"
                    style={{
                      animation:
                        isDiceRolling && !reducedMotion
                          ? 'diceBounceTumble 1.1s cubic-bezier(0.2, 0.8, 0.3, 1) forwards'
                          : 'none',
                    }}
                  >
                    {/* 3D Rotating Cube */}
                    <div
                      className="preserve-3d relative w-20 h-20 sm:w-22 sm:h-22"
                      style={{
                        transform: `rotateX(${diceRotX}deg) rotateY(${diceRotY}deg) rotateZ(${diceRotZ}deg)`,
                        transition:
                          isDiceRolling && !reducedMotion
                            ? 'transform 1.1s cubic-bezier(0.2, 0.88, 0.3, 1)'
                            : 'none',
                      }}
                    >
                      {/* Face 1 (Front: Z +44px) - Red single pip */}
                      <div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-200 border-2 border-slate-300 shadow-md flex items-center justify-center p-3 backface-hidden"
                        style={{ transform: 'rotateY(0deg) translateZ(44px)' }}
                      >
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-rose-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]" />
                      </div>
                      {/* Face 6 (Back: Z +44px, rotateY 180deg) - 6 black pips */}
                      <div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-200 border-2 border-slate-300 shadow-md flex items-center justify-center p-2.5 backface-hidden"
                        style={{ transform: 'rotateY(180deg) translateZ(44px)' }}
                      >
                        <div className="w-full h-full grid grid-cols-2 gap-2 p-1">
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" />
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] justify-self-end" />
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" />
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] justify-self-end" />
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" />
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] justify-self-end" />
                        </div>
                      </div>
                      {/* Face 2 (Top: rotateX 90deg, translateZ 44px) - 2 black pips */}
                      <div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-200 border-2 border-slate-300 shadow-md flex items-center justify-center p-2.5 backface-hidden"
                        style={{ transform: 'rotateX(90deg) translateZ(44px)' }}
                      >
                        <div className="w-full h-full flex justify-between p-1">
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] self-start" />
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] self-end" />
                        </div>
                      </div>
                      {/* Face 5 (Bottom: rotateX -90deg, translateZ 44px) - 5 black pips */}
                      <div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-200 border-2 border-slate-300 shadow-md flex items-center justify-center p-2.5 backface-hidden"
                        style={{ transform: 'rotateX(-90deg) translateZ(44px)' }}
                      >
                        <div className="w-full h-full relative p-1">
                          <div className="absolute top-1 left-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" />
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" />
                          <div className="absolute inset-0 m-auto w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" />
                          <div className="absolute bottom-1 left-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" />
                          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" />
                        </div>
                      </div>
                      {/* Face 3 (Right: rotateY 90deg, translateZ 44px) - 3 black pips */}
                      <div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-200 border-2 border-slate-300 shadow-md flex items-center justify-center p-2.5 backface-hidden"
                        style={{ transform: 'rotateY(90deg) translateZ(44px)' }}
                      >
                        <div className="w-full h-full flex justify-between p-1">
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] self-start" />
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] self-center" />
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] self-end" />
                        </div>
                      </div>
                      {/* Face 4 (Left: rotateY -90deg, translateZ 44px) - 4 black pips */}
                      <div
                        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-200 border-2 border-slate-300 shadow-md flex items-center justify-center p-2.5 backface-hidden"
                        style={{ transform: 'rotateY(-90deg) translateZ(44px)' }}
                      >
                        <div className="w-full h-full grid grid-cols-2 gap-3 p-1">
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" />
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] justify-self-end" />
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] self-end" />
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] justify-self-end self-end" />
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Floor Shadow for Dice */}
                  <div
                    className="w-20 h-4 rounded-full bg-slate-900/30 mt-6 blur-xs transition-all pointer-events-none"
                    style={{
                      animation:
                        isDiceRolling && !reducedMotion
                          ? 'diceShadowAnim 1.1s cubic-bezier(0.2, 0.8, 0.3, 1) forwards'
                          : 'none',
                    }}
                  />
                </div>
              )}

              {/* TOOL 2: SYILING (3D REALISTIC COIN TOSS) */}
              {currentTool === 'coin' && (
                <div className="perspective-800 flex flex-col items-center justify-center relative w-full h-full">
                  <div
                    className="relative flex items-center justify-center"
                    style={{
                      animation:
                        isCoinFlipping && !reducedMotion
                          ? 'coinTossArc 1.25s cubic-bezier(0.22, 0.85, 0.35, 1) forwards'
                          : 'none',
                    }}
                  >
                    {/* 3D Flipping Coin Cylinder */}
                    <div
                      className="preserve-3d relative w-24 h-24 sm:w-28 sm:h-28 rounded-full drop-shadow-xl"
                      style={{
                        transform: `rotateX(${coinFlipX}deg)`,
                        transition:
                          isCoinFlipping && !reducedMotion
                            ? 'transform 1.25s cubic-bezier(0.22, 0.85, 0.35, 1)'
                            : 'none',
                      }}
                    >
                      {/* Front Face: KEPALA */}
                      <div
                        className="absolute inset-0 rounded-full border-4 border-amber-600 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 text-amber-950 flex flex-col items-center justify-center p-2 backface-hidden shadow-inner"
                        style={{ transform: 'rotateX(0deg) translateZ(2px)' }}
                      >
                        <div className="absolute inset-1.5 rounded-full border border-dashed border-amber-700/40 pointer-events-none" />
                        <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-amber-900 uppercase">
                          BANK NEGARA
                        </span>
                        <div className="text-2xl sm:text-3xl my-0.5 filter drop-shadow-xs">🌺</div>
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-950">
                          {lang === 'ms' ? 'KEPALA' : 'HEADS'}
                        </span>
                      </div>
                      {/* Back Face: EKOR */}
                      <div
                        className="absolute inset-0 rounded-full border-4 border-slate-400 bg-gradient-to-tr from-slate-300 via-slate-100 to-slate-200 text-slate-800 flex flex-col items-center justify-center p-2 backface-hidden shadow-inner"
                        style={{ transform: 'rotateX(180deg) translateZ(2px)' }}
                      >
                        <div className="absolute inset-1.5 rounded-full border border-dashed border-slate-500/40 pointer-events-none" />
                        <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-slate-600 uppercase">
                          MALAYSIA
                        </span>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight my-0.5">
                          50
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-800">
                          {lang === 'ms' ? 'EKOR' : 'TAILS'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Dynamic Floor Shadow for Coin */}
                  <div
                    className="w-24 h-4 rounded-full bg-slate-900/35 mt-6 blur-xs transition-all pointer-events-none"
                    style={{
                      animation:
                        isCoinFlipping && !reducedMotion
                          ? 'coinShadowAnim 1.25s cubic-bezier(0.22, 0.85, 0.35, 1) forwards'
                          : 'none',
                    }}
                  />
                </div>
              )}

              {/* TOOL 3: PEMUTAR */}
              {currentTool === 'spinner' && (
                <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
                  <svg
                    viewBox="0 0 200 200"
                    style={{
                      transform: `rotate(${spinnerAngle}deg)`,
                      transition: reducedMotion
                        ? 'none'
                        : 'transform 2.4s cubic-bezier(0.12, 0.9, 0.22, 1)',
                    }}
                    className="w-full h-full drop-shadow-md rounded-full"
                  >
                    {spinnerSectors.map((sector, i) => {
                      const s = 360 / spinnerSectors.length;
                      const startDeg = -90 + i * s;
                      const endDeg = -90 + (i + 1) * s;
                      const startRad = (startDeg * Math.PI) / 180;
                      const endRad = (endDeg * Math.PI) / 180;
                      const x1 = 100 + 100 * Math.cos(startRad);
                      const y1 = 100 + 100 * Math.sin(startRad);
                      const x2 = 100 + 100 * Math.cos(endRad);
                      const y2 = 100 + 100 * Math.sin(endRad);

                      return (
                        <path
                          key={i}
                          d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                          fill={sector.color}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                        />
                      );
                    })}
                  </svg>
                  {/* Fixed Center Indicator Needle pointing down at 12 o'clock */}
                  <div
                    className={`absolute top-0.5 left-1/2 -translate-x-1/2 z-20 filter drop-shadow-md pointer-events-none origin-top ${
                      isWheelSpinning && !reducedMotion ? 'animate-needle-tick' : ''
                    }`}
                  >
                    <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[24px] border-t-slate-900" />
                  </div>
                  <div className="absolute w-7 h-7 rounded-full bg-slate-900 border-2 border-white z-20 pointer-events-none shadow-md" />
                </div>
              )}

              {/* TOOL 4: KAD (CARDS 1-10) */}
              {currentTool === 'cards' && (
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      transform: isCardFlipping ? 'scale(0.9) rotate(-12deg)' : 'scale(1) rotate(0deg)',
                      transition: 'transform 0.3s ease',
                    }}
                    className="w-24 h-36 sm:w-28 sm:h-40 bg-white rounded-2xl border-3 border-indigo-400 shadow-xl flex flex-col items-center justify-between p-3"
                  >
                    <span className="text-xs font-black text-indigo-700 self-start">
                      {cardResult}
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-slate-900">
                      {cardResult}
                    </span>
                    <span className="text-xs font-black text-indigo-700 self-end">
                      {cardResult}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* "Cuba Sendiri" Try It Button */}
            <div className="w-full flex flex-col sm:flex-row items-center gap-3 mt-4">
              <button
                type="button"
                disabled={isSimulating}
                onClick={handleTryYourself}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-base shadow-md shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{t.tryYourselfBtn}</span>
              </button>
              {trialsCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setTrialsCount(0);
                    setSuccessCount(0);
                    setLastMatched(null);
                  }}
                  className="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[48px]"
                  title="Reset Cubaan"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Trial Result Live Feedback Banner */}
            {trialsCount > 0 && (
              <div
                className={`w-full mt-4 p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 ${
                  lastMatched
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {lastMatched ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <span className="text-xs sm:text-sm font-extrabold">
                    {lastMatched
                      ? lang === 'ms'
                        ? 'Berjaya! Hasil memenuhi situasi ini.'
                        : 'Success! Outcome satisfies this event.'
                      : lang === 'ms'
                      ? 'Belum lagi: Hasil tidak menepati situasi ini.'
                      : 'Not quite: Outcome did not match.'}
                  </span>
                </div>
                <div className="text-right text-xs font-black">
                  <span>
                    {successCount}/{trialsCount} {lang === 'ms' ? 'kejayaan' : 'successes'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Educational Analysis & Dynamic Reason Card */}
          <div className="bg-white rounded-3xl border-3 border-amber-200 shadow-md p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
                  {t.likelihoodIs}
                </span>
                <h3 className={`text-xl sm:text-2xl font-black ${currentStepMeta.colorText}`}>
                  {lang === 'ms' ? currentStepMeta.labelMs : currentStepMeta.labelEn}
                </h3>
              </div>
              {/* Fraction Badge */}
              <div className="px-3.5 py-1.5 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 text-xs sm:text-sm font-black">
                {currentSituation.favorableCount} / {currentSituation.totalCount} (
                {Math.round(
                  (currentSituation.favorableCount / currentSituation.totalCount) * 100
                )}
                %)
              </div>
            </div>

            {/* Dynamic Pedagogical Reason */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <span className="text-xs font-black text-amber-900 block">
                {t.mathReason}
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
                {lang === 'ms' ? dynamicReason.ms : dynamicReason.en}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
