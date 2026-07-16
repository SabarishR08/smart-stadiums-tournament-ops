import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  doc, 
  onSnapshot, 
  updateDoc, 
  deleteDoc,
  query,
  limit,
  orderBy
} from 'firebase/firestore';
import { auth, db, setUserRole, getUserRole } from '../lib/firebase';
import { IncidentReport, ZoneStatus, TransportationStatus, BroadcastAnnouncement } from '../types';
import { 
  Shield, 
  LogOut, 
  AlertOctagon, 
  Activity, 
  Bell, 
  Sliders, 
  TrendingUp, 
  Lock, 
  UserPlus, 
  Sparkles, 
  CheckCircle, 
  RefreshCw,
  MapPin
} from 'lucide-react';

// Static image import for production build asset compilation
import ronaldoTunnelCrying from '../assets/images/ronaldo_tunnel_crying_1783343479370.jpg';

interface OpsDashboardProps {
  accessibilityMode: boolean;
}

export default function OpsDashboard({ accessibilityMode }: OpsDashboardProps) {
  // CSRF Token State
  const [csrfToken, setCsrfToken] = useState<string>('');
  
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  
  // Login/Signup forms
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Operational Lists
  const [crowdZones, setCrowdZones] = useState<ZoneStatus[]>([]);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [transports, setTransports] = useState<TransportationStatus[]>([]);
  const [_broadcasts, setBroadcasts] = useState<BroadcastAnnouncement[]>([]);

  // Incident form
  const [incType, setIncType] = useState<'security' | 'medical' | 'facility' | 'crowd' | 'other'>('security');
  const [incZone, setIncZone] = useState('Gate A');
  const [incSeverity, setIncSeverity] = useState<'low' | 'medium' | 'high'>('low');
  const [incNotes, setIncNotes] = useState('');
  const [isLoggingIncident, setIsLoggingIncident] = useState(false);

  // AI Decision Support state
  const [situationInput, setSituationInput] = useState('');
  const [isDeciding, setIsDeciding] = useState(false);
  const [decisionRecommendations, setDecisionRecommendations] = useState<any[]>([]);

  // Multilingual Broadcast state
  const [broadcastInput, setBroadcastInput] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<any>(null);

  // 0. Fetch CSRF Token on mount
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
    fetchCsrfToken();
  }, []);

  // 1. Monitor Auth State & Role
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsAuthLoading(true);
        const userRole = await getUserRole(currentUser.uid);
        setRole(userRole);
        setIsAuthLoading(false);
      } else {
        setRole(null);
        setIsAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time lists for staff view
  useEffect(() => {
    if (!user || role !== 'staff') return;

    // Crowd
    const unsubCrowd = onSnapshot(collection(db, 'crowd_status'), (snap) => {
      const list: ZoneStatus[] = [];
      snap.forEach((d) => list.push(d.data() as ZoneStatus));
      setCrowdZones(list);
    });

    // Incidents (limit to 50 for efficiency)
    const qIncidents = query(collection(db, 'incidents'), orderBy('timestamp', 'desc'), limit(50));
    const unsubIncidents = onSnapshot(qIncidents, (snap) => {
      const list: IncidentReport[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as IncidentReport);
      });
      setIncidents(list);
    });

    // Transport
    const unsubTrans = onSnapshot(collection(db, 'transportation'), (snap) => {
      const list: TransportationStatus[] = [];
      snap.forEach((d) => list.push(d.data() as TransportationStatus));
      setTransports(list);
    });

    // Broadcasts
    const qBroadcasts = query(collection(db, 'broadcasts'), orderBy('timestamp', 'desc'), limit(15));
    const unsubBroadcasts = onSnapshot(qBroadcasts, (snap) => {
      const list: BroadcastAnnouncement[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as BroadcastAnnouncement));
      setBroadcasts(list);
    });

    return () => {
      unsubCrowd();
      unsubIncidents();
      unsubTrans();
      unsubBroadcasts();
    };
  }, [user, role]);

  // 3. Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!email || !password) return;

    try {
      setIsAuthLoading(true);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userRole = await getUserRole(cred.user.uid);
      if (userRole !== 'staff') {
        await signOut(auth);
        setAuthError('Unauthorized: You do not have the required "staff" role.');
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Login failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 4. Handle Registration (Sign Up)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!email || !password) return;

    try {
      setIsAuthLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // New users default to 'fan' role. Staff access must be granted manually via Firebase Console.
      await setUserRole(cred.user.uid, email, 'fan');
      setRole('fan');
      setAuthError('Account created as Fan. Staff access requires manual elevation via Firebase Console.');
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // 5. Handle Sign Out
  const handleSignOut = async () => {
    await signOut(auth);
  };

  // 6. Update Crowd Density instantly
  const handleUpdateDensity = async (zoneId: string, currentDensity: string) => {
    const densities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const curIdx = densities.indexOf(currentDensity as any);
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

  // 7. Update Shuttle ETA status
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

  // 8. Log New Incident (Generates Gemini Response action & severity ranking)
  const handleLogIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incNotes.trim() || isLoggingIncident) return;

    setIsLoggingIncident(true);
    try {
      // Prompt Gemini to generate immediate actionable response advice
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

      if (response.ok && data.reply) {
        try {
          const parsed = JSON.parse(data.reply);
          aiAction = parsed.action || aiAction;
          aiPriority = parsed.priority || aiPriority;
        } catch {
          aiAction = data.reply;
        }
      }

      // Add to Firestore incidents collection
      await addDoc(collection(db, 'incidents'), {
        type: incType,
        zone: incZone,
        severity: incSeverity,
        notes: incNotes,
        timestamp: new Date().toISOString(),
        aiAction,
        aiPriority
      });

      // Reset form
      setIncNotes('');
    } catch (err) {
      console.error('Failed to log incident:', err);
    } finally {
      setIsLoggingIncident(false);
    }
  };

  // 9. Close/Resolve Incident
  const handleResolveIncident = async (incId: string) => {
    try {
      await deleteDoc(doc(db, 'incidents', incId));
    } catch (err) {
      console.error('Failed to delete incident:', err);
    }
  };

  // 10. AI Decision Support Panel
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

  // 11. Multilingual Translation Broadcast
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

        // Save translation log to Firestore broadcasts collection for live fan widgets
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

  // Basic styling configurations based on Accessibility Mode
  const panelClasses = accessibilityMode 
    ? 'bg-black text-white border-2 border-white rounded-none p-5' 
    : 'bg-zinc-900/20 backdrop-blur-xl border border-zinc-800/40 rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative z-10';

  const labelClasses = accessibilityMode ? 'text-lg font-bold' : 'text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1 block';
  const headingClasses = accessibilityMode ? 'text-2xl font-black mb-3 text-yellow-400' : 'text-sm font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-2';
  
  const inputClasses = accessibilityMode
    ? 'bg-black border-2 border-white text-white rounded-none focus:ring-4 focus:ring-yellow-400 focus:border-white focus:outline-none placeholder-slate-400 text-lg p-3'
    : 'bg-zinc-950/40 backdrop-blur-md border border-zinc-800/60 text-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 focus:outline-none p-2.5';

  const buttonClasses = accessibilityMode
    ? 'bg-yellow-400 text-black border-2 border-black font-bold py-3 px-5 rounded-none hover:bg-yellow-300 focus:ring-4 focus:ring-yellow-400'
    : 'bg-white hover:bg-zinc-200 text-black font-semibold py-2 px-4 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] focus:ring-2 focus:ring-zinc-300/50 text-sm';

  // 12. Local Aggregated Incident Chart data (Analytics)
  const incidentCountsByType = incidents.reduce((acc, inc) => {
    acc[inc.type] = (acc[inc.type] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const incidentTypes = ['security', 'medical', 'facility', 'crowd', 'other'];

  // Render Login state first
  if (!user || role !== 'staff') {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className={`${panelClasses} relative overflow-hidden`}>
          
          {/* Atmospheric background watermark graphic */}
          {!accessibilityMode && (
            <div className="absolute top-0 left-0 right-0 h-40 opacity-25 pointer-events-none select-none overflow-hidden">
              <img 
                src={ronaldoTunnelCrying} 
                alt="Ronaldo Emotional Moment" 
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950"></div>
            </div>
          )}

          <div className="text-center mb-6 relative z-10 pt-4">
            <div className="inline-flex p-2 bg-zinc-900/50 backdrop-blur-md border border-zinc-800/40 rounded-xl mb-3">
              <Lock className="w-5 h-5 text-zinc-300" />
            </div>
            <h2 className="text-base font-black text-white uppercase tracking-wider">Ops Dashboard Sign In</h2>
            <p className="text-[11px] text-zinc-500 mt-1">Authorized FIFA Stadium Operations Staff Only</p>
          </div>

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className={labelClasses}>Operations Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="steward@fifa2026.com"
                className={`w-full mt-1.5 ${inputClasses}`}
              />
            </div>

            <div>
              <label className={labelClasses}>Operations Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full mt-1.5 ${inputClasses}`}
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 border border-rose-500/20 rounded-lg">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isAuthLoading}
              className={`w-full ${buttonClasses} mt-2 flex items-center justify-center gap-2`}
            >
              {isAuthLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : (isSignUp ? <UserPlus className="w-4 h-4" /> : <Shield className="w-4 h-4" />)}
              <span>{isSignUp ? 'Register Staff Account' : 'Authenticate Staff'}</span>
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-zinc-800 text-center text-xs">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError('');
              }}
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {isSignUp ? 'Already have an operations account? Log in' : 'No account? Create one immediately'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Ops Header */}
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
          onClick={handleSignOut}
          className="bg-zinc-900 border border-zinc-800/80 hover:bg-zinc-800 text-zinc-300 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 focus:ring-2 focus:ring-red-500"
          aria-label="Sign out from operations dashboard"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Hub</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Incidents Logging & SVGA Analytics Charts (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* A. ACTIVE INCIDENT LOG & LOGGER */}
          <section className={panelClasses}>
            <h2 className={`${headingClasses} ${accessibilityMode ? 'text-yellow-400' : 'text-rose-400'}`}>
              <AlertOctagon className="w-5 h-5 inline-block" />
              <span>Incident Command Logger</span>
            </h2>

            <form onSubmit={handleLogIncident} className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6">
              <div className="sm:col-span-3">
                <label htmlFor="incident-type-select" className={labelClasses}>Type</label>
                <select 
                  id="incident-type-select"
                  value={incType} 
                  onChange={(e: any) => setIncType(e.target.value)}
                  className={`w-full mt-1 ${inputClasses} text-slate-300`}
                  aria-label="Incident type"
                >
                  <option value="security">Security</option>
                  <option value="medical">Medical</option>
                  <option value="facility">Facility</option>
                  <option value="crowd">Crowd</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="incident-zone-select" className={labelClasses}>Zone</label>
                <select 
                  id="incident-zone-select"
                  value={incZone} 
                  onChange={(e: any) => setIncZone(e.target.value)}
                  className={`w-full mt-1 ${inputClasses} text-slate-300`}
                  aria-label="Incident zone or location"
                >
                  <option value="Gate A">Gate A (North)</option>
                  <option value="Gate B">Gate B (East)</option>
                  <option value="Gate C">Gate C (South)</option>
                  <option value="Gate D">Gate D (West)</option>
                  <option value="Section A-D">Sections A-D</option>
                  <option value="Section E-H">Sections E-H</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="incident-severity-select" className={labelClasses}>Severity</label>
                <select 
                  id="incident-severity-select"
                  value={incSeverity} 
                  onChange={(e: any) => setIncSeverity(e.target.value)}
                  className={`w-full mt-1 ${inputClasses} text-slate-300`}
                  aria-label="Incident severity level"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="sm:col-span-12 flex gap-2">
                <input
                  type="text"
                  required
                  value={incNotes}
                  onChange={(e) => setIncNotes(e.target.value)}
                  placeholder="Describe the incident (e.g., ticket scanner offline, spill on concourse)"
                  className={`flex-1 ${inputClasses}`}
                  aria-label="Incident description or notes"
                />
                <button
                  type="submit"
                  disabled={isLoggingIncident}
                  className={buttonClasses}
                  aria-label="Submit and log incident with AI routing"
                >
                  {isLoggingIncident ? 'Logging...' : 'Log & Route'}
                </button>
              </div>
            </form>

            {/* Active Incidents Feed */}
            <div className="space-y-3">
              <p className={labelClasses}>Active Incident Logs ({incidents.length})</p>
              {incidents.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg bg-slate-950/20">
                  No active incidents. Safe operations confirmed.
                </div>
              ) : (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {incidents.map((inc) => (
                    <div 
                      key={inc.id} 
                      className={`p-4 rounded-xl border ${accessibilityMode ? 'border-2 border-white bg-black' : 'bg-slate-950/60 border-slate-800'} space-y-2`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${inc.severity === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {inc.type} | {inc.severity}
                          </span>
                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{inc.zone}</span>
                          </span>
                        </div>
                        <button
                          onClick={() => handleResolveIncident(inc.id)}
                          className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black py-0.5 px-2 rounded transition-all"
                        >
                          Mark Resolved
                        </button>
                      </div>

                      <p className="text-sm text-slate-200">{inc.notes}</p>

                      {/* Gemini Response Suggestion */}
                      {inc.aiAction && (
                        <div className="bg-blue-950/30 border border-blue-900/30 p-2.5 rounded text-xs">
                          <p className="font-bold text-slate-300 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            <span>Gemini Action Directive (Priority: <span className="uppercase text-yellow-400">{inc.aiPriority}</span>):</span>
                          </p>
                          <p className="text-slate-400 mt-1">{inc.aiAction}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* B. ANALYTICS: INCIDENTS CHART */}
          <section className={panelClasses}>
            <h2 className={`${headingClasses} ${accessibilityMode ? 'text-yellow-400' : 'text-blue-400'}`}>
              <TrendingUp className="w-5 h-5 inline-block" />
              <span>Real-Time Incident Analytics</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Native SVG Bar Chart */}
              <div className={`p-4 rounded-xl ${accessibilityMode ? 'border-2 border-white' : 'bg-slate-950 border border-slate-800'}`}>
                <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Incident Count by Classification</p>
                
                <div className="h-44 w-full flex items-end justify-around border-b border-l border-slate-800 pb-2.5 px-2">
                  {incidentTypes.map((t) => {
                    const count = incidentCountsByType[t] || 0;
                    const countValues = Object.values(incidentCountsByType);
                    const maxVal = Math.max(...countValues, 1);
                    // Compute percent height (ensure minimum 10px if count > 0)
                    const percentHeight = count > 0 ? (count / maxVal) * 100 : 0;
                    
                    return (
                      <div key={t} className="flex flex-col items-center w-10 group relative">
                        {/* Bar */}
                        <div 
                          style={{ height: `${Math.max(percentHeight, count > 0 ? 8 : 2)}%` }}
                          className={`w-full ${t === 'medical' ? 'bg-rose-500' : t === 'security' ? 'bg-amber-500' : 'bg-blue-500'} rounded-t transition-all duration-300 group-hover:opacity-80`}
                        />
                        {/* Tooltip on hover */}
                        <span className="absolute -top-6 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {count}
                        </span>
                        {/* Label */}
                        <span className="text-[9px] font-semibold text-slate-400 mt-1.5 uppercase truncate max-w-full">
                          {t}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bento Quick Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl flex flex-col justify-between ${accessibilityMode ? 'border-2 border-white' : 'bg-slate-950 border border-slate-800'}`}>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Resolved Incidents</span>
                  <span className="text-3xl font-black text-emerald-400 mt-2">12</span>
                  <span className="text-[9px] text-slate-500 mt-1">This Matchday</span>
                </div>
                <div className={`p-4 rounded-xl flex flex-col justify-between ${accessibilityMode ? 'border-2 border-white' : 'bg-slate-950 border border-slate-800'}`}>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Avg Response Time</span>
                  <span className="text-3xl font-black text-blue-400 mt-2">2.4m</span>
                  <span className="text-[9px] text-slate-500 mt-1">Goal: &lt; 5 mins</span>
                </div>
                <div className={`p-4 rounded-xl flex flex-col justify-between ${accessibilityMode ? 'border-2 border-white' : 'bg-slate-950 border border-slate-800'}`}>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Incidents Logged</span>
                  <span className="text-3xl font-black text-slate-200 mt-2">{incidents.length}</span>
                  <span className="text-[9px] text-slate-500 mt-1">Active Queue</span>
                </div>
                <div className={`p-4 rounded-xl flex flex-col justify-between ${accessibilityMode ? 'border-2 border-white' : 'bg-slate-950 border border-slate-800'}`}>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Critical Priority</span>
                  <span className="text-3xl font-black text-rose-500 mt-2">
                    {incidents.filter(i => i.aiPriority === 'critical' || i.severity === 'high').length}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-1">Requires dispatch</span>
                </div>
              </div>

            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Real-Time Overview Controls + AI Decision & Broadcasts (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* A. REAL-TIME INTERACTIVE CONTROLS */}
          <section className={panelClasses}>
            <h2 className={`${headingClasses} ${accessibilityMode ? 'text-yellow-400' : 'text-emerald-400'}`}>
              <Sliders className="w-5 h-5 inline-block" />
              <span>Real-Time Crowd & Transport Feeds</span>
            </h2>

            <div className="space-y-4">
              {/* Gates Crowd densities */}
              <div>
                <p className={`${labelClasses} mb-2`}>Gates Status Control (Tap to Cycle Density)</p>
                <div className="grid grid-cols-2 gap-2">
                  {crowdZones.map((zone) => (
                    <button
                      key={zone.id}
                      onClick={() => handleUpdateDensity(zone.id, zone.density)}
                      className={`p-2 rounded-lg border text-xs text-left transition-all hover:bg-slate-800/20 flex flex-col justify-between h-14 ${accessibilityMode ? 'border-2 border-white' : 'bg-slate-950 border-slate-800'}`}
                      aria-label={`Cycle Crowd Density for ${zone.name}. Current is ${zone.density}.`}
                    >
                      <span className="text-slate-400 block line-clamp-1">{zone.name}</span>
                      <span className={`font-black uppercase tracking-wider ${zone.density === 'high' ? 'text-rose-400' : zone.density === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {zone.density}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shuttle statuses */}
              <div className="border-t border-slate-800 pt-3">
                <p className={`${labelClasses} mb-2`}>Transportation Status Control (Tap to Shift status)</p>
                <div className="space-y-1.5">
                  {transports.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleUpdateTransport(item.id, item.status)}
                      className={`w-full p-2 rounded-lg border text-xs flex items-center justify-between text-left hover:bg-slate-800/20 ${accessibilityMode ? 'border-2 border-white' : 'bg-slate-950 border-slate-800'}`}
                      aria-label={`Update Transport Status for ${item.name}. Currently is ${item.status}.`}
                    >
                      <span className="text-slate-300 font-medium">{item.name}</span>
                      <div className="text-right">
                        <span className="font-bold text-blue-400">{item.status} ({item.eta})</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* B. AI TACTICAL DECISION SUPPORT */}
          <section className={panelClasses}>
            <h2 className={`${headingClasses} ${accessibilityMode ? 'text-yellow-400' : 'text-blue-400'}`}>
              <Activity className="w-5 h-5 inline-block text-blue-400" />
              <span>AI Tactical Decision Support</span>
            </h2>

            <form onSubmit={handleGetDecisionSupport} className="space-y-2">
              <label htmlFor="situation-desc" className="text-xs text-slate-400 leading-relaxed block">
                Enter an active tactical situation or stadium challenge. Gemini will provide ranked, reasoned operational maneuvers.
              </label>
              <div className="flex gap-2">
                <input
                  id="situation-desc"
                  type="text"
                  required
                  value={situationInput}
                  onChange={(e) => setSituationInput(e.target.value)}
                  placeholder="e.g. Gate B scanner jammed, line building into concourse"
                  className={`flex-1 ${inputClasses}`}
                />
                <button
                  type="submit"
                  disabled={isDeciding}
                  className={buttonClasses}
                >
                  {isDeciding ? 'Analyzing...' : 'Resolve'}
                </button>
              </div>
            </form>

            {/* Decision Recommendations List */}
            {decisionRecommendations.length > 0 && (
              <div className="mt-4 space-y-2.5">
                {decisionRecommendations.map((rec) => (
                  <div 
                    key={rec.rank} 
                    className={`p-3 rounded-lg border text-xs ${accessibilityMode ? 'border-2 border-white bg-black' : 'bg-slate-950 border-slate-800'}`}
                  >
                    <p className="font-bold text-yellow-400 uppercase tracking-wider mb-1">
                      RANK {rec.rank}: {rec.action}
                    </p>
                    <p className="text-slate-400 leading-relaxed">
                      {rec.reasoning}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* C. MULTILINGUAL BROADCAST TOOL */}
          <section className={panelClasses}>
            <h2 className={`${headingClasses} ${accessibilityMode ? 'text-yellow-400' : 'text-amber-400'}`}>
              <Bell className="w-5 h-5 inline-block text-amber-400" />
              <span>Multilingual Broadcast Terminal</span>
            </h2>

            <form onSubmit={handleCreateBroadcast} className="space-y-2">
              <p className="text-xs text-slate-400 leading-relaxed">
                Type an emergency or navigation announcement in English. Gemini will translate it into 5 other World Cup languages instantly and sync it to the public database.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={broadcastInput}
                  onChange={(e) => setBroadcastInput(e.target.value)}
                  placeholder="e.g. Please use Gate C for immediate entry. Gate B is congested."
                  className={`flex-1 ${inputClasses}`}
                />
                <button
                  type="submit"
                  disabled={isTranslating}
                  className={buttonClasses}
                >
                  {isTranslating ? 'Syncing...' : 'Broadcast'}
                </button>
              </div>
            </form>

            {/* Translations display card */}
            {broadcastResult && (
              <div className={`mt-4 p-3 rounded-lg border space-y-1.5 ${accessibilityMode ? 'border-2 border-white' : 'bg-slate-950 border-slate-800'}`}>
                <p className="text-xs font-black text-emerald-400 flex items-center gap-1 mb-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>TRANSLATED & SYNCED TO PUBLIC CONCOURSE:</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="font-bold text-slate-300 block uppercase">ES (Spanish):</span>
                    <span className="text-slate-400 line-clamp-2">{broadcastResult.es}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-300 block uppercase">FR (French):</span>
                    <span className="text-slate-400 line-clamp-2">{broadcastResult.fr}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-300 block uppercase">PT (Portuguese):</span>
                    <span className="text-slate-400 line-clamp-2">{broadcastResult.pt}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-300 block uppercase">HI (Hindi):</span>
                    <span className="text-slate-400 line-clamp-2">{broadcastResult.hi}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold text-slate-300 block uppercase">AR (Arabic):</span>
                    <span className="text-slate-400 text-right block line-clamp-2" dir="rtl">{broadcastResult.ar}</span>
                  </div>
                </div>
              </div>
            )}
          </section>

        </div>

      </div>
    </div>
  );
}
