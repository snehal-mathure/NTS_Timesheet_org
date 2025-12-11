import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";

import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/forgotpassword";
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
// import UserDashboard from "./components/UserDashboard";
import AddProjectInTimesheet from "./components/AddProjectInTimesheet";
import EmpLeaveDashboard from "./components/EmpLeaveDashboard";
import ApplyLeave from "./components/ApplyLeave";
import ApproveTimesheets from "./components/ApproveTimesheets";
import ApprovalHistory from "./components/ApprovalHistory";
import ApproveLeaves from "./components/ApproveLeaves";
import ApprovalHistoryLeaves from "./components/ApprovalHistoryLeaves";
import TimesheetDashboard from "./components/timesheets/Timesheet-fill";
import TimesheetReview from "./components/timesheets/Timesheet_review";
import MyTimesheets from "./components/timesheets/MyTimesheet";
import EditEmployeePage from "./components/EditEmployeePage";
import UtilizationReport from "./components/UtilizationReport";

function App() {
  return (
    <Router>
      <Routes>
        {/* normal routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/addclient" element={<AddClient />} />
        <Route path="/viewclient" element={<ViewClient />} />
        <Route path="/leavereport" element={<LeaveReports />} />
        <Route path="/addemployee" element={<AddEmployee />} />
        <Route path="/listemployee" element={<ListEmployee />} />
        <Route path="/manageholiday" element={<ManageHoliday />} />
        <Route path="/addproject" element={<AddProject />} />
        <Route path="/projectlist" element={<ProjectList />} />
        {/* <Route path="/userdashboard" element={<UserDashboard />} /> */}
        <Route path="/addprojectintimesheet" element={<AddProjectInTimesheet />} />
        <Route path="/empleavedashboard" element={<EmpLeaveDashboard />} />
        <Route path="/applyleave" element={<ApplyLeave />} />
        <Route path="/approvetimesheets" element={<ApproveTimesheets/>} />
        <Route path="/approvalhistory" element={<ApprovalHistory/>} />
        <Route path="/approveleave" element={<ApproveLeaves/>} />
        <Route path="/approvalhistoryleaves" element={<ApprovalHistoryLeaves/>} />
        <Route path="/userdashboard" element={<TimesheetDashboard />} />
       
          <Route path="/dashboard/timesheet_review" element={<TimesheetReview/>}/>
          <Route path="/dashboard/my_timesheets" element={<MyTimesheets/>}/>
          <Route path="/editemployee/:empid" element={<EditEmployeePage />} />

         <Route path="/editemployee/" element={<EditEmployeePage />} />
         <Route path="/utilization" element={<UtilizationReport />} />

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
