
import React, { useState, useEffect } from 'react';
import type { Project } from './types';
import NewProjectForm from './components/NewProjectForm';
import ProjectCard from './components/ProjectCard';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const savedProjects = localStorage.getItem('reno-ai-projects');
      return savedProjects ? JSON.parse(savedProjects) : [];
    } catch (error) {
      console.error("Could not parse projects from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('reno-ai-projects', JSON.stringify(projects));
  }, [projects]);

  const addProject = (project: Project) => {
    setProjects((prevProjects) => [project, ...prevProjects]);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
  };
  
  const deleteProject = (id: string) => {
    setProjects((prevProjects) => prevProjects.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      <header className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-green-500">
            Reno-AI Checklist
          </h1>
          <p className="text-center text-slate-500 dark:text-slate-400 mt-1">Your AI-powered renovation planner</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NewProjectForm onAddProject={addProject} />
        
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">My Projects</h2>
            {projects.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                    <ProjectCard 
                        key={project.id} 
                        project={project}
                        onUpdateProject={updateProject}
                        onDeleteProject={deleteProject}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">No projects yet!</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Use the form above to create your first renovation project.</p>
                </div>
            )}
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-slate-400 dark:text-slate-500">
        <p>Powered by Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;
