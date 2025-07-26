export interface Team {
  id: string;
  name: string;
  shortName: string;
  conference: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  instagram: string;
}

export interface Conference {
  id: string;
  name: string;
  teams: Team[];
}

export const CONFERENCES: Conference[] = [
  {
    id: 'big-west',
    name: 'Big West Conference',
    teams: [
      {
        id: 'ucsd',
        name: 'UC San Diego',
        shortName: 'UCSD',
        conference: 'Big West',
        logo: '/triton.png',
        primaryColor: '#0066CC',
        secondaryColor: '#FFD700',
        instagram: 'https://www.instagram.com/ucsdtritons/'
      },
      {
        id: 'ucsb',
        name: 'UC Santa Barbara',
        shortName: 'UCSB',
        conference: 'Big West',
        logo: '/ucsb.png',
        primaryColor: '#003366',
        secondaryColor: '#FFD700',
        instagram: 'https://www.instagram.com/ucsbathletics/'
      },
      {
        id: 'uci',
        name: 'UC Irvine',
        shortName: 'UCI',
        conference: 'Big West',
        logo: '/uci.png',
        primaryColor: '#0066CC',
        secondaryColor: '#FF6B35',
        instagram: 'https://www.instagram.com/uciathletics/'
      },
      {
        id: 'ucr',
        name: 'UC Riverside',
        shortName: 'UCR',
        conference: 'Big West',
        logo: '/ucr.png',
        primaryColor: '#1E3A8A',
        secondaryColor: '#F59E0B',
        instagram: 'https://www.instagram.com/ucr_athletics/'
      },
      {
        id: 'ucd',
        name: 'UC Davis',
        shortName: 'UCD',
        conference: 'Big West',
        logo: '/ucd.webp',
        primaryColor: '#1E40AF',
        secondaryColor: '#F59E0B',
        instagram: 'https://www.instagram.com/ucdavisaggies/'
      },
      {
        id: 'csuf',
        name: 'Cal State Fullerton',
        shortName: 'CSUF',
        conference: 'Big West',
        logo: '/csuf.png',
        primaryColor: '#DC2626',
        secondaryColor: '#F59E0B',
        instagram: 'https://www.instagram.com/fullertontitans/'
      },
      {
        id: 'csulb',
        name: 'Long Beach State',
        shortName: 'CSULB',
        conference: 'Big West',
        logo: '/csulb.png',
        primaryColor: '#1E40AF',
        secondaryColor: '#F59E0B',
        instagram: 'https://www.instagram.com/longbeachstate/'
      },
      {
        id: 'csun',
        name: 'Cal State Northridge',
        shortName: 'CSUN',
        conference: 'Big West',
        logo: '/csun.png',
        primaryColor: '#DC2626',
        secondaryColor: '#000000',
        instagram: 'https://www.instagram.com/csunmatadors/'
      },
      {
        id: 'uh',
        name: 'Hawai\'i',
        shortName: 'UH',
        conference: 'Big West',
        logo: '/hawaii.png.webp',
        primaryColor: '#1E40AF',
        secondaryColor: '#F59E0B',
        instagram: 'https://www.instagram.com/hawaiiathletics/'
      },
      {
        id: 'bakersfield',
        name: 'Cal State Bakersfield',
        shortName: 'CSUB',
        conference: 'Big West',
        logo: '/csubaker.webp',
        primaryColor: '#DC2626',
        secondaryColor: '#000000',
        instagram: 'https://www.instagram.com/csub_athletics/'
      }
    ]
  },
  {
    id: 'pac-12',
    name: 'Pac-12 Conference',
    teams: [
      {
        id: 'ucla',
        name: 'UCLA',
        shortName: 'UCLA',
        conference: 'Pac-12',
        logo: '/ucla.png',
        primaryColor: '#1E40AF',
        secondaryColor: '#F59E0B',
        instagram: 'https://www.instagram.com/uclabruins/'
      },
      {
        id: 'usc',
        name: 'USC',
        shortName: 'USC',
        conference: 'Pac-12',
        logo: '/usc.webp',
        primaryColor: '#DC2626',
        secondaryColor: '#F59E0B',
        instagram: 'https://www.instagram.com/usc_trojans/'
      },
      {
        id: 'stanford',
        name: 'Stanford',
        shortName: 'STAN',
        conference: 'Pac-12',
        logo: '/stanford.png',
        primaryColor: '#DC2626',
        secondaryColor: '#000000',
        instagram: 'https://www.instagram.com/stanfordcard/'
      },
      {
        id: 'cal',
        name: 'California',
        shortName: 'CAL',
        conference: 'Pac-12',
        logo: '/ucb.png',
        primaryColor: '#1E40AF',
        secondaryColor: '#F59E0B',
        instagram: 'https://www.instagram.com/calathletics/'
      }
    ]
  },
  {
    id: 'mountain-west',
    name: 'Mountain West Conference',
    teams: [
      {
        id: 'sdsu',
        name: 'San Diego State',
        shortName: 'SDSU',
        conference: 'Mountain West',
        logo: '/sdsu.png',
        primaryColor: '#1E40AF',
        secondaryColor: '#F59E0B',
        instagram: 'https://www.instagram.com/aztecathletics/'
      },
      {
        id: 'unlv',
        name: 'UNLV',
        shortName: 'UNLV',
        conference: 'Mountain West',
        logo: '/unlv.png',
        primaryColor: '#DC2626',
        secondaryColor: '#000000',
        instagram: 'https://www.instagram.com/unlvathletics/'
      }
    ]
  },
  {
    id: 'wcc',
    name: 'West Coast Conference',
    teams: [
      {
        id: 'gonzaga',
        name: 'Gonzaga',
        shortName: 'GONZ',
        conference: 'WCC',
        logo: '/gonzaga.png',
        primaryColor: '#1E40AF',
        secondaryColor: '#F59E0B',
        instagram: 'https://www.instagram.com/zagathletics/'
      },
      {
        id: 'saint-marys',
        name: 'Saint Mary\'s',
        shortName: 'SMC',
        conference: 'WCC',
        logo: '/saintmarys.png',
        primaryColor: '#1E40AF',
        secondaryColor: '#F59E0B',
        instagram: 'https://www.instagram.com/smcgaels/'
      }
    ]
  }
];

// Helper function to get all teams
export const getAllTeams = (): Team[] => {
  return CONFERENCES.flatMap(conference => conference.teams);
};

// Helper function to get team by ID
export const getTeamById = (id: string): Team | undefined => {
  return getAllTeams().find(team => team.id === id);
};

// Helper function to get UCSD team
export const getUCSDTeam = (): Team => {
  return getTeamById('ucsd')!;
};

// Helper function to get teams by conference
export const getTeamsByConference = (conferenceId: string): Team[] => {
  const conference = CONFERENCES.find(c => c.id === conferenceId);
  return conference ? conference.teams : [];
}; 