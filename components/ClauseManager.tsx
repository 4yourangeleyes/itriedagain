/**
 * Clause Manager Component
 * Allows users to add, edit, and manage contract clauses
 * Includes access to the 18-clause Northcell library
 */

import React, { useState } from 'react';
import { ContractClause } from '../types';
import { Plus, Trash2, Edit2, Check, X, Library, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './Button';
import { TextArea } from './Input';
import { NORTHCELL_CLAUSE_LIBRARY, CLAUSE_CATEGORIES } from '../services/clauseLibrary';

interface ClauseManagerProps {
  clauses: ContractClause[];
  onAddClause: (clause: ContractClause) => void;
  onUpdateClause: (clauseId: string, updates: Partial<ContractClause>) => void;
  onDeleteClause: (clauseId: string) => void;
  onReorderClause: (clauseId: string, direction: 'up' | 'down') => void;
  viewMode?: 'Draft' | 'Final';
}

export const ClauseManager: React.FC<ClauseManagerProps> = ({
  clauses,
  onAddClause,
  onUpdateClause,
  onDeleteClause,
  onReorderClause,
  viewMode = 'Draft'
}) => {
  const [showLibrary, setShowLibrary] = useState(false);
  const [showCustomClause, setShowCustomClause] = useState(false);
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Custom clause form
  const [customClause, setCustomClause] = useState<Partial<ContractClause>>({
    title: '',
    content: '',
    category: 'Custom',
    required: false
  });

  const handleAddFromLibrary = (libraryClause: ContractClause) => {
    const newClause: ContractClause = {
      ...libraryClause,
      id: `clause_${Date.now()}`,
      order: clauses.length + 1
    };
    onAddClause(newClause);
    setShowLibrary(false);
  };

  const handleAddCustomClause = () => {
    if (!customClause.title || !customClause.content) {
      alert('Please fill in both title and content');
      return;
    }

    const newClause: ContractClause = {
      id: `custom_clause_${Date.now()}`,
      title: customClause.title,
      content: customClause.content,
      category: customClause.category || 'Custom',
      required: customClause.required || false,
      order: clauses.length + 1
    };

    onAddClause(newClause);
    setCustomClause({ title: '', content: '', category: 'Custom', required: false });
    setShowCustomClause(false);
  };

  const handleSaveEdit = (clauseId: string) => {
    setEditingClauseId(null);
  };

  const filteredLibraryClauses = selectedCategory === 'all'
    ? NORTHCELL_CLAUSE_LIBRARY
    : NORTHCELL_CLAUSE_LIBRARY.filter(c => c.category === selectedCategory);

  const requiredClausesCount = NORTHCELL_CLAUSE_LIBRARY.filter(c => c.required).length;

  if (viewMode === 'Final') {
    // In final mode, just display clauses without management controls
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Contract Clauses</h3>
          <p className="text-sm text-gray-500">
            {clauses.length} clause{clauses.length !== 1 ? 's' : ''} added
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setShowLibrary(!showLibrary)}
            variant="secondary"
            icon={<Library className="w-4 h-4" />}
          >
            Clause Library ({NORTHCELL_CLAUSE_LIBRARY.length})
          </Button>
          
          <Button
            onClick={() => setShowCustomClause(!showCustomClause)}
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            Custom Clause
          </Button>
        </div>
      </div>

      {/* Clause Library Modal */}
      {showLibrary && (
        <div className="border-2 border-purple-300 rounded-xl p-4 bg-purple-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <Library className="w-5 h-5 text-purple-600" />
                Northcell Clause Library
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                18 professional clauses crafted for web development contracts
              </p>
            </div>
            <Button onClick={() => setShowLibrary(false)} variant="secondary" icon={<X className="w-4 h-4" />}>
              Close
            </Button>
          </div>

          {/* Category Filter */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  selectedCategory === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-purple-100'
                }`}
              >
                All ({NORTHCELL_CLAUSE_LIBRARY.length})
              </button>
              {CLAUSE_CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  {category} ({NORTHCELL_CLAUSE_LIBRARY.filter(c => c.category === category).length})
                </button>
              ))}
            </div>
          </div>

          {/* Library Clauses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredLibraryClauses.map(clause => {
              const alreadyAdded = clauses.some(c => c.id === clause.id || c.title === clause.title);
              
              return (
                <div
                  key={clause.id}
                  className={`p-4 bg-white rounded-lg border-2 transition ${
                    alreadyAdded ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        {clause.title}
                        {clause.required && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" title="Required clause" />
                        )}
                      </h5>
                      <span className="text-xs text-gray-500">{clause.category}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-3 line-clamp-3">{clause.content.substring(0, 150)}...</p>
                  
                  {alreadyAdded ? (
                    <div className="flex items-center gap-1 text-xs text-green-700 font-medium">
                      <Check className="w-3 h-3" />
                      Added to contract
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleAddFromLibrary(clause)}
                      variant="secondary"
                      className="w-full text-sm"
                      icon={<Plus className="w-3 h-3" />}
                    >
                      Add Clause
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Clause Form */}
      {showCustomClause && (
        <div className="border-2 border-blue-300 rounded-xl p-4 bg-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900">Create Custom Clause</h4>
            <Button onClick={() => setShowCustomClause(false)} variant="secondary" icon={<X className="w-4 h-4" />}>
              Cancel
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clause Title</label>
              <input
                type="text"
                value={customClause.title || ''}
                onChange={(e) => setCustomClause({ ...customClause, title: e.target.value })}
                placeholder="e.g., Payment Terms"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clause Content</label>
              <TextArea
                value={customClause.content || ''}
                onChange={(e) => setCustomClause({ ...customClause, content: e.target.value })}
                placeholder="Enter the full text of the clause..."
                rows={6}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={customClause.category || 'Custom'}
                  onChange={(e) => setCustomClause({ ...customClause, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Custom">Custom</option>
                  {CLAUSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={customClause.required || false}
                  onChange={(e) => setCustomClause({ ...customClause, required: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Required</span>
              </label>
            </div>

            <Button
              onClick={handleAddCustomClause}
              variant="primary"
              className="w-full"
              icon={<Plus className="w-4 h-4" />}
            >
              Add Custom Clause
            </Button>
          </div>
        </div>
      )}

      {/* Added Clauses List */}
      {clauses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Library className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No clauses added yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Add clauses from the library or create custom ones
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {clauses
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((clause, index) => (
              <div
                key={clause.id}
                className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => onReorderClause(clause.id, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onReorderClause(clause.id, 'down')}
                      disabled={index === clauses.length - 1}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1">
                    {editingClauseId === clause.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={clause.title}
                          onChange={(e) => onUpdateClause(clause.id, { title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-bold"
                        />
                        <TextArea
                          value={clause.content}
                          onChange={(e) => onUpdateClause(clause.id, { content: e.target.value })}
                          rows={4}
                          className="w-full"
                        />
                        <Button
                          onClick={() => handleSaveEdit(clause.id)}
                          variant="primary"
                          icon={<Check className="w-4 h-4" />}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                              {index + 1}. {clause.title}
                              {clause.required && (
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              )}
                            </h4>
                            <span className="text-xs text-gray-500">{clause.category}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{clause.content}</p>
                      </>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingClauseId(editingClauseId === clause.id ? null : clause.id)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                      title="Edit clause"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${clause.title}"?`)) {
                          onDeleteClause(clause.id);
                        }
                      }}
                      className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                      title="Delete clause"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Helper Text */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <p className="text-sm text-purple-900">
          <strong>💡 Pro Tip:</strong> The Northcell Clause Library includes {requiredClausesCount} essential clauses 
          marked with ⭐ that are recommended for most contracts. You can add, edit, or remove clauses as needed.
        </p>
      </div>
    </div>
  );
};
