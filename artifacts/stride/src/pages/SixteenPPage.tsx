import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAssessment } from '@/context/AssessmentContext';

type Dim = { dim: string; q: string; p: string; m: string };

const QUESTIONS: Dim[] = [
  { dim: 'E/I', q: 'На вечірці ти скоріше ініціюєш нові знайомства, ніж чекаєш', p: 'E', m: 'I' },
  { dim: 'S/N', q: 'Я більше довіряю своїй інтуїції, ніж конкретним фактам',      p: 'N', m: 'S' },
  { dim: 'T/F', q: 'Під час конфлікту я зосереджуюся на логіці, а не на почуттях', p: 'T', m: 'F' },
  { dim: 'J/P', q: 'Мені комфортніше, коли все заплановано заздалегідь',           p: 'J', m: 'P' },
  { dim: 'E/I', q: 'Після важкого дня я заряджаюся від спілкування з друзями',     p: 'E', m: 'I' },
  { dim: 'S/N', q: 'Мене більше цікавлять теоретичні концепції, ніж практичні деталі', p: 'N', m: 'S' },
  { dim: 'T/F', q: 'Я можу приймати складні рішення без емоційного забарвлення',   p: 'T', m: 'F' },
  { dim: 'J/P', q: 'Мені подобається залишати варіанти відкритими, не поспішати з рішенням', p: 'P', m: 'J' },
];

const LBLS = ['Не погоджуюсь', 'Скоріше ні', 'Нейтрально', 'Скоріше так', 'Погоджуюсь'];

export default function SixteenPPage() {
  const [, setLocation] = useLocation();
  const { setP16Score, calculateResult, selectedTests } = useAssessment();
  const [qIdx, setQIdx] = useState(0);
  const [answered, setAnswered] = useState(false);

  const q = QUESTIONS[qIdx];
  const progress = (qIdx / QUESTIONS.length) * 100;

  const pick = (v: number) => {
    const pl = q.p as any;
    const mn = q.m as any;
    setP16Score(pl, v + 1);
    setP16Score(mn, 5 - v);
    setAnswered(true);
    setTimeout(() => {
      const next = qIdx + 1;
      if (next >= QUESTIONS.length) {
        calculateResult();
        setLocation('/synth');
      } else {
        setQIdx(next);
        setAnswered(false);
      }
    }, 260);
  };

  const back = () => {
    if (selectedTests.includes('b5')) setLocation('/assessment/bigfive');
    else setLocation('/assessment/block3');
  };

  return (
    <div className="v2-page" style={{ maxWidth: 840, margin: '0 auto', padding: '28px 16px 64px' }}>
      <div className="v2-progress" style={{ marginBottom: 18 }}>
        <div className="v2-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="v2-eyebrow">01 · УСВІДОМЛЮЙ · 16PERSONALITIES</div>
      <h2 style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>
        Тип особистості
      </h2>

      <div className="v2-callout purple" style={{ marginBottom: 14 }}>
        <div className="v2-callout-title" style={{ color: '#C8FF00' }}>Про 16Personalities</div>
        <div className="v2-callout-body">
          Засновано на теорії MBTI. 4 дихотомії: E/I, S/N, T/F, J/P.{' '}
          <a href="https://www.16personalities.com/free-personality-test" target="_blank" rel="noreferrer" style={{ color: '#C8FF00' }}>16personalities.com</a>
        </div>
      </div>

      <div className="v2-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 9, letterSpacing: '.13em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 100, border: '.5px solid rgba(255,255,255,.07)', color: '#FF7F50' }}>
            16P · {q.dim}
          </span>
          <span style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 10, color: 'rgba(255,255,255,.4)' }}>
            {qIdx + 1} / {QUESTIONS.length}
          </span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.55, marginBottom: 14 }}>{q.q}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {LBLS.map((lbl, i) => (
            <button
              key={i}
              className="v2-opt"
              onClick={() => pick(i)}
              disabled={answered}
            >
              <span className="v2-opt-label">{i + 1}</span>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '.5px solid rgba(255,255,255,.07)' }}>
        <button className="v2-btn-ghost" onClick={back}>← Назад</button>
      </div>
    </div>
  );
}
