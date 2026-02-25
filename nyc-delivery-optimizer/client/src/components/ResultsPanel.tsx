import { Loader2, TrendingDown, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { RouteResult } from '@/App';

/**
 * ResultsPanel Component
 * Design: Modern Enterprise SaaS
 * - Displays route optimization results
 * - Algorithm comparison view
 * - Efficiency metrics and visualization
 * - Collapsible on mobile
 */

interface ResultsPanelProps {
  results: RouteResult[];
  isLoading: boolean;
}

export default function ResultsPanel({ results, isLoading }: ResultsPanelProps) {
  if (isLoading) {
    return (
      <div className="w-80 bg-white border-l border-slate-200 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" />
        <p className="text-sm text-slate-600">Calculating optimal route...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="w-80 bg-white border-l border-slate-200 flex flex-col items-center justify-center p-6">
        <Zap className="w-12 h-12 text-slate-300 mb-3" />
        <p className="text-sm text-slate-600 text-center">
          Add stops and click "Calculate Route" to see results
        </p>
      </div>
    );
  }

  const bestResult = results[0];
  const improvementPercent = results.length > 1
    ? Number(((results[results.length - 1].distance - results[0].distance) / results[results.length - 1].distance * 100).toFixed(1))
    : 0;

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Best Result Summary */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-teal-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Best Route</h3>
                  <p className="text-xs text-slate-600">{bestResult.algorithm}</p>
                </div>
                <Badge className="bg-teal-600 text-white">Optimized</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700">Distance</span>
                  <span className="text-lg font-bold text-teal-600">{bestResult.distance.toFixed(1)} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700">Estimated Time</span>
                  <span className="text-lg font-bold text-slate-900">{Math.round(bestResult.duration)} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-700">Efficiency</span>
                  <span className="text-lg font-bold text-emerald-600">{(bestResult.efficiency * 100).toFixed(0)}%</span>
                </div>
              </div>

              {improvementPercent > 0 && (
                <div className="mt-3 pt-3 border-t border-teal-200 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-emerald-700">
                    <strong>{improvementPercent.toFixed(1)}%</strong> better than worst algorithm
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Results */}
          {results.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Route Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-900">Delivery Sequence</h4>
                  <div className="space-y-1">
                    {bestResult.stops.slice(0, 8).map((stop, idx) => (
                      <div key={stop.id} className="flex items-center gap-2 text-xs">
                        <Badge variant="secondary" className="w-5 h-5 flex items-center justify-center p-0">
                          {idx + 1}
                        </Badge>
                        <span className="text-slate-700 truncate">{stop.name}</span>
                      </div>
                    ))}
                    {bestResult.stops.length > 8 && (
                      <div className="text-xs text-slate-500 italic">
                        +{bestResult.stops.length - 8} more stops
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Algorithm Comparison */}
          {results.length > 1 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Algorithm Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.map((result, idx) => {
                    const isFirst = idx === 0;
                    const improvement = isFirst ? 0 : ((result.distance - results[0].distance) / result.distance * 100).toFixed(1);

                    return (
                      <div
                        key={result.algorithm}
                        className={`p-2 rounded-lg border transition-all ${
                          isFirst
                            ? 'border-teal-300 bg-teal-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-slate-900">
                            {result.algorithm}
                          </span>
                          {isFirst && <Badge className="bg-teal-600 text-white text-xs">Best</Badge>}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900">
                            {result.distance.toFixed(1)} km
                          </span>
                          {!isFirst && (
                            <span className="text-xs text-slate-600">
                              +{improvement}%
                            </span>
                          )}
                        </div>

                        {/* Distance bar visualization */}
                        <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isFirst ? 'bg-teal-600' : 'bg-slate-400'
                            }`}
                            style={{
                              width: `${(result.distance / Math.max(...results.map(r => r.distance))) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metrics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-teal-600" />
                  <span className="text-xs text-slate-700">Total Distance</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{bestResult.distance.toFixed(1)} km</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span className="text-xs text-slate-700">Est. Duration</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{Math.round(bestResult.duration)} min</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-slate-700">Efficiency Score</span>
                </div>
                <span className="text-sm font-bold text-emerald-600">{(bestResult.efficiency * 100).toFixed(0)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
