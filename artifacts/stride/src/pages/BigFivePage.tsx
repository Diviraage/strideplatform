import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAssessment } from '@/context/AssessmentContext';

type Trait = 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';

const QUESTIONS: { tr: Trait; pos: boolean; q: string }[] = [
  { tr: 'openness',          pos: true,  q: 'Мені подобається досліджувати абстрактні ідеї та концепції' },
  { tr: 'conscientiousness', pos: true,  q: 'Я зазвичай ретельно планую роботу та дотримуюся плану' },
  { tr: 'extraversion',      pos: true,  q: 'Я легко знаходжу енергію від спілкування з людьми' },
  { tr: 'agreeableness',     pos: true,  q: 'Для мене важлива гармонія у відносинах з оточенням' },
  { tr: 'neuroticism',       pos: true,  q: 'Я часто відчуваю тривогу або хвилювання перед невизначеністю' },
  { tr: 'openness',          pos: true,  q: "Мені цікавіше придумувати нові підходи, ніж слідувати перевіреним методам" },
  { tr: 'conscientiousness', pos: true,  q: "Я завжди виконую зобов'язання, навіть коли складно" },
  { tr: 'extraversion',      pos: false, q: 'Після тривалого спілкування мені потрібен час на самоті' },
  { tr: 'agreeableness',     pos: true,  q: 'Мені важливо, щоб усі у групі почувалися добре' },
  { tr: 'neuroticism',       pos: false, q: 'Я рідко переживаю через помилки та швидко рухаюсь далі' },
];

const LBLS = ['Зовсім не погоджуюсь', 'Не погоджуюсь', 'Нейтрально', 'Погоджуюсь', 'Повністю погоджуюсь'];

export default function BigFivePage() {
  const [, setLocation] = useLocation();
  const { setBigFiveScore, selectedTests } = useAssessment();
  const [qIdx, setQIdx] = useState(0);
  const [answered, setAnswered] = useState(false);

  const q = QUESTIONS[qIdx];
  const progress = (qIdx / QUESTIONS.length) * 100;

  const pick = (val: number) => {
    const score = q.pos ? Math.round(val / 4 * 100) : Math.round((4 - val) / 4 * 100);
    setBigFiveScore(q.tr, score);
    setAnswered(true);
    setTimeout(() => {
      const next = qIdx + 1;
      if (next >= QUESTIONS.length) {
        if (selectedTests.includes('16p')) setLocation('/assessment/16p');
        else setLocation('/synth');
      } else {
        setQIdx(next);
        setAnswered(false);
      }
    }, 260);
  };

  return (
    <div className="v2-page" style={{ maxWidth: 840, margin: '0 auto', padding: '28px 16px 64px' }}>
      <div className="v2-progress" style={{ marginBottom: 18 }}>
        <div className="v2-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="v2-eyebrow">01 · УСВІДОМЛЮЙ · BIG FIVE (OCEAN)</div>
      <h2 style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 14 }}>
        Особистісний вимір
      </h2>

      <div className="v2-callout purple" style={{ marginBottom: 14 }}>
        <div className="v2-callout-title" style={{ color: '#C8FF00' }}>Про Big Five</div>
        <div className="v2-callout-body">
          Найнаукоємніша модель особистості. Вимірює 5 рис: Відкритість, Сумлінність, Екстраверсія, Доброзичливість, Нейротизм.{' '}
          <a href="https://insightfultraits.com/lp/oceantest4/" target="_blank" rel="noreferrer" style={{ color: '#C8FF00' }}>insightfultraits.com</a>
        </div>
      </div>

      <div className="v2-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 9, letterSpacing: '.13em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 100, border: '.5px solid rgba(255,255,255,.07)', color: '#00D4A8' }}>
            Big Five · {q.tr}
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
        <button className="v2-btn-ghost" onClick={() => setLocation('/assessment/block3')}>← Назад</button>
      </div>
    </div>
  );
}
