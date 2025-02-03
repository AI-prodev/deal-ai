export type Language = {
  name: string;
  rtl?: boolean;
};
export type Cta = {
  name: string;
};

export const languages: Language[] = [
  { name: "Arabic", rtl: true },
  { name: "Danish" },
  { name: "Dutch" },
  { name: "English" },
  { name: "French" },
  { name: "German" },
  { name: "Greek" },
  { name: "Indonesian" },
  { name: "Italian" },
  { name: "Japanese" },
  { name: "Mandarin" },
  { name: "Portuguese" },
  { name: "Russian" },
  { name: "Spanish" },
];

export const ctaData: Cta[] = [
  { name: "Purchase" },
  { name: "Sign Up" },
  { name: "Schedule a Call" },
  { name: "Check Out" },
  { name: "Buy Your Ticket" },
  { name: "Reserve Your Seat" },
  { name: "Start Your Free Trial" },
  { name: "Call Us" },
];

export const emailTypeData: Cta[] = [
  { name: "Abandoned Cart Sequence" },
  { name: "News Broadcast" },
];
