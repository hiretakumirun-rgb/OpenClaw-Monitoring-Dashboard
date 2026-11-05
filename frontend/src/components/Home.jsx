import React from 'react';
import {
  Activity,
  Zap,
  BarChart3,
  Globe,
} from 'lucide-react';
import KeyGenerator from './KeyGenerator';
import IntegrationGuide from './IntegrationGuide';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Activity className="w-10 h-10 text-zinc-100" />
          <h1 className="text-4xl font-bold tracking-tight">OpenClaw Monitoring</h1>
        </div>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          A lightweight monitoring dashboard for tracking tasks, viewing live
          activity feeds, and analyzing performance statistics.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
          <Zap className="w-6 h-6 text-zinc-400 mb-3" />
          <h3 className="font-semibold mb-2">Lightweight SDK</h3>
          <p className="text-sm text-zinc-400">
            Simple JavaScript SDK to track tasks with minimal overhead.
          </p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
          <BarChart3 className="w-6 h-6 text-zinc-400 mb-3" />
          <h3 className="font-semibold mb-2">Live Analytics</h3>
          <p className="text-sm text-zinc-400">
            Real-time charts and stats showing success rates and task
            throughput.
          </p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
          <Globe className="w-6 h-6 text-zinc-400 mb-3" />
          <h3 className="font-semibold mb-2">No Auth Required</h3>
          <p className="text-sm text-zinc-400">
            Generate a key and start monitoring instantly. No accounts
            needed.
          </p>
        </div>
      </div>

      {/* Key Generator & Integration Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KeyGenerator />
        <IntegrationGuide />
      </div>
    </div>
  );
}