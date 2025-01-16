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
      You are a professional CrossFit trainer. Your task is to completely transform this workout based on the user's request.
      
      Current workout:
      Warm-up: ${warmUp}
      Workout of the Day (WOD): ${wod}
      Notes: ${notes || 'None'}
      
      User request: ${userPrompt}
      
      Important instructions:
      1. Generate a COMPLETELY NEW workout that addresses the user's request
      2. Create a warm-up that specifically prepares for the new WOD
      3. The warm-up must include different exercises than the WOD but target similar movement patterns
      4. Notes must provide specific guidance for both the warm-up and WOD
      5. Return ONLY a valid JSON object in this exact format:
      {
        "warmUp": "modified warm-up here",
        "wod": "modified WOD here",
        "notes": "modified notes here"
      }
      
      Format requirements:
      - Replace "/" with "or"
      - Replace "-" with "to"
      - Use complete sentences
      - Avoid special characters
      - NEVER copy exercises directly from the original workout
      - Include specific rep schemes and movement standards
      - Vary movement patterns while maintaining workout intent
      
      Example of good transformation:
      If original has "air squats", new version should use different leg exercises like "lunges" or "wall balls"
      If original has "push-ups", new version should use different pushing movements like "dips" or "handstand holds"
      
      Remember: Return ONLY the JSON object with completely new exercises in each section.
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

    // Validate all required fields are present and different from original
    if (!modifiedWorkout.warmUp || !modifiedWorkout.wod || !modifiedWorkout.notes) {
      console.error('Missing required fields in response:', modifiedWorkout);
      throw new Error('Incomplete workout data received from AI');
    }

    // Ensure all sections have been modified with different exercises
    if (modifiedWorkout.warmUp.includes(warmUp) || 
        modifiedWorkout.wod.includes(wod) || 
        modifiedWorkout.notes === notes) {
      console.error('Sections not sufficiently modified:', {
        original: { warmUp, wod, notes },
        modified: modifiedWorkout
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