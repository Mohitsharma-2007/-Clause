import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { query } = await req.json()

        if (!query) {
            throw new Error('Query is required')
        }

        // 1. Initialize Gemini
        const googleApiKey = Deno.env.get('GEMINI_API_KEY')
        if (!googleApiKey) {
            throw new Error('GEMINI_API_KEY not configured')
        }
        const genAI = new GoogleGenerativeAI(googleApiKey)
        const embeddingModel = genAI.getGenerativeModel({ model: "models/text-embedding-004" })

        // 2. Generate Embedding for Query
        const embeddingResult = await embeddingModel.embedContent({
            content: { parts: [{ text: query }] },
            taskType: "retrieval_query"
        })
        const embedding = embeddingResult.embedding.values

        // 3. Search Vector Store (Supabase)
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        const supabase = createClient(supabaseUrl!, supabaseKey!)

        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.4, // Adjust threshold as needed
            match_count: 5
        })

        if (error) throw error

        // 4. Generate Answer
        const context = documents?.map((d: { content: string }) => d.content).join("\n---\n") || "No relevant documents found."

        const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const prompt = `
    You are an intelligent compliance assistant. Use the following context to answer the user's question.
    If the answer is not in the context, say "I don't have enough information in the Knowledge Vault."
    
    Context:
    ${context}
    
    User Question: ${query}
    
    Answer:
    `

        const result = await chatModel.generateContent(prompt)
        const responseText = result.response.text()

        return new Response(
            JSON.stringify({
                answer: responseText,
                reasoning: "Generated based on vector similarity search of indexed documents.",
                context_used: documents
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        )
    }
})
