import { useState } from 'react';

export interface CanvasModalState {
  showBatchModal: boolean;
  batchBlockName: string;
  suggestDeposit: boolean;
}

export interface UseCanvasModalReturn extends CanvasModalState {
  setShowBatchModal: (show: boolean) => void;
  setBatchBlockName: (name: string) => void;
  setSuggestDeposit: (suggest: boolean) => void;
  openBatchModal: () => void;
  closeBatchModal: () => void;
  resetBatchState: () => void;
}

export const useCanvasModal = (): UseCanvasModalReturn => {
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchBlockName, setBatchBlockName] = useState('');
  const [suggestDeposit, setSuggestDeposit] = useState(false);

  const openBatchModal = () => {
    setShowBatchModal(true);
    setBatchBlockName('');
  };

  const closeBatchModal = () => {
    setShowBatchModal(false);
  };

  const resetBatchState = () => {
    setShowBatchModal(false);
    setBatchBlockName('');
    setSuggestDeposit(false);
  };

  return {
    showBatchModal,
    batchBlockName,
    suggestDeposit,
    setShowBatchModal,
    setBatchBlockName,
    setSuggestDeposit,
    openBatchModal,
    closeBatchModal,
    resetBatchState,
  };
};
