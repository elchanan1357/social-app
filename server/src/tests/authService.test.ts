import { describe, test, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/services/auth.service';
import { UserRepository } from '@/repo/user.repo';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mockUser, mockRegisterDto } from './mocks/userData';
import { sendOtpEmail } from '@/services/mail.service';
import { config } from '@/utils/config';

vi.mock('@/repo/user.repo');
vi.mock('@/services/mail.service');
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

  describe('forgotPassword', () => {
    test('should throw 404 if user does not exist', async () => {
      vi.mocked(UserRepository.findByEmail).mockResolvedValue(null);

      await expect(AuthService.forgotPassword('nobody@example.com')).rejects.toThrow(
        'This email is not registered'
      );

      expect(UserRepository.saveResetOtp).not.toHaveBeenCalled();
      expect(sendOtpEmail).not.toHaveBeenCalled();
    });

    test('should save hashed otp and send the plain otp by email', async () => {
      vi.mocked(UserRepository.findByEmail).mockResolvedValue({
        ...mockUser,
        id: mockUser._id,
      } as any);

      await AuthService.forgotPassword(mockUser.email);

      const [sentTo, sentOtp] = vi.mocked(sendOtpEmail).mock.calls[0];
      const [savedUserId, savedHash, savedExpiry] = vi.mocked(UserRepository.saveResetOtp).mock.calls[0];

      expect(sentTo).toBe(mockUser.email);
      expect(sentOtp).toMatch(/^\d{6}$/);
      expect(savedUserId).toBe(mockUser._id);
      expect(savedHash).not.toBe(sentOtp);
      expect(savedExpiry.getTime()).toBeGreaterThan(Date.now());
    });

    test('should propagate the error if sending the email fails', async () => {
      vi.mocked(UserRepository.findByEmail).mockResolvedValue({
        ...mockUser,
        id: mockUser._id,
      } as any);
      vi.mocked(sendOtpEmail).mockRejectedValueOnce(new Error('SMTP down'));

      await expect(AuthService.forgotPassword(mockUser.email)).rejects.toThrow('SMTP down');
    });
  });

});