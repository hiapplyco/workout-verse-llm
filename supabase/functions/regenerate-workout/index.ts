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
    console.log('Received request to regenerate workout:', { day, userPrompt });

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an expert CrossFit coach creating a workout for ${day}.
      The user wants to: ${userPrompt}
      
      Current workout:
      Warm-up: ${warmUp}
      WOD (Workout of the Day): ${wod}
      Notes: ${notes}
      
      If the user wants a rest day, respond with a proper active recovery workout.
      
      Create a new workout that:
      1. Has an appropriate warm-up
      2. Changes the WOD based on the user's request
      3. Provides specific coaching notes
      
      Return ONLY a JSON object with this exact format (use camelCase):
      {
        "warmUp": "detailed warm-up plan",
        "wod": "workout of the day",
        "notes": "specific coaching notes"
      }
    `;

    console.log('Sending prompt to Gemini:', prompt);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log('Received raw response from Gemini:', text);
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse Gemini response as JSON');
      throw new Error('Failed to parse Gemini response as JSON');
    }
    
    let modifiedWorkout;
    try {
      modifiedWorkout = JSON.parse(jsonMatch[0]);
      console.log('Successfully parsed workout:', modifiedWorkout);

      // Normalize the response to use camelCase
      const formattedWorkout = {
        warmUp: modifiedWorkout.warmUp || modifiedWorkout.warm_up,
        wod: modifiedWorkout.wod,
        notes: modifiedWorkout.notes
      };

      // Validate all required fields are present and are strings
      if (
        typeof formattedWorkout.warmUp !== 'string' || 
        typeof formattedWorkout.wod !== 'string' || 
        typeof formattedWorkout.notes !== 'string'
      ) {
        console.error('Invalid data structure received:', formattedWorkout);
        throw new Error('Invalid workout data structure received');
      }

      console.log('Formatted workout for frontend:', formattedWorkout);
      return new Response(JSON.stringify(formattedWorkout), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('Validation error:', error);
      throw new Error('Invalid workout data received from AI');
    }
  } catch (error) {
    console.error('Error in regenerate-workout function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});