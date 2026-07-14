import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers } from '../api';
import { Search, Filter, AlertTriangle, CheckCircle, Activity, Users, Ticket, Calendar, TrendingUp } from 'lucide-react';

const LandingPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error("Failed to fetch customers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.companyName.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = filterRisk ? c.riskLevel === filterRisk : true;
    const matchesPlan = filterPlan ? c.plan === filterPlan : true;
    return matchesSearch && matchesRisk && matchesPlan;
  });

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

  // KPI Calculations
  const totalCustomers = customers.length;
  const avgHealthScore = totalCustomers > 0 ? Math.round(customers.reduce((acc, c) => acc + c.healthScore, 0) / totalCustomers) : 0;
  const atRiskCount = customers.filter(c => c.riskLevel === 'High Risk').length;
  
  // Note: Open Tickets & Average Usage would require fetching all details, 
  // For MVP Landing Page, we mock these KPIs or compute from what we have.
  const renewalsThisMonth = customers.filter(c => {
    const daysToRenewal = (new Date(c.renewalDate) - new Date("2026-07-14")) / (1000 * 60 * 60 * 24);
    return daysToRenewal > 0 && daysToRenewal <= 30;
  }).length;

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Customers</p>
            <p className="text-2xl font-bold text-slate-800">{totalCustomers}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Activity size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Avg Health Score</p>
            <p className="text-2xl font-bold text-slate-800">{avgHealthScore}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">At Risk</p>
            <p className="text-2xl font-bold text-slate-800">{atRiskCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Calendar size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Renewals (30d)</p>
            <p className="text-2xl font-bold text-slate-800">{renewalsThisMonth}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by company..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <Filter size={16} className="text-slate-400" />
            <select 
              className="bg-transparent text-sm focus:outline-none text-slate-700 font-medium"
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
            >
              <option value="">All Risks</option>
              <option value="Healthy">Healthy</option>
              <option value="Warning">Warning</option>
              <option value="High Risk">High Risk</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <select 
              className="bg-transparent text-sm focus:outline-none text-slate-700 font-medium"
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
            >
              <option value="">All Plans</option>
              <option value="Basic">Basic</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Renewal</th>
                <th className="px-6 py-4 text-center">Health Score</th>
                <th className="px-6 py-4">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    onClick={() => navigate(`/customer/${customer.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 text-base">{customer.companyName}</div>
                      <div className="text-xs text-slate-500 mt-1">{customer.industry}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">{customer.accountOwner}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                        {customer.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{customer.renewalDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-lg">
                      <span className={getHealthColor(customer.healthScore)}>{customer.healthScore}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getRiskColor(customer.riskLevel)}`}>
                        {customer.riskLevel === 'Healthy' && <CheckCircle size={12} className="mr-1" />}
                        {customer.riskLevel === 'Warning' && <AlertTriangle size={12} className="mr-1" />}
                        {customer.riskLevel === 'High Risk' && <AlertTriangle size={12} className="mr-1" />}
                        {customer.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No customers found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
