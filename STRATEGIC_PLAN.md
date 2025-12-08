# Strategic Development Plan: GrittyNitty Proto

**Date:** November 29, 2025  
**Status:** Phase 1 Complete - Planning Phases 2-4

---

## ✅ COMPLETED: Phase 1 - Core Foundation

### Authentication & Database
- ✅ Supabase authentication with email/password
- ✅ Profile creation with industry-specific setup
- ✅ Client management with proper UUID generation
- ✅ Document storage and retrieval
- ✅ RLS (Row Level Security) policies implemented

### Template System
- ✅ Industry-specific template blocks (Plumber, Mechanic, Catering)
- ✅ Template block selection and insertion
- ✅ Template blocks display correctly in all 9 invoice themes
- ✅ User can create custom template blocks

### Invoice Design
- ✅ 9 professional invoice themes:
  - Swiss (default minimal)
  - Geometric (Bauhaus-inspired)
  - Blueprint (editorial magazine style)
  - Modernist (creative studio gradients)
  - Minimal (luxury gold accents)
  - Artisan (warm earthy tones)
  - Corporate (professional blue)
  - Brutalist (bold black/yellow)
  - Asymmetric (dynamic layout)
- ✅ Template block headings in all themes
- ✅ PDF export functionality
- ✅ Email sending with PDF attachments

### Deployment
- ✅ Netlify deployment configured
- ✅ CI/CD pipeline from GitHub
- ✅ Environment variables configured
- ✅ Live site: https://monumental-axolotl-b1c008.netlify.app

---

## 🔄 PHASE 2: AI Functionality (PRIORITY)

### Current State
- ⚠️ Gemini AI integration exists but limited functionality
- ⚠️ Edge function deployed but needs enhancement
- ⚠️ "Napkin sketch" mode on scope page underutilized
- ⚠️ No conversational AI interface

### Objectives
**Goal:** Make AI the centerpiece of document creation - users can describe their job in natural language and AI generates professional invoices/contracts.

### Implementation Steps

#### 2.1 Enhanced Edge Function (Week 1)
**File:** `/supabase/functions/generate-document/index.ts`

**Tasks:**
1. **Improve prompts** for better structured output
   - Add industry-specific context (plumbing, mechanic, catering)
   - Include pricing guidance based on South African market
   - Add template block awareness (use existing blocks as examples)

2. **Add conversation memory**
   - Store chat history in Supabase `conversations` table
   - Allow multi-turn refinement ("add more items", "make it cheaper")
   - Context: previous messages + user's industry + profile

3. **Enhanced parsing**
   - Better quantity extraction ("3 hours" → quantity: 3, unit: hrs)
   - Price intelligence (suggest prices based on industry averages)
   - Template block matching (if user says "bathroom installation", pull from plumbing templates)

**Database Schema Addition:**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  messages JSONB NOT NULL, -- [{role: 'user'|'assistant', content: string, timestamp: string}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2.2 Conversational Chat Interface (Week 2)
**File:** `/screens/ChatScreen.tsx`

**Current:** Step-by-step wizard (Client → Scope → Review → Generate)  
**New:** AI-first conversational flow

**Implementation:**
1. **Replace wizard with chat UI**
   - Large chat window with message bubbles
   - User types: "I need an invoice for John's bathroom renovation"
   - AI responds: "Great! I'll help you create that invoice. What work did you do?"
   - User: "Removed old toilet, installed new one, retiled floor"
   - AI: "Got it! Let me add those items..." (shows 3 line items)

2. **Smart suggestions**
   - AI detects missing info: "What's the client's email?"
   - AI suggests template blocks: "I found 'Bathroom Installation' template - want to use it?"
   - AI asks for review: "Does R15,750 total sound right?"

3. **Voice input enhancement**
   - Already have speech recognition code
   - Add better processing: "I replaced the geyser and fixed a leak for Mrs Johnson"
   - AI extracts: Client=Mrs Johnson, Items=[Geyser replacement, Leak repair]

4. **Context-aware refinements**
   - "Add a 50% deposit"
   - "Make the prices 20% higher"
   - "Change the shower mixer to R450"
   - "Send this to john@email.com"

**UI Changes:**
```tsx
// New chat-first interface
<div className="flex flex-col h-full">
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    {messages.map(msg => (
      <ChatBubble 
        role={msg.role} 
        content={msg.content}
        items={msg.items} // Preview line items in chat
      />
    ))}
  </div>
  
  <div className="p-4 border-t">
    <textarea 
      value={input}
      placeholder="Describe your job in your own words..."
      onSend={handleSendMessage}
    />
    <div className="flex gap-2 mt-2">
      <button onClick={startVoiceInput}>🎤 Speak</button>
      <button onClick={useTemplate}>📋 Use Template</button>
    </div>
  </div>
</div>
```

#### 2.3 Template Block AI Matching (Week 3)
**File:** `/services/geminiService.ts`

**Feature:** When AI generates items, match them to existing template blocks

**Logic:**
1. User says: "I did a brake job"
2. AI generates: "Brake pads replacement, Brake disc resurfacing"
3. Service checks: "Do we have 'Braking System' template block?"
4. If yes: Pull prices from template instead of guessing
5. Advantage: Consistent pricing, faster generation

**Implementation:**
```typescript
async function matchItemsToTemplates(
  items: DocumentItem[],
  templates: TemplateBlock[]
): Promise<DocumentItem[]> {
  // Use AI to semantically match descriptions
  // "brake pads" → finds "Brake Pads Set (Front - Ceramic)" in MECHANIC_TEMPLATES
  // Returns merged items with template prices
}
```

#### 2.4 Smart Document Suggestions (Week 4)
**File:** New `/services/aiSuggestions.ts`

**Features:**
- Detect if invoice needs deposit term (>R10k)
- Suggest warranty clause for installations
- Recommend payment terms based on client history
- Flag unusual prices (way too high/low vs templates)

**UI Integration:**
```tsx
// In CanvasScreen.tsx - add AI suggestions panel
{aiSuggestions.length > 0 && (
  <div className="bg-blue-50 border-2 border-blue-300 p-4">
    <h4>💡 AI Suggestions</h4>
    {aiSuggestions.map(suggestion => (
      <button onClick={() => applySuggestion(suggestion)}>
        {suggestion.message}
      </button>
    ))}
  </div>
)}
```

### Success Metrics
- [ ] User can create invoice in <60 seconds using AI chat
- [ ] 80%+ of AI-generated items have correct prices (from templates)
- [ ] Voice input works reliably for common phrases
- [ ] Users prefer AI mode over manual entry (track usage)

---

## 📄 PHASE 3: Contracts vs Invoices (PRIORITY)

### Current Problem
- Contracts use same structure as invoices (line items)
- No proper contract clauses UI
- No e-signature functionality
- No contract templates beyond basic structure

### Objectives
**Goal:** Differentiate contracts with legal clauses, terms, e-signatures, and proper formatting.

### Implementation Steps

#### 3.1 Contract Data Model Enhancement (Week 5)
**File:** `/types.ts`

**Current:**
```typescript
export interface DocumentData {
  type: DocType; // INVOICE | CONTRACT | HRDOC
  items?: InvoiceItem[]; // Used for both invoices AND contracts
  // No contract-specific fields!
}
```

**New:**
```typescript
export interface ContractClause {
  id: string;
  title: string;
  content: string;
  order: number;
  required?: boolean; // e.g., liability clause is required
}

export interface ContractTerms {
  startDate: string;
  endDate?: string;
  paymentSchedule: 'upfront' | 'milestone' | 'monthly' | 'completion';
  milestones?: Array<{
    name: string;
    dueDate: string;
    amount: number;
    description: string;
  }>;
  cancellationPolicy?: string;
  warrantyPeriod?: string; // "6 months", "1 year"
}

export interface DocumentData {
  // ... existing fields
  
  // Invoice-specific
  items?: InvoiceItem[];
  subtotal?: number;
  taxTotal?: number;
  total?: number;
  
  // Contract-specific
  clauses?: ContractClause[];
  terms?: ContractTerms;
  scope?: string; // Detailed scope of work
  signatures?: Array<{
    party: 'client' | 'provider';
    name: string;
    signedAt?: string;
    signatureData?: string; // Base64 signature image
  }>;
}
```

#### 3.2 Contract Template System (Week 6)
**File:** `/services/contractTemplates.ts`

**Templates to Create:**
1. **Service Agreement** (Plumber, Mechanic, Catering)
   - Scope of work
   - Payment terms
   - Timeline
   - Warranty clause
   - Liability limitation

2. **Project Contract** (Construction, Renovation)
   - Milestones with dates
   - Payment schedule (e.g., 30% deposit, 40% midway, 30% completion)
   - Change order clause
   - Force majeure

3. **Recurring Service** (Maintenance, Retainer)
   - Monthly fee structure
   - Service level agreement (SLA)
   - Termination notice period
   - Auto-renewal terms

**Example:**
```typescript
export const SERVICE_AGREEMENT_TEMPLATE: ContractClause[] = [
  {
    id: '1',
    title: 'Scope of Work',
    content: `The Service Provider agrees to perform the following work:
    
[AI will insert generated scope here based on chat]

All work will be completed in a professional manner according to industry standards.`,
    order: 1,
    required: true
  },
  {
    id: '2',
    title: 'Payment Terms',
    content: `Client agrees to pay [TOTAL] as follows:
- Deposit: [DEPOSIT_AMOUNT] due on signing
- Balance: [BALANCE] due on completion

Payment methods accepted: EFT, Cash, Card`,
    order: 2,
    required: true
  },
  // ... more clauses
];
```

#### 3.3 Contract Editor UI (Week 7)
**File:** `/screens/CanvasScreen.tsx` (enhanced)

**New Contract Mode:**
```tsx
{doc.type === DocType.CONTRACT && (
  <div className="contract-editor">
    {/* Header */}
    <h1 className="text-3xl font-bold text-center">SERVICE AGREEMENT</h1>
    <div className="parties">
      <div>
        <h3>Service Provider</h3>
        <p>{profile.companyName}</p>
        <p>{profile.address}</p>
      </div>
      <div>
        <h3>Client</h3>
        <p>{doc.client.businessName}</p>
        <p>{doc.client.address}</p>
      </div>
    </div>
    
    {/* Scope of Work */}
    <section>
      <h2>Scope of Work</h2>
      <textarea 
        value={doc.scope}
        onChange={(e) => updateDoc({...doc, scope: e.target.value})}
        className="w-full border p-4 min-h-32"
      />
    </section>
    
    {/* Payment Schedule (if milestones) */}
    {doc.terms?.paymentSchedule === 'milestone' && (
      <section>
        <h2>Payment Milestones</h2>
        {doc.terms.milestones?.map((m, i) => (
          <div key={i} className="milestone-item">
            <input value={m.name} />
            <input type="date" value={m.dueDate} />
            <input type="number" value={m.amount} />
          </div>
        ))}
      </section>
    )}
    
    {/* Clauses */}
    <section>
      <h2>Terms & Conditions</h2>
      {doc.clauses?.sort((a,b) => a.order - b.order).map(clause => (
        <div key={clause.id} className="clause">
          <h3>{clause.title}</h3>
          <textarea 
            value={clause.content}
            onChange={(e) => updateClause(clause.id, e.target.value)}
          />
        </div>
      ))}
      <button onClick={addClause}>+ Add Clause</button>
    </section>
    
    {/* Signatures */}
    <section className="signatures">
      <div>
        <h3>Service Provider Signature</h3>
        {doc.signatures?.[0]?.signatureData ? (
          <img src={doc.signatures[0].signatureData} />
        ) : (
          <button onClick={() => openSignaturePad('provider')}>
            Sign Here
          </button>
        )}
      </div>
      <div>
        <h3>Client Signature</h3>
        {doc.signatures?.[1]?.signatureData ? (
          <img src={doc.signatures[1].signatureData} />
        ) : (
          <p className="text-gray-400">Client will sign electronically</p>
        )}
      </div>
    </section>
  </div>
)}
```

#### 3.4 E-Signature Implementation (Week 8)
**Library:** `react-signature-canvas` or `signature_pad`

**Features:**
1. **Provider signature** (in app)
   - Draw signature on canvas
   - Save as base64 image
   - Attach to contract

2. **Client signature** (via email link)
   - Email contains: "Review and sign your contract"
   - Link to public page: `/contract/{id}/sign`
   - Client reviews contract → clicks "I Agree" → draws signature
   - Signature saved to database → status changes to "Signed"

**Public Signature Page:**
```tsx
// /screens/PublicContractSign.tsx
const PublicContractSign = () => {
  const { contractId } = useParams();
  const [contract, setContract] = useState<DocumentData | null>(null);
  const [agreed, setAgreed] = useState(false);
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1>Contract Review & Signature</h1>
      
      {/* Display contract content (read-only) */}
      <ContractViewer doc={contract} />
      
      {/* Agreement checkbox */}
      <label>
        <input 
          type="checkbox" 
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        I have read and agree to the terms above
      </label>
      
      {/* Signature pad */}
      {agreed && (
        <>
          <SignatureCanvas 
            ref={sigPadRef}
            canvasProps={{width: 500, height: 200}}
          />
          <button onClick={handleSign}>
            Sign Contract
          </button>
        </>
      )}
    </div>
  );
};
```

#### 3.5 Contract-Specific Themes (Week 9)
**File:** `/components/ContractThemeRenderer.tsx`

**Professional contract layouts:**
1. **Legal** theme - Traditional legal document style
2. **Modern** theme - Clean, contemporary
3. **Executive** theme - Premium, letterhead-style

**Features:**
- Page numbers on multi-page contracts
- Automatic table of contents for clauses
- Signature blocks properly formatted
- Watermark for draft versions

### Success Metrics
- [ ] Contracts have professional legal appearance
- [ ] Users can add/edit clauses easily
- [ ] E-signature flow works smoothly
- [ ] Contracts clearly different from invoices

---

## 🚀 PHASE 4: Advanced Features (Future)

### 4.1 Advanced AI Features
- **Document analysis:** Upload competitor invoice → AI extracts format/pricing
- **Smart pricing:** AI learns from your past invoices to suggest prices
- **Anomaly detection:** "This price is 300% higher than your usual - intentional?"
- **Client insights:** "Client X pays 15% faster when you add deposit term"

### 4.2 Collaboration
- **Multi-user accounts:** Team members with different roles
- **Approval workflow:** Junior creates invoice → Senior approves → Sent
- **Comments:** Team can leave notes on documents
- **Version history:** Track all changes to documents

### 4.3 Financial Integration
- **Payment links:** Generate PayFast/Yoco payment links in invoices
- **Accounting sync:** Export to Xero/QuickBooks/Sage
- **Financial dashboard:** Revenue tracking, outstanding invoices
- **Recurring invoices:** Auto-generate monthly invoices

### 4.4 Mobile App
- **React Native:** iOS + Android apps
- **Offline mode:** Create invoices without internet
- **Camera:** Scan receipts for expense tracking
- **Push notifications:** "Invoice #123 has been paid!"

---

## 📊 PRIORITY ROADMAP

### Immediate (Next 2 Weeks)
1. ✅ Fix "Add All" → "Select All" button
2. ✅ Add template block button to Canvas
3. 🔄 Enhanced AI prompts in edge function
4. 🔄 Chat-based document creation UI

### Short-term (Month 1)
5. Contract data model + clauses
6. Contract template system
7. Contract-specific editor UI
8. E-signature for contracts

### Medium-term (Months 2-3)
9. Voice input improvements
10. Template block AI matching
11. Smart document suggestions
12. Contract themes

### Long-term (Months 4-6)
13. Multi-user collaboration
14. Payment integration
15. Mobile app development
16. Advanced AI features

---

## 🎯 NEXT STEPS (This Week)

### Day 1-2: AI Enhancement
- [ ] Update edge function prompts with industry context
- [ ] Add conversation history support
- [ ] Test multi-turn conversations

### Day 3-4: Chat UI Redesign
- [ ] Build conversational chat interface
- [ ] Integrate with enhanced edge function
- [ ] Add live item preview in chat

### Day 5-7: Contract Foundation
- [ ] Create contract data models
- [ ] Build basic contract template
- [ ] Start contract editor UI

---

## 💡 KEY PRINCIPLES

1. **AI-First:** Make AI the primary way users create documents
2. **Speed:** Users should create professional docs in <60 seconds
3. **Intelligence:** Learn from user behavior to get smarter
4. **Professional:** Output must look like it came from a design agency
5. **South African:** Pricing, terms, language suited for SA market

---

**Next Review:** December 6, 2025  
**Questions/Feedback:** Add to GitHub Issues
