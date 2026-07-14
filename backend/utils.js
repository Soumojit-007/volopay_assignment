const calculateHealthAndSignals = (customer, support, emails, usage) => {
  let healthScore = 100;
  const signals = [];

  const now = new Date("2026-07-14"); // Mock current date based on assignment context

  // 1. Renewal within 30 days
  const renewalDate = new Date(customer.renewalDate);
  const daysToRenewal = (renewalDate - now) / (1000 * 60 * 60 * 24);
  if (daysToRenewal > 0 && daysToRenewal <= 30) {
    healthScore -= 20;
    signals.push("Renewal Soon");
  }

  // 2. Usage drop >30%
  if (usage && usage.usageTrend && usage.usageTrend.includes("Down")) {
    const dropMatch = usage.usageTrend.match(/\d+/);
    if (dropMatch && parseInt(dropMatch[0]) > 30) {
      healthScore -= 20;
      signals.push("Usage Declining");
    }
  }

  // 3. More than 3 open tickets
  let openTickets = 0;
  let hasCriticalIssue = false;
  if (support && Array.isArray(support)) {
    support.forEach((ticket) => {
      if (ticket.status === "Open") {
        openTickets++;
        if (ticket.priority === "Critical") {
          hasCriticalIssue = true;
        }
      }
    });
  }
  
  if (openTickets > 3) {
    healthScore -= 20;
    signals.push("Multiple Open Tickets");
  }

  // 4. Critical support ticket
  if (hasCriticalIssue) {
    healthScore -= 20;
    signals.push("Critical Issue");
  }

  // 5. Negative customer email
  let hasNegativeEmail = false;
  const negativeKeywords = ["frustrated", "unresponsive", "complaining", "cost cutting", "downgrade", "too slow", "crashing", "cancel", "urgent"];
  if (emails && Array.isArray(emails)) {
    emails.forEach((email) => {
      const msg = email.message.toLowerCase();
      if (negativeKeywords.some(keyword => msg.includes(keyword))) {
        hasNegativeEmail = true;
      }
    });
  }

  if (hasNegativeEmail) {
    healthScore -= 10;
    signals.push("Negative Sentiment");
  }

  // 6. No login for 14 days
  if (usage && usage.lastLogin) {
    const lastLoginDate = new Date(usage.lastLogin);
    const daysSinceLogin = (now - lastLoginDate) / (1000 * 60 * 60 * 24);
    if (daysSinceLogin >= 14) {
      healthScore -= 10;
      signals.push("Inactive");
    }
  }

  // Ensure health score doesn't drop below 0
  healthScore = Math.max(0, healthScore);

  // 7. Health Score below 50
  if (healthScore < 50) {
    signals.push("Churn Risk");
  }

  let riskLevel = "Healthy";
  if (healthScore < 50) riskLevel = "High Risk";
  else if (healthScore <= 79) riskLevel = "Warning";

  return { healthScore, signals, riskLevel };
};

module.exports = { calculateHealthAndSignals };
