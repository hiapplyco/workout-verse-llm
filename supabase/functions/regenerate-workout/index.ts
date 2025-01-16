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
    const { warmUp, wod, notes, userPrompt } = await req.json();
    console.log('Received request with data:', { warmUp, wod, notes, userPrompt });

    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are a professional fitness trainer. Your task is to modify ALL sections of this workout based on the user's request.
      
      Current workout:
      Warm-up: ${warmUp}
      Workout of the Day (WOD): ${wod}
      Notes: ${notes || 'None'}
      
      User request: ${userPrompt}
      
      Important instructions:
      1. You MUST modify ALL three sections (warm-up, WOD, and notes) according to the user's request
      2. Keep similar movement patterns but adjust intensity/complexity based on the request
      3. Return ONLY a valid JSON object in this exact format, with no additional text or explanation:
      {
        "warmUp": "modified warm-up here",
        "wod": "modified WOD here",
        "notes": "modified notes here"
      }
      
      Format requirements for natural speech:
      - Replace "/" with "or"
      - Replace "-" with "to"
      - Use complete sentences
      - Avoid special characters
      - Each section MUST be different from the original
      
      Remember: You MUST modify ALL sections while maintaining proper exercise progression and safety.
      Do not include any text outside of the JSON object in your response.
    `;

    console.log('Sending prompt to Gemini:', prompt);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log('Received raw response from Gemini:', text);
    
    // Extract the JSON from the response
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

    // Validate all required fields are present
    if (!modifiedWorkout.warmUp || !modifiedWorkout.wod || !modifiedWorkout.notes) {
      console.error('Missing required fields in response:', modifiedWorkout);
      throw new Error('Incomplete workout data received from AI');
    }

    // Validate that changes were actually made
    if (modifiedWorkout.warmUp === warmUp || modifiedWorkout.wod === wod) {
      console.error('Generated workout too similar to original:', {
        original: { warmUp, wod },
        modified: { warmUp: modifiedWorkout.warmUp, wod: modifiedWorkout.wod }
      });
      throw new Error('Generated workout too similar to original. Please try again.');
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