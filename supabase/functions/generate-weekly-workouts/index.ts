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

    console.log('Sending prompt to Gemini...');
    const result = await model.generateContent(weeklyPrompt);
    const response = result.response;
    const text = response.text();
    console.log('Raw response from Gemini:', text);

    // Extract JSON array using a more robust pattern
    const jsonPattern = /\[\s*\{[\s\S]*?\}\s*\]/;
    const match = text.match(jsonPattern);
    
    if (!match) {
      console.error('No JSON array found in response');
      throw new Error('Invalid response format from AI');
    }

    let weeklyWorkouts;
    try {
      weeklyWorkouts = JSON.parse(match[0]);
      console.log('Successfully parsed weekly workouts:', weeklyWorkouts);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse Gemini response as JSON');
    }

    // Validate workout format
    if (!Array.isArray(weeklyWorkouts) || weeklyWorkouts.length !== 5) {
      console.error('Invalid workout format:', weeklyWorkouts);
      throw new Error('Invalid weekly workout format received from AI');
    }

    // Clean up any markdown characters from all text fields
    weeklyWorkouts = weeklyWorkouts.map(workout => ({
      ...workout,
      warmup: workout.warmup?.replace(/[*_#`]/g, '').trim() || '',
      wod: workout.wod?.replace(/[*_#`]/g, '').trim() || '',
      notes: workout.notes?.replace(/[*_#`]/g, '').trim() || ''
    }));

    // Validate required fields
    const isValid = weeklyWorkouts.every(workout => 
      workout.day && 
      workout.warmup && 
      workout.wod && 
      typeof workout.day === 'string' &&
      typeof workout.warmup === 'string' &&
      typeof workout.wod === 'string'
    );

    if (!isValid) {
      console.error('Invalid workout data structure:', weeklyWorkouts);
      throw new Error('Invalid workout data structure received from AI');
    }

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