import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Search, 
  Trophy, 
  Calendar, 
  Newspaper, 
  Users as UsersIcon,
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Award,
  Filter,
  Minimize2,
  Maximize2,
  BookOpen
} from 'lucide-react';

import erlingHaalandPhoto from '../assets/images/erling_haaland_1784115571531.jpg';
import harryKanePhoto from '../assets/images/harry_kane_1784115591212.jpg';
import kalidouKoulibalyPhoto from '../assets/images/kalidou_koulibaly_1784115606990.jpg';
import judeBellinghamPhoto from '../assets/images/jude_bellingham_1784115619964.jpg';
import defaultUserPhoto from '../assets/images/default_user_1784115831811.jpg';

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

interface TeamStanding {
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

interface Group {
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

interface PlayerStat {
  rank: number;
  name: string;
  country: string;
  value: number;
  photo?: string;
  isGoat?: boolean;
}

const PLAYER_STATS_DATA = {
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

const NEWS_DATA = [
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

interface Match {
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

const MATCHES_DATA: Match[] = RAW_MATCHES.map(m => {
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

interface TournamentHubProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'matches' | 'news' | 'standings' | 'players' | 'bracket';
}

export default function TournamentHub({ isOpen, onClose, defaultTab }: TournamentHubProps) {
  const [activeTab, setActiveTab] = useState<'matches' | 'news' | 'standings' | 'players' | 'bracket'>('matches');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ "A": true });
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [playersTab, setPlayersTab] = useState<'goals' | 'assists' | 'yellow' | 'red'>('goals');
  const [filterQualifiedOnly, setFilterQualifiedOnly] = useState(false);
  const [matchStageFilter, setMatchStageFilter] = useState<string>('All');

  // Filtered matches based on stage filter & search queries
  const filteredMatches = useMemo(() => {
    return MATCHES_DATA.filter(m => {
      // Search query filter first
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesA = m.teamA.toLowerCase().includes(q);
        const matchesB = m.teamB.toLowerCase().includes(q);
        const matchesStage = m.stage.toLowerCase().includes(q);
        const matchesVenue = m.venue.toLowerCase().includes(q);
        if (!matchesA && !matchesB && !matchesStage && !matchesVenue) {
          return false;
        }
      }
      
      // Stage filter
      if (matchStageFilter === 'All') return true;
      if (matchStageFilter === 'Groups') return m.stage.startsWith('Group');
      if (matchStageFilter === 'R32') return m.stage === 'Round of 32';
      if (matchStageFilter === 'R16') return m.stage === 'Round of 16';
      if (matchStageFilter === 'QF') return m.stage === 'Quarterfinals';
      if (matchStageFilter === 'SF/Finals') return ['Semifinals', '3rd Place Play-off', 'Final'].includes(m.stage);
      return true;
    });
  }, [matchStageFilter, searchQuery]);

  // Dynamically compute standings from MATCHES_DATA
  const groups = useMemo<Group[]>(() => {
    const standings: Record<string, Record<string, TeamStanding>> = {};
    
    // Setup initial structures
    Object.entries(GROUP_TEAMS).forEach(([letter, teams]) => {
      standings[letter] = {};
      teams.forEach(name => {
        standings[letter][name] = {
          name,
          mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0,
          form: []
        };
      });
    });

    // Populate stats from MATCHES_DATA
    MATCHES_DATA.forEach(match => {
      if (match.status !== 'completed') return;
      if (!match.stage.startsWith('Group')) return; // Only Group stage counts for standings
      
      const letter = match.stage.replace('Group ', '');
      if (!standings[letter]) return;

      const teamAStats = standings[letter][match.teamA];
      const teamBStats = standings[letter][match.teamB];
      if (!teamAStats || !teamBStats) return;

      // Parse score "X - Y"
      const scoreParts = match.score ? match.score.split(' - ') : null;
      if (!scoreParts || scoreParts.length !== 2) return;

      const gfA = parseInt(scoreParts[0].trim());
      const gfB = parseInt(scoreParts[1].trim());

      teamAStats.mp += 1;
      teamBStats.mp += 1;
      teamAStats.gf += gfA;
      teamAStats.ga += gfB;
      teamBStats.gf += gfB;
      teamBStats.ga += gfA;
      teamAStats.gd = teamAStats.gf - teamAStats.ga;
      teamBStats.gd = teamBStats.gf - teamBStats.ga;

      if (gfA > gfB) {
        teamAStats.w += 1;
        teamAStats.pts += 3;
        teamBStats.l += 1;
        teamAStats.form.push({ outcome: 'W', opponent: match.teamB, score: match.score || '', date: match.date });
        teamBStats.form.push({ outcome: 'L', opponent: match.teamA, score: `${gfB} - ${gfA}`, date: match.date });
      } else if (gfA < gfB) {
        teamBStats.w += 1;
        teamBStats.pts += 3;
        teamAStats.l += 1;
        teamAStats.form.push({ outcome: 'L', opponent: match.teamB, score: match.score || '', date: match.date });
        teamBStats.form.push({ outcome: 'W', opponent: match.teamA, score: `${gfB} - ${gfA}`, date: match.date });
      } else {
        teamAStats.d += 1;
        teamBStats.d += 1;
        teamAStats.pts += 1;
        teamBStats.pts += 1;
        teamAStats.form.push({ outcome: 'D', opponent: match.teamB, score: match.score || '', date: match.date });
        teamBStats.form.push({ outcome: 'D', opponent: match.teamA, score: match.score || '', date: match.date });
      }
    });

    // Convert Record to list, sort teams, and return Group[]
    return Object.entries(standings).map(([letter, teamMap]) => {
      const sortedTeams = Object.values(teamMap).sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return a.name.localeCompare(b.name);
      });
      return {
        letter,
        teams: sortedTeams
      };
    });
  }, []);

  // Initialize/remember tab settings
  useEffect(() => {
    if (isOpen) {
      if (defaultTab) {
        setActiveTab(defaultTab);
      } else {
        try {
          const stored = localStorage.getItem('tournament_hub_last_tab');
          if (stored && ['matches', 'news', 'standings', 'players', 'bracket'].includes(stored)) {
            setActiveTab(stored as any);
          }
        } catch (e) {
          console.warn('localStorage is not accessible in TournamentHub:', e);
        }
      }
    }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (isOpen) {
      try {
        localStorage.setItem('tournament_hub_last_tab', activeTab);
      } catch (e) {
        console.warn('localStorage writing is not accessible in TournamentHub:', e);
      }
    }
  }, [activeTab, isOpen]);

  // Helper for rendering Flag nicely with fallbacks
  const renderFlag = (countryName: string) => {
    const data = COUNTRY_CODES[countryName];
    if (!data) return <span className="text-sm">🏳️</span>;
    return (
      <span className="inline-flex items-center gap-1.5 font-sans">
        <img 
          src={`https://flagcdn.com/w40/${data.code}.png`} 
          alt={countryName} 
          className="w-5 h-3.5 object-cover rounded shadow-sm shrink-0 border border-zinc-800/20"
          onError={(e) => {
            (e.currentTarget).style.display = 'none';
          }}
        />
        <span className="text-base select-none filter drop-shadow-sm shrink-0 md:hidden block">{data.emoji}</span>
      </span>
    );
  };

  const renderBracketMatch = (teamA: string, teamB: string, score: string | undefined, date: string, isCompleted: boolean, winner: string | null) => {
    return (
      <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-2.5 space-y-1.5 w-[180px] text-left hover:border-zinc-800 transition-all shadow-md select-none shrink-0">
        <p className="text-[8px] font-bold text-zinc-500 font-mono tracking-wider">{date}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              {renderFlag(teamA)}
              <span className={`text-[11px] font-black truncate ${winner === teamA ? 'text-emerald-400 font-extrabold' : 'text-zinc-300'}`}>{teamA}</span>
            </div>
            {score && <span className="font-mono text-[10px] font-bold text-zinc-300 bg-zinc-900 px-1 rounded">{score.split(' - ')[0]}</span>}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              {renderFlag(teamB)}
              <span className={`text-[11px] font-black truncate ${winner === teamB ? 'text-emerald-400 font-extrabold' : 'text-zinc-300'}`}>{teamB}</span>
            </div>
            {score && <span className="font-mono text-[10px] font-bold text-zinc-300 bg-zinc-900 px-1 rounded">{score.split(' - ')[1]}</span>}
          </div>
        </div>
      </div>
    );
  };

  const toggleGroupExpand = (letter: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [letter]: !prev[letter]
    }));
  };

  const expandAllGroups = () => {
    const next: Record<string, boolean> = {};
    groups.forEach(g => {
      next[g.letter] = true;
    });
    setExpandedGroups(next);
  };

  const collapseAllGroups = () => {
    setExpandedGroups({});
  };

  // Memoized Filtered Standings
  const filteredGroups = useMemo(() => {
    let result = groups;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = groups.map(g => {
        // Match group letter or team names
        const matchesLetter = `group ${g.letter.toLowerCase()}`.includes(q);
        const filteredTeams = g.teams.filter(t => t.name.toLowerCase().includes(q));
        if (matchesLetter) {
          return g; // Keep all teams if group matches
        } else if (filteredTeams.length > 0) {
          return { ...g, teams: filteredTeams };
        }
        return null;
      }).filter(Boolean);
    }

    // Filter Qualified only (top 2 of each group)
    if (filterQualifiedOnly) {
      result = result.map(g => {
        // Sort teams first to find top 2
        const sorted = [...g.teams].sort((a, b) => {
          if (b.pts !== a.pts) return b.pts - a.pts;
          if (b.gd !== a.gd) return b.gd - a.gd;
          return b.gf - a.gf;
        });
        return {
          ...g,
          teams: sorted.slice(0, 2)
        };
      });
    }

    return result;
  }, [groups, searchQuery, filterQualifiedOnly]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
      {/* Dark Overlay backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Slide Drawer Content container */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 24, stiffness: 220 }}
        className="relative w-full max-w-lg md:max-w-2xl h-full bg-zinc-950 border-l border-zinc-800/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col z-10"
      >
        {/* Sticky Header */}
        <header className="p-4 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  Tournament Hub
                  <span className="text-[10px] bg-zinc-800 border border-zinc-700/50 text-zinc-300 px-2 py-0.5 rounded-full font-bold">LIVE STATS</span>
                </h1>
                <p className="text-[11px] text-zinc-500 font-mono">Official FIFA World Cup 2026 Tournament Information</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-zinc-900 border border-transparent hover:border-zinc-800 text-zinc-400 hover:text-white transition-all focus:outline-none"
              aria-label="Close Tournament Hub"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sticky Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search teams, players, groups, matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/60 border border-zinc-800/80 text-xs text-white pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-zinc-400 focus:outline-none placeholder-zinc-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-white uppercase font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Tab Selection Row */}
          <nav className="flex gap-1.5 bg-zinc-900/40 p-1 border border-zinc-900 rounded-xl" role="tablist">
            {[
              { id: 'matches', label: 'Matches', icon: Calendar },
              { id: 'news', label: 'News', icon: Newspaper },
              { id: 'standings', label: 'Standings', icon: Trophy },
              { id: 'players', label: 'Players', icon: UsersIcon },
              { id: 'bracket', label: 'Bracket', icon: Sparkles }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSelectedMatch(null); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                    isActive 
                      ? 'bg-zinc-800/80 text-white border border-zinc-700/30 shadow' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
                  }`}
                  role="tab"
                  aria-selected={isActive}
                >
                  <TabIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </header>

        {/* Scrollable Container Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
          
          {/* TAB 1: MATCHES */}
          {activeTab === 'matches' && (
            <div className="space-y-4">
              {selectedMatch ? (
                // Match Details Stat view
                <div className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl space-y-5">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => setSelectedMatch(null)}
                      className="text-[11px] font-bold uppercase text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      ← Back to Matchlist
                    </button>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                      selectedMatch.status === 'live' ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 animate-pulse' :
                      selectedMatch.status === 'upcoming' ? 'bg-zinc-800 border border-zinc-700 text-zinc-300' :
                      'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    }`}>
                      {selectedMatch.status}
                    </span>
                  </div>

                  {/* Dynamic Scoreboard Box */}
                  <div className="text-center space-y-3 bg-zinc-950/40 p-4 border border-zinc-900 rounded-xl">
                    <p className="text-[10px] text-zinc-500 font-mono tracking-wider">{selectedMatch.venue}</p>
                    <div className="flex items-center justify-between px-4">
                      <div className="flex flex-col items-center gap-1.5 w-1/3">
                        {renderFlag(selectedMatch.teamA)}
                        <span className="text-xs font-black text-white">{selectedMatch.teamA}</span>
                      </div>
                      <div className="w-1/3">
                        {selectedMatch.score ? (
                          <span className="font-mono text-xl font-black text-emerald-400 tracking-wider">
                            {selectedMatch.score}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-zinc-500">VS</span>
                        )}
                        <p className="text-[9px] text-zinc-400 font-bold mt-1.5 tracking-wider uppercase font-mono">{selectedMatch.time}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 w-1/3">
                        {renderFlag(selectedMatch.teamB)}
                        <span className="text-xs font-black text-white">{selectedMatch.teamB}</span>
                      </div>
                    </div>
                  </div>

                  {/* Match Stats Table */}
                  {selectedMatch.possession ? (
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">LIVE MATCH STATISTICS</h3>
                      
                      {/* Stat Rows */}
                      {[
                        { label: 'Possession', valA: selectedMatch.possession.split(' - ')[0], valB: selectedMatch.possession.split(' - ')[1] },
                        { label: 'Shots', valA: selectedMatch.shots?.split(' - ')[0], valB: selectedMatch.shots?.split(' - ')[1] },
                        { label: 'Corners', valA: selectedMatch.corners?.split(' - ')[0], valB: selectedMatch.corners?.split(' - ')[1] },
                        { label: 'Yellow Cards', valA: selectedMatch.yellowCards?.split(' - ')[0], valB: selectedMatch.yellowCards?.split(' - ')[1] },
                        { label: 'Red Cards', valA: selectedMatch.redCards?.split(' - ')[0], valB: selectedMatch.redCards?.split(' - ')[1] }
                      ].map((stat, sIdx) => {
                        const numA = parseInt(stat.valA || '0');
                        const numB = parseInt(stat.valB || '0');
                        const total = numA + numB || 1;
                        const pctA = Math.round((numA / total) * 100);
                        const pctB = 100 - pctA;
                        
                        return (
                          <div key={sIdx} className="space-y-1.5 text-xs">
                            <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-zinc-300 font-mono">{stat.valA}</span>
                              <span className="text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                              <span className="text-zinc-300 font-mono">{stat.valB}</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-900 rounded-full flex overflow-hidden">
                              <div style={{ width: `${pctA}%` }} className="bg-zinc-300 h-full"></div>
                              <div style={{ width: `${pctB}%` }} className="bg-zinc-600 h-full"></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-zinc-500 italic">
                      Live Statistics will be available when match kicks off.
                    </div>
                  )}
                </div>
              ) : (
                // Matches List
                <div className="space-y-3.5">
                  {/* Stage filter buttons row */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1.5 -mx-2 px-2 scrollbar-none shrink-0">
                    {[
                      { id: 'All', label: 'All' },
                      { id: 'Groups', label: 'Groups' },
                      { id: 'R32', label: 'R32' },
                      { id: 'R16', label: 'R16' },
                      { id: 'QF', label: 'QF' },
                      { id: 'SF/Finals', label: 'SF/Final' }
                    ].map(stage => (
                      <button
                        key={stage.id}
                        onClick={() => setMatchStageFilter(stage.id)}
                        className={`py-1 px-3.5 rounded-full text-[10px] font-bold shrink-0 border transition-all ${
                          matchStageFilter === stage.id
                            ? 'bg-zinc-100 text-black border-zinc-100'
                            : 'bg-zinc-900/40 text-zinc-400 border-zinc-800/60 hover:text-zinc-200'
                        }`}
                      >
                        {stage.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2.5">
                    {filteredMatches.length > 0 ? (
                      filteredMatches.map(match => (
                        <div 
                          key={match.id}
                          onClick={() => setSelectedMatch(match)}
                          className="bg-zinc-900/20 border border-zinc-900/50 hover:border-zinc-800/80 p-4 rounded-xl cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${match.status === 'live' ? 'bg-red-500 animate-pulse' : match.status === 'completed' ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
                              <span className="text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
                                {match.status} • {match.stage} • {match.date}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                {renderFlag(match.teamA)}
                                <span className="text-xs font-bold text-white">{match.teamA}</span>
                              </div>
                              <span className="text-[10px] text-zinc-500 font-bold px-1.5">vs</span>
                              <div className="flex items-center gap-1.5 flex-row-reverse">
                                {renderFlag(match.teamB)}
                                <span className="text-xs font-bold text-white">{match.teamB}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right shrink-0">
                            {match.score ? (
                              <div className="text-xs font-mono font-black text-emerald-400 bg-zinc-900/40 border border-zinc-800/60 px-2.5 py-1 rounded-lg">
                                {match.score}
                              </div>
                            ) : (
                              <div className="text-[9px] text-zinc-400 font-semibold font-mono bg-zinc-900/30 px-2 py-0.5 rounded border border-zinc-900">
                                Upcoming
                              </div>
                            )}
                            <p className="text-[9px] text-zinc-500 font-bold mt-1 tracking-wider font-mono">{match.time.split(' ')[0]}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-xs text-zinc-500 italic">
                        No matches found matching this stage filter.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NEWS */}
          {activeTab === 'news' && (
            <div className="space-y-3">
              {NEWS_DATA.filter(item => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase();
                return item.headline.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
              }).map(news => (
                <div 
                  key={news.id} 
                  className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 hover:shadow-xl transition-all flex flex-col sm:flex-row"
                >
                  <div className="w-full sm:w-1/3 h-32 relative select-none">
                    <img 
                      src={news.thumbnail} 
                      alt="News Thumbnail" 
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-2 left-2 bg-zinc-950/90 text-zinc-300 font-bold border border-zinc-800 text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full font-mono">
                      {news.category}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <p className="text-[9px] text-zinc-500 font-mono font-bold uppercase">{news.time}</p>
                      <h3 className="text-xs font-bold text-white leading-snug">{news.headline}</h3>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{news.summary}</p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-zinc-900/60 flex justify-end">
                      <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                        Read Story <span className="text-[9px]">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: STANDINGS */}
          {activeTab === 'standings' && (
            <div className="space-y-4">
              {/* Standings controls */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 bg-zinc-900/20 p-2.5 rounded-xl border border-zinc-900">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterQualifiedOnly(!filterQualifiedOnly)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all ${
                      filterQualifiedOnly 
                        ? 'bg-zinc-800 border-zinc-700 text-white' 
                        : 'bg-transparent border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Filter className="w-3 h-3" />
                    <span>Qualified Only</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={expandAllGroups} 
                    className="text-[10px] font-black text-zinc-400 hover:text-white uppercase transition-colors px-2 py-1"
                  >
                    Expand All
                  </button>
                  <span className="text-zinc-800">|</span>
                  <button 
                    onClick={collapseAllGroups} 
                    className="text-[10px] font-black text-zinc-400 hover:text-white uppercase transition-colors px-2 py-1"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {/* Group Standings list */}
              <div className="space-y-3.5">
                {filteredGroups.map(group => {
                  const isExpanded = !!expandedGroups[group.letter];
                  return (
                    <div 
                      key={group.letter} 
                      className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden transition-all"
                    >
                      {/* Accordion Trigger Header */}
                      <div 
                        onClick={() => toggleGroupExpand(group.letter)}
                        className="p-4 bg-zinc-900/50 backdrop-blur-md border-b border-zinc-900/40 flex items-center justify-between cursor-pointer hover:bg-zinc-900/80 transition-all select-none"
                      >
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-zinc-400" />
                          <span className="text-xs font-black text-white uppercase tracking-wider">
                            Group {group.letter}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500">
                          <span className="text-[10px] font-mono tracking-widest uppercase">Inspect Table</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Accordion Table Body */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="overflow-x-auto">
                              <table className="w-full text-[11px] text-zinc-300 font-sans border-collapse">
                                <thead>
                                  <tr className="bg-zinc-950/60 border-b border-zinc-900/80 font-mono text-[9px] uppercase tracking-widest text-zinc-500 font-black text-left">
                                    <th className="py-2.5 px-3 text-center w-8">#</th>
                                    <th className="py-2.5 px-3 text-left">Team</th>
                                    <th className="py-2.5 px-2 text-center">MP</th>
                                    <th className="py-2.5 px-2 text-center">W</th>
                                    <th className="py-2.5 px-2 text-center">D</th>
                                    <th className="py-2.5 px-2 text-center">L</th>
                                    <th className="py-2.5 px-2 text-center hidden md:table-cell">GF</th>
                                    <th className="py-2.5 px-2 text-center hidden md:table-cell">GA</th>
                                    <th className="py-2.5 px-2 text-center">GD</th>
                                    <th className="py-2.5 px-3 text-center font-black text-white bg-zinc-900/40">PTS</th>
                                    <th className="py-2.5 px-3 text-center w-28">Form</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {group.teams.map((team, tIdx) => {
                                    const position = tIdx + 1;
                                    const isQualified = position <= 2;
                                    const isDanger = position === 4;
                                    
                                    return (
                                      <tr 
                                        key={team.name} 
                                        className={`border-b border-zinc-900/40 hover:bg-zinc-900/20 transition-all ${
                                          isQualified ? 'bg-emerald-500/[0.015]' : isDanger ? 'bg-rose-500/[0.01]' : ''
                                        }`}
                                      >
                                        <td className="py-3 px-3 text-center">
                                          <span className={`inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-bold ${
                                            isQualified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                            isDanger ? 'bg-zinc-800 text-zinc-500' :
                                            'text-zinc-400'
                                          }`}>
                                            {position}
                                          </span>
                                        </td>
                                        <td className="py-3 px-3 font-semibold text-white">
                                          <div className="flex items-center gap-2">
                                            {renderFlag(team.name)}
                                            <span className="truncate max-w-[100px] sm:max-w-none">{team.name}</span>
                                          </div>
                                        </td>
                                        <td className="py-3 px-2 text-center font-mono">{team.mp}</td>
                                        <td className="py-3 px-2 text-center font-mono">{team.w}</td>
                                        <td className="py-3 px-2 text-center font-mono">{team.d}</td>
                                        <td className="py-3 px-2 text-center font-mono">{team.l}</td>
                                        <td className="py-3 px-2 text-center font-mono hidden md:table-cell">{team.gf}</td>
                                        <td className="py-3 px-2 text-center font-mono hidden md:table-cell">{team.ga}</td>
                                        <td className="py-3 px-2 text-center font-mono font-medium">
                                          <span className={team.gd > 0 ? 'text-emerald-400' : team.gd < 0 ? 'text-rose-400' : 'text-zinc-500'}>
                                            {team.gd > 0 ? `+${team.gd}` : team.gd}
                                          </span>
                                        </td>
                                        <td className="py-3 px-3 text-center font-black text-white bg-zinc-900/20 font-mono">
                                          {team.pts}
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                          <div className="flex items-center justify-center gap-1 font-mono">
                                            {team.form.map((f, fIdx) => (
                                              <div 
                                                key={fIdx} 
                                                className="group/form relative cursor-default"
                                              >
                                                <span className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[8px] font-black select-none ${
                                                  f.outcome === 'W' ? 'bg-emerald-500 text-black' :
                                                  f.outcome === 'D' ? 'bg-amber-500 text-black' :
                                                  'bg-rose-500 text-white'
                                                }`}>
                                                  {f.outcome === 'W' ? 'W' : f.outcome === 'D' ? 'D' : 'L'}
                                                </span>
                                                {/* Tooltip on hover */}
                                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800 text-[9px] text-zinc-300 p-2 rounded-lg shadow-2xl opacity-0 group-hover/form:opacity-100 pointer-events-none transition-all duration-200 z-50 min-w-[110px] text-center uppercase tracking-wider">
                                                  <p className="font-bold text-white">vs {f.opponent}</p>
                                                  <p className="text-emerald-400 font-mono font-black my-0.5">{f.score}</p>
                                                  <p className="text-[8px] text-zinc-500 font-mono">{f.date}</p>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: PLAYER STATISTICS */}
          {activeTab === 'players' && (
            <div className="space-y-4">
              {/* Inner tab category selector */}
              <div className="flex gap-1.5 p-1 bg-zinc-900/30 border border-zinc-900 rounded-xl">
                {[
                  { id: 'goals', label: 'Goals', title: 'Top Goalscorers' },
                  { id: 'assists', label: 'Assists', title: 'Top Assists Playmakers' },
                  { id: 'yellow', label: 'Yellow Cards', title: 'Caution Discipline' },
                  { id: 'red', label: 'Red Cards', title: 'Dismissal Discipline' }
                ].map(pSub => (
                  <button
                    key={pSub.id}
                    onClick={() => setPlayersTab(pSub.id as any)}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      playersTab === pSub.id 
                        ? 'bg-zinc-800 text-white' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {pSub.label}
                  </button>
                ))}
              </div>

              {/* Player list */}
              <div className="space-y-2.5">
                {(playersTab === 'goals' ? PLAYER_STATS_DATA.goals :
                  playersTab === 'assists' ? PLAYER_STATS_DATA.assists :
                  playersTab === 'yellow' ? PLAYER_STATS_DATA.yellowCards :
                  PLAYER_STATS_DATA.redCards).filter(player => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return player.name.toLowerCase().includes(q) || player.country.toLowerCase().includes(q);
                  }).map((player) => (
                    <div 
                      key={player.name} 
                      className="bg-zinc-900/30 border border-zinc-900 p-3.5 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                          <img 
                            src={player.photo || defaultUserPhoto} 
                            alt={player.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                            <span>{player.name}</span>
                            {player.isGoat && <span className="text-sm" title="GOAT">🐐</span>}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                            {renderFlag(player.country)}
                            <span>{player.country}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-mono text-xs font-black text-emerald-400">
                            {player.value}
                          </span>
                          <p className="text-[8px] text-zinc-500 uppercase tracking-wider font-mono">
                            {playersTab === 'goals' ? 'goals' :
                             playersTab === 'assists' ? 'assists' : 'cards'}
                          </p>
                        </div>
                        {/* Ranking badge */}
                        <div className="w-6 h-6 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-[10px] shrink-0 font-bold font-mono">
                          {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 5: BRACKET */}
          {activeTab === 'bracket' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/20 border border-zinc-900/60 p-4 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">WORLD CUP KNOCKOUT BRACKET</h3>
                </div>
                <p className="text-[10px] text-zinc-400 text-center max-w-sm mx-auto">
                  Follow the live road to the final. Drag or scroll horizontally to browse from Round of 16 to the Championship match.
                </p>

                {/* Horizontal visual bracket layout */}
                <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-zinc-850">
                  <div className="flex gap-8 min-w-[840px] py-4 h-[780px]">
                    
                    {/* COLUMN 1: ROUND OF 16 */}
                    <div className="flex-1 flex flex-col justify-around h-full">
                      <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center border-b border-zinc-900/80 pb-1 mb-2">Round of 16</div>
                      {renderBracketMatch("Canada", "Morocco", "0 - 3", "Sat, Jul 4", true, "Morocco")}
                      {renderBracketMatch("Paraguay", "France", "0 - 1", "Sun, Jul 5", true, "France")}
                      {renderBracketMatch("Portugal", "Spain", "0 - 1", "Tue, Jul 7", true, "Spain")}
                      {renderBracketMatch("USA", "Belgium", "1 - 4", "Tue, Jul 7", true, "Belgium")}
                      {renderBracketMatch("Brazil", "Norway", "1 - 2", "Mon, Jul 6", true, "Norway")}
                      {renderBracketMatch("Mexico", "England", "2 - 3", "Mon, Jul 6", true, "England")}
                      {renderBracketMatch("Argentina", "Egypt", "3 - 2", "Tue, Jul 7", true, "Argentina")}
                      {renderBracketMatch("Switzerland", "Colombia", "0 (4) - 0 (3)", "Wed, Jul 8", true, "Switzerland")}
                    </div>

                    {/* COLUMN 2: QUARTERFINALS */}
                    <div className="flex-1 flex flex-col justify-around h-full">
                      <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center border-b border-zinc-900/80 pb-1 mb-2">Quarterfinals</div>
                      {renderBracketMatch("France", "Morocco", "2 - 0", "Fri, Jul 10", true, "France")}
                      {renderBracketMatch("Spain", "Belgium", "2 - 1", "Sat, Jul 11", true, "Spain")}
                      {renderBracketMatch("Norway", "England", "1 - 2", "Sun, Jul 12", true, "England")}
                      {renderBracketMatch("Argentina", "Switzerland", "3 - 1", "Sun, Jul 12", true, "Argentina")}
                    </div>

                    {/* COLUMN 3: SEMIFINALS */}
                    <div className="flex-1 flex flex-col justify-around h-full">
                      <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center border-b border-zinc-900/80 pb-1 mb-2">Semifinals</div>
                      {renderBracketMatch("France", "Spain", "0 - 2", "Wed, Jul 15", true, "Spain")}
                      {renderBracketMatch("England", "Argentina", undefined, "Thu, Jul 16", false, null)}
                    </div>

                    {/* COLUMN 4: FINAL & CHAMPION */}
                    <div className="flex-1 flex flex-col justify-around h-full">
                      <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center border-b border-zinc-900/80 pb-1 mb-2">Final</div>
                      
                      <div className="space-y-6">
                        {renderBracketMatch("Spain", "Winner SF 2", undefined, "Mon, Jul 20", false, null)}
                        
                        {/* CHAMPIONSHIP PROJECTION / DISPLAY CARD */}
                        <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl text-center space-y-2.5 shadow-2xl relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent"></div>
                          <Trophy className="w-7 h-7 text-yellow-400 mx-auto animate-bounce" />
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-emerald-400 tracking-widest uppercase">CHAMPIONS TROPHY</p>
                            <p className="text-[11px] font-bold text-zinc-200">GRAND FINALE</p>
                            <p className="text-[9px] font-mono font-bold text-zinc-500 mt-1">20 JULY 2026</p>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
