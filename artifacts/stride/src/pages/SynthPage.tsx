import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAssessment } from '@/context/AssessmentContext';
import { callAI } from '@/lib/callAI';

const PDESC: Record<string, string> = {
  'Системний Архітектор': 'Твій мозок оптимізований під побудову логічних моделей у хаосі. Ти бачиш структури там, де інші бачать шум.',
  'Синтетичний Дослідник': "Ти збираєш пазли з різних галузей і бачиш зв'язки, які інші пропускають. Сила — у створенні нових концепцій.",
  'Глибинний Спеціаліст': 'Твоя сила — у граничній концентрації. Здатний досягти рідкісної глибини знань у своїй галузі.',
  'Адаптивний Стратег': 'Ти вміло балансуєш між аналізом і дією. Здатний адаптуватися та вести інших у невизначеності.',
};

function BarRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="v2-bar-row">
      <span className="v2-bar-label">{label}</span>
      <div className="v2-bar-track">
        <div className="v2-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="v2-bar-val">{value}%</span>
    </div>
  );
}

export default function SynthPage() {
  const [, setLocation] = useLocation();
  const { result, selectedTests, bigFiveScores, bigFiveType, p16Type, p16Scores, aiTexts, setAiText } = useAssessment();
  const [tab, setTab] = useState<'stride' | 'b5' | '16p' | 'ai'>('stride');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!result) return;
    if (aiTexts['ai-synth']) return;
    setAiLoading(true);
    let prompt = `Ти — психометричний аналітик. Синтезуй профіль:\nS.T.R.I.D.E.: "${result.profile}", когнітивний=${result.cogPct}%, енергія=${result.enPct}%, адаптивність=${result.adPct}%`;
    if (selectedTests.includes('b5')) {
      prompt += `\nBig Five: "${bigFiveType}", Відкритість=${bigFiveScores.openness}%, Сумлінність=${bigFiveScores.conscientiousness}%, Екстраверсія=${bigFiveScores.extraversion}%, Доброзичливість=${bigFiveScores.agreeableness}%, Нейротизм=${bigFiveScores.neuroticism}%`;
    }
    if (selectedTests.includes('16p')) {
      prompt += `\n16Personalities: "${p16Type}"`;
    }
    prompt += `\n\nНапиши 4–5 речень: унікальна комбінація, ключова сила, зона розвитку, рекомендація. Мовою: українська. Лише текст, без заголовків.`;
    callAI(prompt).then(text => {
      setAiText('ai-synth', text);
      setAiLoading(false);
    });
  }, [result]);

  if (!result) {
    setLocation('/');
    return null;
  }

  const p16Names: Record<string, string> = {
    INTJ:'Стратег-Архітектор',INTP:'Логік-Дослідник',ENTJ:'Командир',ENTP:'Полемік',
    INFJ:'Адвокат',INFP:'Медіатор',ENFJ:'Протагоніст',ENFP:'Активіст',
    ISTJ:'Адміністратор',ISFJ:'Захисник',ESTJ:'Менеджер',ESFJ:'Консул',
    ISTP:'Майстер',ISFP:'Авантюрист',ESTP:'Підприємець',ESFP:'Розважальник',
  };

  const TABS = [
    { id: 'stride' as const, label: 'S.T.R.I.D.E.' },
    ...(selectedTests.includes('b5')  ? [{ id: 'b5' as const,  label: 'Big Five' }] : []),
    ...(selectedTests.includes('16p') ? [{ id: '16p' as const, label: '16P' }] : []),
    { id: 'ai' as const, label: 'Синтез ШІ' },
  ];

  return (
    <div className="v2-page" style={{ maxWidth: 840, margin: '0 auto', padding: '28px 16px 64px' }}>
      <div className="v2-eyebrow">02 · ПРОЄКТУЙ · СИНТЕЗ ПРОФІЛІВ</div>
      <h2 style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 18 }}>
        Твоя карта потенціалу
      </h2>

      {/* Profile banner */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(200,255,0,.1),rgba(107,33,214,.2))',
        border: '.5px solid rgba(200,255,0,.25)',
        borderRadius: 24, padding: 22, marginBottom: 18, textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: '#C8FF00', marginBottom: 6 }}>
          S.T.R.I.D.E. Профіль
        </div>
        <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 24, fontWeight: 900, letterSpacing: '-.02em', marginBottom: 6 }}>
          {result.profile}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.68)', lineHeight: 1.65, maxWidth: 460, margin: '0 auto' }}>
          {PDESC[result.profile] ?? ''}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${1 + (selectedTests.includes('b5') ? 1 : 0) + (selectedTests.includes('16p') ? 1 : 0)}, 1fr)`, gap: 9, marginBottom: 16 }}>
        <div className="v2-card2" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 11, fontWeight: 700, color: '#C8FF00', marginBottom: 3 }}>{result.profile}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', fontFamily: 'Unbounded, sans-serif', letterSpacing: '.07em' }}>S.T.R.I.D.E.</div>
          <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 100, overflow: 'hidden', marginTop: 8 }}>
            <div style={{ width: `${result.cogPct}%`, height: '100%', background: '#C8FF00', borderRadius: 100 }} />
          </div>
        </div>
        {selectedTests.includes('b5') && (
          <div className="v2-card2" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 11, fontWeight: 700, color: '#00D4A8', marginBottom: 3 }}>{bigFiveType}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', fontFamily: 'Unbounded, sans-serif', letterSpacing: '.07em' }}>Big Five</div>
            <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 100, overflow: 'hidden', marginTop: 8 }}>
              <div style={{ width: `${bigFiveScores.openness}%`, height: '100%', background: '#00D4A8', borderRadius: 100 }} />
            </div>
          </div>
        )}
        {selectedTests.includes('16p') && (
          <div className="v2-card2" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 20, fontWeight: 900, color: '#FF7F50', marginBottom: 3 }}>{p16Type}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', fontFamily: 'Unbounded, sans-serif', letterSpacing: '.07em' }}>16Personalities</div>
            <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 100, overflow: 'hidden', marginTop: 8 }}>
              <div style={{ width: '65%', height: '100%', background: '#FF7F50', borderRadius: 100 }} />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="v2-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`v2-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'stride' && (
        <div>
          <BarRow label="Когнітивний процесинг" value={result.cogPct} color="#C8FF00" />
          <BarRow label="Енергоефективність"    value={result.enPct}  color="#00D4A8" />
          <BarRow label="Адаптивність"           value={result.adPct}  color="#FF7F50" />
        </div>
      )}

      {tab === 'b5' && selectedTests.includes('b5') && (
        <div>
          <BarRow label="Відкритість"       value={bigFiveScores.openness}          color="#C8FF00" />
          <BarRow label="Сумлінність"       value={bigFiveScores.conscientiousness} color="#00D4A8" />
          <BarRow label="Екстраверсія"      value={bigFiveScores.extraversion}      color="#6B21D6" />
          <BarRow label="Доброзичливість"   value={bigFiveScores.agreeableness}     color="#FF7F50" />
          <BarRow label="Нейротизм"         value={bigFiveScores.neuroticism}       color="#D4537E" />
        </div>
      )}

      {tab === '16p' && selectedTests.includes('16p') && (
        <div className="v2-card2" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 48, fontWeight: 900, color: '#FF7F50', marginBottom: 4 }}>{p16Type}</div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,.7)' }}>{p16Names[p16Type] ?? 'Унікальний тип'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
            {[['E','I','#C8FF00'],['N','S','#00D4A8'],['T','F','#FF7F50'],['J','P','#8B45E8']].map(([a, b, col]) => {
              const aVal = p16Scores[a as keyof typeof p16Scores] ?? 0;
              const bVal = p16Scores[b as keyof typeof p16Scores] ?? 0;
              const tot = aVal + bVal || 1;
              const pct = Math.round(aVal / tot * 100);
              return (
                <div key={a} style={{ background: 'rgba(255,255,255,.05)', borderRadius: 8, padding: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: col, fontWeight: 700 }}>{a}</span>
                    <span style={{ color: 'rgba(255,255,255,.4)' }}>{b}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,.08)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: col as string, borderRadius: 100 }} />
                  </div>
                  <div style={{ fontSize: 10, color: col as string, fontWeight: 700, marginTop: 3 }}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'ai' && (
        <div style={{ background: 'rgba(255,255,255,.04)', border: '.5px solid rgba(255,255,255,.14)', borderRadius: 12, padding: 14, fontSize: 13, lineHeight: 1.8, color: 'rgba(255,255,255,.68)', minHeight: 70, whiteSpace: 'pre-wrap' }}>
          {aiLoading || !aiTexts['ai-synth'] ? (
            <div className="v2-ai-loading">
              <div className="v2-dots">
                <div className="v2-dot" /><div className="v2-dot" /><div className="v2-dot" />
              </div>
              Аналізую профіль...
            </div>
          ) : aiTexts['ai-synth']}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '.5px solid rgba(255,255,255,.07)' }}>
        <button className="v2-btn-ghost" onClick={() => {
          if (selectedTests.includes('16p')) setLocation('/assessment/16p');
          else if (selectedTests.includes('b5')) setLocation('/assessment/bigfive');
          else setLocation('/assessment/block3');
        }}>← Назад</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="v2-btn-secondary" onClick={() => setLocation('/pdf')}>PDF без аналізу →</button>
          <button className="v2-btn-primary" onClick={() => setLocation('/result')}>Аналіз відповідності →</button>
        </div>
      </div>
    </div>
  );
}
