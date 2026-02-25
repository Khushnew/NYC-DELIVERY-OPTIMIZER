import { Truck, Github, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * Header Component
 * Design: Modern Enterprise SaaS
 * - Sticky header with minimal chrome
 * - Logo + title on left
 * - Info and documentation links on right
 * - Slate blue background with subtle shadow
 */

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-full px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-slate-900 to-teal-600 text-white p-2.5 rounded-lg shadow-md">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">NYC Delivery Optimizer</h1>
              <p className="text-xs text-slate-500">Professional Route Optimization</p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                  <Info className="w-4 h-4 mr-2" />
                  About
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>About NYC Delivery Optimizer</DialogTitle>
                  <DialogDescription>
                    Professional-grade route optimization for logistics and delivery services
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm text-slate-700">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Features</h3>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>Live Google Maps integration with real-time visualization</li>
                      <li>Multiple optimization algorithms (Nearest Neighbor, 2-Opt, Genetic)</li>
                      <li>Real road distance calculations via Distance Matrix API</li>
                      <li>Drag-and-drop marker repositioning with auto-recalculation</li>
                      <li>Address search with Places API integration</li>
                      <li>Borough detection and highlighting</li>
                      <li>Multi-algorithm comparison with visual route display</li>
                      <li>Delivery constraints (avoid boroughs, must-end-in locations)</li>
                      <li>Responsive design for desktop, tablet, and mobile</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">How to Use</h3>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600">
                      <li>Click on the map to add delivery stops</li>
                      <li>Or use the address search to find specific locations</li>
                      <li>Drag markers to adjust stop positions</li>
                      <li>Select an optimization algorithm</li>
                      <li>Click "Calculate Route" to optimize</li>
                      <li>Compare multiple algorithms with "Compare All"</li>
                      <li>View detailed results and metrics</li>
                    </ol>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="text-slate-600 hover:text-slate-900"
            >
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
