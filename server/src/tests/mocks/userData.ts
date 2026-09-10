import { TokenPayload, } from '@/types/auto.type';
import { UserRole } from '@/types/model.type';
import { vi } from 'vitest';

export const mockUser = {
  _id: '60c722f2f1d2c80015f8e4a1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  passwordHash: '$2a$10$hashedpassword1234567890',
  role: UserRole.USER,
  refreshTokens: [],
  save: vi.fn(),
};

export const mockRegisterDto = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'Password123!',
};

export const mockTokenPayload: TokenPayload = {
  userId: '60c722f2f1d2c80015f8e4a1',
  role: UserRole.USER,
};

export const mockOtherUser = {
  _id: '60c722f2f1d2c80015f8e4a2',
  firstName: 'Other',
  lastName: 'User',
  email: 'other@example.com',
  role: UserRole.USER,
};

export const mockComment = {
  _id: '60c722f2f1d2c80015f8e4c1',
  author: mockUser._id,
  content: 'This is a test comment',
  createdAt: new Date(),
};

export const mockPost = {
  _id: '60c722f2f1d2c80015f8e4p1',
  author: mockUser._id,
  content: 'This is a test post content',
  imageUrl: 'https://example.com/image.png',
  likes: [],
  comments: [mockComment],
  createdAt: new Date(),
  updatedAt: new Date(),
};