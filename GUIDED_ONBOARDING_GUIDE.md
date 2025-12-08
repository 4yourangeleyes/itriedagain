# Guided Onboarding System

## 🎯 Overview

We've built a **comprehensive guided onboarding experience** that walks new users through setting up and using the app. Each milestone on the dashboard is now **clickable** and takes users directly to where they need to go, with helpful tooltips explaining what to do.

---

## ✨ How It Works

### Dashboard Progress Tracker

The onboarding widget on the dashboard shows **5 milestones**:

1. ✅ **Account Created** (always checked)
2. **Profile Completed** → Click to go to Settings
3. **First Client Saved** → Click to go to Clients screen  
4. **3+ Templates Created** → Click to go to Templates screen
5. **First Document Created** → Click to open Document Wizard

### Interactive Flow

**When you click an incomplete milestone:**
1. Navigates to the relevant screen
2. Shows a tooltip/guide explaining what to do
3. Highlights the button or area to click
4. Provides context on why this step matters

**Example:** Click "First Client Saved"
- Takes you to `/clients` screen
- Shows tooltip: "Click 'New Client' to add your first client..."
- Explains what info you need (business name, email)
- Has "Next" button that opens the client form

---

## 🧭 Step-by-Step Guide

### Step 1: Account Created ✅
- Automatic (they're logged in)

### Step 2: Profile Completed
**Location:** Settings > Profile tab

**Tooltip appears with:**
- Title: "Complete Your Profile"
- Explains: Fill in name, email, company name
- Why: "This appears on all invoices and contracts"
- Action: "Got it!" button dismisses tooltip

**Fields to complete:**
- Full Name
- Email Address  
- Company Name (added to profile tab)

### Step 3: First Client Saved
**Location:** Clients screen

**Tooltip appears with:**
- Title: "Add Your First Client"
- Explains: Click "New Client" button
- What you need: Business name and email
- Action: "Next" opens the client form OR "Skip"

**What happens:**
- Form appears to add client
- Once saved, milestone completes
- Progress updates to 60%

### Step 4: 3+ Templates Created
**Location:** Templates screen

**Tooltip appears with:**
- Title: "Create Your Templates"
- Explains: Templates save time for repeat work
- Goal: Create at least 3 templates
- Examples: Common services you offer
- Action: "Next" opens template form OR "Skip"

**What to create:**
- Invoice templates for common services
- Contract clause templates
- Can include pre-filled items/pricing

### Step 5: First Document Created
**Location:** Document Creation Wizard

**Special banner shows:**
- "🎉 Almost There! Create Your First Document"
- Encouragement: "You're doing great!"
- Explains: Choose client → Pick type → Customize on canvas
- Visual: "STEP 5/5" badge in header

**Flow:**
1. Select a client (or create new one)
2. Choose Invoice or Contract
3. If contract, pick contract type
4. Opens canvas with blank document
5. Milestone completes!

---

## 🎨 UI Components

### OnboardingTooltip
**Purpose:** Floating guide boxes with instructions

**Props:**
- `title` - Main heading
- `description` - Detailed explanation
- `step` - Current step number (e.g., "2")
- `totalSteps` - Total steps (always "5")
- `position` - Where tooltip appears (top/bottom/left/right)
- `onNext` - Function when "Got it!" clicked
- `onSkip` - Function when X (skip) clicked

**Styling:**
- Brutalist design (thick borders, bold text)
- Yellow primary color for headers
- Dark text on white background
- Arrow pointer showing direction
- Animated pulse effect

### GuideSpotlight
**Purpose:** Highlights specific elements with cutout effect

**Features:**
- SVG mask creates "spotlight" on element
- Dark overlay on rest of screen
- Pulsing border animation
- Floating message near highlighted area
- Scrolls element into view automatically

### OnboardingContext
**Purpose:** Global state management for onboarding

**State Tracked:**
- `activeStep` - Which step user is on (profile/client/templates/document)
- `showGuide` - Whether to display tooltip
- `isOnboardingActive` - Overall onboarding enabled/disabled
- `skipped` - Has user dismissed onboarding

**Functions:**
- `setActiveStep(step)` - Move to specific step
- `completeStep(step)` - Mark step done
- `skipOnboarding()` - Dismiss all guides
- `setShowGuide(bool)` - Toggle tooltip visibility

**Persistence:**
- Saves to localStorage per user: `onboarding_skipped_{userId}`
- Survives page refreshes
- User-specific (doesn't affect other accounts)

---

## 🔧 Technical Implementation

### Dashboard Integration

```tsx
const milestones = [
  { 
    id: 'profile', 
    label: 'Profile Completed',
    completed: !!(profile.fullName && profile.companyName && profile.email),
    action: () => {
      setActiveStep('profile');
      setShowGuide(true);
      navigate('/settings');
    }
  },
  // ... more milestones
];
```

**Each milestone has:**
- `id` - Unique identifier
- `label` - Display text
- `completed` - Boolean check
- `action` - Navigation + guide activation

### Settings Screen

```tsx
{activeStep === 'profile' && showGuide && (
  <OnboardingTooltip
    title="Complete Your Profile"
    description="Fill in your details..."
    step="2"
    totalSteps="5"
    onNext={() => completeStep('profile')}
    onSkip={() => completeStep('profile')}
  />
)}
```

**Conditional rendering:**
- Only shows if `activeStep === 'profile'`
- Only shows if `showGuide === true`
- Disappears after completion

### App.tsx Provider Wrapper

```tsx
<AuthProvider>
  <OnboardingProvider>
    <AppRoutes />
  </OnboardingProvider>
</AuthProvider>
```

**Hierarchy:**
- AuthProvider (outermost - user auth)
- OnboardingProvider (middle - guides state)
- App components (innermost - use both contexts)

---

## 📊 Progress Calculation

```tsx
const milestones = [
  { completed: true }, // Account (always true)
  { completed: !!(profile.fullName && profile.companyName && profile.email) },
  { completed: clients.length > 0 },
  { completed: templates.length >= 3 },
  { completed: documents.length > 0 },
];

const completedMilestones = milestones.filter(m => m.completed).length;
const onboardingProgress = Math.round((completedMilestones / 5) * 100);
```

**Progress %:**
- 20% - Account created
- 40% - Profile completed
- 60% - First client saved
- 80% - 3+ templates created
- 100% - First document created

---

## 🎯 User Benefits

### For New Users:
- **Clear path forward** - No guessing what to do first
- **Contextual help** - Explanations when/where needed
- **Visual progress** - See how far they've come
- **Confidence building** - Guided through each step
- **Faster time-to-value** - Get productive quickly

### For Returning Users:
- **Skip button** - Dismiss anytime if already know app
- **Non-intrusive** - Only shows when < 100% complete
- **Resume anytime** - Can come back to incomplete steps
- **Persistent** - Progress saved across sessions

### For Business:
- **Better activation** - More users complete setup
- **Reduced support** - Self-service onboarding
- **Data quality** - Complete profiles = better docs
- **User retention** - Successful early experience

---

## 🚀 Future Enhancements

### Possible Additions:
1. **Canvas Walkthrough** - Guide on first document
   - How to add items
   - How to customize theme
   - How to send/share document

2. **Video Tutorials** - Embed short clips at each step

3. **Achievement System** - Badges for milestones
   - "First Invoice Sent" 🏆
   - "Power User" (10+ docs) ⚡
   - "Template Master" (10+ templates) 📚

4. **Onboarding Analytics**
   - Track which steps users skip
   - Measure completion rates
   - Identify friction points

5. **Personalization**
   - Industry-specific guides
   - Role-based onboarding (freelancer vs agency)
   - Dynamic milestone order based on user needs

---

## 🐛 Skip / Dismiss Flow

**User can skip onboarding in 2 ways:**

1. **Per-Step Skip:**
   - Click X on any tooltip
   - Marks that step complete
   - Moves to next incomplete milestone
   - Onboarding continues

2. **Complete Skip:**
   - Click "Skip" on dashboard progress widget
   - Calls `skipOnboarding()`
   - Saves `onboarding_skipped_true` to localStorage
   - Widget disappears
   - Never shows again (unless they clear localStorage)

**Resetting Onboarding:**
```javascript
// In browser console:
localStorage.removeItem('onboarding_skipped_{userId}');
// Refresh page - onboarding reappears
```

---

## 📝 Code Files Modified

### New Files Created:
1. `context/OnboardingContext.tsx` - State management
2. `components/OnboardingTooltip.tsx` - UI components

### Files Modified:
1. `App.tsx` - Wrapped with OnboardingProvider
2. `screens/DashboardScreen.tsx` - Clickable milestones + navigation
3. `screens/SettingsScreen.tsx` - Profile completion guide
4. `screens/ClientsScreen.tsx` - Client creation guide
5. `screens/TemplatesScreen.tsx` - Template building guide
6. `components/DocumentCreationWizard.tsx` - Final step hints

---

## ✅ Testing Checklist

- [ ] New user sees progress at 20% (account only)
- [ ] Click "Profile Completed" → navigates to Settings
- [ ] Tooltip appears in Settings explaining what to fill
- [ ] Fill profile → milestone checks, progress → 40%
- [ ] Click "First Client Saved" → navigates to Clients
- [ ] Tooltip guides to "New Client" button
- [ ] Add client → milestone checks, progress → 60%
- [ ] Click "3+ Templates Created" → navigates to Templates
- [ ] Tooltip explains template purpose
- [ ] Create 3 templates → milestone checks, progress → 80%
- [ ] Click "First Document Created" → opens wizard
- [ ] Wizard shows Step 5/5 badge + encouragement
- [ ] Complete wizard → document created, progress → 100%
- [ ] Progress widget disappears
- [ ] Skip button dismisses onboarding
- [ ] Skipped state persists on refresh

---

## 🎉 Summary

You now have a **fully guided onboarding experience** that:
- ✅ Shows clear progress (0-100%)
- ✅ Makes every milestone clickable
- ✅ Provides contextual tooltips at each step
- ✅ Explains what to do and why
- ✅ Allows skipping anytime
- ✅ Saves progress persistently
- ✅ Disappears when complete

**Result:** New users get productive faster with confidence! 🚀
