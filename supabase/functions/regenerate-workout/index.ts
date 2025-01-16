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
    const { warmUp, wod, notes, userPrompt, day } = await req.json();
    console.log('Received request with data:', { warmUp, wod, notes, userPrompt, day });

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an expert CrossFit coach planning a workout for ${day}. 
      
      Current workout plan:
      Warm-up: ${warmUp}
      WOD: ${wod}
      Notes: ${notes}
      
      User request: ${userPrompt}
      
      Create a new CrossFit workout plan that:
      1. Follows proper exercise progression
      2. Includes a targeted warm-up for the specific WOD movements
      3. Provides clear coaching cues in the notes
      
      Consider:
      - Movement patterns and muscle groups
      - Exercise intensity and volume
      - Rest periods and pacing
      - Proper scaling options
      
      Return only a JSON object with this format:
      {
        "warmUp": "detailed warm-up plan",
        "wod": "workout of the day",
        "notes": "coaching cues and tips"
      }
    `;

    console.log('Sending prompt to Gemini:', prompt);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log('Received raw response from Gemini:', text);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse Gemini response as JSON');
      throw new Error('Failed to parse Gemini response as JSON');
    }
    
    let modifiedWorkout;
    try {
      modifiedWorkout = JSON.parse(jsonMatch[0]);
      console.log('Successfully parsed JSON:', modifiedWorkout);
    } catch (error) {
      console.error('JSON parse error:', error);
      throw new Error('Invalid JSON format in AI response');
    }

    if (!modifiedWorkout.warmUp || !modifiedWorkout.wod || !modifiedWorkout.notes) {
      console.error('Missing required fields in response:', modifiedWorkout);
      throw new Error('Incomplete workout data received from AI');
    }

    return new Response(JSON.stringify(modifiedWorkout), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in regenerate-workout function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});