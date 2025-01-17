import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { verifySession, verifyProfile } from '@/utils/authUtils';
import { toast } from "sonner";

export const useAuth = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state change listener...');
    
    const initAuth = async () => {
      console.log('Checking user session...');
      try {
        const currentSession = await verifySession();
        
        if (!currentSession) {
          console.log('No session found, redirecting to auth');
          navigate('/auth', { replace: true });
          return;
        }

        const profile = await verifyProfile(currentSession.user.id);
        if (!profile) {
          console.error('No profile found for user');
          toast.error('Profile verification failed');
          await supabase.auth.signOut();
          navigate('/auth', { replace: true });
          return;
        }

        setSession(currentSession);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        navigate('/auth', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', { event, userId: session?.user?.id });
      
      if (event === 'SIGNED_IN') {
        if (session?.user) {
          const profile = await verifyProfile(session.user.id);
          if (profile) {
            setSession(session);
            navigate('/', { replace: true });
          } else {
            console.error('No profile found after sign in');
            toast.error('Profile verification failed');
            await supabase.auth.signOut();
            navigate('/auth', { replace: true });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        navigate('/auth', { replace: true });
      }
    });

    console.log('Cleaning up auth state change listener');
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { session, isLoading };
};