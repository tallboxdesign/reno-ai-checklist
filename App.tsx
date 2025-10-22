import React, { useState, useEffect } from 'react';
import type { Project } from './types';
import NewProjectForm from './components/NewProjectForm';
import ProjectCard from './components/ProjectCard';
import { getProjects, saveProject, deleteProjectDB } from './services/dbService';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load projects from IndexedDB on initial mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const savedProjects = await getProjects();
        setProjects(savedProjects);
      } catch (error) {
        console.error("Could not load projects from IndexedDB", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, []);

  const addProject = (project: Project) => {
    setProjects((prevProjects) => [project, ...prevProjects]);
    saveProject(project).catch(error => {
        console.error("Could not save new project to IndexedDB", error);
        // Optionally, implement rollback logic here
    });
  };

  const updateProject = (updatedProject: Project) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
    saveProject(updatedProject).catch(error => {
        console.error("Could not update project in IndexedDB", error);
    });
  };
  
  const deleteProject = (id: string) => {
    setProjects((prevProjects) => prevProjects.filter((p) => p.id !== id));
    deleteProjectDB(id).catch(error => {
        console.error("Could not delete project from IndexedDB", error);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">
                Reno-AI Checklist
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-emerald-500">
            Reno-AI Checklist
          </h1>
          <p className="text-center text-zinc-500 dark:text-zinc-400 mt-1">Your AI-powered renovation planner</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NewProjectForm onAddProject={addProject} />
        
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-6">My Projects</h2>
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
                <div className="text-center py-16 px-6 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700">
                    <h3 className="text-xl font-semibold text-zinc-700 dark:text-zinc-200">No projects yet!</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">Use the form above to create your first renovation project.</p>
                </div>
            )}
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-zinc-400 dark:text-zinc-500">
        <p>Powered by Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;
