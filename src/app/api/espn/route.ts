import { NextRequest, NextResponse } from 'next/server';
import { espnAPI } from '@/lib/espn-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'live', 'upcoming', 'news'
    const sport = searchParams.get('sport'); // 'basketball', 'baseball', 'all'

    switch (type) {
      case 'live':
        const liveGames = await espnAPI.getLiveUCSDGames();
        const bannerData = liveGames.map(game => {
          const sportType = game.name.toLowerCase().includes('basketball') ? 'basketball' : 'baseball';
          return espnAPI.convertESPNGameToBanner(game, sportType);
        }).filter(Boolean);
        
        return NextResponse.json({
          success: true,
          data: bannerData,
          count: bannerData.length
        });

      case 'upcoming':
        const upcomingGames = await espnAPI.getUpcomingUCSDGames();
        const upcomingData = upcomingGames.map(game => {
          const sportType = game.name.toLowerCase().includes('basketball') ? 'basketball' : 'baseball';
          return espnAPI.convertESPNGameToBanner(game, sportType);
        }).filter(Boolean);
        
        return NextResponse.json({
          success: true,
          data: upcomingData,
          count: upcomingData.length
        });

      case 'news':
        if (!sport || sport === 'all') {
          const [basketballNews, baseballNews] = await Promise.all([
            espnAPI.getUCSDNews('basketball'),
            espnAPI.getUCSDNews('baseball')
          ]);
          
          return NextResponse.json({
            success: true,
            data: [...basketballNews, ...baseballNews],
            count: basketballNews.length + baseballNews.length
          });
        } else {
          const news = await espnAPI.getUCSDNews(sport as 'basketball' | 'baseball');
          return NextResponse.json({
            success: true,
            data: news,
            count: news.length
          });
        }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type parameter. Use: live, upcoming, or news'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('ESPN API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch ESPN data'
    }, { status: 500 });
  }
} 