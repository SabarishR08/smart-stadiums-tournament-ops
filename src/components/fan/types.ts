/**
 * Shared prop types for FanView component panels
 */

export interface SharedFanViewProps {
  accessibilityMode: boolean;
  csrfToken: string;
  sessionUserId: string;
  cardClasses: string;
  headingSize: string;
}

export interface HeroSlide {
  id: number;
  image: string;
  match: string;
  score: string;
  time: string;
  teamA: string;
  teamB: string;
  flagA: string;
  flagB: string;
  color: string;
}
