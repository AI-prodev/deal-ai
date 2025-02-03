export type AcademyVideo = {
  title: string;
  slug: string;
  vimeoId: string;
  descriptionHTML: string;
  thumbnail: string;
};

export type AcademyCourse = {
  title: string;
  slug: string;
  videos: AcademyVideo[];
};

export type AcademyLiveCall = {
  title: string;
  slug: string;
  startTime: string;
  endTime: string;
  icsStartTime: string;
  icsEndTime: string;
  meetingLink?: string;
  descriptionHTML: string;
  thumbnail?: string;
  recurGoogle?: string;
  recurIcs?: string;
};
