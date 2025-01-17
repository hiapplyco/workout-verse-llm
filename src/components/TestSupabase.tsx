import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const TestSupabase = () => {
  const [testResults, setTestResults] = useState<{
    session: boolean;
    profile: boolean;
  }>({
    session: false,
    profile: false,
  });

  const testSupabase = async () => {
    console.log("Starting Supabase test...");
    
    try {
      // Test 1: Session check
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log("Session Data:", session);
      console.log("Session Error:", sessionError);

      if (sessionError) {
        console.error("Session check failed:", sessionError);
        return;
      }

      if (!session?.user) {
        console.error("No session found");
        return;
      }

      if (session?.access_token) {
        console.log("Access Token:", session.access_token);
        setTestResults(prev => ({ ...prev, session: true }));
      }

      // Test 2: Profile check - Using maybeSingle for safer query
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select()
        .eq('id', session.user.id)
        .maybeSingle();

      console.log("Profile Data:", profile);
      console.log("Profile Error:", profileError);

      if (profileError) {
        console.error("Profile fetch failed:", profileError);
        return;
      }

      // Profile exists check
      if (profile) {
        setTestResults(prev => ({ ...prev, profile: true }));
      } else {
        console.log("No profile found for user");
        setTestResults(prev => ({ ...prev, profile: false }));
      }
    } catch (error) {
      console.error("Unexpected error in Supabase test:", error);
    }
  };

  // Run test on mount
  useEffect(() => {
    testSupabase();
  }, []);

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Supabase Connection Test</h2>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${testResults.session ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>Session: {testResults.session ? 'Active' : 'Inactive'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${testResults.profile ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>Profile: {testResults.profile ? 'Found' : 'Not Found'}</span>
        </div>
      </div>

      <Button
        onClick={testSupabase}
        variant="default"
      >
        Run Test Again
      </Button>
    </Card>
  );
};