import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { authenticateSocket } from '../middleware/auth.middleware';

// Extend Socket type to include userId
interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export class SocketManager {
  private io: SocketIOServer;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.initialize();
  }

  /**
   * Initialize Socket.io server
   */
  private initialize() {
    // Authentication middleware
    this.io.use(authenticateSocket);

    // Connection handler
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User connected: ${socket.userId}`);

      // Join user-specific room
      if (socket.userId) {
        socket.join(socket.userId);
      }

      // Disconnect handler
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
      });
    });
  }

  /**
   * Broadcast event to specific account
   */
  broadcastToAccount(userId: string, event: string, data: any) {
    this.io.to(userId).emit(event, data);
  }

  /**
   * Get Socket.io instance
   */
  getIO(): SocketIOServer {
    return this.io;
  }
}
