import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Scale, IndianRupee, ShieldAlert, Brain, Calendar, ChevronDown, TrendingUp, AlertCircle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function OverviewTab() {
  const chartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Compliant Audits',
        data: [310, 280, 350, 308],
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
      {
        label: 'Anomalies Flagged',
        data: [42, 38, 45, 17],
        backgroundColor: '#ef4444',
        borderRadius: 4,
      }
    ]
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, align: 'end' as const },
    },
    scales: {
      y: { beginAtZero: true, grid: { borderDash: [4, 4] } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="animate-fade-in-up w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Executive Overview</h2>
          <p className="text-sm text-slate-500">System performance and savings metrics for current month.</p>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 shadow-sm flex items-center gap-2 cursor-pointer hover:bg-slate-50">
          <Calendar className="w-4 h-4" /> Last 30 Days <ChevronDown className="w-4 h-4 ml-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Audits</p>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800">1,248</h3>
          <p className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12% from last month
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-b-4 border-b-emerald-500">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Potential Gov Savings</p>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800">₹8.14L</h3>
          <p className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Across 100 recent audits
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Anomalies Caught</p>
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800">142</h3>
          <p className="text-xs font-medium text-red-500 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> 3 pending review
          </p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg AI Match Conf.</p>
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800">96.4%</h3>
          <p className="text-xs font-medium text-slate-500 mt-2">
            High accuracy semantic matches
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Audit Volume vs Anomalies</h3>
        <div className="w-full h-72">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
