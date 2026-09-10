import { PostModel } from '@/types/model.type';
import { Post } from '../models/post.model';
import { Types } from 'mongoose';

export class PostRepository {
    static async create(postData: Partial<PostModel>): Promise<PostModel> {
        const post = new Post(postData);
        await post.save();
        return post;
    }

    static async findById(postId: string): Promise<PostModel | null> {
        return await Post.findById(postId)
            .populate('author', 'username avatarUrl')
            .populate('comments.author', 'username avatarUrl');
    }

    static async findAll(limit = 10, skip = 0): Promise<PostModel[]> {
        return await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'username avatarUrl')
            .populate('comments.author', 'username avatarUrl');
    }

    static async update(postId: string, updateData: Partial<PostModel>): Promise<PostModel | null> {
        return await Post.findByIdAndUpdate(postId, { $set: updateData }, { new: true, runValidators: true })
            .populate('author', 'username avatarUrl')
            .populate('comments.author', 'username avatarUrl');
    }

    static async delete(postId: string): Promise<PostModel | null> {
        return await Post.findByIdAndDelete(postId);
    }

    static async addLike(postId: string, userId: string): Promise<PostModel | null> {
        return await Post.findByIdAndUpdate(
            postId,
            { $addToSet: { likes: new Types.ObjectId(userId) } },
            { new: true }
        );
    }

    static async removeLike(postId: string, userId: string): Promise<PostModel | null> {
        return await Post.findByIdAndUpdate(
            postId,
            { $pull: { likes: new Types.ObjectId(userId) } },
            { new: true }
        );
    }

    static async addComment(postId: string, commentData: { author: string; content: string }): Promise<PostModel | null> {
        return await Post.findByIdAndUpdate(
            postId,
            {
                $push: {
                    comments: {
                        author: new Types.ObjectId(commentData.author),
                        content: commentData.content,
                    },
                },
            },
            { new: true, runValidators: true }
        )
            .populate('author', 'username avatarUrl')
            .populate('comments.author', 'username avatarUrl');
    }

    static async removeComment(postId: string, commentId: string): Promise<PostModel | null> {
        return await Post.findByIdAndUpdate(
            postId,
            {
                $pull: {
                    comments: { _id: new Types.ObjectId(commentId) },
                },
            },
            { new: true }
        )
            .populate('author', 'username avatarUrl')
            .populate('comments.author', 'username avatarUrl');
    }

    static async findCommentById(commentId: string) {
        const post = await Post.findOne({ 'comments._id': commentId }, { 'comments.$': 1 });
        return post && post.comments.length > 0 ? post.comments[0] : null;
    }
}