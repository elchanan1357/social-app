import { IComment, PostModel } from '@/types/model.type';
import { Schema, model, Document, Types } from 'mongoose';

const commentSchema = new Schema<IComment>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const postSchema = new Schema<PostModel>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: {
      type: [commentSchema],
      validate: [
        {
          validator: function (val: IComment[]) {
            return val.length <= 500;
          },
          message: 'Cannot exceed the limit of 500 comments per post.',
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

export const Post = model<PostModel>('Post', postSchema);