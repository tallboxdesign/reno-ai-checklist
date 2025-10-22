export interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  details?: string;
  reminder?: string;
}

export type ProjectStatus = 'Idea' | 'In Progress' | 'Completed';

export interface Project {
  id:string;
  title: string;
  date: string;
  photo?: {
    thumbnail: string; // For previews
    full: string;      // For modal view
  };
  inspirationLink?: string;
  checklist: ChecklistItem[];
  notes: string;
  status: ProjectStatus;
  estimatedCost?: number;
  actualCost?: number;
}