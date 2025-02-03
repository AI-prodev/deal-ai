import { Schema, Document } from "mongoose"

export interface IApp extends Document {
  roles: string[],
  link: string,
  title: string,
  description: string,
  isUnreleased: boolean,
  isForced: boolean,
  isDefault: boolean,
  ordering: number,
  icon: string,
  isFullIcon: boolean,
  gradient: string
}
