import React, { useState } from 'react';
import { Code, Copy, Check } from 'lucide-react';

const SDKSnippet = `// Install via npm: npm install openclaw-sdk
// Or use the CDN script below

import OpenClaw from 'openclaw-sdk';

const claw = new OpenClaw('YOUR_API_KEY');

// Track a task
await claw.track({
  task: 'data-processing',
  duration: 1500,
  success: true
});`;

const CDNSnippet = `<script src="https://cdn.jsdelivr.net/npm/openclaw-sdk@1.0.0/dist/claw.min.js"></script>
<script>
  const claw = new OpenClaw('YOUR_API_KEY');
  claw.track({ task: 'login', duration: 200, success: true });
</script>`;

export default function IntegrationGuide() {
  const [copied, setCopied] = useState(false);

  const copySnippet = () => {
    navigator.clipboard.writeText(SDKSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-5 h-5 text-zinc-400" />
        <h2 className="font-semibold text-lg">Integration Guide</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-zinc-300 mb-2">
            JavaScript SDK
          </h3>
          <p className="text-sm text-zinc-400 mb-3">
            Add this snippet to your application to start tracking tasks.
          </p>
          <div className="relative">
            <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto text-sm">
              <code className="text-zinc-300 font-mono whitespace-pre-wrap">
                {SDKSnippet}
              </code>
            </pre>
            <button
              onClick={copySnippet}
              className="absolute top-2 right-2 p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 transition"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-zinc-400" />
              )}
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-zinc-300 mb-2">
            CDN Script
          </h3>
          <p className="text-sm text-zinc-400 mb-3">
            Or include directly via CDN for quick integration.
          </p>
          <div className="relative">
            <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto text-sm">
              <code className="text-zinc-300 font-mono whitespace-pre-wrap">
                {CDNSnippet}
              </code>
            </pre>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">
            API Endpoints
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-xs font-medium">
                POST
              </span>
              <code className="text-zinc-400">/api/track</code>
              <span className="text-zinc-500">- Send task events</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-medium">
                GET
              </span>
              <code className="text-zinc-400">/api/dashboard/:key</code>
              <span className="text-zinc-500">- View stats &amp; activity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}