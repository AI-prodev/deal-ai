export interface IApp {
  _id: string;
  roles: string[];
  link: string;
  title: string;
  description?: string;
  isUnreleased?: boolean;
  isForced?: boolean;
  isFullIcon?: boolean;
  icon: string;
  gradient: string;
  installed?: boolean;
}
