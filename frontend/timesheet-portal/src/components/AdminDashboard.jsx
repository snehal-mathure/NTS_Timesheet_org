// File: src/components/AdminDashboard.jsx
import React, { useEffect, useRef, useState } from 'react';
// import Sidebar from './Sidebar';
import {
  fetchDashboardTotals,
  fetchClientAllocations,
  fetchClients,
  fetchProjects,
  fetchChartCounts,
} from '../services/AdminDashboard/admindashboard';
import Chart from 'chart.js/auto';

export default function AdminDashboard() {
  const [totals, setTotals] = useState({ employees: 0, clients: 0, projects: 0 });
  const [clientAllocations, setClientAllocations] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  const [clientNames, setClientNames] = useState([]);
  const [employeeCounts, setEmployeeCounts] = useState([]);
  const [departmentNames, setDepartmentNames] = useState([]);
  const [departmentCounts, setDepartmentCounts] = useState([]);
  const [billableCount, setBillableCount] = useState(0);
  const [nonBillableCount, setNonBillableCount] = useState(0);

  const employeeChartRef = useRef(null);
  const departmentChartRef = useRef(null);
  const billableChartRef = useRef(null);
  const charts = useRef({});

  const [activeSection, setActiveSection] = useState('dashboard');
  const [openMenuKey, setOpenMenuKey] = useState(null);
  const [clientSearch, setClientSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const t = await fetchDashboardTotals();
        if (!mounted) return;
        setTotals({ employees: t.total_employees || 0, clients: t.total_clients || 0, projects: t.total_projects || 0 });

        const allocs = await fetchClientAllocations(); if (!mounted) return; setClientAllocations(allocs || []);
        const cl = await fetchClients(); if (!mounted) return; setClients(cl || []);
        const pr = await fetchProjects(); if (!mounted) return; setProjects(pr || []);
        const chartData = await fetchChartCounts(); if (!mounted) return;

        setClientNames(chartData.client_names || []);
        setEmployeeCounts(chartData.employee_counts || []);
        setDepartmentNames(chartData.department_names || []);
        setDepartmentCounts(chartData.department_counts || []);
        setBillableCount(chartData.billable_count || 0);
        setNonBillableCount(chartData.non_billable_count || 0);
      } catch (err) {
        console.error(err);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    Object.values(charts.current).forEach(c => c && c.destroy());
    charts.current = {};

    try {
      if (employeeChartRef.current) {
        charts.current.employee = new Chart(employeeChartRef.current.getContext('2d'), {
          type: 'pie',
          data: { labels: clientNames, datasets: [{ data: employeeCounts, backgroundColor: ['#FB7185','#34D399','#60A5FA','#FBBF24','#A78BFA'], hoverOffset: 4 }] },
          options: { responsive: true, plugins: { legend: { position: 'right' } } }
        });
      }

      if (departmentChartRef.current) {
        charts.current.department = new Chart(departmentChartRef.current.getContext('2d'), {
          type: 'pie',
          data: { labels: departmentNames, datasets: [{ data: departmentCounts, backgroundColor: ['#7DD3FC','#FB7185','#34D399','#FDE68A','#C4B5FD'], hoverOffset: 4 }] },
          options: { responsive: true, plugins: { legend: { position: 'right' } } }
        });
      }

      if (billableChartRef.current) {
        charts.current.billable = new Chart(billableChartRef.current.getContext('2d'), {
          type: 'doughnut',
          data: { labels: ['Billable','Non-Billable'], datasets: [{ data: [billableCount, nonBillableCount], backgroundColor: ['#FB7185','#34D399'] }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
      }
    } catch (err) { console.error('chart init', err); }

    return () => { Object.values(charts.current).forEach(c => c && c.destroy()); };
  }, [clientNames, employeeCounts, departmentNames, departmentCounts, billableCount, nonBillableCount]);

  const toggleMenu = (key) => setOpenMenuKey(prev => prev === key ? null : key);

  const filteredClients = clients.filter(c => c.client_name?.toLowerCase().includes(clientSearch.toLowerCase()));
  const filteredAllocations = clientAllocations.filter(a => a.client_name?.toLowerCase().includes(clientSearch.toLowerCase()));

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* <Sidebar openMenuKey={openMenuKey} setOpenMenuKey={setOpenMenuKey} setActiveSection={setActiveSection} /> */}

      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-sky-800">Dashboard</h1>
          <a href="/logout" className="inline-flex items-center bg-sky-700 text-white px-3 py-2 rounded-md"> <i className="fas fa-power-off mr-2"/> Logout</a>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
            <div className="bg-sky-50 text-sky-700 p-3 rounded-md"><i className="fas fa-users"/></div>
            <div>
              <h3 className="text-xs text-gray-500">Total Employees</h3>
              <p className="text-xl font-semibold">{totals.employees}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
            <div className="bg-sky-50 text-sky-700 p-3 rounded-md"><i className="fas fa-briefcase"/></div>
            <div>
              <h3 className="text-xs text-gray-500">Active Clients</h3>
              <p className="text-xl font-semibold">{totals.clients}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
            <div className="bg-sky-50 text-sky-700 p-3 rounded-md"><i className="fas fa-project-diagram"/></div>
            <div>
              <h3 className="text-xs text-gray-500">Active Projects</h3>
              <p className="text-xl font-semibold">{totals.projects}</p>
            </div>
          </div>
        </section>

        {activeSection === 'employees' && (
          <section className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Client Employee Allocation</h2>
              <div className="flex gap-2">
                <input value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="px-3 py-2 border rounded-md" placeholder="Search clients..." />
                <a href="/export-client-allocations" className="px-3 py-2 bg-green-600 text-white rounded-md">Export CSV</a>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr><th className="py-2">Client Name</th><th className="py-2">Number of Employees</th></tr>
                </thead>
                <tbody>
                  {filteredAllocations.map((a, i) => (
                    <tr key={i} className="border-t"><td className="py-2">{a.client_name}</td><td className="py-2">{a.employee_count}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeSection === 'clients' && (
          <section className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Client List</h2>
              <input value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="px-3 py-2 border rounded-md" placeholder="Search clients..." />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500"><tr><th className="py-2">Client ID</th><th>Name</th><th>Start Date</th><th>End Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredClients.map(c => (
                    <tr key={c.clientID} className="border-t"><td className="py-2">{c.clientID}</td><td className="py-2">{c.client_name}</td><td className="py-2">{c.start_date}</td><td className="py-2">{c.end_date}</td>
                      <td className="py-2"><button className="mr-2"><i className="fas fa-edit"/></button><button><i className="fas fa-trash"/></button></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeSection === 'projects' && (
          <section className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Project List</h2>
              <input className="px-3 py-2 border rounded-md" placeholder="Search projects..." />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500"><tr><th>ID</th><th>Client</th><th>Project Name</th><th>Project Code</th><th>Start</th><th>End</th><th>Actions</th></tr></thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id} className="border-t"><td className="py-2">{p.id}</td><td className="py-2">{p.client_name}</td><td className="py-2">{p.project_name}</td><td className="py-2">{p.project_code}</td><td className="py-2">{p.start_date}</td><td className="py-2">{p.end_date}</td>
                      <td className="py-2"><button className="mr-2"><i className="fas fa-edit"/></button><button><i className="fas fa-trash"/></button></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeSection === 'dashboard' && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-center text-sky-700 font-medium mb-3">Employees Per Client</h3>
              <canvas ref={employeeChartRef} className="w-full h-64" />
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-center text-sky-700 font-medium mb-3">Employees Per Department</h3>
              <canvas ref={departmentChartRef} className="w-full h-64" />
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-center text-sky-700 font-medium mb-3">Billable vs Non-Billable</h3>
              <div className="h-64"><canvas ref={billableChartRef} className="w-full h-full" /></div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

