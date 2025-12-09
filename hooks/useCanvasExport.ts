import { useState } from 'react';

export interface CanvasExportState {
  saveSuccess: boolean;
  isExportingPDF: boolean;
}

export interface UseCanvasExportReturn extends CanvasExportState {
  setSaveSuccess: (success: boolean) => void;
  setIsExportingPDF: (exporting: boolean) => void;
  showSaveSuccess: () => void;
  startPDFExport: () => void;
  completePDFExport: () => void;
}

export const useCanvasExport = (): UseCanvasExportReturn => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const showSaveSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const startPDFExport = () => {
    setIsExportingPDF(true);
  };

  const completePDFExport = () => {
    setIsExportingPDF(false);
  };

  return {
    saveSuccess,
    isExportingPDF,
    setSaveSuccess,
    setIsExportingPDF,
    showSaveSuccess,
    startPDFExport,
    completePDFExport,
  };
};
