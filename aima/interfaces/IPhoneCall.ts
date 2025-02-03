import { IPhoneNumber } from "./IPhoneNumber";

export interface IPhoneCall {
  _id: string;
  user: string;
  phoneNumber: IPhoneNumber;
  from: string;
  fromFormatted: string;
  to: string;
  toFormatted: string;
  duration?: number; // seconds
  startTime: Date;
  endTime?: Date;
  recordingFile?: string;
}
