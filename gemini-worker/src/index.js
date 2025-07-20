/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      // Parse the request body
      const requestData = await request.json();
      
      // Validate request structure
      if (!requestData.contents || !Array.isArray(requestData.contents)) {
        return new Response(JSON.stringify({ error: 'Invalid request format. Expected "contents" array.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Gemini endpoint using the 2.5 flash model
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

      // Forward the request to Gemini API
      const apiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!apiRes.ok) {
        const errorText = await apiRes.text();
        console.error('Gemini API error:', errorText);
        return new Response(JSON.stringify({ 
          error: `Gemini API error: ${apiRes.status} ${apiRes.statusText}`,
          details: errorText
        }), {
          status: apiRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Parse and return the Gemini response
      const data = await apiRes.json();
      
      // Extract the response text from Gemini's response structure
      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply from Gemini model.";

      return new Response(JSON.stringify({ 
        content: responseText,
        fullResponse: data // Include full response for debugging
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch(e) {
      console.error('Worker error:', e);
      return new Response(JSON.stringify({ 
        error: e.message,
        stack: e.stack 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
