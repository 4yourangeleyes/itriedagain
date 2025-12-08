import React from 'react';
import { X, Sparkles, Download, XCircle } from 'lucide-react';
import { Button } from './Button';

interface TemplatePreloadDialogProps {
  onLoadTemplates: () => void;
  onSkip: () => void;
  industry: string;
  templateCount: number;
}

export const TemplatePreloadDialog: React.FC<TemplatePreloadDialogProps> = ({
  onLoadTemplates,
  onSkip,
  industry,
  templateCount,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-grit-dark shadow-grit max-w-lg w-full">
        {/* Header */}
        <div className="bg-grit-primary p-6 border-b-4 border-grit-dark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="text-grit-dark" size={28} />
            <h2 className="text-2xl font-bold text-grit-dark">Quick Start Templates</h2>
          </div>
          <button 
            onClick={onSkip}
            className="p-2 hover:bg-grit-dark hover:text-grit-primary border-2 border-grit-dark transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6">
            <p className="text-lg font-bold text-grit-dark mb-3">
              🎉 We have {templateCount} ready-made templates for {industry} businesses!
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              These pre-built templates include common services, pricing structures, and clauses 
              tailored for your industry. You can customize them anytime or create your own from scratch.
            </p>
            
            <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded">
              <p className="font-bold text-blue-900 mb-2">✨ What you'll get:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Industry-specific invoice templates</li>
                <li>• Common service packages with pricing</li>
                <li>• Professional contract clauses</li>
                <li>• Ready to use immediately</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onLoadTemplates}
              className="w-full bg-grit-dark text-grit-primary font-bold py-4 px-6 hover:brightness-110 transition-all flex items-center justify-center gap-3 border-4 border-grit-dark shadow-grit active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Download size={20} />
              Yes, Load {templateCount} Templates
            </button>
            
            <button
              onClick={onSkip}
              className="w-full bg-white text-gray-700 font-bold py-3 px-6 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 border-2 border-gray-300"
            >
              <XCircle size={18} />
              No Thanks, I'll Create My Own
            </button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            You can always create custom templates later in the Templates screen
          </p>
        </div>
      </div>
    </div>
  );
};
