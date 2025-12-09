import { useState } from 'react';

export interface CanvasMenuState {
  showAddMenu: boolean;
  showStyleMenu: boolean;
  showPDFMenu: boolean;
  showBatchModal: boolean;
  showKaChing: boolean;
}

export interface UseCanvasMenuReturn extends CanvasMenuState {
  setShowAddMenu: (show: boolean) => void;
  setShowStyleMenu: (show: boolean) => void;
  setShowPDFMenu: (show: boolean) => void;
  setShowBatchModal: (show: boolean) => void;
  setShowKaChing: (show: boolean) => void;
  toggleAddMenu: () => void;
  toggleStyleMenu: () => void;
  togglePDFMenu: () => void;
  showKaChingEffect: () => void;
  closeAllMenus: () => void;
}

export const useCanvasMenus = (): UseCanvasMenuReturn => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showPDFMenu, setShowPDFMenu] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showKaChing, setShowKaChing] = useState(false);

  const toggleAddMenu = () => setShowAddMenu(prev => !prev);
  const toggleStyleMenu = () => setShowStyleMenu(prev => !prev);
  const togglePDFMenu = () => setShowPDFMenu(prev => !prev);

  const showKaChingEffect = () => {
    setShowKaChing(true);
    setTimeout(() => setShowKaChing(false), 2000);
  };

  const closeAllMenus = () => {
    setShowAddMenu(false);
    setShowStyleMenu(false);
    setShowPDFMenu(false);
  };

  return {
    showAddMenu,
    showStyleMenu,
    showPDFMenu,
    showBatchModal,
    showKaChing,
    setShowAddMenu,
    setShowStyleMenu,
    setShowPDFMenu,
    setShowBatchModal,
    setShowKaChing,
    toggleAddMenu,
    toggleStyleMenu,
    togglePDFMenu,
    showKaChingEffect,
    closeAllMenus,
  };
};
