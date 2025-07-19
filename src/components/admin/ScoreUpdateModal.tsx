'use client';

import { useState } from 'react';
import { SportBannerService } from '@/lib/firebase-service';
import { SportBanner } from '@/lib/models';
import { getTeamById } from '@/lib/teams-config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface ScoreUpdateModalProps {
  banner: SportBanner;
  onUpdate: () => void;
}

export default function ScoreUpdateModal({ banner, onUpdate }: ScoreUpdateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [homeScore, setHomeScore] = useState(banner.homeScore);
  const [awayScore, setAwayScore] = useState(banner.awayScore);
  const [gameStatus, setGameStatus] = useState(banner.gameStatus);
  const [period, setPeriod] = useState(banner.period || '');
  const [timeRemaining, setTimeRemaining] = useState(banner.timeRemaining || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateScore = async () => {
    try {
      setLoading(true);
      await SportBannerService.updateBanner(banner.id, {
        homeScore,
        awayScore,
        gameStatus,
        period: period || undefined,
        timeRemaining: timeRemaining || undefined,
      });
      toast.success('Score updated successfully');
      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating score:', error);
      toast.error('Failed to update score');
    } finally {
      setLoading(false);
    }
  };

  const getPeriodOptions = () => {
    switch (banner.sport) {
      case 'basketball':
        return ['Q1', 'Q2', 'Q3', 'Q4', 'Halftime', 'Overtime'];
      case 'soccer':
        return ['1st Half', 'Halftime', '2nd Half', 'Extra Time', 'Penalties'];
      case 'baseball':
        return ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', 'Extra Innings'];
      case 'tennis':
        return ['1st Set', '2nd Set', '3rd Set', '4th Set', '5th Set'];
      case 'fencing':
        return ['1st Period', '2nd Period', '3rd Period'];
      default:
        return [];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Quick Update
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Game Score</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Teams and Scores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <Label className="text-sm font-medium">{getTeamById(banner.homeTeamId)?.name || 'Unknown'}</Label>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  type="number"
                  value={homeScore}
                  onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                  className="w-16 text-center"
                  min="0"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHomeScore(homeScore + 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="text-center">
              <Label className="text-sm font-medium">{getTeamById(banner.awayTeamId)?.name || 'Unknown'}</Label>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  type="number"
                  value={awayScore}
                  onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                  className="w-16 text-center"
                  min="0"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAwayScore(awayScore + 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Game Status */}
          <div className="space-y-2">
            <Label>Game Status</Label>
            <Select value={gameStatus} onValueChange={(value: string) => setGameStatus(value as 'scheduled' | 'live' | 'halftime' | 'final' | 'postponed')}>
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

          {/* Period */}
          <div className="space-y-2">
            <Label>Period</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {getPeriodOptions().map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Remaining */}
          <div className="space-y-2">
            <Label>Time Remaining</Label>
            <Input
              value={timeRemaining}
              onChange={(e) => setTimeRemaining(e.target.value)}
              placeholder="8:45, 67', 15:30, etc."
            />
          </div>

          {/* Game Info */}
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {banner.gameTime}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {banner.venue}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleUpdateScore}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Updating...' : 'Update Score'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 