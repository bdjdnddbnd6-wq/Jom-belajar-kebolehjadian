import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, Printer, Star } from 'lucide-react';
import { Language, translations, LIKELIHOOD_STEPS } from '../utils/translations';
import { LikelihoodLevel } from '../utils/probability';
import { soundEngine } from '../utils/audio';

interface QuizQuestion {
  id: number;
  questionMs: string;
  questionEn: string;
  correctLevel: LikelihoodLevel;
  reasonMs: string;
  reasonEn: string;
  reasonChoices: {
    id: string;
    textMs: string;
    textEn: string;
    isCorrect: boolean;
  }[];
}

interface QuizSectionProps {
  lang: Language;
  studentName: string;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ lang, studentName }) => {
  const t = translations[lang];

  const questions: QuizQuestion[] = [
    {
      id: 1,
      questionMs: 'Sebuah beg mengandungi 8 biji guli merah dan tiada sebarang guli biru. Apakah kebolehjadian mengambil sebiji guli biru secara rawak?',
      questionEn: 'A bag contains 8 red marbles and no blue marbles at all. What is the likelihood of randomly drawing a blue marble?',
      correctLevel: 'mustahil',
      reasonMs: 'Tiada sebarang guli biru di dalam beg (0 daripada 8 kesudahan), maka peristiwa ini mustahil berlaku.',
      reasonEn: 'There are no blue marbles in the bag (0 out of 8 outcomes), so this event is impossible.',
      reasonChoices: [
        {
          id: 'q1_correct',
          textMs: 'Bilangan guli biru ialah 0 daripada 8 guli (sifar peluang), jadi mustahil berlaku.',
          textEn: 'The blue marble count is 0 out of 8 marbles (zero chance), so it is impossible.',
          isCorrect: true,
        },
        {
          id: 'q1_dist1',
          textMs: 'Peluang mendapat guli biru adalah sedikit kerana warna biru kurang menarik.',
          textEn: 'The chance of getting blue is small because blue is less visible.',
          isCorrect: false,
        },
        {
          id: 'q1_dist2',
          textMs: 'Guli biru adalah sama kemungkinan dengan guli merah.',
          textEn: 'Blue marbles are equally likely with red marbles.',
          isCorrect: false,
        },
      ],
    },
    {
      id: 2,
      questionMs: 'Sebuah balang mengandungi 2 guli merah dan 8 guli biru. Apakah kebolehjadian mengambil sebiji guli merah secara rawak?',
      questionEn: 'A jar contains 2 red marbles and 8 blue marbles. What is the likelihood of randomly drawing a red marble?',
      correctLevel: 'kecil',
      reasonMs: 'Bilangan guli merah (2) adalah kurang daripada separuh (5) daripada 10 guli kesemuanya, jadi kebolehjadiannya kecil kemungkinan.',
      reasonEn: 'The number of red marbles (2) is less than half (5) of the 10 total marbles, so the likelihood is unlikely.',
      reasonChoices: [
        {
          id: 'q2_correct',
          textMs: 'Bilangan guli merah (2) adalah kurang daripada separuh (5) daripada 10 guli kesemuanya.',
          textEn: 'The red marble count (2) is less than half (5) of the 10 total marbles.',
          isCorrect: true,
        },
        {
          id: 'q2_dist1',
          textMs: 'Guli merah tiada langsung di dalam balang.',
          textEn: 'There are no red marbles in the jar at all.',
          isCorrect: false,
        },
        {
          id: 'q2_dist2',
          textMs: 'Bilangan guli merah adalah tepat separuh daripada guli biru.',
          textEn: 'The red marble count is exactly half of the blue marbles.',
          isCorrect: false,
        },
      ],
    },
    {
      id: 3,
      questionMs: 'Sebiji dadu bernombor 1 hingga 6 dilambung sekali. Apakah kebolehjadian mendapat nombor genap {2, 4, 6}?',
      questionEn: 'A standard die numbered 1 to 6 is rolled once. What is the likelihood of getting an even number {2, 4, 6}?',
      correctLevel: 'sama',
      reasonMs: 'Ada 3 nombor genap daripada 6 muka dadu. 3 ialah tepat separuh (50%), jadi kebolehjadiannya sama kemungkinan.',
      reasonEn: 'There are 3 even numbers out of 6 faces. 3 is exactly half (50%), so the likelihood is equally likely.',
      reasonChoices: [
        {
          id: 'q3_correct',
          textMs: 'Bilangan nombor genap (3) adalah tepat separuh daripada 6 muka dadu (3/6 = 50%).',
          textEn: 'The count of even numbers (3) is exactly half of the 6 faces (3/6 = 50%).',
          isCorrect: true,
        },
        {
          id: 'q3_dist1',
          textMs: 'Nombor genap lebih kerap muncul daripada nombor ganjil.',
          textEn: 'Even numbers appear more frequently than odd numbers.',
          isCorrect: false,
        },
        {
          id: 'q3_dist2',
          textMs: 'Semua 6 muka dadu adalah nombor genap.',
          textEn: 'All 6 faces of the die are even numbers.',
          isCorrect: false,
        },
      ],
    },
    {
      id: 4,
      questionMs: 'Daripada 10 keping kad bernombor 1 hingga 10, sekeping kad dicabut. Apakah kebolehjadian mendapat kad nombor 1 digit (nombor 1 hingga 9)?',
      questionEn: 'From 10 cards numbered 1 to 10, one card is drawn. What is the likelihood of drawing a single-digit card (numbers 1 to 9)?',
      correctLevel: 'besar',
      reasonMs: 'Ada 9 kad 1 digit daripada 10 kad kesemuanya (9/10). Bilangan 9 adalah lebih daripada separuh (5) tetapi bukan semua, jadi kebolehjadiannya besar kemungkinan.',
      reasonEn: 'There are 9 single-digit cards out of 10 total (9/10). 9 is more than half (5) but not all, so the likelihood is likely.',
      reasonChoices: [
        {
          id: 'q4_correct',
          textMs: 'Bilangan kad 1 digit (9) adalah lebih daripada separuh (5) tetapi bukan semua daripada 10 kad.',
          textEn: 'The single-digit card count (9) is more than half (5) but not all of the 10 cards.',
          isCorrect: true,
        },
        {
          id: 'q4_dist1',
          textMs: 'Kad 1 digit adalah semestinya tercabut tanpa ragu (100%).',
          textEn: 'A single-digit card is guaranteed to be drawn without doubt (100%).',
          isCorrect: false,
        },
        {
          id: 'q4_dist2',
          textMs: 'Peluang mencabut kad 1 digit adalah tepat 50-50.',
          textEn: 'The chance of drawing a 1-digit card is exactly 50-50.',
          isCorrect: false,
        },
      ],
    },
    {
      id: 5,
      questionMs: 'Sebiji dadu standard (1 hingga 6) dilambung. Apakah kebolehjadian mendapat sebarang nombor yang kurang daripada 7?',
      questionEn: 'A standard die (1 to 6) is rolled. What is the likelihood of getting any number less than 7?',
      correctLevel: 'pasti',
      reasonMs: 'Kesemua 6 muka dadu (1, 2, 3, 4, 5, 6) adalah kurang daripada 7 (6 daripada 6 kesudahan). Oleh itu ia semestinya berlaku (PASTI).',
      reasonEn: 'All 6 faces of the die (1, 2, 3, 4, 5, 6) are less than 7 (6 out of 6 outcomes). Therefore it is guaranteed to occur (CERTAIN).',
      reasonChoices: [
        {
          id: 'q5_correct',
          textMs: 'Kesemua 6 muka dadu (1, 2, 3, 4, 5, 6) adalah kurang daripada 7 (6/6 = 100%), jadi pasti berlaku.',
          textEn: 'All 6 faces (1, 2, 3, 4, 5, 6) are less than 7 (6/6 = 100%), so it is certain.',
          isCorrect: true,
        },
        {
          id: 'q5_dist1',
          textMs: 'Hanya separuh daripada nombor dadu yang kurang daripada 7.',
          textEn: 'Only half of the die numbers are less than 7.',
          isCorrect: false,
        },
        {
          id: 'q5_dist2',
          textMs: 'Dadu mempunyai nombor 7 dan 8 jadi ia kecil kemungkinan.',
          textEn: 'The die contains 7 and 8 so it is unlikely.',
          isCorrect: false,
        },
      ],
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTerm, setSelectedTerm] = useState<LikelihoodLevel | null>(null);
  const [selectedReasonId, setSelectedReasonId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelectTerm = (lvl: LikelihoodLevel) => {
    if (isAnswered) return;
    soundEngine.playClick();
    setSelectedTerm(lvl);
  };

  const handleSelectReason = (reasonId: string) => {
    if (isAnswered) return;
    soundEngine.playClick();
    setSelectedReasonId(reasonId);
  };

  const handleConfirmAnswer = () => {
    if (!selectedTerm || !selectedReasonId || isAnswered) return;
    soundEngine.playClick();
    setIsAnswered(true);

    const isTermRight = selectedTerm === currentQ.correctLevel;
    const chosen = currentQ.reasonChoices.find((r) => r.id === selectedReasonId);
    const isReasonRight = chosen?.isCorrect === true;

    if (isTermRight && isReasonRight) {
      setScore((s) => s + 1);
      soundEngine.playCorrect();
    } else {
      soundEngine.playWrong();
    }
  };

  const handleNext = () => {
    soundEngine.playClick();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedTerm(null);
      setSelectedReasonId(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
      soundEngine.playFanfare();
    }
  };

  const handleRestart = () => {
    soundEngine.playClick();
    setCurrentIndex(0);
    setSelectedTerm(null);
    setSelectedReasonId(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const chosenReasonObj = currentQ.reasonChoices.find((r) => r.id === selectedReasonId);
  const isTermRight = selectedTerm === currentQ.correctLevel;
  const isReasonRight = chosenReasonObj?.isCorrect === true;
  const isFullyRight = isTermRight && isReasonRight;
  const correctStepMeta = LIKELIHOOD_STEPS.find((s) => s.key === currentQ.correctLevel);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-100 via-pink-100 to-amber-100 rounded-3xl p-6 border-2 border-rose-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-block px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black tracking-wide mb-2 uppercase">
            DSKP 8.2.2 • Latihan Format Penuh
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.quizTitle}
          </h2>
          <p className="text-sm text-slate-700 font-medium mt-1">{t.quizSub}</p>
        </div>

        {/* Live Score Pill */}
        <div className="bg-white/95 px-4 py-2.5 rounded-2xl border-2 border-rose-300 shadow-xs flex items-center gap-3 self-start sm:self-auto">
          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase block">
              {t.scoreLabel}
            </span>
            <span className="text-lg font-black text-slate-900">
              {score} / {questions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Quiz Body or Completion Certificate */}
      {!isCompleted ? (
        <div className="bg-white rounded-3xl border-3 border-amber-200 shadow-md p-6 sm:p-8 space-y-6">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-black text-slate-600">
              <span>
                {t.questionNum} {currentIndex + 1} daripada {questions.length}
              </span>
              <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {lang === 'ms' ? currentQ.questionMs : currentQ.questionEn}
            </h3>
          </div>

          {/* Step 1: Murid Pilih Istilah */}
          <div className="space-y-2">
            <span className="text-xs sm:text-sm font-black text-slate-900 block">
              {t.stepTermLabel}:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {LIKELIHOOD_STEPS.map((step) => {
                const isPicked = selectedTerm === step.key;
                const isTarget = currentQ.correctLevel === step.key;

                let btnClass = 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200';
                if (isAnswered) {
                  if (isTarget) {
                    btnClass = `${step.badgeBg} text-white font-black ring-2 ring-emerald-400`;
                  } else if (isPicked && !isTarget) {
                    btnClass = 'bg-rose-100 border-rose-400 text-rose-900 font-bold';
                  } else {
                    btnClass = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isPicked) {
                  btnClass = `${step.badgeBg} text-white font-black shadow-md scale-[1.02]`;
                }

                return (
                  <button
                    key={step.key}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectTerm(step.key)}
                    className={`py-3 px-2 rounded-2xl border-2 text-xs font-black transition-all cursor-pointer min-h-[48px] flex items-center justify-center text-center ${btnClass} disabled:cursor-default`}
                  >
                    {lang === 'ms' ? step.labelMs : step.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Murid Pilih Sebab yang Munasabah */}
          <div className="space-y-2">
            <span className="text-xs sm:text-sm font-black text-slate-900 block">
              {t.stepReasonLabel}:
            </span>
            <div className="space-y-2">
              {currentQ.reasonChoices.map((choice) => {
                const isPicked = selectedReasonId === choice.id;
                let choiceClass = 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-800';

                if (isAnswered) {
                  if (choice.isCorrect) {
                    choiceClass = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-black';
                  } else if (isPicked && !choice.isCorrect) {
                    choiceClass = 'bg-rose-100 border-rose-400 text-rose-950 font-bold';
                  } else {
                    choiceClass = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isPicked) {
                  choiceClass = 'bg-amber-100 border-amber-400 text-amber-950 font-black ring-2 ring-amber-400';
                }

                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectReason(choice.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border-2 text-xs sm:text-sm transition-all cursor-pointer min-h-[50px] flex items-start gap-2.5 ${choiceClass} disabled:cursor-default`}
                  >
                    <span className="mt-0.5">{isPicked ? '🔘' : '⚪'}</span>
                    <span className="leading-snug">
                      {lang === 'ms' ? choice.textMs : choice.textEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action: Confirm Answer or Next Question */}
          {!isAnswered ? (
            <button
              type="button"
              disabled={!selectedTerm || !selectedReasonId}
              onClick={handleConfirmAnswer}
              className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-sm sm:text-base tracking-wide shadow-md shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[52px]"
            >
              {t.confirmAnswerBtn}
            </button>
          ) : (
            /* Answer Feedback & Reason */
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <div className="flex items-center gap-2">
                  {isFullyRight ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                  <span className="text-xs sm:text-sm font-black text-slate-900">
                    {isFullyRight ? t.bothCorrectMsg : isTermRight ? t.partialCorrectMsg : t.incorrectMsg}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black text-white ${
                    correctStepMeta?.badgeBg || 'bg-slate-700'
                  }`}
                >
                  {lang === 'ms' ? correctStepMeta?.labelMs : correctStepMeta?.labelEn}
                </span>
              </div>
              <div>
                <span className="text-xs font-black text-amber-900 block mb-1">
                  {t.officialReasonLabel}
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-amber-200">
                  {lang === 'ms' ? currentQ.reasonMs : currentQ.reasonEn}
                </p>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-black text-sm tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
              >
                <span>{t.nextQuestion}</span>
                <span>➡️</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Sijil Kejayaan (Certificate) */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border-8 border-amber-400 shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden print:m-0 print:border-4">
            <div className="inline-flex p-3 rounded-2xl bg-amber-100 text-amber-800 mb-3 shadow-inner">
              <Award className="w-12 h-12" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-amber-900 tracking-wider font-serif uppercase mb-2">
              {t.certTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-bold uppercase tracking-widest mb-6">
              KEMENTERIAN PENDIDIKAN MALAYSIA • DSKP KSSR SEMAKAN 2017
            </p>

            <div className="my-6 py-4 border-y-2 border-dashed border-amber-300 max-w-lg mx-auto">
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                {t.certPresented}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 underline decoration-amber-400 decoration-wavy">
                {studentName || 'Murid Tahun 6'}
              </h3>
            </div>

            <p className="text-sm sm:text-base text-slate-700 font-semibold max-w-xl mx-auto mb-6">
              {t.certDesc}
            </p>

            {/* Score & Stars */}
            <div className="inline-flex flex-col items-center gap-1.5 p-4 rounded-2xl bg-amber-50 border border-amber-300 mb-6">
              <div className="flex gap-1 text-amber-500">
                <Star className="w-6 h-6 fill-amber-500" />
                <Star className="w-6 h-6 fill-amber-500" />
                <Star className="w-6 h-6 fill-amber-500" />
              </div>
              <span className="font-black text-lg text-slate-900">
                {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
              </span>
              <span className="text-xs font-bold text-emerald-700">
                {score >= 4 ? t.excellentWork : t.goodTry}
              </span>
            </div>

            {/* Print & Restart buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm flex items-center gap-2 cursor-pointer transition-all shadow-md min-h-[48px]"
              >
                <Printer className="w-4 h-4" />
                <span>{t.printCert}</span>
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="py-3.5 px-6 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-sm flex items-center gap-2 cursor-pointer transition-all border border-amber-300 min-h-[48px]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.restartQuiz}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
