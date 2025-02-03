export interface IPage {
  _id: string;
  user: string;
  project?: string;
  funnel?: string;
  funnelStep?: number;
  title: string;
  path: string;
  contentUrl?: string;
  extraHead?: string;
  extraBody?: string;
  thumbnailUrl?: string;
  versions?: [
    {
      _id: string;
      contentUrl?: string;
      jsonUrl?: string;
      thumbnailUrl?: string;
      extraHead?: string;
      extraBody?: string;
      updatedAt?: Date;
    },
  ];
  createdAt: string;
}
