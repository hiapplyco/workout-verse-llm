import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { handleSignOut } from "@/utils/authUtils";

export const Navigation = () => {
  const navigate = useNavigate();

  const onSignOut = async () => {
    const success = await handleSignOut();
    if (success) {
      navigate('/auth', { replace: true });
    }
  };

  return (
    <nav className="border-b-2 border-primary bg-card px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-black uppercase tracking-tight text-primary">
        Best App of Their Day
      </h1>
      <Button
        variant="outline"
        onClick={onSignOut}
        className="border-2 border-primary font-medium"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </nav>
  );
};