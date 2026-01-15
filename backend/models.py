from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from datetime import date
import os

db = SQLAlchemy()  
class Department(db.Model):
    __tablename__ = 'departments'
    id = db.Column(db.Integer, primary_key=True)
    dept_name = db.Column(db.String(100), unique=True, nullable=False)

    # Optional: Reverse relation (not mandatory)
    employees = db.relationship('Employee_Info', back_populates='department')

 
class Employee_Info(db.Model):
    __tablename__ = 'employee_info'
    empid = db.Column(db.String(50), primary_key=True, nullable=False)
    fname = db.Column(db.String(100), nullable=False)
    lname = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    
    # Replaced dept with dept_id
    dept_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)

    password = db.Column(db.String(120), nullable=False)
    approver_id = db.Column(db.String(50), db.ForeignKey('employee_info.empid', name='fk_approver_id'), nullable=True)
    secondary_approver_id = db.Column(
    db.String(50),
    db.ForeignKey('employee_info.empid', name='fk_secondary_approver_id'),
    nullable=True
)

    # Remaining columns...
    mobile = db.Column(db.String(15), nullable=True)
    designation = db.Column(db.String(100), nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    employee_type = db.Column(db.String(50), nullable=True)
    location = db.Column(db.String(200), nullable=True)
    company = db.Column(db.String(100), nullable=True)
    work_location = db.Column(db.String(200), nullable=True)
    payroll = db.Column(db.String(50), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    core_skill = db.Column(db.String(200), nullable=True)
    skill_details = db.Column(db.Text, nullable=True)
    doj = db.Column(db.Date, nullable=True)
    lwd = db.Column(db.Date, nullable=True)
    prev_total_exp = db.Column(db.Float, nullable=True)
    role = db.Column(db.String(20), nullable=False, default="Employee")
    job_role_id = db.Column(db.Integer, db.ForeignKey('job_roles.id'), nullable=True)

    job_role = db.relationship('JobRole', backref=db.backref('employees', lazy=True))


    # Relationship to department
    department = db.relationship('Department', back_populates='employees')

    def __repr__(self):
        return f'<Employee {self.fname} {self.lname}, Email: {self.email}, Dept: {self.department.dept_name}>'

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

 
 
# Project_Info model
class Project_Info(db.Model):
    __tablename__ = 'project_info'
    id = db.Column(db.Integer, primary_key=True)

    client_id = db.Column(db.Integer, db.ForeignKey('client_info.clientID'), nullable=False)
    client = db.relationship('Client_Info', backref=db.backref('projects', lazy=True))

    project_name = db.Column(db.String(100), nullable=False)
    project_code = db.Column(db.String(50), nullable=False)
    start_date = db.Column(db.Date, nullable=False, default=date.today)
    end_date = db.Column(db.Date, nullable=True)
    project_billability = db.Column(db.String(20), nullable=True, default="Billable")
    project_type = db.Column(db.String(50), nullable=True)
    daily_hours = db.Column(db.Float, nullable=True)

    def __repr__(self):
        return (f'<Project {self.client.client_name} - {self.project_name} (Code: {self.project_code}), 'f'Start: {self.start_date}, End: {self.end_date}, 'f'Billability: {self.project_billability}, Type: {self.project_type},'f'Daily Hours: {self.daily_hours}>')


# Association table for many-to-many relationship between Employee_Info and Project_Info
class Employee_Project(db.Model):
    __tablename__ = 'employee_project'
    empid = db.Column(db.String(50), db.ForeignKey('employee_info.empid'), primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project_info.id'), primary_key=True)
 
    employee = db.relationship('Employee_Info', backref=db.backref('assigned_projects', lazy=True))
    project = db.relationship('Project_Info', backref=db.backref('assigned_employees', lazy=True))
 
    def __repr__(self):
        return f'<EmployeeProject {self.empid} working on project {self.project_id}>'
 
# Client_Info model
class Client_Info(db.Model):
    __tablename__ = 'client_info'
    clientID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    client_name = db.Column(db.String(100), nullable=False)  # Client Name
    start_date = db.Column(db.Date, nullable=True)  # Start Date
    end_date = db.Column(db.Date, nullable=True)  # End Date (nullable, as the client relationship might be ongoing)
    # daily_hours = db.Column(db.Float, nullable=True)  # New column for daily hours
 
    def __repr__(self):
        return (f'<Client {self.client_name} (ID: {self.clientID}), '
                f'Start: {self.start_date}, End: {self.end_date}>')
 
# Association table for many-to-many relationship between Employee_Info and Client_Info
class Client_Employee(db.Model):
    __tablename__ = 'client_employee'
   
    # Adding a unique identifier for each record
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Auto-incrementing primary key
   
    empid = db.Column(db.String(50), db.ForeignKey('employee_info.empid'), nullable=False)
    clientID = db.Column(db.String(50), db.ForeignKey('client_info.clientID'), nullable=False)
   
    # New columns for start and end dates
    start_date = db.Column(db.Date, nullable=False, default=date.today)  # Default to today's date
    end_date = db.Column(db.Date, nullable=True)  # Nullable, as end date might not be set initially
   
    employee = db.relationship('Employee_Info', backref=db.backref('assigned_clients', lazy=True))
    client = db.relationship('Client_Info', backref=db.backref('assigned_employees', lazy=True))
 
# Timesheet model for storing work hours per day
class Timesheet(db.Model):
    __tablename__ = 'timesheets'
    id = db.Column(db.Integer, primary_key=True)
    empid = db.Column(db.String(50), db.ForeignKey('employee_info.empid'), nullable=False)
    week_start_date = db.Column(db.Date, nullable=False)
    submitted_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    comments = db.Column(db.String(100), nullable=True)
    approved_by = db.Column(db.String(50), db.ForeignKey('employee_info.empid'), nullable=True)
 
    # Explicitly defining foreign_keys to avoid ambiguity
    employee = db.relationship('Employee_Info', foreign_keys=[empid], backref=db.backref('timesheets', lazy=True))
    approver = db.relationship('Employee_Info', foreign_keys=[approved_by], backref=db.backref('approved_timesheets', lazy=True))
 
    def __repr__(self):
        return f'<Timesheet {self.id} for employee {self.empid}>'
 
# TimesheetEntry model for individual time entries
class TimesheetEntry(db.Model):
    __tablename__ = 'timesheet_entries'
    id = db.Column(db.Integer, primary_key=True)
    empid = db.Column(db.String(50), db.ForeignKey('employee_info.empid'), nullable=False)
    timesheet_id = db.Column(db.Integer, db.ForeignKey('timesheets.id'), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project_info.id'), nullable=False)
    work_date = db.Column(db.Date, nullable=True)
    hours_worked = db.Column(db.Float, nullable=False)
 
    employee = db.relationship('Employee_Info', backref=db.backref('timesheet_entries', lazy=True))
    timesheet = db.relationship('Timesheet', backref=db.backref('entries', lazy=True))
    project = db.relationship('Project_Info', backref=db.backref('timesheet_entries', lazy=True))
 
#######Leaves
class LeaveType(db.Model):
    __tablename__ = 'leave_type'
    leave_id = db.Column(db.Integer, primary_key=True)
    leave_type = db.Column(db.String(50), unique=True, nullable=False)

    def __repr__(self):
        return f'<LeaveType {self.leave_id} - {self.leave_type}>'

 
# Leave_Balance model for storing leave details of employees
class Leave_Balance(db.Model):
    __tablename__ = 'leave_balance'
    empid = db.Column(db.String(50), db.ForeignKey('employee_info.empid', ondelete='CASCADE'), primary_key=True)
    leave_id = db.Column(db.Integer, db.ForeignKey('leave_type.leave_id'), primary_key=True)
    balance = db.Column(db.Float, default=0.0)

    employee = db.relationship('Employee_Info', backref=db.backref('leave_balances', cascade='all, delete-orphan'))
    leave_type = db.relationship('LeaveType', backref=db.backref('leave_balances', cascade='all, delete-orphan'))

    def __repr__(self):
        return f'<LeaveBalance {self.empid} - {self.leave_type.leave_type}: {self.balance}>'

 
# Leave_Requests model for storing employee leave requests
class Leave_Request(db.Model):
    __tablename__ = 'leave_requests'
    id = db.Column(db.Integer, primary_key=True)
    empid = db.Column(db.String(50), db.ForeignKey('employee_info.empid'), nullable=False)
    leave_type = db.Column(db.String(50), nullable=False)  # Sick, Earned, Restricted, etc.
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
 
    applied_on = db.Column(db.DateTime, nullable=False)  # Changed from Date to DateTime to store time as well
    approved_on = db.Column(db.DateTime, nullable=True)    # New column to store approval/rejection datetime
 
    total_days = db.Column(db.Float, nullable=False)
    reason = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Pending')  # Pending, Approved, Rejected
    approver_id = db.Column(db.String(50), db.ForeignKey('employee_info.empid'), nullable=True)
    comments = db.Column(db.String(255), nullable=True)
 
    employee = db.relationship('Employee_Info', foreign_keys=[empid],
                               backref=db.backref('leave_requests', lazy=True))
    approver = db.relationship('Employee_Info', foreign_keys=[approver_id],
                               backref=db.backref('approved_requests', lazy=True))
 
    def __repr__(self):
        return (f'<LeaveRequest {self.id} - {self.empid} for {self.leave_type} '
                f'from {self.start_date} to {self.end_date}, Status: {self.status}>')
 
# Holidays model
class Holidays(db.Model):
    __tablename__ = 'holidays'
    id = db.Column(db.Integer, primary_key=True)
    start_date = db.Column(db.Date, nullable=False)  # Start of the holiday
    end_date = db.Column(db.Date, nullable=False)  # End of the holiday
    holiday_type = db.Column(db.String(100), nullable=False)
    dc = db.Column(db.String(100), nullable=True)  # Description or location-specific holiday code
    holiday_desc = db.Column(db.String(255), nullable=True)  # Additional description of the holiday
 
    def __repr__(self):
        return f'<Holiday {self.start_date} to {self.end_date} - {self.holiday_type}, Desc: {self.holiday_desc}>'
 
class Leave_Entries(db.Model):
    __tablename__ = 'leave_entries'
    id = db.Column(db.Integer, primary_key=True)
    leave_req_id = db.Column(db.Integer, db.ForeignKey('leave_requests.id', ondelete='CASCADE'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    is_half = db.Column(db.Boolean, default=False, nullable=False)
    half_type = db.Column(db.String(10), nullable=True)  # "First Half" or "Second Half"
 
    def __repr__(self):
        return f"<LeaveEntry {self.date} | Half: {self.is_half} ({self.half_type})>"
    

class JobRole(db.Model):
    __tablename__ = 'job_roles'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    dept_id = db.Column(db.Integer, db.ForeignKey('departments.id', ondelete='CASCADE'),nullable=False)
    job_role = db.Column(db.String(100), nullable=False)

    # Relationship
    department = db.relationship(
        'Department',
        backref=db.backref('job_roles', cascade='all, delete-orphan', lazy=True)
    )

    def __repr__(self):
        return f'<JobRole {self.job_role} (Dept ID: {self.dept_id})>'

 