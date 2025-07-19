export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

// Fallback weather data for La Jolla
export const FALLBACK_WEATHER_DATA: WeatherData = {
  temperature: 0,
  condition: "No Data",
  icon: "cloud",
  humidity: 0,
  windSpeed: 0,
  location: "La Jolla, CA"
};

export class WeatherService {
  private static instance: WeatherService;
  private cache: WeatherData | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 300000; // 5 minutes

  private constructor() {}

  static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  async getWeatherData(): Promise<WeatherData> {
    // Check if we have cached data and it's still fresh
    const now = Date.now();
    if (now - this.lastFetch < this.CACHE_DURATION && this.cache) {
      return this.cache;
    }

    try {
      // Try to get real weather data from National Weather Service API
      const realData = await this.fetchFromNWS();
      
      if (realData && realData.temperature !== 0) {
        this.cache = realData;
        this.lastFetch = now;
        return realData;
      } else {
        // If no real data, return fallback data
        console.warn('No real weather data available, using fallback data');
        return FALLBACK_WEATHER_DATA;
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return FALLBACK_WEATHER_DATA;
    }
  }

  // Method to clear cache and force refresh
  clearCache(): void {
    this.cache = null;
    this.lastFetch = 0;
  }

  private async fetchFromNWS(): Promise<WeatherData | null> {
    try {
      // La Jolla coordinates: 32.8328, -117.2713
      // First, get the grid points for La Jolla
      const pointsResponse = await fetch(
        'https://api.weather.gov/points/32.8328,-117.2713',
        {
          headers: {
            'User-Agent': 'TritonTory/1.0 (weather-app)',
            'Accept': 'application/geo+json'
          }
        }
      );
      
      if (!pointsResponse.ok) {
        throw new Error(`Points API error! status: ${pointsResponse.status}`);
      }
      
      const pointsData = await pointsResponse.json();
      
      if (!pointsData.properties?.forecast) {
        throw new Error('No forecast URL available');
      }
      
      // Get the current forecast
      const forecastResponse = await fetch(pointsData.properties.forecast, {
        headers: {
          'User-Agent': 'TritonTory/1.0 (weather-app)',
          'Accept': 'application/geo+json'
        }
      });
      
      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error! status: ${forecastResponse.status}`);
      }
      
      const forecastData = await forecastResponse.json();
      
      // Get the current observation from the nearest station
      const stationsResponse = await fetch(pointsData.properties.observationStations, {
        headers: {
          'User-Agent': 'TritonTory/1.0 (weather-app)',
          'Accept': 'application/geo+json'
        }
      });
      
      if (!stationsResponse.ok) {
        throw new Error(`Stations API error! status: ${stationsResponse.status}`);
      }
      
      const stationsData = await stationsResponse.json();
      
      // Get the latest observation from the nearest station
      if (stationsData.features && stationsData.features.length > 0) {
        const nearestStation = stationsData.features[0].properties.stationIdentifier;
        const observationResponse = await fetch(
          `https://api.weather.gov/stations/${nearestStation}/observations/latest`,
          {
            headers: {
              'User-Agent': 'TritonTory/1.0 (weather-app)',
              'Accept': 'application/geo+json'
            }
          }
        );
        
        if (observationResponse.ok) {
          const observationData = await observationResponse.json();
          
          if (observationData.properties) {
            const temp = observationData.properties.temperature?.value;
            const humidity = observationData.properties.relativeHumidity?.value;
            const windSpeed = observationData.properties.windSpeed?.value;
            const textDescription = observationData.properties.textDescription;
            
            if (temp !== null && temp !== undefined) {
              return {
                temperature: Math.round((temp * 9/5) + 32), // Convert C to F
                condition: textDescription || "Unknown",
                icon: this.mapWeatherIconFromText(textDescription || ""),
                humidity: humidity || 0,
                windSpeed: windSpeed ? Math.round(windSpeed * 2.237) : 0, // Convert m/s to mph
                location: "La Jolla, CA"
              };
            }
          }
        }
      }
      
      // Fallback to forecast data if observation fails
      if (forecastData.properties?.periods && forecastData.properties.periods.length > 0) {
        const currentPeriod = forecastData.properties.periods[0];
        
        if (currentPeriod.temperature) {
          return {
            temperature: currentPeriod.temperature,
            condition: currentPeriod.shortForecast || "Unknown",
            icon: this.mapWeatherIconFromText(currentPeriod.shortForecast || ""),
            humidity: 0, // Not available in forecast
            windSpeed: this.parseWindSpeed(currentPeriod.windSpeed),
            location: "La Jolla, CA"
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching weather data from NWS:', error);
      return null;
    }
  }

  private parseWindSpeed(windSpeedString: string): number {
    if (!windSpeedString) return 0;
    
    // Extract number from strings like "10 mph" or "5 to 10 mph"
    const match = windSpeedString.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private mapWeatherIconFromText(condition: string): string {
    const conditionLower = condition.toLowerCase();
    
    if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return 'sun';
    } else if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) {
      return 'cloud';
    } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle') || conditionLower.includes('showers')) {
      return 'cloud-rain';
    } else if (conditionLower.includes('snow')) {
      return 'snowflake';
    } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
      return 'cloud-lightning';
    } else if (conditionLower.includes('fog') || conditionLower.includes('mist') || conditionLower.includes('haze')) {
      return 'cloud-fog';
    } else if (conditionLower.includes('partly') || conditionLower.includes('mostly sunny')) {
      return 'cloud-sun';
    } else {
      return 'cloud';
    }
  }
} 