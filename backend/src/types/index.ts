import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface SendMessageRequest {
  customerId: string;
  content: string;
  type: 'text' | 'image' | 'voice';
  imageUrl?: string;
  voiceUrl?: string;
  duration?: number;
}

export interface UpdateOrderStatusRequest {
  status: 'confirmed' | 'cancelled';
}

export interface UpdateSettingsRequest {
  n8nWebhookUrl?: string;
}

export interface IncomingMessagePayload {
  phoneNumber: string;
  content: string;
  type: 'text' | 'image' | 'voice';
  imageUrl?: string;
  voiceUrl?: string;
  duration?: number;
  userId: string;
  customerName?: string;
}

export interface ButtonResponsePayload {
  orderId: string;
  action: 'Confirm' | 'Cancel' | 'Support';
  phoneNumber: string;
  userId: string;
}

export interface ShopifyOrderPayload {
  orderId: string;
  orderNumber: string;
  total: number;
  status: string;
  customerPhone: string;
  customerName?: string;
  userId: string;
  items?: any;
}

export interface DashboardStats {
  totalOrders: number;
  confirmedOrders: number;
  cancelledOrders: number;
}

export interface ErrorResponse {
  error: string;
  code: string;
  timestamp: string;
  details?: any;
}
