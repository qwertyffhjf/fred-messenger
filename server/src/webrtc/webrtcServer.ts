import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { logger } from '../utils/logger';

interface CallSession {
  id: string;
  initiator: string;
  participants: string[];
  type: 'audio' | 'video';
  startTime: Date;
  isActive: boolean;
}

interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-request' | 'call-accept' | 'call-reject' | 'call-end';
  from: string;
  to: string;
  data?: any;
  callId?: string;
}

class WebRTCServer {
  private wss: WebSocketServer;
  private connections: Map<string, WebSocket> = new Map();
  private callSessions: Map<string, CallSession> = new Map();
  private userCalls: Map<string, string> = new Map(); // userId -> callId

  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketHandlers();
    logger.info('🎥 WebRTC server initialized');
  }

  private setupWebSocketHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, request) => {
      const userId = this.extractUserIdFromRequest(request);
      if (!userId) {
        ws.close(1008, 'Unauthorized');
        return;
      }

      this.connections.set(userId, ws);
      logger.info(`🔌 WebRTC connection established for user: ${userId}`);

      ws.on('message', (data: Buffer) => {
        try {
          const signal: WebRTCSignal = JSON.parse(data.toString());
          this.handleSignal(userId, signal);
        } catch (error) {
          logger.error('Failed to parse WebRTC signal:', error);
        }
      });

      ws.on('close', () => {
        this.handleUserDisconnect(userId);
      });

      ws.on('error', (error) => {
        logger.error(`WebRTC connection error for user ${userId}:`, error);
        this.handleUserDisconnect(userId);
      });
    });
  }

  private extractUserIdFromRequest(request: any): string | null {
    // Extract user ID from query parameters or headers
    const url = new URL(request.url, `http://${request.headers.host}`);
    return url.searchParams.get('userId');
  }

  private handleSignal(userId: string, signal: WebRTCSignal): void {
    try {
      switch (signal.type) {
        case 'call-request':
          this.handleCallRequest(userId, signal);
          break;
        case 'call-accept':
          this.handleCallAccept(userId, signal);
          break;
        case 'call-reject':
          this.handleCallReject(userId, signal);
          break;
        case 'call-end':
          this.handleCallEnd(userId, signal);
          break;
        case 'offer':
        case 'answer':
        case 'ice-candidate':
          this.forwardSignal(userId, signal);
          break;
        default:
          logger.warn(`Unknown signal type: ${signal.type}`);
      }
    } catch (error) {
      logger.error(`Error handling signal from user ${userId}:`, error);
    }
  }

  private handleCallRequest(userId: string, signal: WebRTCSignal): void {
    const callId = crypto.randomUUID();
    const callSession: CallSession = {
      id: callId,
      initiator: userId,
      participants: [userId, signal.to],
      type: signal.data?.type || 'audio',
      startTime: new Date(),
      isActive: true
    };

    this.callSessions.set(callId, callSession);
    this.userCalls.set(userId, callId);
    this.userCalls.set(signal.to, callId);

    // Send call request to recipient
    this.sendToUser(signal.to, {
      type: 'call-request',
      from: userId,
      to: signal.to,
      callId,
      data: signal.data
    });

    logger.info(`📞 Call request initiated: ${callId} (${signal.data?.type || 'audio'})`);
  }

  private handleCallAccept(userId: string, signal: WebRTCSignal): void {
    const callId = signal.callId;
    if (!callId) return;

    const callSession = this.callSessions.get(callId);
    if (!callSession || !callSession.isActive) return;

    // Notify initiator that call was accepted
    this.sendToUser(callSession.initiator, {
      type: 'call-accept',
      from: userId,
      to: callSession.initiator,
      callId
    });

    logger.info(`✅ Call accepted: ${callId}`);
  }

  private handleCallReject(userId: string, signal: WebRTCSignal): void {
    const callId = signal.callId;
    if (!callId) return;

    const callSession = this.callSessions.get(callId);
    if (!callSession) return;

    // Notify initiator that call was rejected
    this.sendToUser(callSession.initiator, {
      type: 'call-reject',
      from: userId,
      to: callSession.initiator,
      callId
    });

    this.endCall(callId);
    logger.info(`❌ Call rejected: ${callId}`);
  }

  private handleCallEnd(userId: string, signal: WebRTCSignal): void {
    const callId = signal.callId;
    if (!callId) return;

    this.endCall(callId);
    logger.info(`📴 Call ended: ${callId}`);
  }

  private forwardSignal(userId: string, signal: WebRTCSignal): void {
    // Forward WebRTC signals between participants
    const targetUserId = signal.to;
    this.sendToUser(targetUserId, signal);
  }

  private sendToUser(userId: string, data: any): void {
    const connection = this.connections.get(userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      try {
        connection.send(JSON.stringify(data));
      } catch (error) {
        logger.error(`Failed to send data to user ${userId}:`, error);
      }
    } else {
      logger.warn(`User ${userId} is not connected`);
    }
  }

  private endCall(callId: string): void {
    const callSession = this.callSessions.get(callId);
    if (!callSession) return;

    // Notify all participants that call ended
    callSession.participants.forEach(participantId => {
      this.sendToUser(participantId, {
        type: 'call-end',
        callId,
        from: 'system'
      });
      this.userCalls.delete(participantId);
    });

    callSession.isActive = false;
    this.callSessions.delete(callId);
  }

  private handleUserDisconnect(userId: string): void {
    this.connections.delete(userId);
    
    // End any active calls for this user
    const callId = this.userCalls.get(userId);
    if (callId) {
      this.endCall(callId);
    }

    logger.info(`🔌 WebRTC connection closed for user: ${userId}`);
  }

  public getActiveCalls(): CallSession[] {
    return Array.from(this.callSessions.values()).filter(call => call.isActive);
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.connections.keys());
  }
}

export function setupWebRTC(server: HttpServer): void {
  new WebRTCServer(server);
}
