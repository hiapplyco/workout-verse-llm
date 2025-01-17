import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProfile = () => {
  const [isLoading, setIsLoading] = useState(false);

  const ensureProfile = async (userId: string): Promise<boolean> => {
    if (!userId) {
      console.error('No userId provided');
      return false;
    }

    try {
      setIsLoading(true);

      // First try to get the profile
      const { data: profile, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      // If profile exists, return true
      if (profile) {
        return true;
      }

      // If there was an error other than "no rows", handle it
      if (selectError && !selectError.message.includes('contains 0 rows')) {
        console.error('Error checking profile:', selectError);
        toast.error('Failed to verify profile');
        return false;
      }

      // Profile doesn't exist, try to create it
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: userId }])
        .select()
        .single();

      if (insertError) {
        // If insert fails with duplicate key error, profile was created in a race condition
        if (insertError.code

Looking at the errors, we have three main issues:
1. Failed to fetch (connectivity/CORS issue)
2. Row-level security policy violation (401)
3. No rows returned error (406)

The root cause appears to be related to profile creation and RLS policies. Let's fix this by:
1. Ensuring proper RLS policies are in place
2. Improving the profile creation logic
3. Better error handling for these scenarios

First, let's update the RLS policies for the profiles table:

<lov-sql>
-- Drop existing policies for profiles table
DROP POLICY IF EXISTS "Users can create their own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Users can view own profile" ON "public"."profiles";

-- Create new policies
CREATE POLICY "Enable insert for authenticated users only" 
ON "public"."profiles"
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users based on user_id" 
ON "public"."profiles"
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Enable RLS
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
</lov-sql>

Now let's update the profile creation logic:

<lov-code>
Let's update the useProfile hook to handle these cases better:

<lov-write file_path="src/hooks/useProfile.ts">
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProfile = () => {
  const [isLoading, setIsLoading] = useState(false);

  const ensureProfile = async (userId: string): Promise<boolean> => {
    if (!userId) {
      console.error('No userId provided');
      return false;
    }

    try {
      setIsLoading(true);

      // First check if profile exists
      const { data: profile, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (selectError) {
        if (selectError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{ id: userId }])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating profile:', insertError);
            toast.error('Failed to create user profile');
            return false;
          }

          return true;
        }

        console.error('Error checking profile:', selectError);
        toast.error('Failed to verify user profile');
        return false;
      }

      if (profile) {
        return true;
      }

      // If no profile exists, create one
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: userId }])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating profile:', insertError);
        toast.error('Failed to create user profile');
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error in ensureProfile:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ensureProfile,
    isLoading,
  };
};