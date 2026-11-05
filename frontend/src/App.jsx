import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import { Activity, Key } from 'lucide-react';

function Header() {
  const location = useLocation();
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-zinc-100" />
          <span className="font-semibold text-lg tracking-tight">OpenClaw</span>
        </Link>
        <nav className="flex items-center gap-4">
          {location.pathname !== '/' && (
            <Link
              to="/"
              className="text-sm text-zinc-400 hover:text-zinc-100 transition"
            >
              ← Back
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard/:key" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}