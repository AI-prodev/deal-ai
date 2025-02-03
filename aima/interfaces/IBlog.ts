import { IBlogPost } from "./IBlogPost";
import { IDomain } from "./IDomain";

export interface ICreateBlog {
  title: string;
  logoImage?: string;
  domain?: string | null;
  subdomain?: string;
  posts?: string[];
}

export interface IUpdateBlog extends ICreateBlog {
  _id: string;
}

export interface IUpdateBlogLog {
  blogId: string;
  formData: FormData;
}

export interface IBlog extends ICreateBlog {
  _id: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBlogDetail extends Omit<IBlog, "domain" | "posts"> {
  domain?: IDomain;
  posts?: IBlogPost[];
}
export interface IBlogWithPost extends Omit<IBlog, "posts"> {
  posts: IBlogPost[];
}
