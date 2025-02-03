import { AcademyCourse, AcademyLiveCall } from "@/utils/data/courses";

export interface IAcademy {
  _id: string;
  title: string;
  slug: string;
  courses: AcademyCourse[];
  liveCalls: AcademyLiveCall[];
  createdAt: string;
}
