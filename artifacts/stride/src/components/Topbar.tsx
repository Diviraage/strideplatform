import React from 'react';
import { Link, useLocation } from 'wouter';
import { useGetMe } from '@workspace/api-client-react';

const PHASE_MAP: Record<string, number> = {
  '/': 0, '/choose': 0,
  '/assessment/block1': 0, '/assessment/block2': 0, '/assessment/block3': 0,
  '/assessment/bigfive': 0, '/assessment/16p': 0,
  '/synth': 1, '/result': 1,
  '/pdf': 2,
};

const PHASES = [
  { label: 'УСВІДОМЛЮЙ', emoji: '🧠' },
  { label: 'ПРОЄКТУЙ',   emoji: '🗺️' },
  { label: 'ДІЙ',        emoji: '🚀' },
];

export function Topbar() {
  const [location] = useLocation();
  const { data: user } = useGetMe();

  const baseLocation = location.split('?')[0];
  const curPhase = PHASE_MAP[baseLocation] ?? 1;

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(26,10,61,.88)',
        backdropFilter: 'blur(18px)',
        borderBottom: '.5px solid rgba(255,255,255,.07)',
      }}
    >
      {/* Brand */}
      <Link href="/">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{
            background: '#C8FF00', color: '#1A0A3D',
            fontFamily: 'Unbounded, sans-serif',
            fontSize: 11, fontWeight: 900,
            padding: '5px 10px', borderRadius: 8,
            lineHeight: 1.2,
          }}>
            FUTURE IS NOW
          </div>
          <div>
            <div style={{ fontFamily: 'Unbounded, sans-serif', fontSize: 13, fontWeight: 700 }}>S.T.R.I.D.E.</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)' }}>Psychometric Intelligence</div>
          </div>
        </div>
      </Link>

      {/* Phases */}
      <div style={{ display: 'flex', gap: 5 }} className="hidden sm:flex">
        {PHASES.map((ph, i) => {
          const isActive = i === curPhase;
          const isDone   = i < curPhase;
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px',
                borderRadius: 100,
                border: `.5px solid ${isActive ? '#C8FF00' : isDone ? '#00D4A8' : 'rgba(255,255,255,.14)'}`,
                fontFamily: 'Unbounded, sans-serif',
                fontSize: 9,
                color: isActive ? '#C8FF00' : isDone ? '#00D4A8' : 'rgba(255,255,255,.35)',
                background: isActive ? 'rgba(200,255,0,.1)' : isDone ? 'rgba(0,212,168,.08)' : 'transparent',
                transition: 'all .3s',
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: isActive ? '#C8FF00' : isDone ? '#00D4A8' : 'currentColor',
                opacity: isActive || isDone ? 1 : .4,
              }} />
              {ph.label}
            </div>
          );
        })}
      </div>

      {/* Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user?.isAdmin && (
          <Link href="/admin">
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontFamily: 'Unbounded, sans-serif' }}>
              ADMIN
            </span>
          </Link>
        )}
        <Link href={user ? '/profile' : '/auth'}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,.08)',
            border: '.5px solid rgba(255,255,255,.14)',
            borderRadius: 100,
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: 12,
          }}>
            <div style={{
              width: 24, height: 24,
              borderRadius: '50%',
              background: user ? 'rgba(200,255,0,.2)' : 'rgba(255,255,255,.1)',
              border: user ? '1px solid #C8FF00' : '1px solid rgba(255,255,255,.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Unbounded, sans-serif',
              fontSize: 10, fontWeight: 700,
              color: user ? '#C8FF00' : 'rgba(255,255,255,.5)',
            }}>
              {user ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <span style={{ color: user ? '#fff' : 'rgba(255,255,255,.55)' }}>
              {user ? user.name : 'Увійти'}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
