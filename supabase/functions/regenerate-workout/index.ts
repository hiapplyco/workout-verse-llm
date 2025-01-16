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
      
      Current workout:
      Warm-up: ${warmUp}
      WOD (Workout of the Day): ${wod}
      Notes: ${notes}
      
      User request: ${userPrompt}
      
      Create a completely new CrossFit workout that:
      1. Has a different warm-up targeting the main movements
      2. Changes the WOD based on the user's request
      3. Provides specific coaching notes
      
      Important rules:
      - DO NOT keep any exercises from the original workout
      - Create entirely new exercises for both warm-up and WOD
      - Ensure the warm-up properly prepares for the WOD
      - Include specific rep schemes and weights
      - Make the workout challenging but scalable
      
      Return ONLY a JSON object with this exact format:
      {
        "warmUp": "detailed warm-up plan with new exercises",
        "wod": "new workout of the day",
        "notes": "specific coaching notes"
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
      console.log('Successfully parsed workout:', modifiedWorkout);

      // Validate the response has all required fields and they're not empty
      if (!modifiedWorkout.warmUp?.trim() || !modifiedWorkout.wod?.trim() || !modifiedWorkout.notes?.trim()) {
        throw new Error('Incomplete workout data received from AI');
      }

      // Validate the response isn't just repeating the original workout
      if (modifiedWorkout.warmUp === warmUp || modifiedWorkout.wod === wod) {
        throw new Error('AI generated the same workout as before');
      }

    } catch (error) {
      console.error('Validation error:', error);
      throw new Error('Invalid workout data received from AI');
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