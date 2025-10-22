import React from 'react';
import type { Project, ChecklistItem as ChecklistItemType } from '../types';
import ChecklistItem from './ChecklistItem';
import { CalendarIcon, LinkIcon, TrashIcon } from './icons';

interface ProjectCardProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
  onDeleteProject: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdateProject, onDeleteProject }) => {
  const handleToggleItem = (itemId: string) => {
    const updatedChecklist = project.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onUpdateProject({ ...project, checklist: updatedChecklist });
  };
  
  const completedCount = project.checklist.filter(item => item.completed).length;
  const totalCount = project.checklist.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
      {project.photo && (
        <img className="w-full h-48 object-cover" src={project.photo} alt={project.title} />
      )}
      <div className="p-6">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{project.title}</h3>
                <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    <CalendarIcon className="w-4 h-4 mr-2"/>
                    <span>Target Date: {new Date(project.date).toLocaleDateString()}</span>
                </div>
            </div>
            <button onClick={() => onDeleteProject(project.id)} className="text-zinc-400 hover:text-rose-500 transition-colors">
                <TrashIcon className="w-6 h-6" />
            </button>
        </div>

        {project.inspirationLink && (
          <a href={project.inspirationLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center text-sm text-sky-600 dark:text-sky-400 hover:underline">
            <LinkIcon className="w-4 h-4 mr-2"/>
            Inspiration Link
          </a>
        )}

        <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Progress</span>
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{completedCount} / {totalCount}</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
        </div>

        <div className="mt-4 border-t border-zinc-200 dark:border-zinc-700 pt-4">
          <h4 className="font-semibold text-zinc-700 dark:text-zinc-200 mb-2">Checklist</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {project.checklist.map((item) => (
              <ChecklistItem key={item.id} item={item} onToggle={handleToggleItem} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectCard;