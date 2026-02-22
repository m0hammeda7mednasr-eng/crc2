import { useState, useEffect } from 'react';
import api from '../services/api';
import socketService from '../services/socket';
import { Order } from '../types';
import useIsMobile from '../hooks/useIsMobile';

type OrderStatus = 'all' | 'pending' | 'confirmed' | 'cancelled';

const Orders = () => {
  const isMobile = useIsMobile();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();

    socketService.on('order:update', (updatedOrder: Order) => {
      setOrders((prev) =>
        prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
      );
    });

    return () => {
      socketService.off('order:update');
    };
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders', {
        params: { status: statusFilter !== 'all' ? statusFilter : undefined },
      });
      setOrders(response.data.orders);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Authentication error - user may need to re-login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status });
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getOrderStats = () => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  const stats = getOrderStats();

  const tabs: { id: OrderStatus; label: string; icon: string; count: number }[] = [
    { id: 'all', label: 'All Orders', icon: '📦', count: stats.all },
    { id: 'pending', label: 'Pending', icon: '⏳', count: stats.pending },
    { id: 'confirmed', label: 'Confirmed', icon: '✅', count: stats.confirmed },
    { id: 'cancelled', label: 'Cancelled', icon: '❌', count: stats.cancelled },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 md:space-y-6 max-w-7xl mx-auto ${isMobile ? 'px-0' : ''}`}>
      {/* Header */}
      <div className={isMobile ? 'px-4' : ''}>
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">Orders</h1>
        <p className="text-sm md:text-base text-gray-600">Manage and track all your orders from Shopify</p>
      </div>

      {/* Tabs */}
      <div className={`bg-white ${isMobile ? 'rounded-none' : 'rounded-2xl'} shadow-lg border-y md:border border-gray-200 p-2`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`relative px-3 md:px-4 py-3 rounded-xl font-medium transition-all ${
                statusFilter === tab.id
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="text-xl md:text-2xl">{tab.icon}</span>
                <span className="text-xs md:text-base">{tab.label}</span>
                <span className={`text-xs font-bold ${
                  statusFilter === tab.id ? 'text-white' : 'text-primary-600'
                }`}>
                  {tab.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className={`bg-white ${isMobile ? 'rounded-none' : 'rounded-2xl'} shadow-lg p-8 md:p-12 text-center border-y md:border border-gray-200 ${isMobile ? 'mx-0' : ''}`}>
          <div className="w-20 md:w-24 h-20 md:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <svg className="w-10 md:w-12 h-10 md:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {statusFilter === 'all' ? 'No orders yet' : `No ${statusFilter} orders`}
          </h3>
          <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
            {statusFilter === 'all' 
              ? 'Orders will appear here once they\'re synced from Shopify' 
              : `You don't have any ${statusFilter} orders at the moment`}
          </p>
          {statusFilter === 'all' && (
            <a
              href="/settings"
              className="inline-flex items-center px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-medium transition-all shadow-lg text-sm md:text-base"
            >
              <svg className="w-4 md:w-5 h-4 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configure Shopify Integration
            </a>
          )}
        </div>
      ) : (
        <div className={`grid grid-cols-1 gap-3 md:gap-4 ${isMobile ? 'px-0' : ''}`}>
          {filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className={`bg-white ${isMobile ? 'rounded-none border-y' : 'rounded-xl border'} shadow-md border-gray-200 hover:shadow-lg transition-all overflow-hidden`}
            >
              <div className="p-3 md:p-4">
                <div className="flex items-center justify-between gap-3">
                  {/* Order Info - Compact */}
                  <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                    <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-base md:text-lg shadow flex-shrink-0">
                      📦
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-0.5">
                        <h3 className="text-sm md:text-base font-bold text-gray-900">#{order.orderNumber}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                          {order.status === 'pending' && '⏳'}
                          {order.status === 'confirmed' && '✅'}
                          {order.status === 'cancelled' && '❌'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{order.customerName}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg md:text-xl font-bold text-primary-600">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Actions - Only show for pending orders */}
                  {order.status === 'pending' && (
                    <div className="flex gap-1 md:gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(order.id, 'confirmed');
                        }}
                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        title="Confirm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(order.id, 'cancelled');
                        }}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="Cancel"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Order Details Button */}
              <button
                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                className="w-full px-3 md:px-4 py-2 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2 text-gray-600 text-xs md:text-sm font-medium border-t border-gray-200"
              >
                <span>{selectedOrder?.id === order.id ? 'Hide' : 'Show'} Details</span>
                <svg 
                  className={`w-3 md:w-4 h-3 md:h-4 transition-transform ${selectedOrder?.id === order.id ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Expanded Details */}
              {selectedOrder?.id === order.id && (
                <div className="px-3 md:px-4 py-3 bg-gray-50 border-t border-gray-200 animate-fade-in">
                  <h4 className="font-bold text-gray-900 mb-2 text-xs md:text-sm">Customer Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-lg">
                      <p className="text-gray-500 font-medium mb-1">Phone</p>
                      <p className="text-gray-900 font-semibold">{order.customerPhone}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg">
                      <p className="text-gray-500 font-medium mb-1">Order Date</p>
                      <p className="text-gray-900 font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
