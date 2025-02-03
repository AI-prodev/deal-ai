import { IPage } from "@/interfaces/IPage";
import { FunnelType } from "@/enums/funnel-type.enum";

interface FunnelSettings {
  tone: string;
  toneAdditionalInfo: string;
  aggressiveness: number;
  hookCreative: number;
  targetAudience: string;
}

interface FunnelPrompt {
  input: {
    businessName: string;
    businessDescription: string;
  };
  magic: string[];
  benefitStack: Array<{ a: string; n: string }>;
  faq: Array<{ a: string; q: string }>;
  hero: Array<{ prompt: string; url: string }>;
  bonus: Array<{ b: string; r: string }>;
}

export interface IFunnel {
  _id: string;
  user: string;
  project: {
    _id: string;
    title: string;
  };
  domain?: {
    _id: string;
    domain: string;
  };
  webhooks: string[];
  title: string;
  numSteps: number;
  settings: FunnelSettings;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  faviconUrl?: string;
  prompt?: FunnelPrompt;
  menu?: IPage[];
  type?: FunnelType;
}
