import React, { useState, useEffect } from 'react';
import { seedInitialDataIfEmpty } from './lib/firebase';
import FanView from './components/FanView';
import OpsDashboard from './components/OpsDashboard';
import { MapPin, Menu, X, Shield, Users } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'fan' | 'ops'>('fan');
  const [accessibilityMode, setAccessibilityMode] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    seedInitialDataIfEmpty();
  }, []);

  // Apply a11y class on root so CSS cascade overrides work
  useEffect(() => {
    document.documentElement.classList.toggle('a11y', accessibilityMode);
  }, [accessibilityMode]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav
        role="navigation"
        aria-label="Main Navigation"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(8,12,20,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 14, color: '#fff', letterSpacing: '-0.5px',
              flexShrink: 0,
            }}>SP</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px', color: '#f1f5f9' }}>
                Stadium<span style={{ color: '#3b82f6' }}>Pulse</span> <span style={{ color: 'rgba(255,255,255,0.35)' }}>AI</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 1 }}>
                FIFA World Cup 2026
              </div>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 24 }}>
            {/* View switcher pill */}
            <div style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 99,
              padding: 3,
              gap: 2,
            }} role="menubar">
              {([
                { key: 'fan', label: 'Fan View', icon: <Users size={13} /> },
                { key: 'ops', label: 'Ops Hub', icon: <Shield size={13} /> },
              ] as const).map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setCurrentView(key)}
                  role="menuitem"
                  aria-label={`Switch to ${label}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px',
                    borderRadius: 99,
                    fontSize: 12, fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.15s',
                    background: currentView === key ? '#3b82f6' : 'transparent',
                    color: currentView === key ? '#fff' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {/* Live indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
              <span className="dot-live" />
              MIAMI GARDENS • LIVE
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden btn-icon"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { key: 'fan' as const, label: 'Fan View' },
              { key: 'ops' as const, label: 'Ops Hub' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setCurrentView(key); setMobileMenuOpen(false); }}
                style={{
                  textAlign: 'left', padding: '10px 14px', borderRadius: 10,
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: currentView === key ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                  color: currentView === key ? '#fff' : 'rgba(255,255,255,0.6)',
                }}
              >{label}</button>
            ))}
          </div>
        )}
      </nav>

      {/* ── BREADCRUMB STRIP ────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '8px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
            <MapPin size={12} style={{ color: '#3b82f6' }} />
            VENUE: FIFA WC 2026 — AZTECA / METLIFE (MOCK)
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
            MATCHDAY · JULY 2026
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, maxWidth: 1280, margin: '0 auto', width: '100%', padding: '24px 24px' }}>
        {currentView === 'fan' ? (
          <FanView accessibilityMode={accessibilityMode} setAccessibilityMode={setAccessibilityMode} />
        ) : (
          <OpsDashboard accessibilityMode={accessibilityMode} />
        )}
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', gap: 20 }}>
          {['WCAG 2.1 AA', 'Screen Reader Ready', 'Keyboard Nav'].map(tag => (
            <span key={tag} style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {tag}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace', textAlign: 'right' }}>
          STADIUMPULSE AI · v4.0 · Gemini + Firestore + Firebase Auth
        </div>
      </footer>
    </div>
  );
}
