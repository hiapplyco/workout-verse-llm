import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Session check error:", error);
    return null;
  }
  return session;
};

export const isValidSession = (session: Session | null): session is Session => {
  return session !== null && session.user !== null;
};