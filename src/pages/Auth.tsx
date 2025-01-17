import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProfile } from "@/hooks/useProfile";
import { getErrorMessage } from "@/utils/authErrors";
import { AuthForm } from "@/components/AuthForm";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthLoading } from "@/components/auth/AuthLoading";
import { getSession, isValidSession } from "@/utils/sessionUtils";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const { ensureProfile, isLoading } = useProfile();

  const handleAuthStateChange = useCallback(async (event: string, session: any) => {
    if (event === "SIGNED_IN" && isValidSession(session)) {
      try {
        const profileExists = await ensureProfile(session.user.id);
        if (profileExists) {
          navigate("/", { replace: true });
        }
      } catch (error: any) {
        console.error("Error during sign in:", error);
        setErrorMessage(getErrorMessage(error));
      }
    }
  }, [navigate, ensureProfile]);

  const checkSession = useCallback(async () => {
    try {
      const session = await getSession();
      
      if (session?.user) {
        const profileExists = await ensureProfile(session.user.id);
        if (profileExists) {
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error("Session check failed:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsInitialized(true);
    }
  }, [navigate, ensureProfile]);

  useEffect(() => {
    let mounted = true;
    
    if (mounted) {
      checkSession();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (event === "SIGNED_IN") {
          handleAuthStateChange(event, session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkSession, handleAuthStateChange]);

  if (!isInitialized || isLoading) {
    return <AuthLoading />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <AuthHeader />

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="bg-card p-8 rounded-none border-2 border-primary shadow-lg">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Auth;