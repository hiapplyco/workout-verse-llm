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
    const { currentWorkout, userPrompt, day } = await req.json();
    console.log('Regenerating workout for:', { day, userPrompt });
    console.log('Current workout details:', currentWorkout);

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an expert CrossFit coach modifying a workout for ${day}.
      The user wants to: ${userPrompt}
      
      Current workout structure:
      Warm-up: ${currentWorkout.warmUp}
      WOD: ${currentWorkout.wod}
      Notes: ${currentWorkout.notes}
      
      Respond with a valid JSON object containing exactly these three fields:
      {
        "warmUp": "detailed warm-up plan",
        "wod": "workout of the day",
        "notes": "specific coaching notes"
      }
      
      All fields must be non-empty strings. Only include the JSON object, no additional text.
    `;

    console.log('Sending prompt to Gemini');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract and parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Gemini response as JSON');
    }
    
    const modifiedWorkout = JSON.parse(jsonMatch[0]);
    console.log('Successfully parsed response:', modifiedWorkout);

    // Validate response structure
    const { warmUp, wod, notes } = modifiedWorkout;
    if (!warmUp?.trim() || !wod?.trim() || !notes?.trim()) {
      throw new Error('Invalid or empty workout fields received');
    }

    return new Response(JSON.stringify(modifiedWorkout), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in regenerate-workout function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error instanceof Error ? error.stack : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});