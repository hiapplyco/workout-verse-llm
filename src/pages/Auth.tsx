import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/AuthForm";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { verifySession } from "@/utils/authUtils";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await verifySession();
      if (session) {
        navigate("/", { replace: true });
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          navigate("/", { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <AuthHeader />
        <div className="bg-card p-6 rounded-lg border shadow">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Auth;