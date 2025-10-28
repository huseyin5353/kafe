import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinTenant')
  handleJoinTenant(client: Socket, tenantId: string) {
    client.join(`tenant:${tenantId}`);
    this.logger.log(`Client ${client.id} joined tenant: ${tenantId}`);
    return { event: 'joinedTenant', data: tenantId };
  }

  // Emit order updates to specific tenant
  emitOrderUpdate(tenantId: string, order: any) {
    this.server.to(`tenant:${tenantId}`).emit('orderUpdate', order);
  }

  // Emit new order notification
  emitNewOrder(tenantId: string, order: any) {
    this.server.to(`tenant:${tenantId}`).emit('newOrder', order);
  }

  // Emit order status change
  emitOrderStatusChange(tenantId: string, orderId: string, status: string) {
    this.server.to(`tenant:${tenantId}`).emit('orderStatusChange', { orderId, status });
  }
}
