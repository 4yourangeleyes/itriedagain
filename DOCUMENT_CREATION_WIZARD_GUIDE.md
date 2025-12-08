# Document Creation Wizard - Implementation Guide

## Overview
Complete multi-step document creation flow that guides users through:
1. **Client Selection** - Choose existing client or add new one
2. **Document Type Selection** - Invoice or Contract
3. **Contract Type Selection** - (Only for contracts) Choose from 11 contract types

## Components Created

### DocumentCreationWizard.tsx
**Location:** `components/DocumentCreationWizard.tsx`

**Features:**
- ✅ 3-step wizard with visual progress indicator
- ✅ Client selection from existing clients
- ✅ "Add New Client" form with validation
- ✅ Invoice vs Contract selection with descriptive cards
- ✅ 11 contract type options with icons and descriptions
- ✅ Back button navigation between steps
- ✅ Clean, gritty design matching app aesthetic

**Props:**
```typescript
interface DocumentCreationWizardProps {
  onClose: () => void;
  onComplete: (client: Client, docType: DocType, contractType?: ContractType) => void;
  existingClients: Client[];
  onAddClient: (client: Client) => void;
}
```

## Integration Points

### App.tsx Changes

1. **Import Added:**
```typescript
import { DocumentCreationWizard } from './components/DocumentCreationWizard';
import { ContractType } from './types';
```

2. **Layout Component Updated:**
- Added `onShowWizard` prop to Layout component
- Plus button now calls `onShowWizard()` instead of `navigate('/canvas')`
- Menu "Create Document" item also calls `onShowWizard()`

3. **AppRoutes Component:**
- Added `showWizard` state
- Added `handleWizardComplete` function that:
  - Creates properly configured DocumentData
  - Sets correct theme (swiss for invoices, legal for contracts)
  - Includes client information
  - Sets contract type if applicable
  - Navigates to canvas with pre-populated document

4. **Wizard Rendering:**
```typescript
{showWizard && (
  <DocumentCreationWizard
    onClose={() => setShowWizard(false)}
    onComplete={handleWizardComplete}
    existingClients={clients}
    onAddClient={saveClient}
  />
)}
```

## User Flow

### Creating an Invoice
1. User clicks Plus button (header) or "Create Document" (menu)
2. Wizard opens showing client selection
3. User selects existing client OR clicks "Add New Client"
   - If adding: Fill in business name, email, phone, address, registration number
   - Form validates required fields (business name, email)
4. User clicks on Invoice card
5. Document created immediately with:
   - Selected client information
   - DocType.INVOICE
   - Swiss theme (default)
   - Empty items array
   - Currency from profile
6. Navigate to canvas with pre-configured document

### Creating a Contract
1. User clicks Plus button (header) or "Create Document" (menu)
2. Wizard opens showing client selection
3. User selects or creates client (same as invoice flow)
4. User clicks on Contract card
5. **Step 3 appears** - Contract type selection showing 11 options:
   - 📋 SERVICE_AGREEMENT - General professional services
   - 🚀 PROJECT_CONTRACT - Specific project with deliverables
   - 🔄 RETAINER - Ongoing monthly services
   - 🔒 NDA - Non-disclosure agreement
   - 🤝 SHAREHOLDER - Shareholder agreement
   - 💼 EMPLOYMENT - Employment contract
   - 💡 CONSULTING - Consulting services
   - 🔧 MAINTENANCE - Maintenance & support
   - 📜 LICENSE - Software/IP licensing
   - 🤝 PARTNERSHIP - Business partnership
   - 🛟 SUPPORT - Technical support agreement
6. User selects contract type
7. Document created with:
   - Selected client information
   - DocType.CONTRACT
   - Selected contract type
   - Legal theme (default)
   - Empty clauses array
   - Currency from profile
8. Navigate to canvas with pre-configured document

## Visual Features

### Progress Indicator
- Horizontal progress bar showing completed steps
- Color coding:
  - **Gray**: Incomplete step
  - **Orange (grit-primary)**: Current step
  - **Green**: Completed step
- Text labels: "1. CLIENT", "2. TYPE", "3. CONTRACT" (if applicable)

### Client Selection Cards
- Hover effects with grit-primary border
- Shows business name, email, phone
- Arrow icon indicating selection

### Document Type Cards
- Large icons (FileText for Invoice, FileSignature for Contract)
- Color-coded:
  - **Green** for Invoice
  - **Purple** for Contract
- Feature list bullets
- Hover scale effect on icons

### Contract Type Grid
- 3-column grid (responsive)
- Emoji icons for visual categorization
- Descriptive text explaining each contract type
- Hover effects matching app theme

### New Client Form
- Clean input fields using app's Input component
- Required field indicators (*)
- Cancel and Create buttons
- Validation on submit

## Technical Details

### Type Safety
All components fully typed with TypeScript:
- Client interface
- DocType enum
- ContractType enum
- DocumentData interface

### State Management
- Wizard maintains internal state for current step
- Selected client, doc type, and contract type stored locally
- Completion triggers callback to parent with all selections

### Integration with Existing Code
- Uses existing `Client` type and structure
- Compatible with `saveClient` hook
- Creates `DocumentData` matching existing structure
- Integrates with existing navigation (React Router)
- Uses existing theme system (InvoiceTheme, ContractTheme)

## Contract Type Mapping

The wizard uses `getContractTypeInfo()` helper function that maps each ContractType enum value to:
- **Icon**: Emoji representation
- **Description**: Short explanation of contract purpose

This can be easily extended or customized for additional contract types.

## Backwards Compatibility

### CanvasScreen Behavior
The existing CanvasScreen creates a blank document when `doc` is null:
```typescript
if (!doc) {
  const blankDoc: DocumentData = {
    id: Date.now().toString(), 
    type: DocType.INVOICE, 
    status: 'Draft', 
    title: 'New Invoice',
    client: { id: 'temp', businessName: 'Client Name', email: '' },
    // ...
  };
  updateDoc(blankDoc);
}
```

With the wizard:
- `doc` is **never null** when navigating to canvas
- Document is pre-configured with real client data
- The blank document creation code path is bypassed
- Existing document editing functionality unchanged

## Future Enhancements

Potential improvements:
1. **Client Search/Filter** - Add search bar for large client lists
2. **Recent Clients** - Show recently used clients at top
3. **Template Preview** - Show contract clause preview before creation
4. **Quick Actions** - "Create Invoice for Last Client" shortcut
5. **Keyboard Navigation** - Arrow keys for navigation, Enter to select
6. **Analytics** - Track most used contract types
7. **Favorites** - Mark favorite clients for quick access

## Testing Checklist

- [ ] Plus button opens wizard
- [ ] Menu "Create Document" opens wizard
- [ ] Close button dismisses wizard
- [ ] Back button navigates to previous step
- [ ] Can select existing client
- [ ] Can add new client with validation
- [ ] Invoice flow completes in 2 steps
- [ ] Contract flow shows 3rd step
- [ ] All 11 contract types are selectable
- [ ] Document created with correct client data
- [ ] Document created with correct type
- [ ] Document created with correct contract type
- [ ] Canvas opens with pre-configured document
- [ ] Theme is correct (swiss for invoice, legal for contract)

## Files Modified

1. **Created:**
   - `components/DocumentCreationWizard.tsx` (323 lines)

2. **Modified:**
   - `App.tsx`:
     - Added DocumentCreationWizard import
     - Added showWizard state
     - Modified Plus button behavior
     - Modified menu "Create Document" behavior
     - Added handleWizardComplete function
     - Added wizard rendering

## Success Metrics

✅ User no longer sees "Client Name" placeholder  
✅ User chooses client before creating document  
✅ User can add new clients inline  
✅ Separate invoice and contract creation flows  
✅ Contract type selection before document creation  
✅ Clean, intuitive multi-step experience  
✅ Consistent with gritDocs design language  

---

**Implementation Date:** January 2025  
**Status:** ✅ Complete and Integrated
