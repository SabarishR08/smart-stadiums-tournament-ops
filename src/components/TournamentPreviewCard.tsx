import React from 'react';
import { Trophy, Zap, Newspaper, BarChart2, Target, Goal, Shield, ChevronRight } from 'lucide-react';

interface Props {
  onViewAll: () => void;
}

/* Quick-glance stats pulled from the same source of truth as TournamentWidget */
const LIVE_COUNT   = 2;   // Germany vs Ivory Coast • Spain vs Cape Verde
const NEXT_MATCH   = 'Brazil 🆚 Morocco · 19:00';
const TOP_SCORER   = "Mbappé & Messi — 8 ⚽ each";
const GROUPS_DONE  = 12;  // all 12 groups complete

const SECTIONS = [
  { icon: <Zap       size={13}/>,  label: 'Matches',   sub: `${LIVE_COUNT} Live · ${NEXT_MATCH}`, color: '#fbbf24' },
  { icon: <Newspaper size={13}/>, label: 'News',      sub: '8 latest updates',                   color: '#60a5fa' },
  { icon: <BarChart2 size={13}/>, label: 'Standings', sub: `Groups A – L (${GROUPS_DONE} groups)`, color: '#34d399' },
  { icon: <Goal      size={13}/>, label: 'Top Goals', sub: TOP_SCORER,                            color: '#fb923c' },
  { icon: <Target    size={13}/>, label: 'Assists',   sub: 'Olise (5) · Díaz (4)',               color: '#a78bfa' },
  { icon: <Shield    size={13}/>, label: 'Discipline',sub: '14 reds · 29 yellows',               color: '#f87171' },
];

export default function TournamentPreviewCard({ onViewAll }: Props) {
  return (
    <div
      role="tooltip"
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        right: 0,
        zIndex: 1000,
        width: 270,
        background: '#0d1525',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14,
        boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        overflow: 'hidden',
        animation: 'fadeSlideDown 0.18s ease-out both',
      }}
      /* stop the parent's mouseleave from firing when cursor enters the card */
      onMouseEnter={e => e.stopPropagation()}
    >
      {/* ── header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '11px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(59,130,246,0.05)',
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 7,
          background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Trophy size={12} style={{ color: '#fff' }}/>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>Tournament Hub</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>FIFA World Cup 2026</div>
        </div>
        {/* live badge */}
        <span style={{
          marginLeft: 'auto',
          fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
          color: '#f87171', padding: '2px 7px', borderRadius: 99,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse-dot 2s infinite' }}/>
          {LIVE_COUNT} LIVE
        </span>
      </div>

      {/* ── section rows ── */}
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {SECTIONS.map(s => (
          <button
            key={s.label}
            onClick={onViewAll}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 8px', borderRadius: 8,
              background: 'transparent', border: 'none', cursor: 'pointer',
              textAlign: 'left', width: '100%',
              transition: 'background 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {/* icon pill */}
            <span style={{
              width: 26, height: 26, borderRadius: 7, flexShrink: 0,
              background: `${s.color}18`,
              border: `1px solid ${s.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.color,
            }}>
              {s.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{s.label}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.sub}</div>
            </div>
            <ChevronRight size={11} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}/>
          </button>
        ))}
      </div>

      {/* ── footer CTA ── */}
      <div style={{ padding: '8px 10px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={onViewAll}
          style={{
            width: '100%', padding: '8px 14px', borderRadius: 9,
            background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.22)',
            color: '#93c5fd', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.12)')}
        >
          View All Stats &amp; Info
          <ChevronRight size={13}/>
        </button>
      </div>
    </div>
  );
}
