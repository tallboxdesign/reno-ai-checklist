import React, { useState, useEffect, useRef } from 'react';
import type { ChecklistItem as ChecklistItemType } from '../types';

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: { task: string; details?: string }) => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onToggle, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [task, setTask] = useState(item.task);
  const [details, setDetails] = useState(item.details || '');
  const taskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      taskInputRef.current?.focus();
      taskInputRef.current?.select();
    }
  }, [isEditing]);
  
  const handleDoubleClick = () => {
    if (!item.completed) { // Prevent editing of completed items
        setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (task.trim() === '') {
      setTask(item.task); // Revert if task is empty
    } else {
      onUpdate(item.id, { task: task.trim(), details: details.trim() || undefined });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTask(item.task);
    setDetails(item.details || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.tagName.toLowerCase() === 'input') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex-1 py-2 space-y-2">
        <input
          ref={taskInputRef}
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-full bg-sky-50 dark:bg-sky-900/50 border-sky-300 dark:border-sky-700 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2 text-zinc-800 dark:text-zinc-100"
        />
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add details..."
          rows={2}
          className="w-full bg-sky-50 dark:bg-sky-900/50 border-sky-300 dark:border-sky-700 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-2 text-zinc-800 dark:text-zinc-100"
        />
        <div className="flex items-center space-x-2">
            <button onClick={handleSave} className="px-3 py-1 text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">Save</button>
            <button onClick={handleCancel} className="px-3 py-1 text-sm font-medium rounded-md text-zinc-700 dark:text-zinc-200 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start py-2 group" onDoubleClick={handleDoubleClick}>
      <input
        type="checkbox"
        id={`item-${item.id}`}
        checked={item.completed}
        onChange={() => onToggle(item.id)}
        className="mt-1 h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
      />
      <div className="ml-3 text-sm flex-1">
        <label
          htmlFor={`item-${item.id}`}
          className={`font-medium ${item.completed ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-700 dark:text-zinc-200'} cursor-pointer`}
        >
          {item.task}
        </label>
        {item.details && (
          <p className={`mt-1 ${item.completed ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-500 dark:text-zinc-400'}`}>
            {item.details}
          </p>
        )}
         {!item.completed && (
            <span className="hidden group-hover:inline ml-2 text-xs text-zinc-400 dark:text-zinc-500">(double-click to edit)</span>
        )}
      </div>
    </div>
  );
};

export default ChecklistItem;
