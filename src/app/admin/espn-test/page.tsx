'use client';

import { useState } from 'react';
import { espnAPI } from '@/lib/espn-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


export default function ESPNTestPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<unknown[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testESPNAPI = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      let result;
      
      switch (endpoint) {
        case 'live-basketball':
          result = await espnAPI.getUCSDGames('basketball');
          break;
        case 'live-baseball':
          result = await espnAPI.getUCSDGames('baseball');
          break;
        case 'news-basketball':
          result = await espnAPI.getUCSDNews('basketball');
          break;
        case 'news-baseball':
          result = await espnAPI.getUCSDNews('baseball');
          break;
        case 'live-all':
          result = await espnAPI.getLiveUCSDGames();
          break;
        case 'upcoming':
          result = await espnAPI.getUpcomingUCSDGames();
          break;
        default:
          throw new Error('Invalid endpoint');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">ESPN API Test</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Button
          onClick={() => testESPNAPI('live-basketball')}
          disabled={loading}
          variant="outline"
        >
          Live Basketball
        </Button>
        
        <Button
          onClick={() => testESPNAPI('live-baseball')}
          disabled={loading}
          variant="outline"
        >
          Live Baseball
        </Button>
        
        <Button
          onClick={() => testESPNAPI('live-all')}
          disabled={loading}
          variant="outline"
        >
          All Live Games
        </Button>
        
        <Button
          onClick={() => testESPNAPI('upcoming')}
          disabled={loading}
          variant="outline"
        >
          Upcoming Games
        </Button>
        
        <Button
          onClick={() => testESPNAPI('news-basketball')}
          disabled={loading}
          variant="outline"
        >
          Basketball News
        </Button>
        
        <Button
          onClick={() => testESPNAPI('news-baseball')}
          disabled={loading}
          variant="outline"
        >
          Baseball News
        </Button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="text-lg">Loading...</div>
        </div>
      )}

      {error && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-red-600">{error}</pre>
          </CardContent>
        </Card>
      )}

      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Results ({Array.isArray(data) ? data.length : 'Object'})</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm overflow-auto max-h-96 bg-gray-100 p-4 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 