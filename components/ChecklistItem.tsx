
import React from 'react';
import type { ChecklistItem as ChecklistItemType } from '../types';

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: (id: string) => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item, onToggle }) => {
  return (
    <div className="flex items-start py-2 group">
      <input
        type="checkbox"
        id={`item-${item.id}`}
        checked={item.completed}
        onChange={() => onToggle(item.id)}
        className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
      />
      <div className="ml-3 text-sm flex-1">
        <label
          htmlFor={`item-${item.id}`}
          className={`font-medium ${item.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200'} cursor-pointer`}
        >
          {item.task}
        </label>
        {item.details && (
          <p className={`mt-1 ${item.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-500 dark:text-slate-400'}`}>
            {item.details}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChecklistItem;
