# Customer 360 AI Dashboard - Approach Document

## 1. Problem Statement
Growing businesses struggle with fragmented customer data scattered across disparate systems (CRM, support ticketing, billing, analytics). This forces teams to waste valuable time context-switching and makes it difficult to get a holistic view of a customer's health and needs before engagements.

## 2. Objective
Build an MVP "Customer 360 AI Dashboard" that consolidates these disparate data sources into a single pane of glass, and leverages Generative AI to automatically analyze the data, summarize the account status, identify risks, and recommend the next best action.

## 3. Why This Problem Matters
Customer Success and Sales teams need actionable insights, not just raw data. By automating the analysis of a customer's health, companies can proactively address churn risks, capitalize on expansion opportunities, and improve overall customer satisfaction, directly impacting the bottom line (MRR/ARR).

## 4. Solution Overview
The solution is a Full Stack web application. A React frontend provides a modern, clean SaaS dashboard. A Node.js/Express backend serves as an aggregation layer, merging dummy data from multiple JSON sources. A Business Signal Engine evaluates this data to compute a Health Score and risk flags. Finally, the aggregated profile is sent to the Google Gemini AI to generate a concise, actionable summary.

## 5. Architecture Diagram

```text
+-------------------+       +-----------------------+       +-------------------+
|                   |       |                       |       |                   |
|   React Frontend  |<----->|   Node.js Backend     |<----->| Google Gemini API |
|   (Vite, Tailwind)|       |   (Express, Signals)  |       | (GenAI Summaries) |
|                   |       |                       |       |                   |
+-------------------+       +-----------------------+       +-------------------+
                                        |
                                        v
                            +-----------------------+
                            |                       |
                            |   Local JSON Data     |
                            | (Customers, Support,  |
                            |  Usage, Emails, Notes)|
                            +-----------------------+
```

## 6. Data Sources
The application uses local JSON files to simulate databases/external APIs:
- `customers.json`: Core CRM data (Name, MRR, ARR, Renewal, Owner).
- `support.json`: Ticketing system data (Open/Closed tickets, severity).
- `emails.json`: Recent customer communications.
- `usage.json`: Product analytics (WAU/MAU, feature adoption, trends).
- `notes.json`: Qualitative notes from Account Managers.

## 7. Application Workflow
1. User loads the Landing Page.
2. Frontend requests `/customers` from the backend.
3. Backend aggregates core data, calculates health scores, and returns the list.
4. User clicks a customer, navigating to the Customer Dashboard.
5. Frontend requests detailed data via `/customer/:id`.
6. User clicks "Generate AI Summary".
7. Frontend POSTs data to `/summarize`.
8. Backend passes data to Gemini and returns the Markdown summary.

## 8. AI Workflow
- The backend receives the aggregated customer profile.
- It injects this JSON into a heavily structured prompt.
- The prompt explicitly instructs the LLM to adopt a "Customer Success Manager" persona, restrict itself to the provided facts (no hallucinations), and output specific Markdown sections.
- The Gemini API processes the prompt and returns the text, which is rendered on the frontend using `react-markdown`.

## 9. Business Signal Logic
Signals are heuristic flags calculated on the backend before the AI is invoked:
- **Renewal Soon**: Renewal date is within 30 days.
- **Usage Declining**: Usage drop >30%.
- **Multiple Open Tickets**: >3 open tickets.
- **Critical Issue**: Any open ticket with "Critical" priority.
- **Negative Sentiment**: Emails contain keywords like "frustrated", "urgent", "crashing".
- **Inactive**: No login for 14+ days.
- **Churn Risk**: Health score falls below 50.

## 10. Health Score Logic
- Base Score: 100
- Deductions:
  - Renewal within 30 days (-20)
  - Usage drop >30% (-20)
  - >3 open tickets (-20)
  - Negative email sentiment (-10)
  - Inactive 14+ days (-10)
  - Critical open issue (-20)
- Tiers: Healthy (80-100), Warning (50-79), High Risk (<50).

## 11. Gemini Prompt
```text
You are an experienced Customer Success Manager working for a B2B SaaS company.
Analyze the following customer account:
[INJECTED JSON DATA]
Do NOT invent information.
Only infer logical conclusions.
Respond in Markdown.
Return exactly these sections.
## Customer Summary (3-4 sentences)
## Risks
## Opportunities
## Customer Sentiment (Positive, Neutral, Negative with brief explanation)
## Renewal Outlook (Low, Medium, High Risk with explanation)
## Next Best Action (One clear action)
Keep the response under 250 words.
```

## 12. Sample Input (To Gemini)
```json
{
  "id": "CUST-002",
  "companyName": "TechFlow",
  "plan": "Pro",
  "healthScore": 40,
  "signals": ["Usage Declining", "Critical Issue", "Churn Risk"],
  "support": [{"issue": "Dashboard not loading", "priority": "Critical", "status": "Open"}],
  "emails": [{"message": "Still facing integration issue with our CRM. Please escalate."}],
  "usage": {"usageTrend": "Down 42%", "lastLogin": "2026-06-30"},
  "notes": ["Champion left company."]
}
```

## 13. Sample Output (From Gemini)
```markdown
## Customer Summary
TechFlow is a Pro plan customer currently experiencing significant friction. They have suffered a 42% drop in usage and have not logged in recently. Compounding this, their internal champion has left the company, and they are facing critical open technical issues.

## Risks
- Complete loss of adoption (usage down 42%).
- Unresolved critical technical issue (Dashboard not loading, CRM integration failing).
- Loss of account champion.

## Opportunities
- If integration issues are resolved, there is a potential to re-engage the new IT head.

## Customer Sentiment
Negative. They are explicitly asking to escalate unresolved integration issues.

## Renewal Outlook
High Risk. The combination of declining usage, critical bugs, and loss of champion indicates a strong likelihood of churn.

## Next Best Action
Immediately escalate the CRM integration and dashboard issues to engineering, and simultaneously schedule an intro call with the new head of IT to rebuild the relationship.
```

## 14. Tech Stack
- Frontend: React, Vite, Tailwind CSS, Lucide React, React Markdown.
- Backend: Node.js, Express, dotenv, cors.
- AI: Google GenAI SDK (`@google/genai`).

## 15. Assumptions
- The application does not require user authentication for this MVP scope.
- Local JSON files accurately represent the schema we would receive from a unified data warehouse or third-party APIs.
- The Gemini API response is fast enough to run synchronously on a single request without websockets or polling.

## 16. Limitations
- **Data Persistence**: Changes (like new tickets or notes) cannot be written back to the JSON files via the frontend in this read-only MVP.
- **Scalability**: Loading all customers into memory from JSON won't scale past a few thousand records without a real database and pagination.
- **Error Handling**: Basic try/catch is implemented, but robust retry logic for the AI API is omitted for simplicity.

## 17. Future Improvements
- **Real Integrations**: Connect directly to Salesforce, Zendesk, and Mixpanel via OAuth.
- **Database**: Migrate to PostgreSQL for robust querying and persistent storage.
- **Authentication & RBAC**: Implement Auth0/JWT so Account Managers only see their own accounts.
- **Fine-Tuning**: Fine-tune the AI model on historical support tickets to provide better technical resolution suggestions.
- **Streaming UI**: Implement server-sent events (SSE) to stream the AI summary to the UI as it's generated, reducing perceived latency.
