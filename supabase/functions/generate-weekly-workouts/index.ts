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

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      console.error('GEMINI_API_KEY not found in environment variables');
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    console.log('Initialized Gemini API client');
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log('Got Gemini model instance');

    // Add specific formatting instructions to the prompt
    const formattedPrompt = `${weeklyPrompt}\n\nIMPORTANT: Return ONLY a JSON array with exactly 5 workout objects, one for each weekday. Each object MUST have these fields: day (string), warmup (string), wod (string), and notes (string). Example format:
    [
      {
        "day": "Monday",
        "warmup": "warmup details",
        "wod": "workout details",
        "notes": "coaching notes"
      }
    ]`;

    console.log('Sending formatted prompt to Gemini:', formattedPrompt);
    const result = await model.generateContent(formattedPrompt);
    const response = result.response;
    const text = response.text();
    console.log('Raw response from Gemini:', text);

    // Try to find JSON content in the response
    const jsonPattern = /\[\s*\{[\s\S]*?\}\s*\]/;
    const match = text.match(jsonPattern);
    
    if (!match) {
      console.error('No JSON array found in response');
      throw new Error('Could not find valid JSON array in AI response');
    }

    let weeklyWorkouts;
    try {
      weeklyWorkouts = JSON.parse(match[0]);
      console.log('Successfully parsed weekly workouts:', weeklyWorkouts);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error(`Failed to parse JSON: ${parseError.message}`);
    }

    if (!Array.isArray(weeklyWorkouts)) {
      console.error('Not an array:', weeklyWorkouts);
      throw new Error('AI response is not an array');
    }

    // Transform and validate each workout
    weeklyWorkouts = weeklyWorkouts.map((workout, index) => {
      const day = workout.day?.trim() || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][index];
      const warmup = workout.warmup?.replace(/[*_#`]/g, '').trim() || 'No warmup provided';
      const wod = workout.wod?.replace(/[*_#`]/g, '').trim() || 'No workout provided';
      const notes = workout.notes?.replace(/[*_#`]/g, '').trim() || 'No notes provided';

      return {
        day,
        warmup,
        wod,
        notes
      };
    });

    // Ensure we have exactly 5 workouts
    if (weeklyWorkouts.length < 5) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      while (weeklyWorkouts.length < 5) {
        const index = weeklyWorkouts.length;
        weeklyWorkouts.push({
          day: days[index],
          warmup: 'Default warmup routine',
          wod: 'Default workout of the day',
          notes: 'Default coaching notes'
        });
      }
    }

    // Trim to exactly 5 workouts if we somehow got more
    weeklyWorkouts = weeklyWorkouts.slice(0, 5);

    console.log('Final processed workouts:', weeklyWorkouts);
    return new Response(JSON.stringify(weeklyWorkouts), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-weekly-workouts function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error instanceof Error ? error.stack : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});