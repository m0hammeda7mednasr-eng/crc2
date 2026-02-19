import prisma from '../utils/prisma';
import axios from 'axios';
import { CustomerService } from './customer.service';
import { SocketManager } from '../utils/socket.manager';

export class MessageService {
  /**
   * Create a new message
   */
  static async createMessage(
    customerId: string,
    content: string,
    type: string,
    direction: string,
    imageUrl?: string,
    socketManager?: SocketManager
  ) {
    const message = await prisma.message.create({
      data: {
        customerId,
        content,
        type,
        direction,
        imageUrl,
      },
      include: {
        customer: true,
      },
    });

    // Broadcast new message to account via WebSocket
    if (socketManager && message.customer) {
      socketManager.broadcastToAccount(message.customer.userId, 'message:new', {
        message,
        customerId: message.customerId,
      });
    }

    return message;
  }

  /**
   * Get messages for a customer with account validation
   */
  static async getMessagesByCustomer(customerId: string, userId: string) {
    // Validate customer belongs to user
    const isValid = await CustomerService.validateAccountOwnership(customerId, userId);

    if (!isValid) {
      throw new Error('Unauthorized access to customer messages');
    }

    const messages = await prisma.message.findMany({
      where: { customerId },
      orderBy: { createdAt: 'asc' },
      include: {
        customer: {
          select: {
            id: true,
            phoneNumber: true,
            name: true,
          },
        },
      },
    });

    return messages;
  }

  /**
   * Send message to n8n webhook
   */
  static async sendToN8n(
    webhookUrl: string,
    phoneNumber: string,
    content: string,
    type: string,
    imageUrl?: string
  ) {
    try {
      const payload = {
        phoneNumber,
        content,
        type,
        imageUrl,
        timestamp: new Date().toISOString(),
      };

      const response = await axios.post(webhookUrl, payload, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to send message to n8n: ${error.message}`);
    }
  }

  /**
   * Handle image upload
   */
  static async handleImageUpload(file: Express.Multer.File): Promise<string> {
    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For now, return local path
    const imageUrl = `/uploads/${file.filename}`;
    return imageUrl;
  }

  /**
   * Validate image file
   */
  static validateImageFile(file: Express.Multer.File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit.');
    }

    return true;
  }
}
