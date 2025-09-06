/**
 * React hook for vision system integration
 * Provides easy access to vision functionality across components
 */

import { useState, useCallback } from 'react';
import { VisionPlacement, VisionReward, VisionEligibility } from '@/types/vision';
import { checkVisionEligibilityAction, startVisionAction, completeVisionAction } from '@/app/(protected)/vision/actions';

export function useVision() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlacement, setCurrentPlacement] = useState<VisionPlacement | null>(null);
  const [currentReward, setCurrentReward] = useState<VisionReward>('PASS');
  const [eligibility, setEligibility] = useState<VisionEligibility | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openVision = useCallback(async (
    placement: VisionPlacement, 
    reward: VisionReward = 'PASS'
  ) => {
    setIsLoading(true);
    
    try {
      // Check eligibility
      const eligibilityResult = await checkVisionEligibilityAction(placement);
      setEligibility(eligibilityResult);
      setCurrentPlacement(placement);
      setCurrentReward(reward);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error checking vision eligibility:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeVision = useCallback(() => {
    setIsModalOpen(false);
    setCurrentPlacement(null);
    setEligibility(null);
  }, []);

  const handleVisionComplete = useCallback(async (reward: VisionReward) => {
    if (!currentPlacement) return;

    setIsLoading(true);
    
    try {
      // Start vision session
      const startResult = await startVisionAction(currentPlacement, reward);
      if (!startResult.success) {
        console.error('Failed to start vision:', startResult.error);
        return;
      }

      // Complete vision session
      const completeResult = await completeVisionAction(startResult.sessionId!);
      if (!completeResult.success) {
        console.error('Failed to complete vision:', completeResult.error);
        return;
      }

      // Close modal and trigger callback
      closeVision();
      
      // You could add a success callback here if needed
      console.log('Vision completed successfully:', completeResult);
      
    } catch (error) {
      console.error('Error completing vision:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPlacement, closeVision]);

  return {
    isModalOpen,
    currentPlacement,
    currentReward,
    eligibility,
    isLoading,
    openVision,
    closeVision,
    handleVisionComplete
  };
}
