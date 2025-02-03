export interface IPhoneExtension {
  title: string;
  number: string;
}

export interface IPhoneNumber {
  _id: string;
  user: string;
  title: string;
  number: string;
  numberFormatted: string;
  extensions: IPhoneExtension[];
  record: boolean;
  isGreetingAudio: boolean;
  greetingAudio?: string;
  greetingText?: string;
  createdAt: string;
}
