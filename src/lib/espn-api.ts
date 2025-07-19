export interface ESPNGame {
  id: string;
  name: string;
  shortName: string;
  status: {
    type: {
      id: string;
      name: string;
      state: string;
      completed: boolean;
      description: string;
      detail: string;
      shortDetail: string;
    };
    period: number;
    clock: number;
    displayClock: string;
  };
  competitions: Array<{
    id: string;
    competitors: Array<{
      id: string;
      team: {
        id: string;
        name: string;
        abbreviation: string;
        displayName: string;
        color: string;
        alternateColor: string;
        logo: string;
      };
      score: string;
      homeAway: 'home' | 'away';
    }>;
    venue: {
      id: string;
      fullName: string;
      address: {
        city: string;
        state: string;
      };
    };
  }>;
  date: string;
  links: Array<{
    href: string;
    text: string;
  }>;
}

export interface ESPNTeam {
  team: {
    id: string;
    abbreviation: string;
    displayName: string;
    name: string;
    color: string;
    alternateColor: string;
    logo: string;
    location: string;
  };
  uid: string;
}

export interface ESPNNews {
  id: string;
  headline: string;
  description: string;
  links: Array<{
    href: string;
    text: string;
  }>;
  published: string;
  lastModified: string;
  images: Array<{
    name: string;
    url: string;
    alt: string;
  }>;
}

export interface ESPNScoreboardResponse {
  events: ESPNGame[];
}

export interface ESPNTeamsResponse {
  sports: Array<{
    leagues: Array<{
      teams: ESPNTeam[];
    }>;
  }>;
}

export interface ESPNNewsResponse {
  articles: ESPNNews[];
}

class ESPNAPI {
  private baseURL = 'https://site.api.espn.com/apis/site/v2/sports';
  private ucsdTeamIds: { [sport: string]: string } = {};

  constructor() {
    this.initializeTeamIds();
  }

  private async initializeTeamIds() {
    try {
      const [basketballTeams, baseballTeams] = await Promise.all([
        this.fetchTeams('basketball', 'mens-college-basketball'),
        this.fetchTeams('baseball', 'college-baseball')
      ]);

      // Find UCSD team IDs
      const basketballUCSD = basketballTeams.find(team => 
        team.team.abbreviation === 'UCSD' || 
        team.team.displayName.includes('UC San Diego')
      );
      
      const baseballUCSD = baseballTeams.find(team => 
        team.team.abbreviation === 'UCSD' || 
        team.team.displayName.includes('UC San Diego')
      );

      if (basketballUCSD) this.ucsdTeamIds.basketball = basketballUCSD.team.id;
      if (baseballUCSD) this.ucsdTeamIds.baseball = baseballUCSD.team.id;
    } catch (error) {
      console.error('Error initializing ESPN team IDs:', error);
    }
  }

  private async fetchTeams(sport: string, league: string): Promise<ESPNTeam[]> {
    try {
      const response = await fetch(`${this.baseURL}/${sport}/${league}/teams`);
      const data: ESPNTeamsResponse = await response.json();
      return data.sports[0]?.leagues[0]?.teams || [];
    } catch (error) {
      console.error(`Error fetching ${sport} teams:`, error);
      return [];
    }
  }

  async getUCSDGames(sport: 'basketball' | 'baseball'): Promise<ESPNGame[]> {
    const league = sport === 'basketball' ? 'mens-college-basketball' : 'college-baseball';
    
    try {
      const response = await fetch(`${this.baseURL}/${sport}/${league}/scoreboard`);
      const data: ESPNScoreboardResponse = await response.json();
      
      // Filter for UCSD games
      const ucsdGames = data.events.filter(event => 
        event.competitions[0]?.competitors.some(competitor => 
          competitor.team.abbreviation === 'UCSD' || 
          competitor.team.displayName.includes('UC San Diego')
        )
      );

      return ucsdGames;
    } catch (error) {
      console.error(`Error fetching ${sport} scoreboard:`, error);
      return [];
    }
  }

  async getUCSDNews(sport: 'basketball' | 'baseball'): Promise<ESPNNews[]> {
    const league = sport === 'basketball' ? 'mens-college-basketball' : 'college-baseball';
    
    try {
      const response = await fetch(`${this.baseURL}/${sport}/${league}/news`);
      const data: ESPNNewsResponse = await response.json();
      
      // Filter for UCSD news
      const ucsdNews = data.articles.filter(article => 
        article.headline.includes('UC San Diego') || 
        article.headline.includes('Tritons') ||
        article.description.includes('UC San Diego') ||
        article.description.includes('Tritons')
      );

      return ucsdNews;
    } catch (error) {
      console.error(`Error fetching ${sport} news:`, error);
      return [];
    }
  }

  async getTeamDetails(sport: 'basketball' | 'baseball', teamId: string) {
    const league = sport === 'basketball' ? 'mens-college-basketball' : 'college-baseball';
    
    try {
      const response = await fetch(`${this.baseURL}/${sport}/${league}/teams/${teamId}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching team details:`, error);
      return null;
    }
  }

  // Convert ESPN game to our SportBanner format
  convertESPNGameToBanner(espnGame: ESPNGame, sport: 'basketball' | 'baseball') {
    const competition = espnGame.competitions[0];
    if (!competition) return null;

    const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
    const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
    
    if (!homeTeam || !awayTeam) return null;

    // Determine game status
    let gameStatus: 'scheduled' | 'live' | 'halftime' | 'final' | 'postponed' = 'scheduled';
    if (espnGame.status.type.state === 'post') {
      gameStatus = 'final';
    } else if (espnGame.status.type.state === 'in') {
      if (espnGame.status.period === 2 && espnGame.status.clock === 0) {
        gameStatus = 'halftime';
      } else {
        gameStatus = 'live';
      }
    }

    // Format time remaining
    let timeRemaining = '';
    if (gameStatus === 'live') {
      const minutes = Math.floor(espnGame.status.clock / 60);
      const seconds = espnGame.status.clock % 60;
      timeRemaining = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Format period
    let period = '';
    if (sport === 'basketball') {
      if (espnGame.status.period <= 4) {
        period = `Q${espnGame.status.period}`;
      } else {
        period = `OT${espnGame.status.period - 4}`;
      }
    } else if (sport === 'baseball') {
      period = `${espnGame.status.period}${this.getOrdinalSuffix(espnGame.status.period)}`;
    }

    return {
      sport,
      homeTeamId: this.getTeamIdFromESPN(homeTeam.team),
      awayTeamId: this.getTeamIdFromESPN(awayTeam.team),
      homeScore: parseInt(homeTeam.score) || 0,
      awayScore: parseInt(awayTeam.score) || 0,
      gameStatus,
      gameTime: espnGame.status.type.shortDetail || espnGame.status.type.detail,
      venue: competition.venue?.fullName || 'TBD',
      date: new Date(espnGame.date),
      period,
      timeRemaining,
      isEnabled: true
    };
  }

  private getTeamIdFromESPN(espnTeam: { abbreviation: string }): string {
    // Map ESPN team abbreviations to our team IDs
    const teamMap: { [key: string]: string } = {
      'UCSD': 'ucsd',
      'UCLA': 'ucla',
      'USC': 'usc',
      'STAN': 'stanford',
      'CAL': 'cal',
      'SDSU': 'sdsu',
      'UNLV': 'unlv',
      'GONZ': 'gonzaga',
      'SMC': 'saint-marys',
      'UCSB': 'ucsb',
      'UCI': 'uci',
      'UCR': 'ucr',
      'UCD': 'ucd',
      'CSUF': 'csuf',
      'CSULB': 'csulb',
      'CSUN': 'csun',
      'UH': 'uh',
      'CSUB': 'bakersfield'
    };

    return teamMap[espnTeam.abbreviation] || espnTeam.abbreviation.toLowerCase();
  }

  private getOrdinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }

  // Get live UCSD games for both sports
  async getLiveUCSDGames() {
    const [basketballGames, baseballGames] = await Promise.all([
      this.getUCSDGames('basketball'),
      this.getUCSDGames('baseball')
    ]);

    const liveGames = [...basketballGames, ...baseballGames].filter(game => 
      game.status.type.state === 'in' || game.status.type.state === 'post'
    );

    return liveGames;
  }

  // Get upcoming UCSD games
  async getUpcomingUCSDGames() {
    const [basketballGames, baseballGames] = await Promise.all([
      this.getUCSDGames('basketball'),
      this.getUCSDGames('baseball')
    ]);

    const upcomingGames = [...basketballGames, ...baseballGames].filter(game => 
      game.status.type.state === 'pre'
    );

    return upcomingGames;
  }
}

export const espnAPI = new ESPNAPI(); 