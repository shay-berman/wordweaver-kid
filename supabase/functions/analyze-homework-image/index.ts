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
            content: `You are an English teacher creating a full learning path with multiple chapters based on homework images. 
            Analyze the homework content and create ${chaptersCount} progressive chapters, each with ${questionsPerChapter} questions.
            ${isMultiPage ? 'You are seeing multiple pages of homework - analyze all pages together to create comprehensive learning path.' : ''}
            
            Create a learning path that progresses from basic concepts to more advanced ones across the chapters.
            
            FIRST: Identify the type of exercises in the homework:
            1. Multiple choice questions
            2. Fill-in-the-blank sentences 
            3. Parts of speech identification (noun, verb, adjective, etc.)
            4. Grammar exercises
            5. Vocabulary exercises
            
            Based on the exercise types, create questions with appropriate formats across all chapters:
            
            For PARTS OF SPEECH identification - use "highlight" type:
            - Present the sentence and ask to identify specific word types
            - Provide the sentence as highlightable text
            
            For FILL-IN-THE-BLANK - use "fill_blank" type:
            - Show sentence with blank and ask to complete it
            
            For GENERAL questions - use "multiple_choice" type:
            - Standard 4-option multiple choice
            
            Return response in this EXACT JSON format:
            {
              "pathName": "${pathName || 'מסלול שיעורי בית'}",
              "description": "תיאור קצר של מסלול הלימוד בעברית", 
              "difficulty": "beginner|intermediate|advanced",
              "chapters": [
                {
                  "id": "chapter-1",
                  "title": "כותרת הפרק בעברית",
                  "description": "תיאור הפרק",
                  "difficulty": "easy|medium|hard",
                  "questions": [
                    {
                      "type": "highlight|fill_blank|multiple_choice",
                      "question": "שאלה ברורה בעברית",
                      "sentence": "The sentence to work with (for highlight/fill_blank types)",
                      "options": ["אפשרות 1", "אפשרות 2", "אפשרות 3", "אפשרות 4"],
                      "correctAnswer": "התשובה הנכונה",
                      "targetWord": "המילה שצריך לסמן (רק עבור highlight type)",
                      "explanation": "הסבר קצר בעברית"
                    }
                  ]
                }
              ]
            }
            
            Make sure each chapter has exactly ${questionsPerChapter} questions and focuses on different aspects or difficulty levels of the homework content.
            
            Examples by type:
            
            HIGHLIGHT type (parts of speech):
            {
              "type": "highlight",
              "question": "סמן את הפועל במשפט הבא:",
              "sentence": "She reads a book every day",
              "targetWord": "reads",
              "options": ["She", "reads", "book", "day"],
              "correctAnswer": "reads",
              "explanation": "reads הוא הפועל במשפט"
            }
            
            FILL_BLANK type:
            {
              "type": "fill_blank", 
              "question": "מלא את החסר במשפט:",
              "sentence": "I ___ to school every morning",
              "options": ["go", "goes", "going", "gone"],
              "correctAnswer": "go",
              "explanation": "I משתמש עם go בזמן הווה"
            }
            
            MULTIPLE_CHOICE type:
            {
              "type": "multiple_choice",
              "question": "איזו מילה פירושה 'ספר'?",
              "options": ["book", "look", "took", "cook"],
              "correctAnswer": "book", 
              "explanation": "book פירושו ספר בעברית"
            }`
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