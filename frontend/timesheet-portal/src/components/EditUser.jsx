import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import employeeService from "../services/AdminDashboard/employeeService";
import UserDashboardSidebar from "../components/UserDashboardSidebar";
import PageHeader from "../components/PageHeader";
import { FiArrowLeft, FiX } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const SIDEBAR_STORAGE_KEY = "td_sidebar_collapsed";

export default function EditEmployeePage() {
  const { empid: paramEmpid } = useParams();
  const empid = paramEmpid || localStorage.getItem("empid");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // const [error, setError] = useState("");
  // const [success, setSuccess] = useState("");

  const [departments, setDepartments] = useState([]);
  const [availableClients, setAvailableClients] = useState([]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  );

  useEffect(() => {
    const handler = () => {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true");
    };
    window.addEventListener("td_sidebar_change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("td_sidebar_change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const [form, setForm] = useState({
    empid: empid || "",
    fname: "",
    lname: "",
    email: "",
    mobile: "",
    gender: "",
    core_skill: "",
    skill_details: "",
    dept_id: "",
    custom_dept: "",
    is_new_dept: false,
    designation: "",
    employee_type: "",
    prev_total_exp: "",
    approver_id: "",
    doj: "",
    lwd: "",
    company: "",
    location: "",
    work_location: "",
    country: "",
    city: "",
  });

  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await employeeService.getEmployee(empid);
        const emp = res.employee || {};

        setDepartments(res.departments || []);
        setAvailableClients(res.available_clients || []);

        setForm((prev) => ({
          ...prev,
          empid,
          fname: emp.fname || "",
          lname: emp.lname || "",
          email: emp.email || "",
          mobile: emp.mobile || "",
          gender: emp.gender || "",
          core_skill: emp.core_skill || "",
          skill_details: emp.skill_details || "",
          dept_id: emp.dept_id || "",
          designation: emp.designation || "",
          employee_type: emp.employee_type || "",
          prev_total_exp: emp.prev_total_exp ?? "",
          approver_id: emp.approver_id || "",
          doj: emp.doj || "",
          lwd: emp.lwd || "",
          company: emp.company || "",
          location: emp.location || "",
          work_location: emp.work_location || "",
          country: emp.country || "",
          city: emp.city || "",
        }));

        setAssignments(res.assignments?.length ? res.assignments : []);
      } catch (err) {
        setError("Failed to load employee data.");
      } finally {
        setLoading(false);
      }
    }

    if (empid) load();
  }, [empid]);

  const updateField = (key, value) =>
    setForm((s) => ({ ...s, [key]: value }));

  const addAssignmentRow = () =>
    setAssignments((a) => [
      ...a,
      { clientID: "", start_date: "", end_date: "" },
    ]);

  const removeAssignmentRow = (idx) =>
    setAssignments((a) => a.filter((_, i) => i !== idx));

  const updateAssignment = (idx, key, value) =>
    setAssignments((a) => {
      const copy = [...a];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });

  const validate = () => {
    if (!form.fname.trim() || !form.lname.trim()) {
      showError("First name and last name are required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      showError("Please enter a valid email address.");
      return false;
    }
    if (!/^[0-9+\s]{7,20}$/.test(form.mobile || "")) {
      showError("Please enter a valid mobile number (7–20 digits).");
      return false;
    }
    if (form.is_new_dept && !form.custom_dept.trim()) {
      showError("Please provide a department name.");
      return false;
    }
    for (let a of assignments) {
      if (a.clientID && !a.start_date) {
        showError("Each assignment must have a start date.");
        return false;
      }
    }
    return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const loadingToast = showLoading("Updating employee...");

    try {
      const payload = {
        form: {
          ...form,
          dept_id: form.is_new_dept ? form.custom_dept : form.dept_id,
        },
        assignments: assignments.map((a) => ({
          clientID: a.clientID,
          start_date: a.start_date || "",
          end_date: a.end_date || "",
        })),
      };

      const res = await employeeService.updateEmployee(empid, payload);

      toast.dismiss(loadingToast);
      showSuccess(res.message || "Employee updated successfully!");
    } catch (err) {
      toast.dismiss(loadingToast);
      showError(err.response?.data?.error || "Failed to update employee.");
    } finally {
      setSaving(false);
    }
  };


  const accent = "#4C6FFF";

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-slate-600">
        Loading employee...
      </div>
    );

  const mainMarginClass = sidebarCollapsed ? "md:ml-20" : "md:ml-60";

  const showSuccess = (msg) =>
    toast.success(msg, {
      icon: "✅",
      style: {
        borderLeft: "6px solid #22c55e",
        borderRadius: "10px",
        background: "#ffffff",
        color: "#1f2937",
        fontSize: "14px",
      },
    });

  const showError = (msg) =>
    toast.error(msg, {
      icon: "❌",
      style: {
        borderLeft: "6px solid #ef4444",
        borderRadius: "10px",
        background: "#ffffff",
        color: "#1f2937",
        fontSize: "14px",
      },
    });

  const showLoading = (msg) =>
    toast.loading(msg, {
      style: {
        borderLeft: "6px solid #3b82f6",
        borderRadius: "10px",
        background: "#ffffff",
        color: "#1f2937",
        fontSize: "14px",
      },
    });


  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ backgroundColor: "#F5F7FF" }}
    >
      {/* FIXED SIDEBAR MATCHING AddEmployeePage */}
      <aside className="fixed left-0 top-0 bottom-0 z-30">
        <div className={`h-screen ${sidebarCollapsed ? "w-20" : "w-60"}`}>
          <UserDashboardSidebar />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        className={`flex-1 h-full overflow-y-auto px-4 md:px-10 py-6 md:py-2 transition-all duration-200 ${mainMarginClass}`}
      >
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          newestOnTop
          theme="light"
        />


        <div className="max-w-5xl mx-auto space-y-5 mt-4">
          <PageHeader
            section="Employees"
            title={`Edit Employee — ${form.fname} ${form.lname} (${form.empid})`}
            description="Update employee details, assignments, and access information."
          />

          {/* Alerts
          {error && (
            <div className="rounded-2xl px-4 py-3 text-sm bg-rose-50 text-rose-800 border border-rose-100 flex justify-between">
              <span>{error}</span>
              <button onClick={() => setError("")} className="text-xs underline">
                Dismiss
              </button>
            </div>
          )}

          {success && (
            <div className="rounded-2xl px-4 py-3 text-sm bg-emerald-50 text-emerald-800 border border-emerald-100 flex justify-between">
              <span>{success}</span>
              <button
                onClick={() => setSuccess("")}
                className="text-xs underline"
              >
                Dismiss
              </button>
            </div>
          )} */}

          {/* MAIN CARD */}
          <div className="bg-white/90 rounded-3xl shadow-[0_24px_60px_rgba(15,23,42,0.12)] border border-[#e5e7f5] overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e5e7f5] bg-white/80">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#F3F5FF] flex items-center justify-center shadow-sm">
                  <svg
                    className="w-6 h-6 text-[#4C6FFF]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 20v-1a4 4 0 014-4h2a4 4 0 014 4v1"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <circle
                      cx="12"
                      cy="8"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Edit Employee Details
                  </h2>
                  <p className="text-sm text-slate-500">
                    Modify personal, professional, and client data.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center px-4 py-2 rounded-2xl 
                          text-xs font-medium border border-slate-300 bg-white text-slate-700 
                          hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900 
                          transition"
                title="Go Back"
              >
                <FiArrowLeft size={18} className="text-slate-700" />
              </button>
            </div>

            {/* BODY */}
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              {/* BASIC INFO */}
              <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-5">
                <h2 className="font-semibold mb-3 text-sm text-slate-800">
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Employee ID
                    </label>
                    <input
                      readOnly
                      value={form.empid}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 bg-gray-100 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      First Name *
                    </label>
                    <input
                      value={form.fname}
                      onChange={(e) => updateField("fname", e.target.value)}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Last Name *
                    </label>
                    <input
                      value={form.lname}
                      onChange={(e) => updateField("lname", e.target.value)}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Mobile *
                    </label>
                    <input
                      value={form.mobile}
                      onChange={(e) => updateField("mobile", e.target.value)}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Gender
                    </label>
                    <select
                      value={form.gender}
                      onChange={(e) => updateField("gender", e.target.value)}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* PROFESSIONAL SECTION */}
              <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-5">
                <h2 className="font-semibold mb-3 text-sm text-slate-800">
                  Professional Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Core Skill
                    </label>
                    <input
                      value={form.core_skill}
                      onChange={(e) => updateField("core_skill", e.target.value)}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Skill Details
                    </label>
                    <textarea
                      value={form.skill_details}
                      onChange={(e) =>
                        updateField("skill_details", e.target.value)
                      }
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                      rows="3"
                    />
                  </div>

                  {/* Department */}
                  {/* <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Department
                    </label>
                    <select
                      value={form.is_new_dept ? "custom" : form.dept_id}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "custom") {
                          updateField("is_new_dept", true);
                          updateField("custom_dept", "");
                        } else {
                          updateField("is_new_dept", false);
                          updateField("dept_id", v);
                        }
                      }}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="">Select</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.dept_name}
                        </option>
                      ))}
                      <option value="custom">+ Add New Department</option>
                    </select>

                    {form.is_new_dept && (
                      <input
                        className="mt-2 block w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                        placeholder="New Department Name"
                        value={form.custom_dept}
                        onChange={(e) =>
                          updateField("custom_dept", e.target.value)
                        }
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Designation
                    </label>
                    <input
                      value={form.designation}
                      onChange={(e) => updateField("designation", e.target.value)}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Employee Type
                    </label>
                    <select
                      value={form.employee_type}
                      onChange={(e) =>
                        updateField("employee_type", e.target.value)
                      }
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="">Select</option>
                      <option>Employee</option>
                      <option>Contractor</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Approver ID
                    </label>
                    <input
                      value={form.approver_id}
                      onChange={(e) =>
                        updateField("approver_id", e.target.value)
                      }
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Date of Joining
                    </label>
                    <input
                      type="date"
                      value={form.doj}
                      onChange={(e) => updateField("doj", e.target.value)}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Last Working Day
                    </label>
                    <input
                      type="date"
                      value={form.lwd}
                      onChange={(e) => updateField("lwd", e.target.value)}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Previous Experience (Years)
                    </label>
                    <input
                      type="number"
                      value={form.prev_total_exp}
                      onChange={(e) =>
                        updateField("prev_total_exp", e.target.value)
                      }
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div> */}

                  {/* <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Company
                    </label>
                    <select
                      value={form.company}
                      onChange={(e) => updateField("company", e.target.value)}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="">Select</option>
                      <option>NTS India</option>
                      <option>NTS Dubai</option>
                      <option>NTS US</option>
                      <option>NTS Costa Rica</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Location
                    </label>
                    <select
                      value={form.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="">Select</option>
                      <option>Onsite</option>
                      <option>Offshore</option>
                      <option>Nearshore</option>
                    </select>
                  </div> */}
                </div>
              </section>

              {/* LOCATION */}
              <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-5">
                <h2 className="font-semibold mb-3 text-sm text-slate-800">
                  Location Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Work Location
                    </label>
                    <input
                      value={form.work_location}
                      onChange={(e) =>
                        updateField("work_location", e.target.value)
                      }
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      Country
                    </label>
                    <input
                      value={form.country}
                      onChange={(e) => updateField("country", e.target.value)}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600">
                      City
                    </label>
                    <input
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className="mt-1 block w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* CLIENT ASSIGNMENTS */}
              {/* <section className="rounded-2xl border border-slate-100 bg-[#F8F9FF] p-5">
                <h2 className="font-semibold mb-3 text-sm text-slate-800">
                  Client Assignments
                </h2>

                {assignments.length === 0 && (
                  <div className="text-sm text-slate-500 mb-3">
                    No assignments yet. Add below.
                  </div>
                )}

                <div className="space-y-4">
                  {assignments.map((a, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-white p-4 rounded-2xl border border-slate-200"
                    >
                      <div>
                        <label className="block text-xs font-medium text-slate-600">
                          Client
                        </label>
                        <select
                          value={a.clientID}
                          onChange={(e) =>
                            updateAssignment(idx, "clientID", e.target.value)
                          }
                          className="mt-1 block w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                        >
                          <option value="">Select Client</option>
                          {availableClients.map((c) => (
                            <option key={c.clientID} value={c.clientID}>
                              {c.client_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={a.start_date}
                          onChange={(e) =>
                            updateAssignment(idx, "start_date", e.target.value)
                          }
                          className="mt-1 block w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={a.end_date}
                          onChange={(e) =>
                            updateAssignment(idx, "end_date", e.target.value)
                          }
                          className="mt-1 block w-full rounded-2xl border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="md:col-span-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => removeAssignmentRow(idx)}
                          title="Remove"
                          className="p-2 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 
                                    hover:bg-rose-200 transition flex items-center justify-center"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addAssignmentRow}
                  className="mt-4 px-4 py-2 rounded-2xl text-xs font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, #6C5CE7)`,
                  }}
                >
                  + Add Assignment
                </button>
              </section> */}

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3 border-t border-[#e5e7f5] pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-4 py-2 rounded-2xl text-xs font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-900 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${accent}, #6C5CE7)`,
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
