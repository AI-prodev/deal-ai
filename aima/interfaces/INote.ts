export interface INote {
  title: string;
  contentType: string; // 'description' or 'checklist'
  description: string | null;
  checkList: {
    todoItems: string[];
    doneItems: string[];
  };
  bgColor?: string;
  remind?: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    status: string; // 'planned' or 'reminding' or 'passed'
  };
  shareId: string;
  shareMode: string; // 'public' or 'private'
  status: string; // 'active' or 'archived' or 'deleted'
  password?: string;
}
