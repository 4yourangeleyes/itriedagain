import { useState } from 'react';

export interface CanvasSelectionState {
  selectedItems: Set<string>;
  selectedTemplateItems: Set<string>;
  draggedItemIndex: number | null;
  selectedContractId: string | null;
  potentialTemplate: string | null;
}

export interface UseCanvasSelectionReturn extends CanvasSelectionState {
  setSelectedItems: (items: Set<string>) => void;
  setSelectedTemplateItems: (items: Set<string>) => void;
  setDraggedItemIndex: (index: number | null) => void;
  setSelectedContractId: (id: string | null) => void;
  setPotentialTemplate: (template: string | null) => void;
  toggleItemSelection: (itemId: string) => void;
  toggleTemplateItemSelection: (itemId: string) => void;
  clearAllSelections: () => void;
}

export const useCanvasSelection = (): UseCanvasSelectionReturn => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedTemplateItems, setSelectedTemplateItems] = useState<Set<string>>(new Set());
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [potentialTemplate, setPotentialTemplate] = useState<string | null>(null);

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const toggleTemplateItemSelection = (itemId: string) => {
    setSelectedTemplateItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const clearAllSelections = () => {
    setSelectedItems(new Set());
    setSelectedTemplateItems(new Set());
    setDraggedItemIndex(null);
    setSelectedContractId(null);
    setPotentialTemplate(null);
  };

  return {
    selectedItems,
    selectedTemplateItems,
    draggedItemIndex,
    selectedContractId,
    potentialTemplate,
    setSelectedItems,
    setSelectedTemplateItems,
    setDraggedItemIndex,
    setSelectedContractId,
    setPotentialTemplate,
    toggleItemSelection,
    toggleTemplateItemSelection,
    clearAllSelections,
  };
};
