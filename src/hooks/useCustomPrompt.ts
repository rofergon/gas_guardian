import { useState, useCallback } from 'react';
import { aiService } from '../services/aiService';
import type { BlockChartData } from './useBlockDataChart';

interface UseCustomPromptReturn {
  customPrompt: string;
  setCustomPrompt: (value: string) => void;
  showCustomInput: boolean;
  setShowCustomInput: (value: boolean) => void;
  loading: boolean;
  error: string | null;
  handleCustomRequest: (e: React.FormEvent) => void;
  customResponse: string;
}

export function useCustomPrompt(gasData: BlockChartData[]) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customResponse, setCustomResponse] = useState('');

  const handleCustomRequest = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await aiService.generatePredictions(gasData, customPrompt);
      setCustomResponse(response.recommendations[0] || '');
      setCustomPrompt('');
      setShowCustomInput(false);
    } catch (_err) {
      setError('Could not generate response');
    } finally {
      setLoading(false);
    }
  }, [gasData, customPrompt]);

  return {
    customPrompt,
    setCustomPrompt,
    showCustomInput,
    setShowCustomInput,
    loading,
    error,
    handleCustomRequest,
    customResponse
  };
}
