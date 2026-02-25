import { useState } from 'react';
import { Play, BarChart3, MapPin, RotateCcw, Settings2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DeliveryStop } from '@/App';

/**
 * ControlPanel Component
 * Design: Modern Enterprise SaaS
 * - Fixed left sidebar (280px)
 * - Algorithm selection
 * - Stop list with sequence numbers
 * - Quick actions and advanced options
 * - Stats display
 */

interface ControlPanelProps {
  stops: DeliveryStop[];
  selectedStopId: string | null;
  onSelectStop: (id: string | null) => void;
  onRemoveStop: (id: string) => void;
  onClearAll: () => void;
  onCalculateRoute: () => void;
  onCompareAlgorithms: () => void;
  onLoadExample: () => void;
  isCalculating: boolean;
  selectedAlgorithm: string;
  onSelectAlgorithm: (algo: string) => void;
  stats: {
    totalStops: number;
    totalDistance: number;
    estimatedTime: number;
    efficiency: number;
  };
  showAdvancedOptions: boolean;
  onToggleAdvanced: (show: boolean) => void;
  constraints: {
    avoidBoroughs: string[];
    mustEndIn: string | null;
    maxStops: number;
  };
  onUpdateConstraints: (constraints: any) => void;
}

const ALGORITHMS = [
  {
    id: 'nearest-neighbor',
    name: 'Nearest Neighbor',
    description: 'Fast greedy algorithm',
    complexity: 'O(n²)',
  },
  {
    id: '2-opt',
    name: '2-Opt',
    description: 'Local search improvement',
    complexity: 'O(n²)',
  },
  {
    id: 'genetic',
    name: 'Genetic Algorithm',
    description: 'Evolutionary optimization',
    complexity: 'O(n³)',
  },
];

const BOROUGHS = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

export default function ControlPanel({
  stops,
  selectedStopId,
  onSelectStop,
  onRemoveStop,
  onClearAll,
  onCalculateRoute,
  onCompareAlgorithms,
  onLoadExample,
  isCalculating,
  selectedAlgorithm,
  onSelectAlgorithm,
  stats,
  showAdvancedOptions,
  onToggleAdvanced,
  constraints,
  onUpdateConstraints,
}: ControlPanelProps) {
  const [expandedStop, setExpandedStop] = useState<string | null>(null);

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Stats Card */}
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-2xl font-bold text-slate-900">{stats.totalStops}</div>
                  <div className="text-xs text-slate-600">Delivery Stops</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-teal-600">{stats.totalDistance.toFixed(1)}</div>
                  <div className="text-xs text-slate-600">Total Distance (km)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900">{Math.round(stats.estimatedTime)}</div>
                  <div className="text-xs text-slate-600">Est. Time (min)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">{(stats.efficiency * 100).toFixed(0)}%</div>
                  <div className="text-xs text-slate-600">Efficiency</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Algorithm Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-teal-600" />
                Algorithm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select value={selectedAlgorithm} onValueChange={onSelectAlgorithm}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALGORITHMS.map(algo => (
                    <SelectItem key={algo.id} value={algo.id}>
                      <div>
                        <div className="font-medium">{algo.name}</div>
                        <div className="text-xs text-slate-500">{algo.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {ALGORITHMS.find(a => a.id === selectedAlgorithm) && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                  {ALGORITHMS.find(a => a.id === selectedAlgorithm)?.description}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Play className="w-4 h-4 text-teal-600" />
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                onClick={onCalculateRoute}
                disabled={stops.length < 2 || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Calculate Route
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                className="w-full"
                onClick={onCompareAlgorithms}
                disabled={stops.length < 2 || isCalculating}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Compare All
              </Button>

              <Separator />

              <Button
                variant="outline"
                className="w-full"
                onClick={onLoadExample}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Load Example
              </Button>

              <Button
                variant="ghost"
                className="w-full text-slate-600 hover:text-slate-900"
                onClick={onClearAll}
                disabled={stops.length === 0}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card>
            <CardHeader className="pb-3">
              <button
                onClick={() => onToggleAdvanced(!showAdvancedOptions)}
                className="w-full flex items-center justify-between hover:text-teal-600 transition-colors"
              >
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  Advanced Options
                </CardTitle>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`}
                />
              </button>
            </CardHeader>

            {showAdvancedOptions && (
              <CardContent className="space-y-3 border-t border-slate-200 pt-3">
                <div>
                  <label className="text-xs font-semibold text-slate-900 mb-2 block">
                    Avoid Boroughs
                  </label>
                  <div className="space-y-1">
                    {BOROUGHS.map(borough => (
                      <div key={borough} className="flex items-center gap-2">
                        <Checkbox
                          id={`avoid-${borough}`}
                          checked={constraints.avoidBoroughs.includes(borough)}
                          onCheckedChange={(checked) => {
                            const updated = checked
                              ? [...constraints.avoidBoroughs, borough]
                              : constraints.avoidBoroughs.filter(b => b !== borough);
                            onUpdateConstraints({ ...constraints, avoidBoroughs: updated });
                          }}
                        />
                        <label htmlFor={`avoid-${borough}`} className="text-xs text-slate-700 cursor-pointer">
                          {borough}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-xs font-semibold text-slate-900 mb-2 block">
                    Must End In
                  </label>
                  <Select
                    value={constraints.mustEndIn || ''}
                    onValueChange={(value) => {
                      onUpdateConstraints({ ...constraints, mustEndIn: value || null });
                    }}
                  >
                    <SelectTrigger className="border-slate-200 text-xs">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {BOROUGHS.map(borough => (
                        <SelectItem key={borough} value={borough}>
                          {borough}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Stops List */}
          {stops.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Delivery Stops ({stops.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stops.map((stop, index) => (
                  <div
                    key={stop.id}
                    className={`p-2 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedStopId === stop.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => onSelectStop(selectedStopId === stop.id ? null : stop.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-teal-600 text-white text-xs">{index + 1}</Badge>
                          <span className="text-sm font-semibold text-slate-900">{stop.name}</span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1 truncate">{stop.address}</div>
                        {stop.borough && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {stop.borough}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveStop(stop.id);
                        }}
                        className="text-slate-400 hover:text-red-600"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="border-t border-slate-200 p-3 bg-slate-50">
        <p className="text-xs text-slate-600">
          Click on the map to add stops, or use the search bar to find addresses.
        </p>
      </div>
    </div>
  );
}
