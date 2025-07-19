export interface NCAAGame {
  game: {
    away: {
      score: string;
      names: {
        char6: string;
        short: string;
        seo: string;
        full: string;
      };
      winner: boolean;
      seed: string;
      description: string;
      rank: string;
      conferences: Array<{
        conferenceName: string;
        conferenceSeo: string;
      }>;
    };
    home: {
      score: string;
      names: {
        char6: string;
        short: string;
        seo: string;
        full: string;
      };
      winner: boolean;
      seed: string;
      description: string;
      rank: string;
      conferences: Array<{
        conferenceName: string;
        conferenceSeo: string;
      }>;
    };
    gameID: string;
    finalMessage: string;
    bracketRound: string;
    title: string;
    contestName: string;
    url: string;
    network: string;
    liveVideoEnabled: boolean;
    startTime: string;
    startTimeEpoch: string;
    bracketId: string;
    gameState: string;
    startDate: string;
    currentPeriod: string;
    videoState: string;
    bracketRegion: string;
    contestClock: string;
  };
}

export interface NCAAScoreboardResponse {
  inputMD5Sum: string;
  instanceId: string;
  updated_at: string;
  hideRank: boolean;
  games: NCAAGame[];
}

export interface NCAARanking {
  RANK: string;
  SCHOOL: string;
  POINTS: string;
  PREVIOUS: string;
  RECORD: string;
}

export interface NCAARankingsResponse {
  sport: string;
  title: string;
  updated: string;
  page: number;
  pages: number;
  data: NCAARanking[];
}

export interface NCAASchedule {
  contest_date: string;
  year: string;
  weekday: string;
  games: number;
  season: string;
  day: string;
}

export interface NCAAScheduleResponse {
  division: string;
  inputMD5Sum: string;
  month: string;
  conference_name: string;
  created_at: string;
  season: string;
  sport: string;
  gameDates: NCAASchedule[];
}

class NCAAPI {
  private baseURL = 'https://ncaa-api.henrygd.me';

  // Sports mapping for NCAA API
  private sportMapping = {
    'football': 'football',
    'basketball-men': 'basketball-men',
    'basketball-women': 'basketball-women',
    'soccer-men': 'soccer-men',
    'soccer-women': 'soccer-women',
    'volleyball': 'volleyball',
    'hockey-men': 'hockey-men',
    'hockey-women': 'hockey-women',
    'baseball': 'baseball',
    'softball': 'softball',
    'lacrosse-men': 'lacrosse-men',
    'lacrosse-women': 'lacrosse-women',
    'tennis-men': 'tennis-men',
    'tennis-women': 'tennis-women',
    'swimming-men': 'swimming-men',
    'swimming-women': 'swimming-women',
    'track-men': 'track-men',
    'track-women': 'track-women',
    'golf-men': 'golf-men',
    'golf-women': 'golf-women',
    'wrestling': 'wrestling',
    'gymnastics': 'gymnastics',
    'field-hockey': 'field-hockey',
    'water-polo-men': 'water-polo-men',
    'water-polo-women': 'water-polo-women',
    'bowling': 'bowling',
    'fencing': 'fencing',
    'rowing': 'rowing',
    'skiing': 'skiing',
    'volleyball-beach': 'volleyball-beach'
  };

  // Division mapping
  private divisionMapping = {
    'd1': 'd1',
    'd2': 'd2',
    'd3': 'd3',
    'fbs': 'fbs', // Football Bowl Subdivision
    'fcs': 'fcs', // Football Championship Subdivision
    'nc': 'nc'    // National Championship
  };

  async getScoreboard(sport: string, division: string, year: string, week?: string, conference: string = 'all-conf'): Promise<NCAAScoreboardResponse> {
    try {
      const sportKey = this.sportMapping[sport as keyof typeof this.sportMapping];
      const divisionKey = this.divisionMapping[division as keyof typeof this.divisionMapping];
      
      if (!sportKey || !divisionKey) {
        throw new Error(`Invalid sport or division: ${sport}/${division}`);
      }

      let url = `${this.baseURL}/scoreboard/${sportKey}/${divisionKey}/${year}`;
      if (week) {
        url += `/${week}`;
      }
      url += `/${conference}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`NCAA API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching NCAA scoreboard for ${sport}/${division}:`, error);
      throw error;
    }
  }

  async getRankings(sport: string, division: string, poll: string = 'associated-press'): Promise<NCAARankingsResponse> {
    try {
      const sportKey = this.sportMapping[sport as keyof typeof this.sportMapping];
      const divisionKey = this.divisionMapping[division as keyof typeof this.divisionMapping];
      
      if (!sportKey || !divisionKey) {
        throw new Error(`Invalid sport or division: ${sport}/${division}`);
      }

      const url = `${this.baseURL}/rankings/${sportKey}/${divisionKey}/${poll}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`NCAA API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching NCAA rankings for ${sport}/${division}:`, error);
      throw error;
    }
  }

  async getSchedule(sport: string, division: string, year: string, month?: string): Promise<NCAAScheduleResponse> {
    try {
      const sportKey = this.sportMapping[sport as keyof typeof this.sportMapping];
      const divisionKey = this.divisionMapping[division as keyof typeof this.divisionMapping];
      
      if (!sportKey || !divisionKey) {
        throw new Error(`Invalid sport or division: ${sport}/${division}`);
      }

      let url = `${this.baseURL}/schedule/${sportKey}/${divisionKey}/${year}`;
      if (month) {
        url += `/${month}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`NCAA API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching NCAA schedule for ${sport}/${division}:`, error);
      throw error;
    }
  }

  // Get UCSD games from NCAA API
  async getUCSDGames(sport: string): Promise<NCAAGame[]> {
    try {
      // const currentYear = new Date().getFullYear().toString();
      // const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      
      // Get current scoreboard
      const scoreboard = await this.getScoreboard(sport, 'd1', '2024', undefined, 'all-conf');
      
      // Filter for UCSD games
      const ucsdGames = scoreboard.games.filter(game => {
        const awayTeam = game.game.away.names.full.toLowerCase();
        const homeTeam = game.game.home.names.full.toLowerCase();
        
        return awayTeam.includes('uc san diego') || 
               awayTeam.includes('tritons') ||
               homeTeam.includes('uc san diego') || 
               homeTeam.includes('tritons') ||
               awayTeam.includes('ucsd') ||
               homeTeam.includes('ucsd');
      });

      return ucsdGames;
    } catch (error) {
      console.error(`Error fetching UCSD games for ${sport}:`, error);
      return [];
    }
  }

  // Get upcoming UCSD games
  async getUpcomingUCSDGames(sport: string): Promise<NCAAGame[]> {
    try {
      // const currentYear = new Date().getFullYear().toString();
      // const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      
      // Get schedule for current month
      // const schedule = await this.getSchedule(sport, division, currentYear, currentMonth);
      
      // For now, return empty array as schedule doesn't include game details
      // We'd need to fetch individual game data for upcoming games
      return [];
    } catch (error) {
      console.error(`Error fetching upcoming UCSD games for ${sport}:`, error);
      return [];
    }
  }

  // Convert NCAA game to our SportBanner format
  convertNCAAGameToBanner(ncaaGame: NCAAGame, sport: string) {
    const game = ncaaGame.game;
    
    // Determine game status
    let gameStatus: 'scheduled' | 'live' | 'halftime' | 'final' | 'postponed' = 'scheduled';
    if (game.gameState === 'final') {
      gameStatus = 'final';
    } else if (game.gameState === 'live') {
      gameStatus = 'live';
    } else if (game.currentPeriod === 'HALFTIME') {
      gameStatus = 'halftime';
    }

    // Determine if UCSD is home or away
    const isUCSDHome = game.home.names.full.toLowerCase().includes('uc san diego') || 
                      game.home.names.full.toLowerCase().includes('tritons') ||
                      game.home.names.full.toLowerCase().includes('ucsd');
    
    const ucsdTeam = isUCSDHome ? game.home : game.away;
    const opponentTeam = isUCSDHome ? game.away : game.home;

    return {
      sport,
      homeTeamId: isUCSDHome ? 'ucsd' : this.getTeamIdFromNCAA(opponentTeam.names.short),
      awayTeamId: isUCSDHome ? this.getTeamIdFromNCAA(opponentTeam.names.short) : 'ucsd',
      homeScore: parseInt(isUCSDHome ? ucsdTeam.score : opponentTeam.score) || 0,
      awayScore: parseInt(isUCSDHome ? opponentTeam.score : ucsdTeam.score) || 0,
      gameStatus,
      gameTime: game.startTime || game.finalMessage,
      venue: 'TBD', // NCAA API doesn't provide venue info in scoreboard
      date: new Date(parseInt(game.startTimeEpoch) * 1000),
      period: game.currentPeriod,
      timeRemaining: game.contestClock,
      isEnabled: true
    };
  }

  private getTeamIdFromNCAA(teamName: string): string {
    // Map NCAA team names to our team IDs
    const teamMap: { [key: string]: string } = {
      'UC San Diego': 'ucsd',
      'UCSD': 'ucsd',
      'Tritons': 'ucsd',
      'UCLA': 'ucla',
      'USC': 'usc',
      'Stanford': 'stanford',
      'Cal': 'cal',
      'San Diego St.': 'sdsu',
      'SDSU': 'sdsu',
      'UNLV': 'unlv',
      'Gonzaga': 'gonzaga',
      'Saint Mary\'s': 'saint-marys',
      'UC Santa Barbara': 'ucsb',
      'UCSB': 'ucsb',
      'UC Irvine': 'uci',
      'UCI': 'uci',
      'UC Riverside': 'ucr',
      'UCR': 'ucr',
      'UC Davis': 'ucd',
      'UCD': 'ucd',
      'Cal State Fullerton': 'csuf',
      'CSUF': 'csuf',
      'Long Beach St.': 'csulb',
      'CSULB': 'csulb',
      'CSUN': 'csun',
      'Hawai\'i': 'uh',
      'UH': 'uh',
      'Cal State Bakersfield': 'bakersfield',
      'CSUB': 'bakersfield'
    };

    return teamMap[teamName] || teamName.toLowerCase().replace(/\s+/g, '-');
  }

  // Get all available sports
  getAvailableSports(): string[] {
    return Object.keys(this.sportMapping);
  }

  // Get all available divisions
  getAvailableDivisions(): string[] {
    return Object.keys(this.divisionMapping);
  }
}

export const ncaaAPI = new NCAAPI(); 