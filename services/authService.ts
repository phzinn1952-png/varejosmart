import bcrypt from 'bcryptjs';
import { TenantRepository } from '../db/repositories/index.js';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string;
  mustChangePassword: boolean;
}

export interface LoginResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export class AuthService {
  private tenantRepo: TenantRepository;

  constructor() {
    this.tenantRepo = new TenantRepository();
  }

  /**
   * Authenticate user with email and password
   * @param email - User email
   * @param password - Plain text password
   * @returns LoginResult with user data or error
   */
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      // Check for master admin
      if (email === 'master@varejo.com' && password === '123456') {
        return {
          success: true,
          user: {
            id: 'master',
            name: 'Master Admin',
            email: 'master@varejo.com',
            role: 'Master',
            tenantId: 'master',
            mustChangePassword: false,
          },
        };
      }

      // Check tenant (owner/manager)
      const tenant = this.tenantRepo.verifyPassword(email, password);

      if (tenant) {
        return {
          success: true,
          user: {
            id: tenant.id,
            name: tenant.owner_name,
            email: tenant.email,
            role: 'Gerente',
            tenantId: tenant.id,
            mustChangePassword: Boolean(tenant.must_change_password),
          },
        };
      }

      return {
        success: false,
        error: 'Credenciais inválidas',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Erro ao realizar login',
      };
    }
  }

  /**
   * Change user password
   * @param userId - User ID
   * @param currentPassword - Current password
   * @param newPassword - New password
   * @returns Success boolean
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate new password
      if (newPassword.length < 6) {
        return {
          success: false,
          error: 'A senha deve ter no mínimo 6 caracteres',
        };
      }

      const tenant = this.tenantRepo.findById(userId);

      if (!tenant) {
        return {
          success: false,
          error: 'Usuário não encontrado',
        };
      }

      // Verify current password
      const isValid = bcrypt.compareSync(currentPassword, tenant.password_hash);

      if (!isValid) {
        return {
          success: false,
          error: 'Senha atual incorreta',
        };
      }

      // Update password
      this.tenantRepo.updatePassword(userId, newPassword);

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: 'Erro ao alterar senha',
      };
    }
  }

  /**
   * Reset user password (admin action)
   * @param userId - User ID to reset
   * @returns Temporary password
   */
  async resetPassword(userId: string): Promise<{ success: boolean; tempPassword?: string; error?: string }> {
    try {
      const tempPassword = this.tenantRepo.resetPassword(userId);

      return {
        success: true,
        tempPassword,
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: 'Erro ao resetar senha',
      };
    }
  }

  /**
   * Validate session token (placeholder for future JWT implementation)
   * @param token - Session token
   * @returns AuthUser or null
   */
  async validateSession(token: string): Promise<AuthUser | null> {
    // TODO: Implement JWT validation
    return null;
  }
}
