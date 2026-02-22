export interface User {
  id: string;
  email: string;
  role?: string;
  shopifyDomain?: string;
  shopifyApiKey?: string;
  n8nWebhookUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  phoneNumber: string;
  name?: string;
  profileImage?: string;
  unreadCount: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  _count?: {
    messages: number;
    orders: number;
  };
}

export interface Message {
  id: string;
  customerId: string;
  content: string;
  type: 'text' | 'image';
  direction: 'incoming' | 'outgoing';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  imageUrl?: string;
  createdAt: string;
  customer?: Customer;
}

export interface Order {
  id: string;
  shopifyOrderId?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  items?: any;
  userId: string;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
}

export interface DashboardStats {
  totalOrders: number;
  confirmedOrders: number;
  cancelledOrders: number;
  pendingOrders?: number;
  totalRevenue?: number;
  topProducts?: Array<{
    id: string;
    name: string;
    count: number;
    revenue: number;
  }>;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}
