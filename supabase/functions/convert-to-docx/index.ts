
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  html: string;
  filename: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const { html, filename } = await req.json() as RequestBody;

    if (!html) {
      throw new Error("HTML content is required");
    }

    // Call a service like CloudConvert or similar to convert HTML to DOCX
    // This is a placeholder - in a real implementation, you would use a service API
    
    // For this example, we'll store the HTML in a temporary bucket and return a URL
    // In a real implementation, you would convert this to DOCX first
    
    // Create a temporary file with unique name
    const tempFileName = `${filename}_${Date.now()}.html`;
    
    // Store the HTML file in storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('temp-files')
      .upload(tempFileName, new Blob([html], { type: 'text/html' }), {
        contentType: 'text/html',
        upsert: true,
      });
      
    if (uploadError) {
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }
    
    // Get a public URL for the file
    const { data: urlData } = await supabaseAdmin
      .storage
      .from('temp-files')
      .createSignedUrl(tempFileName, 300); // URL valid for 5 minutes
      
    if (!urlData?.signedUrl) {
      throw new Error("Failed to generate signed URL");
    }
    
    return new Response(
      JSON.stringify({ 
        url: urlData.signedUrl,
        message: "Note: This is HTML format. In a production environment, this would be converted to DOCX."
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in convert-to-docx function:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
