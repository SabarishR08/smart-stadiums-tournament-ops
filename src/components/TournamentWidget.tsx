import React from 'react';
import { X, Trophy, Newspaper, BarChart2, UserCircle2 } from 'lucide-react';

type Tab = 'matches' | 'news' | 'standings' | 'players';
interface Props { tab: Tab; onClose: () => void; }

/* ── static mock data ─────────────────────────────────────────────────── */
const MATCHES = [
  { id:1,  home:'🇲🇽 Mexico',      away:'South Africa 🇿🇦', score:'2–0', time:'FT',    status:'finished' },
  { id:2,  home:'🇦🇷 Argentina',   away:'Austria 🇦🇹',      score:'3–1', time:'FT',    status:'finished' },
  { id:3,  home:'🇫🇷 France',      away:'Norway 🇳🇴',       score:'4–0', time:'FT',    status:'finished' },
  { id:4,  home:'🇧🇷 Brazil',      away:'Morocco 🇲🇦',      score:'–',   time:'19:00', status:'upcoming' },
  { id:5,  home:'🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',     away:'Croatia 🇭🇷',      score:'–',   time:'21:00', status:'upcoming' },
  { id:6,  home:'🇩🇪 Germany',     away:'Ivory Coast 🇨🇮',  score:'2–1', time:"74'",   status:'live'     },
  { id:7,  home:'🇪🇸 Spain',       away:'Cape Verde 🇨🇻',   score:'1–0', time:"31'",   status:'live'     },
];

const NEWS = [
  { id:1, headline:'Messi hat-trick fires Argentina into the last 16',         time:'2h ago',  tag:'Argentina' },
  { id:2, headline:'Germany survive scare against Ivory Coast in Group E',     time:'4h ago',  tag:'Group E'   },
  { id:3, headline:'VAR controversy as Brazil draw awarded against Morocco',   time:'6h ago',  tag:'Brazil'    },
  { id:4, headline:'England top Group L after clinical display vs Croatia',    time:'8h ago',  tag:'England'   },
  { id:5, headline:'France set tournament scoring record with 10 goals',       time:'10h ago', tag:'France'    },
];

const GROUPS: { name:string; teams:{ flag:string; name:string; mp:number; w:number; d:number; l:number; gf:number; ga:number; pts:number }[] }[] = [
  { name:'A', teams:[
    { flag:'🇲🇽', name:'Mexico',          mp:3,w:3,d:0,l:0,gf:6,ga:0,pts:9  },
    { flag:'🇿🇦', name:'South Africa',    mp:3,w:1,d:1,l:1,gf:2,ga:3,pts:4  },
    { flag:'🇰🇷', name:'Korea Republic',  mp:3,w:1,d:0,l:2,gf:2,ga:3,pts:3  },
    { flag:'🇨🇿', name:'Czechia',         mp:3,w:0,d:1,l:2,gf:2,ga:6,pts:1  },
  ]},
  { name:'B', teams:[
    { flag:'🇨🇭', name:'Switzerland',     mp:3,w:2,d:1,l:0,gf:7,ga:3,pts:7  },
    { flag:'🇨🇦', name:'Canada',          mp:3,w:1,d:1,l:1,gf:8,ga:3,pts:4  },
    { flag:'🇧🇦', name:'Bosnia & Herz.',  mp:3,w:1,d:1,l:1,gf:5,ga:6,pts:4  },
    { flag:'🇶🇦', name:'Qatar',           mp:3,w:0,d:1,l:2,gf:2,ga:10,pts:1 },
  ]},
  { name:'C', teams:[
    { flag:'🇧🇷', name:'Brazil',          mp:3,w:2,d:1,l:0,gf:7,ga:1,pts:7  },
    { flag:'🇲🇦', name:'Morocco',         mp:3,w:2,d:1,l:0,gf:6,ga:3,pts:7  },
    { flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', name:'Scotland',        mp:3,w:1,d:0,l:2,gf:1,ga:4,pts:3  },
    { flag:'🇭🇹', name:'Haiti',           mp:3,w:0,d:0,l:3,gf:2,ga:8,pts:0  },
  ]},
  { name:'D', teams:[
    { flag:'🇺🇸', name:'USA',             mp:3,w:2,d:0,l:1,gf:8,ga:4,pts:6  },
    { flag:'🇦🇺', name:'Australia',       mp:3,w:1,d:1,l:1,gf:2,ga:2,pts:4  },
    { flag:'🇵🇾', name:'Paraguay',        mp:3,w:1,d:1,l:1,gf:2,ga:4,pts:4  },
    { flag:'🇹🇷', name:'Türkiye',         mp:3,w:1,d:0,l:2,gf:3,ga:5,pts:3  },
  ]},
  { name:'I', teams:[
    { flag:'🇫🇷', name:'France',          mp:3,w:3,d:0,l:0,gf:10,ga:2,pts:9 },
    { flag:'🇳🇴', name:'Norway',          mp:3,w:2,d:0,l:1,gf:8,ga:7,pts:6  },
    { flag:'🇸🇳', name:'Senegal',         mp:3,w:1,d:0,l:2,gf:8,ga:6,pts:3  },
    { flag:'🇮🇶', name:'Iraq',            mp:3,w:0,d:0,l:3,gf:1,ga:12,pts:0 },
  ]},
  { name:'J', teams:[
    { flag:'🇦🇷', name:'Argentina',       mp:3,w:3,d:0,l:0,gf:8,ga:1,pts:9  },
    { flag:'🇦🇹', name:'Austria',         mp:3,w:1,d:1,l:1,gf:6,ga:6,pts:4  },
    { flag:'🇩🇿', name:'Algeria',         mp:3,w:1,d:1,l:1,gf:5,ga:7,pts:4  },
    { flag:'🇯🇴', name:'Jordan',          mp:3,w:0,d:0,l:3,gf:3,ga:8,pts:0  },
  ]},
  { name:'L', teams:[
    { flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', name:'England',         mp:3,w:2,d:1,l:0,gf:6,ga:2,pts:7  },
    { flag:'🇭🇷', name:'Croatia',         mp:3,w:2,d:0,l:1,gf:5,ga:5,pts:6  },
    { flag:'🇬🇭', name:'Ghana',           mp:3,w:1,d:1,l:1,gf:2,ga:2,pts:4  },
    { flag:'🇵🇦', name:'Panama',          mp:3,w:0,d:0,l:3,gf:0,ga:4,pts:0  },
  ]},
];

const PLAYERS = [
  { flag:'🇦🇷', name:'Lionel Messi',     team:'Argentina', goals:6, assists:3, pos:'FW' },
  { flag:'🇫🇷', name:'Kylian Mbappé',    team:'France',    goals:5, assists:2, pos:'FW' },
  { flag:'🇧🇷', name:'Vinicius Jr.',     team:'Brazil',    goals:4, assists:4, pos:'FW' },
  { flag:'🇩🇪', name:'Florian Wirtz',    team:'Germany',   goals:4, assists:2, pos:'MF' },
  { flag:'🇳🇴', name:'Erling Haaland',  team:'Norway',    goals:4, assists:1, pos:'FW' },
  { flag:'🇵🇹', name:'Bruno Fernandes', team:'Portugal',  goals:3, assists:4, pos:'MF' },
  { flag:'🇪🇸', name:'Pedri',           team:'Spain',     goals:2, assists:5, pos:'MF' },
  { flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', name:'Jude Bellingham', team:'England',   goals:3, assists:3, pos:'MF' },
];

/* ── styles ─────────────────────────────────────────────────────────────── */
const overlay: React.CSSProperties = {
  background: 'rgba(8,12,20,0.97)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
};
const tabBtn = (active: boolean): React.CSSProperties => ({
  padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  borderRadius: 7, border: 'none',
  background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
  color: active ? '#93c5fd' : 'rgba(255,255,255,0.35)',
  display: 'inline-flex', alignItems: 'center', gap: 5,
  transition: 'all 0.15s',
});
const th: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.07em', textTransform: 'uppercase', padding: '6px 8px', textAlign: 'center' as const };
const td: React.CSSProperties = { fontSize: 12, color: 'rgba(255,255,255,0.6)', padding: '6px 8px', textAlign: 'center' as const };
const tdFirst: React.CSSProperties = { ...td, textAlign: 'left' as const, display: 'flex', alignItems: 'center', gap: 6 };

export default function TournamentWidget({ tab, onClose }: Props) {
  const [activeTab, setActiveTab] = React.useState<Tab>(tab);

  return (
    <div style={overlay}>
      {/* header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display:'flex', gap:4 }}>
          {([
            ['matches',   'Matches',   <Trophy     size={12}/>],
            ['news',      'News',      <Newspaper  size={12}/>],
            ['standings', 'Standings', <BarChart2  size={12}/>],
            ['players',   'Players',   <UserCircle2 size={12}/>],
          ] as [Tab, string, React.ReactNode][]).map(([k, label, icon]) => (
            <button key={k} onClick={()=>setActiveTab(k)} style={tabBtn(activeTab===k)}>
              {icon}{label}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.35)', display:'flex', padding:4 }} aria-label="Close">
          <X size={16}/>
        </button>
      </div>

      {/* body — max height, scrollable */}
      <div style={{ maxHeight: 420, overflowY:'auto', padding:'12px 16px' }}>

        {/* ── MATCHES ── */}
        {activeTab === 'matches' && (
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {MATCHES.map(m => (
              <div key={m.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:9 }}>
                <span style={{ fontSize:12, color:'#e2e8f0', flex:1 }}>{m.home}</span>
                <div style={{ textAlign:'center', minWidth:80 }}>
                  <div style={{ fontSize:13, fontWeight:700, color: m.status==='live' ? '#fbbf24' : '#f1f5f9', fontFamily:'monospace' }}>{m.score}</div>
                  <div style={{ fontSize:9, color: m.status==='live' ? '#fbbf24' : m.status==='finished' ? 'rgba(255,255,255,0.25)' : '#60a5fa', fontWeight:700, marginTop:2 }}>
                    {m.status==='live' ? `⚡ ${m.time}` : m.time}
                  </div>
                </div>
                <span style={{ fontSize:12, color:'#e2e8f0', flex:1, textAlign:'right' }}>{m.away}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── NEWS ── */}
        {activeTab === 'news' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {NEWS.map(n => (
              <div key={n.id} style={{ padding:'11px 13px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:9 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#f1f5f9', lineHeight:1.4, marginBottom:6 }}>{n.headline}</div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ fontSize:10, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.2)', color:'#93c5fd', padding:'2px 7px', borderRadius:99, fontWeight:600 }}>{n.tag}</span>
                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)' }}>{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── STANDINGS ── */}
        {activeTab === 'standings' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {GROUPS.map(g => (
              <div key={g.name}>
                <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>Group {g.name}</div>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      <th style={{ ...th, textAlign:'left', paddingLeft:4 }}>#  Team</th>
                      <th style={th}>MP</th><th style={th}>W</th><th style={th}>D</th><th style={th}>L</th>
                      <th style={th}>GF</th><th style={th}>GA</th>
                      <th style={{ ...th, color:'#93c5fd' }}>PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.teams.map((t, i) => (
                      <tr key={t.name} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding:'5px 4px', fontSize:12 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                            <span style={{ fontSize:10, color: i<2 ? '#60a5fa' : 'rgba(255,255,255,0.25)', fontWeight:700, minWidth:12 }}>{i+1}</span>
                            <span style={{ fontSize:14 }}>{t.flag}</span>
                            <span style={{ color:'#e2e8f0', fontWeight: i<2 ? 600 : 400 }}>{t.name}</span>
                          </div>
                        </td>
                        {[t.mp,t.w,t.d,t.l,t.gf,t.ga].map((v,vi) => <td key={vi} style={td}>{v}</td>)}
                        <td style={{ ...td, fontWeight:700, color: i<2 ? '#f1f5f9' : 'rgba(255,255,255,0.4)' }}>{t.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* ── PLAYERS ── */}
        {activeTab === 'players' && (
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', marginBottom:8, letterSpacing:'0.06em', textTransform:'uppercase' }}>Top Scorers & Assisters</div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ ...th, textAlign:'left' }}>Player</th>
                  <th style={th}>Pos</th><th style={th}>G</th><th style={th}>A</th>
                </tr>
              </thead>
              <tbody>
                {PLAYERS.map((p, i) => (
                  <tr key={p.name} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding:'7px 4px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)', minWidth:14, fontWeight:700 }}>{i+1}</span>
                        <span style={{ fontSize:16 }}>{p.flag}</span>
                        <div>
                          <div style={{ fontSize:12, fontWeight:600, color:'#f1f5f9' }}>{p.name}</div>
                          <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{p.team}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...td, color:'rgba(255,255,255,0.35)' }}>{p.pos}</td>
                    <td style={{ ...td, fontWeight:700, color:'#f1f5f9' }}>{p.goals}</td>
                    <td style={{ ...td, color:'#93c5fd' }}>{p.assists}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
