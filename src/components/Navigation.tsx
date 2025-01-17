import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Navigation = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast.error("Error signing out");
        return;
      }
      
      // Verify session is cleared
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session after sign out:', session);
      
      if (session) {
        console.error('Session still exists after sign out');
        toast.error("Error signing out - please try again");
        return;
      }
      
      console.log('User signed out successfully, redirecting to auth page');
      toast.success("Signed out successfully");
      
      // Force navigation to auth page after successful sign out
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      toast.error("Error signing out");
    }
  };

  return (
    <nav className="border-b-2 border-primary bg-card px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-black uppercase tracking-tight text-primary">
        Best App of Their Day
      </h1>
      <Button
        variant="outline"
        onClick={handleSignOut}
        className="border-2 border-primary font-medium"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </nav>
  );
};