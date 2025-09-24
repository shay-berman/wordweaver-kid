import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { categoryData, pathName } = await req.json();

    if (!categoryData || !pathName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: categoryData, pathName' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Creating similar path for:', pathName);

    // Call OpenAI to generate similar questions based on existing ones
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `אתה מורה לאנגלית המתמחה ביצירת שאלות דומות למסלולי למידה. 
            אתה מקבל מסלול למידה קיים ויוצר מסלול חדש דומה אך עם מילים דומות/קרובות.
            
            חוקים חשובים:
            1. שמור על רמת הקושי של השאלות המקוריות
            2. השתמש במילים דומות או קרובות במשמעות
            3. שאלות בעברית צריכות להישאר בעברית
            4. שאלות באנגלית צריכות להישאר באנגלית
            5. שמור על מבנה השאלה הקיים
            6. הסברים צריכים להיות קצרים וברורים
            
            החזר תשובה במבנה JSON הבא בדיוק:
            {
              "id": "similar-" + [id מקורי],
              "title": "[כותרת דומה]",
              "description": "[תיאור דומה]", 
              "levels": [
                {
                  "id": "similar-" + [level id מקורי],
                  "title": "[כותרת רמה דומה]",
                  "description": "[תיאור רמה דומה]",
                  "difficulty": "[same as original]",
                  "xpReward": [same as original],
                  "unlockLevel": [same as original],
                  "questions": [
                    {
                      "id": "similar-" + [question id מקורי],
                      "type": "multiple-choice",
                      "question": "[שאלה דומה]",
                      "options": ["אופציה 1", "אופציה 2", "אופציה 3", "אופציה 4"],
                      "correctAnswer": "[תשובה נכונה]",
                      "explanation": "[הסבר קצר]"
                    }
                  ]
                }
              ]
            }`
          },
          {
            role: 'user',
            content: `צור מסלול דומה בשם "${pathName}" על בסיס המסלול הבא:\n\n${JSON.stringify(categoryData, null, 2)}`
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text());
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const openAIResponse = await response.json();
    const generatedContent = openAIResponse.choices[0].message.content;

    console.log('OpenAI response received');

    // Parse the JSON response
    let similarPath;
    try {
      similarPath = JSON.parse(generatedContent);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      throw new Error('Failed to parse AI response');
    }

    console.log('Successfully created similar path:', similarPath.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        similarPath: similarPath,
        message: `מסלול דומה "${pathName}" נוצר בהצלחה!` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-similar-path function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'שגיאה ביצירת המסלול הדומה', 
        details: error instanceof Error ? error.message : 'שגיאה לא ידועה'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});