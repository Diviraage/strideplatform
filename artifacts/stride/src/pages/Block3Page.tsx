import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAssessment } from '@/context/AssessmentContext';

const QUESTIONS = [
  {
    idx: 6,
    block: 'Адаптивність',
    q: 'Ти витратив місяць на теорію й знайшов критичну помилку. Твоя реакція?',
    opts: [
      { v: 'assertive', t: 'Спокійно проаналізую — помилка дає нове розуміння. Почну заново.' },
      { v: 'turbulent', t: 'Відчую сильне розчарування, зроблю довгу паузу.' },
      { v: 'avoid',     t: 'Спробую «підігнати» дані, щоб не переробляти.' },
    ],
  },
  {
    idx: 7,
    block: 'Адаптивність',
    q: 'Тобі дали завдання без інструкцій, термінів і критеріїв. Твій стан?',
    opts: [
      { v: 'free',  t: 'Чудово — сам вирішу, як зробити найкраще' },
      { v: 'coord', t: 'Трохи дратує — потрібні хоча б базові координати' },
      { v: 'stuck', t: 'Не можу почати без розуміння критеріїв успіху' },
    ],
  },
];

export default function Block3Page() {
  const [, setLocation] = useLocation();
  const { strideAnswers, setStrideAnswer, calculateResult, selectedTests } = useAssessment();
  const [qIdx, setQIdx] = useState(0);

  const q = QUESTIONS[qIdx];
  const selected = strideAnswers[q.idx];
  const progress = (qIdx / QUESTIONS.length) * 100;
  const isLast = qIdx === QUESTIONS.length - 1;

  const next = () => {
    if (!isLast) {
      setQIdx(qIdx + 1);
    } else {
      calculateResult();
      if (selectedTests.includes('b5')) setLocation('/assessment/bigfive');
      else if (selectedTests.includes('16p')) setLocation('/assessment/16p');
      else setLocation('/synth');
    }
  };

  const back = () => {
    if (qIdx > 0) setQIdx(qIdx - 1);
    else setLocation('/assessment/block2');
  };

  return (
    <div className="v2-page" style={{ maxWidth: 840, margin: '0 auto', padding: '28px 16px 64px' }}>
      <div className="v2-progress" style={{ marginBottom: 18 }}>
        <div className="v2-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="v2-eyebrow">01 · УСВІДОМЛЮЙ · S.T.R.I.D.E.</div>
      <h2 style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
        Адаптивність
      </h2>

      <div className="v2-card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 9, letterSpacing: '.13em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 100, border: '.5px solid rgba(255,255,255,.07)', color: 'rgba(255,255,255,.4)' }}>
            {q.block}
          </span>
          <span style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 10, color: 'rgba(255,255,255,.4)' }}>
            {qIdx + 1} / {QUESTIONS.length}
          </span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.55, marginBottom: 14 }}>{q.q}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {q.opts.map((o, i) => (
            <button
              key={o.v}
              className={`v2-opt${selected === o.v ? ' selected' : ''}`}
              onClick={() => setStrideAnswer(q.idx, o.v)}
            >
              <span className="v2-opt-label">{String.fromCharCode(65 + i)}</span>
              {o.t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '.5px solid rgba(255,255,255,.07)' }}>
        <button className="v2-btn-ghost" onClick={back}>← Назад</button>
        <button className="v2-btn-primary" disabled={!selected} onClick={next}>
          {isLast ? 'Завершити S.T.R.I.D.E. →' : 'Далі →'}
        </button>
      </div>
    </div>
  );
}
