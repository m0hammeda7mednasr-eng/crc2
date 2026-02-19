import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';

interface UserDetails {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  subscription?: {
    planName: string;
    status: string;
    startDate: string;
    endDate?: string;
    maxCustomers: number;
    maxMessages: number;
    maxOrders: number;
    usedCustomers: number;
    usedMessages: number;
    usedOrders: number;
  };
  customers: Array<{
    id: string;
    name?: string;
    phoneNumber: string;
    createdAt: string;
    _count: {
      messages: number;
      orders: number;
    };
  }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  _count: {
    customers: number;
    orders: number;
  };
}

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'orders' | 'subscription'>('overview');

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const response = await api.get(`/api/admin/users/${id}`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      alert('Failed to load user details');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">User not found</p>
      </div>
    );
  }

  const getUsagePercentage = (used: number, max: number) => {
    return max > 0 ? (used / max) * 100 : 0;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-primary-600 hover:text-primary-700 mb-4 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Users</span>
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{user.email}</h1>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                  {user.subscription && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanBadgeColor(user.subscription.planName)}`}>
                      {user.subscription.planName.toUpperCase()}
                    </span>
                  )}
                  <span className="text-gray-500 text-sm">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate(`/admin/users/${id}/edit`)}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium shadow-lg transition-all"
          >
            Edit User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{user._count.customers}</p>
            <p className="text-blue-100">Total Customers</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{user._count.orders}</p>
            <p className="text-green-100">Total Orders</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">
              ${user.orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
            </p>
            <p className="text-purple-100">Total Revenue</p>
          </div>
        </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'customers', label: 'Customers', icon: '👥' },
              { id: 'orders', label: 'Orders', icon: '📦' },
              { id: 'subscription', label: 'Subscription', icon: '💳' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Role</p>
                    <p className="font-medium text-gray-900">{user.role}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Member Since</p>
                    <p className="font-medium text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">User ID</p>
                    <p className="font-mono text-sm text-gray-900">{user.id}</p>
                  </div>
                </div>
              </div>

              {user.subscription && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Usage Overview</h3>
                  <div className="space-y-4">
                    {/* Customers Usage */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Customers</span>
                        <span className="text-sm text-gray-600">
                          {user.subscription.usedCustomers} / {user.subscription.maxCustomers}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${getUsageColor(
                            getUsagePercentage(user.subscription.usedCustomers, user.subscription.maxCustomers)
                          )}`}
                          style={{
                            width: `${getUsagePercentage(user.subscription.usedCustomers, user.subscription.maxCustomers)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Messages Usage */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Messages</span>
                        <span className="text-sm text-gray-600">
                          {user.subscription.usedMessages} / {user.subscription.maxMessages}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${getUsageColor(
                            getUsagePercentage(user.subscription.usedMessages, user.subscription.maxMessages)
                          )}`}
                          style={{
                            width: `${getUsagePercentage(user.subscription.usedMessages, user.subscription.maxMessages)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Orders Usage */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Orders</span>
                        <span className="text-sm text-gray-600">
                          {user.subscription.usedOrders} / {user.subscription.maxOrders}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${getUsageColor(
                            getUsagePercentage(user.subscription.usedOrders, user.subscription.maxOrders)
                          )}`}
                          style={{
                            width: `${getUsagePercentage(user.subscription.usedOrders, user.subscription.maxOrders)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Customers ({user.customers.length})</h3>
              {user.customers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No customers yet</p>
              ) : (
                <div className="space-y-3">
                  {user.customers.map((customer) => (
                    <div key={customer.id} className="p-4 border border-gray-200 rounded-xl hover:border-primary-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{customer.name || customer.phoneNumber}</p>
                          <p className="text-sm text-gray-600">{customer.phoneNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{customer._count.messages} messages</p>
                          <p className="text-sm text-gray-600">{customer._count.orders} orders</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Orders ({user.orders.length})</h3>
              {user.orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {user.orders.map((order) => (
                    <div key={order.id} className="p-4 border border-gray-200 rounded-xl hover:border-primary-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">${order.total.toFixed(2)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Subscription Details</h3>
              {!user.subscription ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No active subscription</p>
                  <button className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium">
                    Assign Plan
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Plan</p>
                      <p className="font-bold text-xl text-gray-900">{user.subscription.planName.toUpperCase()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        user.subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.subscription.status}
                      </span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">Start Date</p>
                      <p className="font-medium text-gray-900">{new Date(user.subscription.startDate).toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-1">End Date</p>
                      <p className="font-medium text-gray-900">
                        {user.subscription.endDate ? new Date(user.subscription.endDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border-2 border-primary-200">
                    <h4 className="font-bold text-gray-900 mb-4">Plan Limits</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary-600">{user.subscription.maxCustomers}</p>
                        <p className="text-sm text-gray-600 mt-1">Customers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary-600">{user.subscription.maxMessages}</p>
                        <p className="text-sm text-gray-600 mt-1">Messages</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary-600">{user.subscription.maxOrders}</p>
                        <p className="text-sm text-gray-600 mt-1">Orders</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium">
                      Change Plan
                    </button>
                    <button className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium">
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUserDetails;
