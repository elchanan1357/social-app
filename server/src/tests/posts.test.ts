import { describe, test, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '@/app';
import { PostRepository } from '@/repo/post.repo';
import jwt from 'jsonwebtoken';
import { config } from '@/utils/config';
import { mockUser, mockPost, mockComment, mockOtherUser } from './mocks/userData';
import { UserRole } from '@/types/model.type';

vi.mock('@/repo/post.repo');

describe('Posts Module E2E & Edge-Case Tests', () => {
  const authorId = mockUser._id;
  const otherUserId = mockOtherUser._id;
  const postId = mockPost._id;
  const commentId = mockComment._id;

  let validAccessToken: string;
  let otherUserAccessToken: string;

  beforeEach(() => {
    vi.clearAllMocks();

    validAccessToken = jwt.sign(
      { userId: authorId, role: UserRole.USER },
      config.jwtSecret
    );
    otherUserAccessToken = jwt.sign(
      { userId: otherUserId, role: UserRole.USER },
      config.jwtSecret
    );
  });

  // POST /api/posts
  describe('POST /api/posts', () => {
    test('Should create post with text content only', async () => {
      const newPost = { content: mockPost.content };
      vi.mocked(PostRepository.create).mockResolvedValue({
        ...mockPost,
        imageUrl: undefined,
      } as any);

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .send(newPost);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('_id', postId);
      expect(res.body.data.content).toBe(mockPost.content);
    });

    test('Should create post with image URL only', async () => {
      const newPost = { imageUrl: mockPost.imageUrl };
      vi.mocked(PostRepository.create).mockResolvedValue({
        ...mockPost,
        content: undefined,
      } as any);

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .send(newPost);

      expect(res.status).toBe(201);
      expect(res.body.data.imageUrl).toBe(mockPost.imageUrl);
    });

    test('Should return 400 when body is empty (neither text nor image)', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    test('Should return 400 when image URL has invalid format', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .send({ imageUrl: 'invalid-url' });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].message).toBe('Invalid image URL format');
    });

    test('Should return 400 when content exceeds 2000 characters', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${validAccessToken}`)
        .send({ content: 'a'.repeat(2001) });

      expect(res.status).toBe(400);
    });

    test('Should return 401 when Authorization header is missing', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({ content: 'Unauthenticated post' });

      expect(res.status).toBe(401);
    });
  });

  // PATCH /api/posts/:id
  describe('PATCH /api/posts/:id', () => {
    test('Should allow author to update content', async () => {
      vi.mocked(PostRepository.findById).mockResolvedValue({
        ...mockPost,
        author: { toString: () => authorId },
      } as any);

      vi.mocked(PostRepository.update).mockResolvedValue({
        ...mockPost,
        content: 'Updated content',
      } as any);

      const res = await request(app)
        .patch(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${validAccessToken}`)
        .send({ content: 'Updated content' });

      expect(res.status).toBe(200);
      expect(res.body.data.content).toBe('Updated content');
    });

    test('Should return 403 when user tries to update another user post', async () => {
      vi.mocked(PostRepository.findById).mockResolvedValue({
        ...mockPost,
        author: { toString: () => authorId },
      } as any);

      const res = await request(app)
        .patch(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${otherUserAccessToken}`)
        .send({ content: 'Hacked content' });

      expect(res.status).toBe(403);
    });

    test('Should return 404 if post does not exist', async () => {
      vi.mocked(PostRepository.findById).mockResolvedValue(null);

      const res = await request(app)
        .patch(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${validAccessToken}`)
        .send({ content: 'Update missing' });

      expect(res.status).toBe(404);
    });
  });

  // DELETE /api/posts/:id
  describe('DELETE /api/posts/:id', () => {
    test('Should allow author to delete their post', async () => {
      vi.mocked(PostRepository.findById).mockResolvedValue({
        ...mockPost,
        author: { toString: () => authorId },
      } as any);

      vi.mocked(PostRepository.delete).mockResolvedValue(true as any);

      const res = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${validAccessToken}`);

      expect(res.status).toBe(204);
    });

    test('Should return 403 when trying to delete someone else post', async () => {
      vi.mocked(PostRepository.findById).mockResolvedValue({
        ...mockPost,
        author: { toString: () => authorId },
      } as any);

      const res = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${otherUserAccessToken}`);

      expect(res.status).toBe(403);
    });
  });

  // POST /api/posts/:id/like
  describe('POST /api/posts/:id/like', () => {
    test('Should add like if user has not liked yet', async () => {
      vi.mocked(PostRepository.findById).mockResolvedValue({
        ...mockPost,
        likes: [],
      } as any);

      vi.mocked(PostRepository.addLike).mockResolvedValue({
        ...mockPost,
        likes: [authorId],
      } as any);

      const res = await request(app)
        .patch(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${validAccessToken}`);

      expect(res.status).toBe(200);
    });

    test('Should remove like if user already liked the post', async () => {
      vi.mocked(PostRepository.findById).mockResolvedValue({
        ...mockPost,
        likes: [authorId],
      } as any);

      vi.mocked(PostRepository.removeLike).mockResolvedValue({
        ...mockPost,
        likes: [],
      } as any);

      const res = await request(app)
        .patch(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${validAccessToken}`);

      expect(res.status).toBe(200);
    });
  });

  // POST & DELETE /api/posts/:id/comments
  describe('POST & DELETE /api/posts/:id/comments', () => {
    describe('POST /api/posts/:id/comments', () => {
      test('Should add a comment successfully to a post', async () => {
        vi.mocked(PostRepository.findById).mockResolvedValue(mockPost as any);
        vi.mocked(PostRepository.addComment).mockResolvedValue({
          ...mockPost,
          comments: [...mockPost.comments, { ...mockComment, content: 'New comment' }],
        } as any);

        const res = await request(app)
          .post(`/api/posts/${postId}/comments`)
          .set('Authorization', `Bearer ${validAccessToken}`)
          .send({ content: 'New comment' });

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('success');
      });

      test('Should return 400 when comment content is empty', async () => {
        const res = await request(app)
          .post(`/api/posts/${postId}/comments`)
          .set('Authorization', `Bearer ${validAccessToken}`)
          .send({ content: '' });

        expect(res.status).toBe(400);
      });
    });

    describe('DELETE /api/posts/:id/comments/:commentId', () => {
      test('Should allow comment author to delete their comment', async () => {
        vi.mocked(PostRepository.findCommentById).mockResolvedValue({
          ...mockComment,
          author: { toString: () => authorId },
        } as any);

        vi.mocked(PostRepository.removeComment).mockResolvedValue({
          ...mockPost,
          comments: [],
        } as any);

        const res = await request(app)
          .delete(`/api/posts/${postId}/comments/${commentId}`)
          .set('Authorization', `Bearer ${validAccessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
      });

      test('Should return 403 when user tries to delete someone else comment', async () => {
        vi.mocked(PostRepository.findCommentById).mockResolvedValue({
          ...mockComment,
          author: { toString: () => authorId },
        } as any);

        const res = await request(app)
          .delete(`/api/posts/${postId}/comments/${commentId}`)
          .set('Authorization', `Bearer ${otherUserAccessToken}`);

        expect(res.status).toBe(403);
      });

      test('Should return 404 if comment to delete is not found', async () => {
        vi.mocked(PostRepository.findCommentById).mockResolvedValue(null);

        const res = await request(app)
          .delete(`/api/posts/${postId}/comments/non_existing_comment_id`)
          .set('Authorization', `Bearer ${validAccessToken}`);

        expect(res.status).toBe(404);
      });
    });
  });
});