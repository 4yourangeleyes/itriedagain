// Supabase Edge Function: generate-document
// Deploy with: supabase functions deploy generate-document
// This function securely calls Google GenAI using your API key stored as a Supabase secret
// @ts-ignore - This is a Deno Edge Function, not Node.js/Browser code
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Deno/npm imports
import { GoogleGenAI, Type, Schema } from "npm:@google/genai@^1.30.0"

// Types
interface GenerateDocumentRequest {
  prompt: string
  docType: "INVOICE" | "CONTRACT" | "HRDOC"
  clientName: string
  businessName: string
  industry?: string // NEW: Industry context
  conversationHistory?: Array<{role: string, content: string}> // NEW: Chat history
  templateContext?: string // NEW: Available templates for price matching
}

interface DocumentItem {
  description: string
  quantity: number
  unitType: string
  price: number
}

interface DocumentClause {
  title: string
  content: string
}

interface GenerateDocumentResponse {
  title?: string
  items?: DocumentItem[]
  clauses?: DocumentClause[]
  bodyText?: string
  error?: string
}

// Zod-like validation helper
function validateRequest(body: unknown): GenerateDocumentRequest {
  const data = body as Record<string, unknown>
  
  if (!data.prompt || typeof data.prompt !== 'string') {
    throw new Error('Missing or invalid prompt')
  }
  if (!data.docType || !['INVOICE', 'CONTRACT', 'HRDOC'].includes(data.docType as string)) {
    throw new Error('Missing or invalid docType')
  }
  if (!data.clientName || typeof data.clientName !== 'string') {
    throw new Error('Missing or invalid clientName')
  }
  if (!data.businessName || typeof data.businessName !== 'string') {
    throw new Error('Missing or invalid businessName')
  }

  // Optional fields - validated but not required
  if (data.industry && typeof data.industry !== 'string') {
    throw new Error('Invalid industry type')
  }
  if (data.conversationHistory && !Array.isArray(data.conversationHistory)) {
    throw new Error('Invalid conversationHistory type')
  }
  if (data.templateContext && typeof data.templateContext !== 'string') {
    throw new Error('Invalid templateContext type')
  }

  // @ts-ignore - Deno type casting
  return data as GenerateDocumentRequest
}

// Schema for structured output
const documentSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Title of the document" },
    items: {
      type: Type.ARRAY,
      description: "List of items for an invoice",
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unitType: { type: Type.STRING, description: "Unit of measure: 'hrs', 'ea', 'm', 'days', 'ft', 'sqm'" },
          price: { type: Type.NUMBER }
        }
      }
    },
    clauses: {
      type: Type.ARRAY,
      description: "List of clauses for a contract",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING }
        }
      }
    },
    bodyText: { type: Type.STRING, description: "General body text for HR docs" }
  }
}

// Industry-specific context helper
function getIndustryContext(industry: string): string {
  const contexts: Record<string, string> = {
    'Plumber': `You specialize in plumbing services including: bathroom renovations, geyser installations, pipe repairs, toilet installations, shower installations, drainage work, and waterproofing. Common services: toilet removal/installation (R550-R3500), geyser installation (R3400-R5000), tiling (R320/sqm), plumbing labour (R450-650/hr).`,
    'Mechanic': `You specialize in automotive repairs including: diagnostics, brake systems, suspension, engine work, electrical systems, air conditioning. Common services: diagnostic scan (R550), brake pads (R1200-R1800), oil change (R450-R800), alternator replacement (R2200-R3500).`,
    'Catering': `You specialize in event catering including: canapes, main courses, desserts, beverages, staffing, equipment hire. Common pricing: buffet packages (R280-R450 per person), staffing (R180-R450/hr), equipment hire (R25-R85 per item).`,
    'Carpenter': `You specialize in carpentry work including: door installation, shelving, cupboards, decking, structural timber work. Labour rates R400-600/hr.`,
    'Construction': `You specialize in construction work including: building, renovations, extensions, roofing, foundations. Project-based pricing with milestone payments.`,
  };
  return contexts[industry] || 'You provide general professional services.';
}

// Pricing guidance helper
function getPricingGuidance(industry: string): string {
  return `
SOUTH AFRICAN MARKET PRICING (2025):
- Skilled labour: R350-650 per hour
- VAT (15%) calculated separately
- Materials typically marked up 15-25%
- Call-out fees: R450-750 for service industries
- Consider travel/distance for pricing

PRICING STRATEGY:
- Be competitive but fair
- Match template prices when available (ensures consistency)
- Round to nearest R10 or R50 for clean invoices
- Include labour separately from materials
  `;
}

serve(async (req: Request) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Parse and validate request
    const body = await req.json()
    
    // 0. Health Check (Ping)
    if (body.ping) {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'AI service is online' }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    const request = validateRequest(body)

    // Rate limit check (basic: 10 requests per minute per IP)
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown'
    const cacheKey = `rate_limit:${clientIp}`
    // In production, use Deno.redis or similar for rate limiting
    // For now, we'll rely on Supabase's built-in rate limiting

    // Get API key from environment
    // @ts-ignore - Deno global
    const apiKey = Deno.env.get('GENAI_API_KEY')
    if (!apiKey) {
      throw new Error('GENAI_API_KEY not configured on server')
    }

    // Build system prompt with industry-specific context
    const industryContext = getIndustryContext(request.industry || 'General')
    const pricingGuidance = getPricingGuidance(request.industry || 'General')
    
    const systemInstruction = `
You are an expert South African business document generator for "${request.businessName}".
Industry: ${request.industry || 'General Services'}
Client: ${request.clientName}
Document Type: ${request.docType}

${industryContext}

${pricingGuidance}

${request.templateContext ? `AVAILABLE TEMPLATES WITH PRICING:\n${request.templateContext}\n\nWhen the user mentions work that matches these templates, USE THE EXACT PRICES from the templates. This ensures consistent, market-tested pricing.\n` : ''}

CRITICAL INSTRUCTIONS FOR ${request.docType}:

${request.docType === 'INVOICE' ? `
INVOICE GENERATION:
1. Extract ALL work items mentioned by the user
2. For each item, provide:
   - Clear, professional description (specific product/service names)
   - Realistic quantity based on context
   - Correct unitType: 'hrs' (labour/time), 'ea' (items/units), 'm' (length), 'sqm' (area), 'set' (grouped items), 'days' (time)
   - Market-appropriate price in South African Rands (R)
3. Match to template prices when possible (user may say "bathroom renovation" → check templates for bathroom-related items)
4. Include labour separately from materials
5. Be specific: "Brake Pads Set (Front - Ceramic)" not just "Brake pads"
6. Generate a professional title like "Bathroom Renovation - [Client Name]" or "Vehicle Service - [Client Name]"

SOUTH AFRICAN PRICING CONTEXT:
- Labour rates: R350-650/hour (skilled trades)
- Consider VAT (15%) is calculated separately
- Prices should reflect 2025 South African market
- If user says "the usual" or "standard job", infer from industry context

EXAMPLE GOOD OUTPUT:
{
  "title": "Bathroom Renovation - Smith Residence",
  "items": [
    {"description": "Removal of existing toilet and concealed system", "quantity": 1, "unitType": "ea", "price": 1500},
    {"description": "Installation of new wall-hung toilet (Geberit system)", "quantity": 1, "unitType": "ea", "price": 3200},
    {"description": "Plumber labour (2 hours)", "quantity": 2, "unitType": "hrs", "price": 450}
  ]
}
` : request.docType === 'CONTRACT' ? `
CONTRACT GENERATION:
1. Generate professional legal clauses appropriate for South African law
2. Include standard clauses: Scope of Work, Payment Terms, Timeline, Warranty, Liability
3. Be specific about payment schedule (deposit %, balance on completion)
4. Include cancellation policy
5. Professional, legally sound language
6. Generate a title like "Service Agreement - [Client Name]"

EXAMPLE GOOD OUTPUT:
{
  "title": "Service Agreement - Johnson Construction Project",
  "clauses": [
    {
      "title": "Scope of Work",
      "content": "The Service Provider agrees to perform the following work as described by the Client: [specific work from user prompt]. All work will be completed according to South African building codes and industry standards."
    },
    {
      "title": "Payment Terms", 
      "content": "Total contract value: R[AMOUNT]. Payment schedule: 50% deposit (R[DEPOSIT]) due on signing, remaining 50% due on completion. Payment methods accepted: EFT, Cash."
    },
    {
      "title": "Warranty",
      "content": "All workmanship is warranted for 6 months from completion date. Materials are covered by manufacturer warranties."
    }
  ]
}
` : `
HR DOCUMENT GENERATION:
Generate professional HR documentation based on the user's request.
Use formal business language appropriate for South African workplace.
`}

TONE: Professional, clear, specific
CURRENCY: Always South African Rand (R)
FORMAT: Return ONLY valid JSON matching the schema. NO markdown, NO code blocks, NO explanations.

${request.conversationHistory && request.conversationHistory.length > 0 ? `
CONVERSATION HISTORY (for context):
${request.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Build upon this conversation. If user says "add more", "change price", "make it cheaper", reference the previous context.
` : ''}
    `.trim()

    // Initialize Google GenAI
    const ai = new GoogleGenAI({ apiKey })
    const modelName = 'gemini-2.0-flash-exp'

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: modelName,
      contents: request.prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: documentSchema
      }
    })

    const responseText = response.text || "{}"
    
    // Parse and validate response
    let result: GenerateDocumentResponse
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText)
      return new Response(
        JSON.stringify({ error: 'Invalid response from AI model' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Basic sanitization: ensure numbers are valid
    if (result.items) {
      result.items = result.items.map(item => ({
        description: (item.description || '').substring(0, 500),
        quantity: Math.max(0, Number(item.quantity) || 1),
        unitType: (item.unitType || 'ea').substring(0, 20),
        price: Math.max(0, Number(item.price) || 0)
      }))
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )

  } catch (error) {
    console.error('Error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const status = errorMessage.includes('rate limit') ? 429 : 500

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
