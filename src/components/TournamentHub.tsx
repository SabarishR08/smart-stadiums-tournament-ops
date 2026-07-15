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

// Full 12 Groups Data
const INITIAL_GROUPS: Group[] = [
  {
    letter: "A",
    teams: [
      { name: "Mexico", mp: 3, w: 3, d: 0, l: 0, gf: 6, ga: 0, gd: 6, pts: 9, form: [
        { outcome: 'W', opponent: 'South Africa', score: '2-0', date: '11 Jun 2026' },
        { outcome: 'W', opponent: 'Republic of Korea', score: '1-0', date: '17 Jun 2026' },
        { outcome: 'W', opponent: 'Czechia', score: '3-0', date: '23 Jun 2026' }
      ]},
      { name: "South Africa", mp: 3, w: 1, d: 1, l: 1, gf: 2, ga: 3, gd: -1, pts: 4, form: [
        { outcome: 'L', opponent: 'Mexico', score: '0-2', date: '11 Jun 2026' },
        { outcome: 'D', opponent: 'Czechia', score: '1-1', date: '17 Jun 2026' },
        { outcome: 'W', opponent: 'Republic of Korea', score: '1-0', date: '23 Jun 2026' }
      ]},
      { name: "Republic of Korea", mp: 3, w: 1, d: 0, l: 2, gf: 2, ga: 3, gd: -1, pts: 3, form: [
        { outcome: 'W', opponent: 'Czechia', score: '2-0', date: '11 Jun 2026' },
        { outcome: 'L', opponent: 'Mexico', score: '0-1', date: '17 Jun 2026' },
        { outcome: 'L', opponent: 'South Africa', score: '0-1', date: '23 Jun 2026' }
      ]},
      { name: "Czechia", mp: 3, w: 0, d: 1, l: 2, gf: 2, ga: 6, gd: -4, pts: 1, form: [
        { outcome: 'L', opponent: 'Republic of Korea', score: '0-2', date: '11 Jun 2026' },
        { outcome: 'D', opponent: 'South Africa', score: '1-1', date: '17 Jun 2026' },
        { outcome: 'L', opponent: 'Mexico', score: '1-3', date: '23 Jun 2026' }
      ]}
    ]
  },
  {
    letter: "B",
    teams: [
      { name: "Canada", mp: 3, w: 2, d: 1, l: 0, gf: 5, ga: 2, gd: 3, pts: 7, form: [
        { outcome: 'W', opponent: 'Qatar', score: '2-1', date: '12 Jun 2026' },
        { outcome: 'D', opponent: 'Switzerland', score: '1-1', date: '18 Jun 2026' },
        { outcome: 'W', opponent: 'Bosnia and Herzegovina', score: '2-0', date: '24 Jun 2026' }
      ]},
      { name: "Switzerland", mp: 3, w: 2, d: 1, l: 0, gf: 4, ga: 2, gd: 2, pts: 7, form: [
        { outcome: 'W', opponent: 'Bosnia and Herzegovina', score: '2-1', date: '12 Jun 2026' },
        { outcome: 'D', opponent: 'Canada', score: '1-1', date: '18 Jun 2026' },
        { outcome: 'W', opponent: 'Qatar', score: '1-0', date: '24 Jun 2026' }
      ]},
      { name: "Qatar", mp: 3, w: 1, d: 0, l: 2, gf: 3, ga: 5, gd: -2, pts: 3, form: [
        { outcome: 'L', opponent: 'Canada', score: '1-2', date: '12 Jun 2026' },
        { outcome: 'W', opponent: 'Bosnia and Herzegovina', score: '2-1', date: '18 Jun 2026' },
        { outcome: 'L', opponent: 'Switzerland', score: '0-1', date: '24 Jun 2026' }
      ]},
      { name: "Bosnia and Herzegovina", mp: 3, w: 0, d: 0, l: 3, gf: 2, ga: 5, gd: -3, pts: 0, form: [
        { outcome: 'L', opponent: 'Switzerland', score: '1-2', date: '12 Jun 2026' },
        { outcome: 'L', opponent: 'Qatar', score: '1-2', date: '18 Jun 2026' },
        { outcome: 'L', opponent: 'Canada', score: '0-2', date: '24 Jun 2026' }
      ]}
    ]
  },
  {
    letter: "C",
    teams: [
      { name: "USA", mp: 3, w: 3, d: 0, l: 0, gf: 7, ga: 1, gd: 6, pts: 9, form: [
        { outcome: 'W', opponent: 'Paraguay', score: '3-0', date: '12 Jun 2026' },
        { outcome: 'W', opponent: 'Turkiye', score: '2-0', date: '18 Jun 2026' },
        { outcome: 'W', opponent: 'Australia', score: '2-1', date: '24 Jun 2026' }
      ]},
      { name: "Australia", mp: 3, w: 2, d: 0, l: 1, gf: 4, ga: 3, gd: 1, pts: 6, form: [
        { outcome: 'W', opponent: 'Turkiye', score: '1-0', date: '12 Jun 2026' },
        { outcome: 'W', opponent: 'Paraguay', score: '2-1', date: '18 Jun 2026' },
        { outcome: 'L', opponent: 'USA', score: '1-2', date: '24 Jun 2026' }
      ]},
      { name: "Turkiye", mp: 3, w: 1, d: 0, l: 2, gf: 3, ga: 4, gd: -1, pts: 3, form: [
        { outcome: 'L', opponent: 'Australia', score: '0-1', date: '12 Jun 2026' },
        { outcome: 'L', opponent: 'USA', score: '0-2', date: '18 Jun 2026' },
        { outcome: 'W', opponent: 'Paraguay', score: '3-1', date: '24 Jun 2026' }
      ]},
      { name: "Paraguay", mp: 3, w: 0, d: 0, l: 3, gf: 2, ga: 7, gd: -5, pts: 0, form: [
        { outcome: 'L', opponent: 'USA', score: '0-3', date: '12 Jun 2026' },
        { outcome: 'L', opponent: 'Australia', score: '1-2', date: '18 Jun 2026' },
        { outcome: 'L', opponent: 'Turkiye', score: '1-3', date: '24 Jun 2026' }
      ]}
    ]
  },
  {
    letter: "D",
    teams: [
      { name: "Brazil", mp: 3, w: 2, d: 1, l: 0, gf: 6, ga: 2, gd: 4, pts: 7, form: [
        { outcome: 'W', opponent: 'Haiti', score: '3-0', date: '13 Jun 2026' },
        { outcome: 'D', opponent: 'Morocco', score: '1-1', date: '19 Jun 2026' },
        { outcome: 'W', opponent: 'Scotland', score: '2-1', date: '25 Jun 2026' }
      ]},
      { name: "Morocco", mp: 3, w: 1, d: 2, l: 0, gf: 4, ga: 3, gd: 1, pts: 5, form: [
        { outcome: 'W', opponent: 'Scotland', score: '2-1', date: '13 Jun 2026' },
        { outcome: 'D', opponent: 'Brazil', score: '1-1', date: '19 Jun 2026' },
        { outcome: 'D', opponent: 'Haiti', score: '1-1', date: '25 Jun 2026' }
      ]},
      { name: "Scotland", mp: 3, w: 1, d: 0, l: 2, gf: 3, ga: 5, gd: -2, pts: 3, form: [
        { outcome: 'L', opponent: 'Morocco', score: '1-2', date: '13 Jun 2026' },
        { outcome: 'W', opponent: 'Haiti', score: '1-0', date: '19 Jun 2026' },
        { outcome: 'L', opponent: 'Brazil', score: '1-2', date: '25 Jun 2026' }
      ]},
      { name: "Haiti", mp: 3, w: 0, d: 1, l: 2, gf: 2, ga: 5, gd: -3, pts: 1, form: [
        { outcome: 'L', opponent: 'Brazil', score: '0-3', date: '13 Jun 2026' },
        { outcome: 'L', opponent: 'Scotland', score: '0-1', date: '19 Jun 2026' },
        { outcome: 'D', opponent: 'Morocco', score: '1-1', date: '25 Jun 2026' }
      ]}
    ]
  },
  {
    letter: "E",
    teams: [
      { name: "Germany", mp: 3, w: 3, d: 0, l: 0, gf: 8, ga: 2, gd: 6, pts: 9, form: [
        { outcome: 'W', opponent: 'Curacao', score: '4-0', date: '13 Jun 2026' },
        { outcome: 'W', opponent: 'Ivory Coast', score: '2-1', date: '19 Jun 2026' },
        { outcome: 'W', opponent: 'Ecuador', score: '2-1', date: '25 Jun 2026' }
      ]},
      { name: "Ecuador", mp: 3, w: 2, d: 0, l: 1, gf: 5, ga: 4, gd: 1, pts: 6, form: [
        { outcome: 'W', opponent: 'Ivory Coast', score: '2-1', date: '13 Jun 2026' },
        { outcome: 'W', opponent: 'Curacao', score: '2-1', date: '19 Jun 2026' },
        { outcome: 'L', opponent: 'Germany', score: '1-2', date: '25 Jun 2026' }
      ]},
      { name: "Ivory Coast", mp: 3, w: 1, d: 0, l: 2, gf: 3, ga: 5, gd: -2, pts: 3, form: [
        { outcome: 'L', opponent: 'Ecuador', score: '1-2', date: '13 Jun 2026' },
        { outcome: 'L', opponent: 'Germany', score: '1-2', date: '19 Jun 2026' },
        { outcome: 'W', opponent: 'Curacao', score: '1-0', date: '25 Jun 2026' }
      ]},
      { name: "Curacao", mp: 3, w: 0, d: 0, l: 3, gf: 2, ga: 7, gd: -5, pts: 0, form: [
        { outcome: 'L', opponent: 'Germany', score: '0-4', date: '13 Jun 2026' },
        { outcome: 'L', opponent: 'Ecuador', score: '1-2', date: '19 Jun 2026' },
        { outcome: 'L', opponent: 'Ivory Coast', score: '1-1', date: '25 Jun 2026' }
      ]}
    ]
  },
  {
    letter: "F",
    teams: [
      { name: "Netherlands", mp: 3, w: 2, d: 1, l: 0, gf: 5, ga: 1, gd: 4, pts: 7, form: [
        { outcome: 'W', opponent: 'Tunisia', score: '2-0', date: '14 Jun 2026' },
        { outcome: 'D', opponent: 'Sweden', score: '1-1', date: '20 Jun 2026' },
        { outcome: 'W', opponent: 'Japan', score: '2-0', date: '26 Jun 2026' }
      ]},
      { name: "Japan", mp: 3, w: 2, d: 0, l: 1, gf: 4, ga: 3, gd: 1, pts: 6, form: [
        { outcome: 'W', opponent: 'Sweden', score: '2-1', date: '14 Jun 2026' },
        { outcome: 'W', opponent: 'Tunisia', score: '2-0', date: '20 Jun 2026' },
        { outcome: 'L', opponent: 'Netherlands', score: '0-2', date: '26 Jun 2026' }
      ]},
      { name: "Sweden", mp: 3, w: 1, d: 1, l: 1, gf: 3, ga: 3, gd: 0, pts: 4, form: [
        { outcome: 'L', opponent: 'Japan', score: '1-2', date: '14 Jun 2026' },
        { outcome: 'D', opponent: 'Netherlands', score: '1-1', date: '20 Jun 2026' },
        { outcome: 'W', opponent: 'Tunisia', score: '1-0', date: '26 Jun 2026' }
      ]},
      { name: "Tunisia", mp: 3, w: 0, d: 0, l: 3, gf: 0, ga: 5, gd: -5, pts: 0, form: [
        { outcome: 'L', opponent: 'Netherlands', score: '0-2', date: '14 Jun 2026' },
        { outcome: 'L', opponent: 'Japan', score: '0-2', date: '20 Jun 2026' },
        { outcome: 'L', opponent: 'Sweden', score: '0-1', date: '26 Jun 2026' }
      ]}
    ]
  },
  {
    letter: "G",
    teams: [
      { name: "Belgium", mp: 3, w: 2, d: 1, l: 0, gf: 6, ga: 2, gd: 4, pts: 7, form: [
        { outcome: 'W', opponent: 'New Zealand', score: '3-0', date: '14 Jun 2026' },
        { outcome: 'D', opponent: 'Egypt', score: '1-1', date: '20 Jun 2026' },
        { outcome: 'W', opponent: 'Iran', score: '2-1', date: '26 Jun 2026' }
      ]},
      { name: "Egypt", mp: 3, w: 2, d: 1, l: 0, gf: 4, ga: 2, gd: 2, pts: 7, form: [
        { outcome: 'W', opponent: 'Iran', score: '1-0', date: '14 Jun 2026' },
        { outcome: 'D', opponent: 'Belgium', score: '1-1', date: '20 Jun 2026' },
        { outcome: 'W', opponent: 'New Zealand', score: '2-1', date: '26 Jun 2026' }
      ]},
      { name: "Iran", mp: 3, w: 1, d: 0, l: 2, gf: 3, ga: 5, gd: -2, pts: 3, form: [
        { outcome: 'L', opponent: 'Egypt', score: '0-1', date: '14 Jun 2026' },
        { outcome: 'W', opponent: 'New Zealand', score: '2-1', date: '20 Jun 2026' },
        { outcome: 'L', opponent: 'Belgium', score: '1-2', date: '26 Jun 2026' }
      ]},
      { name: "New Zealand", mp: 3, w: 0, d: 0, l: 3, gf: 2, ga: 7, gd: -5, pts: 0, form: [
        { outcome: 'L', opponent: 'Belgium', score: '0-3', date: '14 Jun 2026' },
        { outcome: 'L', opponent: 'Iran', score: '1-2', date: '20 Jun 2026' },
        { outcome: 'L', opponent: 'Egypt', score: '1-2', date: '26 Jun 2026' }
      ]}
    ]
  },
  {
    letter: "H",
    teams: [
      { name: "Spain", mp: 3, w: 3, d: 0, l: 0, gf: 7, ga: 1, gd: 6, pts: 9, form: [
        { outcome: 'W', opponent: 'Cape Verde', score: '3-0', date: '15 Jun 2026' },
        { outcome: 'W', opponent: 'Saudi Arabia', score: '2-0', date: '21 Jun 2026' },
        { outcome: 'W', opponent: 'Uruguay', score: '2-1', date: '27 Jun 2026' }
      ]},
      { name: "Uruguay", mp: 3, w: 2, d: 0, l: 1, gf: 5, ga: 3, gd: 2, pts: 6, form: [
        { outcome: 'W', opponent: 'Saudi Arabia', score: '2-0', date: '15 Jun 2026' },
        { outcome: 'W', opponent: 'Cape Verde', score: '2-1', date: '21 Jun 2026' },
        { outcome: 'L', opponent: 'Spain', score: '1-2', date: '27 Jun 2026' }
      ]},
      { name: "Saudi Arabia", mp: 3, w: 1, d: 0, l: 2, gf: 3, ga: 5, gd: -2, pts: 3, form: [
        { outcome: 'L', opponent: 'Uruguay', score: '0-2', date: '15 Jun 2026' },
        { outcome: 'L', opponent: 'Spain', score: '0-2', date: '21 Jun 2026' },
        { outcome: 'W', opponent: 'Cape Verde', score: '3-1', date: '27 Jun 2026' }
      ]},
      { name: "Cape Verde", mp: 3, w: 0, d: 0, l: 3, gf: 2, ga: 7, gd: -5, pts: 0, form: [
        { outcome: 'L', opponent: 'Spain', score: '0-3', date: '15 Jun 2026' },
        { outcome: 'L', opponent: 'Uruguay', score: '1-2', date: '21 Jun 2026' },
        { outcome: 'L', opponent: 'Saudi Arabia', score: '1-3', date: '27 Jun 2026' }
      ]}
    ]
  },
  {
    letter: "I",
    teams: [
      { name: "France", mp: 3, w: 2, d: 1, l: 0, gf: 5, ga: 1, gd: 4, pts: 7, form: [
        { outcome: 'W', opponent: 'Iraq', score: '3-0', date: '15 Jun 2026' },
        { outcome: 'D', opponent: 'Senegal', score: '1-1', date: '21 Jun 2026' },
        { outcome: 'W', opponent: 'Norway', score: '1-0', date: '27 Jun 2026' }
      ]},
      { name: "Senegal", mp: 3, w: 1, d: 2, l: 0, gf: 3, ga: 2, gd: 1, pts: 5, form: [
        { outcome: 'W', opponent: 'Norway', score: '1-0', date: '15 Jun 2026' },
        { outcome: 'D', opponent: 'France', score: '1-1', date: '21 Jun 2026' },
        { outcome: 'D', opponent: 'Iraq', score: '1-1', date: '27 Jun 2026' }
      ]},
      { name: "Norway", mp: 3, w: 1, d: 0, l: 2, gf: 3, ga: 4, gd: -1, pts: 3, form: [
        { outcome: 'L', opponent: 'Senegal', score: '0-1', date: '15 Jun 2026' },
        { outcome: 'W', opponent: 'Iraq', score: '3-1', date: '21 Jun 2026' },
        { outcome: 'L', opponent: 'France', score: '0-1', date: '27 Jun 2026' }
      ]},
      { name: "Iraq", mp: 3, w: 0, d: 1, l: 2, gf: 2, ga: 7, gd: -5, pts: 1, form: [
        { outcome: 'L', opponent: 'France', score: '0-3', date: '15 Jun 2026' },
        { outcome: 'L', opponent: 'Norway', score: '1-3', date: '21 Jun 2026' },
        { outcome: 'D', opponent: 'Senegal', score: '1-1', date: '27 Jun 2026' }
      ]}
    ]
  },
  {
    letter: "J",
    teams: [
      { name: "Argentina", mp: 3, w: 3, d: 0, l: 0, gf: 8, ga: 1, gd: 7, pts: 9, form: [
        { outcome: 'W', opponent: 'Jordan', score: '4-0', date: '16 Jun 2026' },
        { outcome: 'W', opponent: 'Algeria', score: '2-0', date: '22 Jun 2026' },
        { outcome: 'W', opponent: 'Austria', score: '2-1', date: '28 Jun 2026' }
      ]},
      { name: "Austria", mp: 3, w: 2, d: 0, l: 1, gf: 4, ga: 3, gd: 1, pts: 6, form: [
        { outcome: 'W', opponent: 'Algeria', score: '2-0', date: '16 Jun 2026' },
        { outcome: 'W', opponent: 'Jordan', score: '1-0', date: '22 Jun 2026' },
        { outcome: 'L', opponent: 'Argentina', score: '1-2', date: '28 Jun 2026' }
      ]},
      { name: "Algeria", mp: 3, w: 1, d: 0, l: 2, gf: 3, ga: 5, gd: -2, pts: 3, form: [
        { outcome: 'L', opponent: 'Austria', score: '0-2', date: '16 Jun 2026' },
        { outcome: 'L', opponent: 'Argentina', score: '0-2', date: '22 Jun 2026' },
        { outcome: 'W', opponent: 'Jordan', score: '3-1', date: '28 Jun 2026' }
      ]},
      { name: "Jordan", mp: 3, w: 0, d: 0, l: 3, gf: 2, ga: 8, gd: -6, pts: 0, form: [
        { outcome: 'L', opponent: 'Argentina', score: '0-4', date: '16 Jun 2026' },
        { outcome: 'L', opponent: 'Austria', score: '0-1', date: '22 Jun 2026' },
        { outcome: 'L', opponent: 'Algeria', score: '1-3', date: '28 Jun 2026' }
      ]}
    ]
  },
  {
    letter: "K",
    teams: [
      { name: "Portugal", mp: 3, w: 3, d: 0, l: 0, gf: 8, ga: 2, gd: 6, pts: 9, form: [
        { outcome: 'W', opponent: 'Congo DR', score: '4-0', date: '16 Jun 2026' },
        { outcome: 'W', opponent: 'Uzbekistan', score: '2-1', date: '22 Jun 2026' },
        { outcome: 'W', opponent: 'Colombia', score: '2-1', date: '28 Jun 2026' }
      ]},
      { name: "Colombia", mp: 3, w: 2, d: 0, l: 1, gf: 5, ga: 3, gd: 2, pts: 6, form: [
        { outcome: 'W', opponent: 'Uzbekistan', score: '2-0', date: '16 Jun 2026' },
        { outcome: 'W', opponent: 'Congo DR', score: '2-1', date: '22 Jun 2026' },
        { outcome: 'L', opponent: 'Portugal', score: '1-2', date: '28 Jun 2026' }
      ]},
      { name: "Uzbekistan", mp: 3, w: 1, d: 0, l: 2, gf: 3, ga: 5, gd: -2, pts: 3, form: [
        { outcome: 'L', opponent: 'Colombia', score: '0-2', date: '16 Jun 2026' },
        { outcome: 'L', opponent: 'Portugal', score: '1-2', date: '22 Jun 2026' },
        { outcome: 'W', opponent: 'Congo DR', score: '2-1', date: '28 Jun 2026' }
      ]},
      { name: "Congo DR", mp: 3, w: 0, d: 0, l: 3, gf: 2, ga: 7, gd: -5, pts: 0, form: [
        { outcome: 'L', opponent: 'Portugal', score: '0-4', date: '16 Jun 2026' },
        { outcome: 'L', opponent: 'Colombia', score: '1-2', date: '22 Jun 2026' },
        { outcome: 'L', opponent: 'Uzbekistan', score: '1-2', date: '28 Jun 2026' }
      ]}
    ]
  },
  {
    letter: "L",
    teams: [
      { name: "England", mp: 3, w: 2, d: 1, l: 0, gf: 6, ga: 2, gd: 4, pts: 7, form: [
        { outcome: 'W', opponent: 'Panama', score: '3-1', date: '17 Jun 2026' },
        { outcome: 'D', opponent: 'Ghana', score: '1-1', date: '23 Jun 2026' },
        { outcome: 'W', opponent: 'Croatia', score: '2-0', date: '29 Jun 2026' }
      ]},
      { name: "Croatia", mp: 3, w: 2, d: 0, l: 1, gf: 4, ga: 3, gd: 1, pts: 6, form: [
        { outcome: 'W', opponent: 'Ghana', score: '2-1', date: '17 Jun 2026' },
        { outcome: 'W', opponent: 'Panama', score: '2-0', date: '23 Jun 2026' },
        { outcome: 'L', opponent: 'England', score: '0-2', date: '29 Jun 2026' }
      ]},
      { name: "Ghana", mp: 3, w: 1, d: 1, l: 1, gf: 3, ga: 4, gd: -1, pts: 4, form: [
        { outcome: 'L', opponent: 'Croatia', score: '1-2', date: '17 Jun 2026' },
        { outcome: 'D', opponent: 'England', score: '1-1', date: '23 Jun 2026' },
        { outcome: 'W', opponent: 'Panama', score: '1-0', date: '29 Jun 2026' }
      ]},
      { name: "Panama", mp: 3, w: 0, d: 0, l: 3, gf: 2, ga: 6, gd: -4, pts: 0, form: [
        { outcome: 'L', opponent: 'England', score: '1-3', date: '17 Jun 2026' },
        { outcome: 'L', opponent: 'Croatia', score: '0-2', date: '23 Jun 2026' },
        { outcome: 'L', opponent: 'Ghana', score: '0-1', date: '29 Jun 2026' }
      ]}
    ]
  }
];

interface PlayerStat {
  rank: number;
  name: string;
  country: string;
  value: number;
  photo?: string;
}

const PLAYER_STATS_DATA = {
  goals: [
    { rank: 1, name: "Kylian Mbappé", country: "France", value: 6, photo: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&h=120&q=80" },
    { rank: 2, name: "Erling Haaland", country: "Norway", value: 5, photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80" },
    { rank: 3, name: "Lionel Messi", country: "Argentina", value: 4, photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80" },
    { rank: 4, name: "Harry Kane", country: "England", value: 3 },
    { rank: 5, name: "Vinícius Júnior", country: "Brazil", value: 3 }
  ] as PlayerStat[],
  assists: [
    { rank: 1, name: "Lionel Messi", country: "Argentina", value: 4, photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80" },
    { rank: 2, name: "Kevin De Bruyne", country: "Belgium", value: 3 },
    { rank: 3, name: "Bruno Fernandes", country: "Portugal", value: 3 },
    { rank: 4, name: "Antoine Griezmann", country: "France", value: 2 },
    { rank: 5, name: "Neymar Jr", country: "Brazil", value: 2 }
  ] as PlayerStat[],
  yellowCards: [
    { rank: 1, name: "Casemiro", country: "Brazil", value: 2 },
    { rank: 2, name: "Antonio Rüdiger", country: "Germany", value: 2 },
    { rank: 3, name: "Cristian Romero", country: "Argentina", value: 2 },
    { rank: 4, name: "Pepe", country: "Portugal", value: 1 }
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
    headline: "FIFA World Cup 2026 Expansion Sparkles Globally",
    category: "Tournament News",
    time: "2 hours ago",
    summary: "With 48 teams competing across 12 groups, the tournament has set unprecedented viewership and crowd attendance records in host nations.",
    thumbnail: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&h=200&q=80"
  },
  {
    id: 2,
    headline: "Azteca Stadium Redefines Fan Wayfinding Innovations",
    category: "Stadium Tech",
    time: "5 hours ago",
    summary: "New AI-powered crowd flow analysis helps thousands of fans locate seats, nearest restrooms, and transportation paths within seconds.",
    thumbnail: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=300&h=200&q=80"
  },
  {
    id: 3,
    headline: "Argentina vs Portugal Replay Reaches Millions",
    category: "Match Highlights",
    time: "1 day ago",
    summary: "A thrilling encounter showcasing tactical mastermind moments on the grandest stage. Live broadcasts hit peak server ratings.",
    thumbnail: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&h=200&q=80"
  }
];

interface Match {
  id: string;
  status: 'live' | 'upcoming' | 'completed';
  teamA: string;
  teamB: string;
  score?: string;
  time: string;
  venue: string;
  possession?: string;
  shots?: string;
  corners?: string;
  yellowCards?: string;
  redCards?: string;
}

const MATCHES_DATA: Match[] = [
  {
    id: "m1",
    status: "live",
    teamA: "Argentina",
    teamB: "Portugal",
    score: "2 - 1",
    time: "78' Second Half",
    venue: "Azteca Stadium, Mexico City",
    possession: "54% - 46%",
    shots: "14 - 10",
    corners: "6 - 4",
    yellowCards: "2 - 3",
    redCards: "0 - 0"
  },
  {
    id: "m2",
    status: "upcoming",
    teamA: "USA",
    teamB: "Australia",
    time: "Tomorrow, 18:00 UTC",
    venue: "MetLife Stadium, East Rutherford",
    possession: "N/A",
    shots: "N/A",
    corners: "N/A",
    yellowCards: "N/A",
    redCards: "N/A"
  },
  {
    id: "m3",
    status: "upcoming",
    teamA: "Mexico",
    teamB: "South Africa",
    time: "18 Jul, 20:00 UTC",
    venue: "Estadio Azteca",
    possession: "N/A",
    shots: "N/A"
  },
  {
    id: "m4",
    status: "completed",
    teamA: "France",
    teamB: "Norway",
    score: "1 - 0",
    time: "Full Time (27 Jun)",
    venue: "SoFi Stadium, Los Angeles",
    possession: "51% - 49%",
    shots: "11 - 8",
    corners: "5 - 3",
    yellowCards: "1 - 2",
    redCards: "0 - 0"
  }
];

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

  // Initialize/remember tab settings
  useEffect(() => {
    if (isOpen) {
      if (defaultTab) {
        setActiveTab(defaultTab);
      } else {
        const stored = localStorage.getItem('tournament_hub_last_tab');
        if (stored && ['matches', 'news', 'standings', 'players', 'bracket'].includes(stored)) {
          setActiveTab(stored as any);
        }
      }
    }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem('tournament_hub_last_tab', activeTab);
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
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
        <span className="text-base select-none filter drop-shadow-sm shrink-0 md:hidden block">{data.emoji}</span>
      </span>
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
    INITIAL_GROUPS.forEach(g => {
      next[g.letter] = true;
    });
    setExpandedGroups(next);
  };

  const collapseAllGroups = () => {
    setExpandedGroups({});
  };

  // Memoized Filtered Standings
  const filteredGroups = useMemo(() => {
    let result = INITIAL_GROUPS;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = INITIAL_GROUPS.map(g => {
        // Match group letter or team names
        const matchesLetter = `group ${g.letter.toLowerCase()}`.includes(q);
        const filteredTeams = g.teams.filter(t => t.name.toLowerCase().includes(q));
        if (matchesLetter) {
          return g; // Keep all teams if group matches
        } else if (filteredTeams.length > 0) {
          return { ...g, teams: filteredTeams };
        }
        return null;
      }).filter(Boolean) as Group[];
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
  }, [searchQuery, filterQualifiedOnly]);

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
                <div className="space-y-3">
                  {MATCHES_DATA.filter(m => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return m.teamA.toLowerCase().includes(q) || m.teamB.toLowerCase().includes(q) || m.venue.toLowerCase().includes(q);
                  }).map(match => (
                    <div 
                      key={match.id}
                      onClick={() => setSelectedMatch(match)}
                      className="bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800 p-4 rounded-xl cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${match.status === 'live' ? 'bg-red-500 animate-pulse' : match.status === 'completed' ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
                          <span className="text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
                            {match.status} • {match.venue.split(',')[0]}
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
                          <div className="text-sm font-mono font-black text-emerald-400 bg-zinc-900/60 border border-zinc-800 px-3 py-1 rounded-lg">
                            {match.score}
                          </div>
                        ) : (
                          <div className="text-[10px] text-zinc-400 font-semibold font-mono bg-zinc-900/40 px-2 py-1 rounded-lg border border-zinc-900">
                            Upcoming
                          </div>
                        )}
                        <p className="text-[9px] text-zinc-500 font-bold mt-1 tracking-wider font-mono">{match.time.split(' ')[0]}</p>
                      </div>
                    </div>
                  ))}
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
                          {player.photo ? (
                            <img 
                              src={player.photo} 
                              alt={player.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-xs font-black text-zinc-500 uppercase">
                              {player.name.charAt(0)}{player.name.split(' ').slice(-1)[0]?.charAt(0)}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-black text-white">{player.name}</h4>
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
              <div className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-xl space-y-4 text-center">
                <Sparkles className="w-6 h-6 text-yellow-400 mx-auto animate-pulse" />
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Tournament Knockout Bracket</h3>
                  <p className="text-[11px] text-zinc-400">AI predictions & live knockout stages tracking starts soon.</p>
                </div>
                
                {/* Visual predicted Match bracket wireframe */}
                <div className="grid grid-cols-3 gap-2.5 pt-3 text-[10px] font-mono uppercase tracking-wider text-left">
                  <div className="space-y-4">
                    <div className="p-2 bg-zinc-900 border border-zinc-850 rounded">
                      <p className="text-zinc-500">QF 1</p>
                      <p className="font-bold text-white">🇦🇷 ARG (3)</p>
                      <p className="font-bold text-zinc-500">🇩🇪 GER (1)</p>
                    </div>
                    <div className="p-2 bg-zinc-900 border border-zinc-850 rounded">
                      <p className="text-zinc-500">QF 2</p>
                      <p className="font-bold text-white">🇧🇷 BRA (2)</p>
                      <p className="font-bold text-zinc-500">🇪🇸 ESP (0)</p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center space-y-8">
                    <div className="p-2 bg-zinc-900/80 border border-emerald-500/30 rounded shadow-[0_0_15px_rgba(34,197,94,0.05)]">
                      <p className="text-emerald-400 font-bold">SF 1</p>
                      <p className="font-bold text-white">🇦🇷 ARG</p>
                      <p className="font-bold text-white">🇧🇷 BRA</p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="p-2 bg-emerald-500/10 border-2 border-emerald-500/40 rounded text-center">
                      <p className="text-[8px] font-black text-emerald-400 tracking-widest">CHAMPION PREDICTION</p>
                      <p className="font-black text-white text-xs mt-1">🇦🇷 ARGENTINA</p>
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
