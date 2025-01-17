import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { weeklyPrompt } = await req.json();
    console.log('Received weekly prompt:', weeklyPrompt);

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log('Sending prompt to Gemini:', weeklyPrompt);
    const result = await model.generateContent(weeklyPrompt);
    const response = result.response;
    const text = response.text();
    console.log('Received raw response from Gemini:', text);
    
    // More robust JSON extraction
    const jsonMatch = text.match(/\[\s*{[\s\S]*}\s*\]/);
    if (!jsonMatch) {
      console.error('No JSON array found in response');
      throw new Error('Invalid response format from AI');
    }
    
    let weeklyWorkouts;
    try {
      weeklyWorkouts = JSON.parse(jsonMatch[0]);
      console.log('Successfully parsed weekly workouts:', weeklyWorkouts);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!Array.isArray(weeklyWorkouts) || weeklyWorkouts.length !== 5) {
      console.error('Invalid workout format:', weeklyWorkouts);
      throw new Error('Invalid weekly workout format received from AI');
    }

    // Clean up any remaining markdown characters from all text fields
    weeklyWorkouts = weeklyWorkouts.map(workout => ({
      ...workout,
      warmup: workout.warmup.replace(/[*_#\\`]/g, ''),
      wod: workout.wod.replace(/[*_#\\`]/g, ''),
      notes: workout.notes.replace(/[*_#\\`]/g, '')
    }));

    return new Response(JSON.stringify(weeklyWorkouts), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-weekly-workouts function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});