import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const useInitialSetup = () => {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && profile) {
      // If user hasn't set a goal, redirect to goal setup
      if (!profile.target_score) {
        router.push('/goal-setup');
        return;
      }

      // If user hasn't completed assessment, redirect to assessment
      if (!profile.has_completed_assessment) {
        router.push('/assessment');
        return;
      }
    }
  }, [user, profile, loading, router]);

  return {
    needsSetup: profile && !profile.target_score,
    needsAssessment: profile && !profile.has_completed_assessment,
  };
};
