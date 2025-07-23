'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

import { SportBannerService } from '@/lib/firebase-service';
import { SportBanner, SportBannerSettings } from '@/lib/models';
import { getAllTeams, getTeamById } from '@/lib/teams-config';
import { espnSyncService } from '@/lib/espn-sync-service';
import { unifiedSportsAPI } from '@/lib/unified-sports-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Settings, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import ScoreUpdateModal from '@/components/admin/ScoreUpdateModal';

export default function SportsBannerAdmin() {
  // const { user: _user } = useAuth();
  const [banners, setBanners] = useState<SportBanner[]>([]);
  const [settings, setSettings] = useState<SportBannerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<SportBanner | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [syncMode, setSyncMode] = useState<'auto' | 'manual'>('manual');
  const [autoSyncInterval, setAutoSyncInterval] = useState(2); // minutes


  const [formData, setFormData] = useState({
    sport: 'basketball' as 'basketball' | 'soccer' | 'baseball' | 'fencing' | 'tennis',
    homeTeamId: 'ucsd', // Default to UCSD
    awayTeamId: '',
    homeScore: 0,
    awayScore: 0,
    gameStatus: 'scheduled' as 'scheduled' | 'live' | 'halftime' | 'final' | 'postponed',
    gameTime: '',
    venue: '',
    date: new Date().toISOString().split('T')[0],
    period: '',
    timeRemaining: '',
    isEnabled: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bannersData, settingsData] = await Promise.all([
        SportBannerService.getAllBanners(),
        SportBannerService.getBannerSettings(),
      ]);
      setBanners(bannersData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async () => {
    try {
      await SportBannerService.createBanner({
        ...formData,
        date: new Date(formData.date),
        substitutions: [],
        highlights: [],
      });
      toast.success('Banner created successfully');
      setIsCreateDialogOpen(false);
      setFormData({
        sport: 'basketball',
        homeTeamId: 'ucsd',
        awayTeamId: '',
        homeScore: 0,
        awayScore: 0,
        gameStatus: 'scheduled',
        gameTime: '',
        venue: '',
        date: new Date().toISOString().split('T')[0],
        period: '',
        timeRemaining: '',
        isEnabled: false,
      });
      loadData();
    } catch (error) {
      console.error('Error creating banner:', error);
      toast.error('Failed to create banner');
    }
  };

  const handleUpdateBanner = async () => {
    if (!editingBanner) return;
    
    try {
      await SportBannerService.updateBanner(editingBanner.id, {
        ...formData,
        date: new Date(formData.date),
      });
      toast.success('Banner updated successfully');
      setEditingBanner(null);
      setFormData({
        sport: 'basketball',
        homeTeamId: 'ucsd',
        awayTeamId: '',
        homeScore: 0,
        awayScore: 0,
        gameStatus: 'scheduled',
        gameTime: '',
        venue: '',
        date: new Date().toISOString().split('T')[0],
        period: '',
        timeRemaining: '',
        isEnabled: false,
      });
      loadData();
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('Failed to update banner');
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      await SportBannerService.deleteBanner(bannerId);
      toast.success('Banner deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  const handleToggleBanner = async (bannerId: string, isEnabled: boolean) => {
    try {
      await SportBannerService.toggleBanner(bannerId, isEnabled);
      toast.success(`Banner ${isEnabled ? 'enabled' : 'disabled'} successfully`);
      loadData();
    } catch (error) {
      console.error('Error toggling banner:', error);
      toast.error('Failed to toggle banner');
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<SportBannerSettings>): Promise<void> => {
    try {
      await SportBannerService.updateBannerSettings(newSettings);
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
      toast.success('Settings updated successfully');
      setIsSettingsDialogOpen(false);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const editBanner = (banner: SportBanner): void => {
    setEditingBanner(banner);
    
    // Handle date conversion safely
    let dateString = '';
    if (banner.date) {
      if (typeof banner.date === 'string') {
        dateString = (banner.date as string).split('T')[0];
      } else if (banner.date instanceof Date) {
        dateString = banner.date.toISOString().split('T')[0];
      } else if (typeof banner.date === 'object' && banner.date !== null && 'toDate' in banner.date) {
        // Firestore timestamp
        dateString = (banner.date as { toDate: () => Date }).toDate().toISOString().split('T')[0];
      }
    }

    setFormData({
      sport: banner.sport,
      homeTeamId: banner.homeTeamId,
      awayTeamId: banner.awayTeamId,
      homeScore: banner.homeScore,
      awayScore: banner.awayScore,
      gameStatus: banner.gameStatus,
      gameTime: banner.gameTime,
      venue: banner.venue,
      date: dateString,
      period: banner.period || '',
      timeRemaining: banner.timeRemaining || '',
      isEnabled: banner.isEnabled,
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'halftime': return 'bg-yellow-500';
      case 'final': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'postponed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getSportIcon = (sport: string): string => {
    switch (sport) {
      case 'basketball': return '🏀';
      case 'soccer': return '⚽';
      case 'baseball': return '⚾';
      case 'fencing': return '🤺';
      case 'tennis': return '🎾';
      default: return '🏆';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sports Banner Management</h1>
        <div className="flex gap-2">
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Banner Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Banner System</Label>
                  <Switch
                    checked={settings?.isEnabled || false}
                    onCheckedChange={(checked) => handleUpdateSettings({ isEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Auto Refresh</Label>
                  <Switch
                    checked={settings?.autoRefresh || false}
                    onCheckedChange={(checked) => handleUpdateSettings({ autoRefresh: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Refresh Interval (seconds)</Label>
                  <Input
                    type="number"
                    value={settings?.refreshInterval || 30}
                    onChange={(e) => handleUpdateSettings({ refreshInterval: parseInt(e.target.value) })}
                    min="10"
                    max="300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Substitutions</Label>
                  <Switch
                    checked={settings?.showSubstitutions || false}
                    onCheckedChange={(checked) => handleUpdateSettings({ showSubstitutions: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Highlights</Label>
                  <Switch
                    checked={settings?.showHighlights || false}
                    onCheckedChange={(checked) => handleUpdateSettings({ showHighlights: checked })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Banner Style</Label>
                  <Select
                    value={settings?.bannerStyle || 'detailed'}
                    onValueChange={(value: string) => handleUpdateSettings({ bannerStyle: value as 'minimal' | 'detailed' | 'full' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Sports Banner</DialogTitle>
              </DialogHeader>
              <BannerForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateBanner}
                submitLabel="Create Banner"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="banners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="active">Active Banner</TabsTrigger>
          <TabsTrigger value="espn">ESPN Sync</TabsTrigger>
          <TabsTrigger value="unified">Unified Sports</TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="space-y-4">
          <div className="grid gap-4">
            {banners.map((banner) => (
              <Card key={banner.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span>{getSportIcon(banner.sport)}</span>
                        {getTeamById(banner.homeTeamId)?.name || 'Unknown'} vs {getTeamById(banner.awayTeamId)?.name || 'Unknown'}
                        <Badge className={getStatusColor(banner.gameStatus)}>
                          {banner.gameStatus.toUpperCase()}
                        </Badge>
                        {banner.isEnabled && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            ACTIVE
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {banner.venue} • {banner.gameTime}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <ScoreUpdateModal banner={banner} onUpdate={loadData} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editBanner(banner)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleBanner(banner.id, !banner.isEnabled)}
                      >
                        {banner.isEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBanner(banner.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{banner.homeScore}</div>
                      <div className="text-sm text-gray-600">{getTeamById(banner.homeTeamId)?.name || 'Unknown'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">VS</div>
                      <div className="text-sm text-gray-600">
                        {banner.period && `${banner.period}`}
                        {banner.timeRemaining && ` • ${banner.timeRemaining}`}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{banner.awayScore}</div>
                      <div className="text-sm text-gray-600">{getTeamById(banner.awayTeamId)?.name || 'Unknown'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {editingBanner && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Banner</CardTitle>
              </CardHeader>
              <CardContent>
                <BannerForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleUpdateBanner}
                  submitLabel="Update Banner"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="espn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ESPN Auto-Sync Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sync Mode Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Sync Mode</Label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="manual-sync"
                        name="sync-mode"
                        value="manual"
                        checked={syncMode === 'manual'}
                        onChange={(e) => setSyncMode(e.target.value as 'auto' | 'manual')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="manual-sync" className="text-sm">Manual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="auto-sync"
                        name="sync-mode"
                        value="auto"
                        checked={syncMode === 'auto'}
                        onChange={(e) => setSyncMode(e.target.value as 'auto' | 'manual')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <Label htmlFor="auto-sync" className="text-sm">Auto-Sync</Label>
                    </div>
                  </div>
                </div>

                {syncMode === 'auto' && (
                  <div className="space-y-2">
                    <Label>Auto-Sync Interval (minutes)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={autoSyncInterval}
                        onChange={(e) => setAutoSyncInterval(parseInt(e.target.value) || 2)}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-600">minutes</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Auto-Sync Status</Label>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${espnSyncService.getSyncStatus().isRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm">
                      {espnSyncService.getSyncStatus().isRunning ? 'Running' : 'Stopped'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Last Sync</Label>
                  <div className="text-sm text-gray-600">
                    {new Date(espnSyncService.getSyncStatus().lastSync).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {syncMode === 'auto' ? (
                  <>
                    <Button
                      onClick={() => {
                        espnSyncService.startAutoSync(autoSyncInterval);

                        toast.success(`ESPN auto-sync started (every ${autoSyncInterval} minutes)`);
                      }}
                      disabled={espnSyncService.getSyncStatus().isRunning}
                    >
                      Start Auto-Sync
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        espnSyncService.stopAutoSync();

                        toast.success('ESPN auto-sync stopped');
                      }}
                      disabled={!espnSyncService.getSyncStatus().isRunning}
                    >
                      Stop Auto-Sync
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={async () => {
                      try {
                        await espnSyncService.performSync();
                        toast.success('Manual sync completed');
                        loadData();
                      } catch {
                        toast.error('Manual sync failed');
                      }
                    }}
                  >
                    Manual Sync Now
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await espnSyncService.syncUpcomingGames();
                      toast.success('Upcoming games synced');
                      loadData();
                    } catch {
                      toast.error('Failed to sync upcoming games');
                    }
                  }}
                >
                  Sync Upcoming
                </Button>
                
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await espnSyncService.cleanupOldBanners();
                      toast.success('Old banners cleaned up');
                      loadData();
                    } catch {
                      toast.error('Cleanup failed');
                    }
                  }}
                >
                  Cleanup Old
                </Button>
              </div>

              <div className="text-sm text-gray-600">
                <p><strong>Manual Mode:</strong> Click &quot;Manual Sync Now&quot; to immediately fetch current live games</p>
                <p><strong>Auto-Sync Mode:</strong> Automatically fetches live scores from ESPN every {autoSyncInterval} minutes</p>
                <p><strong>Sync Upcoming:</strong> Create banners for scheduled games</p>
                <p><strong>Cleanup:</strong> Remove old completed game banners</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unified" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unified Sports API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Available Sports</Label>
                  <div className="text-sm text-muted-foreground">
                    {unifiedSportsAPI.getAllAvailableSports().length} total sports
                  </div>
                  <div className="text-xs space-y-1">
                    <div><strong>ESPN Sports:</strong> {unifiedSportsAPI.getESPNSports().join(', ')}</div>
                    <div><strong>NCAA Sports:</strong> {unifiedSportsAPI.getNCAAAPISports().slice(0, 5).join(', ')}...</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>API Status</Label>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">ESPN API: Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">NCAA API: Connected</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Test APIs</Label>
                  <Button 
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/sports?type=test');
                        const data = await response.json();
                        if (data.success) {
                                                  toast.success(`API Test Successful - ESPN: ${data.data.espn ? '✅' : '❌'}, NCAA: ${data.data.ncaa ? '✅' : '❌'}`);
                        }
                      } catch {
                        toast.error("API Test Failed - Could not test APIs");
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Test APIs
                  </Button>
                </div>

                <div>
                  <Label>Fetch Live Games</Label>
                  <Button 
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/sports?type=live');
                        const data = await response.json();
                        if (data.success) {
                          toast.success(`Live Games Fetched - Found ${data.count} live games`);
                        }
                      } catch {
                        toast.error("Fetch Failed - Could not fetch live games");
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Get Live Games
                  </Button>
                </div>

                <div>
                  <Label>Comprehensive Data</Label>
                  <Button 
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/sports?type=comprehensive');
                        const data = await response.json();
                        if (data.success) {
                          toast.success(`Comprehensive Data Fetched - ${data.data.liveGames.length} live, ${data.data.upcomingGames.length} upcoming games`);
                        }
                      } catch {
                        toast.error("Fetch Failed - Could not fetch comprehensive data");
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Get All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface BannerFormProps {
  formData: {
    sport: 'basketball' | 'soccer' | 'baseball' | 'fencing' | 'tennis';
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number;
    awayScore: number;
    gameStatus: 'scheduled' | 'live' | 'halftime' | 'final' | 'postponed';
    gameTime: string;
    venue: string;
    date: string;
    period: string;
    timeRemaining: string;
    isEnabled: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    sport: 'basketball' | 'soccer' | 'baseball' | 'fencing' | 'tennis';
    homeTeamId: string;
    awayTeamId: string;
    homeScore: number;
    awayScore: number;
    gameStatus: 'scheduled' | 'live' | 'halftime' | 'final' | 'postponed';
    gameTime: string;
    venue: string;
    date: string;
    period: string;
    timeRemaining: string;
    isEnabled: boolean;
  }>>;
  onSubmit: () => void;
  submitLabel: string;
}

function BannerForm({ formData, setFormData, onSubmit, submitLabel }: BannerFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Sport</Label>
          <Select
            value={formData.sport}
            onValueChange={(value) => setFormData({ ...formData, sport: value as 'basketball' | 'soccer' | 'baseball' | 'fencing' | 'tennis' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basketball">Basketball</SelectItem>
              <SelectItem value="soccer">Soccer</SelectItem>
              <SelectItem value="baseball">Baseball</SelectItem>
              <SelectItem value="fencing">Fencing</SelectItem>
              <SelectItem value="tennis">Tennis</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Game Status</Label>
          <Select
            value={formData.gameStatus}
            onValueChange={(value) => setFormData({ ...formData, gameStatus: value as 'scheduled' | 'live' | 'halftime' | 'final' | 'postponed' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="halftime">Halftime</SelectItem>
              <SelectItem value="final">Final</SelectItem>
              <SelectItem value="postponed">Postponed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Home Team</Label>
          <Select
            value={formData.homeTeamId}
            onValueChange={(value) => setFormData({ ...formData, homeTeamId: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getAllTeams().map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  <div className="flex items-center gap-2">
                    <Image src={team.logo} alt={team.name} width={16} height={16} className="w-4 h-4" />
                    {team.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Away Team</Label>
          <Select
            value={formData.awayTeamId}
            onValueChange={(value) => setFormData({ ...formData, awayTeamId: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getAllTeams().map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  <div className="flex items-center gap-2">
                    <Image src={team.logo} alt={team.name} width={16} height={16} className="w-4 h-4" />
                    {team.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Home Score</Label>
          <Input
            type="number"
            value={formData.homeScore}
            onChange={(e) => setFormData({ ...formData, homeScore: parseInt(e.target.value) || 0 })}
            min="0"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Away Score</Label>
          <Input
            type="number"
            value={formData.awayScore}
            onChange={(e) => setFormData({ ...formData, awayScore: parseInt(e.target.value) || 0 })}
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Game Time</Label>
          <Input
            value={formData.gameTime}
            onChange={(e) => setFormData({ ...formData, gameTime: e.target.value })}
            placeholder="7:30 PM"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Venue</Label>
          <Input
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            placeholder="RIMAC Arena"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Period</Label>
          <Input
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
            placeholder="Q3, 2nd Half, etc."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Time Remaining</Label>
        <Input
          value={formData.timeRemaining}
          onChange={(e) => setFormData({ ...formData, timeRemaining: e.target.value })}
          placeholder="8:45, 67', 15:30, etc."
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.isEnabled}
          onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
        />
        <Label>Enable this banner</Label>
      </div>

      <Button onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );
} 