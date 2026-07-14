# Customer 360 AI Dashboard

"One unified customer view powered by AI."

## Project Overview

Growing businesses store customer information across multiple systems: CRM for sales, ticketing software for support, Slack for success, billing for finance, and analytics for growth. This fragmentation causes teams to waste valuable time context-switching. 

The **Customer 360 AI Dashboard** solves this by consolidating customer information into one unified view and leveraging the Google Gemini API to instantly summarize the account, identify risks, highlight opportunities, and recommend the next best action.

## Features

- **Unified Dashboard**: View customer details, MRR, ARR, renewal dates, and health scores at a glance.
- **Data Aggregation**: Integrates dummy data mimicking CRM, support tickets, email communications, product usage, and internal notes.
- **Business Signal Engine**: Automatically detects churn risks, declining usage, open critical tickets, and negative sentiment.
- **Health Score**: A calculated score out of 100 based on active business signals.
- **AI Summarization**: Integrates with Google Gemini API to analyze the full customer profile and generate actionable insights (Risks, Opportunities, Sentiment, Next Actions).
- **Search & Filters**: Quickly locate companies and filter by risk level and subscription plan.

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Lucide Icons
- React Router
- React Markdown

### Backend
- Node.js
- Express
- Google Gemini SDK (`@google/genai`)
- Local JSON Data store

## Folder Structure

```
customer360-ai-dashboard/
├── backend/
│   ├── data/                 # Dummy JSON files (customers, support, emails, etc.)
│   ├── server.js             # Express API server
│   ├── utils.js              # Business logic (Signals & Health Score)
│   ├── .env.example          # Environment variables template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios API calls
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # LandingPage, CustomerDashboard
│   │   ├── App.jsx           # Main routing
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js    # Tailwind configuration
│   └── package.json
├── README.md
└── Approach_Document.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Google Gemini API Key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the example:
   ```bash
   cp .env.example .env
   ```
4. Add your Gemini API Key in the `.env` file:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```
5. Start the backend server:
   ```bash
   node server.js
   ```
   *The server will run on `http://localhost:5000`.*

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

## Deployment

### Frontend (Vercel)
1. Push the repository to GitHub.
2. Log in to Vercel and click "Add New Project".
3. Select the repository.
4. Set the **Root Directory** to `frontend/`.
5. Ensure the Build Command is `npm run build` and Output Directory is `dist`.
6. Click **Deploy**.
*(Note: You will need to update the `API_URL` in `src/api/index.js` to point to your deployed backend URL).*

### Backend (Render)
1. Push the repository to GitHub.
2. Log in to Render and create a new **Web Service**.
3. Select the repository.
4. Set the **Root Directory** to `backend/`.
5. Set the Build Command to `npm install`.
6. Set the Start Command to `node server.js`.
7. Add the Environment Variable `GEMINI_API_KEY` with your API key.
8. Click **Create Web Service**.

## Future Improvements

- **Real Integrations**: Connect with HubSpot/Zoho CRM, Slack, Zendesk, and real email APIs.
- **Authentication**: Add JWT-based login, role-based access control (RBAC), and user management.
- **Database**: Migrate from local JSON to PostgreSQL or MongoDB for scalable, persistent data.
- **Real-time Updates**: Use WebSockets for live support ticket updates and usage metrics.
- **Fine-tuned AI Models**: Train the AI on historical successful interventions to improve the "Next Best Action" recommendations.
