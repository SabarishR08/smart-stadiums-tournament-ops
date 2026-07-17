import { describe, it, expect } from 'vitest';
import { COUNTRY_CODES } from '../../components/tournament/TournamentData';

describe('Tournament COUNTRY_CODES Mappings', () => {
  it('should resolve standard country codes and emojis correctly', () => {
    expect(COUNTRY_CODES['Mexico']).toEqual({ code: 'mx', emoji: '🇲🇽' });
    expect(COUNTRY_CODES['Argentina']).toEqual({ code: 'ar', emoji: '🇦🇷' });
    expect(COUNTRY_CODES['USA']).toEqual({ code: 'us', emoji: '🇺🇸' });
  });

  it('should handle multi-word and special name mappings correctly', () => {
    expect(COUNTRY_CODES['South Africa']).toBeDefined();
    expect(COUNTRY_CODES['South Africa']?.code).toBe('za');
    expect(COUNTRY_CODES['Republic of Korea']?.code).toBe('kr');
  });

  it('should return undefined for non-existent countries', () => {
    expect(COUNTRY_CODES['Atlantis']).toBeUndefined();
  });
});
