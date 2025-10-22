import React, { useState } from 'react';
import type { Project, ProjectStatus } from '../types';
import ChecklistItem from './ChecklistItem';
import ImageModal from './ImageModal';
import ShareModal from './ShareModal';
import { compressImage } from '../services/imageService';
import { CalendarIcon, LinkIcon, TrashIcon, CameraIcon, ShareIcon } from './icons';

interface ProjectCardProps {
  project: Project;
  onUpdateProject: (updatedProject: Project) => void;
  onDeleteProject: (id: string) => void;
}

const statusStyles: Record<ProjectStatus, string> = {
    'Idea': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'In Progress': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    'Completed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdateProject, onDeleteProject }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const handleToggleItem = (itemId: string) => {
    const updatedChecklist = project.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onUpdateProject({ ...project, checklist: updatedChecklist });
  };

  const handleUpdateItem = (itemId: string, updates: { task: string; details?: string }) => {
    const updatedChecklist = project.checklist.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    onUpdateProject({ ...project, checklist: updatedChecklist });
  };
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as ProjectStatus;
    onUpdateProject({ ...project, status: newStatus });
  };

  const handlePhotoReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressedPhoto = await compressImage(e.target.files[0]);
        onUpdateProject({ ...project, photo: compressedPhoto });
      } catch (error) {
        console.error("Failed to replace and compress image:", error);
        // Optionally, show an error to the user
      }
    }
  };

  const completedCount = project.checklist.filter(item => item.completed).length;
  const totalCount = project.checklist.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const formatCurrency = (amount?: number): string => {
    if (amount === undefined || amount === null) {
      return 'N/A';
    }
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const actualCostColor = project.estimatedCost && project.actualCost && project.actualCost > project.estimatedCost
    ? 'text-rose-600 dark:text-rose-400'
    : 'text-emerald-600 dark:text-emerald-400';

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col">
        {project.photo && (
          <div className="relative group">
            <img 
              className="w-full h-48 object-cover cursor-pointer" 
              src={project.photo.thumbnail} 
              alt={project.title}
              onClick={() => setIsModalOpen(true)}
            />
            <label htmlFor={`replace-photo-${project.id}`} className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <CameraIcon className="w-8 h-8 text-white"/>
              <span className="sr-only">Replace Photo</span>
              <input 
                id={`replace-photo-${project.id}`} 
                type="file" 
                className="sr-only" 
                accept="image/*" 
                onChange={handlePhotoReplace}
              />
            </label>
          </div>
        )}
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex justify-between items-start">
              <div className="flex-1">
                  <div className="flex items-start justify-between">
                      <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 pr-2">{project.title}</h3>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusStyles[project.status]}`}>
                          {project.status}
                      </span>
                  </div>
                  <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      <CalendarIcon className="w-4 h-4 mr-2"/>
                      <span>Target Date: {new Date(project.date).toLocaleDateString()}</span>
                  </div>
              </div>
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
          
          {(project.estimatedCost || project.actualCost) && (
            <div className="mt-4 border-t border-zinc-200 dark:border-zinc-700 pt-4">
              <h4 className="font-semibold text-zinc-700 dark:text-zinc-200 mb-2">Budget</h4>
              <div className="flex justify-between items-center text-sm">
                  <div className="text-zinc-500 dark:text-zinc-400">
                      <span className="font-medium">Estimated:</span>
                      <span className="ml-2 font-semibold text-zinc-700 dark:text-zinc-200">{formatCurrency(project.estimatedCost)}</span>
                  </div>
                  <div className="text-zinc-500 dark:text-zinc-400">
                      <span className="font-medium">Actual:</span>
                      <span className={`ml-2 font-semibold ${actualCostColor}`}>{formatCurrency(project.actualCost)}</span>
                  </div>
              </div>
            </div>
          )}

          <div className="mt-4 border-t border-zinc-200 dark:border-zinc-700 pt-4 flex-grow flex flex-col">
            <h4 className="font-semibold text-zinc-700 dark:text-zinc-200 mb-2">Checklist</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 flex-grow">
              {project.checklist.length > 0 ? project.checklist.map((item) => (
                <ChecklistItem 
                    key={item.id} 
                    item={item} 
                    onToggle={handleToggleItem}
                    onUpdate={handleUpdateItem}
                />
              )) : <p className="text-sm text-zinc-500 dark:text-zinc-400">No checklist items yet.</p>}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
              <div>
                  <label htmlFor={`status-${project.id}`} className="sr-only">Change Status</label>
                  <select 
                      id={`status-${project.id}`}
                      value={project.status} 
                      onChange={handleStatusChange}
                      className="text-sm rounded-md border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 focus:ring-sky-500 focus:border-sky-500"
                  >
                      <option value="Idea">Idea</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                  </select>
              </div>
               <div className="flex items-center space-x-1">
                 <button 
                    onClick={() => setIsShareModalOpen(true)} 
                    className="text-zinc-400 hover:text-sky-500 transition-colors p-2 rounded-full hover:bg-sky-50 dark:hover:bg-sky-500/10" 
                    aria-label="Share project"
                  >
                    <ShareIcon className="w-5 h-5" />
                 </button>
                 <button 
                    onClick={() => onDeleteProject(project.id)} 
                    className="text-zinc-400 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-500/10" 
                    aria-label="Delete project"
                  >
                    <TrashIcon className="w-5 h-5" />
                 </button>
               </div>
          </div>
        </div>
      </div>
      {isModalOpen && project.photo && (
        <ImageModal imageUrl={project.photo.full} onClose={() => setIsModalOpen(false)} />
      )}
      {isShareModalOpen && (
        <ShareModal project={project} onClose={() => setIsShareModalOpen(false)} />
      )}
    </>
  );
};

export default ProjectCard;
