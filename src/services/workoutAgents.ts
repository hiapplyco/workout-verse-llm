import { supabase } from "@/integrations/supabase/client";

interface WorkoutData {
  warmup: string;
  wod: string;
  notes: string;
}

interface AgentResponse {
  content: string;
}

const createPromptForAgent = (
  agentType: 'warmup' | 'wod' | 'notes',
  currentWorkout: WorkoutData,
  userPrompt: string,
  day: string
) => {
  const baseContext = `
    You are a specialized CrossFit coach focusing on ${agentType === 'wod' ? 'WOD (Workout of the Day)' : agentType} programming.
    Current workout for ${day}:
    Warmup: ${currentWorkout.warmup}
    WOD: ${currentWorkout.wod}
    Notes: ${currentWorkout.notes}
    
    User wants to modify the workout: ${userPrompt}
  `;

  const specificInstructions = {
    warmup: "Generate a warmup routine that specifically prepares athletes for the current WOD while incorporating the user's modification request.",
    wod: "Create a WOD (Workout of the Day) that aligns with CrossFit principles and the user's modification request.",
    notes: "Provide coaching notes, scaling options, and tips specific to this workout considering the user's modification request."
  };

  return `${baseContext}\n${specificInstructions[agentType]}\n\nRespond with only the content, no additional text or formatting.`;
};

export const workoutAgents = {
  async generateWarmup(currentWorkout: WorkoutData, userPrompt: string, day: string): Promise<AgentResponse> {
    console.log('Warmup agent generating content for:', day);
    const { data, error } = await supabase.functions.invoke('workout-agent', {
      body: {
        prompt: createPromptForAgent('warmup', currentWorkout, userPrompt, day),
        agentType: 'warmup'
      }
    });

    if (error) throw error;
    return data;
  },

  async generateWOD(currentWorkout: WorkoutData, userPrompt: string, day: string): Promise<AgentResponse> {
    console.log('WOD agent generating content for:', day);
    const { data, error } = await supabase.functions.invoke('workout-agent', {
      body: {
        prompt: createPromptForAgent('wod', currentWorkout, userPrompt, day),
        agentType: 'wod'
      }
    });

    if (error) throw error;
    return data;
  },

  async generateNotes(currentWorkout: WorkoutData, userPrompt: string, day: string): Promise<AgentResponse> {
    console.log('Notes agent generating content for:', day);
    const { data, error } = await supabase.functions.invoke('workout-agent', {
      body: {
        prompt: createPromptForAgent('notes', currentWorkout, userPrompt, day),
        agentType: 'notes'
      }
    });

    if (error) throw error;
    return data;
  }
};