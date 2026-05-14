import React from 'react';
import { useLocation } from 'wouter';
import { useAssessment, type SelectedTest } from '@/context/AssessmentContext';

const TESTS = [
  { id: 'stride' as SelectedTest, ico: '🧠', nm: 'S.T.R.I.D.E.', sb: "Обов'язковий", required: true },
  { id: 'b5' as SelectedTest, ico: '📊', nm: 'Big Five', sb: 'OCEAN модель', required: false },
  { id: '16p' as SelectedTest, ico: '🎭', nm: '16Personalities', sb: 'MBTI-based', required: false },
];

export default function ChoosePage() {
  const [, setLocation] = useLocation();
  const { selectedTests, setSelectedTests } = useAssessment();

  const toggle = (id: SelectedTest) => {
    if (id === 'stride') return;
    if (selectedTests.includes(id)) {
      setSelectedTests(selectedTests.filter(t => t !== id));
    } else {
      setSelectedTests([...selectedTests, id]);
    }
  };

  const start = () => {
    setLocation('/assessment/block1');
  };

  return (
    <div className="v2-page" style={{ maxWidth: 840, margin: '0 auto', padding: '28px 16px 64px' }}>
      <div className="v2-eyebrow">01 · УСВІДОМЛЮЙ</div>
      <h2 style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 18, fontWeight: 700, letterSpacing: '-.01em', marginBottom: 14 }}>
        Оберіть набір тестів
      </h2>

      <div className="v2-callout teal" style={{ marginBottom: 20 }}>
        <div className="v2-callout-title">S.T.R.I.D.E. — обов'язковий базовий тест</div>
        <div className="v2-callout-body">Big Five та 16Personalities — опціонально. Більше тестів = точніший синтез.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9, marginBottom: 20 }}>
        {TESTS.map(t => {
          const sel = selectedTests.includes(t.id);
          return (
            <div
              key={t.id}
              onClick={() => toggle(t.id)}
              style={{
                background: sel ? 'rgba(200,255,0,.08)' : 'rgba(255,255,255,.08)',
                border: `.5px solid ${sel ? '#C8FF00' : 'rgba(255,255,255,.14)'}`,
                borderWidth: sel ? 1.5 : .5,
                borderRadius: 12,
                padding: 13,
                cursor: t.required ? 'default' : 'pointer',
                textAlign: 'center',
                transition: 'all .2s',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{t.ico}</div>
              <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{t.nm}</div>
              <div style={{ fontSize: 10, color: t.required ? '#C8FF00' : 'rgba(255,255,255,.4)' }}>{t.sb}</div>
            </div>
          );
        })}
      </div>

      <button className="v2-btn-primary" onClick={start}>
        Розпочати →
      </button>

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '.5px solid rgba(255,255,255,.07)' }}>
        <button className="v2-btn-ghost" onClick={() => setLocation('/')}>← Назад</button>
      </div>
    </div>
  );
}
