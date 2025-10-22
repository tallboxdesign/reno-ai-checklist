
export interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  details?: string;
}

export type ProjectStatus = 'Idea' | 'In Progress' | 'Completed';

export interface Project {
  id: string;
  title: string;
  date: string;
  photo?: string; // base64 encoded image
  inspirationLink?: string;
  checklist: ChecklistItem[];
  notes: string;
  status: ProjectStatus;
}
