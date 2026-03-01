'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface WeeklyTracker {
  website_info?: Record<string, any>;
  ad_count_by_week?: Array<{ week: string; count: number }>;
  top_advertisers?: Array<{ name: string; count: number }>;
  top_websites?: Array<{ name: string; count: number }>;
  weekly_activity_matrix?: Array<Record<string, any>>;
  raw_data?: Record<string, any>;
}

export default function GoogleAdsAnalysisPage() {
  const [searchType, setSearchType] = useState<'domain' | 'advertiser' | 'ads_title'>('domain');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WeeklyTracker | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/google-ads-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          search_type: searchType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl mt-20">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <span>Free</span>
          <span>Google Ads Analysis</span>
        </div>
        <h1 className="text-4xl font-bold mb-2">Google Ads Weekly Tracker</h1>
        <p className="text-muted-foreground text-lg">
          Search by website or advertiser to see ad activity
        </p>
      </div>

      {/* Search Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>
            Enter a domain, advertiser name, or ad title to analyze Google Ads activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={searchType} onValueChange={(v) => setSearchType(v as typeof searchType)} className="mb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="domain">Domain</TabsTrigger>
              <TabsTrigger value="advertiser">Advertiser</TabsTrigger>
              <TabsTrigger value="ads_title">Ads Title</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder={
                  searchType === 'domain'
                    ? 'Search domain...'
                    : searchType === 'advertiser'
                    ? 'Search advertiser...'
                    : 'Search ads title...'
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Try demo: <span className="text-primary cursor-pointer" onClick={() => { setQuery('www.chatgpt.com'); setSearchType('domain'); }}>www.chatgpt.com</span>
          </p>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-8 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {data && (
        <div className="space-y-6">
          {/* Website/Advertiser Information */}
          {data.website_info && Object.keys(data.website_info).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {searchType === 'domain' ? 'Website' : searchType === 'advertiser' ? 'Advertiser' : 'Ads'} Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(data.website_info).map(([key, value]) => (
                    <div key={key} className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">{key}</p>
                      <p className="text-lg font-semibold">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ad Count by Week */}
          {data.ad_count_by_week && data.ad_count_by_week.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ad Count by Week</CardTitle>
                <CardDescription>
                  Each bar represents the number of active ads in a given week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.ad_count_by_week.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-muted-foreground">{item.week || `Week ${index + 1}`}</div>
                      <div className="flex-1">
                        <div className="h-8 bg-primary/20 rounded flex items-center justify-end pr-2" style={{ width: `${(item.count / Math.max(...data.ad_count_by_week!.map(i => i.count))) * 100}%` }}>
                          <span className="text-sm font-medium">{item.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Advertisers / Top Websites */}
          {(data.top_advertisers || data.top_websites) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.top_advertisers && data.top_advertisers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Advertisers</CardTitle>
                    <CardDescription>Advertisers contributing most ad volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.top_advertisers.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <span className="text-muted-foreground">{item.count} ads</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {data.top_websites && data.top_websites.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Websites</CardTitle>
                    <CardDescription>Websites with most ad activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.top_websites.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <span className="text-muted-foreground">{item.count} ads</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Weekly Activity Matrix */}
          {data.weekly_activity_matrix && data.weekly_activity_matrix.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity Matrix</CardTitle>
                <CardDescription>
                  Week-by-week breakdown showing activity patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Week</th>
                        {Object.keys(data.weekly_activity_matrix[0]).map((key) => (
                          <th key={key} className="text-left p-2">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.weekly_activity_matrix.map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">Week {index + 1}</td>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="p-2">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw Data (for debugging) */}
          {data.raw_data && process.env.NODE_ENV === 'development' && (
            <Card>
              <CardHeader>
                <CardTitle>Raw Data (Debug)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto p-4 bg-muted rounded-lg">
                  {JSON.stringify(data.raw_data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* No Data Message */}
          {!data.website_info && !data.ad_count_by_week && !data.top_advertisers && !data.top_websites && !data.weekly_activity_matrix && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No data available for this query. The backend may need to be configured with proper cookies or the website structure may have changed.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}





















