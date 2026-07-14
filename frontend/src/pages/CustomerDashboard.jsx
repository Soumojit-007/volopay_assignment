import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomerById, generateSummary } from '../api';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Sparkles, AlertCircle, TrendingDown, TrendingUp, Mail, Ticket, Clock, CheckCircle } from 'lucide-react';

const CustomerDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customerData = await getCustomerById(id);
        setData(customerData);
      } catch (error) {
        console.error("Failed to fetch customer details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleGenerateSummary = async () => {
    setAiLoading(true);
    try {
      // Exclude signals/health score if not requested by prompt, but assignment asks to pass them.
      // "The backend should combine CRM, Support, Emails, Usage, Notes, Business Signals, Health Score" -> handled in our backend /customer/:id output
      const result = await generateSummary(data);
      setAiSummary(result.summary);
    } catch (error) {
      console.error("Failed to generate AI summary", error);
      setAiSummary("Error: Unable to generate summary. Please ensure your Gemini API key is configured.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!data) return <div className="text-center py-12 text-slate-500">Customer not found.</div>;

  const { support, emails, usage, notes, signals, healthScore, riskLevel } = data;

  const getRiskColor = (level) => {
    if (level === 'High Risk') return 'bg-red-100 text-red-700 border-red-200';
    if (level === 'Warning') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getHealthColor = (score) => {
    if (score < 50) return 'text-red-600 font-bold';
    if (score <= 79) return 'text-yellow-600 font-bold';
    return 'text-green-600 font-bold';
  };

  const openTickets = support.filter(t => t.status === 'Open').length;
  const closedTickets = support.filter(t => t.status === 'Closed').length;
  const criticalTickets = support.filter(t => t.priority === 'Critical').length;
  const latestTicket = support.length > 0 ? support.reduce((latest, t) => new Date(latest.createdDate) > new Date(t.createdDate) ? latest : t) : null;

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{data.companyName}</h1>
          <div className="flex gap-2 mt-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getRiskColor(riskLevel)}`}>
              {riskLevel}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {data.industry}
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleGenerateSummary}
          disabled={aiLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
        >
          {aiLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <Sparkles size={18} />}
          {aiLoading ? 'Analyzing...' : 'Generate AI Summary'}
        </button>
      </div>

      {/* AI Summary Section */}
      {aiSummary && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={120} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 relative z-10">
            <Sparkles size={20} className="text-blue-600" />
            AI Account Analysis
          </h2>
          <div className="prose prose-sm max-w-none prose-headings:text-slate-800 prose-headings:font-bold prose-p:text-slate-700 relative z-10">
            <ReactMarkdown>{aiSummary}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Signals */}
      {signals.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {signals.map((signal, idx) => (
            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
              <AlertCircle size={12} className="mr-1.5" />
              {signal}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Overview Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Overview</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Industry</span><span className="font-medium text-slate-800">{data.country}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">MRR</span><span className="font-medium text-slate-800">${data.mrr.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">ARR</span><span className="font-medium text-slate-800">${data.arr.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Renewal Date</span><span className="font-medium text-slate-800">{data.renewalDate}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Account Owner</span><span className="font-medium text-slate-800">{data.accountOwner}</span></div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                <span className="text-slate-500">Health Score</span>
                <span className={`text-2xl ${getHealthColor(healthScore)}`}>{healthScore}</span>
              </div>
            </div>
          </div>

          {/* Usage Analytics */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Usage Analytics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">WAU / MAU</span>
                <span className="text-sm font-bold text-slate-800">{usage.weeklyActiveUsers} / {usage.monthlyActiveUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Usage Trend</span>
                <span className={`text-sm font-bold flex items-center ${usage.usageTrend.includes('Down') ? 'text-red-600' : 'text-green-600'}`}>
                  {usage.usageTrend.includes('Down') ? <TrendingDown size={14} className="mr-1"/> : (usage.usageTrend !== 'Stable' && <TrendingUp size={14} className="mr-1"/>)}
                  {usage.usageTrend}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Feature Adoption</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${usage.featureAdoption}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{usage.featureAdoption}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
                <span>Last Login</span>
                <span>{usage.lastLogin}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle & Right Columns */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Support Summary */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6 items-center sm:items-start justify-between">
            <div className="flex gap-6">
              <div className="text-center sm:text-left">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Open Tickets</p>
                <p className={`text-2xl font-bold ${openTickets > 0 ? 'text-orange-600' : 'text-slate-800'}`}>{openTickets}</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Closed Tickets</p>
                <p className="text-2xl font-bold text-slate-800">{closedTickets}</p>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Critical Issues</p>
                <p className={`text-2xl font-bold ${criticalTickets > 0 ? 'text-red-600' : 'text-slate-800'}`}>{criticalTickets}</p>
              </div>
            </div>
            
            {latestTicket && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm max-w-xs w-full">
                <p className="text-xs text-slate-400 mb-1 flex items-center"><Clock size={12} className="mr-1"/> Latest Ticket ({latestTicket.createdDate})</p>
                <p className="font-medium text-slate-700 truncate">{latestTicket.issue}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">{latestTicket.status}</span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${latestTicket.priority === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-500'}`}>{latestTicket.priority}</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Emails */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center"><Mail size={16} className="mr-2 text-slate-400"/> Recent Emails</h3>
              <div className="space-y-4">
                {emails.length > 0 ? emails.map((email, idx) => (
                  <div key={idx} className="relative pl-4 border-l-2 border-slate-200">
                    <div className="absolute w-2 h-2 bg-slate-400 rounded-full -left-[5px] top-1"></div>
                    <p className="text-xs text-slate-400 mb-0.5">{email.date} • {email.sender}</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 italic">"{email.message}"</p>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 italic">No recent emails.</p>
                )}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center"><CheckCircle size={16} className="mr-2 text-slate-400"/> Internal Notes</h3>
              <div className="space-y-3">
                {notes.length > 0 ? notes.map((note, idx) => (
                  <div key={idx} className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-100 text-sm text-slate-700">
                    {note}
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 italic">No internal notes.</p>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
