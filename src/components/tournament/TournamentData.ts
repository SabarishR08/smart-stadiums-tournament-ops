import kalidouKoulibalyPhoto from '../../assets/images/kalidou_koulibaly_1784115606990.jpg';
import judeBellinghamPhoto from '../../assets/images/jude_bellingham_1784115619964.jpg';
import defaultUserPhoto from '../../assets/images/default_user_1784115831811.jpg';

// Country flag CDN mapping and fallback emojis
export const COUNTRY_CODES: Record<string, { code: string; emoji: string }> = {
  "Mexico": { code: "mx", emoji: "🇲🇽" },
  "South Africa": { code: "za", emoji: "🇿🇦" },
  "Republic of Korea": { code: "kr", emoji: "🇰🇷" },
  "Czechia": { code: "cz", emoji: "🇨🇿" },
  "Switzerland": { code: "ch", emoji: "🇨🇭" },
  "Canada": { code: "ca", emoji: "🇨🇦" },
  "Bosnia and Herzegovina": { code: "ba", emoji: "🇧🇦" },
  "Qatar": { code: "qa", emoji: "🇶🇦" },
  "Brazil": { code: "br", emoji: "🇧🇷" },
  "Morocco": { code: "ma", emoji: "🇲🇦" },
  "Scotland": { code: "gb-sct", emoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  "Haiti": { code: "ht", emoji: "🇭🇹" },
  "USA": { code: "us", emoji: "🇺🇸" },
  "Australia": { code: "au", emoji: "🇦🇺" },
  "Paraguay": { code: "py", emoji: "🇵🇾" },
  "Turkiye": { code: "tr", emoji: "🇹🇷" },
  "Germany": { code: "de", emoji: "🇩🇪" },
  "Ivory Coast": { code: "ci", emoji: "🇨🇮" },
  "Ecuador": { code: "ec", emoji: "🇪🇨" },
  "Curacao": { code: "cw", emoji: "🇨🇼" },
  "Netherlands": { code: "nl", emoji: "🇳🇱" },
  "Japan": { code: "jp", emoji: "🇯🇵" },
  "Sweden": { code: "se", emoji: "🇸🇪" },
  "Tunisia": { code: "tn", emoji: "🇹🇳" },
  "Belgium": { code: "be", emoji: "🇧🇪" },
  "Egypt": { code: "eg", emoji: "🇪🇬" },
  "Iran": { code: "ir", emoji: "🇮🇷" },
  "New Zealand": { code: "nz", emoji: "🇳🇿" },
  "Spain": { code: "es", emoji: "🇪🇸" },
  "Cape Verde": { code: "cv", emoji: "🇨🇻" },
  "Uruguay": { code: "uy", emoji: "🇺🇾" },
  "Saudi Arabia": { code: "sa", emoji: "🇸🇦" },
  "France": { code: "fr", emoji: "🇫🇷" },
  "Norway": { code: "no", emoji: "🇳🇴" },
  "Senegal": { code: "sn", emoji: "🇸🇳" },
  "Iraq": { code: "iq", emoji: "🇮🇶" },
  "Argentina": { code: "ar", emoji: "🇦🇷" },
  "Austria": { code: "at", emoji: "🇦🇹" },
  "Algeria": { code: "dz", emoji: "🇩🇿" },
  "Jordan": { code: "jo", emoji: "🇯🇴" },
  "Colombia": { code: "co", emoji: "🇨🇴" },
  "Portugal": { code: "pt", emoji: "🇵🇹" },
  "Congo DR": { code: "cd", emoji: "🇨🇩" },
  "Uzbekistan": { code: "uz", emoji: "🇺🇿" },
  "England": { code: "gb-eng", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Croatia": { code: "hr", emoji: "🇭🇷" },
  "Ghana": { code: "gh", emoji: "🇬🇭" },
  "Panama": { code: "pa", emoji: "🇵🇦" }
};

export interface TeamStanding {
  name: string;
  mp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  form: Array<{ outcome: 'W' | 'D' | 'L'; opponent: string; score: string; date: string }>;
}

export interface Group {
  letter: string;
  teams: TeamStanding[];
}

export const GROUP_TEAMS: Record<string, string[]> = {
  "A": ["Mexico", "South Africa", "Republic of Korea", "Czechia"],
  "B": ["Switzerland", "Canada", "Bosnia and Herzegovina", "Qatar"],
  "C": ["Brazil", "Morocco", "Scotland", "Haiti"],
  "D": ["USA", "Australia", "Paraguay", "Turkiye"],
  "E": ["Germany", "Ivory Coast", "Ecuador", "Curacao"],
  "F": ["Netherlands", "Japan", "Sweden", "Tunisia"],
  "G": ["Belgium", "Egypt", "Iran", "New Zealand"],
  "H": ["Spain", "Cape Verde", "Uruguay", "Saudi Arabia"],
  "I": ["France", "Norway", "Senegal", "Iraq"],
  "J": ["Argentina", "Austria", "Algeria", "Jordan"],
  "K": ["Colombia", "Portugal", "Congo DR", "Uzbekistan"],
  "L": ["England", "Croatia", "Ghana", "Panama"]
};

export interface PlayerStat {
  rank: number;
  name: string;
  country: string;
  value: number;
  photo?: string;
  isGoat?: boolean;
}

export const PLAYER_STATS_DATA = {
  goals: [
    { rank: 1, name: "Lionel Messi", country: "Argentina", value: 8, photo: "/players/liomessi.png", isGoat: true },
    { rank: 2, name: "Kylian Mbappé", country: "France", value: 8, photo: "/players/mbappe.png" },
    { rank: 3, name: "Erling Haaland", country: "Norway", value: 7, photo: "/players/erling_haaland.jpg" },
    { rank: 4, name: "Harry Kane", country: "England", value: 6, photo: "/players/harry_kane.png" },
    { rank: 5, name: "Jude Bellingham", country: "England", value: 6, photo: "/players/jude_bellingham.png" },
    { rank: 6, name: "Ousmane Dembélé", country: "France", value: 5, photo: "/players/ousmane_dembele.png" },
    { rank: 7, name: "Ismaila Sarr", country: "Senegal", value: 4, photo: "/players/ismaila_sarr.png" },
    { rank: 8, name: "Julian Álvarez", country: "Mexico", value: 4, photo: "/players/julian_alvarez.jpg" },
    { rank: 9, name: "Mikel Oyarzabal", country: "Spain", value: 4, photo: "/players/mikel_oyarzabal.jpg" },
    { rank: 10, name: "Vinícius Júnior", country: "Brazil", value: 4, photo: "/players/vinicius_jr.jpg" }
  ] as PlayerStat[],
  assists: [
    { rank: 1, name: "Lionel Messi", country: "Argentina", value: 4, photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80" },
    { rank: 2, name: "Antoine Griezmann", country: "France", value: 3 },
    { rank: 3, name: "Jude Bellingham", country: "England", value: 3, photo: judeBellinghamPhoto },
    { rank: 4, name: "Bruno Fernandes", country: "Portugal", value: 3 },
    { rank: 5, name: "Kevin De Bruyne", country: "Belgium", value: 2 },
    { rank: 6, name: "Neymar Jr", country: "Brazil", value: 2 }
  ] as PlayerStat[],
  yellowCards: [
    { rank: 1, name: "Casemiro", country: "Brazil", value: 2 },
    { rank: 2, name: "Kalidou Koulibaly", country: "Senegal", value: 2, photo: kalidouKoulibalyPhoto },
    { rank: 3, name: "Antonio Rüdiger", country: "Germany", value: 2 },
    { rank: 4, name: "Cristian Romero", country: "Argentina", value: 2 },
    { rank: 5, name: "Pepe", country: "Portugal", value: 1 }
  ] as PlayerStat[],
  redCards: [
    { rank: 1, name: "Denzel Dumfries", country: "Netherlands", value: 1 },
    { rank: 2, name: "Granit Xhaka", country: "Switzerland", value: 1 },
    { rank: 3, name: "Harry Maguire", country: "England", value: 1 }
  ] as PlayerStat[]
};

export const NEWS_DATA = [
  {
    id: 1,
    headline: "What soccer games are today? Breaking down World Cup schedule for July 15",
    category: "Schedule",
    time: "1h ago • USA TODAY on MSN",
    summary: "The World Cup continues on Monday with two matchups. Here's everything you need to know before kickoff.",
    thumbnail: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&h=200&q=80"
  },
  {
    id: 2,
    headline: "What channel is England vs Argentina soccer game on today? World Cup time, TV schedule",
    category: "How to Watch",
    time: "1h ago • Yahoo Sports",
    summary: "What channel is the England soccer game vs Argentina on July 15 in the 2026 World Cup? Here's how to watch, including time, venue details, and live streaming options.",
    thumbnail: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=300&h=200&q=80"
  },
  {
    id: 3,
    headline: "FIFA World Cup 2026 Final Halftime: When, Where To Watch Historic Show - Ft BTS, Shakira, Justin Bieber, Madonna",
    category: "Entertainment",
    time: "1h ago • Times Now",
    summary: "The FIFA World Cup 2026 final will feature the tournament's first-ever halftime show, headlined by BTS, Madonna, Shakira, and Justin Bieber in a historic stadium performance.",
    thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=300&h=200&q=80"
  },
  {
    id: 4,
    headline: "FIFA World Cup brackets: Teams, predictions, schedule and road to the final",
    category: "Brackets",
    time: "1h ago • Al Jazeera on MSN",
    summary: "Spain booked its place in the World Cup final while England and Argentina prepare for the game at Atlanta stadium.",
    thumbnail: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=300&h=200&q=80"
  },
  {
    id: 5,
    headline: "How to watch today’s World Cup semifinal match: Wednesday, July 15 - England vs Argentina",
    category: "Match Coverage",
    time: "1h ago • FOX 7 Austin",
    summary: "The FIFA World Cup semifinals continue today with one match between England and Argentina on the pitch at Atlanta Stadium.",
    thumbnail: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=300&h=200&q=80"
  },
  {
    id: 6,
    headline: "2026 World Cup July 14 schedule: Soccer games today",
    category: "Schedule",
    time: "22h ago • ESPN on MSN",
    summary: "What is the World Cup schedule today? Find out more about Tuesday's semifinal match.",
    thumbnail: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&h=200&q=80"
  },
  {
    id: 7,
    headline: "World Cup half time show: When is the World Cup final, who is performing, how to watch and stream",
    category: "Entertainment",
    time: "18h ago • The Scotsman",
    summary: "Here’s everything you need to know about the World Cup 2026 closing ceremony taking place in the United States this weekend.",
    thumbnail: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=300&h=200&q=80"
  },
  {
    id: 8,
    headline: "World Cup semifinal backlash as US fans fume and demand change to European-friendly schedule",
    category: "Fan Backlash",
    time: "1d ago • Talksport",
    summary: "Soccer fans across the United States have shared frustration over kick-off times for the four remaining World Cup games. The US supporters are calling for scheduling reforms.",
    thumbnail: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=300&h=200&q=80"
  },
  {
    id: 9,
    headline: "Fifa World Cup 2026 Semi Final Fixtures Bd Schedule",
    category: "Schedule",
    time: "10h ago • India TV News",
    summary: "Articles on Fifa World Cup 2026 Semi Final Fixtures Bd Schedule, Complete Coverage on Fifa World Cup 2026 Semi Final Fixtures Bd Schedule ...",
    thumbnail: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&h=200&q=80"
  }
];

export interface Match {
  id: string;
  status: 'live' | 'upcoming' | 'completed';
  stage: string;
  teamA: string;
  teamB: string;
  score?: string;
  time: string;
  date: string;
  venue: string;
  possession?: string;
  shots?: string;
  corners?: string;
  yellowCards?: string;
  redCards?: string;
}

export function getVenue(id: string, stage: string, teamA: string): string {
  const stadiums = [
    "MetLife Stadium, New York/New Jersey",
    "Estadio Azteca, Mexico City",
    "SoFi Stadium, Los Angeles",
    "AT&T Stadium, Dallas",
    "Mercedes-Benz Stadium, Atlanta",
    "Hard Rock Stadium, Miami",
    "BC Place, Vancouver",
    "BMO Field, Toronto",
    "Estadio Akron, Guadalajara",
    "Estadio BBVA, Monterrey",
    "Lumen Field, Seattle",
    "Levi's Stadium, San Francisco",
    "NRG Stadium, Houston",
    "Arrowhead Stadium, Kansas City",
    "Lincoln Financial Field, Philadelphia",
    "Gillette Stadium, Boston"
  ];
  let hash = 0;
  const str = teamA + stage + id;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % stadiums.length;
  return stadiums[index];
}

const RAW_MATCHES = [
  // --- Group A ---
  { id: "gA1", status: "completed", stage: "Group A", teamA: "Mexico", teamB: "South Africa", score: "2 - 0", time: "FT", date: "Fri, Jun 12" },
  { id: "gA2", status: "completed", stage: "Group A", teamA: "Republic of Korea", teamB: "Czechia", score: "2 - 1", time: "FT", date: "Fri, Jun 12" },
  { id: "gA3", status: "completed", stage: "Group A", teamA: "Czechia", teamB: "South Africa", score: "1 - 1", time: "FT", date: "Thu, Jun 18" },
  { id: "gA4", status: "completed", stage: "Group A", teamA: "Mexico", teamB: "Republic of Korea", score: "1 - 0", time: "FT", date: "Fri, Jun 19" },
  { id: "gA5", status: "completed", stage: "Group A", teamA: "Czechia", teamB: "Mexico", score: "0 - 3", time: "FT", date: "Thu, Jun 25" },
  { id: "gA6", status: "completed", stage: "Group A", teamA: "South Africa", teamB: "Republic of Korea", score: "1 - 0", time: "FT", date: "Thu, Jun 25" },

  // --- Group B ---
  { id: "gB1", status: "completed", stage: "Group B", teamA: "Canada", teamB: "Bosnia and Herzegovina", score: "1 - 1", time: "FT", date: "Sat, Jun 13" },
  { id: "gB2", status: "completed", stage: "Group B", teamA: "Qatar", teamB: "Switzerland", score: "1 - 1", time: "FT", date: "Sun, Jun 14" },
  { id: "gB3", status: "completed", stage: "Group B", teamA: "Switzerland", teamB: "Bosnia and Herzegovina", score: "4 - 1", time: "FT", date: "Fri, Jun 19" },
  { id: "gB4", status: "completed", stage: "Group B", teamA: "Canada", teamB: "Qatar", score: "6 - 0", time: "FT", date: "Fri, Jun 19" },
  { id: "gB5", status: "completed", stage: "Group B", teamA: "Switzerland", teamB: "Canada", score: "2 - 1", time: "FT", date: "Thu, Jun 25" },
  { id: "gB6", status: "completed", stage: "Group B", teamA: "Bosnia and Herzegovina", teamB: "Qatar", score: "3 - 1", time: "FT", date: "Thu, Jun 25" },

  // --- Group C ---
  { id: "gC1", status: "completed", stage: "Group C", teamA: "Brazil", teamB: "Morocco", score: "1 - 1", time: "FT", date: "Sun, Jun 14" },
  { id: "gC2", status: "completed", stage: "Group C", teamA: "Haiti", teamB: "Scotland", score: "0 - 1", time: "FT", date: "Sun, Jun 14" },
  { id: "gC3", status: "completed", stage: "Group C", teamA: "Scotland", teamB: "Morocco", score: "0 - 1", time: "FT", date: "Sat, Jun 20" },
  { id: "gC4", status: "completed", stage: "Group C", teamA: "Brazil", teamB: "Haiti", score: "3 - 0", time: "FT", date: "Sat, Jun 20" },
  { id: "gC5", status: "completed", stage: "Group C", teamA: "Scotland", teamB: "Brazil", score: "0 - 3", time: "FT", date: "Thu, Jun 25" },
  { id: "gC6", status: "completed", stage: "Group C", teamA: "Morocco", teamB: "Haiti", score: "4 - 2", time: "FT", date: "Thu, Jun 25" },

  // --- Group D ---
  { id: "gD1", status: "completed", stage: "Group D", teamA: "USA", teamB: "Paraguay", score: "4 - 1", time: "FT", date: "Sat, Jun 13" },
  { id: "gD2", status: "completed", stage: "Group D", teamA: "Australia", teamB: "Turkiye", score: "2 - 0", time: "FT", date: "Sun, Jun 14" },
  { id: "gD3", status: "completed", stage: "Group D", teamA: "USA", teamB: "Australia", score: "2 - 0", time: "FT", date: "Sat, Jun 20" },
  { id: "gD4", status: "completed", stage: "Group D", teamA: "Turkiye", teamB: "Paraguay", score: "0 - 1", time: "FT", date: "Sat, Jun 20" },
  { id: "gD5", status: "completed", stage: "Group D", teamA: "Turkiye", teamB: "USA", score: "3 - 2", time: "FT", date: "Fri, Jun 26" },
  { id: "gD6", status: "completed", stage: "Group D", teamA: "Paraguay", teamB: "Australia", score: "0 - 0", time: "FT", date: "Fri, Jun 26" },

  // --- Group E ---
  { id: "gE1", status: "completed", stage: "Group E", teamA: "Germany", teamB: "Curacao", score: "7 - 1", time: "FT", date: "Sun, Jun 14" },
  { id: "gE2", status: "completed", stage: "Group E", teamA: "Ivory Coast", teamB: "Ecuador", score: "1 - 0", time: "FT", date: "Mon, Jun 15" },
  { id: "gE3", status: "completed", stage: "Group E", teamA: "Germany", teamB: "Ivory Coast", score: "2 - 1", time: "FT", date: "Sun, Jun 21" },
  { id: "gE4", status: "completed", stage: "Group E", teamA: "Ecuador", teamB: "Curacao", score: "0 - 0", time: "FT", date: "Sun, Jun 21" },
  { id: "gE5", status: "completed", stage: "Group E", teamA: "Curacao", teamB: "Ivory Coast", score: "0 - 2", time: "FT", date: "Fri, Jun 26" },
  { id: "gE6", status: "completed", stage: "Group E", teamA: "Ecuador", teamB: "Germany", score: "2 - 1", time: "FT", date: "Fri, Jun 26" },

  // --- Group F ---
  { id: "gF1", status: "completed", stage: "Group F", teamA: "Netherlands", teamB: "Japan", score: "2 - 2", time: "FT", date: "Mon, Jun 15" },
  { id: "gF2", status: "completed", stage: "Group F", teamA: "Sweden", teamB: "Tunisia", score: "5 - 1", time: "FT", date: "Mon, Jun 15" },
  { id: "gF3", status: "completed", stage: "Group F", teamA: "Netherlands", teamB: "Sweden", score: "5 - 1", time: "FT", date: "Sat, Jun 20" },
  { id: "gF4", status: "completed", stage: "Group F", teamA: "Tunisia", teamB: "Japan", score: "0 - 4", time: "FT", date: "Sun, Jun 21" },
  { id: "gF5", status: "completed", stage: "Group F", teamA: "Japan", teamB: "Sweden", score: "1 - 1", time: "FT", date: "Fri, Jun 26" },
  { id: "gF6", status: "completed", stage: "Group F", teamA: "Tunisia", teamB: "Netherlands", score: "1 - 3", time: "FT", date: "Fri, Jun 26" },

  // --- Group G ---
  { id: "gG1", status: "completed", stage: "Group G", teamA: "Belgium", teamB: "Egypt", score: "1 - 1", time: "FT", date: "Tue, Jun 16" },
  { id: "gG2", status: "completed", stage: "Group G", teamA: "Iran", teamB: "New Zealand", score: "2 - 2", time: "FT", date: "Tue, Jun 16" },
  { id: "gG3", status: "completed", stage: "Group G", teamA: "Belgium", teamB: "Iran", score: "0 - 0", time: "FT", date: "Mon, Jun 22" },
  { id: "gG4", status: "completed", stage: "Group G", teamA: "New Zealand", teamB: "Egypt", score: "1 - 3", time: "FT", date: "Mon, Jun 22" },
  { id: "gG5", status: "completed", stage: "Group G", teamA: "Egypt", teamB: "Iran", score: "1 - 1", time: "FT", date: "Sat, Jun 27" },
  { id: "gG6", status: "completed", stage: "Group G", teamA: "New Zealand", teamB: "Belgium", score: "1 - 5", time: "FT", date: "Sat, Jun 27" },

  // --- Group H ---
  { id: "gH1", status: "completed", stage: "Group H", teamA: "Spain", teamB: "Cape Verde", score: "0 - 0", time: "FT", date: "Mon, Jun 15" },
  { id: "gH2", status: "completed", stage: "Group H", teamA: "Saudi Arabia", teamB: "Uruguay", score: "1 - 1", time: "FT", date: "Tue, Jun 16" },
  { id: "gH3", status: "completed", stage: "Group H", teamA: "Spain", teamB: "Saudi Arabia", score: "4 - 0", time: "FT", date: "Sun, Jun 21" },
  { id: "gH4", status: "completed", stage: "Group H", teamA: "Uruguay", teamB: "Cape Verde", score: "2 - 2", time: "FT", date: "Mon, Jun 22" },
  { id: "gH5", status: "completed", stage: "Group H", teamA: "Uruguay", teamB: "Spain", score: "0 - 1", time: "FT", date: "Sat, Jun 27" },
  { id: "gH6", status: "completed", stage: "Group H", teamA: "Cape Verde", teamB: "Saudi Arabia", score: "0 - 0", time: "FT", date: "Sat, Jun 27" },

  // --- Group I ---
  { id: "gI1", status: "completed", stage: "Group I", teamA: "France", teamB: "Senegal", score: "3 - 1", time: "FT", date: "Wed, Jun 17" },
  { id: "gI2", status: "completed", stage: "Group I", teamA: "Iraq", teamB: "Norway", score: "1 - 4", time: "FT", date: "Wed, Jun 17" },
  { id: "gI3", status: "completed", stage: "Group I", teamA: "France", teamB: "Iraq", score: "3 - 0", time: "FT", date: "Tue, Jun 23" },
  { id: "gI4", status: "completed", stage: "Group I", teamA: "Norway", teamB: "Senegal", score: "3 - 2", time: "FT", date: "Tue, Jun 23" },
  { id: "gI5", status: "completed", stage: "Group I", teamA: "Norway", teamB: "France", score: "1 - 4", time: "FT", date: "Sat, Jun 27" },
  { id: "gI6", status: "completed", stage: "Group I", teamA: "Senegal", teamB: "Iraq", score: "5 - 0", time: "FT", date: "Sat, Jun 27" },

  // --- Group J ---
  { id: "gJ1", status: "completed", stage: "Group J", teamA: "Argentina", teamB: "Algeria", score: "3 - 0", time: "FT", date: "Wed, Jun 17" },
  { id: "gJ2", status: "completed", stage: "Group J", teamA: "Austria", teamB: "Jordan", score: "3 - 1", time: "FT", date: "Wed, Jun 17" },
  { id: "gJ3", status: "completed", stage: "Group J", teamA: "Argentina", teamB: "Austria", score: "2 - 0", time: "FT", date: "Mon, Jun 22" },
  { id: "gJ4", status: "completed", stage: "Group J", teamA: "Jordan", teamB: "Algeria", score: "1 - 2", time: "FT", date: "Tue, Jun 23" },
  { id: "gJ5", status: "completed", stage: "Group J", teamA: "Jordan", teamB: "Argentina", score: "1 - 3", time: "FT", date: "Sun, Jun 28" },
  { id: "gJ6", status: "completed", stage: "Group J", teamA: "Algeria", teamB: "Austria", score: "3 - 3", time: "FT", date: "Sun, Jun 28" },

  // --- Group K ---
  { id: "gK1", status: "completed", stage: "Group K", teamA: "Portugal", teamB: "Congo DR", score: "1 - 1", time: "FT", date: "Wed, Jun 17" },
  { id: "gK2", status: "completed", stage: "Group K", teamA: "Uzbekistan", teamB: "Colombia", score: "1 - 3", time: "FT", date: "Thu, Jun 18" },
  { id: "gK3", status: "completed", stage: "Group K", teamA: "Portugal", teamB: "Uzbekistan", score: "5 - 0", time: "FT", date: "Tue, Jun 23" },
  { id: "gK4", status: "completed", stage: "Group K", teamA: "Colombia", teamB: "Congo DR", score: "1 - 0", time: "FT", date: "Wed, Jun 24" },
  { id: "gK5", status: "completed", stage: "Group K", teamA: "Congo DR", teamB: "Uzbekistan", score: "3 - 1", time: "FT", date: "Sun, Jun 28" },
  { id: "gK6", status: "completed", stage: "Group K", teamA: "Colombia", teamB: "Portugal", score: "0 - 0", time: "FT", date: "Sun, Jun 28" },

  // --- Group L ---
  { id: "gL1", status: "completed", stage: "Group L", teamA: "England", teamB: "Croatia", score: "4 - 2", time: "FT", date: "Thu, Jun 18" },
  { id: "gL2", status: "completed", stage: "Group L", teamA: "Ghana", teamB: "Panama", score: "1 - 0", time: "FT", date: "Thu, Jun 18" },
  { id: "gL3", status: "completed", stage: "Group L", teamA: "England", teamB: "Ghana", score: "0 - 0", time: "FT", date: "Wed, Jun 24" },
  { id: "gL4", status: "completed", stage: "Group L", teamA: "Panama", teamB: "Croatia", score: "0 - 1", time: "FT", date: "Wed, Jun 24" },
  { id: "gL5", status: "completed", stage: "Group L", teamA: "Panama", teamB: "England", score: "0 - 2", time: "FT", date: "Sun, Jun 28" },
  { id: "gL6", status: "completed", stage: "Group L", teamA: "Croatia", teamB: "Ghana", score: "2 - 1", time: "FT", date: "Sun, Jun 28" },

  // --- Round of 32 ---
  { id: "r32_1", status: "completed", stage: "Round of 32", teamA: "South Africa", teamB: "Canada", score: "0 - 1", time: "FT", date: "Mon, Jun 29" },
  { id: "r32_2", status: "completed", stage: "Round of 32", teamA: "Brazil", teamB: "Japan", score: "2 - 1", time: "FT", date: "Mon, Jun 29" },
  { id: "r32_3", status: "completed", stage: "Round of 32", teamA: "Germany", teamB: "Paraguay", score: "1 (3) - 1 (4)", time: "FT (PEN)", date: "Tue, Jun 30" },
  { id: "r32_4", status: "completed", stage: "Round of 32", teamA: "Netherlands", teamB: "Morocco", score: "1 (2) - 1 (3)", time: "FT (PEN)", date: "Tue, Jun 30" },
  { id: "r32_5", status: "completed", stage: "Round of 32", teamA: "Ivory Coast", teamB: "Norway", score: "1 - 2", time: "FT", date: "Tue, Jun 30" },
  { id: "r32_6", status: "completed", stage: "Round of 32", teamA: "France", teamB: "Sweden", score: "3 - 0", time: "FT", date: "Wed, Jul 1" },
  { id: "r32_7", status: "completed", stage: "Round of 32", teamA: "Mexico", teamB: "Ecuador", score: "2 - 0", time: "FT", date: "Wed, Jul 1" },
  { id: "r32_8", status: "completed", stage: "Round of 32", teamA: "England", teamB: "Congo DR", score: "2 - 1", time: "FT", date: "Wed, Jul 1" },
  { id: "r32_9", status: "completed", stage: "Round of 32", teamA: "Belgium", teamB: "Senegal", score: "3 - 2", time: "FT", date: "Thu, Jul 2" },
  { id: "r32_10", status: "completed", stage: "Round of 32", teamA: "USA", teamB: "Bosnia and Herzegovina", score: "2 - 0", time: "FT", date: "Thu, Jul 2" },
  { id: "r32_11", status: "completed", stage: "Round of 32", teamA: "Spain", teamB: "Austria", score: "3 - 0", time: "FT", date: "Fri, Jul 3" },
  { id: "r32_12", status: "completed", stage: "Round of 32", teamA: "Portugal", teamB: "Croatia", score: "2 - 1", time: "FT", date: "Fri, Jul 3" },
  { id: "r32_13", status: "completed", stage: "Round of 32", teamA: "Switzerland", teamB: "Algeria", score: "2 - 0", time: "FT", date: "Fri, Jul 3" },
  { id: "r32_14", status: "completed", stage: "Round of 32", teamA: "Australia", teamB: "Egypt", score: "1 (2) - 1 (4)", time: "FT (PEN)", date: "Fri, Jul 3" },
  { id: "r32_15", status: "completed", stage: "Round of 32", teamA: "Argentina", teamB: "Cape Verde", score: "3 - 2", time: "FT", date: "Sat, Jul 4" },
  { id: "r32_16", status: "completed", stage: "Round of 32", teamA: "Colombia", teamB: "Ghana", score: "1 - 0", time: "FT", date: "Sat, Jul 4" },

  // --- Round of 16 ---
  { id: "r16_1", status: "completed", stage: "Round of 16", teamA: "Canada", teamB: "Morocco", score: "0 - 3", time: "FT", date: "Sat, Jul 4" },
  { id: "r16_2", status: "completed", stage: "Round of 16", teamA: "Paraguay", teamB: "France", score: "0 - 1", time: "FT", date: "Sun, Jul 5" },
  { id: "r16_3", status: "completed", stage: "Round of 16", teamA: "Brazil", teamB: "Norway", score: "1 - 2", time: "FT", date: "Mon, Jul 6" },
  { id: "r16_4", status: "completed", stage: "Round of 16", teamA: "Mexico", teamB: "England", score: "2 - 3", time: "FT", date: "Mon, Jul 6" },
  { id: "r16_5", status: "completed", stage: "Round of 16", teamA: "Portugal", teamB: "Spain", score: "0 - 1", time: "FT", date: "Tue, Jul 7" },
  { id: "r16_6", status: "completed", stage: "Round of 16", teamA: "USA", teamB: "Belgium", score: "1 - 4", time: "FT", date: "Tue, Jul 7" },
  { id: "r16_7", status: "completed", stage: "Round of 16", teamA: "Argentina", teamB: "Egypt", score: "3 - 2", time: "FT", date: "Tue, Jul 7" },
  { id: "r16_8", status: "completed", stage: "Round of 16", teamA: "Switzerland", teamB: "Colombia", score: "0 (4) - 0 (3)", time: "FT (PEN)", date: "Wed, Jul 8" },

  // --- Quarterfinals ---
  { id: "qf_1", status: "completed", stage: "Quarterfinals", teamA: "France", teamB: "Morocco", score: "2 - 0", time: "FT", date: "Fri, Jul 10" },
  { id: "qf_2", status: "completed", stage: "Quarterfinals", teamA: "Spain", teamB: "Belgium", score: "2 - 1", time: "FT", date: "Sat, Jul 11" },
  { id: "qf_3", status: "completed", stage: "Quarterfinals", teamA: "Norway", teamB: "England", score: "1 - 2", time: "FT", date: "Sun, Jul 12" },
  { id: "qf_4", status: "completed", stage: "Quarterfinals", teamA: "Argentina", teamB: "Switzerland", score: "3 - 1", time: "FT", date: "Sun, Jul 12" },

  // --- Semifinals ---
  { id: "sf_1", status: "completed", stage: "Semifinals", teamA: "France", teamB: "Spain", score: "0 - 2", time: "FT", date: "Wed, Jul 15" },
  { id: "sf_2", status: "upcoming", stage: "Semifinals", teamA: "England", teamB: "Argentina", score: undefined, time: "12:30 AM", date: "Thu, Jul 16" },

  // --- 3rd Place Play-off ---
  { id: "tpo", status: "upcoming", stage: "3rd Place Play-off", teamA: "France", teamB: "TBD", score: undefined, time: "2:30 AM", date: "Sun, Jul 19" },

  // --- Final ---
  { id: "fin", status: "upcoming", stage: "Final", teamA: "Spain", teamB: "TBD", score: undefined, time: "12:30 AM", date: "Mon, Jul 20" }
];

export const MATCHES_DATA: Match[] = RAW_MATCHES.map(m => {
  // Deterministic live stats generator for completed matches to enrich UI view
  const isPenalties = m.score && m.score.includes('(');
  const coreScore = isPenalties ? m.score.replace(/\s*\(\d+\)\s*/g, '') : m.score;
  const scoreParts = coreScore ? coreScore.split(' - ') : null;
  const valA = scoreParts ? parseInt(scoreParts[0]) : 0;
  const valB = scoreParts ? parseInt(scoreParts[1]) : 0;

  return {
    ...m,
    status: m.status as 'live' | 'upcoming' | 'completed',
    venue: getVenue(m.id, m.stage, m.teamA),
    possession: m.score ? `${40 + Math.round((valA / (valA + valB + 1)) * 10 + Math.random() * 10)}% - ${60 - Math.round((valA / (valA + valB + 1)) * 10 + Math.random() * 10)}%` : undefined,
    shots: m.score ? `${valA * 3 + 5 + Math.round(Math.random() * 5)} - ${valB * 3 + 3 + Math.round(Math.random() * 5)}` : undefined,
    corners: m.score ? `${3 + valA + Math.round(Math.random() * 4)} - ${2 + valB + Math.round(Math.random() * 4)}` : undefined,
    yellowCards: m.score ? `${Math.round(Math.random() * 3)} - ${Math.round(Math.random() * 4)}` : undefined,
    redCards: m.score ? (Math.random() > 0.95 ? "1 - 0" : "0 - 0") : undefined
  };
});
