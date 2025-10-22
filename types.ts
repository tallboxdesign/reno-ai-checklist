
export interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  details?: string;
}

export interface Project {
  id: string;
  title: string;
  date: string;
  photo?: string; // base64 encoded image
  inspirationLink?: string;
  checklist: ChecklistItem[];
  notes: string;
}
