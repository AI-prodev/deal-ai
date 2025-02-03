import { Schema, Document } from "mongoose"

export interface IModerationEvent extends Document {
  user: Schema.Types.ObjectId;
  input: string;
  flags: Schema.Types.Mixed;
}
