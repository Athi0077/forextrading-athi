import { useState, useEffect } from 'react';
import { apiCall } from '../../services/api';
import { Users, Activity, CreditCard, Cpu, ArrowUpRight, ArrowDownRight, Globe, TrendingUp, TrendingDown, Layers } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await apiCall('/admin/dashboard', { method: 'GET' });
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse text-zinc-500">Loading Dashboard...</div>;
  }

  if (!stats) {
    return <div className="text-red-500">Failed to load statistics.</div>;
  }

  const statCards = [
    { name: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Online Users', value: stats.onlineUsers, icon: Globe, color: 'text-green-500', bg: 'bg-green-500/10' },
    { name: 'Active Users (7d)', value: stats.activeUsers, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { name: 'New Users (24h)', value: stats.newUsers, icon: ArrowUpRight, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { name: 'Total Trades', value: stats.tradeStats?.totalTrades || 0, icon: Layers, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { name: 'Open Trades', value: stats.tradeStats?.openTrades || 0, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { name: 'Winning Trades', value: stats.tradeStats?.winningTrades || 0, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
    { name: 'Net P/L', value: `$${(stats.tradeStats?.netPnl || 0).toFixed(2)}`, icon: stats.tradeStats?.netPnl >= 0 ? TrendingUp : TrendingDown, color: stats.tradeStats?.netPnl >= 0 ? 'text-green-500' : 'text-red-500', bg: stats.tradeStats?.netPnl >= 0 ? 'bg-green-500/10' : 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-zinc-400 text-sm mt-1">Platform statistics and system health.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2 px-3 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-zinc-300">API: {stats.apiStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-[#121214] p-6 rounded-2xl border border-zinc-800 flex items-start justify-between group hover:border-zinc-700 transition-colors">
            <div>
              <p className="text-sm font-medium text-zinc-400 mb-1">{stat.name}</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value.toLocaleString()}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
