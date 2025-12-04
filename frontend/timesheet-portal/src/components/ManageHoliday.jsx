// src/pages/ManageHoliday.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  getHolidays,
  addHoliday,
  deleteHoliday,
} from "../services/AdminDashboard/manageHoliday";
import Sidebar from "../components/Sidebar";
import PageHeader from "../components/PageHeader";

export default function ManageHoliday() {
  const [holidays, setHolidays] = useState([]);

  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    holiday_type: "RH",
    dc: "",
    holiday_desc: "",
  });

  const tableRef = useRef(null);

  const loadData = async () => {
    const data = await getHolidays();
    if (data) setHolidays(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submitHoliday = async (e) => {
    e.preventDefault();

    const res = await addHoliday(form);
    if (res?.status === "success") {
      alert("Holiday Added Successfully");
      loadData();
      setForm({
        start_date: "",
        end_date: "",
        holiday_type: "RH",
        dc: "",
        holiday_desc: "",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) return;

    const res = await deleteHoliday(id);
    if (res?.status === "success") {
      alert("Holiday deleted");
      loadData();
    }
  };

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ backgroundColor: "#f5f7fb" }}
    >
      {/* Sidebar – fixed column with its own scroll */}
      <aside className="w-74 h-full bg-white border-r border-slate-200 overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Main area – independent scroll, aligned like other pages */}
      <main className="flex-1 h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-8">
          {/* Header (PageHeader style) */}
          <PageHeader
            title="Manage Holidays"
            subtitle="Add, review and maintain company holiday calendar."
            statLabel="Total Holidays"
            statValue={holidays?.length ?? 0}
          />

          {/* Main Card */}
          <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm overflow-hidden min-h-[60vh] flex flex-col mt-4">
            <div className="px-6 lg:px-8 py-8 space-y-8 flex-1">
              {/* Form + Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 lg:p-7 shadow-sm">
                  <h3 className="text-[15px] font-semibold mb-1 text-slate-800">
                    Add New Holiday
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-4">
                    Define date range, type and description for the holiday.
                  </p>

                  <form onSubmit={submitHoliday} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Start Date <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="date"
                          name="start_date"
                          value={form.start_date}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded-full px-3 py-2 text-xs bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          End Date <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="date"
                          name="end_date"
                          value={form.end_date}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded-full px-3 py-2 text-xs bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Type
                        </label>
                        <select
                          name="holiday_type"
                          value={form.holiday_type}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded-full px-3 py-2 text-xs bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                        >
                          <option value="RH">Restricted</option>
                          <option value="PH">Public</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Dept Code (DC)
                        </label>
                        <input
                          type="text"
                          name="dc"
                          value={form.dc}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded-full px-3 py-2 text-xs bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                          placeholder="Optional"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          name="holiday_desc"
                          value={form.holiday_desc}
                          onChange={handleChange}
                          className="w-full border border-slate-200 rounded-full px-3 py-2 text-xs bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                          placeholder="Reason / description"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-full text-xs font-medium shadow-sm focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                      >
                        Add Holiday
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            start_date: "",
                            end_date: "",
                            holiday_type: "RH",
                            dc: "",
                            holiday_desc: "",
                          })
                        }
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50"
                      >
                        Reset
                      </button>
                    </div>
                  </form>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-7 shadow-sm">
                  <h3 className="text-[15px] font-semibold mb-2 text-slate-800">
                    Quick Actions
                  </h3>
                  <p className="text-[11px] text-slate-600 mb-4">
                    Use these shortcuts to manage your holiday list.
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={loadData}
                      className="w-full inline-flex items-center justify-between gap-2 px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-700 hover:bg-slate-100"
                    >
                      <span>Refresh List</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                        Sync
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        tableRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className="w-full inline-flex items-center justify-between gap-2 px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-xs text-slate-700 hover:bg-slate-100"
                    >
                      <span>View All Holidays</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                        List
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Card */}
              <div
                ref={tableRef}
                className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-7 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-semibold text-slate-800">
                    Holiday List
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    {holidays?.length ?? 0} items
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">
                          Start Date
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">
                          End Date
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">
                          Dept Code
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-slate-100">
                      {holidays?.length ? (
                        holidays.map((h) => (
                          <tr key={h.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              {h.start_date}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {h.end_date}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {h.holiday_type}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {h.dc || "-"}
                            </td>
                            <td className="px-4 py-3">
                              <span className="line-clamp-2">
                                {h.holiday_desc}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleDelete(h.id)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium shadow-sm"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-slate-500 text-xs"
                          >
                            No holidays found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* end table card */}
            </div>
          </div>
          {/* end main card */}
        </div>
      </main>
    </div>
  );
}
