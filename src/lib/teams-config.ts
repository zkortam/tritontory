export interface Team {
  id: string;
  name: string;
  shortName: string;
  conference: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
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
        secondaryColor: '#FFD700'
      },
      {
        id: 'ucsb',
        name: 'UC Santa Barbara',
        shortName: 'UCSB',
        conference: 'Big West',
        logo: '/logos/ucsb.png',
        primaryColor: '#003366',
        secondaryColor: '#FFD700'
      },
      {
        id: 'uci',
        name: 'UC Irvine',
        shortName: 'UCI',
        conference: 'Big West',
        logo: '/logos/uci.png',
        primaryColor: '#0066CC',
        secondaryColor: '#FF6B35'
      },
      {
        id: 'ucr',
        name: 'UC Riverside',
        shortName: 'UCR',
        conference: 'Big West',
        logo: '/logos/ucr.png',
        primaryColor: '#1E3A8A',
        secondaryColor: '#F59E0B'
      },
      {
        id: 'ucd',
        name: 'UC Davis',
        shortName: 'UCD',
        conference: 'Big West',
        logo: '/logos/ucd.png',
        primaryColor: '#1E40AF',
        secondaryColor: '#F59E0B'
      },
      {
        id: 'csuf',
        name: 'Cal State Fullerton',
        shortName: 'CSUF',
        conference: 'Big West',
        logo: '/logos/csuf.png',
        primaryColor: '#DC2626',
        secondaryColor: '#F59E0B'
      },
      {
        id: 'csulb',
        name: 'Long Beach State',
        shortName: 'CSULB',
        conference: 'Big West',
        logo: '/logos/csulb.png',
        primaryColor: '#1E40AF',
        secondaryColor: '#F59E0B'
      },
      {
        id: 'csun',
        name: 'Cal State Northridge',
        shortName: 'CSUN',
        conference: 'Big West',
        logo: '/logos/csun.png',
        primaryColor: '#DC2626',
        secondaryColor: '#000000'
      },
      {
        id: 'uh',
        name: 'Hawai\'i',
        shortName: 'UH',
        conference: 'Big West',
        logo: '/logos/uh.png',
        primaryColor: '#1E40AF',
        secondaryColor: '#F59E0B'
      },
      {
        id: 'bakersfield',
        name: 'Cal State Bakersfield',
        shortName: 'CSUB',
        conference: 'Big West',
        logo: '/logos/bakersfield.png',
        primaryColor: '#DC2626',
        secondaryColor: '#000000'
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
        logo: '/logos/ucla.png',
        primaryColor: '#1E40AF',
        secondaryColor: '#F59E0B'
      },
      {
        id: 'usc',
        name: 'USC',
        shortName: 'USC',
        conference: 'Pac-12',
        logo: '/logos/usc.png',
        primaryColor: '#DC2626',
        secondaryColor: '#F59E0B'
      },
      {
        id: 'stanford',
        name: 'Stanford',
        shortName: 'STAN',
        conference: 'Pac-12',
        logo: '/logos/stanford.png',
        primaryColor: '#DC2626',
        secondaryColor: '#000000'
      },
      {
        id: 'cal',
        name: 'California',
        shortName: 'CAL',
        conference: 'Pac-12',
        logo: '/logos/cal.png',
        primaryColor: '#1E40AF',
        secondaryColor: '#F59E0B'
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
        logo: '/logos/sdsu.png',
        primaryColor: '#1E40AF',
        secondaryColor: '#F59E0B'
      },
      {
        id: 'unlv',
        name: 'UNLV',
        shortName: 'UNLV',
        conference: 'Mountain West',
        logo: '/logos/unlv.png',
        primaryColor: '#DC2626',
        secondaryColor: '#000000'
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
        logo: '/logos/gonzaga.png',
        primaryColor: '#1E40AF',
        secondaryColor: '#F59E0B'
      },
      {
        id: 'saint-marys',
        name: 'Saint Mary\'s',
        shortName: 'SMC',
        conference: 'WCC',
        logo: '/logos/saint-marys.png',
        primaryColor: '#1E40AF',
        secondaryColor: '#F59E0B'
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