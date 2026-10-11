/**
 * KSSR Semakan 2017 Tahun 6 Matematik
 * Standard Kandungan 8.2 Kebolehjadian (Standard Pembelajaran 8.2.2 SAHAJA)
 * Pure mathematical calculation engine for dynamic educational explanations.
 */

export type LikelihoodLevel = 'mustahil' | 'kecil' | 'sama' | 'besar' | 'pasti';

export interface LikelihoodResult {
  level: LikelihoodLevel;
  stepIndex: number; // 1 to 5
  favorable: number;
  total: number;
  fractionText: string;
  percentageText: string;
  colorNameMs: string;
  colorNameEn: string;
  reasonMs: string;
  reasonEn: string;
  shortReasonMs: string;
  shortReasonEn: string;
}

export function getLikelihoodFromCount(
  favorable: number,
  total: number,
  targetLabelMs = 'guli merah',
  targetLabelEn = 'red marble',
  otherCount = 0,
  otherLabelMs = 'guli biru',
  otherLabelEn = 'blue marble'
): LikelihoodResult {
  const safeTotal = Math.max(1, total);
  const safeFavorable = Math.max(0, Math.min(favorable, safeTotal));
  const half = safeTotal / 2;

  let level: LikelihoodLevel = 'sama';
  let stepIndex = 3;

  if (safeFavorable === 0) {
    level = 'mustahil';
    stepIndex = 1;
  } else if (safeFavorable === safeTotal) {
    level = 'pasti';
    stepIndex = 5;
  } else if (safeFavorable === half) {
    level = 'sama';
    stepIndex = 3;
  } else if (safeFavorable < half) {
    level = 'kecil';
    stepIndex = 2;
  } else {
    // safeFavorable > half && safeFavorable < safeTotal
    level = 'besar';
    stepIndex = 4;
  }

  const percentage = Math.round((safeFavorable / safeTotal) * 100);
  const fractionText = `${safeFavorable}/${safeTotal}`;
  const percentageText = `${percentage}%`;

  let reasonMs = '';
  let reasonEn = '';
  let shortReasonMs = '';
  let shortReasonEn = '';

  const halfDisplay = Number.isInteger(half) ? `${half}` : `${half}`;

  switch (level) {
    case 'mustahil':
      reasonMs = `Tiada ${targetLabelMs} langsung di dalam bekas (0 daripada ${safeTotal}). Oleh itu, kebolehjadian mengambil ${targetLabelMs} adalah MUSTAHIL.`;
      reasonEn = `There are no ${targetLabelEn}s in the container (0 out of ${safeTotal}). Therefore, the likelihood of drawing a ${targetLabelEn} is IMPOSSIBLE.`;
      shortReasonMs = `Bilangan adalah 0 daripada ${safeTotal}, jadi mustahil.`;
      shortReasonEn = `Count is 0 out of ${safeTotal}, so it is impossible.`;
      break;
    case 'kecil':
      reasonMs = `Ada ${safeFavorable} ${targetLabelMs} daripada ${safeTotal} kesemuanya. Bilangan ${targetLabelMs} (${safeFavorable}) adalah KURANG DARIPADA SEPARUH (${halfDisplay}), jadi kebolehjadiannya adalah KECIL KEMUNGKINKAN.`;
      reasonEn = `There are ${safeFavorable} ${targetLabelEn}s out of ${safeTotal} in total. The count (${safeFavorable}) is LESS THAN HALF (${halfDisplay}), so the likelihood is UNLIKELY.`;
      shortReasonMs = `${safeFavorable} daripada ${safeTotal} adalah kurang daripada separuh.`;
      shortReasonEn = `${safeFavorable} out of ${safeTotal} is less than half.`;
      break;
    case 'sama':
      reasonMs = `Ada ${safeFavorable} ${targetLabelMs} dan ${otherCount} ${otherLabelMs} daripada ${safeTotal} kesemuanya. Bilangannya adalah TEPAT SEPARUH (${halfDisplay}), jadi kebolehjadiannya adalah SAMA KEMUNGKINKAN.`;
      reasonEn = `There are ${safeFavorable} ${targetLabelEn}s and ${otherCount} ${otherLabelEn}s out of ${safeTotal}. The count is EXACTLY HALF (${halfDisplay}), so the likelihood is EQUALLY LIKELY.`;
      shortReasonMs = `${safeFavorable} daripada ${safeTotal} adalah tepat separuh (sama banyak).`;
      shortReasonEn = `${safeFavorable} out of ${safeTotal} is exactly half (equal share).`;
      break;
    case 'besar':
      reasonMs = `Ada ${safeFavorable} ${targetLabelMs} daripada ${safeTotal} kesemuanya. Bilangan ${targetLabelMs} (${safeFavorable}) adalah LEBIH DARIPADA SEPARUH (${halfDisplay}) tetapi bukan semua, jadi kebolehjadiannya adalah BESAR KEMUNGKINKAN.`;
      reasonEn = `There are ${safeFavorable} ${targetLabelEn}s out of ${safeTotal} in total. The count (${safeFavorable}) is MORE THAN HALF (${halfDisplay}) but not all, so the likelihood is LIKELY.`;
      shortReasonMs = `${safeFavorable} daripada ${safeTotal} adalah lebih daripada separuh.`;
      shortReasonEn = `${safeFavorable} out of ${safeTotal} is more than half.`;
      break;
    case 'pasti':
      reasonMs = `Kesemua ${safeTotal} guli di dalam bekas adalah ${targetLabelMs} (${safeFavorable} daripada ${safeTotal}). Oleh itu, mengambil ${targetLabelMs} adalah SEMESTINYA BERLAKU dan kebolehjadiannya adalah PASTI.`;
      reasonEn = `All ${safeTotal} marbles in the container are ${targetLabelEn}s (${safeFavorable} out of ${safeTotal}). Therefore, drawing a ${targetLabelEn} is GUARANTEED and the likelihood is CERTAIN.`;
      shortReasonMs = `Kesemua ${safeTotal} guli adalah ${targetLabelMs}, jadi pasti berlaku.`;
      shortReasonEn = `All ${safeTotal} are ${targetLabelEn}s, so it is certain.`;
      break;
  }

  return {
    level,
    stepIndex,
    favorable: safeFavorable,
    total: safeTotal,
    fractionText,
    percentageText,
    colorNameMs: targetLabelMs,
    colorNameEn: targetLabelEn,
    reasonMs,
    reasonEn,
    shortReasonMs,
    shortReasonEn,
  };
}

/**
 * Generate 1 correct reason and 2 to 3 plausible distractors for any likelihood level
 */
export function getReasonOptions(
  level: LikelihoodLevel,
  favorable: number,
  total: number,
  labelMs: string,
  labelEn: string
): { id: string; textMs: string; textEn: string; isCorrect: boolean }[] {
  const half = total / 2;
  const halfText = Number.isInteger(half) ? `${half}` : `${half}`;

  const correctReasons: Record<LikelihoodLevel, { ms: string; en: string }> = {
    mustahil: {
      ms: `Bilangan ${labelMs} ialah 0 daripada ${total}, jadi tiada peluang berlaku (Mustahil).`,
      en: `The count of ${labelEn} is 0 out of ${total}, so there is zero chance (Impossible).`,
    },
    kecil: {
      ms: `Bilangan ${labelMs} (${favorable}) adalah kurang daripada separuh (${halfText}) daripada ${total} jumlah kesudahan (Kecil kemungkinan).`,
      en: `The count of ${labelEn} (${favorable}) is less than half (${halfText}) of the ${total} total outcomes (Unlikely).`,
    },
    sama: {
      ms: `Bilangan ${labelMs} (${favorable}) adalah tepat separuh (${halfText}) daripada ${total} jumlah kesudahan (Sama kemungkinan).`,
      en: `The count of ${labelEn} (${favorable}) is exactly half (${halfText}) of the ${total} total outcomes (Equally likely).`,
    },
    besar: {
      ms: `Bilangan ${labelMs} (${favorable}) adalah lebih daripada separuh (${halfText}) tetapi bukan semua daripada ${total} kesudahan (Besar kemungkinan).`,
      en: `The count of ${labelEn} (${favorable}) is more than half (${halfText}) but not all of the ${total} outcomes (Likely).`,
    },
    pasti: {
      ms: `Kesemua ${total} kesudahan adalah ${labelMs} (${favorable}/${total}), jadi ia semestinya berlaku (Pasti).`,
      en: `All ${total} outcomes are ${labelEn} (${favorable}/${total}), so it is guaranteed to happen (Certain).`,
    },
  };

  const distractors: { ms: string; en: string }[] = [];

  if (level !== 'sama') {
    distractors.push({
      ms: `Bilangan ${labelMs} adalah seimbang 50-50 dengan kesudahan lain.`,
      en: `The count of ${labelEn} is balanced 50-50 with other outcomes.`,
    });
  }
  if (level !== 'mustahil') {
    distractors.push({
      ms: `Tiada sebarang ${labelMs} langsung dalam keseluruhan kesudahan.`,
      en: `There are zero ${labelEn}s in the entire set of outcomes.`,
    });
  }
  if (level !== 'pasti') {
    distractors.push({
      ms: `Kesemua pilihan tanpa kecuali adalah ${labelMs}.`,
      en: `All choices without exception are ${labelEn}.`,
    });
  }
  if (level !== 'kecil' && level !== 'besar') {
    distractors.push({
      ms: `Bilangan ${labelMs} adalah lebih sedikit daripada kesudahan lain.`,
      en: `The count of ${labelEn} is slightly fewer than other outcomes.`,
    });
  }

  const options = [
    {
      id: 'correct',
      textMs: correctReasons[level].ms,
      textEn: correctReasons[level].en,
      isCorrect: true,
    },
    ...distractors.slice(0, 2).map((d, i) => ({
      id: `distractor-${i}`,
      textMs: d.ms,
      textEn: d.en,
      isCorrect: false,
    })),
  ];

  // Return options deterministic shuffled order
  return options.sort(() => (level === 'sama' ? 0.3 : -0.2));
}
