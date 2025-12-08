import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import employeeService from "../services/AdminDashboard/employeeService";

export default function EditEmployeePage() {
  const { empid: paramEmpid } = useParams();
  const empid = paramEmpid || localStorage.getItem("empid");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // No admin logic now
  const [departments, setDepartments] = useState([]);
  const [availableClients, setAvailableClients] = useState([]);

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
    city: ""
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
          empid: empid,
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
          city: emp.city || ""
        }));

        setAssignments(res.assignments?.length ? res.assignments : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load employee data.");
      } finally {
        setLoading(false);
      }
    }

    if (empid) load();
    else {
      setError("No empid provided");
      setLoading(false);
    }
  }, [empid]);

  const updateField = (key, value) => setForm((s) => ({ ...s, [key]: value }));

  const addAssignmentRow = () =>
    setAssignments((a) => [...a, { clientID: "", start_date: "", end_date: "" }]);

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
      setError("First name and last name are required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!/^[0-9+\s]{7,20}$/.test(form.mobile || "")) {
      setError("Please enter a valid mobile number (7-20 digits).");
      return false;
    }
    if (form.is_new_dept && !form.custom_dept.trim()) {
      setError("Please provide a department name.");
      return false;
    }
    for (let i = 0; i < assignments.length; i++) {
      const a = assignments[i];
      if (a.clientID && !a.start_date) {
        setError("Each assignment must have a start date.");
        return false;
      }
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        form: {
          ...form,
          dept_id: form.is_new_dept ? form.custom_dept : form.dept_id
        },
        assignments: assignments.map((a) => ({
          clientID: a.clientID,
          start_date: a.start_date || "",
          end_date: a.end_date || ""
        }))
      };

      const res = await employeeService.updateEmployee(empid, payload);
      setSuccess(res.message || "Employee updated successfully");

      // setTimeout(() => navigate(`/viewemployee/${empid}`), 900);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to update employee.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading employee...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        Edit Employee — {form.fname} {form.lname} ({form.empid})
      </h1>

      {error && (
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">{error}</div>
      )}
      {success && (
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* BASIC INFORMATION */}
        <section className="bg-white shadow rounded p-6">
          <h2 className="text-lg font-medium text-slate-700 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm text-slate-600">Employee ID</label>
              <input readOnly value={form.empid}
                className="mt-1 block w-full rounded border-gray-200 bg-gray-50 p-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm text-slate-600">First Name *</label>
              <input value={form.fname} onChange={(e)=>updateField("fname", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm text-slate-600">Last Name *</label>
              <input value={form.lname} onChange={(e)=>updateField("lname", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm text-slate-600">Email *</label>
              <input type="email" value={form.email}
                onChange={(e)=>updateField("email", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm text-slate-600">Mobile *</label>
              <input value={form.mobile} onChange={(e)=>updateField("mobile", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm text-slate-600">Gender</label>
              <select value={form.gender} onChange={(e)=>updateField("gender", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

          </div>
        </section>

        {/* PROFESSIONAL INFORMATION */}
        <section className="bg-white shadow rounded p-6">
          <h2 className="text-lg font-medium text-slate-700 mb-4">Professional Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm text-slate-600">Core Skill</label>
              <input value={form.core_skill} onChange={(e)=>updateField("core_skill", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm text-slate-600">Skill Details</label>
              <textarea value={form.skill_details} onChange={(e)=>updateField("skill_details", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm" rows="3" />
            </div>

            {/* Department - always open */}
            <div>
              <label className="block text-sm text-slate-600">Department</label>
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
                className="mt-1 block w-full rounded border p-2 text-sm"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.dept_name}
                  </option>
                ))}
                <option value="custom">+ Add New Department</option>
              </select>

              {form.is_new_dept && (
                <input
                  className="mt-2 w-full rounded border p-2 text-sm"
                  placeholder="New Department Name"
                  value={form.custom_dept}
                  onChange={(e) => updateField("custom_dept", e.target.value)}
                />
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-600">Designation</label>
              <input value={form.designation} onChange={(e)=>updateField("designation", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm text-slate-600">Employee Type</label>
              <select value={form.employee_type} onChange={(e)=>updateField("employee_type", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm">
                <option value="">Select</option>
                <option>Employee</option>
                <option>Contractor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-600">Approver ID</label>
              <input value={form.approver_id} onChange={(e)=>updateField("approver_id", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm text-slate-600">Date of Joining</label>
              <input type="date" value={form.doj}
                onChange={(e)=>updateField("doj", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm text-slate-600">Last Working Day</label>
              <input type="date" value={form.lwd}
                onChange={(e)=>updateField("lwd", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm text-slate-600">Previous Experience (years)</label>
              <input type="number" value={form.prev_total_exp}
                onChange={(e)=>updateField("prev_total_exp", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm text-slate-600">Company</label>
              <select value={form.company}
                onChange={(e)=>updateField("company", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm">
                <option value="">Select</option>
                <option>NTS India</option>
                <option>NTS Dubai</option>
                <option>NTS US</option>
                <option>NTS Costa Rica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-600">Location (Onsite/Offshore)</label>
              <select value={form.location}
                onChange={(e)=>updateField("location", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm">
                <option value="">Select</option>
                <option>Onsite</option>
                <option>Offshore</option>
                <option>Nearshore</option>
              </select>
            </div>

          </div>
        </section>

        {/* LOCATION INFO */}
        <section className="bg-white shadow rounded p-6">
          <h2 className="text-lg font-medium text-slate-700 mb-4">Location Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <label className="block text-sm text-slate-600">Work Location</label>
              <input value={form.work_location}
                onChange={(e)=>updateField("work_location", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm text-slate-600">Country</label>
              <input value={form.country} 
                onChange={(e)=>updateField("country", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm text-slate-600">City</label>
              <input value={form.city}
                onChange={(e)=>updateField("city", e.target.value)}
                className="mt-1 block w-full rounded border p-2 text-sm" />
            </div>

          </div>
        </section>

        {/* CLIENT ASSIGNMENTS */}
        <section className="bg-white shadow rounded p-6">
          <h2 className="text-lg font-medium text-slate-700 mb-4">Client Assignments</h2>

          {assignments.length === 0 && (
            <div className="text-sm text-slate-500 mb-3">No assignments yet. Add below.</div>
          )}

          <div className="space-y-4">
            {assignments.map((a, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">

                <div>
                  <label className="text-sm text-slate-600">Client</label>
                  <select value={a.clientID}
                    onChange={(e)=>updateAssignment(idx, "clientID", e.target.value)}
                    className="mt-1 block w-full rounded border p-2 text-sm">
                    <option value="">Select Client</option>
                    {availableClients.map((c) => (
                      <option key={c.clientID} value={c.clientID}>
                        {c.client_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-600">Start Date</label>
                  <input type="date" value={a.start_date}
                    onChange={(e)=>updateAssignment(idx, "start_date", e.target.value)}
                    className="mt-1 block w-full rounded border p-2 text-sm" />
                </div>

                <div>
                  <label className="text-sm text-slate-600">End Date</label>
                  <input type="date" value={a.end_date}
                    onChange={(e)=>updateAssignment(idx, "end_date", e.target.value)}
                    className="mt-1 block w-full rounded border p-2 text-sm" />
                </div>

                <div className="md:col-span-2 flex gap-2">
                  <button type="button"
                    onClick={()=>removeAssignmentRow(idx)}
                    className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700">
                    Remove
                  </button>
                </div>

              </div>
            ))}
          </div>

          <button type="button"
            onClick={addAssignmentRow}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
            + Add Assignment
          </button>
        </section>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={()=>navigate(-1)}
            className="bg-gray-300 text-slate-800 px-4 py-2 rounded hover:bg-gray-400">
            Cancel
          </button>

          <button type="submit" disabled={saving}
            className={`px-4 py-2 rounded text-white ${
              saving ? "bg-blue-400" : "bg-blue-700 hover:bg-blue-800"
            }`}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </form>
    </div>
  );
}