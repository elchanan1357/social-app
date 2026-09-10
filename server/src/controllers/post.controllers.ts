import { Request, Response, NextFunction } from 'express';
import { PostService } from '../services/post.service';
import { AuthRequest } from '@/types/auto.type';

export class PostController {
  static createPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const post = await PostService.createPost(userId, req.body);

      res.status(201).json({ status: 'success', data: post });
    } catch (error) {
      next(error);
    }
  };

  static getPostById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const post = await PostService.getPostById(id);
      res.status(200).json({ status: 'success', data: post });
    } catch (error) {
      next(error);
    }
  };

  static getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

      const posts = await PostService.getAllPosts(limit, skip);
      res.status(200).json({ status: 'success', results: posts.length, data: posts });
    } catch (error) {
      next(error);
    }
  };

  static updatePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const post = await PostService.updatePost(id, userId, req.body);
      res.status(200).json({ status: 'success', data: post });
    } catch (error) {
      next(error);
    }
  };

  static deletePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      await PostService.deletePost(id, userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  static toggleLike = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const post = await PostService.toggleLike(id, userId);
      res.status(200).json({ status: 'success', data: post });
    } catch (error) {
      next(error);
    }
  };

  static addComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;
      const { content } = req.body;
      const post = await PostService.addComment(id, userId, content);
      res.status(201).json({ status: 'success', data: post });
    } catch (error) {
      next(error);
    }
  };

  static deleteComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const commentId = req.params.commentId as string;
      const userId = req.user!.userId;
      const post = await PostService.deleteComment(id, commentId, userId);
      res.status(200).json({ status: 'success', data: post });
    } catch (error) {
      next(error);
    }
  };
}