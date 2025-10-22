import type { Project } from '../types';

const DB_NAME = 'RenoAIDB';
const STORE_NAME = 'projects'; // Renamed for clarity
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Use 'id' as the keyPath to store each project as a separate object.
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveProject = async (project: Project): Promise<void> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  store.put(project); // 'put' will add or update the project based on its 'id'.
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const deleteProjectDB = async (id: string): Promise<void> => {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id);
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
};

export const getProjects = async (): Promise<Project[]> => {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  // getAll retrieves all records in the store.
  const request = store.getAll();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
        // Sort by date descending to show newest first
        const sortedProjects = request.result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(sortedProjects || []);
    };
    request.onerror = () => reject(request.error);
  });
};
