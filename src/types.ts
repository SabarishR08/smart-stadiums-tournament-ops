export type CrowdDensity = 'low' | 'medium' | 'high';

export interface ZoneStatus {
  id: string; // e.g. "Gate A", "Section A-D"
  name: string;
  density: CrowdDensity;
  count: number;
  updatedAt: string;
}

export interface IncidentReport {
  id: string;
  type: 'security' | 'medical' | 'facility' | 'crowd' | 'other';
  zone: string;
  severity: 'low' | 'medium' | 'high';
  notes: string;
  timestamp: string;
  aiAction?: string;
  aiPriority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface TransportationStatus {
  id: string;
  type: 'shuttle' | 'parking';
  name: string;
  status: string; // e.g. "On Time", "Delayed", "85% Full"
  eta: string; // e.g. "10 mins"
  updatedAt: string;
}

export interface SustainabilityScore {
  userId: string;
  score: number;
  itemsScanned: number;
  updatedAt: string;
}

export interface BroadcastAnnouncement {
  id: string;
  originalText: string;
  translations: {
    en: string;
    es: string;
    fr: string;
    ar: string;
    hi: string;
    pt: string;
  };
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface WayfindingInfo {
  section: string;
  nearestGate: string;
  nearestRestroom: string;
  accessibleEntrance: string;
}
