import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const TestSupabase = () => {
  const [testResult, setTestResult] = useState<string>("Not tested yet");

  const runTest = async () => {
    console.log("Starting Supabase test...");
    
    // Test 1: Session check
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log("Session Data:", session);
    console.log("Session Error:", sessionError);
    
    if (session?.access_token) {
      console.log("Access Token Present:", !!session.access_token);
      console.log("Access Token:", session.access_token);
    }

    // Test 2: Profile fetch - using .single() for unique ID
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .single();

    console.log("Profile Data:", profileData);
    console.log("Profile Error:", profileError);

    setTestResult(
      JSON.stringify(
        {
          session: session ? "Present" : "None",
          sessionError: sessionError || "None",
          profileData,
          profileError: profileError || "None"
        },
        null,
        2
      )
    );
  };

  // Run test on mount
  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Supabase Test Component</h2>
      
      <Button onClick={runTest}>
        Run Test Again
      </Button>
      
      <pre className="p-4 bg-gray-100 rounded-lg overflow-auto max-h-96">
        {testResult}
      </pre>
    </div>
  );
};