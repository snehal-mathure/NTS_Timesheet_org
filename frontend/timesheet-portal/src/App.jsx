import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";

import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./components/AdminDashboard";
import AddClient from "./components/AddClient";
import ViewClient from "./components/ViewClient";
import LeaveReports from "./components/LeaveReports";
import AddEmployee from "./components/AddEmployee";
import ListEmployee from "./components/ListEmployee";
import ManageHoliday from "./components/ManageHoliday";
import AddProject from "./components/AddProject";
import ProjectList from "./components/ProjectList";

import OnboardingReports from "./components/onbording_report/OnboardingReports";
import DepartmentBillability from "./components/onbording_report/DepartmentBillability";

import ClientReports from "./components/onbording_report/ClientReports";
import ClientDepartmentDistribution from "./components/onbording_report/ClientDepartmentDistribution";
import AdminReports from "./components/onbording_report/AdminReports";
import TimesheetReports from "./components/timesheet_report/TimesheetReports";
import TimesheetDefaulters from "./components/timesheet_report/TimesheetDefaulters";
import TimesheetApprovers from "./components/timesheet_report/TimesheetApprovers";
import LeaveReportsAdmin from "./components/leave_report/LeaveReportsAdmin";

function App() {
  return (
    <Router>
      <Routes>
        {/* normal routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/addclient" element={<AddClient />} />
        <Route path="/viewclient" element={<ViewClient />} />
        <Route path="/leavereport" element={<LeaveReports />} />
        <Route path="/addemployee" element={<AddEmployee />} />
        <Route path="/listemployee" element={<ListEmployee />} />
        <Route path="/manageholiday" element={<ManageHoliday />} />
        <Route path="/addproject" element={<AddProject />} />
        <Route path="/projectlist" element={<ProjectList />} />

        {/* Onboarding reports mini-app (sub sidebar + pages) */}
        <Route path="/onboarding-reports" element={<OnboardingReports />}>
          {/* default page for /onboarding-reports */}
          <Route index element={<DepartmentBillability />} />

          {/* explicit path version */}
          <Route
            path="departmentBillability"
            element={<DepartmentBillability />}
          />

          
          <Route path="clientReports" element={<ClientReports />} />
          <Route
            path="clientDepartmentDistribution"
            element={<ClientDepartmentDistribution />}
          />
          <Route path="adminReports" element={<AdminReports />} />
          {/* <Route path="adminReports" element={<AdminReports />} /> */}
        </Route>
        <Route path="/timesheet-reports" element={<TimesheetReports />} />
        <Route path="/timesheet-defaulters" element={<TimesheetDefaulters />} />
        <Route path="/timesheet-approvers" element={<TimesheetApprovers />} />
        <Route path="/leave-reports-admin" element={<LeaveReportsAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;
