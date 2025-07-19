import { SportBannerService } from './firebase-service';
import { espnAPI } from './espn-api';


export class ESPNSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Start automatic syncing
  startAutoSync(intervalMinutes: number = 2) {
    if (this.isRunning) {
      console.log('ESPN sync already running');
      return;
    }

    this.isRunning = true;
    console.log(`Starting ESPN auto-sync every ${intervalMinutes} minutes`);

    // Initial sync
    this.performSync();

    // Set up interval
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, intervalMinutes * 60 * 1000);
  }

  // Stop automatic syncing
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log('ESPN auto-sync stopped');
  }

  // Perform a single sync operation
  async performSync() {
    try {
      console.log('Performing ESPN sync...');
      
      // Get live games from ESPN
      const liveGames = await espnAPI.getLiveUCSDGames();
      
      if (liveGames.length === 0) {
        console.log('No live UCSD games found');
        return;
      }

      // Get existing banners
      const existingBanners = await SportBannerService.getAllBanners();
      const activeBanner = existingBanners.find(b => b.isEnabled);

      for (const espnGame of liveGames) {
        const sportType = espnGame.name.toLowerCase().includes('basketball') ? 'basketball' : 'baseball';
        const bannerData = espnAPI.convertESPNGameToBanner(espnGame, sportType);
        
        if (!bannerData) continue;

        if (activeBanner) {
          // Update existing banner
          await SportBannerService.updateBanner(activeBanner.id, {
            ...bannerData,
            lastUpdated: new Date()
          });
          console.log(`Updated banner for ${bannerData.sport} game`);
        } else {
          // Create new banner
          await SportBannerService.createBanner({
            ...bannerData,
            substitutions: [],
            highlights: []
          });
          console.log(`Created new banner for ${bannerData.sport} game`);
        }
      }

      console.log('ESPN sync completed successfully');
    } catch (error) {
      console.error('ESPN sync failed:', error);
    }
  }

  // Manual sync for a specific game
  async syncSpecificGame(espnGameId: string, sport: 'basketball' | 'baseball') {
    try {
      const games = await espnAPI.getUCSDGames(sport);
      const game = games.find(g => g.id === espnGameId);
      
      if (!game) {
        throw new Error('Game not found');
      }

      const bannerData = espnAPI.convertESPNGameToBanner(game, sport);
      if (!bannerData) {
        throw new Error('Failed to convert game data');
      }

      const existingBanners = await SportBannerService.getAllBanners();
      const activeBanner = existingBanners.find(b => b.isEnabled);

      if (activeBanner) {
        await SportBannerService.updateBanner(activeBanner.id, {
          ...bannerData,
          lastUpdated: new Date()
        });
      } else {
        await SportBannerService.createBanner({
          ...bannerData,
          substitutions: [],
          highlights: []
        });
      }

      return { success: true, message: 'Game synced successfully' };
    } catch (error) {
      console.error('Specific game sync failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isRunning: this.isRunning,
      lastSync: new Date().toISOString()
    };
  }

  // Force sync upcoming games
  async syncUpcomingGames() {
    try {
      const upcomingGames = await espnAPI.getUpcomingUCSDGames();
      
      for (const espnGame of upcomingGames) {
        const sportType = espnGame.name.toLowerCase().includes('basketball') ? 'basketball' : 'baseball';
        const bannerData = espnAPI.convertESPNGameToBanner(espnGame, sportType);
        
        if (!bannerData) continue;

        // Create banner for upcoming game
        await SportBannerService.createBanner({
          ...bannerData,
          substitutions: [],
          highlights: []
        });
      }

      console.log(`Synced ${upcomingGames.length} upcoming games`);
    } catch (error) {
      console.error('Upcoming games sync failed:', error);
    }
  }

  // Clean up old banners
  async cleanupOldBanners() {
    try {
      const banners = await SportBannerService.getAllBanners();
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      for (const banner of banners) {
        if (banner.gameStatus === 'final' && banner.date < oneDayAgo) {
          await SportBannerService.deleteBanner(banner.id);
          console.log(`Deleted old banner: ${banner.id}`);
        }
      }
    } catch (error) {
      console.error('Banner cleanup failed:', error);
    }
  }
}

export const espnSyncService = new ESPNSyncService(); 