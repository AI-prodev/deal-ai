export interface IProposal {
  _id: string;
  user: string;
  businessName: string;
  businessWebsite: string;
  pdfFile?: string;
  docFile?: string;
  createdAt: string;
}
