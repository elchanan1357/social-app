import { describe, test, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/services/auth.service';
import { UserRepository } from '@/repo/user.repo';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mockUser, mockRegisterDto } from './mocks/userData';

vi.mock('@/repo/user.repo');
vi.mock('bcryptjs');

describe('AuthService Edge Cases Unit Tests (Vitest)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register edge cases', () => {
    test('should throw error if email already exists', async () => {
      vi.mocked(UserRepository.findByEmail).mockResolvedValue(mockUser as any);

      await expect(AuthService.register(mockRegisterDto)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    test('should propagate error if DB fails during creation', async () => {
      vi.mocked(UserRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(bcrypt.genSalt).mockResolvedValue('salt' as never);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as never);
      vi.mocked(UserRepository.create).mockRejectedValue(new Error('DB Connection Error'));

      await expect(AuthService.register(mockRegisterDto)).rejects.toThrow('DB Connection Error');
    });
  });

  describe('login edge cases', () => {
    test('should throw error if user email is not found', async () => {
      vi.mocked(UserRepository.findByEmailWithPassword).mockResolvedValue(null);

      await expect(AuthService.login('nonexistent@example.com', 'Password123!')).rejects.toThrow(
        'User not found'
      );
    });

    test('should throw error if password does not match', async () => {
      vi.mocked(UserRepository.findByEmailWithPassword).mockResolvedValue({
        ...mockUser,
        _id: { toString: () => mockUser._id },
      } as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(AuthService.login('test@example.com', 'WrongPassword')).rejects.toThrow(
        'Invalid email or password'
      );
    });
  });

  describe('refresh token edge cases', () => {
    test('should throw error if refresh token signature is invalid', async () => {
      await expect(AuthService.refresh('invalid.token.str')).rejects.toThrow();
    });

    test('should throw error if user in token payload does not exist', async () => {
      const validToken = jwt.sign({ userId: '60c722f2f1d2c80015f8e4a1', role: 'user' }, 'refresh_secret_key_456');
      vi.mocked(UserRepository.findById).mockResolvedValue(null);

      await expect(AuthService.refresh(validToken)).rejects.toThrow('User not found');
    });

    test('should throw error if refresh token is not found in user refreshTokens array', async () => {
      const validToken = jwt.sign({ userId: '60c722f2f1d2c80015f8e4a1', role: 'user' }, 'refresh_secret_key_456');
      vi.mocked(UserRepository.findById).mockResolvedValue({
        ...mockUser,
        _id: { toString: () => mockUser._id },
        refreshTokens: [{ token: 'different_token' }],
      } as any);

      await expect(AuthService.refresh(validToken)).rejects.toThrow('Invalid refresh token');
    });

    test('should return new accessToken if refresh token is valid and exists in DB', async () => {
      const validToken = jwt.sign({ userId: '60c722f2f1d2c80015f8e4a1', role: 'user' }, 'refresh_secret_key_456');
      vi.mocked(UserRepository.findById).mockResolvedValue({
        ...mockUser,
        _id: { toString: () => mockUser._id },
        refreshTokens: [{ token: validToken }],
      } as any);

      const result = await AuthService.refresh(validToken);

      expect(result).toHaveProperty('accessToken');
      expect(typeof result.accessToken).toBe('string');
    });
  });

  describe('logout edge cases', () => {
    test('should call UserRepository.removeRefreshToken with correct params', async () => {
      vi.mocked(UserRepository.removeRefreshToken).mockResolvedValue(true as any);

      await AuthService.logout('user_123', 'token_123');

      expect(UserRepository.removeRefreshToken).toHaveBeenCalledWith('user_123', 'token_123');
    });
  });
});