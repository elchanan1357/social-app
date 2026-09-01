import { describe, test, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@/app';
import { UserRepository } from '@/repo/user.repo';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '@/utils/config';
import { mockUser, mockRegisterDto } from './mocks/userData';

vi.mock('@/repo/user.repo');
vi.mock('bcryptjs');

describe('Auth End-to-End Flow Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        test('should register user, return accessToken, and set refreshToken cookie', async () => {
            vi.mocked(UserRepository.findByEmail).mockResolvedValue(null);
            vi.mocked(bcrypt.genSalt).mockResolvedValue('salt' as never);
            vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as never);
            vi.mocked(UserRepository.create).mockResolvedValue({
                ...mockUser,
                _id: { toString: () => mockUser._id },
            } as any);
            vi.mocked(UserRepository.addRefreshToken).mockResolvedValue(undefined as any);

            const res = await request(app)
                .post('/api/auth/register')
                .send(mockRegisterDto);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body.user).toHaveProperty('email', mockRegisterDto.email);

            const cookies = res.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies[0]).toContain('refreshToken=');
            expect(cookies[0]).toContain('HttpOnly');
        });

        test('should return 400 when user already exists', async () => {
            vi.mocked(UserRepository.findByEmail).mockResolvedValue(mockUser as any);

            const res = await request(app)
                .post('/api/auth/register')
                .send(mockRegisterDto);

            expect(res.status).toBe(400);
        });
        test('should return 400 when body fails Zod validation', async () => {
            const invalidDto = {
                firstName: 'A',
                email: 'not-an-email',
                password: '123',
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(invalidDto);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Validation failed');
            expect(res.body.errors).toBeInstanceOf(Array);
            expect(res.body.errors.length).toBeGreaterThan(0);
        });

        test('should register user successfully when body is valid', async () => {
            vi.mocked(UserRepository.findByEmail).mockResolvedValue(null);
            vi.mocked(bcrypt.genSalt).mockResolvedValue('salt' as never);
            vi.mocked(bcrypt.hash).mockResolvedValue('hashed_password' as never);
            vi.mocked(UserRepository.create).mockResolvedValue({
                ...mockUser,
                _id: { toString: () => mockUser._id },
            } as any);
            vi.mocked(UserRepository.addRefreshToken).mockResolvedValue(undefined as any);

            const res = await request(app)
                .post('/api/auth/register')
                .send(mockRegisterDto);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('accessToken');
        });
    });
});

describe('POST /api/auth/login', () => {
    test('should log in successfully with correct credentials', async () => {
        vi.mocked(UserRepository.findByEmailWithPassword).mockResolvedValue({
            ...mockUser,
            _id: { toString: () => mockUser._id },
        } as any);
        vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
        vi.mocked(UserRepository.addRefreshToken).mockResolvedValue(undefined as any);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: mockUser.email,
                password: 'Password123!',
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body.message).toBe('User logged in successfully');
        expect(res.headers['set-cookie']).toBeDefined();
    });

    test('should return 400 with invalid credentials', async () => {
        vi.mocked(UserRepository.findByEmailWithPassword).mockResolvedValue(null);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'wrong@example.com',
                password: 'wrongpassword',
            });

        expect(res.status).toBe(400);
    });

    test('should return 400 when login body fails Zod validation', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bad-email', password: '' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message', 'Validation failed');
        expect(res.body.errors).toBeInstanceOf(Array);
    });
});

describe('POST /api/auth/refresh', () => {
    test('should return 401 when refreshToken cookie is missing', async () => {
        const res = await request(app).post('/api/auth/refresh');

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', 'Refresh token required');
    });

    test('should issue new accessToken when valid refreshToken is sent in cookie', async () => {
        const validRefreshToken = jwt.sign(
            { userId: mockUser._id, role: 'user' },
            config.jwtRefreshSecret
        );

        vi.mocked(UserRepository.findById).mockResolvedValue({
            ...mockUser,
            _id: { toString: () => mockUser._id },
            refreshTokens: [{ token: validRefreshToken }],
        } as any);

        const res = await request(app)
            .post('/api/auth/refresh')
            .set('Cookie', [`refreshToken=${validRefreshToken}`]);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('accessToken');
    });
});

describe('POST /api/auth/logout', () => {
    test('should return 401 when Access Token is missing in Authorization header', async () => {
        const res = await request(app).post('/api/auth/logout');

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('message', 'Access token required');
    });

    test('should logout successfully when valid token and cookie are provided', async () => {
        const validAccessToken = jwt.sign(
            { userId: mockUser._id, role: 'user' },
            config.jwtSecret
        );
        const validRefreshToken = 'mock_refresh_token';

        vi.mocked(UserRepository.removeRefreshToken).mockResolvedValue(undefined as any);

        const res = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${validAccessToken}`)
            .set('Cookie', [`refreshToken=${validRefreshToken}`]);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'User logged out successfully');
    });
});
