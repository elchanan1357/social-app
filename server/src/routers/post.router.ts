import { Router } from 'express';
import { authTokenMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createPostSchema, updatePostSchema } from '@/validations/post.validation';
import { PostController } from '@/controllers/post.controllers';

const router = Router();

router.get('/', PostController.getAllPosts);
router.get('/:id', PostController.getPostById);

router.use(authTokenMiddleware);

router.post('/', validate(createPostSchema), PostController.createPost);
router.patch('/:id', validate(updatePostSchema), PostController.updatePost);
router.delete('/:id', PostController.deletePost);
router.patch('/:id/like', PostController.toggleLike);
router.post('/:id/comments', PostController.addComment);
router.delete('/:id/comments/:commentId', PostController.deleteComment);

export default router;