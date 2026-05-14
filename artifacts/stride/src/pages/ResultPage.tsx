import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAssessment } from '@/context/AssessmentContext';
import { useGetMe, useSaveResult, getGetMyResultsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { PROFILE_DATA, PROFS } from '@/data/profiles';
import { callAI } from '@/lib/callAI';

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

const CATS = ['Всі', 'Tech', 'Design', 'Business', 'Finance', 'Science', 'Engineering', 'Humanities'];

export default function ResultPage() {
  const { result, selectedTests, bigFiveScores, bigFiveType, p16Type, aiTexts, setAiText, selectedProf, setSelectedProf, matchPct, setMatchPct, resetAssessment, duration, setDuration, frequency, setFrequency } = useAssessment();
  const [, setLocation] = useLocation();
  const { data: user } = useGetMe();
  const saveResultMutation = useSaveResult();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<'match' | 'vision' | 'map' | 'mentor'>('match');
  const [profSearch, setProfSearch] = useState('');
  const [profCat, setProfCat] = useState('Всі');
  const [aiMatchLoading, setAiMatchLoading] = useState(false);
  const [aiMapLoading, setAiMapLoading] = useState(false);
  const [aiTrajLoading, setAiTrajLoading] = useState(false);
  const [visLoading, setVisLoading] = useState(false);

  if (!result) { setLocation('/'); return null; }

  const profileInfo = PROFILE_DATA[result.profile];

  const calcMatch = (p: typeof PROFS[0]) => {
    const cogM = 100 - Math.max(0, Math.abs(result.cogPct - p.req.cog));
    const adpM = 100 - Math.max(0, Math.abs(result.adPct - p.req.adp));
    const enM  = 100 - Math.max(0, Math.abs(result.enPct - p.req.en));
    return Math.max(30, Math.min(96, Math.round((cogM + adpM + enM) / 3)));
  };

  const filteredProfs = PROFS.filter(p =>
    (profCat === 'Всі' || p.cat === profCat) &&
    p.name.toLowerCase().includes(profSearch.toLowerCase())
  );

  const selectProf = async (p: typeof PROFS[0]) => {
    const pct = calcMatch(p);
    setSelectedProf(p);
    setMatchPct(pct);
    if (!aiTexts['ai-match']) {
      setAiMatchLoading(true);
      let prompt = `Ти — кар'єрний аналітик. Профіль: "${result.profile}", когн=${result.cogPct}%, енерг=${result.enPct}%, адапт=${result.adPct}%. Цільова роль: ${p.name}. Відповідність: ${pct}%. Напиши 3–4 речення про сильні сторони та що розвивати. Без заголовків. Мова: українська.`;
      if (selectedTests.includes('b5')) prompt += ` Big Five: ${bigFiveType}.`;
      if (selectedTests.includes('16p')) prompt += ` 16P: ${p16Type}.`;
      callAI(prompt).then(t => { setAiText('ai-match', t); setAiMatchLoading(false); });
    }
  };

  const genMap = async () => {
    if (aiTexts['ai-map'] || !selectedProf) return;
    setAiMapLoading(true);
    const prompt = `Склади персональну карту саморозвитку до 100% відповідності ролі "${selectedProf.name}". Профіль: "${result.profile}", поточна відповідність: ${matchPct}%. 5 конкретних кроків (Hard Skills, Systemic, Energy, Portfolio, Network). Мова: українська. Коротко, практично.`;
    callAI(prompt).then(t => { setAiText('ai-map', t); setAiMapLoading(false); });
  };

  const genVision = () => {
    if (aiTexts['vis-b']) return;
    setVisLoading(true);
    const tot = Math.round(duration * 4 * frequency);
    const prompt = `Ти — ментор. Профіль: "${result.profile}". Термін: ${duration} місяців, ${frequency} зустрічей/тиждень, всього ${tot} сесій. Напиши надихаючу візію майбутнього 2030+ для цього учня. 4–5 речень. Мова: українська.`;
    callAI(prompt).then(t => { setAiText('vis-b', t); setVisLoading(false); });
  };

  const genTraj = () => {
    if (aiTexts['ai-traj']) return;
    setAiTrajLoading(true);
    const prompt = `Склади менторський роудмеп для "${result.profile}" на ${duration} місяців, ${frequency} зустрічей/тиждень. Вкажи ключові цілі по місяцях. Мова: українська. Без зайвих заголовків.`;
    callAI(prompt).then(t => { setAiText('ai-traj', t); setAiTrajLoading(false); });
  };

  const handleSave = () => {
    if (!user) { setLocation('/auth'); return; }
    saveResultMutation.mutate({
      data: {
        profile: result.profile,
        cogPct: result.cogPct,
        enPct: result.enPct,
        adPct: result.adPct,
        tagline: profileInfo?.tagline ?? '',
        answers: {} as any,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyResultsQueryKey() });
        setLocation('/profile');
      }
    });
  };

  const mentorStages = (() => {
    const d = duration, f = frequency;
    const stages = [];
    if (d >= 1)  stages.push({ n: 'М1', col: '#C8FF00', per: 'Місяць 1', title: 'Запуск системи', desc: 'PKM, контракт розвитку, аналіз bottleneck, перший check-in', sess: Math.round(4 * f) });
    if (d >= 3)  stages.push({ n: 'М3', col: '#00D4A8', per: 'Місяці 2–3', title: 'Прототипування', desc: 'Перший MVP, Learning by Building, дебати з ментором', sess: Math.round(8 * f) });
    if (d >= 6)  stages.push({ n: 'М6', col: '#FF7F50', per: 'Місяці 4–6', title: 'Масштабування', desc: 'Хакатони, конкурси, Feedback Loops, пітч-презентації', sess: Math.round(12 * f) });
    if (d >= 9)  stages.push({ n: 'М9', col: '#8B45E8', per: 'Місяці 7–9', title: 'Верифікація', desc: 'Стажування або публікація результатів, зовнішні партнери', sess: Math.round(12 * f) });
    if (d >= 12) stages.push({ n: 'М12', col: '#C8FF00', per: 'Місяці 10–12', title: 'Автономія', desc: "Портфоліо готове, вибір ВНЗ/кар'єри", sess: Math.round(12 * f) });
    return stages;
  })();

  const MAP_ITEMS = [
    { ico: 'HS', col: '#C8FF00', bg: 'rgba(200,255,0,.12)', title: 'Hard Skills', desc: `Технічні компетенції для ${selectedProf?.name ?? 'вашої ролі'}` },
    { ico: 'SS', col: '#00D4A8', bg: 'rgba(0,212,168,.12)', title: 'Systemic Skills', desc: 'Когнітивні патерни та способи мислення' },
    { ico: 'EG', col: '#BA7517', bg: 'rgba(186,117,23,.12)', title: 'Energy Guard', desc: 'Захист ресурсу та профілактика вигорання' },
    { ico: 'PF', col: '#D85A30', bg: 'rgba(216,90,48,.12)', title: 'Portfolio', desc: 'Реальні проєкти та докази компетентності' },
    { ico: 'NT', col: '#8B45E8', bg: 'rgba(139,69,232,.12)', title: 'Network', desc: 'Ментори, спільноти, зовнішня верифікація' },
  ];

  const TABS = [
    { id: 'match' as const,  label: 'Аналіз ролі' },
    { id: 'vision' as const, label: 'Візія & план' },
    { id: 'map' as const,    label: 'Карта розвитку' },
    { id: 'mentor' as const, label: 'Ментор' },
  ];

  return (
    <div className="v2-page" style={{ maxWidth: 840, margin: '0 auto', padding: '28px 16px 64px' }}>
      <div className="v2-eyebrow">02 · ПРОЄКТУЙ</div>
      <h2 style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Аналіз відповідності</h2>

      {/* Tabs */}
      <div className="v2-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`v2-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* MATCH TAB */}
      {tab === 'match' && (
        <div>
          {!selectedProf ? (
            <>
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,.4)' }}>⌕</span>
                <input
                  type="text"
                  placeholder="Пошук професії..."
                  value={profSearch}
                  onChange={e => setProfSearch(e.target.value)}
                  style={{ width: '100%', padding: '9px 13px 9px 33px', fontSize: 13, border: '.5px solid rgba(255,255,255,.14)', borderRadius: 12, background: 'rgba(255,255,255,.08)', color: '#fff', fontFamily: 'Manrope, sans-serif', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                {CATS.map(c => (
                  <button
                    key={c}
                    onClick={() => setProfCat(c)}
                    style={{
                      fontSize: 10, fontFamily: 'Unbounded, sans-serif', padding: '3px 11px', borderRadius: 100,
                      border: `.5px solid ${profCat === c ? 'rgba(200,255,0,.35)' : 'rgba(255,255,255,.14)'}`,
                      background: profCat === c ? 'rgba(200,255,0,.09)' : 'none',
                      color: profCat === c ? '#C8FF00' : 'rgba(255,255,255,.4)',
                      cursor: 'pointer', transition: 'all .2s',
                    }}
                  >{c}</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 7 }}>
                {filteredProfs.map(p => {
                  const pct = calcMatch(p);
                  const col = pct > 75 ? '#C8FF00' : pct > 55 ? '#00D4A8' : '#FF7F50';
                  return (
                    <div
                      key={p.id}
                      onClick={() => selectProf(p)}
                      style={{
                        background: 'rgba(255,255,255,.08)', border: '.5px solid rgba(255,255,255,.14)',
                        borderRadius: 12, padding: 11, cursor: 'pointer', transition: 'all .2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(200,255,0,.35)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.14)')}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{p.name}</div>
                      <div style={{ fontSize: 9, fontFamily: 'Unbounded, sans-serif', letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 6 }}>{p.cat}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 100, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: col, borderRadius: 100 }} />
                        </div>
                        <span style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 11, fontWeight: 700, color: col }}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div>
              <button className="v2-btn-ghost" onClick={() => setSelectedProf(null)} style={{ marginBottom: 14 }}>← Назад до списку</button>
              <div style={{ textAlign: 'center', padding: '20px 0 14px' }}>
                {(() => {
                  const col = matchPct > 75 ? '#C8FF00' : matchPct > 55 ? '#00D4A8' : '#FF7F50';
                  return (
                    <>
                      <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 52, fontWeight: 900, lineHeight: 1, color: col }}>{matchPct}<span style={{ fontSize: 18, color: 'rgba(255,255,255,.4)' }}>%</span></div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.68)', marginTop: 5 }}>{selectedProf.name}</div>
                      <div style={{ height: 8, background: 'rgba(255,255,255,.08)', borderRadius: 100, overflow: 'hidden', margin: '12px 0' }}>
                        <div style={{ width: `${matchPct}%`, height: '100%', background: col, borderRadius: 100, transition: 'width 1.2s' }} />
                      </div>
                    </>
                  );
                })()}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: matchPct > 75 ? '#C8FF00' : '#00D4A8' }}>{matchPct}%</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>поточна відповідність</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#FF7F50' }}>{100 - matchPct}%</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>gap до 100%</div>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div className="v2-eyebrow" style={{ marginBottom: 8 }}>ШІ-аналіз відповідності</div>
                <div style={{ background: 'rgba(255,255,255,.04)', border: '.5px solid rgba(255,255,255,.14)', borderRadius: 12, padding: 14, fontSize: 13, lineHeight: 1.8, color: 'rgba(255,255,255,.68)', minHeight: 70 }}>
                  {aiMatchLoading || !aiTexts['ai-match'] ? (
                    <div className="v2-ai-loading">
                      <div className="v2-dots"><div className="v2-dot" /><div className="v2-dot" /><div className="v2-dot" /></div>
                      Аналізую...
                    </div>
                  ) : aiTexts['ai-match']}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VISION TAB */}
      {tab === 'vision' && (
        <div>
          <div style={{ background: 'linear-gradient(135deg,rgba(107,33,214,.28),rgba(0,212,168,.1))', border: '.5px solid rgba(0,212,168,.28)', borderRadius: 20, padding: 18, marginBottom: 14 }}>
            <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: '#00D4A8', marginBottom: 7 }}>ВІЗІЯ 2030+</div>
            <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 9 }}>
              {duration} міс. · {frequency}×/тижд. · {Math.round(duration * 4 * frequency)} сесій загалом
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.68)', lineHeight: 1.8 }}>
              {visLoading ? (
                <div className="v2-ai-loading">
                  <div className="v2-dots"><div className="v2-dot" /><div className="v2-dot" /><div className="v2-dot" /></div>
                  Генерую...
                </div>
              ) : aiTexts['vis-b'] ?? (profileInfo?.visionTemplate ? profileInfo.visionTemplate(duration, frequency) : '')}
            </div>
          </div>

          <div className="v2-eyebrow" style={{ marginBottom: 12 }}>Динамічний конструктор траєкторій</div>
          <div className="v2-card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.68)', marginBottom: 10 }}>Термін роботи з ментором:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
              {[1,2,3,6,9,12].map(d => (
                <button key={d} onClick={() => setDuration(d)} style={{
                  background: duration === d ? 'rgba(200,255,0,.1)' : 'rgba(255,255,255,.08)',
                  border: `.5px solid ${duration === d ? '#C8FF00' : 'rgba(255,255,255,.14)'}`,
                  borderRadius: 9, padding: '7px 13px', cursor: 'pointer', fontSize: 12,
                  fontFamily: 'Unbounded, sans-serif', color: duration === d ? '#C8FF00' : 'rgba(255,255,255,.68)', transition: 'all .2s',
                }}>{d} міс.</button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.68)', marginBottom: 9 }}>Частота зустрічей на тиждень:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
              {[1,2,3,4,5].map(f => (
                <button key={f} onClick={() => setFrequency(f)} style={{
                  background: frequency === f ? 'rgba(200,255,0,.1)' : 'rgba(255,255,255,.08)',
                  border: `.5px solid ${frequency === f ? '#C8FF00' : 'rgba(255,255,255,.14)'}`,
                  borderRadius: 8, padding: '7px 11px', cursor: 'pointer', fontSize: 11,
                  fontFamily: 'Unbounded, sans-serif', color: frequency === f ? '#C8FF00' : 'rgba(255,255,255,.68)', transition: 'all .2s', minWidth: 44, textAlign: 'center',
                }}>{f}×</button>
              ))}
            </div>
            <button className="v2-btn-primary" onClick={genVision}>Згенерувати траєкторію →</button>
          </div>

          {aiTexts['ai-traj'] ? (
            <div style={{ background: 'rgba(255,255,255,.04)', border: '.5px solid rgba(255,255,255,.14)', borderRadius: 12, padding: 14, fontSize: 13, lineHeight: 1.8, color: 'rgba(255,255,255,.68)', whiteSpace: 'pre-wrap' }}>
              {aiTexts['ai-traj']}
            </div>
          ) : aiTrajLoading ? (
            <div className="v2-ai-loading" style={{ marginTop: 10 }}>
              <div className="v2-dots"><div className="v2-dot" /><div className="v2-dot" /><div className="v2-dot" /></div>
              Будую траєкторію...
            </div>
          ) : null}
        </div>
      )}

      {/* MAP TAB */}
      {tab === 'map' && (
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Карта саморозвитку до 100%</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
            {MAP_ITEMS.map(m => (
              <div key={m.ico} style={{ display: 'flex', gap: 13, alignItems: 'flex-start', background: 'rgba(255,255,255,.08)', border: '.5px solid rgba(255,255,255,.14)', borderRadius: 12, padding: '11px 13px' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.bg, color: m.col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Unbounded, sans-serif', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{m.ico}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', lineHeight: 1.6 }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {selectedProf && (
            <button className="v2-btn-primary" onClick={genMap} disabled={!!aiTexts['ai-map'] || aiMapLoading}>
              {aiMapLoading ? 'Будую...' : aiTexts['ai-map'] ? 'Карта готова ✓' : 'Згенерувати ШІ-рекомендації →'}
            </button>
          )}

          {(aiTexts['ai-map'] || aiMapLoading) && (
            <div style={{ background: 'rgba(255,255,255,.04)', border: '.5px solid rgba(255,255,255,.14)', borderRadius: 12, padding: 14, fontSize: 13, lineHeight: 1.8, color: 'rgba(255,255,255,.68)', marginTop: 14, whiteSpace: 'pre-wrap' }}>
              {aiMapLoading ? (
                <div className="v2-ai-loading">
                  <div className="v2-dots"><div className="v2-dot" /><div className="v2-dot" /><div className="v2-dot" /></div>
                  Будую карту...
                </div>
              ) : aiTexts['ai-map']}
            </div>
          )}
        </div>
      )}

      {/* MENTOR TAB */}
      {tab === 'mentor' && (
        <div>
          <div className="v2-eyebrow" style={{ marginBottom: 8 }}>Менторський роудмеп</div>
          <div style={{ position: 'relative', paddingLeft: 34, marginBottom: 14 }}>
            <div style={{ position: 'absolute', left: 9, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,.14)' }} />
            {mentorStages.map((st, i) => (
              <div key={i} style={{ position: 'relative', paddingBottom: 18 }}>
                <div style={{ position: 'absolute', left: -29, top: 2, width: 19, height: 19, borderRadius: '50%', background: `${st.col}22`, color: st.col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Unbounded, sans-serif', fontSize: 7, fontWeight: 700, border: `1.5px solid ${st.col}` }}>
                  {st.n}
                </div>
                <div style={{ background: 'rgba(255,255,255,.08)', border: '.5px solid rgba(255,255,255,.14)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 3 }}>{st.per} · {st.sess} сесій</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{st.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>{st.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button className="v2-btn-primary" onClick={genTraj} disabled={!!aiTexts['ai-traj'] || aiTrajLoading} style={{ marginBottom: 14 }}>
            {aiTrajLoading ? 'Генерую...' : aiTexts['ai-traj'] ? 'Траєкторія готова ✓' : 'Згенерувати ШІ-траєкторію →'}
          </button>

          {(aiTexts['ai-traj'] || aiTrajLoading) && (
            <div style={{ background: 'rgba(255,255,255,.04)', border: '.5px solid rgba(255,255,255,.14)', borderRadius: 12, padding: 14, fontSize: 13, lineHeight: 1.8, color: 'rgba(255,255,255,.68)', whiteSpace: 'pre-wrap' }}>
              {aiTrajLoading ? (
                <div className="v2-ai-loading">
                  <div className="v2-dots"><div className="v2-dot" /><div className="v2-dot" /><div className="v2-dot" /></div>
                </div>
              ) : aiTexts['ai-traj']}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '.5px solid rgba(255,255,255,.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <button className="v2-btn-ghost" onClick={() => setLocation('/synth')}>← Назад</button>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="v2-btn-secondary" onClick={handleSave} disabled={saveResultMutation.isPending}>
            💾 Зберегти
          </button>
          <button className="v2-btn-primary" onClick={() => setLocation('/pdf')}>
            Завантажити PDF →
          </button>
        </div>
      </div>
    </div>
  );
}
