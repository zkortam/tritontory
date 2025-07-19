import { NextRequest, NextResponse } from 'next/server';
import { unifiedSportsAPI } from '@/lib/unified-sports-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'live', 'upcoming', 'comprehensive', 'test'
    const sport = searchParams.get('sport'); // specific sport

    switch (type) {
      case 'live':
        const liveGames = await unifiedSportsAPI.getLiveUCSDGames();
        return NextResponse.json({
          success: true,
          data: liveGames,
          count: liveGames.length,
          source: 'unified'
        });

      case 'upcoming':
        const upcomingGames = await unifiedSportsAPI.getUpcomingUCSDGames();
        return NextResponse.json({
          success: true,
          data: upcomingGames,
          count: upcomingGames.length,
          source: 'unified'
        });

      case 'comprehensive':
        const comprehensiveData = await unifiedSportsAPI.getComprehensiveUCSDData();
        return NextResponse.json({
          success: true,
          data: comprehensiveData,
          source: 'unified'
        });

      case 'test':
        const apiStatus = await unifiedSportsAPI.testAPIs();
        return NextResponse.json({
          success: true,
          data: apiStatus,
          availableSports: unifiedSportsAPI.getAllAvailableSports(),
          espnSports: unifiedSportsAPI.getESPNSports(),
          ncaaSports: unifiedSportsAPI.getNCAAAPISports(),
          source: 'unified'
        });

      case 'sport':
        if (!sport) {
          return NextResponse.json({
            success: false,
            error: 'Sport parameter required'
          }, { status: 400 });
        }
        
        const sportGames = await unifiedSportsAPI.getUCSDGamesBySport(sport);
        return NextResponse.json({
          success: true,
          data: sportGames,
          count: sportGames.length,
          sport,
          source: 'unified'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type parameter. Use: live, upcoming, comprehensive, test, or sport'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Unified sports API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 