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
      </div>
    </div>
  );
};

export default ChecklistItem;