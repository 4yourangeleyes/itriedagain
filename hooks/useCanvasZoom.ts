import { useState, useEffect } from 'react';

export interface CanvasZoomState {
  zoom: number;
  guideZoom: boolean;
  viewMode: 'Draft' | 'Final';
}

export interface UseCanvasZoomReturn extends CanvasZoomState {
  setZoom: (zoom: number) => void;
  setGuideZoom: (guideZoom: boolean) => void;
  setViewMode: (mode: 'Draft' | 'Final') => void;
  applyGuidedZoom: (shouldGuide: boolean) => void;
}

export const useCanvasZoom = (initialZoom: number = 0.5): UseCanvasZoomReturn => {
  const [zoom, setZoom] = useState(initialZoom);
  const [guideZoom, setGuideZoom] = useState(false);
  const [viewMode, setViewMode] = useState<'Draft' | 'Final'>('Draft');

  const applyGuidedZoom = (shouldGuide: boolean) => {
    if (shouldGuide) {
      setGuideZoom(true);
      setZoom(1);
    } else {
      setGuideZoom(false);
      setZoom(initialZoom);
    }
  };

  return {
    zoom,
    guideZoom,
    viewMode,
    setZoom,
    setGuideZoom,
    setViewMode,
    applyGuidedZoom,
  };
};
