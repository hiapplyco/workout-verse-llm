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
    console.log('Current workout details:', { warmUp, wod, notes });

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an expert CrossFit coach modifying a workout for ${day}.
      The user wants to: ${userPrompt}
      
      Current workout:
      Warm-up: ${warmUp}
      WOD (Workout of the Day): ${wod}
      Notes: ${notes}
      
      Create a new workout that incorporates the user's request.
      If they want a rest day, provide an active recovery workout instead.
      
      Return ONLY a JSON object with this exact format, no additional text or explanation:
      {
        "warmUp": "detailed warm-up plan",
        "wod": "workout of the day",
        "notes": "specific coaching notes"
      }
    `;

    console.log('Sending prompt to Gemini');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log('Raw Gemini response:', text);
    
    // Clean and parse the response
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    let modifiedWorkout;
    
    try {
      modifiedWorkout = JSON.parse(cleanedText);
      console.log('Successfully parsed complete response:', modifiedWorkout);
    } catch (e) {
      console.log('Failed to parse complete response, attempting to extract JSON');
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON object found in response');
        throw new Error('Failed to parse Gemini response as JSON');
      }
      modifiedWorkout = JSON.parse(jsonMatch[0]);
      console.log('Successfully parsed extracted JSON:', modifiedWorkout);
    }

    // Enhanced validation
    if (!modifiedWorkout || typeof modifiedWorkout !== 'object') {
      console.error('Invalid response structure:', modifiedWorkout);
      throw new Error('Invalid response structure from Gemini');
    }

    const { warmUp: newWarmUp, wod: newWod, notes: newNotes } = modifiedWorkout;

    // Strict type checking and conversion
    const validatedWorkout = {
      warmUp: String(newWarmUp || ''),
      wod: String(newWod || ''),
      notes: String(newNotes || '')
    };

    // Final validation
    if (!validatedWorkout.warmUp || !validatedWorkout.wod || !validatedWorkout.notes) {
      console.error('Missing required fields in response:', validatedWorkout);
      throw new Error('Missing required fields in Gemini response');
    }

    console.log('Sending validated workout to frontend:', validatedWorkout);
    
    return new Response(JSON.stringify(validatedWorkout), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
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