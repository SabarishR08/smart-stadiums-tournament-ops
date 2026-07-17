import { useState, useEffect, useMemo } from 'react';
import {
  GROUP_TEAMS,
  MATCHES_DATA,
  type TeamStanding,
  type Group,
  type Match
} from '../TournamentData';

/**
 * useTournamentData - Custom hook managing state, filtering, and dynamic standings computation.
 * @param isOpen - Flag indicating if the tournament hub drawer is open
 * @param defaultTab - Optional pre-selected tab to override cached settings
 */
export function useTournamentData(isOpen: boolean, defaultTab?: 'matches' | 'news' | 'standings' | 'players' | 'bracket') {
  const [activeTab, setActiveTab] = useState<'matches' | 'news' | 'standings' | 'players' | 'bracket'>('matches');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ "A": true });
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [playersTab, setPlayersTab] = useState<'goals' | 'assists' | 'yellow' | 'red'>('goals');
  const [filterQualifiedOnly, setFilterQualifiedOnly] = useState(false);
  const [matchStageFilter, setMatchStageFilter] = useState<string>('All');

  // Filtered matches based on stage filter & search queries
  const filteredMatches = useMemo<Match[]>(() => {
    return MATCHES_DATA.filter((m: Match) => {
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
    MATCHES_DATA.forEach((match: Match) => {
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

      const gfA = parseInt(scoreParts[0].trim(), 10);
      const gfB = parseInt(scoreParts[1].trim(), 10);

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
            setActiveTab(stored as 'matches' | 'news' | 'standings' | 'players' | 'bracket');
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
  const filteredGroups = useMemo<Group[]>(() => {
    let result = groups;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = groups.map(g => {
        const matchesLetter = `group ${g.letter.toLowerCase()}`.includes(q);
        const filteredTeams = g.teams.filter(t => t.name.toLowerCase().includes(q));
        if (matchesLetter) {
          return g;
        } else if (filteredTeams.length > 0) {
          return { ...g, teams: filteredTeams };
        }
        return null;
      }).filter((g): g is Group => g !== null);
    }

    // Filter Qualified only (top 2 of each group)
    if (filterQualifiedOnly) {
      result = result.map(g => {
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

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    expandedGroups,
    toggleGroupExpand,
    expandAllGroups,
    collapseAllGroups,
    selectedMatch,
    setSelectedMatch,
    playersTab,
    setPlayersTab,
    filterQualifiedOnly,
    setFilterQualifiedOnly,
    matchStageFilter,
    setMatchStageFilter,
    filteredMatches,
    groups,
    filteredGroups
  };
}
