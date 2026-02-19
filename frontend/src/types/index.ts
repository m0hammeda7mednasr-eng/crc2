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
  userId: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  _count?: {
    messages: number;
  };
}

export interface Message {
  id: string;
  customerId: string;
  content: string;
  type: 'text' | 'image';
  direction: 'incoming' | 'outgoing';
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
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}
