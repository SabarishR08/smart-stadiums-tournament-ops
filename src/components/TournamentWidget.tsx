import React, { useState } from 'react';
import { X, Trophy, Newspaper, BarChart2, Goal, Target, Square } from 'lucide-react';

/* ─── types ─────────────────────────────────────────────────────────────── */
type MainTab = 'matches' | 'news' | 'standings' | 'players';
type StatTab = 'goals' | 'assists' | 'yellow' | 'red';
interface Props { onClose: () => void; }

/* ─── DATA ───────────────────────────────────────────────────────────────── */
const MATCHES = [
  { id:1,  home:'🇲🇽 Mexico',      away:'South Africa 🇿🇦',   score:'2–0', time:'FT',    status:'finished' },
  { id:2,  home:'🇦🇷 Argentina',   away:'Austria 🇦🇹',         score:'3–1', time:'FT',    status:'finished' },
  { id:3,  home:'🇫🇷 France',      away:'Norway 🇳🇴',          score:'4–0', time:'FT',    status:'finished' },
  { id:4,  home:'🇧🇷 Brazil',      away:'Morocco 🇲🇦',         score:'–',   time:'19:00', status:'upcoming' },
  { id:5,  home:'🏴󠁧󠁢󠁥󠁮󠁧󠁿 England',     away:'Croatia 🇭🇷',         score:'–',   time:'21:00', status:'upcoming' },
  { id:6,  home:'🇩🇪 Germany',     away:'Ivory Coast 🇨🇮',     score:'2–1', time:"74'",   status:'live'     },
  { id:7,  home:'🇪🇸 Spain',       away:'Cape Verde 🇨🇻',      score:'1–0', time:"31'",   status:'live'     },
  { id:8,  home:'🇨🇴 Colombia',    away:'Portugal 🇵🇹',         score:'1–1', time:'FT',    status:'finished' },
  { id:9,  home:'🇳🇱 Netherlands', away:'Japan 🇯🇵',           score:'3–1', time:'FT',    status:'finished' },
  { id:10, home:'🇧🇪 Belgium',     away:'Egypt 🇪🇬',           score:'2–2', time:'FT',    status:'finished' },
];

const NEWS = [
  { id:1, headline:"Mbappé and Messi both net 8 — golden boot race goes to final day",        time:'1h ago',  tag:'Golden Boot'  },
  { id:2, headline:"Mexico top Group A after dominant 3-match campaign",                      time:'3h ago',  tag:'Group A'      },
  { id:3, headline:"Germany survive scare against Ivory Coast in dramatic Group E finish",    time:'5h ago',  tag:'Group E'      },
  { id:4, headline:"VAR controversy as Brazil draw awarded against Morocco",                  time:'7h ago',  tag:'Brazil'       },
  { id:5, headline:"England top Group L after clinical display vs Croatia",                   time:'9h ago',  tag:'England'      },
  { id:6, headline:"France set tournament scoring record with 10 goals in group stage",       time:'11h ago', tag:'France'       },
  { id:7, headline:"Spain keep clean sheet in all 3 group games — only team to do so",       time:'13h ago', tag:'Spain'        },
  { id:8, headline:"Argentina cruise through Group J — Messi named Player of the Group",     time:'15h ago', tag:'Argentina'    },
];

type Team = { flag:string; name:string; mp:number; w:number; d:number; l:number; gf:number; ga:number; pts:number };
const GROUPS: { name:string; teams:Team[] }[] = [
  { name:'A', teams:[
    { flag:'🇲🇽', name:'Mexico',              mp:3,w:3,d:0,l:0,gf:6, ga:0, pts:9 },
    { flag:'🇿🇦', name:'South Africa',        mp:3,w:1,d:1,l:1,gf:2, ga:3, pts:4 },
    { flag:'🇰🇷', name:'Republic of Korea',   mp:3,w:1,d:0,l:2,gf:2, ga:3, pts:3 },
    { flag:'🇨🇿', name:'Czechia',             mp:3,w:0,d:1,l:2,gf:2, ga:6, pts:1 },
  ]},
  { name:'B', teams:[
    { flag:'🇨🇭', name:'Switzerland',         mp:3,w:2,d:1,l:0,gf:7, ga:3,  pts:7 },
    { flag:'🇨🇦', name:'Canada',              mp:3,w:1,d:1,l:1,gf:8, ga:3,  pts:4 },
    { flag:'🇧🇦', name:'Bosnia & Herz.',      mp:3,w:1,d:1,l:1,gf:5, ga:6,  pts:4 },
    { flag:'🇶🇦', name:'Qatar',               mp:3,w:0,d:1,l:2,gf:2, ga:10, pts:1 },
  ]},
  { name:'C', teams:[
    { flag:'🇧🇷', name:'Brazil',              mp:3,w:2,d:1,l:0,gf:7, ga:1, pts:7 },
    { flag:'🇲🇦', name:'Morocco',             mp:3,w:2,d:1,l:0,gf:6, ga:3, pts:7 },
    { flag:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', name:'Scotland',           mp:3,w:1,d:0,l:2,gf:1, ga:4, pts:3 },
    { flag:'🇭🇹', name:'Haiti',               mp:3,w:0,d:0,l:3,gf:2, ga:8, pts:0 },
  ]},
  { name:'D', teams:[
    { flag:'🇺🇸', name:'USA',                 mp:3,w:2,d:0,l:1,gf:8, ga:4, pts:6 },
    { flag:'🇦🇺', name:'Australia',           mp:3,w:1,d:1,l:1,gf:2, ga:2, pts:4 },
    { flag:'🇵🇾', name:'Paraguay',            mp:3,w:1,d:1,l:1,gf:2, ga:4, pts:4 },
    { flag:'🇹🇷', name:'Türkiye',             mp:3,w:1,d:0,l:2,gf:3, ga:5, pts:3 },
  ]},
  { name:'E', teams:[
    { flag:'🇩🇪', name:'Germany',             mp:3,w:2,d:0,l:1,gf:10,ga:4, pts:6 },
    { flag:'🇨🇮', name:'Ivory Coast',         mp:3,w:2,d:0,l:1,gf:4, ga:2, pts:6 },
    { flag:'🇪🇨', name:'Ecuador',             mp:3,w:1,d:1,l:1,gf:2, ga:2, pts:4 },
    { flag:'🇨🇼', name:'Curaçao',             mp:3,w:0,d:1,l:2,gf:1, ga:9, pts:1 },
  ]},
  { name:'F', teams:[
    { flag:'🇳🇱', name:'Netherlands',         mp:3,w:2,d:1,l:0,gf:10,ga:4,  pts:7 },
    { flag:'🇯🇵', name:'Japan',               mp:3,w:1,d:2,l:0,gf:7, ga:3,  pts:5 },
    { flag:'🇸🇪', name:'Sweden',              mp:3,w:1,d:1,l:1,gf:7, ga:7,  pts:4 },
    { flag:'🇹🇳', name:'Tunisia',             mp:3,w:0,d:0,l:3,gf:2, ga:12, pts:0 },
  ]},
  { name:'G', teams:[
    { flag:'🇧🇪', name:'Belgium',             mp:3,w:1,d:2,l:0,gf:6, ga:2,  pts:5 },
    { flag:'🇪🇬', name:'Egypt',               mp:3,w:1,d:2,l:0,gf:5, ga:3,  pts:5 },
    { flag:'🇮🇷', name:'Iran',                mp:3,w:0,d:3,l:0,gf:3, ga:3,  pts:3 },
    { flag:'🇳🇿', name:'New Zealand',         mp:3,w:0,d:1,l:2,gf:4, ga:10, pts:1 },
  ]},
  { name:'H', teams:[
    { flag:'🇪🇸', name:'Spain',               mp:3,w:2,d:1,l:0,gf:5, ga:0, pts:7 },
    { flag:'🇨🇻', name:'Cape Verde',          mp:3,w:0,d:3,l:0,gf:2, ga:2, pts:3 },
    { flag:'🇺🇾', name:'Uruguay',             mp:3,w:0,d:2,l:1,gf:3, ga:4, pts:2 },
    { flag:'🇸🇦', name:'Saudi Arabia',        mp:3,w:0,d:2,l:1,gf:1, ga:5, pts:2 },
  ]},
  { name:'I', teams:[
    { flag:'🇫🇷', name:'France',              mp:3,w:3,d:0,l:0,gf:10,ga:2,  pts:9 },
    { flag:'🇳🇴', name:'Norway',              mp:3,w:2,d:0,l:1,gf:8, ga:7,  pts:6 },
    { flag:'🇸🇳', name:'Senegal',             mp:3,w:1,d:0,l:2,gf:8, ga:6,  pts:3 },
    { flag:'🇮🇶', name:'Iraq',                mp:3,w:0,d:0,l:3,gf:1, ga:12, pts:0 },
  ]},
  { name:'J', teams:[
    { flag:'🇦🇷', name:'Argentina',           mp:3,w:3,d:0,l:0,gf:8, ga:1, pts:9 },
    { flag:'🇦🇹', name:'Austria',             mp:3,w:1,d:1,l:1,gf:6, ga:6, pts:4 },
    { flag:'🇩🇿', name:'Algeria',             mp:3,w:1,d:1,l:1,gf:5, ga:7, pts:4 },
    { flag:'🇯🇴', name:'Jordan',              mp:3,w:0,d:0,l:3,gf:3, ga:8, pts:0 },
  ]},
  { name:'K', teams:[
    { flag:'🇨🇴', name:'Colombia',            mp:3,w:2,d:1,l:0,gf:4, ga:1,  pts:7 },
    { flag:'🇵🇹', name:'Portugal',            mp:3,w:1,d:2,l:0,gf:6, ga:1,  pts:5 },
    { flag:'🇨🇩', name:'Congo DR',            mp:3,w:1,d:1,l:1,gf:4, ga:3,  pts:4 },
    { flag:'🇺🇿', name:'Uzbekistan',          mp:3,w:0,d:0,l:3,gf:2, ga:11, pts:0 },
  ]},
  { name:'L', teams:[
    { flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', name:'England',           mp:3,w:2,d:1,l:0,gf:6, ga:2, pts:7 },
    { flag:'🇭🇷', name:'Croatia',             mp:3,w:2,d:0,l:1,gf:5, ga:5, pts:6 },
    { flag:'🇬🇭', name:'Ghana',               mp:3,w:1,d:1,l:1,gf:2, ga:2, pts:4 },
    { flag:'🇵🇦', name:'Panama',              mp:3,w:0,d:0,l:3,gf:0, ga:4, pts:0 },
  ]},
];

const GOALS = [
  { flag:'🇫🇷', name:"Kylian Mbappé",        team:'France',      val:8 },
  { flag:'🇦🇷', name:'Lionel Messi',          team:'Argentina',   val:8 },
  { flag:'🇳🇴', name:'Erling Haaland',        team:'Norway',      val:7 },
  { flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', name:'Harry Kane',           team:'England',     val:6 },
  { flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', name:'Jude Bellingham',       team:'England',     val:6 },
  { flag:'🇫🇷', name:'Ousmane Dembélé',       team:'France',      val:5 },
  { flag:'🇸🇳', name:'Ismaïla Sarr',          team:'Senegal',     val:4 },
  { flag:'🇲🇽', name:'Julián Quiñones',       team:'Mexico',      val:4 },
  { flag:'🇪🇸', name:'Mikel Oyarzabal',       team:'Spain',       val:4 },
  { flag:'🇧🇷', name:'Vinicius Jr.',          team:'Brazil',      val:4 },
];

const ASSISTS = [
  { flag:'🇫🇷', name:'Michael Olise',         team:'France',      val:5 },
  { flag:'🇲🇦', name:'Brahim Díaz',           team:'Morocco',     val:4 },
  { flag:'🇧🇷', name:'Bruno Guimarães',       team:'Brazil',      val:4 },
  { flag:'🇳🇴', name:'Martin Ødegaard',       team:'Norway',      val:4 },
  { flag:'🇸🇪', name:'Alexander Isak',        team:'Sweden',      val:3 },
  { flag:'🇳🇴', name:'Andreas Schjelderup',   team:'Norway',      val:3 },
  { flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', name:'Anthony Gordon',        team:'England',     val:3 },
  { flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', name:'Bukayo Saka',            team:'England',     val:3 },
  { flag:'🇩🇪', name:'Florian Wirtz',         team:'Germany',     val:3 },
  { flag:'🇫🇷', name:"Kylian Mbappé",         team:'France',      val:3 },
  { flag:'🇧🇪', name:'Leandro Trossard',      team:'Belgium',     val:3 },
  { flag:'🇲🇽', name:'Roberto Alvarado',      team:'Mexico',      val:3 },
];

const YELLOWS = [
  { flag:'🇲🇦', name:'Issa Diop',             team:'Morocco',     val:3 },
  { flag:'🇺🇿', name:'Abdukodir Khusanov',    team:'Uzbekistan',  val:2 },
  { flag:'🇶🇦', name:'Ahmed Fathy',           team:'Qatar',       val:2 },
  { flag:'🇪🇨', name:'Alan Franco',           team:'Ecuador',     val:2 },
  { flag:'🇮🇶', name:'Amir Alammari',         team:'Iraq',        val:2 },
  { flag:'🇵🇹', name:'Bernardo Silva',        team:'Portugal',    val:2 },
  { flag:'🇬🇭', name:'Caleb Yirenkyi',        team:'Ghana',       val:2 },
  { flag:'🇧🇷', name:'Casemiro',              team:'Brazil',      val:2 },
  { flag:'🇨🇦', name:'Cyle Larin',            team:'Canada',      val:2 },
  { flag:'🇧🇷', name:'Danilo',                team:'Brazil',      val:2 },
  { flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', name:'Declan Rice',           team:'England',     val:2 },
  { flag:'🇨🇭', name:'Denis Zakaria',         team:'Switzerland', val:2 },
  { flag:'🇵🇾', name:'Diego Gómez',           team:'Paraguay',    val:2 },
  { flag:'🇨🇼', name:'Gervane Kastaneer',     team:'Curaçao',     val:2 },
  { flag:'🇨🇭', name:'Granit Xhaka',          team:'Switzerland', val:2 },
  { flag:'🇪🇬', name:'Haissem Hassan',        team:'Egypt',       val:2 },
  { flag:'🇭🇷', name:'Ivan Perišić',          team:'Croatia',     val:2 },
  { flag:'🇨🇼', name:'Juninho Bacuna',        team:'Curaçao',     val:2 },
  { flag:'🇨🇦', name:'Luc De Fougerolles',   team:'Canada',      val:2 },
  { flag:'🇪🇬', name:'Marawan Attia',         team:'Egypt',       val:2 },
  { flag:'🇵🇾', name:'Matías Galarza',        team:'Paraguay',    val:2 },
  { flag:'🇵🇹', name:'Renato Veiga',          team:'Portugal',    val:2 },
  { flag:'🇮🇷', name:'Saeid Ezatolahi',       team:'Iran',        val:2 },
  { flag:'🇨🇻', name:'Sidny Lopes Cabral',    team:'Cape Verde',  val:2 },
  { flag:'🇦🇹', name:'Stefan Posch',          team:'Austria',     val:2 },
  { flag:'🇿🇦', name:'Teboho Mokoena',        team:'South Africa',val:2 },
  { flag:'🇪🇬', name:'Yasser Ibrahim',        team:'Egypt',       val:2 },
];

const REDS = [
  { flag:'🇺🇾', name:'Agustín Canobbio',      team:'Uruguay',     val:1 },
  { flag:'🇶🇦', name:'Assim Madibo',          team:'Qatar',       val:1 },
  { flag:'🇨🇭', name:'Breel Embolo',          team:'Switzerland', val:1 },
  { flag:'🇲🇽', name:'César Montes',          team:'Mexico',      val:1 },
  { flag:'🇺🇸', name:'Folarin Balogun',       team:'USA',         val:1 },
  { flag:'🇶🇦', name:'Homam Ahmed',           team:'Qatar',       val:1 },
  { flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', name:'Jarell Quansah',        team:'England',     val:1 },
  { flag:'🇵🇾', name:'Miguel Almirón',        team:'Paraguay',    val:1 },
  { flag:'🇧🇪', name:'Nathan Ngoy',           team:'Belgium',     val:1 },
  { flag:'🇪🇨', name:'Piero Hincapié',        team:'Ecuador',     val:1 },
  { flag:'🇮🇶', name:'Rebin Sulaka',          team:'Iraq',        val:1 },
  { flag:'🇿🇦', name:'Sphephelo Sithole',     team:'South Africa',val:1 },
  { flag:'🇧🇦', name:'Tarik Muharemović',     team:'Bosnia & Herz.',val:1 },
  { flag:'🇿🇦', name:'Themba Zwane',          team:'South Africa',val:1 },
];

/* ─── styles ─────────────────────────────────────────────────────────────── */
const th: React.CSSProperties = { fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', letterSpacing:'0.07em', textTransform:'uppercase', padding:'5px 7px', textAlign:'center', whiteSpace:'nowrap' };
const td: React.CSSProperties = { fontSize:12, color:'rgba(255,255,255,0.55)', padding:'5px 7px', textAlign:'center' };

const TAB_ICONS: Record<MainTab, React.ReactNode> = {
  matches:   <Trophy    size={12}/>,
  news:      <Newspaper size={12}/>,
  standings: <BarChart2 size={12}/>,
  players:   <Target    size={12}/>,
};
const STAT_ICONS: Record<StatTab, React.ReactNode> = {
  goals:   <Goal   size={11}/>,
  assists: <Target size={11}/>,
  yellow:  <Square size={11} style={{ color:'#fbbf24' }}/>,
  red:     <Square size={11} style={{ color:'#ef4444' }}/>,
};
const STAT_DATA: Record<StatTab, { flag:string; name:string; team:string; val:number }[]> = {
  goals: GOALS, assists: ASSISTS, yellow: YELLOWS, red: REDS,
};
const STAT_LABEL: Record<StatTab, string> = { goals:'Goals', assists:'Assists', yellow:'Yellow Cards', red:'Red Cards' };

/* ─── component ──────────────────────────────────────────────────────────── */
export default function TournamentWidget({ onClose }: Props) {
  const [tab,     setTab]     = useState<MainTab>('standings');
  const [statTab, setStatTab] = useState<StatTab>('goals');

  return (
    /* ── fixed full-screen backdrop ── */
    <div
      style={{ position:'fixed', inset:0, zIndex:999, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px 16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Tournament Hub"
    >
      {/* ── modal card ── */}
      <div style={{ background:'#0d1525', border:'1px solid rgba(255,255,255,0.1)', borderRadius:18, width:'100%', maxWidth:680, maxHeight:'86vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.7)' }}>

        {/* header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#3b82f6,#06b6d4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Trophy size={14} style={{ color:'#fff' }}/>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'#f1f5f9' }}>Tournament Hub</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:1 }}>FIFA World Cup 2026 · Supplementary Info</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:7, padding:6, cursor:'pointer', color:'rgba(255,255,255,0.4)', display:'flex' }} aria-label="Close Tournament Hub">
            <X size={15}/>
          </button>
        </div>

        {/* main tab bar */}
        <div style={{ display:'flex', gap:2, padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0, overflowX:'auto' }}>
          {(['matches','news','standings','players'] as MainTab[]).map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:7, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, whiteSpace:'nowrap',
              background: tab===t ? 'rgba(59,130,246,0.15)' : 'transparent',
              color:       tab===t ? '#93c5fd'               : 'rgba(255,255,255,0.35)',
              transition:'all 0.15s' }}>
              {TAB_ICONS[t]}{t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {/* scrollable body */}
        <div style={{ overflowY:'auto', flex:1, padding:'14px 16px' }}>

          {/* ── MATCHES ─────────────────────────────────────────────── */}
          {tab === 'matches' && (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {['live','upcoming','finished'].map(status => {
                const filtered = MATCHES.filter(m => m.status === status);
                if (!filtered.length) return null;
                const label = status === 'live' ? '⚡ Live Now' : status === 'upcoming' ? '🕐 Upcoming' : '✓ Completed';
                return (
                  <div key={status}>
                    <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6, marginTop:4 }}>{label}</div>
                    {filtered.map(m => (
                      <div key={m.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 13px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:9, marginBottom:5 }}>
                        <span style={{ fontSize:13, color:'#e2e8f0', flex:1 }}>{m.home}</span>
                        <div style={{ textAlign:'center', minWidth:90 }}>
                          <div style={{ fontSize:14, fontWeight:800, color: m.status==='live' ? '#fbbf24' : '#f1f5f9', fontFamily:'monospace' }}>{m.score}</div>
                          <div style={{ fontSize:9, fontWeight:700, marginTop:2, color: m.status==='live' ? '#fbbf24' : m.status==='upcoming' ? '#60a5fa' : 'rgba(255,255,255,0.2)' }}>
                            {m.status==='live' ? `● ${m.time}` : m.time}
                          </div>
                        </div>
                        <span style={{ fontSize:13, color:'#e2e8f0', flex:1, textAlign:'right' }}>{m.away}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── NEWS ────────────────────────────────────────────────── */}
          {tab === 'news' && (
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {NEWS.map(n => (
                <div key={n.id} style={{ padding:'12px 14px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:9 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#f1f5f9', lineHeight:1.45, marginBottom:7 }}>{n.headline}</div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span style={{ fontSize:10, background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.2)', color:'#93c5fd', padding:'2px 8px', borderRadius:99, fontWeight:600 }}>{n.tag}</span>
                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.22)' }}>{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── STANDINGS ───────────────────────────────────────────── */}
          {tab === 'standings' && (
            <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
              {GROUPS.map(g => (
                <div key={g.name}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:'rgba(255,255,255,0.28)', marginBottom:7, display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ background:'rgba(59,130,246,0.15)', border:'1px solid rgba(59,130,246,0.25)', color:'#93c5fd', padding:'1px 7px', borderRadius:99, fontWeight:800 }}>Group {g.name}</span>
                  </div>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ ...th, textAlign:'left', paddingLeft:2 }}>Team</th>
                        <th style={th}>MP</th><th style={th}>W</th><th style={th}>D</th><th style={th}>L</th>
                        <th style={th}>GF</th><th style={th}>GA</th><th style={{ ...th, color:'rgba(59,130,246,0.8)' }}>PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.teams.map((t,i) => {
                        const gd = t.gf - t.ga;
                        return (
                          <tr key={t.name} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding:'5px 2px' }}>
                              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                <span style={{ fontSize:10, fontWeight:700, minWidth:14, color: i<2 ? '#60a5fa' : 'rgba(255,255,255,0.2)' }}>{i+1}</span>
                                <span style={{ fontSize:15 }}>{t.flag}</span>
                                <span style={{ fontSize:12, color: i<2 ? '#e2e8f0' : 'rgba(255,255,255,0.5)', fontWeight: i<2 ? 600 : 400 }}>{t.name}</span>
                              </div>
                            </td>
                            {[t.mp,t.w,t.d,t.l,t.gf,t.ga].map((v,vi) => <td key={vi} style={td}>{v}</td>)}
                            <td style={{ ...td, fontWeight:700, color: i<2 ? '#f1f5f9' : 'rgba(255,255,255,0.35)' }}>{t.pts}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {/* ── PLAYERS ─────────────────────────────────────────────── */}
          {tab === 'players' && (
            <div>
              {/* stat sub-tabs */}
              <div style={{ display:'flex', gap:4, marginBottom:14, flexWrap:'wrap' }}>
                {(['goals','assists','yellow','red'] as StatTab[]).map(s => (
                  <button key={s} onClick={()=>setStatTab(s)} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 11px', borderRadius:7, border:'none', cursor:'pointer', fontSize:11, fontWeight:600,
                    background: statTab===s ? (s==='yellow' ? 'rgba(251,191,36,0.15)' : s==='red' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)') : 'rgba(255,255,255,0.04)',
                    color:       statTab===s ? (s==='yellow' ? '#fde68a'               : s==='red' ? '#fca5a5'              : '#93c5fd')               : 'rgba(255,255,255,0.3)',
                    border:      statTab===s ? `1px solid ${s==='yellow' ? 'rgba(251,191,36,0.3)' : s==='red' ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.25)'}` : '1px solid rgba(255,255,255,0.06)',
                    transition:'all 0.15s' }}>
                    {STAT_ICONS[s]}{STAT_LABEL[s]}
                  </button>
                ))}
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <th style={{ ...th, textAlign:'left' }}>Player</th>
                    <th style={{ ...th, color: statTab==='yellow' ? '#fde68a' : statTab==='red' ? '#fca5a5' : '#93c5fd' }}>{STAT_LABEL[statTab]}</th>
                  </tr>
                </thead>
                <tbody>
                  {STAT_DATA[statTab].map((p,i) => (
                    <tr key={p.name+i} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding:'7px 2px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:10, color:'rgba(255,255,255,0.2)', minWidth:16, fontWeight:700 }}>{i+1}</span>
                          <span style={{ fontSize:16 }}>{p.flag}</span>
                          <div>
                            <div style={{ fontSize:12, fontWeight:600, color:'#f1f5f9' }}>{p.name}</div>
                            <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>{p.team}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...td, fontWeight:700,
                        color: statTab==='yellow' ? '#fde68a' : statTab==='red' ? '#fca5a5' : '#f1f5f9',
                        fontSize:14 }}>{p.val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* footer note */}
        <div style={{ flexShrink:0, padding:'9px 16px', borderTop:'1px solid rgba(255,255,255,0.05)', fontSize:10, color:'rgba(255,255,255,0.18)', textAlign:'center' }}>
          Supplementary tournament data · Not a primary feature · Click outside to close
        </div>
      </div>
    </div>
  );
}
