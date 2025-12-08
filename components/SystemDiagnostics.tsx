import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { canGeneratePDF } from '../services/pdfService';

export const SystemDiagnostics: React.FC = () => {
  const [results, setResults] = useState<Record<string, { status: 'pending' | 'success' | 'error', message: string }>>({});
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    setResults({});

    const newResults: typeof results = {};

    // 1. Test Supabase Connection
    try {
      const { error } = await supabase.from('user_profiles').select('count').limit(1);
      if (error) throw error;
      newResults['database'] = { status: 'success', message: 'Connected to Supabase' };
    } catch (err) {
      newResults['database'] = { status: 'error', message: err instanceof Error ? err.message : 'Database connection failed' };
    }

    // 2. Test Email Service (Edge Function)
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { ping: true }
      });
      if (error) throw error;
      if (data?.status === 'ok') {
        newResults['email'] = { status: 'success', message: 'Email Service Online' };
      } else {
        throw new Error('Invalid response from Email Service');
      }
    } catch (err) {
      newResults['email'] = { status: 'error', message: 'Email Service Unreachable (Check Supabase Logs)' };
    }

    // 3. Test AI Service (Edge Function)
    try {
      const { data, error } = await supabase.functions.invoke('generate-document', {
        body: { ping: true }
      });
      if (error) throw error;
      if (data?.status === 'ok') {
        newResults['ai'] = { status: 'success', message: 'AI Service Online' };
      } else {
        throw new Error('Invalid response from AI Service');
      }
    } catch (err) {
      newResults['ai'] = { status: 'error', message: 'AI Service Unreachable (Check API Key)' };
    }

    // 4. Test PDF Generation Capability
    if (canGeneratePDF()) {
      newResults['pdf'] = { status: 'success', message: 'PDF Generation Libraries Loaded' };
    } else {
      newResults['pdf'] = { status: 'error', message: 'PDF Libraries Missing (jspdf/html2canvas)' };
    }

    setResults(newResults);
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">System Diagnostics</h3>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {loading ? 'Running Tests...' : 'Run System Check'}
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(results).length === 0 && !loading && (
          <p className="text-gray-500 text-sm italic">Run diagnostics to check system health.</p>
        )}

        {(Object.entries(results) as [string, { status: 'success' | 'error', message: string }][]).map(([key, result]) => (
          <div key={key} className={`flex items-center p-3 rounded border ${
            result.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className={`w-3 h-3 rounded-full mr-3 ${
              result.status === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <div className="flex-1">
              <span className="font-medium capitalize text-gray-700">{key}: </span>
              <span className={`text-sm ${
                result.status === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>{result.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
