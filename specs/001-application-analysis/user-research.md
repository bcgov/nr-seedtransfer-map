# User Research & Pain Points

## Research Objectives

1. Validate technical assumptions about user pain points
2. Discover actual user experience issues
3. Prioritize improvements based on user impact
4. Understand workflows and context of use
5. Gather quantitative performance data

## Hypothesized Pain Points

Based on technical analysis, we've identified potential user pain points. These are hypotheses to be validated through user research.

### High Confidence Hypotheses

#### 1. Performance - Slow Load Times
**Hypothesis**: Users experience slow load times when selecting species/BEC variants  
**Technical Evidence**: 
- Large JSON files (80,000+ records) loaded entirely into memory
- No caching mechanism
- Files re-downloaded on every query

**Expected Impact**: 
- Users wait 5-15 seconds for results
- Multiple queries compound wait time
- Poor experience on slower connections

**Validation Questions**:
- "How long does it typically take to get results after clicking GO?"
- "Have you noticed the app being slow with certain species or BEC variants?"
- "Does the wait time impact your workflow?"

#### 2. Performance - Browser Slowdowns
**Hypothesis**: Application becomes unresponsive during data processing  
**Technical Evidence**: 
- Synchronous processing blocks UI thread
- Large in-memory array operations
- No Web Workers for heavy processing

**Expected Impact**: 
- UI freezes during processing
- Users may think app crashed
- Multiple clicks on buttons
- Browser tab becomes unresponsive

**Validation Questions**:
- "Does the application freeze or become unresponsive when processing?"
- "Have you ever thought the app crashed because it stopped responding?"
- "Do you click buttons multiple times because nothing seems to happen?"

#### 3. User Feedback - No Loading Indicators
**Hypothesis**: Users are unsure if the app is processing their request  
**Technical Evidence**: 
- No loading indicators for async operations
- No progress feedback
- Silent processing with no UI changes

**Expected Impact**: 
- User confusion about application state
- Multiple button clicks
- Unclear when to wait vs. when to retry

**Validation Questions**:
- "Do you ever wonder if the app is working after clicking GO?"
- "How do you know when the app is processing your request?"
- "Have you clicked buttons multiple times because you weren't sure it worked?"

### Medium Confidence Hypotheses

#### 4. Error Handling - Silent Failures
**Hypothesis**: Errors occur but users don't know what went wrong  
**Technical Evidence**: 
- Minimal error handling
- No user-friendly error messages
- Network errors may fail silently

**Expected Impact**: 
- Frustration when things don't work
- Unclear what went wrong
- No way to recover or retry

**Validation Questions**:
- "Have you encountered errors that were unclear or unhelpful?"
- "What happens when something goes wrong with the application?"
- "Have you experienced situations where the app just doesn't work with no explanation?"

#### 5. Data Currency - Outdated Information
**Hypothesis**: Users need more recent seedlot data  
**Technical Evidence**: 
- Data current as of August 18th, 2025
- No automatic updates
- Manual file updates required

**Expected Impact**: 
- Missing recent seedlots
- Incomplete information
- Need to verify data currency

**Validation Questions**:
- "Is the seedlot data current enough for your needs?"
- "Have you looked for seedlots that weren't in the system?"
- "How often do you need the most up-to-date data?"

#### 6. Usability - No Offline Capability
**Hypothesis**: Users may need to work in areas with limited connectivity  
**Technical Evidence**: 
- Requires internet for ArcGIS services
- JSON files loaded via network
- No offline mode

**Expected Impact**: 
- Cannot use in remote areas
- Dependent on internet connection
- Limited mobility

**Validation Questions**:
- "Do you use this tool in areas with limited internet connectivity?"
- "Would offline capability be valuable for your work?"
- "Have you been unable to use the tool due to connectivity issues?"

## User Interview Questions

### Opening Questions
1. How long have you been using the CBST Seedlot Selection Tool?
2. How frequently do you use it? (Daily, weekly, monthly, seasonally)
3. What is your role, and how does this tool fit into your work?

### Performance & Speed
1. **How long does it typically take to get results after selecting species and BEC variants?**
   - Follow-up: Is this acceptable or does it feel slow?
   
2. **Does the application ever freeze or become unresponsive?**
   - Follow-up: When does this happen? (Specific workflows)
   
3. **Are there specific operations that feel slow to you?**
   - Follow-up: Which ones? Can you quantify the wait time?
   
4. **Have you experienced crashes or errors during normal use?**
   - Follow-up: How often? What were you doing?

5. **Does performance vary by species or BEC variant selection?**
   - Follow-up: Which combinations are slower?

### Workflow & Usability
1. **Walk me through how you typically use this tool in your daily work.**
   - Follow-up: What's your typical workflow? Which tab do you use more?

2. **What's the most frustrating part of using this tool?**
   - Follow-up: Why is that frustrating? How often does it happen?

3. **Are there features you wish it had?**
   - Follow-up: What would make your work easier?

4. **Do you ever have to restart or reload the page?**
   - Follow-up: Why? What triggers this?

5. **How do you typically discover which species/BEC combinations to try?**
   - Follow-up: Do you do multiple queries in a session?

### Data & Accuracy
1. **Is the seedlot data current enough for your needs?**
   - Follow-up: How often do you need updated data?

2. **Are there species or BEC variants missing that you need?**
   - Follow-up: Which ones? How often?

3. **How often do you need to update or refresh data?**
   - Follow-up: Is the update frequency adequate?

4. **Do you trust the suitability calculations?**
   - Follow-up: Have you ever found discrepancies?

### Error Handling & Feedback
1. **Have you encountered errors that were unclear or unhelpful?**
   - Follow-up: What happened? What did the error say (if anything)?

2. **Do you know when the app is processing vs. when it's stuck?**
   - Follow-up: How do you tell the difference?

3. **Have you ever lost work or had to redo queries?**
   - Follow-up: What caused this?

4. **What happens when you get "No results available"?**
   - Follow-up: Is this message helpful? Do you know what to do next?

### Browser & Environment
1. **What browser do you typically use?** (Chrome, Firefox, Edge, Safari)
   - Follow-up: Does it work consistently across browsers?

2. **Are you using this on a desktop, laptop, or mobile device?**
   - Follow-up: Does mobile use matter to you?

3. **Do you use this in areas with limited internet connectivity?**
   - Follow-up: How does this affect your use?

4. **What's your typical screen resolution/monitor setup?**
   - Follow-up: Is the layout adequate for your screen?

### Feature Requests & Improvements
1. **If you could change one thing about this tool, what would it be?**
   - Follow-up: Why is that important to you?

2. **What features from similar tools do you wish this had?**
   - Follow-up: Can you give examples?

3. **How could this tool better fit into your workflow?**
   - Follow-up: What would make it more efficient?

### Closing Questions
1. **Overall, how satisfied are you with this tool?** (1-10 scale)
   - Follow-up: What would make it a 10?

2. **What do you like most about the tool?**
   - Follow-up: What's working well?

3. **Is there anything else you'd like to share about your experience?**

## Discovered Pain Points

[To be filled in after user meetings]

### Critical Issues (User-Reported)
- [ ] Issue 1: [Description]
  - Impact: [High/Medium/Low]
  - Frequency: [How often users encounter this]
  - Workflow affected: [Which workflows]
  - User quotes: ["Direct quotes from users"]

- [ ] Issue 2: [Description]
  - Impact: [High/Medium/Low]
  - Frequency: [How often users encounter this]
  - Workflow affected: [Which workflows]
  - User quotes: ["Direct quotes from users"]

### Important Issues (User-Reported)
- [ ] Issue 1: [Description]
  - Impact: [Medium/Low]
  - Frequency: [How often users encounter this]
  - Workflow affected: [Which workflows]
  - User quotes: ["Direct quotes from users"]

### Nice-to-Have Improvements (User-Requested)
- [ ] Enhancement 1: [Description]
  - Requested by: [How many users mentioned this]
  - Priority from users: [High/Medium/Low]

## Validation Results

### Performance Hypotheses

| Hypothesis | Status | Evidence | Notes |
|------------|--------|----------|-------|
| Slow Load Times | [ ] Confirmed [ ] Not an issue [ ] Partially confirmed | [Measured times, user reports] | [Additional context] |
| Browser Slowdowns | [ ] Confirmed [ ] Not an issue [ ] Partially confirmed | [User reports, observed behavior] | [Additional context] |
| UI Freezing | [ ] Confirmed [ ] Not an issue [ ] Partially confirmed | [User reports] | [Additional context] |

### User Experience Hypotheses

| Hypothesis | Status | Evidence | Notes |
|------------|--------|----------|-------|
| Loading Indicators Needed | [ ] Confirmed [ ] Not an issue [ ] Partially confirmed | [User confusion, multiple clicks] | [Additional context] |
| Error Handling Issues | [ ] Confirmed [ ] Not an issue [ ] Partially confirmed | [User frustration, unclear errors] | [Additional context] |
| Data Currency Problems | [ ] Confirmed [ ] Not an issue [ ] Partially confirmed | [User reports of missing data] | [Additional context] |

### Surprise Discoveries

[Any pain points discovered that weren't in our hypotheses]

- Discovery 1: [Description]
  - How discovered: [Interview question, observation, etc.]
  - Impact: [Assessment]
  - Priority: [Should this be addressed?]

## Quantitative Data

### Performance Metrics (If Available)
- Average load time: [To be measured]
- Typical query time: [To be measured]
- File sizes: [Documented]
- Memory usage: [To be measured]

### Usage Patterns (If Available)
- Most common species: [To be collected]
- Most common BEC variants: [To be collected]
- Typical queries per session: [To be collected]
- Peak usage times: [To be collected]

## Updated Priorities

[To be updated after user research]

### User-Validated Priority List

1. **[Top Priority from Users]**
   - Why: [User reasoning]
   - Impact: [High/Medium/Low]
   - Effort: [Estimate]

2. **[Second Priority]**
   - Why: [User reasoning]
   - Impact: [High/Medium/Low]
   - Effort: [Estimate]

### Priority Shifts

**Original Technical Priority** → **User-Validated Priority**

- [Example: "Performance optimization" was #1 technically, but users ranked it #3]
- [Explanation: Why the shift occurred]

## Next Steps

After user research meetings:

1. [ ] Complete this document with findings
2. [ ] Update [plan.md](./plan.md) with validated priorities
3. [ ] Create action items for top user-identified issues
4. [ ] Share findings with stakeholders
5. [ ] Adjust roadmap based on user priorities

## Notes & Observations

[Space for additional observations, patterns, or insights from user research]

### Workflow Patterns Observed
- [Pattern 1: e.g., "Users typically do 3-5 queries per session"]
- [Pattern 2: e.g., "Most users prefer the cutblock workflow"]

### Quotes & Testimonials
- ["Direct quote from user about pain point"]
- ["Direct quote about what's working well"]

### Context & Environment
- [Observations about how/where users access the tool]
- [Notes about technical environment]


