import { NextResponse } from 'next/server';
import { WeatherService } from '@/lib/weather-service';

export async function GET() {
  try {
    const weatherService = WeatherService.getInstance();
    const weatherData = await weatherService.getWeatherData();
    
    return NextResponse.json({
      success: true,
      data: weatherData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Weather test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 