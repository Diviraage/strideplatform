import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAssessment } from '@/context/AssessmentContext';

const QUESTIONS = [
  {
    idx: 0,
    block: 'Когнітивний процесинг',
    q: 'Ти отримав доступ до складної системи, яка працює — але ніхто не знає як. Твій перший крок?',
    ctx: 'Це може бути незрозумілий код, економіка міста або правила нової гри.',
    opts: [
      { v: 'analysis',   t: 'Буду ламати її по частинах — побачу, що відвалиться' },
      { v: 'synthesis',  t: 'Спостерігатиму за входом/виходом — виведу закономірність' },
      { v: 'algorithm',  t: 'Шукатиму документацію або аналоги з минулого досвіду' },
    ],
  },
  {
    idx: 1,
    block: 'Когнітивний процесинг',
    q: 'Що тебе більше захоплює при вивченні нової теми?',
    ctx: null,
    opts: [
      { v: 'deep',  t: 'Занурення в одну деталь до повного розуміння' },
      { v: 'wide',  t: 'Швидке охоплення всієї картини — контекст важливіший' },
      { v: 'mixed', t: 'Спочатку загальна картина, потім ключові вузли' },
    ],
  },
  {
    idx: 2,
    block: 'Когнітивний процесинг',
    q: "Наскільки комфортно пояснювати «справедливість» без прикладів з реального життя?",
    ctx: 'Шкала 1–10',
    scale: true,
    opts: [],
  },
];

export default function Block1Page() {
  const [, setLocation] = useLocation();
  const { strideAnswers, setStrideAnswer, absValue, setAbsValue, selectedTests } = useAssessment();
  const [qIdx, setQIdx] = useState(0);

  const q = QUESTIONS[qIdx];
  const selected = strideAnswers[q.idx];
  const isAnswered = q.scale ? true : !!selected;

  const next = () => {
    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(qIdx + 1);
    } else {
      setLocation('/assessment/block2');
    }
  };

  const back = () => {
    if (qIdx > 0) setQIdx(qIdx - 1);
    else setLocation('/choose');
  };

  const progress = (qIdx / QUESTIONS.length) * 100;

  return (
    <div className="v2-page" style={{ maxWidth: 840, margin: '0 auto', padding: '28px 16px 64px' }}>
      <div className="v2-progress" style={{ marginBottom: 18 }}>
        <div className="v2-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="v2-eyebrow">01 · УСВІДОМЛЮЙ · S.T.R.I.D.E.</div>
      <h2 style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
        Архітектура мислення
      </h2>

      <div className="v2-card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{
            fontFamily: 'Unbounded, sans-serif', fontSize: 9, letterSpacing: '.13em', textTransform: 'uppercase',
            padding: '3px 9px', borderRadius: 100, border: '.5px solid rgba(255,255,255,.07)', color: 'rgba(255,255,255,.4)'
          }}>{q.block}</span>
          <span style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 10, color: 'rgba(255,255,255,.4)' }}>
            {qIdx + 1} / {QUESTIONS.length}
          </span>
        </div>

        <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.55, marginBottom: 6 }}>{q.q}</div>
        {q.ctx && (
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,.4)', fontStyle: 'italic',
            padding: '8px 11px', background: 'rgba(255,255,255,.14)', borderRadius: 8, marginBottom: 14, lineHeight: 1.55
          }}>{q.ctx}</div>
        )}

        {q.scale ? (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0 4px' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', whiteSpace: 'nowrap' }}>Некомфортно</span>
              <input
                type="range" min={1} max={10} value={absValue} step={1}
                style={{ flex: 1, accentColor: '#C8FF00' }}
                onChange={e => { const v = +e.target.value; setAbsValue(v); setStrideAnswer('abs', v); }}
              />
              <span style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 20, fontWeight: 700, color: '#C8FF00', minWidth: 20, textAlign: 'center' }}>{absValue}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', whiteSpace: 'nowrap' }}>Комфортно</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', textAlign: 'center', marginTop: 4 }}>Нейтральний рівень абстракції</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {q.opts.map((o, i) => (
              <button
                key={o.v}
                className={`v2-opt${selected === o.v ? ' selected' : ''}`}
                onClick={() => { setStrideAnswer(q.idx, o.v); }}
              >
                <span className="v2-opt-label">{String.fromCharCode(65 + i)}</span>
                {o.t}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '.5px solid rgba(255,255,255,.07)' }}>
        <button className="v2-btn-ghost" onClick={back}>← Назад</button>
        <button className="v2-btn-primary" disabled={!isAnswered} onClick={next}>Далі →</button>
      </div>
    </div>
  );
}
