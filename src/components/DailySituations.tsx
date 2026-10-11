import React, { useState } from 'react';
import { CheckCircle2, XCircle, Filter, RefreshCw } from 'lucide-react';
import { Language, translations, LIKELIHOOD_STEPS } from '../utils/translations';
import { LikelihoodLevel } from '../utils/probability';
import { soundEngine } from '../utils/audio';

interface DailyEvent {
  id: string;
  icon: string;
  titleMs: string;
  titleEn: string;
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

interface DailySituationsProps {
  lang: Language;
}

export const DailySituations: React.FC<DailySituationsProps> = ({ lang }) => {
  const t = translations[lang];
  const [filter, setFilter] = useState<'all' | LikelihoodLevel>('all');

  // Student interaction states per event card
  const [selectedTerms, setSelectedTerms] = useState<Record<string, LikelihoodLevel>>({});
  const [selectedReasonIds, setSelectedReasonIds] = useState<Record<string, string>>({});
  const [confirmedIds, setConfirmedIds] = useState<Record<string, boolean>>({});

  const events: DailyEvent[] = [
    // 1. PASTI
    {
      id: 'sun_rise',
      icon: '☀️',
      titleMs: 'Matahari terbit dari sebelah timur pada esok pagi.',
      titleEn: 'The sun rises in the east tomorrow morning.',
      correctLevel: 'pasti',
      reasonMs: 'Bumi berputar dari barat ke timur secara konsisten mengikut hukum alam fizikal, menjamin matahari terbit setiap pagi tanpa gagal (PASTI).',
      reasonEn: 'The Earth rotates steadily from west to east according to physical natural laws, guaranteeing the sun rises every morning (CERTAIN).',
      reasonChoices: [
        {
          id: 'sun_correct',
          textMs: 'Hukum alam fizik putaran bumi memastikan matahari semestinya terbit setiap pagi.',
          textEn: 'Planetary rotation physics guarantees the sun rises in the east every morning.',
          isCorrect: true,
        },
        {
          id: 'sun_dist1',
          textMs: 'Peluang matahari terbit adalah sama banyak 50-50 dengan kemungkinan ia tidak terbit.',
          textEn: 'The chance of the sun rising is equal 50-50 with it not rising.',
          isCorrect: false,
        },
        {
          id: 'sun_dist2',
          textMs: 'Matahari hanya terbit jika cuaca cerah dan tidak mendung.',
          textEn: 'The sun only rises if the weather is clear without clouds.',
          isCorrect: false,
        },
      ],
    },
    {
      id: 'day_monday',
      icon: '📅',
      titleMs: 'Hari esok selepas hari Ahad ialah hari Isnin.',
      titleEn: 'The day following Sunday is Monday.',
      correctLevel: 'pasti',
      reasonMs: 'Sistem kalendar 7 hari seminggu menetapkan hari Isnin semestinya menyusuli hari Ahad dalam urutan tetap (PASTI).',
      reasonEn: 'The 7-day weekly calendar establishes that Monday strictly follows Sunday in fixed order (CERTAIN).',
      reasonChoices: [
        {
          id: 'day_correct',
          textMs: 'Urutan 7 hari dalam seminggu adalah tetap dan hari Isnin semestinya menyusuli hari Ahad.',
          textEn: 'The order of 7 days in a week is fixed and Monday strictly follows Sunday.',
          isCorrect: true,
        },
        {
          id: 'day_dist1',
          textMs: 'Hari Isnin hanya berlaku jika bulan baru bermula.',
          textEn: 'Monday only occurs if a new month begins.',
          isCorrect: false,
        },
        {
          id: 'day_dist2',
          textMs: 'Ada kemungkinan hari Selasa menyusuli hari Ahad jika cuti am.',
          textEn: 'There is a chance Tuesday follows Sunday on public holidays.',
          isCorrect: false,
        },
      ],
    },
    // 2. BESAR KEMUNGKINAN
    {
      id: 'rain_monsoon',
      icon: '🌧️',
      titleMs: 'Hujan lebat turun pada waktu petang di Malaysia semasa kemuncak musim tengkujuh.',
      titleEn: 'Heavy rain falls in the afternoon in Malaysia during the peak monsoon season.',
      correctLevel: 'besar',
      reasonMs: 'Iklim tropika perolakan dan tiupan angin monsun lembap menyebabkan kebarangkalian hujan melebihi separuh (BESAR KEMUNGKINKAN).',
      reasonEn: 'Tropical convection and humid monsoon winds make the probability of rain greater than half (LIKELY).',
      reasonChoices: [
        {
          id: 'rain_correct',
          textMs: 'Kekerapan hujan pada musim tengkujuh adalah sangat tinggi (melebihi separuh), tetapi masih boleh berlaku hari kering.',
          textEn: 'Rainfall frequency during monsoon is very high (more than half), though dry days can still happen.',
          isCorrect: true,
        },
        {
          id: 'rain_dist1',
          textMs: 'Hujan dijamin 100% turun setiap detik tanpa henti.',
          textEn: 'Rain is guaranteed 100% to fall continuously every second.',
          isCorrect: false,
        },
        {
          id: 'rain_dist2',
          textMs: 'Peluang hujan adalah seimbang 50-50 dengan cuaca panas terik.',
          textEn: 'The chance of rain is strictly balanced 50-50 with clear skies.',
          isCorrect: false,
        },
      ],
    },
    // 3. SAMA KEMUNGKINAN
    {
      id: 'coin_50sen',
      icon: '🪙',
      titleMs: 'Mendapat permukaan Kepala (Bunga Raya) apabila sekeping syiling 50 sen adil dilambung.',
      titleEn: 'Getting Heads (Hibiscus) when tossing a fair 50 sen coin.',
      correctLevel: 'sama',
      reasonMs: 'Syiling mempunyai 2 muka sahaja yang seimbang. Kepala ialah 1 daripada 2 muka (tepat separuh atau 50%), maka kebolehjadiannya SAMA KEMUNGKINKAN.',
      reasonEn: 'A fair coin has only 2 equal faces. Heads is 1 out of 2 (exactly half or 50%), so the likelihood is EQUALLY LIKELY.',
      reasonChoices: [
        {
          id: 'coin_correct',
          textMs: 'Muka Kepala ialah 1 daripada 2 muka seimbang syiling, iaitu tepat separuh (50-50).',
          textEn: 'Heads is 1 of 2 equal coin faces, which is exactly half (50-50).',
          isCorrect: true,
        },
        {
          id: 'coin_dist1',
          textMs: 'Muka Kepala lebih berat jadi ia semestinya terbalik ke bawah.',
          textEn: 'The Heads face is heavier so it is guaranteed to land face down.',
          isCorrect: false,
        },
        {
          id: 'coin_dist2',
          textMs: 'Peluang mendapat Kepala adalah kurang daripada separuh.',
          textEn: 'The chance of getting Heads is less than half.',
          isCorrect: false,
        },
      ],
    },
    {
      id: 'gender_class',
      icon: '👧',
      titleMs: 'Memilih seorang murid perempuan secara rawak daripada kelas yang mempunyai 15 lelaki dan 15 perempuan.',
      titleEn: 'Randomly selecting a girl from a class of 15 boys and 15 girls.',
      correctLevel: 'sama',
      reasonMs: 'Bilangan murid perempuan (15) adalah tepat separuh daripada jumlah 30 murid (15/30 = 50%), jadi kebolehjadiannya SAMA KEMUNGKINKAN.',
      reasonEn: 'The number of girls (15) is exactly half of the total 30 pupils (15/30 = 50%), so the likelihood is EQUALLY LIKELY.',
      reasonChoices: [
        {
          id: 'gender_correct',
          textMs: 'Bilangan murid perempuan (15) adalah tepat separuh daripada jumlah 30 murid (50%).',
          textEn: 'The number of girls (15) is exactly half of the total 30 pupils (50%).',
          isCorrect: true,
        },
        {
          id: 'gender_dist1',
          textMs: 'Murid perempuan sentiasa lebih aktif jadi mereka pasti terpilih.',
          textEn: 'Girls are always more active so they are certain to be picked.',
          isCorrect: false,
        },
        {
          id: 'gender_dist2',
          textMs: 'Bilangan perempuan adalah lebih daripada separuh murid kelas.',
          textEn: 'The number of girls is more than half of the class.',
          isCorrect: false,
        },
      ],
    },
    // 4. KECIL KEMUNGKINAN
    {
      id: 'lucky_draw',
      icon: '🎟️',
      titleMs: 'Memenangi hadiah pertama dalam cabutan bertuah dengan memiliki 1 tiket sahaja daripada 1,000 tiket.',
      titleEn: 'Winning 1st prize in a lucky draw with 1 ticket out of 1,000 tickets.',
      correctLevel: 'kecil',
      reasonMs: 'Bilangan tiket dimiliki (1) adalah jauh kurang daripada separuh (500) daripada 1,000 tiket. Walaupun berpeluang, kebolehjadiannya KECIL KEMUNGKINKAN.',
      reasonEn: 'The ticket count (1) is far less than half (500) of 1,000 tickets. Although possible, the likelihood is UNLIKELY.',
      reasonChoices: [
        {
          id: 'draw_correct',
          textMs: '1 tiket adalah jauh kurang daripada separuh (500) daripada 1,000 tiket keseluruhan.',
          textEn: '1 ticket is far less than half (500) of the 1,000 total tickets.',
          isCorrect: true,
        },
        {
          id: 'draw_dist1',
          textMs: 'Memegang 1 tiket bermakna langsung tiada peluang untuk menang.',
          textEn: 'Holding 1 ticket means there is zero chance to win.',
          isCorrect: false,
        },
        {
          id: 'draw_dist2',
          textMs: 'Peluang menang adalah 50-50 antara menang atau kalah.',
          textEn: 'The chance to win is 50-50 between winning and losing.',
          isCorrect: false,
        },
      ],
    },
    // 5. MUSTAHIL
    {
      id: 'cat_eggs',
      icon: '🐱',
      titleMs: 'Seekor kucing betina melahirkan anak dengan bertelur di dalam sangkarnya.',
      titleEn: 'A female cat reproduces by laying eggs in its cage.',
      correctLevel: 'mustahil',
      reasonMs: 'Kucing ialah mamalia biologi yang melahirkan anak secara hidup, bukan bertelur. Kesudahan peristiwa ini ialah sifar (MUSTAHIL).',
      reasonEn: 'Cats are biological mammals that give live birth, not egg-laying. The outcome count is zero (IMPOSSIBLE).',
      reasonChoices: [
        {
          id: 'cat_correct',
          textMs: 'Kucing ialah mamalia yang melahirkan anak hidup, tiada keupayaan biologi bertelur (0 peluang).',
          textEn: 'Cats are mammals giving live birth, with zero biological capacity to lay eggs (0 chance).',
          isCorrect: true,
        },
        {
          id: 'cat_dist1',
          textMs: 'Kucing bertelur jika ia tinggal di dalam sangkar burung.',
          textEn: 'Cats lay eggs if they live inside a bird cage.',
          isCorrect: false,
        },
        {
          id: 'cat_dist2',
          textMs: 'Kucing bertelur adalah peristiwa kecil kemungkinan pada waktu malam.',
          textEn: 'Cats laying eggs is an unlikely event at night.',
          isCorrect: false,
        },
      ],
    },
    {
      id: 'snow_kl',
      icon: '❄️',
      titleMs: 'Salji tebal turun secara semula jadi di Kuala Lumpur pada tengah hari esok.',
      titleEn: 'Heavy natural snow falls in Kuala Lumpur tomorrow afternoon.',
      correctLevel: 'mustahil',
      reasonMs: 'Kuala Lumpur beriklim panas khatulistiwa dengan suhu purata 32°C. Salji memerlukan suhu bawah takat beku (0°C), jadi ia MUSTAHIL berlaku secara semula jadi.',
      reasonEn: 'Kuala Lumpur is a tropical climate averaging 32°C. Snow requires temperatures below freezing (0°C), making it IMPOSSIBLE naturally.',
      reasonChoices: [
        {
          id: 'snow_correct',
          textMs: 'Suhu khatulistiwa purata 32°C berada jauh di atas takat beku (0°C) yang diperlukan untuk salji.',
          textEn: 'Equatorial temperatures around 32°C are far above the 0°C freezing point needed for snow.',
          isCorrect: true,
        },
        {
          id: 'snow_dist1',
          textMs: 'Salji boleh turun jika angin bertiup kencang dari kutub utara petang esok.',
          textEn: 'Snow can fall if strong winds blow from the North Pole tomorrow afternoon.',
          isCorrect: false,
        },
        {
          id: 'snow_dist2',
          textMs: 'Peluang salji turun di Kuala Lumpur adalah sama banyak dengan hujan air.',
          textEn: 'The chance of snow in Kuala Lumpur is equal to that of rainfall.',
          isCorrect: false,
        },
      ],
    },
  ];

  const filteredEvents = events.filter((ev) => {
    if (filter === 'all') return true;
    return ev.correctLevel === filter;
  });

  const handleSelectTerm = (eventId: string, level: LikelihoodLevel) => {
    soundEngine.playClick();
    setSelectedTerms((prev) => ({ ...prev, [eventId]: level }));
    setConfirmedIds((prev) => ({ ...prev, [eventId]: false }));
  };

  const handleSelectReason = (eventId: string, reasonId: string) => {
    soundEngine.playClick();
    setSelectedReasonIds((prev) => ({ ...prev, [eventId]: reasonId }));
    setConfirmedIds((prev) => ({ ...prev, [eventId]: false }));
  };

  const handleConfirm = (eventId: string) => {
    const term = selectedTerms[eventId];
    const reasonId = selectedReasonIds[eventId];
    if (!term || !reasonId) return;

    soundEngine.playClick();
    setConfirmedIds((prev) => ({ ...prev, [eventId]: true }));

    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;

    const chosenReason = ev.reasonChoices.find((r) => r.id === reasonId);
    const isTermCorrect = term === ev.correctLevel;
    const isReasonCorrect = chosenReason?.isCorrect === true;

    if (isTermCorrect && isReasonCorrect) {
      soundEngine.playCorrect();
    } else {
      soundEngine.playWrong();
    }
  };

  const handleResetCard = (eventId: string) => {
    soundEngine.playClick();
    setSelectedTerms((prev) => {
      const copy = { ...prev };
      delete copy[eventId];
      return copy;
    });
    setSelectedReasonIds((prev) => {
      const copy = { ...prev };
      delete copy[eventId];
      return copy;
    });
    setConfirmedIds((prev) => {
      const copy = { ...prev };
      delete copy[eventId];
      return copy;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-100 via-emerald-100 to-amber-100 rounded-3xl p-6 border-2 border-teal-300 shadow-sm">
        <div className="inline-block px-3 py-1 rounded-full bg-teal-700 text-white text-xs font-black tracking-wide mb-2 uppercase">
          DSKP KSSR 8.2.2 • Aplikasi 5 Istilah & Sebab
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t.dailyTitle}
        </h2>
        <p className="text-sm sm:text-base text-slate-700 font-medium mt-1 max-w-3xl">
          {t.dailySub}
        </p>

        {/* Filter Pills across all 5 official terms */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          <span className="text-xs font-black text-slate-700 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>{lang === 'ms' ? 'Tapis:' : 'Filter:'}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setFilter('all');
            }}
            className={`py-2 px-3.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer min-h-[44px] ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            {t.filterAll} ({events.length})
          </button>
          {LIKELIHOOD_STEPS.map((step) => {
            const count = events.filter((e) => e.correctLevel === step.key).length;
            const isSelected = filter === step.key;
            return (
              <button
                key={step.key}
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setFilter(step.key);
                }}
                className={`py-2 px-3.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer min-h-[44px] ${
                  isSelected
                    ? `${step.badgeBg} text-white shadow-xs`
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                {lang === 'ms' ? step.labelMs : step.labelEn} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((ev) => {
          const selectedTerm = selectedTerms[ev.id];
          const selectedReasonId = selectedReasonIds[ev.id];
          const isConfirmed = confirmedIds[ev.id];
          const chosenReason = ev.reasonChoices.find((r) => r.id === selectedReasonId);
          const isTermCorrect = selectedTerm === ev.correctLevel;
          const isReasonCorrect = chosenReason?.isCorrect === true;
          const isFullyCorrect = isTermCorrect && isReasonCorrect;
          const correctStepMeta = LIKELIHOOD_STEPS.find((s) => s.key === ev.correctLevel);

          return (
            <div
              key={ev.id}
              className="bg-white rounded-3xl border-3 border-slate-200 hover:border-amber-300 shadow-md p-6 flex flex-col justify-between transition-all space-y-4"
            >
              <div>
                {/* Header Icon & Title */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl p-2.5 rounded-2xl bg-amber-50 border border-amber-200 shrink-0 select-none">
                    {ev.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-base sm:text-lg text-slate-900 leading-snug">
                      {lang === 'ms' ? ev.titleMs : ev.titleEn}
                    </h3>
                  </div>
                </div>

                {/* Step 1: Murid Pilih Istilah */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-xs font-black text-slate-800 block">
                    {t.chooseTermPrompt}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {LIKELIHOOD_STEPS.map((step) => {
                      const isPicked = selectedTerm === step.key;
                      return (
                        <button
                          key={step.key}
                          type="button"
                          disabled={isConfirmed}
                          onClick={() => handleSelectTerm(ev.id, step.key)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer min-h-[44px] flex items-center justify-center text-center ${
                            isPicked
                              ? `${step.badgeBg} text-white shadow-xs scale-[1.02]`
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                          } disabled:opacity-85 disabled:cursor-default`}
                        >
                          {lang === 'ms' ? step.labelMs : step.labelEn}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Murid Pilih Sebab */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-xs font-black text-slate-800 block">
                    {t.chooseReasonPrompt}
                  </span>
                  <div className="space-y-2">
                    {ev.reasonChoices.map((choice) => {
                      const isReasonPicked = selectedReasonId === choice.id;
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          disabled={isConfirmed}
                          onClick={() => handleSelectReason(ev.id, choice.id)}
                          className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer min-h-[44px] flex items-start gap-2 ${
                            isReasonPicked
                              ? 'bg-amber-100 border-amber-400 text-amber-950 font-black ring-1 ring-amber-400'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          } disabled:opacity-85 disabled:cursor-default`}
                        >
                          <span className="mt-0.5">
                            {isReasonPicked ? '🔘' : '⚪'}
                          </span>
                          <span className="leading-snug">
                            {lang === 'ms' ? choice.textMs : choice.textEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Confirm Button */}
                {!isConfirmed ? (
                  <button
                    type="button"
                    disabled={!selectedTerm || !selectedReasonId}
                    onClick={() => handleConfirm(ev.id)}
                    className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm min-h-[48px]"
                  >
                    {t.confirmAnswerBtn}
                  </button>
                ) : (
                  /* Confirmed Feedback Box */
                  <div className="space-y-3 p-4 rounded-2xl bg-amber-50/90 border border-amber-300 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                      <div className="flex items-center gap-2">
                        {isFullyCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600" />
                        )}
                        <span className="text-xs font-black">
                          {isFullyCorrect ? t.bothCorrectMsg : isTermCorrect ? t.partialCorrectMsg : t.incorrectMsg}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black text-white ${
                          correctStepMeta?.badgeBg || 'bg-slate-700'
                        }`}
                      >
                        {lang === 'ms' ? correctStepMeta?.labelMs : correctStepMeta?.labelEn}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-black text-amber-900 block mb-0.5">
                        {t.officialReasonLabel}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-amber-200">
                        {lang === 'ms' ? ev.reasonMs : ev.reasonEn}
                      </p>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleResetCard(ev.id)}
                        className="text-xs font-extrabold text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{lang === 'ms' ? 'Cuba Semula' : 'Try Again'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
