import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, userId, isMultiPage, pathName, chaptersCount = 5, questionsPerChapter = 5 } = await req.json();

    if (!imageBase64 || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: imageBase64, userId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Analyzing homework image(s) for user:', userId, 'Multi-page:', isMultiPage, 'Chapters:', chaptersCount, 'Questions per chapter:', questionsPerChapter);

    // Handle multiple images
    const images = Array.isArray(imageBase64) ? imageBase64 : [imageBase64];
    const imageContent = images.map((base64, index) => ({
      type: 'image_url',
      image_url: {
        url: `data:image/jpeg;base64,${base64}`
      }
    }));

    // Call OpenAI Vision API to analyze the homework image
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an educational AI that creates learning paths from homework images.

Create ${chaptersCount} chapters with ${questionsPerChapter} questions each.

Return ONLY valid JSON with this structure:
{
  "pathName": "${pathName || 'מסלול שיעורי בית'}",
  "description": "Brief description in Hebrew",
  "difficulty": "beginner",
  "chapters": [
    {
      "id": "chapter-1",
      "title": "Chapter title in Hebrew",
      "description": "Brief description",
      "difficulty": "easy",
      "questions": [
        {
          "type": "highlight|fill_blank|multiple_choice",
          "question": "Question in Hebrew", 
          "sentence": "Sentence (for highlight/fill_blank)",
          "options": ["option1", "option2", "option3", "option4"],
          "correctAnswer": "correct option",
          "targetWord": "word to highlight (highlight type only)",
          "explanation": "Brief explanation in Hebrew"
        }
      ]
    }
  ]
}

CRITICAL: Keep response under 5000 characters total. Be concise.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: isMultiPage 
                  ? `Please analyze these ${images.length} homework pages and create a complete learning path with ${chaptersCount} chapters, each containing ${questionsPerChapter} questions based on all the content.`
                  : `Please analyze this homework image and create a complete learning path with ${chaptersCount} chapters, each containing ${questionsPerChapter} questions based on the content.`
              },
              ...imageContent
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text());
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const openAIResponse = await response.json();
    const analysisResult = openAIResponse.choices[0].message.content;

    console.log('OpenAI analysis result:', analysisResult);

    // Parse the JSON response - handle markdown code blocks
    let parsedResult;
    try {
      // Remove markdown code blocks if present
      let cleanedResult = analysisResult.trim();
      if (cleanedResult.startsWith('```json')) {
        cleanedResult = cleanedResult.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResult.startsWith('```')) {
        cleanedResult = cleanedResult.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      parsedResult = JSON.parse(cleanedResult);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      console.error('Raw response:', analysisResult);
      throw new Error('Failed to parse AI response');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store the AI-generated learning path in the database
    const { data: challenge, error: insertError } = await supabase
      .from('ai_generated_challenges')
      .insert({
        user_id: userId,
        image_path: 'base64_image', // We could store the actual image in storage if needed
        title: parsedResult.pathName,
        description: parsedResult.description,
        questions: parsedResult.chapters, // Store chapters in the questions field
        difficulty_level: parsedResult.difficulty || 'beginner'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error('Failed to save challenge to database');
    }

    console.log('Successfully created AI challenge:', challenge.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        challenge: challenge,
        message: `מסלול לימוד חדש נוצר בהצלחה עם ${chaptersCount} פרקים מתוך שיעורי הבית שלך!` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-homework-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'שגיאה בניתוח התמונה', 
        details: error instanceof Error ? error.message : 'שגיאה לא ידועה'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});