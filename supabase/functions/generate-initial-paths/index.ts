import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { grade, userId } = await req.json();

    if (!grade || !userId) {
      throw new Error('Missing required parameters');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate 5 easy learning paths using OpenAI
    const prompt = `צור 5 מסלולי למידה באנגלית עבור תלמיד בכיתה ${grade}.
כל מסלול צריך להיות ברמה קלה ומתאים למתחילים.
כל מסלול צריך להכיל 3 פרקים, וכל פרק 5 שאלות.
התוכן צריך להתאים לרמת הלימוד של כיתה ${grade}.

החזר JSON במבנה הבא:
{
  "paths": [
    {
      "title": "כותרת המסלול",
      "description": "תיאור קצר",
      "chapters": [
        {
          "title": "כותרת הפרק",
          "questions": [
            {
              "question": "השאלה",
              "options": ["תשובה 1", "תשובה 2", "תשובה 3", "תשובה 4"],
              "correctAnswer": "התשובה הנכונה"
            }
          ]
        }
      ]
    }
  ]
}

התמקד בנושאים בסיסיים כמו: מילים פשוטות, צבעים, מספרים, בעלי חיים, משפחה, וזמנים פשוטים.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an English teacher creating learning paths for students.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    let content = data.choices[0].message.content.trim();

    // Remove markdown code blocks if present
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/```\n?/g, '');
    }

    const parsedData = JSON.parse(content);

    // Insert paths into database
    const insertPromises = parsedData.paths.map(async (path: any) => {
      const { error } = await supabase
        .from('ai_generated_challenges')
        .insert({
          user_id: userId,
          title: path.title,
          description: path.description,
          difficulty_level: 'beginner',
          questions: path.chapters,
          image_path: ''
        });

      if (error) throw error;
    });

    await Promise.all(insertPromises);

    return new Response(
      JSON.stringify({ success: true, count: parsedData.paths.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-initial-paths:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
