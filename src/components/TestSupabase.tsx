import { supabase } from "@/integrations/supabase/client";

export const TestSupabase = () => {
  const testSupabase = async () => {
    console.log("Starting Supabase test...");

    // Test 1: Session check
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log("Session Data:", session);
    console.log("Session Error:", sessionError);

    if (session?.access_token) {
      console.log("Access Token:", session.access_token);
    }

    // Test 2: Profile fetch - using .single() for unique ID
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .single();

    console.log("Profile Data:", profileData);
    console.log("Profile Error:", profileError);

    return { session, profile: profileData };
  };

  return (
    <div className="space-y-4 p-4 bg-muted rounded-lg">
      <h2 className="text-lg font-semibold">Supabase Test Component</h2>
      <button
        onClick={testSupabase}
        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        Test Supabase Connection
      </button>
    </div>
  );
};