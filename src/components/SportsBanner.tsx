'use client';

import { useState, useEffect } from 'react';
import { SportBannerService } from '@/lib/firebase-service';
import { SportBanner, SportBannerSettings } from '@/lib/models';
import { getTeamById } from '@/lib/teams-config';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Clock, Users, Trophy } from 'lucide-react';

interface SportsBannerProps {
  style?: 'minimal' | 'detailed' | 'full';
}

export default function SportsBanner({ style = 'detailed' }: SportsBannerProps) {
  const [banner, setBanner] = useState<SportBanner | null>(null);
  const [settings, setSettings] = useState<SportBannerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadBanner();
    
    // Set up auto-refresh if enabled
    const interval = setInterval(() => {
      if (settings?.autoRefresh) {
        loadBanner();
      }
    }, (settings?.refreshInterval || 30) * 1000);

    return () => clearInterval(interval);
  }, [settings?.autoRefresh, settings?.refreshInterval]);

  const loadBanner = async () => {
    try {
      const [bannerData, settingsData] = await Promise.all([
        SportBannerService.getActiveBanner(),
        SportBannerService.getBannerSettings(),
      ]);
      
      setBanner(bannerData);
      setSettings(settingsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading sports banner:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500 animate-pulse';
      case 'halftime': return 'bg-yellow-500';
      case 'final': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'postponed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'basketball': return '🏀';
      case 'soccer': return '⚽';
      case 'baseball': return '⚾';
      case 'fencing': return '🤺';
      case 'tennis': return '🎾';
      default: return '🏆';
    }
  };



  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    // Handle different time formats
    if (timeString.includes(':')) {
      return timeString; // Already formatted
    }
    
    // Convert minutes to MM:SS format
    const minutes = parseInt(timeString);
    if (!isNaN(minutes)) {
      const mins = Math.floor(minutes);
      const secs = Math.round((minutes - mins) * 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    return timeString;
  };

  if (loading) {
    return null;
  }

  // Debug logging
  console.log('SportsBanner Debug:', { 
    loading, 
    hasBanner: !!banner, 
    settingsEnabled: settings?.isEnabled,
    banner,
    settings 
  });

  if (!settings?.isEnabled) {
    return null;
  }

  if (!banner) {
    // Show a placeholder when system is enabled but no active banner
    return (
      <Card className="bg-black border-0 mb-4 shadow-lg rounded-xl relative overflow-hidden">
        {/* Dispersing white border effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/30 via-white/10 to-white/30 blur-sm"></div>
        <div className="absolute inset-[3px] rounded-xl bg-black"></div>
        {/* Gradient hue overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-red-500/20 rounded-xl"></div>
        <CardContent className="p-6 relative z-10" style={{ minHeight: '100px' }}>
          <div className="text-center text-white">
            <span className="text-2xl">🏆</span>
            <p className="mt-2 text-sm">No active sports events</p>
            <p className="text-sm text-gray-300">Check back later!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (style === 'minimal') {
    return (
      <Card className="bg-black border-0 mb-4 shadow-lg rounded-xl relative overflow-hidden">
        {/* Dispersing white border effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/30 via-white/10 to-white/30 blur-sm"></div>
        <div className="absolute inset-[3px] rounded-xl bg-black"></div>
        {/* Gradient hue overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-red-500/20 rounded-xl"></div>
        <CardContent className="p-6 relative z-10" style={{ minHeight: '100px' }}>
          {/* Main Score Row */}
          <div className="flex items-center justify-between text-white mb-4">
            {/* Triton Logo and Score */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <img src="/triton.png" alt="Triton" className="w-8 h-8" />
                <span className="text-2xl font-bold">{banner.homeScore}</span>
              </div>
              <div className="text-sm font-medium text-white">UC San Diego</div>
            </div>
            
            {/* VS */}
            <div className="text-lg text-gray-300 font-medium">VS</div>
            
            {/* Opponent Score and Logo */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{banner.awayScore}</span>
                <span className="text-2xl">{getSportIcon(banner.sport)}</span>
              </div>
              <div className="text-sm font-medium text-white">{getTeamById(banner.awayTeamId)?.name || 'Unknown'}</div>
            </div>
            
            {/* Game Status */}
            <Badge className={`${getStatusColor(banner.gameStatus)} text-xs`}>
              {banner.gameStatus.toUpperCase()}
            </Badge>
          </div>
          
                      {/* Info Row */}
            <div className="flex items-center justify-between text-sm text-gray-300">
            <div className="flex items-center gap-1">
              <span>{banner.sport.charAt(0).toUpperCase() + banner.sport.slice(1)}</span>
              <span>•</span>
              <span>{banner.venue}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{banner.gameTime}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border-0 mb-4 shadow-lg rounded-xl relative overflow-hidden">
      {/* Dispersing white border effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/30 via-white/10 to-white/30 blur-sm"></div>
      <div className="absolute inset-[3px] rounded-xl bg-black"></div>
      {/* Gradient hue overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-red-500/20 rounded-xl"></div>
      <CardContent className="p-6 relative z-10" style={{ minHeight: '100px' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getSportIcon(banner.sport)}</span>
            <div>
              <h3 className="font-bold text-base text-white">Live Game</h3>
              <p className="text-xs text-gray-300">{banner.sport.charAt(0).toUpperCase() + banner.sport.slice(1)} • {banner.venue}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(banner.gameStatus)}>
              {banner.gameStatus.toUpperCase()}
            </Badge>
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Score Display */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <img src="/triton.png" alt="Triton" className="w-12 h-12" />
              <div className="text-5xl font-bold text-blue-400">{banner.homeScore}</div>
            </div>
            <div className="text-sm font-medium text-white">UC San Diego</div>
          </div>
          <div className="text-center mx-3">
            <div className="text-sm font-semibold text-gray-300">VS</div>
            {banner.period && (
              <div className="text-xs text-gray-400">{banner.period}</div>
            )}
            {banner.timeRemaining && (
              <div className="text-xs font-medium text-red-400">
                <Clock className="w-3 h-3 inline mr-1" />
                {formatTime(banner.timeRemaining)}
              </div>
            )}
          </div>
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="text-5xl font-bold text-red-400">{banner.awayScore}</div>
              <span className="text-4xl">{getSportIcon(banner.sport)}</span>
            </div>
            <div className="text-sm font-medium text-white">{getTeamById(banner.awayTeamId)?.name || 'Unknown'}</div>
          </div>
        </div>

        {/* Game Info */}
        <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {banner.gameTime}
          </div>
          <div className="flex items-center gap-1">
            <span>{getTeamById(banner.homeTeamId)?.name || 'Unknown'} vs {getTeamById(banner.awayTeamId)?.name || 'Unknown'}</span>
          </div>
        </div>

        {/* Detailed View */}
        {style === 'full' && ((banner.substitutions && banner.substitutions.length > 0) || (banner.highlights && banner.highlights.length > 0)) && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full">
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show Details
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              {/* Substitutions */}
              {settings.showSubstitutions && banner.substitutions && banner.substitutions.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Recent Substitutions
                  </h4>
                  <div className="space-y-1">
                    {banner.substitutions.slice(-3).map((sub) => (
                      <div key={sub.id} className="text-xs bg-gray-100 p-2 rounded">
                        <span className="font-medium">{sub.minute}&apos;</span> - {sub.playerOut} → {sub.playerIn}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {sub.team === 'home' ? getTeamById(banner.homeTeamId)?.name || 'Unknown' : getTeamById(banner.awayTeamId)?.name || 'Unknown'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {settings.showHighlights && banner.highlights && banner.highlights.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    Key Moments
                  </h4>
                  <div className="space-y-1">
                    {banner.highlights.slice(-5).map((highlight) => (
                      <div key={highlight.id} className="text-xs bg-gray-100 p-2 rounded">
                        <span className="font-medium">{highlight.minute}&apos;</span> - {highlight.description}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {highlight.team === 'home' ? getTeamById(banner.homeTeamId)?.name || 'Unknown' : getTeamById(banner.awayTeamId)?.name || 'Unknown'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
} 