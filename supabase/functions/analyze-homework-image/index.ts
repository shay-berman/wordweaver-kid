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
    const { imageBase64, userId } = await req.json();

    if (!imageBase64 || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: imageBase64, userId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Analyzing homework image for user:', userId);

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
            content: `You are an English teacher creating quiz questions based on homework images. 
            Analyze the homework content and create 5 English questions based on what you see.
            The questions should be appropriate for elementary/middle school students learning English.
            
            Return your response in this exact JSON format:
            {
              "title": "Title based on homework topic",
              "description": "Brief description of what the homework covers",
              "difficulty": "beginner|intermediate|advanced",
              "questions": [
                {
                  "question": "Question text in Hebrew",
                  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                  "correctAnswer": "Correct option text",
                  "explanation": "Explanation in Hebrew"
                }
              ]
            }
            
            Make sure all questions are in Hebrew and focus on English vocabulary, grammar, or comprehension based on the homework content.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this homework image and create English learning questions based on it.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
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

    // Parse the JSON response
    let parsedResult;
    try {
      parsedResult = JSON.parse(analysisResult);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Failed to parse AI response');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store the AI-generated challenge in the database
    const { data: challenge, error: insertError } = await supabase
      .from('ai_generated_challenges')
      .insert({
        user_id: userId,
        image_path: 'base64_image', // We could store the actual image in storage if needed
        title: parsedResult.title,
        description: parsedResult.description,
        questions: parsedResult.questions,
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
        message: 'אתגר חדש נוצר בהצלחה מתוך שיעורי הבית שלך!' 
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