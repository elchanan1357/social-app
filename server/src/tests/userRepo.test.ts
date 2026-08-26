import { describe, test, expect, vi, beforeEach } from 'vitest';
import { UserRepository } from '@/repo/user.repo';
import { User } from '@/models/user.model';
import { mockUser } from './mocks/userData';

vi.mock('@/models/user.model');

describe('UserRepository Unit Tests (Vitest)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByEmail', () => {
    test('should return user if found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(mockUser as any);

      const result = await UserRepository.findByEmail('test@example.com');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toEqual(mockUser);
    });

    test('should return null if user is not found', async () => {
      vi.mocked(User.findOne).mockResolvedValue(null);

      const result = await UserRepository.findByEmail('notfound@example.com');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'notfound@example.com' });
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    test('should return user by id', async () => {
      vi.mocked(User.findById).mockResolvedValue(mockUser as any);

      const result = await UserRepository.findById('60c722f2f1d2c80015f8e4a1');

      expect(User.findById).toHaveBeenCalledWith('60c722f2f1d2c80015f8e4a1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmailWithPassword', () => {
    test('should query user with passwordHash select included', async () => {
      const mockSelect = vi.fn().mockResolvedValue(mockUser);
      vi.mocked(User.findOne).mockReturnValue({ select: mockSelect } as any);

      const result = await UserRepository.findByEmailWithPassword('test@example.com');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockSelect).toHaveBeenCalledWith('+passwordHash');
      expect(result).toEqual(mockUser);
    });
  });

  describe('addRefreshToken', () => {
    test('should execute updateOne with correct $push query', async () => {
      vi.mocked(User.updateOne).mockResolvedValue({ acknowledged: true, modifiedCount: 1 } as any);

      await UserRepository.addRefreshToken('user_id_123', 'mock_refresh_token');

      expect(User.updateOne).toHaveBeenCalledWith(
        { _id: 'user_id_123' },
        expect.objectContaining({
          $push: expect.objectContaining({
            refreshTokens: expect.objectContaining({
              token: 'mock_refresh_token',
            }),
          }),
        })
      );
    });
  });

  describe('removeRefreshToken', () => {
    test('should execute findByIdAndUpdate with correct $pull query', async () => {
      vi.mocked(User.findByIdAndUpdate).mockResolvedValue(mockUser as any);

      await UserRepository.removeRefreshToken('user_id_123', 'mock_refresh_token');

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user_id_123',
        { $pull: { refreshTokens: { token: 'mock_refresh_token' } } },
        { new: true }
      );
    });
  });
});