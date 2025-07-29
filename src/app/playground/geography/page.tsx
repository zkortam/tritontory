"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Globe,
  Map,
  Flag,
  Building,
  ArrowRight,
  ArrowLeft,
  Target,
  Clock,
  Trophy,
  Zap,
  Thermometer,
  CheckCircle,
  XCircle,
  RotateCcw
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
      icon: <Map className="h-6 w-6" />,
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
    default:
      return <div>Game not found</div>;
  }
}

// Country Explorer Game
function CountryExplorerGame({ onBack }: { onBack: () => void }) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [visitedCountries, setVisitedCountries] = useState<string[]>([]);

  const countries = [
    { id: "usa", name: "United States", capital: "Washington D.C.", population: "331M", continent: "North America", flag: "🇺🇸" },
    { id: "canada", name: "Canada", capital: "Ottawa", population: "38M", continent: "North America", flag: "🇨🇦" },
    { id: "mexico", name: "Mexico", capital: "Mexico City", population: "129M", continent: "North America", flag: "🇲🇽" },
    { id: "brazil", name: "Brazil", capital: "Brasília", population: "214M", continent: "South America", flag: "🇧🇷" },
    { id: "argentina", name: "Argentina", capital: "Buenos Aires", population: "45M", continent: "South America", flag: "🇦🇷" },
    { id: "france", name: "France", capital: "Paris", population: "67M", continent: "Europe", flag: "🇫🇷" },
    { id: "germany", name: "Germany", capital: "Berlin", population: "83M", continent: "Europe", flag: "🇩🇪" },
    { id: "italy", name: "Italy", capital: "Rome", population: "60M", continent: "Europe", flag: "🇮🇹" },
    { id: "spain", name: "Spain", capital: "Madrid", population: "47M", continent: "Europe", flag: "🇪🇸" },
    { id: "uk", name: "United Kingdom", capital: "London", population: "67M", continent: "Europe", flag: "🇬🇧" },
    { id: "russia", name: "Russia", capital: "Moscow", population: "144M", continent: "Europe/Asia", flag: "🇷🇺" },
    { id: "china", name: "China", capital: "Beijing", population: "1.4B", continent: "Asia", flag: "🇨🇳" },
    { id: "japan", name: "Japan", capital: "Tokyo", population: "126M", continent: "Asia", flag: "🇯🇵" },
    { id: "india", name: "India", capital: "New Delhi", population: "1.4B", continent: "Asia", flag: "🇮🇳" },
    { id: "australia", name: "Australia", capital: "Canberra", population: "26M", continent: "Oceania", flag: "🇦🇺" },
    { id: "south-africa", name: "South Africa", capital: "Pretoria", population: "60M", continent: "Africa", flag: "🇿🇦" },
    { id: "egypt", name: "Egypt", capital: "Cairo", population: "104M", continent: "Africa", flag: "🇪🇬" },
    { id: "nigeria", name: "Nigeria", capital: "Abuja", population: "214M", continent: "Africa", flag: "🇳🇬" }
  ];

  const handleCountryClick = (countryId: string) => {
    setSelectedCountry(countryId);
    if (!visitedCountries.includes(countryId)) {
      setVisitedCountries([...visitedCountries, countryId]);
    }
  };

  const selectedCountryData = countries.find(c => c.id === selectedCountry);

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
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <span>Visited: {visitedCountries.length} countries</span>
            <Button variant="outline" size="sm" onClick={() => setVisitedCountries([])}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interactive Country Grid */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4">Click on Countries</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {countries.map((country) => (
                  <Button
                    key={country.id}
                    variant="outline"
                    className={`h-20 flex flex-col items-center justify-center p-2 transition-all duration-200 ${
                      visitedCountries.includes(country.id)
                        ? "bg-green-500/20 border-green-500 text-green-400"
                        : "border-gray-600 hover:border-blue-400 hover:text-blue-400"
                    }`}
                    onClick={() => handleCountryClick(country.id)}
                  >
                    <div className="text-2xl mb-1">{country.flag}</div>
                    <div className="text-xs font-medium text-center leading-tight">
                      {country.name}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
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
  const [mysteryCountry] = useState("brazil");
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");

  const countries = [
    { id: "usa", name: "United States", flag: "🇺🇸" },
    { id: "canada", name: "Canada", flag: "🇨🇦" },
    { id: "mexico", name: "Mexico", flag: "🇲🇽" },
    { id: "brazil", name: "Brazil", flag: "🇧🇷" },
    { id: "argentina", name: "Argentina", flag: "🇦🇷" },
    { id: "france", name: "France", flag: "🇫🇷" },
    { id: "germany", name: "Germany", flag: "🇩🇪" },
    { id: "italy", name: "Italy", flag: "🇮🇹" },
    { id: "spain", name: "Spain", flag: "🇪🇸" },
    { id: "uk", name: "United Kingdom", flag: "🇬🇧" },
    { id: "russia", name: "Russia", flag: "🇷🇺" },
    { id: "china", name: "China", flag: "🇨🇳" },
    { id: "japan", name: "Japan", flag: "🇯🇵" },
    { id: "india", name: "India", flag: "🇮🇳" },
    { id: "australia", name: "Australia", flag: "🇦🇺" },
    { id: "south-africa", name: "South Africa", flag: "🇿🇦" },
    { id: "egypt", name: "Egypt", flag: "🇪🇬" },
    { id: "nigeria", name: "Nigeria", flag: "🇳🇬" }
  ];

  const handleCountryClick = (countryId: string) => {
    if (gameState !== "playing") return;
    
    const newGuesses = [...guesses, countryId];
    setGuesses(newGuesses);
    
    if (countryId === mysteryCountry) {
      setGameState("won");
    } else if (newGuesses.length >= 8) {
      setGameState("lost");
    }
  };

  const getTemperature = (guess: string) => {
    if (guess === mysteryCountry) return "Perfect!";
    if (guess.includes("south") && mysteryCountry.includes("south")) return "Hot";
    if (guess.includes("north") && mysteryCountry.includes("north")) return "Hot";
    return "Cold";
  };

  const resetGame = () => {
    setGuesses([]);
    setGameState("playing");
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
            </div>
          )}

          {gameState === "won" && (
            <div className="mb-6 p-6 bg-green-500/20 border border-green-500/30 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-green-400 mb-2">You Got It!</h2>
              <p className="text-gray-300">The mystery country was Brazil! 🇧🇷</p>
            </div>
          )}

          {gameState === "lost" && (
            <div className="mb-6 p-6 bg-red-500/20 border border-red-500/30 rounded-lg">
              <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-red-400 mb-2">Game Over</h2>
              <p className="text-gray-300">The mystery country was Brazil! 🇧🇷</p>
            </div>
          )}
        </div>

        {/* Temperature Display */}
        {guesses.length > 0 && (
          <div className="mb-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-4">Your Guesses:</h3>
            <div className="space-y-2">
              {guesses.map((guess, index) => {
                const country = countries.find(c => c.id === guess);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{country?.flag}</span>
                      <span className="font-medium">{country?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      <span className={`font-semibold ${
                        getTemperature(guess) === "Perfect!" ? "text-green-400" :
                        getTemperature(guess) === "Hot" ? "text-red-400" : "text-blue-400"
                      }`}>
                        {getTemperature(guess)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Interactive Country Grid */}
        <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Click on Countries to Guess</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {countries.map((country) => (
              <Button
                key={country.id}
                variant="outline"
                className={`h-20 flex flex-col items-center justify-center p-2 transition-all duration-200 ${
                  guesses.includes(country.id)
                    ? country.id === mysteryCountry
                      ? "bg-green-500/20 border-green-500 text-green-400"
                      : "bg-red-500/20 border-red-500 text-red-400"
                    : "border-gray-600 hover:border-green-400 hover:text-green-400"
                }`}
                onClick={() => handleCountryClick(country.id)}
                disabled={guesses.includes(country.id) || gameState !== "playing"}
              >
                <div className="text-2xl mb-1">{country.flag}</div>
                <div className="text-xs font-medium text-center leading-tight">
                  {country.name}
                </div>
              </Button>
            ))}
          </div>
        </div>

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
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            Capital Finder
          </h1>
          <p className="text-xl text-gray-300">Coming Soon!</p>
        </div>
      </div>
    </div>
  );
}

function FlagMasterGame({ onBack }: { onBack: () => void }) {
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
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
            Flag Master
          </h1>
          <p className="text-xl text-gray-300">Coming Soon!</p>
        </div>
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