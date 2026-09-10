import { Document, Types } from "mongoose";

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface UserModel extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  age?: number;
  picture?: string;
  bio?: string;
  isActive: boolean;
  role: UserRole;
  refreshTokens: { token: string; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  _id?: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PostModel extends Document {
  author: Types.ObjectId;
  content: string;
  imageUrl?: string | null;
  likes: Types.ObjectId[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}