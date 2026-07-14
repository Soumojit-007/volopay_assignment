const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { calculateHealthAndSignals } = require('./utils');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Load data
const loadData = (filename) => {
  const filePath = path.join(__dirname, 'data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

app.get('/customers', (req, res) => {
  try {
    const customers = loadData('customers.json');
    const support = loadData('support.json');
    const emails = loadData('emails.json');
    const usage = loadData('usage.json');

    const enrichedCustomers = customers.map(customer => {
      const custSupport = support[customer.id] || [];
      const custEmails = emails[customer.id] || [];
      const custUsage = usage[customer.id] || {};
      
      const { healthScore, signals, riskLevel } = calculateHealthAndSignals(customer, custSupport, custEmails, custUsage);
      
      return {
        ...customer,
        healthScore,
        signals,
        riskLevel
      };
    });

    res.json(enrichedCustomers);
  } catch (error) {
    console.error("Error loading customers", error);
    res.status(500).json({ error: 'Failed to load customers' });
  }
});

app.get('/customer/:id', (req, res) => {
  try {
    const { id } = req.params;
    const customers = loadData('customers.json');
    const support = loadData('support.json');
    const emails = loadData('emails.json');
    const usage = loadData('usage.json');
    const notes = loadData('notes.json');

    const customer = customers.find(c => c.id === id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const custSupport = support[id] || [];
    const custEmails = emails[id] || [];
    const custUsage = usage[id] || {};
    const custNotes = notes[id] || [];

    const { healthScore, signals, riskLevel } = calculateHealthAndSignals(customer, custSupport, custEmails, custUsage);

    res.json({
      ...customer,
      support: custSupport,
      emails: custEmails,
      usage: custUsage,
      notes: custNotes,
      healthScore,
      signals,
      riskLevel
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load customer details' });
  }
});

app.post('/summarize', async (req, res) => {
  try {
    const customerData = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `
You are an experienced Customer Success Manager working for a B2B SaaS company.

Analyze the following customer account:
${JSON.stringify(customerData, null, 2)}

Do NOT invent information.
Only infer logical conclusions.
Respond in Markdown.
Return exactly these sections.

## Customer Summary
Summarize the overall customer situation in 3–4 sentences.

## Risks
List the main business risks.

## Opportunities
List possible upsell or expansion opportunities.

## Customer Sentiment
Positive, Neutral, or Negative. Explain briefly.

## Renewal Outlook
Low Risk, Medium Risk, or High Risk. Explain why.

## Next Best Action
Recommend one clear action the account manager should take.

Keep the response under 250 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ summary: response.text });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
