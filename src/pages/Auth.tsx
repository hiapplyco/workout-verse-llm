import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AuthError } from "@supabase/supabase-js";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const { ensureProfile, isLoading } = useProfile();

  const checkSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Session check error:", error);
        setErrorMessage(getErrorMessage(error));
        return;
      }

      if (session?.user) {
        console.log("Session found, ensuring profile...");
        const profileCreated = await ensureProfile(session.user.id);
        if (profileCreated) {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Session check failed:", error);
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
        
        console.log("Auth state changed:", event);
        
        if (event === "SIGNED_IN" && session) {
          try {
            console.log("Sign in detected, ensuring profile...");
            const profileCreated = await ensureProfile(session.user.id);
            if (profileCreated && mounted) {
              navigate("/", { replace: true });
            }
          } catch (error) {
            console.error("Error during sign in:", error);
            toast.error("An error occurred during sign in");
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, ensureProfile, checkSession]);

  const getErrorMessage = (error: AuthError) => {
    switch (error.message) {
      case "Invalid login credentials":
        return "Invalid email or password. Please check your credentials and try again.";
      case "Email not confirmed":
        return "Please verify your email address before signing in.";
      case "User not found":
        return "No user found with these credentials.";
      default:
        return error.message;
    }
  };

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tight text-primary">
            Best App of Their Day
          </h1>
          <p className="text-muted-foreground font-medium">
            Sign in to access your workouts
          </p>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="bg-card p-8 rounded-none border-2 border-primary shadow-lg">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#C4A052',
                    brandAccent: '#A88B45',
                    brandButtonText: '#000000',
                    defaultButtonBackground: '#222222',
                    defaultButtonBackgroundHover: '#333333',
                    inputBackground: '#FFFFFF',
                    inputBorder: '#C4A052',
                    inputBorderHover: '#A88B45',
                    inputBorderFocus: '#C4A052',
                  },
                  borderWidths: {
                    buttonBorderWidth: '2px',
                    inputBorderWidth: '2px',
                  },
                  radii: {
                    borderRadiusButton: '0',
                    buttonBorderRadius: '0',
                    inputBorderRadius: '0',
                  },
                  fonts: {
                    bodyFontFamily: `'Roboto Condensed', sans-serif`,
                    buttonFontFamily: `'Roboto Condensed', sans-serif`,
                    inputFontFamily: `'Roboto Condensed', sans-serif`,
                    labelFontFamily: `'Roboto Condensed', sans-serif`,
                  },
                },
              },
              className: {
                button: 'font-bold uppercase tracking-tight',
                label: 'font-medium',
                input: 'font-medium',
              },
            }}
            theme="default"
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;