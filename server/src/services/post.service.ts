import { PostRepository } from '@/repo/post.repo';
import { PostModel } from '@/types/model.type';
import { AppError } from '@/utils/appError';
import { CreatePostInput, UpdatePostInput } from '@/validations/post.validation';

export class PostService {
  static async createPost(userId: string, input: CreatePostInput): Promise<PostModel> {
    return await PostRepository.create({
      author: userId as any,
      content: input.content,
      imageUrl: input.imageUrl || null,
    });
  }

  static async getPostById(postId: string): Promise<PostModel> {
    const post = await PostRepository.findById(postId);
    if (!post) {
      throw new AppError('Post not found', 404);
    }
    return post;
  }

  static async getAllPosts(limit?: number, skip?: number): Promise<PostModel[]> {
    return await PostRepository.findAll(limit, skip);
  }

  static async updatePost(postId: string, userId: string, input: UpdatePostInput): Promise<PostModel> {
    const post = await this.getPostById(postId);

    if (post.author.toString() !== userId)
      throw new AppError('Unauthorized: You can only update your own posts', 403);

    const updatedPost = await PostRepository.update(postId, input);
    if (!updatedPost)
      throw new AppError('Failed to update post', 500);

    return updatedPost;
  }

  static async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.getPostById(postId);

    if (post.author.toString() !== userId)
      throw new AppError('Unauthorized: You can only delete your own posts', 403);

    await PostRepository.delete(postId);
  }

  static async toggleLike(postId: string, userId: string): Promise<PostModel> {
    const post = await this.getPostById(postId);
    const hasLiked = post.likes.some((id) => id.toString() === userId);

    const updatedPost = hasLiked
      ? await PostRepository.removeLike(postId, userId)
      : await PostRepository.addLike(postId, userId);

    if (!updatedPost)
      throw new AppError('Failed to update post likes', 500);

    return updatedPost;
  }

  static async addComment(postId: string, userId: string, content: string): Promise<PostModel> {
    if (!content || content.trim().length === 0)
      throw new AppError('Comment content cannot be empty', 400);

    await this.getPostById(postId);

    const updatedPost = await PostRepository.addComment(postId, {
      author: userId,
      content,
    });

    if (!updatedPost)
      throw new AppError('Failed to add comment', 500);

    return updatedPost;
  }

  static async deleteComment(postId: string, commentId: string, userId: string): Promise<PostModel> {
    const post = await this.getPostById(postId);

    const comment = post.comments.find((c) => c._id?.toString() === commentId);
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    const isCommentAuthor = comment.author.toString() === userId || comment.author._id?.toString() === userId;
    const isPostAuthor = post.author.toString() === userId || post.author._id?.toString() === userId;

    if (!isCommentAuthor && !isPostAuthor) {
      throw new AppError('Unauthorized: You can only delete your own comment or comments on your post', 403);
    }

    const updatedPost = await PostRepository.removeComment(postId, commentId);
    if (!updatedPost) {
      throw new AppError('Failed to delete comment', 500);
    }
    return updatedPost;
  }
}