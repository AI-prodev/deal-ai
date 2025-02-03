export interface ICreateBlogPost {
  title: string;
  author: string;
  content: string;
  heroImage: string;
}

export interface IUpdateBlogPost {
  postId: string;
  formData: FormData;
}

export interface IBlogPost extends ICreateBlogPost {
  _id: string;
  slug: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}
