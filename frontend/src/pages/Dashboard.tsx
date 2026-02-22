import { useState, useEffect } from 'react';
import api from '../services/api';
import socketService from '../services/socket';
import { DashboardStats } from '../types';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    confirmedOrders: 0,
    cancelledOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();

    // Listen for real-time updates
    socketService.on('stats:update', (newStats: DashboardStats) => {
      setStats(newStats);
    });

    return () => {
      socketService.off('stats:update');
    };
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="text-6xl animate-bounce">👋</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Orders</p>
              <p className="text-5xl font-bold mt-3">{stats.totalOrders}</p>
              <p className="text-blue-100 text-sm mt-2">All time</p>
            </div>
            <div className="text-6xl opacity-20">📦</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending</p>
              <p className="text-5xl font-bold mt-3">{stats.pendingOrders || 0}</p>
              <p className="text-yellow-100 text-sm mt-2">Awaiting confirmation</p>
            </div>
            <div className="text-6xl opacity-20">⏳</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Confirmed</p>
              <p className="text-5xl font-bold mt-3">{stats.confirmedOrders}</p>
              <p className="text-green-100 text-sm mt-2">Successfully completed</p>
            </div>
            <div className="text-6xl opacity-20">✅</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Cancelled</p>
              <p className="text-5xl font-bold mt-3">{stats.cancelledOrders}</p>
              <p className="text-red-100 text-sm mt-2">Needs attention</p>
            </div>
            <div className="text-6xl opacity-20">❌</div>
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium mb-2">Total Revenue</p>
            <p className="text-6xl font-bold">${(stats.totalRevenue || 0).toFixed(2)}</p>
            <p className="text-purple-100 text-sm mt-3">From {stats.confirmedOrders} confirmed orders</p>
          </div>
          <div className="text-9xl opacity-20">💰</div>
        </div>
      </div>

      {/* Top Products */}
      {stats.topProducts && stats.topProducts.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Product Statistics</h2>
                <p className="text-sm md:text-base text-gray-600">Detailed breakdown of all products ordered</p>
              </div>
            </div>
            <div className="hidden md:block text-4xl">📊</div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 md:p-4 border border-blue-200">
              <p className="text-xs md:text-sm text-blue-600 font-medium mb-1">Total Products</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-700">{stats.topProducts.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 md:p-4 border border-green-200">
              <p className="text-xs md:text-sm text-green-600 font-medium mb-1">Units Sold</p>
              <p className="text-2xl md:text-3xl font-bold text-green-700">
                {stats.topProducts.reduce((sum, p) => sum + p.count, 0)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 md:p-4 border border-purple-200 col-span-2 md:col-span-1">
              <p className="text-xs md:text-sm text-purple-600 font-medium mb-1">Products Revenue</p>
              <p className="text-2xl md:text-3xl font-bold text-purple-700">
                ${stats.topProducts.reduce((sum, p) => sum + p.revenue, 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-bold text-gray-700">#</th>
                  <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-bold text-gray-700">Product Name</th>
                  <th className="text-center py-3 px-2 md:px-4 text-xs md:text-sm font-bold text-gray-700">Units Sold</th>
                  <th className="text-right py-3 px-2 md:px-4 text-xs md:text-sm font-bold text-gray-700">Revenue</th>
                  <th className="text-right py-3 px-2 md:px-4 text-xs md:text-sm font-bold text-gray-700">Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((product, index) => {
                  const avgPrice = product.revenue / product.count;
                  const isTopThree = index < 3;
                  return (
                    <tr 
                      key={product.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        isTopThree ? 'bg-gradient-to-r from-orange-50 to-yellow-50' : ''
                      }`}
                    >
                      <td className="py-3 px-2 md:px-4">
                        <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                          index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                          'bg-gradient-to-br from-gray-400 to-gray-500'
                        }`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </div>
                      </td>
                      <td className="py-3 px-2 md:px-4">
                        <p className="font-semibold text-gray-900 text-xs md:text-sm truncate max-w-[150px] md:max-w-none">
                          {product.name}
                        </p>
                      </td>
                      <td className="py-3 px-2 md:px-4 text-center">
                        <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          {product.count} units
                        </span>
                      </td>
                      <td className="py-3 px-2 md:px-4 text-right">
                        <p className="text-sm md:text-base font-bold text-green-600">${product.revenue.toFixed(2)}</p>
                      </td>
                      <td className="py-3 px-2 md:px-4 text-right">
                        <p className="text-xs md:text-sm text-gray-600">${avgPrice.toFixed(2)}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                  <td colSpan={2} className="py-3 px-2 md:px-4 text-xs md:text-sm text-gray-700">TOTAL</td>
                  <td className="py-3 px-2 md:px-4 text-center">
                    <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                      {stats.topProducts.reduce((sum, p) => sum + p.count, 0)} units
                    </span>
                  </td>
                  <td className="py-3 px-2 md:px-4 text-right">
                    <p className="text-sm md:text-base font-bold text-green-600">
                      ${stats.topProducts.reduce((sum, p) => sum + p.revenue, 0).toFixed(2)}
                    </p>
                  </td>
                  <td className="py-3 px-2 md:px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile Cards View (Alternative for very small screens) */}
          <div className="md:hidden mt-4 space-y-3">
            {stats.topProducts.map((product, index) => {
              const avgPrice = product.revenue / product.count;
              const isTopThree = index < 3;
              return (
                <div 
                  key={product.id}
                  className={`p-3 rounded-xl border-2 ${
                    isTopThree ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                        'bg-gradient-to-br from-gray-400 to-gray-500'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-blue-50 p-2 rounded-lg text-center">
                      <p className="text-blue-600 font-medium mb-1">Units</p>
                      <p className="font-bold text-blue-700">{product.count}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg text-center">
                      <p className="text-green-600 font-medium mb-1">Revenue</p>
                      <p className="font-bold text-green-700">${product.revenue.toFixed(0)}</p>
                    </div>
                    <div className="bg-purple-50 p-2 rounded-lg text-center">
                      <p className="text-purple-600 font-medium mb-1">Avg</p>
                      <p className="font-bold text-purple-700">${avgPrice.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Data Yet</h3>
          <p className="text-gray-600 mb-4">
            Product statistics will appear here once you have confirmed orders from Shopify.
          </p>
          <p className="text-sm text-gray-500">
            💡 Tip: Orders need to be <span className="font-semibold text-green-600">confirmed</span> to show in product statistics.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">WhatsApp Integration</h2>
              <p className="text-gray-600">Manage customer conversations</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">
            Connect with your customers through WhatsApp. Send and receive messages in real-time.
          </p>
          <a
            href="/chat"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-medium shadow-lg transition-all"
          >
            Go to Chat
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Shopify Orders</h2>
              <p className="text-gray-600">Track and manage orders</p>
            </div>
          </div>
          <p className="text-gray-700 mb-4">
            View all your Shopify orders, update statuses, and keep track of your sales.
          </p>
          <a
            href="/orders"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 font-medium shadow-lg transition-all"
          >
            View Orders
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Need Help Getting Started?</h2>
            <p className="text-primary-100 mb-6">
              Configure your integrations to start receiving messages and orders.
            </p>
            <a
              href="/settings"
              className="inline-flex items-center px-6 py-3 bg-white text-primary-600 rounded-xl hover:bg-gray-100 font-medium shadow-lg transition-all"
            >
              Go to Settings
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </a>
          </div>
          <div className="text-8xl opacity-20 hidden lg:block">⚙️</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
