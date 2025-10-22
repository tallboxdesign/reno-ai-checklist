import type { ChecklistItem, Project } from '../types';

// Use a simple in-memory map to track scheduled timeouts
const scheduledNotifications = new Map<string, number>();

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.error('This browser does not support desktop notification.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

const showNotification = (item: ChecklistItem, projectTitle: string) => {
    navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(`Reno-AI Reminder: ${projectTitle}`, {
            body: item.task,
            icon: '/vite.svg', // Use app icon
            tag: item.id, // Use item id as tag to prevent duplicate notifications
            data: {
                url: window.location.origin // URL to open on click
            }
        });
    });
};

export const scheduleNotification = (item: ChecklistItem, project: Project) => {
  // First, cancel any existing notification for this item to prevent duplicates
  cancelNotification(item.id);

  if (!item.reminder) {
    return;
  }
  
  const reminderTime = new Date(item.reminder).getTime();
  const now = Date.now();
  const delay = reminderTime - now;

  // Only schedule if the reminder is in the future
  if (delay > 0) {
    const timeoutId = window.setTimeout(() => {
      showNotification(item, project.title);
      scheduledNotifications.delete(item.id); // Clean up after showing
    }, delay);
    
    scheduledNotifications.set(item.id, timeoutId);
  }
};

export const cancelNotification = (itemId: string) => {
  if (scheduledNotifications.has(itemId)) {
    const timeoutId = scheduledNotifications.get(itemId);
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    scheduledNotifications.delete(itemId);
  }
};
