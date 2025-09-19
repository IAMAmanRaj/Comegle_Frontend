import React, { useState, useRef } from 'react';
import { IoClose, IoAdd } from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MdKeyboardReturn } from "react-icons/md";

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

const TagsInput: React.FC<TagsInputProps> = ({
  tags,
  onChange,
  placeholder = "Add tags...",
  className = ""
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    }
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleAddClick = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    } else {
      inputRef.current?.focus();
    }
  };

  return (
    <div className={`border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent ${className}`}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              type="button"
            >
              <IoClose size={14} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="border-none shadow-none focus-visible:ring-0 px-0"
        />
        <div className='flex flex-row px-4 py-2 items-center bg-blue-800 rounded-3xl '>
          <span className='text-sm font-bold mr-2 text-white'>Add</span>
            <MdKeyboardReturn onClick={handleAddClick} size={20} className='text-white' />
        </div>
      
      </div>
    </div>
  );
};

export default TagsInput;