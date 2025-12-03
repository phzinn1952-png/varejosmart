import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import path from 'path';
import fs from 'fs';

export interface WhatsAppSession {
  tenantId: string;
  client: Client;
  status: 'disconnected' | 'connecting' | 'qr_pending' | 'authenticating' | 'connected';
  qrCode?: string;
  phoneNumber?: string;
  lastActivity: Date;
  authMethod?: 'qr' | 'phone';
}

export interface WhatsAppMessage {
  to: string;
  message: string;
  mediaUrl?: string;
}

class WhatsAppService {
  private sessions: Map<string, WhatsAppSession>;
  private sessionDir: string;

  constructor() {
    this.sessions = new Map();
    this.sessionDir = path.join(process.cwd(), '.wwebjs_auth');

    // Ensure session directory exists
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }
  }

  /**
   * Initialize WhatsApp client for a tenant
   */
  async initializeClient(tenantId: string): Promise<void> {
    // Check if client already exists
    if (this.sessions.has(tenantId)) {
      const session = this.sessions.get(tenantId)!;
      if (session.status === 'connected') {
        console.log(`✅ WhatsApp client already connected for tenant: ${tenantId}`);
        return;
      }
    }

    console.log(`🔄 Initializing WhatsApp client for tenant: ${tenantId}`);

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: tenantId,
        dataPath: this.sessionDir,
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      },
    });

    // Create session object
    const session: WhatsAppSession = {
      tenantId,
      client,
      status: 'connecting',
      lastActivity: new Date(),
    };

    this.sessions.set(tenantId, session);

    // Setup event listeners
    this.setupClientEvents(tenantId, client);

    // Initialize client
    await client.initialize();
  }

  /**
   * Setup WhatsApp client event listeners
   */
  private setupClientEvents(tenantId: string, client: Client): void {
    const session = this.sessions.get(tenantId)!;

    // QR Code generation
    client.on('qr', async (qr) => {
      console.log(`📱 QR Code generated for tenant: ${tenantId}`);

      // Generate QR code as data URL
      const qrDataUrl = await qrcode.toDataURL(qr);

      session.status = 'qr_pending';
      session.qrCode = qrDataUrl;
      session.authMethod = 'qr';
      session.lastActivity = new Date();

      console.log(`✅ QR Code ready for tenant: ${tenantId}`);
    });

    // Authentication
    client.on('authenticated', () => {
      console.log(`🔐 WhatsApp authenticated for tenant: ${tenantId}`);
      session.status = 'authenticating';
      session.lastActivity = new Date();
    });

    // Ready
    client.on('ready', async () => {
      console.log(`✅ WhatsApp client ready for tenant: ${tenantId}`);

      session.status = 'connected';
      session.qrCode = undefined; // Clear QR code
      session.lastActivity = new Date();

      // Get phone number
      const info = client.info;
      if (info) {
        session.phoneNumber = info.wid.user;
        console.log(`📞 Connected phone: ${session.phoneNumber}`);
      }
    });

    // Disconnected
    client.on('disconnected', (reason) => {
      console.log(`❌ WhatsApp disconnected for tenant: ${tenantId}`, reason);
      session.status = 'disconnected';
      session.qrCode = undefined;
      session.lastActivity = new Date();
    });

    // Authentication failure
    client.on('auth_failure', (msg) => {
      console.error(`❌ Authentication failed for tenant: ${tenantId}`, msg);
      session.status = 'disconnected';
      session.qrCode = undefined;
      session.lastActivity = new Date();
    });

    // Message received (for logging)
    client.on('message', async (message) => {
      console.log(`📨 Message received from ${message.from}: ${message.body}`);
      session.lastActivity = new Date();
    });
  }

  /**
   * Get QR Code for tenant
   */
  getQRCode(tenantId: string): string | null {
    const session = this.sessions.get(tenantId);
    return session?.qrCode || null;
  }

  /**
   * Get session status
   */
  getStatus(tenantId: string): WhatsAppSession['status'] {
    const session = this.sessions.get(tenantId);
    return session?.status || 'disconnected';
  }

  /**
   * Get session info
   */
  getSessionInfo(tenantId: string): Partial<WhatsAppSession> | null {
    const session = this.sessions.get(tenantId);
    if (!session) return null;

    return {
      tenantId: session.tenantId,
      status: session.status,
      qrCode: session.qrCode,
      phoneNumber: session.phoneNumber,
      lastActivity: session.lastActivity,
      authMethod: session.authMethod,
    };
  }

  /**
   * Send message
   */
  async sendMessage(tenantId: string, message: WhatsAppMessage): Promise<boolean> {
    const session = this.sessions.get(tenantId);

    if (!session || session.status !== 'connected') {
      throw new Error('WhatsApp not connected for this tenant');
    }

    try {
      // Format phone number
      let phoneNumber = message.to.replace(/\D/g, '');

      // Add country code if not present (Brazil = 55)
      if (!phoneNumber.startsWith('55')) {
        phoneNumber = '55' + phoneNumber;
      }

      const chatId = phoneNumber + '@c.us';

      // Send message
      await session.client.sendMessage(chatId, message.message);

      session.lastActivity = new Date();
      console.log(`✅ Message sent to ${phoneNumber}`);

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send message with media
   */
  async sendMediaMessage(
    tenantId: string,
    to: string,
    message: string,
    mediaUrl: string
  ): Promise<boolean> {
    const session = this.sessions.get(tenantId);

    if (!session || session.status !== 'connected') {
      throw new Error('WhatsApp not connected for this tenant');
    }

    try {
      let phoneNumber = to.replace(/\D/g, '');
      if (!phoneNumber.startsWith('55')) {
        phoneNumber = '55' + phoneNumber;
      }

      const chatId = phoneNumber + '@c.us';

      // TODO: Implement media download and send
      await session.client.sendMessage(chatId, message);

      session.lastActivity = new Date();
      return true;
    } catch (error) {
      console.error('Error sending media message:', error);
      throw error;
    }
  }

  /**
   * Disconnect WhatsApp client
   */
  async disconnect(tenantId: string): Promise<void> {
    const session = this.sessions.get(tenantId);

    if (!session) {
      console.log(`⚠️ No session found for tenant: ${tenantId}`);
      return;
    }

    try {
      await session.client.destroy();
      this.sessions.delete(tenantId);

      console.log(`✅ WhatsApp disconnected for tenant: ${tenantId}`);
    } catch (error) {
      console.error(`Error disconnecting WhatsApp for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Logout and delete session data
   */
  async logout(tenantId: string): Promise<void> {
    const session = this.sessions.get(tenantId);

    if (!session) {
      return;
    }

    try {
      await session.client.logout();
      await session.client.destroy();
      this.sessions.delete(tenantId);

      // Delete session files
      const sessionPath = path.join(this.sessionDir, `session-${tenantId}`);
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
      }

      console.log(`✅ WhatsApp logged out for tenant: ${tenantId}`);
    } catch (error) {
      console.error(`Error logging out WhatsApp for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Check if client is ready
   */
  isReady(tenantId: string): boolean {
    const session = this.sessions.get(tenantId);
    return session?.status === 'connected';
  }

  /**
   * Get all active sessions
   */
  getAllSessions(): Map<string, WhatsAppSession> {
    return this.sessions;
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();
