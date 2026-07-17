import React, { useState, useEffect } from 'react';
import { Shield, LogOut } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { IncidentReport, ZoneStatus, TransportationStatus, BroadcastAnnouncement } from '../../types';
import { useOpsAuth } from './hooks/useOpsAuth';
import AuthPanel from './AuthPanel';
import IncidentLogger from './IncidentLogger';
import AnalyticsDashboard from './AnalyticsDashboard';
import RealTimeControls from './RealTimeControls';
import DecisionSupportPanel from './DecisionSupportPanel';
import BroadcastTerminal from './BroadcastTerminal';

interface OpsDashboardProps {
  accessibilityMode: boolean;
}

/**
 * Ops Dashboard - Orchestration Root
 * Coordinates all sub-panels: Auth, Incidents, Analytics, Controls, AI Decision Support, Broadcasts
 */
export default function OpsDashboard({ accessibilityMode }: OpsDashboardProps) {
  // CSRF Token
  const [csrfToken, setCsrfToken] = useState<string>('');

  // Auth via custom hook
  const {
    user,
    role,
    isAuthLoading,
    authError,
    isSignUp,
    email,
    password,
    setIsSignUp,
    setEmail,
    setPassword,
    setAuthError,
    handleLogin,
    handleSignUp,
    handleSignOut
  } = useOpsAuth();

  // Real-time operational data
  const [crowdZones, setCrowdZones] = useState<ZoneStatus[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [transports, setTransports] = useState<TransportationStatus[]>([]);
  const [_broadcasts, setBroadcasts] = useState<BroadcastAnnouncement[]>([]);

  // Incident form state
  const [incType, setIncType] = useState<'security' | 'medical' | 'facility' | 'crowd' | 'other'>('security');
  const [incZone, setIncZone] = useState('Gate A');
  const [incSeverity, setIncSeverity] = useState<'low' | 'medium' | 'high'>('low');
  const [incNotes, setIncNotes] = useState('');
  const [isLoggingIncident, setIsLoggingIncident] = useState(false);

  // AI Decision Support state
  const [situationInput, setSituationInput] = useState('');
  const [isDeciding, setIsDeciding] = useState(false);
  const [decisionRecommendations, setDecisionRecommendations] = useState<Array<string | { action?: string; rank?: number; reasoning?: string }>>([]);

  // Broadcast state
  const [broadcastInput, setBroadcastInput] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<Record<string, string> | null>(null);

  // Fetch CSRF Token on mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf-token');
        const data = await response.json();
        setCsrfToken(data.token);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    };
    void fetchCsrfToken();
  }, []);

  // Real-time Firestore subscriptions for staff
  useEffect(() => {
    if (!user || role !== 'staff') return;

    const unsubCrowd = onSnapshot(collection(db, 'crowd_status'), (snap) => {
      const list: ZoneStatus[] = [];
      snap.forEach((d) => list.push(d.data() as ZoneStatus));
      setCrowdZones(list);
    }, (error) => {
      console.warn('Ops Crowd subscription error:', error);
    });

    const qIncidents = query(collection(db, 'incidents'), orderBy('timestamp', 'desc'), limit(50));
    const unsubIncidents = onSnapshot(qIncidents, (snap) => {
      const list: IncidentReport[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as IncidentReport));
      setIncidents(list);
    }, (error) => {
      console.warn('Ops Incidents subscription error:', error);
    });

    const unsubTrans = onSnapshot(collection(db, 'transportation'), (snap) => {
      const list: TransportationStatus[] = [];
      snap.forEach((d) => list.push(d.data() as TransportationStatus));
      setTransports(list);
    }, (error) => {
      console.warn('Ops Transports subscription error:', error);
    });

    const qBroadcasts = query(collection(db, 'broadcasts'), orderBy('timestamp', 'desc'), limit(15));
    const unsubBroadcasts = onSnapshot(qBroadcasts, (snap) => {
      const list: BroadcastAnnouncement[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as BroadcastAnnouncement));
      setBroadcasts(list);
    }, (error) => {
      console.warn('Ops Broadcasts subscription error:', error);
    });

    return () => {
      unsubCrowd();
      unsubIncidents();
      unsubTrans();
      unsubBroadcasts();
    };
  }, [user, role]);

  // --- HANDLERS ---

  const handleUpdateDensity = async (zoneId: string, currentDensity: string) => {
    const densities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const curIdx = densities.indexOf(currentDensity as 'low' | 'medium' | 'high');
    const nextIdx = (curIdx + 1) % densities.length;
    const nextDensity = densities[nextIdx];

    try {
      const zoneRef = doc(db, 'crowd_status', zoneId);
      await updateDoc(zoneRef, {
        density: nextDensity,
        count: nextDensity === 'low' ? 500 : nextDensity === 'medium' ? 1200 : 3500,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to update density:', err);
    }
  };

  const handleUpdateTransport = async (transId: string, currentStatus: string) => {
    let nextStatus = 'On Time';
    let nextEta = '5 mins';
    if (currentStatus === 'On Time') {
      nextStatus = 'Delayed';
      nextEta = '25 mins';
    } else if (currentStatus === 'Delayed') {
      nextStatus = '90% Full';
      nextEta = '12 mins';
    }

    try {
      const transRef = doc(db, 'transportation', transId);
      await updateDoc(transRef, {
        status: nextStatus,
        eta: nextEta,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to update transport:', err);
    }
  };

  const handleLogIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incNotes.trim() || isLoggingIncident) return;

    setIsLoggingIncident(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
          message: `Respond as World Cup Security advisor. Logged Incident Type: ${incType}, Zone: ${incZone}, Initial Severity: ${incSeverity}. Notes: ${incNotes}. Recommend 1 immediate action to take, and classify tactical Priority as either low, medium, high, or critical. Format as JSON: {"action": "advice", "priority": "level"}`
        })
      });

      const data = await response.json();
      let aiAction = 'Deploy localized stewards to inspect.';
      let aiPriority: 'low' | 'medium' | 'high' | 'critical' = 'medium';

      if (response.ok) {
        if (data.action || data.priority) {
          aiAction = data.action || aiAction;
          aiPriority = data.priority || aiPriority;
        } else if (data.reply) {
          try {
            const parsed = JSON.parse(data.reply);
            aiAction = parsed.action || aiAction;
            aiPriority = parsed.priority || aiPriority;
          } catch {
            aiAction = data.reply;
          }
        }
      }

      await addDoc(collection(db, 'incidents'), {
        type: incType,
        zone: incZone,
        severity: incSeverity,
        notes: incNotes,
        timestamp: new Date().toISOString(),
        aiAction,
        aiPriority
      });

      setIncNotes('');
    } catch (err) {
      console.error('Failed to log incident:', err);
    } finally {
      setIsLoggingIncident(false);
    }
  };

  const handleResolveIncident = async (incId: string) => {
    try {
      await deleteDoc(doc(db, 'incidents', incId));
    } catch (err) {
      console.error('Failed to delete incident:', err);
    }
  };

  const handleGetDecisionSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!situationInput.trim() || isDeciding) return;

    setIsDeciding(true);
    setDecisionRecommendations([]);
    try {
      const response = await fetch('/api/decision-support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'X-User-Role': 'staff'
        },
        body: JSON.stringify({ situation: situationInput })
      });

      const data = await response.json();
      if (response.ok && data.recommendations) {
        setDecisionRecommendations(data.recommendations);
      } else {
        throw new Error();
      }
    } catch {
      setDecisionRecommendations([
        { rank: 1, action: 'Standard safety dispatch', reasoning: 'Deploy localized sector team to survey. (Gemini API unavailable)' }
      ]);
    } finally {
      setIsDeciding(false);
    }
  };

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastInput.trim() || isTranslating) return;

    setIsTranslating(true);
    setBroadcastResult(null);
    try {
      const response = await fetch('/api/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'X-User-Role': 'staff'
        },
        body: JSON.stringify({ originalText: broadcastInput })
      });

      const data = await response.json();
      if (response.ok && data.translations) {
        setBroadcastResult(data.translations);

        await addDoc(collection(db, 'broadcasts'), {
          originalText: broadcastInput,
          translations: data.translations,
          timestamp: new Date().toISOString()
        });

        setBroadcastInput('');
      } else {
        throw new Error();
      }
    } catch (err) {
      console.error('Broadcast translation failed:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // --- STYLE CLASSES ---

  const panelClasses = accessibilityMode
    ? 'bg-black text-white border-2 border-white rounded-none p-5'
    : 'bg-zinc-900/20 backdrop-blur-xl border border-zinc-800/40 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative z-10';

  const labelClasses = accessibilityMode
    ? 'text-lg font-bold'
    : 'text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 block';

  const headingClasses = accessibilityMode
    ? 'text-2xl font-black mb-3 text-yellow-400'
    : 'text-sm font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-2';

  const inputClasses = accessibilityMode
    ? 'bg-black border-2 border-white text-white rounded-none focus:ring-4 focus:ring-yellow-400 focus:border-white focus:outline-none placeholder-slate-400 text-lg p-3'
    : 'bg-zinc-950/40 backdrop-blur-md border border-zinc-800/60 text-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 focus:outline-none p-2.5';

  const buttonClasses = accessibilityMode
    ? 'bg-yellow-400 text-black border-2 border-black font-bold py-3 px-5 rounded-none hover:bg-yellow-300 focus:ring-4 focus:ring-yellow-400'
    : 'bg-white hover:bg-zinc-200 text-black font-semibold py-2 px-4 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] focus:ring-2 focus:ring-zinc-300/50 text-sm';

  // --- RENDER ---

  // If not staff, show auth panel
  if (!user || role !== 'staff') {
    return (
      <AuthPanel
        accessibilityMode={accessibilityMode}
        isSignUp={isSignUp}
        email={email}
        password={password}
        authError={authError}
        isAuthLoading={isAuthLoading}
        panelClasses={panelClasses}
        labelClasses={labelClasses}
        inputClasses={inputClasses}
        buttonClasses={buttonClasses}
        onSetIsSignUp={setIsSignUp}
        onSetEmail={setEmail}
        onSetPassword={setPassword}
        onSetAuthError={setAuthError}
        onLogin={(e) => { void handleLogin(e); }}
        onSignUp={(e) => { void handleSignUp(e); }}
      />
    );
  }

  // Staff dashboard layout
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-4 flex flex-wrap items-center justify-between gap-4 relative z-10 ${accessibilityMode ? 'border-b-4 border-white bg-black' : 'bg-zinc-900/15 backdrop-blur-md border border-zinc-800/50 rounded-xl'}`}>
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-zinc-300" />
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>FIFA WORLD CUP 2026 OPERATIONS HUB</span>
              <span className="text-[10px] bg-white/10 border border-white/20 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">LIVE STAFF MODE</span>
            </h1>
            <p className="text-xs text-zinc-500 font-medium">Logged in as {user.email}</p>
          </div>
        </div>
        <button
          onClick={() => { void handleSignOut(); }}
          className="bg-zinc-900 border border-zinc-800/80 hover:bg-zinc-800 text-zinc-300 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 focus:ring-2 focus:ring-red-500"
          aria-label="Sign out from operations dashboard"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Hub</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Incidents & Analytics (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <IncidentLogger
            accessibilityMode={accessibilityMode}
            panelClasses={panelClasses}
            headingClasses={headingClasses}
            labelClasses={labelClasses}
            inputClasses={inputClasses}
            buttonClasses={buttonClasses}
            incidents={incidents}
            incType={incType}
            incZone={incZone}
            incSeverity={incSeverity}
            incNotes={incNotes}
            isLoggingIncident={isLoggingIncident}
            onSetIncType={setIncType}
            onSetIncZone={setIncZone}
            onSetIncSeverity={setIncSeverity}
            onSetIncNotes={setIncNotes}
            onLogIncident={(e) => { void handleLogIncident(e); }}
            onResolveIncident={(id) => { void handleResolveIncident(id); }}
          />

          <AnalyticsDashboard
            accessibilityMode={accessibilityMode}
            panelClasses={panelClasses}
            headingClasses={headingClasses}
            labelClasses={labelClasses}
            inputClasses={inputClasses}
            buttonClasses={buttonClasses}
            incidents={incidents}
          />
        </div>

        {/* RIGHT COLUMN: Controls & AI Panels (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <RealTimeControls
            accessibilityMode={accessibilityMode}
            panelClasses={panelClasses}
            headingClasses={headingClasses}
            labelClasses={labelClasses}
            inputClasses={inputClasses}
            buttonClasses={buttonClasses}
            crowdZones={crowdZones}
            transports={transports}
            onUpdateDensity={(zoneId, density) => { void handleUpdateDensity(zoneId, density); }}
            onUpdateTransport={(transId, status) => { void handleUpdateTransport(transId, status); }}
          />

          <DecisionSupportPanel
            accessibilityMode={accessibilityMode}
            panelClasses={panelClasses}
            headingClasses={headingClasses}
            labelClasses={labelClasses}
            inputClasses={inputClasses}
            buttonClasses={buttonClasses}
            situationInput={situationInput}
            isDeciding={isDeciding}
            decisionRecommendations={decisionRecommendations}
            onSetSituationInput={setSituationInput}
            onGetDecisionSupport={(e) => { void handleGetDecisionSupport(e); }}
          />

          <BroadcastTerminal
            accessibilityMode={accessibilityMode}
            panelClasses={panelClasses}
            headingClasses={headingClasses}
            labelClasses={labelClasses}
            inputClasses={inputClasses}
            buttonClasses={buttonClasses}
            broadcastInput={broadcastInput}
            isTranslating={isTranslating}
            broadcastResult={broadcastResult}
            onSetBroadcastInput={setBroadcastInput}
            onGenerateBroadcast={(e) => { void handleCreateBroadcast(e); }}
          />
        </div>
      </div>
    </div>
  );
}
