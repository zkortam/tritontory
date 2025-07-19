import { espnAPI } from './espn-api';
import { ncaaAPI } from './ncaa-api';


// Sports that ESPN covers well
const ESPN_SPORTS = ['basketball', 'baseball'];

// Sports that NCAA API covers better
const NCAA_SPORTS = [
  'football', 'soccer-men', 'soccer-women', 'volleyball', 'hockey-men', 'hockey-women',
  'softball', 'lacrosse-men', 'lacrosse-women', 'tennis-men', 'tennis-women',
  'swimming-men', 'swimming-women', 'track-men', 'track-women', 'golf-men', 'golf-women',
  'wrestling', 'gymnastics', 'field-hockey', 'water-polo-men', 'water-polo-women',
  'bowling', 'fencing', 'rowing', 'skiing', 'volleyball-beach'
];

export interface UnifiedGame {
  id: string;
  sport: string;
  source: 'espn' | 'ncaa';
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  gameStatus: 'scheduled' | 'live' | 'halftime' | 'final' | 'postponed';
  gameTime: string;
  venue: string;
  date: Date;
  period: string;
  timeRemaining: string;
  isEnabled: boolean;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
}

class UnifiedSportsAPI {
  // Get live games from all sources
  async getLiveUCSDGames(): Promise<UnifiedGame[]> {
    const allGames: UnifiedGame[] = [];

    try {
      // Get ESPN games
      const espnGames = await espnAPI.getLiveUCSDGames();
      for (const game of espnGames) {
        const sportType = game.name.toLowerCase().includes('basketball') ? 'basketball' : 'baseball';
        const bannerData = espnAPI.convertESPNGameToBanner(game, sportType);
        if (bannerData && bannerData.homeTeamId && bannerData.awayTeamId) {
          allGames.push({
            id: game.id,
            sport: sportType,
            source: 'espn',
            homeTeamId: bannerData.homeTeamId,
            awayTeamId: bannerData.awayTeamId,
            homeScore: bannerData.homeScore || 0,
            awayScore: bannerData.awayScore || 0,
            gameStatus: bannerData.gameStatus || 'scheduled',
            gameTime: bannerData.gameTime || '',
            venue: bannerData.venue || '',
            date: bannerData.date || new Date(),
            period: bannerData.period || '',
            timeRemaining: bannerData.timeRemaining || '',
            isEnabled: bannerData.isEnabled || true
          });
        }
      }

      // Get NCAA games for sports not covered by ESPN
      for (const ncaaSport of NCAA_SPORTS) {
        try {
          const ncaaGames = await ncaaAPI.getUCSDGames(ncaaSport);
          for (const game of ncaaGames) {
            const bannerData = ncaaAPI.convertNCAAGameToBanner(game, ncaaSport);
            if (bannerData && bannerData.homeTeamId && bannerData.awayTeamId) {
              allGames.push({
                id: game.game.gameID,
                sport: ncaaSport,
                source: 'ncaa',
                homeTeamId: bannerData.homeTeamId,
                awayTeamId: bannerData.awayTeamId,
                homeScore: bannerData.homeScore || 0,
                awayScore: bannerData.awayScore || 0,
                gameStatus: bannerData.gameStatus || 'scheduled',
                gameTime: bannerData.gameTime || '',
                venue: bannerData.venue || '',
                date: bannerData.date || new Date(),
                period: bannerData.period || '',
                timeRemaining: bannerData.timeRemaining || '',
                isEnabled: bannerData.isEnabled || true
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching NCAA games for ${ncaaSport}:`, error);
        }
      }

      return allGames;
    } catch (error) {
      console.error('Error fetching live UCSD games:', error);
      return [];
    }
  }

  // Get upcoming games from all sources
  async getUpcomingUCSDGames(): Promise<UnifiedGame[]> {
    const allGames: UnifiedGame[] = [];

    try {
      // Get ESPN upcoming games
      const espnGames = await espnAPI.getUpcomingUCSDGames();
      for (const game of espnGames) {
        const sportType = game.name.toLowerCase().includes('basketball') ? 'basketball' : 'baseball';
        const bannerData = espnAPI.convertESPNGameToBanner(game, sportType);
        if (bannerData && bannerData.homeTeamId && bannerData.awayTeamId) {
          allGames.push({
            id: game.id,
            sport: sportType,
            source: 'espn',
            homeTeamId: bannerData.homeTeamId,
            awayTeamId: bannerData.awayTeamId,
            homeScore: bannerData.homeScore || 0,
            awayScore: bannerData.awayScore || 0,
            gameStatus: bannerData.gameStatus || 'scheduled',
            gameTime: bannerData.gameTime || '',
            venue: bannerData.venue || '',
            date: bannerData.date || new Date(),
            period: bannerData.period || '',
            timeRemaining: bannerData.timeRemaining || '',
            isEnabled: bannerData.isEnabled || true
          });
        }
      }

      // Get NCAA upcoming games
      for (const ncaaSport of NCAA_SPORTS) {
        try {
          const ncaaGames = await ncaaAPI.getUpcomingUCSDGames(ncaaSport);
          for (const game of ncaaGames) {
            const bannerData = ncaaAPI.convertNCAAGameToBanner(game, ncaaSport);
            if (bannerData && bannerData.homeTeamId && bannerData.awayTeamId) {
              allGames.push({
                id: game.game.gameID,
                sport: ncaaSport,
                source: 'ncaa',
                homeTeamId: bannerData.homeTeamId,
                awayTeamId: bannerData.awayTeamId,
                homeScore: bannerData.homeScore || 0,
                awayScore: bannerData.awayScore || 0,
                gameStatus: bannerData.gameStatus || 'scheduled',
                gameTime: bannerData.gameTime || '',
                venue: bannerData.venue || '',
                date: bannerData.date || new Date(),
                period: bannerData.period || '',
                timeRemaining: bannerData.timeRemaining || '',
                isEnabled: bannerData.isEnabled || true
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching NCAA upcoming games for ${ncaaSport}:`, error);
        }
      }

      return allGames;
    } catch (error) {
      console.error('Error fetching upcoming UCSD games:', error);
      return [];
    }
  }

  // Get games for a specific sport
  async getUCSDGamesBySport(sportName: string): Promise<UnifiedGame[]> {
    try {
      if (ESPN_SPORTS.includes(sportName)) {
        // Use ESPN for basketball and baseball
        const espnGames = await espnAPI.getUCSDGames(sportName as 'basketball' | 'baseball');
        const mappedGames = espnGames.map(game => {
          const bannerData = espnAPI.convertESPNGameToBanner(game, sportName as 'basketball' | 'baseball');
          if (bannerData && bannerData.homeTeamId && bannerData.awayTeamId) {
            return {
              id: game.id,
              sport: sportName,
              source: 'espn' as const,
              homeTeamId: bannerData.homeTeamId,
              awayTeamId: bannerData.awayTeamId,
              homeScore: bannerData.homeScore || 0,
              awayScore: bannerData.awayScore || 0,
              gameStatus: bannerData.gameStatus || 'scheduled',
              gameTime: bannerData.gameTime || '',
              venue: bannerData.venue || '',
              date: bannerData.date || new Date(),
              period: bannerData.period || '',
              timeRemaining: bannerData.timeRemaining || '',
              isEnabled: bannerData.isEnabled || true
            } as UnifiedGame;
          }
          return null;
        });
        return mappedGames.filter((game): game is UnifiedGame => game !== null);
      } else if (NCAA_SPORTS.includes(sportName)) {
        // Use NCAA for other sports
        const ncaaGames = await ncaaAPI.getUCSDGames(sportName);
        const mappedNCAAGames = ncaaGames.map(game => {
          const bannerData = ncaaAPI.convertNCAAGameToBanner(game, sportName);
          if (bannerData && bannerData.homeTeamId && bannerData.awayTeamId) {
            return {
              id: game.game.gameID,
              sport: sportName,
              source: 'ncaa' as const,
              homeTeamId: bannerData.homeTeamId,
              awayTeamId: bannerData.awayTeamId,
              homeScore: bannerData.homeScore || 0,
              awayScore: bannerData.awayScore || 0,
              gameStatus: bannerData.gameStatus || 'scheduled',
              gameTime: bannerData.gameTime || '',
              venue: bannerData.venue || '',
              date: bannerData.date || new Date(),
              period: bannerData.period || '',
              timeRemaining: bannerData.timeRemaining || '',
              isEnabled: bannerData.isEnabled || true
            } as UnifiedGame;
          }
          return null;
        });
        return mappedNCAAGames.filter((game): game is UnifiedGame => game !== null);
      } else {
        console.warn(`Unknown sport: ${sportName}`);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching games for ${sportName}:`, error);
      return [];
    }
  }

  // Get all available sports
  getAllAvailableSports(): string[] {
    return [...ESPN_SPORTS, ...NCAA_SPORTS];
  }

  // Get sports covered by ESPN
  getESPNSports(): string[] {
    return [...ESPN_SPORTS];
  }

  // Get sports covered by NCAA API
  getNCAAAPISports(): string[] {
    return [...NCAA_SPORTS];
  }

  // Test API connectivity
  async testAPIs(): Promise<{
    espn: boolean;
    ncaa: boolean;
    details: string[];
  }> {
    const results = {
      espn: false,
      ncaa: false,
      details: [] as string[]
    };

    try {
      // Test ESPN API
      const espnGames = await espnAPI.getUCSDGames('basketball');
      results.espn = true;
      results.details.push(`ESPN API: ✅ Working (${espnGames.length} basketball games found)`);
    } catch (error) {
      results.details.push(`ESPN API: ❌ Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      // Test NCAA API
      const ncaaGames = await ncaaAPI.getUCSDGames('football');
      results.ncaa = true;
      results.details.push(`NCAA API: ✅ Working (${ncaaGames.length} football games found)`);
    } catch (error) {
      results.details.push(`NCAA API: ❌ Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }

  // Get comprehensive UCSD sports data
  async getComprehensiveUCSDData(): Promise<{
    liveGames: UnifiedGame[];
    upcomingGames: UnifiedGame[];
    totalSports: number;
    apiStatus: { espn: boolean; ncaa: boolean };
  }> {
    const [liveGames, upcomingGames, apiStatus] = await Promise.all([
      this.getLiveUCSDGames(),
      this.getUpcomingUCSDGames(),
      this.testAPIs()
    ]);

    return {
      liveGames,
      upcomingGames,
      totalSports: this.getAllAvailableSports().length,
      apiStatus: {
        espn: apiStatus.espn,
        ncaa: apiStatus.ncaa
      }
    };
  }
}

export const unifiedSportsAPI = new UnifiedSportsAPI(); 