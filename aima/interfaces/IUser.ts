export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  lastLoginDate?: Date;
  lastLoginIpAddress?: string;
  roles?: string[];
  status?: string;
  rateLimit?: IRateLimit;
  expiryDate?: Date;
  createdAt?: Date;
}
export interface IRateLimit {
  userId: string;
  exceededCount: number;
  currentUsage: number;
  remaining: number;
  lastExceeded?: Date;
  lastUsageDate?: Date;
  totalTokensUsed: number;
  lastTimeTotalTokensUsage: Date;
}
export interface IUserRoleOption {
  value: string;
  label: string;
}
export type OptionType = {
  label: string;
  value: string;
};
