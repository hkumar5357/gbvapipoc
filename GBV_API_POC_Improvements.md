# GBV API POC — Required Improvements

## Executive Summary

The prototype at gbvapipoc.vercel.app **does not align with the vision**. It presents a generic "UpLevyl Enterprise Domain API" interface — a bare question-and-answer box with persona selection — that contains zero GBV-specific content, zero manager-focused framing, no landing page, no enterprise sales narrative, no compliance workflow, and no demonstration of the core product value. An enterprise buyer visiting this URL would have no idea they are looking at a workplace violence response tool. The single biggest gap is the complete absence of the sales story: the prototype describes nothing, sells nothing, and demonstrates nothing about GBV response — it is a blank API shell.

## Vision Alignment Scorecard

| Vision Requirement | Status | Assessment | Priority |
|---|---|---|---|
| **Manager-focused framing** | ❌ Missing | No mention of managers anywhere. The interface says "Ask any business question" — a generic prompt with no role context. Persona options (HR Director, Legal Counsel, CFO, Tech Architect) are generic, not manager-specific. | P0 |
| **"Your managers are exposed" narrative** | ❌ Missing | No statistics, no EEOC data, no protocol gap framing. The page has zero persuasive content. There is no landing section, hero block, or problem statement of any kind. | P0 |
| **Multi-state legal compliance story** | ❌ Missing | No mention of jurisdictions, 44 states, or legal complexity. Nothing about jurisdiction-specific guidance. | P0 |
| **Confidential disclosure flow** | ❌ Missing | No disclosure workflow exists. There is no structured flow where a manager can walk through an employee disclosure scenario step by step. | P0 |
| **Audit trail / anonymous logging** | ❌ Missing | No audit trail UI, no logging indicators, no timestamped records visible anywhere. | P0 |
| **Working conversational AI demo** | ⚠️ Partial | There is a question input and "Generate Answer" button, but the interface is completely generic. It may return GBV-related answers if the right question is asked, but nothing guides the user toward GBV scenarios. No sample prompts, no scenario templates, no guided flow. The AI interaction is a blank text box. | P0 |
| **Enterprise-grade polish** | ❌ Missing | The page uses emoji icons (🔍, 🎭, ⚡, 📚, 📋) throughout — these are unprofessional for a C-suite demo. No branding beyond "UpLevyl Enterprise." No visual hierarchy. No imagery. Single-page with no navigation. Would not pass a C-suite credibility check. | P0 |
| **Gender-neutral positioning** | ❌ Missing | No language about gender neutrality because there is no GBV language at all. Nothing to evaluate. | P1 |
| **Industry relevance (Retail, Healthcare, Manufacturing, Hospitality)** | ❌ Missing | No industry verticals mentioned. No use-case framing for Walgreens, Tesla, Four Seasons, or any buyer persona. | P1 |
| **Phase 1 workflow (Disclosure → Query → Guidance → Docs)** | ❌ Missing | The only workflow is: type a question → get an answer. No disclosure trigger, no clarification questions, no compliance document generation. | P0 |
| **Proactive vs. reactive positioning** | ❌ Missing | No competitive differentiation. No mention of Futures Without Violence or any alternative. | P1 |
| **"Sells" not just "describes"** | ❌ Missing | The prototype neither sells nor describes. It is a generic API interface with no narrative content whatsoever. | P0 |
| **Mobile responsiveness** | ⚠️ Unknown | Cannot fully verify without device testing, but the single-column layout likely renders on mobile. However, the lack of content makes this moot. | P2 |

## Detailed Findings

### What's Working Well

1. **The underlying API infrastructure exists.** The question input, persona selection, and "Generate Answer" flow suggest a working backend. The processing states ("Searching knowledge base…", "Synthesizing context…", "Drafting persona response…") indicate a real retrieval-augmented generation pipeline. This is the foundation — but the foundation is invisible to an enterprise buyer.

2. **The persona concept is sound.** Offering different response voices (HR Director, Legal Counsel) is a good UX pattern for enterprise. It needs to be reframed for the GBV use case specifically, but the architecture supports it.

3. **The separate presentation site (uplevyl-gbv-presentation.vercel.app) proves the team can tell the story.** That site has excellent statistics, a compelling healthcare narrative, good visual design, and a clear value proposition. The problem is that none of this content appears in the actual POC prototype.

4. **Character counter on input.** Small UX detail but indicates attention to form validation.

---

### Critical Gaps (P0 — must fix before any enterprise demo)

#### Gap 1: No Landing Page / Sales Narrative

**What's wrong:** The prototype opens directly to a bare API query interface. There is no hero section, no problem statement, no statistics, no value proposition. An enterprise buyer sees "Ask any business question" — which communicates nothing about GBV response.

**Why it matters:** Enterprise buyers at Walgreens or Tesla will spend 10 seconds deciding whether to engage. Without an immediate hook ("86% of your managers have no response protocol"), they close the tab. This is a sales tool — the first screen must create urgency before showing the product.

**What to build:** A full landing page with these sections in order:
1. Hero: Problem statement with headline stat (86% protocol gap, 97% EEOC win rate)
2. "The Cost of Inaction": Financial exposure data ($8.3B annual cost, $217K average jury award)
3. "The Legal Minefield": 44-state complexity visual
4. "The Solution": Brief product overview with the four value pillars
5. "See It In Action" CTA button that scrolls/navigates to the interactive demo
6. Social proof / trust indicators (SOC 2, HIPAA-aware, attorney-supervised)

#### Gap 2: No Manager-Focused Context in the AI Demo

**What's wrong:** The AI interface says "Ask any business question." There is no framing that tells the user they are a manager responding to an employee disclosure. No scenario setup, no sample prompts, no guided experience.

**Why it matters:** The vision requires the demo to show: "Manager inputs query → API returns guidance + clarification questions → System generates compliance documentation." A blank text box does none of this. Enterprise buyers need to FEEL the product working, not imagine it.

**What to build:**
- Replace "Ask any business question" with manager-specific copy: "A team member has come to you with a concern. Describe the situation and your location — we'll guide you through your next steps."
- Add 3-4 clickable scenario cards above the input: "Store employee reports partner showing up at work (Texas)", "Night-shift worker discloses coworker harassment (California)", "Team member asks about protection order accommodations (New York)", "Healthcare worker reports patient violence (Illinois)"
- When a scenario is selected or a question is submitted, the AI response must include: (a) immediate steps, (b) follow-up clarification questions, (c) jurisdiction-specific legal obligations, and (d) a "Generate Compliance Report" button

#### Gap 3: No Compliance Document Generation

**What's wrong:** There is no document generation capability visible. The vision requires the system to produce timestamped, anonymous compliance documentation. The current prototype only has "Copy" and "New Query" buttons.

**Why it matters:** Audit trail and compliance documentation are two of the four core value propositions. Without a visible "Generate Report" or "Download Compliance Record" function, half the product story is missing.

**What to build:**
- After the AI provides guidance, show a "Generate Compliance Documentation" button
- Clicking it should produce a formatted document (viewable in-browser, downloadable as PDF) containing: timestamp, anonymized scenario summary, jurisdiction identified, guidance provided, legal obligations flagged, recommended next steps
- Display a banner: "This interaction has been logged as an anonymous audit record"

#### Gap 4: No Audit Trail Visibility

**What's wrong:** There is no indication that interactions are logged, timestamped, or contribute to a compliance record. The "anonymous logging throughout" requirement from the vision is completely absent.

**Why it matters:** The audit trail is a primary differentiator — it's the answer to "You have no paper trail." Enterprise compliance officers need to see that the system creates defensible records.

**What to build:**
- Persistent status indicator: "All interactions anonymously logged | SOC 2 compliant"
- After each AI response, show: "Audit record created: [timestamp] | Record ID: [anonymized hash]"
- Add an "Audit Log" section/tab on the demo page showing a sample log of anonymized interactions (can be mock data for the POC)

#### Gap 5: No Jurisdiction-Specific Legal Guidance Display

**What's wrong:** The AI response area shows a generic "Knowledge Sources" section. There is no indication that responses are jurisdiction-tagged or that legal guidance varies by state.

**Why it matters:** "44 states, different laws" is a core selling point. If the response doesn't visually show "Based on Texas Labor Code §21...." or flag "California-specific: mandatory reporting required under...," the multi-state compliance value is invisible.

**What to build:**
- Every AI response must include a visible jurisdiction badge: "Guidance for: [State]"
- Legal citations must be displayed with source tags (e.g., "Texas Labor Code §21.051", "VAWA §40002")
- Include a "This guidance covers: [list of applicable statutes]" block in each response
- Show a visual indicator when laws differ from neighboring states

#### Gap 6: Emoji-Heavy, Non-Enterprise Visual Design

**What's wrong:** The entire interface uses emoji as UI elements (🔍, 🎭, ⚡, 📚, 📋, ↩). The page has no professional imagery, no brand-appropriate color system, and no visual hierarchy beyond a single input/output column.

**Why it matters:** A COO at Four Seasons or a compliance officer at Walgreens will judge credibility in seconds. Emoji-driven UI communicates "hackathon project," not "enterprise platform I'm spending six figures on."

**What to build:**
- Replace all emoji with professional SVG icons (Lucide, Heroicons, or custom)
- Implement a professional color system: dark navy/charcoal primary, trust-blue accents, warm neutral backgrounds
- Add proper typography hierarchy with a professional sans-serif font (Inter, General Sans)
- Add subtle background patterns or gradients to break visual monotony
- Include the UpLevyl logo prominently in the header with professional navigation

---

### Major Gaps (P1 — fix before targeted industry demos)

#### Gap 7: No Industry Vertical Framing

**What's wrong:** The prototype has no industry context. Retail, healthcare, manufacturing, and hospitality buyers each need to see themselves in the product.

**Why it matters:** A Walgreens VP needs to see "store manager" language; a Tesla plant director needs "manufacturing floor" framing. Generic positioning loses to industry-specific competitors.

**What to build:**
- Add an industry selector (tabs or dropdown) on the landing page: Retail, Healthcare, Manufacturing, Hospitality
- Each vertical shows: industry-specific statistics, relevant scenario examples, tailored terminology (store manager vs. plant supervisor vs. charge nurse vs. front desk manager)
- The demo scenarios should change based on selected industry

#### Gap 8: No Gender-Neutral Positioning

**What's wrong:** Because there is no GBV content at all, the gender-neutral requirement is unaddressed. When GBV content is added, this must be deliberate.

**Why it matters:** Tesla and other buyers are explicitly distancing from DEI framing. The product must work for all employees regardless of gender. Defaulting to female-victim language will lose these buyers.

**What to build:**
- All scenario examples must include male victims, female victims, and non-gendered scenarios
- Use "employee," "team member," "worker" — never "she" or "her" as default
- Include scenario types: intimate partner violence (any gender), workplace harassment (any direction), stalking, patient violence against staff
- Add a visible positioning statement: "Supporting all employees, regardless of gender"

#### Gap 9: No Competitive Differentiation Section

**What's wrong:** No mention of alternatives (EAPs, outside counsel, static training, Futures Without Violence) or why this solution is superior.

**Why it matters:** Enterprise buyers already have something — usually an EAP with 3-5% utilization. They need to understand why this is different.

**What to build:**
- Add a "Why Not [Alternative]?" section on the landing page
- Comparison matrix: UpLevyl vs. EAP vs. Outside Counsel vs. Static Training vs. Google
- Highlight: real-time (not Monday morning), jurisdiction-specific (not generic), proactive (not reactive), auditable (not undocumented)

#### Gap 10: No Clarification Questions in AI Response

**What's wrong:** The vision spec requires: "API returns guidance + clarification questions." The current interface shows only a response and source citations. There is no conversational back-and-forth where the AI asks follow-up questions to refine guidance.

**Why it matters:** This is what makes it "conversational AI" rather than a search engine. Clarification questions demonstrate intelligence and build trust ("It asks the right questions — just like a good attorney would").

**What to build:**
- After initial guidance, the AI must present 2-3 follow-up questions: "Has the employee filed a formal complaint?" "Is there an immediate safety concern?" "Does your organization have an existing DV policy?"
- Clicking a follow-up question should deepen the guidance
- This creates a multi-turn conversation flow, not a single Q&A

---

### Minor Gaps (P2 — polish items)

#### Gap 11: No Loading/Processing State Design

**What's wrong:** The processing indicators ("Searching knowledge base…", "Synthesizing context…") use emoji and plain text. For an enterprise demo, these should feel polished.

**What to build:**
- Professional animated loading states with progress indicators
- Each step should visually complete before the next begins (stepper pattern)
- Use enterprise language: "Retrieving jurisdiction-specific statutes…", "Analyzing compliance requirements…", "Generating manager guidance…"

#### Gap 12: No Mobile-Optimized Demo Flow

**What's wrong:** The prototype appears to be desktop-focused with no evidence of responsive design testing for the demo flow specifically.

**What to build:**
- Ensure the full landing → demo → output flow works on mobile (enterprise buyers often preview on phones)
- Scenario cards should stack vertically on mobile
- AI response should be easily scrollable on small screens

#### Gap 13: No "Book a Demo" or Contact CTA

**What's wrong:** No conversion mechanism. Even for a POC, enterprise buyers who are impressed need a next step.

**What to build:**
- Sticky "Book a Demo" button in the header
- End-of-page CTA: "Ready to protect your managers and your organization? Talk to our team."
- Link to calendly or contact form

#### Gap 14: Persona Options Need GBV-Specific Reframing

**What's wrong:** Current personas are generic (HR Director, Legal Counsel, CFO, Tech Architect). "Tech Architect" is irrelevant. "CFO" is tangential.

**What to build:**
- Replace with GBV-relevant response modes: "Manager Guidance" (default), "Legal Compliance View", "HR Policy View", "Executive Summary"
- Or remove persona selector entirely and make the default response include all relevant perspectives in clearly labeled sections

#### Gap 15: No Trust Indicators

**What's wrong:** No SOC 2 badges, no "attorney-supervised" label, no privacy certifications, no security indicators anywhere on the page.

**What to build:**
- Footer trust bar: SOC 2 Type II | HIPAA-Aware | GDPR Compatible | Attorney-Supervised
- "Reviewed by licensed attorneys in all 50 states" badge near AI responses
- Privacy notice: "No personally identifiable information is collected or stored"

---

## Developer Task List

### Task 1: Build enterprise landing page with sales narrative

- **Priority:** P0
- **What:** Create a new landing page section (or separate route `/`) that loads before the demo interface. Must include: hero section with headline statistic, cost-of-inaction section, legal complexity section, solution overview, and CTA to demo. Content should draw from the statistics already compiled in the uplevyl-gbv-presentation site (86% protocol gap, 97% EEOC win rate, $8.3B annual cost, 44-state complexity).
- **Why:** Enterprise buyers need to feel the problem before seeing the solution. Without a sales narrative, the demo has no context and no urgency. This is the #1 gap preventing any enterprise showing.
- **Acceptance Criteria:**
  - [ ] Landing page loads at root URL (`/`) as the first thing a visitor sees
  - [ ] Hero section includes at least 2 headline statistics with source citations
  - [ ] "Cost of Inaction" section shows financial exposure data ($8.3B, $217K jury award, $664M EEOC recovery)
  - [ ] "Legal Complexity" section communicates 44-state variation (map visual or equivalent)
  - [ ] "The Solution" section presents the four value pillars (protocol, compliance, disclosure, audit trail) as distinct, scannable blocks
  - [ ] Clear CTA button ("See It In Action" or "Try the Demo") navigates to the interactive demo section
  - [ ] No emoji anywhere on the page — professional SVG icons only
  - [ ] Page renders correctly on desktop (1440px, 1920px) and mobile (375px, 390px)

### Task 2: Redesign the AI demo interface with manager-focused framing

- **Priority:** P0
- **What:** Replace the generic "Ask any business question" interface with a manager-specific guided experience. Add scenario cards, manager-directed copy, and a structured input flow. The section header should be something like "Manager Response Assistant" not "Enterprise Domain Intelligence API."
- **Why:** The conversational AI is the centerpiece of the product. A blank text box communicates "developer tool," not "manager tool." Enterprise buyers must see a working, guided interaction.
- **Acceptance Criteria:**
  - [ ] Page header reads "Manager Response Assistant" or equivalent manager-focused title
  - [ ] Subheading explicitly states this is for managers responding to employee disclosures
  - [ ] 3-4 clickable scenario cards appear above the text input, each with an industry context and state
  - [ ] Scenario cards include at least one from each vertical: retail, healthcare, manufacturing, hospitality
  - [ ] Clicking a scenario card populates the input and triggers the AI response
  - [ ] Free-text input placeholder reads something like "Describe the situation and your state..."
  - [ ] Persona selector is replaced with response-mode selector: "Manager Guidance" (default), "Legal Compliance", "HR Policy", "Executive Summary"
  - [ ] All copy is manager-directed — no employee-facing language

### Task 3: Implement multi-turn conversational AI with clarification questions

- **Priority:** P0
- **What:** After the AI returns initial guidance, it must also return 2-3 clarification questions. Clicking a question should produce a deeper, more specific guidance response. This creates a multi-turn conversation, not a single Q&A.
- **Why:** "Conversational AI is the centerpiece" — a single-response Q&A is not conversational. Clarification questions demonstrate the system's depth and intelligence, and they mirror how a real attorney or HR expert would respond.
- **Acceptance Criteria:**
  - [ ] Initial AI response includes a "Clarification Questions" section with 2-3 clickable follow-up questions
  - [ ] Questions are contextual to the scenario (e.g., "Has a formal complaint been filed?", "Is there an immediate safety risk?", "What state is the employee located in?")
  - [ ] Clicking a clarification question appends it to the conversation and triggers a more specific AI response
  - [ ] At least 2 turns of conversation are supported in the demo
  - [ ] Conversation history is visible (chat-like scroll, not replacement)

### Task 4: Add jurisdiction-specific legal citation display

- **Priority:** P0
- **What:** Every AI response must visually display the jurisdiction it applies to and cite specific statutes. Replace the generic "Knowledge Sources" section with a structured legal citation block.
- **Why:** Multi-state legal compliance is a core value prop. If responses don't show "Texas Labor Code §21.051" or "California mandatory reporting under Penal Code §11160," the buyer can't see the legal depth.
- **Acceptance Criteria:**
  - [ ] Every AI response displays a jurisdiction badge (e.g., "Applicable Jurisdiction: Texas")
  - [ ] Legal citations appear with statute numbers and brief descriptions
  - [ ] A "Statutes Referenced" block lists all applicable laws at the bottom of each response
  - [ ] When the scenario involves a state with mandatory reporting, this is explicitly flagged with a visual indicator (e.g., warning badge)
  - [ ] Citations link to or reference the 10,000+ document knowledge base

### Task 5: Build compliance document generation

- **Priority:** P0
- **What:** Add a "Generate Compliance Report" button that appears after AI guidance is delivered. Clicking it produces a formatted compliance document viewable in-browser with a download option.
- **Why:** Compliance documentation and audit trail are two of the four core value pillars. Without visible document generation, half the product story is untold.
- **Acceptance Criteria:**
  - [ ] "Generate Compliance Report" button appears below the AI response
  - [ ] Clicking it produces a formatted document with: timestamp, anonymized scenario summary, jurisdiction identified, guidance provided, legal obligations flagged, recommended next steps, and record ID
  - [ ] Document is viewable in-browser in a modal or slide-out panel
  - [ ] "Download PDF" button available on the generated document
  - [ ] Document header includes "CONFIDENTIAL — Manager Compliance Record"
  - [ ] No personally identifiable information appears in the generated document

### Task 6: Add audit trail UI and anonymous logging indicators

- **Priority:** P0
- **What:** Add visible indicators throughout the demo that interactions are being anonymously logged. Include a sample audit log view.
- **Why:** "You have no paper trail" is a primary pain point in the sales narrative. The audit trail must be visible and tangible, not just claimed.
- **Acceptance Criteria:**
  - [ ] Persistent banner or status bar: "All interactions anonymously logged"
  - [ ] After each AI response: "Audit record created: [timestamp] | Record ID: [hash]"
  - [ ] "View Audit Log" link/tab shows a table of sample anonymized records (can be mock data)
  - [ ] Audit log table columns: Timestamp, Record ID, Jurisdiction, Query Category, Status
  - [ ] Privacy notice visible: "No personally identifiable information collected"

### Task 7: Replace all emoji with professional iconography and implement enterprise design system

- **Priority:** P0
- **What:** Remove every emoji from the UI. Replace with professional SVG icons (Lucide or Heroicons). Implement a cohesive color system, typography hierarchy, and visual design appropriate for C-suite demos.
- **Why:** Emoji icons communicate "hackathon project." Enterprise buyers at Walgreens, Tesla, and Four Seasons expect polished, professional interfaces. Credibility is established in the first 3 seconds.
- **Acceptance Criteria:**
  - [ ] Zero emoji characters anywhere in the rendered UI
  - [ ] All icons are SVG (Lucide, Heroicons, or custom) — consistent style throughout
  - [ ] Color system: professional palette (dark navy/charcoal primary, trust-blue accents, warm neutral backgrounds) — no bright/playful colors
  - [ ] Typography: professional sans-serif (Inter, General Sans), clear hierarchy (H1 > H2 > body > caption)
  - [ ] UpLevyl logo in the header with professional navigation bar
  - [ ] Adequate whitespace, alignment, and visual balance on all sections
  - [ ] Footer with company info, trust badges, and legal disclaimer

### Task 8: Add industry vertical selector and tailored content

- **Priority:** P1
- **What:** Add an industry selector (tabs or toggle) that adjusts landing page statistics, scenario examples, and terminology for Retail, Healthcare, Manufacturing, and Hospitality.
- **Why:** Enterprise buyers need to see themselves in the product. A Walgreens VP expects "store manager" language; a Tesla director expects "plant floor" framing.
- **Acceptance Criteria:**
  - [ ] Industry selector with 4 options: Retail, Healthcare, Manufacturing, Hospitality
  - [ ] Landing page statistics adjust per industry (e.g., retail shows EEOC exposure data; healthcare shows nurse violence stats)
  - [ ] Demo scenario cards change to match selected industry
  - [ ] Manager terminology adapts: "store manager" (retail), "charge nurse / floor supervisor" (healthcare), "plant supervisor" (manufacturing), "front desk manager / GM" (hospitality)
  - [ ] At least 2 unique scenarios per industry vertical

### Task 9: Ensure gender-neutral language throughout

- **Priority:** P1
- **What:** Audit all copy — landing page, demo interface, AI responses, scenario cards, compliance documents — for gendered assumptions. Ensure all language is gender-neutral.
- **Why:** Buyers like Tesla are distancing from DEI framing. The product must visibly support all employees. Gendered default language (assuming female victims) will disqualify the product for a significant segment of enterprise buyers.
- **Acceptance Criteria:**
  - [ ] No gendered pronouns (he/she) used as defaults in any UI copy
  - [ ] All scenario cards use "employee," "team member," or "worker" — never gendered terms
  - [ ] At least one scenario card features a male victim/affected employee
  - [ ] At least one scenario involves a non-intimate-partner situation (workplace harassment, patient violence)
  - [ ] Visible positioning statement on landing page: "Supporting all employees" or equivalent
  - [ ] AI response templates use gender-neutral language throughout

### Task 10: Add competitive differentiation section

- **Priority:** P1
- **What:** Add a section on the landing page that positions UpLevyl against existing alternatives (EAPs, outside counsel, static training, Futures Without Violence).
- **Why:** Enterprise buyers already spend money on something (usually EAPs with 3-5% utilization). They need to see why this is categorically different — proactive, real-time, jurisdiction-specific, auditable.
- **Acceptance Criteria:**
  - [ ] Comparison section with 4-5 alternatives: EAP, Outside Legal Counsel, Annual Training, DIY Research, Futures Without Violence
  - [ ] For each: what it is, why it fails, and how UpLevyl is different
  - [ ] Visual format: comparison table or matrix (not just prose)
  - [ ] "Proactive, not reactive" messaging is explicitly stated
  - [ ] EAP utilization stat (3-5%) is prominently featured

### Task 11: Professional loading and processing states

- **Priority:** P2
- **What:** Replace emoji-based loading indicators with professional animated states using enterprise-appropriate language.
- **Why:** Processing states are visible during every interaction. They reinforce (or undermine) professionalism.
- **Acceptance Criteria:**
  - [ ] Animated stepper or progress bar with 3 stages
  - [ ] Stage labels: "Retrieving jurisdiction-specific statutes…", "Analyzing compliance requirements…", "Generating manager guidance…"
  - [ ] No emoji in any loading state
  - [ ] Smooth animations (fade/slide transitions, not abrupt show/hide)

### Task 12: Add mobile-responsive demo flow

- **Priority:** P2
- **What:** Ensure the entire flow (landing → demo → AI response → compliance doc) works well on mobile viewports.
- **Why:** Enterprise buyers often preview links on mobile (email → phone tap → quick scan). A broken mobile experience kills credibility.
- **Acceptance Criteria:**
  - [ ] All sections render correctly at 375px and 390px widths
  - [ ] Scenario cards stack vertically on mobile
  - [ ] AI response area is scrollable without horizontal overflow
  - [ ] Compliance document modal/panel is usable on mobile
  - [ ] All tap targets are at least 44x44px
  - [ ] No horizontal scrolling on any screen

### Task 13: Add "Book a Demo" conversion CTA

- **Priority:** P2
- **What:** Add a persistent "Book a Demo" button in the header navigation and an end-of-page CTA section.
- **Why:** Even a POC needs a conversion path. Impressed buyers must have a clear next step.
- **Acceptance Criteria:**
  - [ ] "Book a Demo" button in the top navigation bar (visible on scroll)
  - [ ] End-of-page CTA section with headline ("Ready to protect your managers?") and button
  - [ ] Button links to a calendly page, contact form, or mailto
  - [ ] CTA is visible on both desktop and mobile

### Task 14: Add trust indicators and security badges

- **Priority:** P2
- **What:** Add trust badges, security certifications, and attorney-supervised indicators throughout the page.
- **Why:** Enterprise compliance officers look for these signals. Their absence raises procurement red flags.
- **Acceptance Criteria:**
  - [ ] Footer trust bar: "SOC 2 Type II | HIPAA-Aware | GDPR Compatible | Attorney-Supervised"
  - [ ] "Reviewed by licensed attorneys" indicator near AI responses
  - [ ] "No PII collected" privacy notice visible during demo interaction
  - [ ] "10,000+ legal documents | 50-state coverage" stat displayed on landing page

### Task 15: Reframe persona selector as response-mode selector

- **Priority:** P2
- **What:** Replace generic persona options (HR Director, Legal Counsel, CFO, Tech Architect) with GBV-relevant response modes.
- **Why:** "Tech Architect" and "CFO" personas are irrelevant to the GBV use case and confuse the demo narrative.
- **Acceptance Criteria:**
  - [ ] Persona selector relabeled as "Response Mode" or "Guidance View"
  - [ ] Options: "Manager Guidance" (default), "Legal Compliance", "HR Policy", "Executive Summary"
  - [ ] "Tech Architect" and "CFO" options removed
  - [ ] Default selection is "Manager Guidance" — no user action required to get the right framing
