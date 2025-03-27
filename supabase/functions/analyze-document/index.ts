
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ 
        error: 'API key not found. Please set the OPENAI_API_KEY environment variable.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const { documentId, content } = await req.json();

    if (!documentId || !content) {
      return new Response(
        JSON.stringify({ error: 'Document ID and content are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Analyzing document:', documentId);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://kyhdlaewebyvhahtmmau.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call OpenAI API to analyze the document
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
            content: `You are a legal document analysis expert. Analyze the provided legal document and extract the following information:
            1. Key findings (list of potential issues, non-standard clauses, or areas of concern)
            2. Risk level (low, medium, or high)
            3. Risk score (a number between 0 and 100)
            4. Recommendations for improvement
            
            Return the results in JSON format with the following structure:
            {
              "findings": ["Finding 1", "Finding 2", ...],
              "riskLevel": "low|medium|high",
              "riskScore": number,
              "recommendations": "text with recommendations"
            }`
          },
          {
            role: 'user',
            content: content
          }
        ],
      }),
    });

    const openAiData = await response.json();
    
    if (!openAiData.choices || openAiData.choices.length === 0) {
      throw new Error('No response from OpenAI');
    }

    const analysisContent = openAiData.choices[0].message.content;
    let analysis;
    
    try {
      // Extract the JSON part from the response
      const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not extract JSON from OpenAI response');
      }
    } catch (e) {
      console.error('Error parsing OpenAI response:', e);
      // If parsing fails, create a default analysis
      analysis = {
        findings: ["Could not properly analyze document"],
        riskLevel: "medium",
        riskScore: 50,
        recommendations: "Please review the document manually or try again with a clearer document."
      };
    }

    // Update the document in the database
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        status: 'completed',
        risk_level: analysis.riskLevel,
        risk_score: analysis.riskScore,
        findings: analysis.findings,
        recommendations: analysis.recommendations
      })
      .eq('id', documentId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in analyze-document function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
