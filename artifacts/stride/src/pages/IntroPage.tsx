import React from 'react';
import { useLocation } from 'wouter';

export default function IntroPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="v2-page" style={{ maxWidth: 840, margin: '0 auto', padding: '28px 16px 64px' }}>
      <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 9, letterSpacing: '.2em', textTransform: 'uppercase', color: '#C8FF00', marginBottom: 10 }}>
        Форум Старшокласників · ЛІКО-школа · 16.05
      </div>

      <h1 style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 'clamp(26px,5vw,42px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-.02em', marginBottom: 14 }}>
        Майбутнє починається <em style={{ color: '#C8FF00', fontStyle: 'normal' }}>зараз</em>
      </h1>

      <p style={{ fontSize: 14, color: 'rgba(255,255,255,.68)', lineHeight: 1.7, marginBottom: 28, maxWidth: 520 }}>
        Не просто тест — система координат, що розкриє архітектуру твого мислення та перетворить її на стратегію життя.
      </p>

      {/* Phase cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 26 }}>
        {[
          { num: '01 · УСВІДОМЛЮЙ', ico: '🧠', nm: 'ТЕСТ', ds: 'S.T.R.I.D.E. + Big Five + 16Personalities — три виміри, одна карта потенціалу' },
          { num: '02 · ПРОЄКТУЙ',  ico: '🗺️', nm: 'КАРТА РОЗВИТКУ', ds: 'Синтез профілів, вибір професії та персональна траєкторія до 100% відповідності' },
          { num: '03 · ДІЙ',       ico: '🚀', nm: 'ПЛАН + PDF',  ds: 'Динамічний план з ментором, візія майбутнього та якісний PDF-звіт із діаграмами' },
        ].map(c => (
          <div key={c.num} className="v2-phase-card">
            <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 9, letterSpacing: '.15em', color: 'rgba(255,255,255,.4)', marginBottom: 8 }}>{c.num}</div>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{c.ico}</div>
            <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 12, color: '#C8FF00', marginBottom: 5 }}>{c.nm}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.68)', lineHeight: 1.55 }}>{c.ds}</div>
          </div>
        ))}
      </div>

      <div className="v2-callout lime" style={{ marginBottom: 24 }}>
        <div className="v2-callout-title">💡 ГНУЧКИЙ СТАРТ</div>
        <div className="v2-callout-body">Пройди тільки S.T.R.I.D.E. і одразу отримай PDF. Або додай Big Five та 16Personalities для глибшого синтезу.</div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          className="v2-btn-primary"
          onClick={() => setLocation('/assessment/block1')}
        >
          Розпочати S.T.R.I.D.E. →
        </button>
        <button
          className="v2-btn-secondary"
          onClick={() => setLocation('/choose')}
        >
          Обрати набір тестів
        </button>
      </div>
    </div>
  );
}
