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

    const prompt = `
      You are an expert CrossFit coach creating a comprehensive Monday-Friday workout program.
      
      User's request for the week: ${weeklyPrompt}
      
      Create a detailed 5-day workout plan (Monday through Friday) that:
      1. Follows CrossFit programming principles
      2. Includes progressive overload
      3. Balances different movement patterns
      4. Considers recovery between workouts
      
      For each day, provide:
      - A specific warm-up targeting the day's movements
      - A detailed WOD (Workout of the Day)
      - Coaching notes with scaling options and tips
      
      Return a JSON array with exactly 5 objects, one for each weekday, in this format:
      [
        {
          "day": "Monday",
          "warmup": "detailed warm-up plan",
          "wod": "workout of the day",
          "notes": "coaching cues and tips"
        },
        // ... (repeat for each weekday)
      ]

      Do not use any markdown formatting characters like *, _, #, or \` in your response.
    `;

    console.log('Sending prompt to Gemini:', prompt);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log('Received raw response from Gemini:', text);
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Failed to parse Gemini response as JSON');
      throw new Error('Failed to parse Gemini response as JSON');
    }
    
    let weeklyWorkouts = JSON.parse(jsonMatch[0]);
    console.log('Successfully parsed weekly workouts:', weeklyWorkouts);

    if (!Array.isArray(weeklyWorkouts) || weeklyWorkouts.length !== 5) {
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