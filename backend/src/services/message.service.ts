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
    socketManager?: SocketManager,
    voiceUrl?: string,
    duration?: number
  ) {
    const message = await prisma.message.create({
      data: {
        customerId,
        content,
        type,
        direction,
        status: direction === 'outgoing' ? 'sent' : 'delivered', // Set initial status
        imageUrl,
        voiceUrl,
        duration,
      },
      include: {
        customer: true,
      },
    });

    // Update customer's updatedAt for sorting
    await prisma.customer.update({
      where: { id: customerId },
      data: { updatedAt: new Date() },
    });

    // Increment unread count for incoming messages
    if (direction === 'incoming' && message.customer) {
      await CustomerService.incrementUnreadCount(customerId, socketManager);
    }

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
   * Update message status (sent, delivered, read)
   */
  static async updateMessageStatus(
    messageId: string,
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed',
    socketManager?: SocketManager
  ) {
    const message = await prisma.message.update({
      where: { id: messageId },
      data: { status },
      include: {
        customer: true,
      },
    });

    // Broadcast status update via WebSocket
    if (socketManager && message.customer) {
      socketManager.broadcastToAccount(message.customer.userId, 'message:status', {
        messageId,
        status,
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
    imageUrl?: string,
    voiceUrl?: string,
    duration?: number
  ) {
    try {
      const payload = {
        phoneNumber,
        content,
        type,
        imageUrl,
        voiceUrl,
        duration,
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
    try {
      // In production, upload to cloud storage (S3, Cloudinary, etc.)
      // For now, return local path
      const imageUrl = `/uploads/${file.filename}`;
      
      console.log(`✅ Image uploaded successfully: ${imageUrl}`);
      
      return imageUrl;
    } catch (error: any) {
      console.error('Image upload error:', error);
      throw new Error(`Failed to handle image upload: ${error.message}`);
    }
  }

  /**
   * Validate image file
   */
  static validateImageFile(file: Express.Multer.File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit.');
    }

    console.log(`✅ Image validated: ${file.originalname} (${file.mimetype}, ${(file.size / 1024).toFixed(2)}KB)`);

    return true;
  }

  /**
   * Handle voice upload
   */
  static async handleVoiceUpload(file: Express.Multer.File): Promise<string> {
    try {
      // In production, upload to cloud storage (S3, Cloudinary, etc.)
      // For now, return local path
      const voiceUrl = `/uploads/${file.filename}`;
      
      console.log(`✅ Voice message uploaded successfully: ${voiceUrl}`);
      
      return voiceUrl;
    } catch (error: any) {
      console.error('Voice upload error:', error);
      throw new Error(`Failed to handle voice upload: ${error.message}`);
    }
  }

  /**
   * Validate voice file
   */
  static validateVoiceFile(file: Express.Multer.File): boolean {
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/webm'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only MP3, OGG, WAV, and WebM are allowed.');
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit.');
    }

    console.log(`✅ Voice validated: ${file.originalname} (${file.mimetype}, ${(file.size / 1024).toFixed(2)}KB)`);

    return true;
  }
}
