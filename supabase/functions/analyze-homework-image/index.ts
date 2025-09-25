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
    const { imageBase64, userId, isMultiPage } = await req.json();

    if (!imageBase64 || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: imageBase64, userId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Analyzing homework image(s) for user:', userId, 'Multi-page:', isMultiPage);

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
            content: `You are an English teacher creating quiz questions based on homework images. 
            Analyze the homework content and create 5 English questions based on what you see.
            The questions should be appropriate for elementary/middle school students learning English.
            ${isMultiPage ? 'You are seeing multiple pages of homework - analyze all pages together to create comprehensive questions.' : ''}
            
            IMPORTANT: Create CLEAR multiple-choice questions with 4 options each. Make sure:
            1. Each question has exactly 4 distinct answer options
            2. Only one option is clearly correct
            3. The other 3 options are plausible but incorrect
            4. All text should be in Hebrew except for English words being tested
            5. Questions should focus on the specific content shown in the homework
            
            Return your response in this exact JSON format:
            {
              "title": "Title based on homework topic in Hebrew",
              "description": "Brief description of what the homework covers in Hebrew",
              "difficulty": "beginner|intermediate|advanced",
              "questions": [
                {
                  "question": "שאלה ברורה בעברית",
                  "options": ["אפשרות 1", "אפשרות 2", "אפשרות 3", "אפשרות 4"],
                  "correctAnswer": "התשובה הנכונה (חייבת להיות זהה לאחת מהאפשרויות)",
                  "explanation": "הסבר קצר בעברית למה זו התשובה הנכונה"
                }
              ]
            }
            
            Examples of good questions based on parts of speech homework:
            - "מהו הפועל במשפט 'She reads a book'?" with options: ["She", "reads", "book", "a"]
            - "איזה מילה היא תואר במשפט 'The tall boy smiled'?" with options: ["boy", "tall", "smiled", "The"]
            - "מהו שם העצם במשפט 'Birds fly over trees'?" with options: ["fly", "over", "Birds", "trees"]`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: isMultiPage 
                  ? `Please analyze these ${images.length} homework pages and create English learning questions based on all the content.`
                  : 'Please analyze this homework image and create English learning questions based on it.'
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