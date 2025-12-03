import express, { Request, Response } from 'express';
import cors from 'cors';
import { whatsappService } from './services/whatsappService.js';

const app = express();
const PORT = process.env.WHATSAPP_PORT || 3004;

// Middleware
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000', 'http://localhost:3003', 'http://192.168.100.59:3003', 'http://192.168.100.59:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'WhatsApp API' });
});

/**
 * Initialize WhatsApp connection for a tenant
 * POST /api/whatsapp/init/:tenantId
 */
app.post('/api/whatsapp/init/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;

    await whatsappService.initializeClient(tenantId);

    res.json({
      success: true,
      message: 'WhatsApp client initialized',
      status: whatsappService.getStatus(tenantId),
    });
  } catch (error: any) {
    console.error('Error initializing WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initialize WhatsApp',
    });
  }
});

/**
 * Get QR Code for authentication
 * GET /api/whatsapp/qr/:tenantId
 */
app.get('/api/whatsapp/qr/:tenantId', (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;

    const qrCode = whatsappService.getQRCode(tenantId);
    const status = whatsappService.getStatus(tenantId);

    if (!qrCode && status !== 'qr_pending') {
      return res.status(404).json({
        success: false,
        error: 'QR Code not available',
        status,
      });
    }

    res.json({
      success: true,
      qrCode,
      status,
    });
  } catch (error: any) {
    console.error('Error getting QR code:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get QR code',
    });
  }
});

/**
 * Get connection status
 * GET /api/whatsapp/status/:tenantId
 */
app.get('/api/whatsapp/status/:tenantId', (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;

    const sessionInfo = whatsappService.getSessionInfo(tenantId);

    if (!sessionInfo) {
      return res.json({
        success: true,
        status: 'disconnected',
        connected: false,
      });
    }

    res.json({
      success: true,
      ...sessionInfo,
      connected: sessionInfo.status === 'connected',
    });
  } catch (error: any) {
    console.error('Error getting status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get status',
    });
  }
});

/**
 * Send message
 * POST /api/whatsapp/send/:tenantId
 */
app.post('/api/whatsapp/send/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { to, message, mediaUrl } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: 'Phone number and message are required',
      });
    }

    if (mediaUrl) {
      await whatsappService.sendMediaMessage(tenantId, to, message, mediaUrl);
    } else {
      await whatsappService.sendMessage(tenantId, { to, message });
    }

    res.json({
      success: true,
      message: 'Message sent successfully',
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send message',
    });
  }
});

/**
 * Disconnect WhatsApp
 * POST /api/whatsapp/disconnect/:tenantId
 */
app.post('/api/whatsapp/disconnect/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;

    await whatsappService.disconnect(tenantId);

    res.json({
      success: true,
      message: 'WhatsApp disconnected successfully',
    });
  } catch (error: any) {
    console.error('Error disconnecting WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to disconnect WhatsApp',
    });
  }
});

/**
 * Logout and delete session
 * POST /api/whatsapp/logout/:tenantId
 */
app.post('/api/whatsapp/logout/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;

    await whatsappService.logout(tenantId);

    res.json({
      success: true,
      message: 'WhatsApp logged out successfully',
    });
  } catch (error: any) {
    console.error('Error logging out WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to logout WhatsApp',
    });
  }
});

/**
 * Get all active sessions (admin only)
 * GET /api/whatsapp/sessions
 */
app.get('/api/whatsapp/sessions', (req: Request, res: Response) => {
  try {
    const sessions = whatsappService.getAllSessions();
    const sessionList = Array.from(sessions.values()).map((session) => ({
      tenantId: session.tenantId,
      status: session.status,
      phoneNumber: session.phoneNumber,
      lastActivity: session.lastActivity,
      authMethod: session.authMethod,
    }));

    res.json({
      success: true,
      sessions: sessionList,
      count: sessionList.length,
    });
  } catch (error: any) {
    console.error('Error getting sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get sessions',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp API Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down WhatsApp API Server...');

  // Disconnect all sessions
  const sessions = whatsappService.getAllSessions();
  for (const [tenantId] of sessions) {
    try {
      await whatsappService.disconnect(tenantId);
    } catch (error) {
      console.error(`Error disconnecting ${tenantId}:`, error);
    }
  }

  process.exit(0);
});

export default app;
