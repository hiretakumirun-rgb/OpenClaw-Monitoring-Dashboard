import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { generateKey } from '../services/api';
import { Key, Copy, Check } from 'lucide-react';

export default function KeyGenerator() {
  const [key, setKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const resp = await generateKey();
      setKey(resp.key);
    } catch (err) {
      console.error('Failed to generate key:', err);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Key className="w-5 h-5 text-zinc-400" />
        <h2 className="font-semibold text-lg">Generate API Key</h2>
      </div>
      <p className="text-sm text-zinc-400 mb-4">
        Create a unique monitoring key to track tasks and view activity.
      </p>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-100 font-medium py-2 px-4 rounded-lg transition active:scale-[0.98] mb-4"
      >
        {loading ? 'Generating...' : 'Generate Free Key'}
      </button>

      {key && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
            <code className="flex-1 text-sm text-zinc-100 font-mono break-all">
              {key}
            </code>
            <button
              onClick={copy}
              className="p-1.5 rounded hover:bg-zinc-800 transition"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-zinc-400" />
              )}
            </button>
          </div>
          <Link
            to={`/dashboard/${key}`}
            className="block text-center text-sm text-zinc-400 hover:text-zinc-100 transition"
          >
            View Dashboard →
          </Link>
        </div>
      )}
    </div>
  );
}