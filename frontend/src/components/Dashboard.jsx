import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDashboard } from '../services/api';
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
} from 'lucide-react';
import { formatDuration, formatRelativeTime } from '../utils/format';
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from 'recharts';

export default function Dashboard() {
  const { key } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const resp = await getDashboard(key);
      if (resp.error) {
        setError(resp.error);
        return;
      }
      setData(resp);
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [key]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-zinc-400" />
        <span className="ml-2 text-zinc-400">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <Link
          to="/"
          className="inline-block bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium py-2 px-4 rounded-lg transition"
        >
          Generate a New Key
        </Link>
      </div>
    );
  }

  const { recent_events, stats } = data;

  const chartData = recent_events
    .slice()
    .reverse()
    .map((e) => ({
      time: new Date(e.timestamp).toLocaleTimeString(),
      success: e.success ? 100 : 0,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-zinc-900 transition"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <code className="text-sm text-zinc-400 font-mono">{key}</code>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <RefreshCw className="w-4 h-4" />
          Auto-refreshing
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Total Tasks</span>
            <Activity className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-3xl font-bold">{stats.total_tasks}</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Success Rate</span>
            <CheckCircle className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-3xl font-bold">{stats.success_rate}%</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Tasks/Hour</span>
            <Clock className="w-4 h-4 text-zinc-500" />
          </div>
          <p className="text-3xl font-bold">{stats.tasks_per_hour}</p>
        </div>
      </div>

      {/* Chart & Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
          <h3 className="font-semibold mb-4">Success Rate Trend</h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#27272a',
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="success"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                No data yet
              </div>
            )}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recent_events.length > 0 ? (
              recent_events.map((event, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded bg-zinc-950/50 border border-zinc-800/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {event.success ? (
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <span className="text-sm font-mono truncate">
                      {event.task}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 flex-shrink-0">
                    <span>{formatDuration(event.duration)}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(event.timestamp)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-zinc-500 text-sm py-4">
                No events yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}