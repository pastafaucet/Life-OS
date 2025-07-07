'use client';

import { useState, useEffect } from 'react';
import { useData, Case, Contact } from '../lib/dataContext';

interface LinkingAutocompleteProps {
  type: 'cases' | 'contacts';
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function LinkingAutocomplete({ 
  type, 
  selectedIds, 
  onSelectionChange, 
  placeholder,
  className = ""
}: LinkingAutocompleteProps) {
  const { cases, contacts, addCase, addContact } = useData();
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredItems, setFilteredItems] = useState<(Case | Contact)[]>([]);

  // Get the appropriate data based on type
  const items = type === 'cases' ? cases : contacts;

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = items.filter(item => {
        if (selectedIds.includes(item.id)) return false;
        
        if (type === 'cases') {
          const caseItem = item as Case;
          const searchText = `${caseItem.title} ${caseItem.client_name} ${caseItem.case_number || ''}`.toLowerCase();
          return searchText.includes(inputValue.toLowerCase());
        } else {
          const contactItem = item as Contact;
          const searchText = `${contactItem.first_name} ${contactItem.last_name} ${contactItem.firm_organization || ''}`.toLowerCase();
          return searchText.includes(inputValue.toLowerCase());
        }
      });
      setFilteredItems(filtered);
      setShowDropdown(true);
    } else {
      setFilteredItems([]);
      setShowDropdown(false);
    }
  }, [inputValue, items, selectedIds, type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.metaKey || e.ctrlKey) {
        // Cmd+Enter or Ctrl+Enter: Create new entry
        handleCreateNew();
      } else {
        // Regular Enter: Select existing entry if exact match
        const exactMatch = items.find(item => {
          if (type === 'cases') {
            const caseItem = item as Case;
            return caseItem.title.toLowerCase() === inputValue.toLowerCase().trim();
          } else {
            const contactItem = item as Contact;
            const fullName = `${contactItem.first_name} ${contactItem.last_name}`.toLowerCase();
            return fullName === inputValue.toLowerCase().trim();
          }
        });

        if (exactMatch && !selectedIds.includes(exactMatch.id)) {
          handleSelectItem(exactMatch);
        }
      }
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      setShowDropdown(false);
      setInputValue('');
    }
  };

  const handleCreateNew = () => {
    if (!inputValue.trim()) return;

    if (type === 'cases') {
      // Create new case
      const newCaseData = {
        title: inputValue.trim(),
        client_name: inputValue.trim().split(' vs. ')[0] || inputValue.trim(),
        description: `Case created from linking: ${inputValue.trim()}`,
        case_type: 'litigation' as const,
        status: 'active' as const,
        priority: 'medium' as const,
        opened_date: new Date().toISOString().split('T')[0]
      };
      
      const newCaseId = addCase(newCaseData);
      onSelectionChange([...selectedIds, newCaseId]);
    } else {
      // Create new contact
      const nameParts = inputValue.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      if (firstName) {
        const newContactData = {
          type: 'client' as const,
          first_name: firstName,
          last_name: lastName,
          email: '',
          phone: '',
          firm_organization: '',
          notes: ''
        };
        
        const newContactId = addContact(newContactData);
        onSelectionChange([...selectedIds, newContactId]);
      }
    }

    setInputValue('');
    setShowDropdown(false);
  };

  const handleSelectItem = (item: Case | Contact) => {
    if (!selectedIds.includes(item.id)) {
      onSelectionChange([...selectedIds, item.id]);
    }
    setInputValue('');
    setShowDropdown(false);
  };

  const handleRemoveItem = (itemId: string) => {
    onSelectionChange(selectedIds.filter(id => id !== itemId));
  };

  const getSelectedItems = () => {
    return items.filter(item => selectedIds.includes(item.id));
  };

  const getItemDisplayName = (item: Case | Contact) => {
    if (type === 'cases') {
      const caseItem = item as Case;
      return caseItem.title;
    } else {
      const contactItem = item as Contact;
      return `${contactItem.first_name} ${contactItem.last_name}`;
    }
  };

  const getItemSubtext = (item: Case | Contact) => {
    if (type === 'cases') {
      const caseItem = item as Case;
      return `${caseItem.case_number ? `#${caseItem.case_number} • ` : ''}${caseItem.status}`;
    } else {
      const contactItem = item as Contact;
      return contactItem.firm_organization || contactItem.type;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected items */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {getSelectedItems().map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {getItemDisplayName(item)}
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input field */}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => inputValue.trim() && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className="w-full text-gray-300 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder || `Type to search ${type} or add new`}
      />

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className="w-full text-left px-3 py-2 hover:bg-gray-600 text-gray-300 border-b border-gray-600 last:border-b-0"
              >
                <div className="font-medium">{getItemDisplayName(item)}</div>
                <div className="text-xs text-gray-400">{getItemSubtext(item)}</div>
              </button>
            ))
          ) : inputValue.trim() ? (
            <div className="px-3 py-2 text-gray-400 text-sm">
              Press Cmd+Enter to create "{inputValue.trim()}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
