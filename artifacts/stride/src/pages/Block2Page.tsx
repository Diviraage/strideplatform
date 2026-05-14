import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAssessment } from '@/context/AssessmentContext';

const QUESTIONS = [
  {
    idx: 3,
    block: 'Енергозатрати',
    q: 'Що змушує тебе забути про обід?',
    opts: [
      { v: 'intel',  t: 'Пошук помилки в логіці або задачі, яка не давала спокою' },
      { v: 'result', t: 'Створення гарного результату, який всі оцінять' },
      { v: 'social', t: 'Організація чогось корисного для інших людей' },
    ],
  },
  {
    idx: 4,
    block: 'Енергозатрати',
    q: 'Що тебе зупинить швидше під час роботи над проєктом?',
    opts: [
      { v: 'physical', t: 'Фізична втома — просто хочу спати' },
      { v: 'bored',    t: 'Нудьга — я вже зрозумів принцип, далі нецікаво' },
      { v: 'fear',     t: 'Страх помилитися або бути осудженим' },
    ],
  },
  {
    idx: 5,
    block: 'Енергозатрати',
    q: 'Як зазвичай виконуєш великі завдання?',
    opts: [
      { v: 'flow',     t: 'Занурюсь на 3–4 години в одну задачу без перерв' },
      { v: 'multi',    t: 'Перемикаюсь між кількома завданнями — так легше' },
      { v: 'deadline', t: 'Починаю активно лише коли є дедлайн і тиск' },
    ],
  },
];

export default function Block2Page() {
  const [, setLocation] = useLocation();
  const { strideAnswers, setStrideAnswer } = useAssessment();
  const [qIdx, setQIdx] = useState(0);

  const q = QUESTIONS[qIdx];
  const selected = strideAnswers[q.idx];
  const progress = (qIdx / QUESTIONS.length) * 100;

  const next = () => {
    if (qIdx < QUESTIONS.length - 1) setQIdx(qIdx + 1);
    else setLocation('/assessment/block3');
  };

  const back = () => {
    if (qIdx > 0) setQIdx(qIdx - 1);
    else setLocation('/assessment/block1');
  };

  return (
    <div className="v2-page" style={{ maxWidth: 840, margin: '0 auto', padding: '28px 16px 64px' }}>
      <div className="v2-progress" style={{ marginBottom: 18 }}>
        <div className="v2-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="v2-eyebrow">01 · УСВІДОМЛЮЙ · S.T.R.I.D.E.</div>
      <h2 style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
        Енергозатрати
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
        <button className="v2-btn-primary" disabled={!selected} onClick={next}>Далі →</button>
      </div>
    </div>
  );
}
