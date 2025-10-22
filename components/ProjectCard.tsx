
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
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      {project.photo && (
        <img className="w-full h-48 object-cover" src={project.photo} alt={project.title} />
      )}
      <div className="p-6">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{project.title}</h3>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <CalendarIcon className="w-4 h-4 mr-2"/>
                    <span>Target Date: {new Date(project.date).toLocaleDateString()}</span>
                </div>
            </div>
            <button onClick={() => onDeleteProject(project.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                <TrashIcon className="w-6 h-6" />
            </button>
        </div>

        {project.inspirationLink && (
          <a href={project.inspirationLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            <LinkIcon className="w-4 h-4 mr-2"/>
            Inspiration Link
          </a>
        )}

        <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Progress</span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{completedCount} / {totalCount}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
        </div>

        <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
          <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Checklist</h4>
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
