"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InteractiveWorldMap, { CountryData, WORLD_COUNTRIES } from "@/components/common/InteractiveWorldMap";
import { greatCircleDistanceKm, bearingDirection } from "@/lib/utils";
import { feature, neighbors as topoNeighbors } from "topojson-client";
import { geoCentroid } from "d3-geo";
import { 
  Globe,
  Map as MapIcon,
  Flag,
  Building,
  ArrowRight,
  ArrowLeft,
  Target,
  Clock,
  Trophy,
  Zap,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function GeographyPage() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    {
      id: "country-explorer",
      title: "Country Explorer",
      description: "Explore countries on an interactive world map",
      icon: <Globe className="h-6 w-6" />,
      difficulty: "Easy",
      time: "5-15 min",
      featured: true,
      color: "from-blue-400 to-cyan-400",
      bgColor: "bg-blue-500/20"
    },
    {
      id: "country-guesser",
      title: "Country Guesser",
      description: "Guess the mystery country with map hints",
      icon: <Target className="h-6 w-6" />,
      difficulty: "Medium",
      time: "3-8 min",
      featured: true,
      color: "from-green-400 to-emerald-400",
      bgColor: "bg-green-500/20"
    },
    {
      id: "country-connector",
      title: "Country Connector",
      description: "Connect countries by clicking on them",
      icon: <Globe className="h-6 w-6" />,
      difficulty: "Easy",
      time: "3-8 min",
      featured: true,
      color: "from-purple-400 to-violet-400",
      bgColor: "bg-purple-500/20"
    },
    {
      id: "outline-silhouette",
      title: "Outline Silhouette",
      description: "Match the country to its silhouette",
      icon: <MapIcon className="h-6 w-6" />,
      difficulty: "Medium",
      time: "3-8 min",
      featured: false,
      color: "from-slate-400 to-gray-400",
      bgColor: "bg-slate-500/20"
    },
    {
      id: "neighbor-chain",
      title: "Neighbor Chain",
      description: "Build the longest path of bordering countries",
      icon: <MapIcon className="h-6 w-6" />,
      difficulty: "Hard",
      time: "5-10 min",
      featured: false,
      color: "from-emerald-400 to-teal-400",
      bgColor: "bg-emerald-500/20"
    },
    {
      id: "higher-lower-population",
      title: "Higher or Lower: Population",
      description: "Pick which country has the higher population",
      icon: <Trophy className="h-6 w-6" />,
      difficulty: "Easy",
      time: "3-5 min",
      featured: false,
      color: "from-pink-400 to-rose-400",
      bgColor: "bg-rose-500/20"
    },
    {
      id: "capital-finder",
      title: "Capital Finder",
      description: "Find capital cities by clicking on countries",
      icon: <Building className="h-6 w-6" />,
      difficulty: "Hard",
      time: "8-15 min",
      featured: false,
      color: "from-purple-400 to-violet-400",
      bgColor: "bg-purple-500/20"
    },
    {
      id: "flag-master",
      title: "Flag Master",
      description: "Identify countries by their flags on the map",
      icon: <Flag className="h-6 w-6" />,
      difficulty: "Medium",
      time: "5-10 min",
      featured: false,
      color: "from-red-400 to-pink-400",
      bgColor: "bg-red-500/20"
    },
    {
      id: "continent-quiz",
      title: "Continent Quiz",
      description: "Test your knowledge of continents and regions",
      icon: <MapIcon className="h-6 w-6" />,
      difficulty: "Easy",
      time: "5-10 min",
      featured: false,
      color: "from-orange-400 to-yellow-400",
      bgColor: "bg-orange-500/20"
    },
    {
      id: "geography-trivia",
      title: "Geography Trivia",
      description: "Answer questions by clicking on the correct locations",
      icon: <Trophy className="h-6 w-6" />,
      difficulty: "Hard",
      time: "8-12 min",
      featured: false,
      color: "from-indigo-400 to-blue-400",
      bgColor: "bg-indigo-500/20"
    }
  ];

  const featuredGames = games.filter(game => game.featured);

  if (selectedGame) {
    return <MapGameComponent gameId={selectedGame} onBack={() => setSelectedGame(null)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/playground">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Playground
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-green-400 via-teal-400 to-blue-400 bg-clip-text text-transparent leading-tight">
              Geography Games
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              Explore the world through beautiful interactive map-based geography games
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-gray-400 px-4">
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>Interactive Maps</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="h-4 w-4" />
                <span>Learning Games</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                <span>Visual Learning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Featured Games */}
        <section className="mb-8 md:mb-12">
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold">Featured Games</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredGames.map((game) => (
              <Card key={game.id} className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 hover:border-green-500/50 transition-all duration-300 group cursor-pointer" onClick={() => setSelectedGame(game.id)}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-3 rounded-xl ${game.bgColor}`}>
                      {game.icon}
                    </div>
                    <Badge className="bg-green-500/90 text-white text-xs">
                      {game.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-green-400 transition-colors">
                    {game.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{game.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* All Games Grid */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold">All Games</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {games.map((game) => (
              <Card key={game.id} className="bg-gray-900/50 backdrop-blur-sm border-gray-800/50 hover:border-green-500/50 transition-all duration-300 group cursor-pointer" onClick={() => setSelectedGame(game.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${game.bgColor}`}>
                      {game.icon}
                    </div>
                    <Badge className="bg-green-500/90 text-white text-xs">
                      {game.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-green-400 transition-colors">
                    {game.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{game.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Map Game Components
function MapGameComponent({ gameId, onBack }: { gameId: string; onBack: () => void }) {
  switch (gameId) {
    case "country-explorer":
      return <CountryExplorerGame onBack={onBack} />;
    // removed border-blitz per request
    case "country-guesser":
      return <CountryGuesserGame onBack={onBack} />;
    case "capital-finder":
      return <CapitalFinderGame onBack={onBack} />;
    case "flag-master":
      return <FlagMasterGame onBack={onBack} />;
    case "continent-quiz":
      return <ContinentQuizGame onBack={onBack} />;
    case "geography-trivia":
      return <GeographyTriviaGame onBack={onBack} />;
    case "country-connector":
      return <CountryConnectorGame onBack={onBack} />;
    case "outline-silhouette":
      return <OutlineSilhouetteGame onBack={onBack} />;
    case "neighbor-chain":
      return <NeighborChainGame onBack={onBack} />;
    case "higher-lower-population":
      return <HigherLowerPopulationGame onBack={onBack} />;
    default:
      return <div>Game not found</div>;
  }
}

// Shared world data hook (neighbors, centroids, features)
function useWorldAtlas() {
  const [topology, setTopology] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
        const topo = await res.json();
        if (mounted) setTopology(topo);
      } catch (e) {
        if (mounted) setError("Failed to load world topology");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const { features, centroids, idToIndex, neighbors } = useMemo(() => {
    if (!topology) return { features: [], centroids: new Map<string, [number, number]>(), idToIndex: new Map<string, number>(), neighbors: new Map<string, string[]>() };
    const coll: any = feature(topology, topology.objects.countries);
    const feats: Array<any> = coll.features;
    const idToIdx = new Map<string, number>();
    const cents = new Map<string, [number, number]>();
    feats.forEach((f: any, idx: number) => {
      const id = f.properties?.ISO_A3 || f.id;
      if (id) {
        idToIdx.set(id, idx);
        const c = geoCentroid(f) as [number, number];
        cents.set(id, c);
      }
    });
    const neighIdx = topoNeighbors(topology.objects.countries.geometries);
    const neighMap = new Map<string, string[]>();
    neighIdx.forEach((arr: number[], idx: number) => {
      const idA = feats[idx]?.properties?.ISO_A3 || feats[idx]?.id;
      const ids = arr.map((j) => feats[j]?.properties?.ISO_A3 || feats[j]?.id).filter(Boolean) as string[];
      if (idA) neighMap.set(idA, ids);
    });
    return { features: feats, centroids: cents, idToIndex: idToIdx, neighbors: neighMap };
  }, [topology]);

  return { features, centroids, idToIndex, neighbors, error, loading: !topology && !error } as const;
}

// Country Explorer Game
function CountryExplorerGame({ onBack }: { onBack: () => void }) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [visitedCountries, setVisitedCountries] = useState<string[]>([]);

  const countries: CountryData[] = WORLD_COUNTRIES;

  const handleCountryClick = (countryId: string) => {
    console.log('Country clicked in explorer:', countryId);
    setSelectedCountry(countryId);
    if (!visitedCountries.includes(countryId)) {
      setVisitedCountries([...visitedCountries, countryId]);
    }
  };

  const selectedCountryData = countries.find(c => c.id === selectedCountry);

  const handleReset = () => {
    setVisitedCountries([]);
    setSelectedCountry(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Country Explorer
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Click on countries to learn about them
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interactive World Map */}
          <div className="lg:col-span-2">
            <InteractiveWorldMap
              gameType="explorer"
              onCountryClick={handleCountryClick}
              selectedCountries={visitedCountries}
              countries={countries}
              onReset={handleReset}
            />
          </div>

          {/* Country Information Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Country Information</h3>
              {selectedCountryData ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl mb-3">{selectedCountryData.flag}</div>
                    <h4 className="text-2xl font-bold text-blue-400 mb-4">
                      {selectedCountryData.name}
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between p-2 bg-gray-800/50 rounded">
                        <span className="text-gray-400">Capital:</span>
                        <span className="text-white font-medium">{selectedCountryData.capital}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-800/50 rounded">
                        <span className="text-gray-400">Population:</span>
                        <span className="text-white font-medium">{selectedCountryData.population}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-gray-800/50 rounded">
                        <span className="text-gray-400">Continent:</span>
                        <span className="text-white font-medium">{selectedCountryData.continent}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click on a country to learn about it</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Country Guesser Game
function CountryGuesserGame({ onBack }: { onBack: () => void }) {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [mysteryCountry, setMysteryCountry] = useState<string | null>(null);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const countries: CountryData[] = WORLD_COUNTRIES;
  const { centroids } = useWorldAtlas();

  useEffect(() => {
    if (!mysteryCountry) {
      const withCentroid = countries.map(c => c.id).filter(id => centroids.has(id));
      const pick = withCentroid[Math.floor(Math.random() * withCentroid.length)] || "BRA";
      setMysteryCountry(pick);
    }
  }, [mysteryCountry, centroids, countries]);

  const handleCountryClick = (countryId: string) => {
    if (gameState !== "playing" || !mysteryCountry) return;
    const newGuesses = [...guesses, countryId];
    setGuesses(newGuesses);
    if (countryId === mysteryCountry) setGameState("won");
    else if (newGuesses.length >= 8) setGameState("lost");
  };

  const temperatureData = useMemo(() => {
    if (!mysteryCountry) return {} as { [key: string]: 'hot' | 'warm' | 'cold' | 'perfect' };
    const targetC = centroids.get(mysteryCountry);
    if (!targetC) return {} as any;
    const t: { [key: string]: 'hot' | 'warm' | 'cold' | 'perfect' } = {};
    for (const guess of guesses) {
      const cg = centroids.get(guess);
      if (!cg) continue;
      const km = greatCircleDistanceKm(cg, targetC);
      if (km < 500) t[guess] = 'perfect';
      else if (km < 1500) t[guess] = 'hot';
      else if (km < 3000) t[guess] = 'warm';
      else t[guess] = 'cold';
    }
    return t;
  }, [guesses, mysteryCountry, centroids]);

  const proximityHint = useMemo(() => {
    if (!mysteryCountry) return [] as Array<{ id: string; km: number; trend?: 'closer'|'farther'|'same' }>;
    const targetC = centroids.get(mysteryCountry);
    if (!targetC) return [] as any;
    const hints: Array<{ id: string; km: number; trend?: 'closer'|'farther'|'same' }> = [];
    guesses.forEach((g, idx) => {
      const cg = centroids.get(g);
      if (!cg) return;
      const km = greatCircleDistanceKm(cg, targetC);
      let trend: 'closer'|'farther'|'same' | undefined;
      if (idx > 0) {
        const prev = hints[idx - 1]?.km;
        if (prev !== undefined) {
          trend = km < prev ? 'closer' : km > prev ? 'farther' : 'same';
        }
      }
      hints.push({ id: g, km, trend });
    });
    return hints;
  }, [guesses, centroids, mysteryCountry]);

  const resetGame = () => {
    setGuesses([]);
    setGameState("playing");
    setMysteryCountry(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Country Guesser
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            I&apos;m thinking of a country. Can you guess it?
          </p>
          
          {gameState === "playing" && (
            <div className="mb-6">
              <p className="text-lg text-gray-400">Guesses: {guesses.length}/8</p>
              {mysteryCountry && (
                <div className="mt-3 text-sm text-gray-300">
                  <span className="font-semibold text-white">Initial hint:</span> Continent: {countries.find(c=>c.id===mysteryCountry)?.continent ?? '—'}{(() => {
                    const c = centroids.get(mysteryCountry!);
                    if (!c) return '';
                    const [lon, lat] = c as [number, number];
                    const ns = lat >= 0 ? 'Northern' : 'Southern';
                    const ew = lon >= 0 ? 'Eastern' : 'Western';
                    return ` • Hemispheres: ${ns} • ${ew}`;
                  })()}
                </div>
              )}
            </div>
          )}

          {gameState === "won" && mysteryCountry && (
            <div className="mb-6 p-6 bg-green-500/20 border border-green-500/30 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-green-400 mb-2">You Got It!</h2>
              <p className="text-gray-300">The mystery country was {countries.find(c=>c.id===mysteryCountry)?.name}!</p>
            </div>
          )}

          {gameState === "lost" && mysteryCountry && (
            <div className="mb-6 p-6 bg-red-500/20 border border-red-500/30 rounded-lg">
              <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-red-400 mb-2">Game Over</h2>
              <p className="text-gray-300">The mystery country was {countries.find(c=>c.id===mysteryCountry)?.name}.</p>
            </div>
          )}
        </div>

        {/* Interactive World Map */}
        <InteractiveWorldMap
          gameType="guesser"
          onCountryClick={handleCountryClick}
          selectedCountries={guesses}
          temperatureData={temperatureData}
          mysteryCountry={mysteryCountry ?? undefined}
          gameState={gameState}
          countries={countries}
          onReset={resetGame}
        />

        {gameState === 'playing' && guesses.length > 0 && (
          <div className="mt-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-sm">Your Last Guess</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const last = proximityHint[proximityHint.length - 1];
                  if (!last) return null;
                  const targetC = mysteryCountry ? centroids.get(mysteryCountry) : undefined;
                  const guessC = centroids.get(last.id);
                  const dir = (targetC && guessC) ? bearingDirection(guessC as [number, number], targetC as [number, number]) : undefined;
                  const name = countries.find(c=>c.id===last.id)?.name;
                  return (
                    <div className="text-sm text-gray-300">
                      <span className="text-white font-medium">{name}</span> is about <span className="text-white font-semibold">{Math.round(last.km)} km</span> away{dir ? ` to the ${dir}` : ''}.
                      {last.trend && proximityHint.length > 1 && (
                        <span className={"ml-2 " + (last.trend==='closer' ? 'text-green-400' : last.trend==='farther' ? 'text-red-400' : 'text-yellow-400')}>
                          {last.trend === 'closer' ? 'Closer than previous' : last.trend === 'farther' ? 'Farther than previous' : 'Same distance as previous'}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}

        {(gameState === "won" || gameState === "lost") && (
          <div className="text-center mt-8">
            <Button onClick={resetGame} className="bg-green-500 hover:bg-green-600">
              Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Placeholder components for other games
function CapitalFinderGame({ onBack }: { onBack: () => void }) {
  const [target, setTarget] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const countries: CountryData[] = WORLD_COUNTRIES.filter(c => c.capital);

  useEffect(() => {
    if (!target) {
      const ids = countries.map(c => c.id);
      setTarget(ids[Math.floor(Math.random() * ids.length)]);
    }
  }, [target, countries]);

  const handleCountryClick = (countryId: string) => {
    if (!target) return;
    if (countryId === target) {
      setScore(score + 1);
      setTarget(null);
    } else {
      setScore(Math.max(0, score - 1));
    }
  };

  const capitalName = countries.find(c => c.id === target)?.capital;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            Capital Finder
          </h1>
          <p className="text-lg text-gray-300">Click the country whose capital is: <span className="text-white font-semibold">{capitalName}</span></p>
          <p className="text-sm text-gray-400 mt-2">Score: {score}</p>
        </div>
        <InteractiveWorldMap
          gameType="explorer"
          onCountryClick={handleCountryClick}
          selectedCountries={[]}
          countries={WORLD_COUNTRIES}
        />
      </div>
    </div>
  );
}

function FlagMasterGame({ onBack }: { onBack: () => void }) {
  const [target, setTarget] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const countries = WORLD_COUNTRIES.filter(c => c.flag);

  useEffect(() => {
    if (!target) {
      const ids = countries.map(c => c.id);
      setTarget(ids[Math.floor(Math.random() * ids.length)]);
    }
  }, [target, countries]);

  const handleCountryClick = (countryId: string) => {
    if (!target) return;
    if (countryId === target) {
      setStreak(streak + 1);
      setTarget(null);
    } else {
      setStreak(0);
    }
  };

  const flag = countries.find(c => c.id === target)?.flag;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Flag Master
          </h1>
          <p className="text-lg text-gray-300">Click the country with flag: <span className="text-3xl">{flag}</span></p>
          <p className="text-sm text-gray-400 mt-2">Streak: {streak}</p>
        </div>
        <InteractiveWorldMap
          gameType="explorer"
          onCountryClick={handleCountryClick}
          selectedCountries={[]}
          countries={WORLD_COUNTRIES}
        />
      </div>
    </div>
  );
}

function ContinentQuizGame({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Continent Quiz
          </h1>
          <p className="text-xl text-gray-300">Coming Soon!</p>
        </div>
      </div>
    </div>
  );
}

function GeographyTriviaGame({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Geography Trivia
          </h1>
          <p className="text-xl text-gray-300">Coming Soon!</p>
        </div>
      </div>
    </div>
  );
} 

// Country Connector Game
function CountryConnectorGame({ onBack }: { onBack: () => void }) {
  const countries: CountryData[] = WORLD_COUNTRIES;
  const { neighbors } = useWorldAtlas();
  const [source, setSource] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [bestPath, setBestPath] = useState<string[] | null>(null);

  // BFS to compute shortest path
  const findShortestPath = (start: string, goal: string): string[] | null => {
    if (start === goal) return [start];
    const q: string[] = [start];
    const prev = new Map<string, string | null>();
    prev.set(start, null);
    while (q.length) {
      const cur = q.shift() as string;
      const neigh = neighbors.get(cur) || [];
      for (const nxt of neigh) {
        if (!prev.has(nxt)) {
          prev.set(nxt, cur);
          if (nxt === goal) {
            const rev: string[] = [goal];
            let p = goal;
            while (prev.get(p)) {
              const pr = prev.get(p)!;
              rev.push(pr);
              p = pr;
            }
            return rev.reverse();
          }
          q.push(nxt);
        }
      }
    }
    return null;
  };

  useEffect(() => {
    if (!source || !target) {
      // pick two distinct random countries with neighbor data
      const ids = Array.from(neighbors.keys());
      if (ids.length < 2) return;
      const a = ids[Math.floor(Math.random()*ids.length)];
      let b = a;
      while (b === a) b = ids[Math.floor(Math.random()*ids.length)];
      setSource(a);
      setTarget(b);
      return;
    }
    const sp = findShortestPath(source, target);
    setBestPath(sp);
    setPath([source]);
  }, [neighbors, source, target]);

  const handleCountryClick = (countryId: string) => {
    if (!source || !target) return;
    const last = path[path.length - 1];
    const valid = (neighbors.get(last) || []).includes(countryId);
    if (!valid) return;
    const nextPath = [...path, countryId];
    setPath(nextPath);
    if (countryId === target) {
      // Completed
    }
  };

  const handleReset = () => {
    setSource(null);
    setTarget(null);
    setPath([]);
    setBestPath(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">Country Connector</h1>
          <p className="text-xl text-gray-300 mb-2">Connect with the fewest countries:</p>
          <p className="text-lg text-white font-semibold">
            {countries.find(c=>c.id===source)?.name} → {countries.find(c=>c.id===target)?.name}
          </p>
          <div className="mt-2 text-sm text-gray-400">Your path length: {path.length - 1}{bestPath ? ` • Shortest possible: ${bestPath.length - 1}`: ''}</div>
          <div className="mt-3"><Button variant="outline" size="sm" onClick={handleReset}>New Pair</Button></div>
        </div>

        {/* Interactive World Map */}
        <InteractiveWorldMap
          gameType="connector"
          onCountryClick={handleCountryClick}
          selectedCountries={path}
          countries={countries}
          onReset={handleReset}
        />
      </div>
    </div>
  );
} 

// Border Blitz removed per request

// Outline Silhouette
function OutlineSilhouetteGame({ onBack }: { onBack: () => void }) {
  const countries = WORLD_COUNTRIES;
  const [target, setTarget] = useState<string | null>(null);
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");

  useEffect(() => {
    if (!target) {
      const ids = countries.map(c=>c.id);
      setTarget(ids[Math.floor(Math.random()*ids.length)]);
    }
  }, [target, countries]);

  const handleCountryClick = (countryId: string) => {
    if (!target) return;
    setResult(countryId === target ? "correct" : "wrong");
    setTimeout(()=>{ setTarget(null); setResult("idle"); }, 800);
  };

  const silhouetteName = countries.find(c=>c.id===target)?.name;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-400 to-gray-400 bg-clip-text text-transparent">Outline Silhouette</h1>
          <p className="text-lg text-gray-300">Match the silhouette to the correct country</p>
          <p className="text-sm text-gray-400 mt-2">Target: <span className="font-semibold text-white">{silhouetteName}</span></p>
          {result !== 'idle' && (
            <div className={`mt-3 text-sm ${result==='correct' ? 'text-green-400' : 'text-red-400'}`}>{result==='correct'?'Correct!':'Wrong!'}</div>
          )}
        </div>
        <InteractiveWorldMap
          gameType="explorer"
          onCountryClick={handleCountryClick}
          selectedCountries={[]}
          countries={countries}
        />
      </div>
    </div>
  );
}

// Neighbor Chain
function NeighborChainGame({ onBack }: { onBack: () => void }) {
  const countries = WORLD_COUNTRIES;
  const { neighbors } = useWorldAtlas();
  const [chain, setChain] = useState<string[]>([]);
  const [best, setBest] = useState(0);

  const handleCountryClick = (countryId: string) => {
    if (chain.length === 0) {
      setChain([countryId]);
      return;
    }
    const last = chain[chain.length - 1];
    const valid = (neighbors.get(last) || []).includes(countryId) && !chain.includes(countryId);
    if (valid) setChain([...chain, countryId]);
  };

  const reset = () => {
    setBest(Math.max(best, chain.length));
    setChain([]);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Neighbor Chain</h1>
          <p className="text-lg text-gray-300">Build the longest chain of bordering countries without repeats</p>
          <p className="text-sm text-gray-400 mt-2">Current length: {chain.length} • Best: {best}</p>
          <div className="mt-2"><Button variant="outline" size="sm" onClick={reset}>Reset</Button></div>
        </div>
        <InteractiveWorldMap
          gameType="explorer"
          onCountryClick={handleCountryClick}
          selectedCountries={chain}
          countries={countries}
        />
      </div>
    </div>
  );
}

// Higher or Lower: Population
function HigherLowerPopulationGame({ onBack }: { onBack: () => void }) {
  const pool = WORLD_COUNTRIES.filter(c => c.population);
  const [left, setLeft] = useState<string | null>(null);
  const [right, setRight] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  const pickTwo = () => {
    const ids = pool.map(c=>c.id);
    const a = ids[Math.floor(Math.random()*ids.length)];
    let b = a;
    while (b === a) b = ids[Math.floor(Math.random()*ids.length)];
    setLeft(a); setRight(b);
  };

  useEffect(() => { if (!left || !right) pickTwo(); }, [left, right]);

  const handlePick = (choice: 'left'|'right') => {
    const l = pool.find(c=>c.id===left); const r = pool.find(c=>c.id===right);
    if (!l || !r) return;
    const lp = parseFloat(l.population!.replace(/[^0-9.]/g, ''));
    const rp = parseFloat(r.population!.replace(/[^0-9.]/g, ''));
    const correct = lp >= rp ? 'left' : 'right';
    setStreak(choice === correct ? streak + 1 : 0);
    pickTwo();
  };

  const lName = pool.find(c=>c.id===left)?.name;
  const rName = pool.find(c=>c.id===right)?.name;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Higher or Lower: Population</h1>
          <p className="text-lg text-gray-300">Which country has the higher population?</p>
          <p className="text-sm text-gray-400 mt-2">Streak: {streak}</p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <Button variant="outline" onClick={()=>handlePick('left')}>{lName}</Button>
            <span className="text-gray-500">vs</span>
            <Button variant="outline" onClick={()=>handlePick('right')}>{rName}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}