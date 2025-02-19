import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AuthForm } from "@/components/AuthForm";

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthDialog = ({ isOpen, onOpenChange }: AuthDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} modal>
      <DialogContent className="sm:max-w-[425px] p-6">
        <AuthForm />
      </DialogContent>
    </Dialog>
  );
};