import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { PROFS } from '@/data/profiles';

export type SelectedTest = 'stride' | 'b5' | '16p';
export type ProfItem = typeof PROFS[number];

export type StrideRawAnswers = {
  [key: number]: string;
  abs?: number;
};

export type BigFiveScores = {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
};

export type P16Scores = {
  E: number; I: number;
  S: number; N: number;
  T: number; F: number;
  J: number; P: number;
};

export type ResultData = {
  profile: string;
  cogPct: number;
  enPct: number;
  adPct: number;
};

interface AssessmentContextType {
  selectedTests: SelectedTest[];
  setSelectedTests: (tests: SelectedTest[]) => void;

  strideAnswers: StrideRawAnswers;
  setStrideAnswer: (qIdx: number | 'abs', value: string | number) => void;
  absValue: number;
  setAbsValue: (v: number) => void;

  bigFiveScores: BigFiveScores;
  setBigFiveScore: (trait: keyof BigFiveScores, value: number) => void;
  bigFiveType: string;

  p16Scores: P16Scores;
  setP16Score: (letter: keyof P16Scores, value: number) => void;
  p16Type: string;

  aiTexts: Record<string, string>;
  setAiText: (key: string, text: string) => void;

  duration: number;
  setDuration: (v: number) => void;
  frequency: number;
  setFrequency: (v: number) => void;

  result: ResultData | null;
  calculateResult: () => void;
  resetAssessment: () => void;

  selectedProf: ProfItem | null;
  setSelectedProf: (p: ProfItem | null) => void;
  matchPct: number;
  setMatchPct: (v: number) => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

const DEFAULT_B5: BigFiveScores = { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 };
const DEFAULT_P16: P16Scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [selectedTests, setSelectedTests] = useState<SelectedTest[]>(['stride']);
  const [strideAnswers, setStrideAnswers] = useState<StrideRawAnswers>({});
  const [absValue, setAbsValue] = useState(5);
  const [bigFiveScores, setBigFiveScores] = useState<BigFiveScores>({ ...DEFAULT_B5 });
  const [bigFiveType, setBigFiveType] = useState('');
  const [p16Scores, setP16Scores] = useState<P16Scores>({ ...DEFAULT_P16 });
  const [p16Type, setP16Type] = useState('');
  const [aiTexts, setAiTexts] = useState<Record<string, string>>({});
  const [duration, setDuration] = useState(3);
  const [frequency, setFrequency] = useState(2);
  const [result, setResult] = useState<ResultData | null>(null);
  const [selectedProf, setSelectedProf] = useState<ProfItem | null>(null);
  const [matchPct, setMatchPct] = useState(0);

  const setStrideAnswer = useCallback((qIdx: number | 'abs', value: string | number) => {
    if (qIdx === 'abs') {
      setAbsValue(value as number);
      setStrideAnswers(prev => ({ ...prev, abs: value as number }));
    } else {
      setStrideAnswers(prev => ({ ...prev, [qIdx]: value as string }));
    }
  }, []);

  const setBigFiveScore = useCallback((trait: keyof BigFiveScores, value: number) => {
    setBigFiveScores(prev => ({ ...prev, [trait]: value }));
  }, []);

  const setP16Score = useCallback((letter: keyof P16Scores, value: number) => {
    setP16Scores(prev => ({ ...prev, [letter]: prev[letter] + value }));
  }, []);

  const setAiText = useCallback((key: string, text: string) => {
    setAiTexts(prev => ({ ...prev, [key]: text }));
  }, []);

  const calculateResult = useCallback(() => {
    const s = strideAnswers;
    const abs = absValue;

    let c = 0, e = 0, ad = 0;
    if (s[0] === 'synthesis') c += 3; else if (s[0] === 'analysis') c += 2; else c += 1;
    if (s[1] === 'deep') c += 2; else if (s[1] === 'mixed') c += 1;
    c += Math.round((abs / 10) * 3);

    if (s[3] === 'intel') e += 3; else if (s[3] === 'result') e += 2; else e += 1;
    if (s[4] === 'bored') e += 2; else if (s[4] === 'physical') e += 1;
    if (s[5] === 'flow') e += 2; else if (s[5] === 'multi') e += 1;

    if (s[6] === 'assertive') ad += 3; else if (s[6] === 'turbulent') ad += 2; else ad += 1;
    if (s[7] === 'free') ad += 2; else if (s[7] === 'coord') ad += 1;

    const cogPct = Math.round(c / 8 * 100);
    const enPct  = Math.round(e / 6 * 100);
    const adPct  = Math.round(ad / 5 * 100);

    let profile: string;
    if (cogPct > 75 && adPct > 68) profile = 'Системний Архітектор';
    else if (cogPct > 70 && enPct > 70) profile = 'Синтетичний Дослідник';
    else if (adPct < 50) profile = 'Глибинний Спеціаліст';
    else profile = 'Адаптивний Стратег';

    const op = bigFiveScores.openness, co = bigFiveScores.conscientiousness, ex = bigFiveScores.extraversion;
    let b5t = '';
    if (op > 72 && co > 68) b5t = 'Відкритий Організатор';
    else if (op > 75) b5t = 'Творчий Дослідник';
    else if (co > 75) b5t = 'Точний Виконавець';
    else if (ex > 65) b5t = 'Соціальний Провідник';
    else b5t = 'Аналітичний Інтроверт';
    setBigFiveType(b5t);

    const p16t = [
      p16Scores.E > p16Scores.I ? 'E' : 'I',
      p16Scores.N > p16Scores.S ? 'N' : 'S',
      p16Scores.T > p16Scores.F ? 'T' : 'F',
      p16Scores.J > p16Scores.P ? 'J' : 'P',
    ].join('');
    setP16Type(p16t);

    setResult({ profile, cogPct, enPct, adPct });
  }, [strideAnswers, absValue, bigFiveScores, p16Scores]);

  const resetAssessment = useCallback(() => {
    setSelectedTests(['stride']);
    setStrideAnswers({});
    setAbsValue(5);
    setBigFiveScores({ ...DEFAULT_B5 });
    setBigFiveType('');
    setP16Scores({ ...DEFAULT_P16 });
    setP16Type('');
    setAiTexts({});
    setDuration(3);
    setFrequency(2);
    setResult(null);
    setSelectedProf(null);
    setMatchPct(0);
  }, []);

  return (
    <AssessmentContext.Provider value={{
      selectedTests, setSelectedTests,
      strideAnswers, setStrideAnswer,
      absValue, setAbsValue,
      bigFiveScores, setBigFiveScore,
      bigFiveType,
      p16Scores, setP16Score,
      p16Type,
      aiTexts, setAiText,
      duration, setDuration,
      frequency, setFrequency,
      result, calculateResult, resetAssessment,
      selectedProf, setSelectedProf,
      matchPct, setMatchPct,
    }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error('useAssessment must be used within AssessmentProvider');
  return ctx;
}
