from flask import (
    Flask,
    render_template,
    redirect,
    url_for,
    request,
    flash,
    session,
    jsonify,
    send_file,
    Response
)
from models import (
    db,
    Employee_Info,
    Employee_Project,
    Project_Info,
    Timesheet,
    TimesheetEntry,
    LeaveType,
    Leave_Balance,
    Leave_Request,
    Client_Info,
    Client_Employee,
    Holidays,
    Leave_Entries
)
from models import JobRole

from werkzeug.security import check_password_hash,generate_password_hash
from sqlalchemy import func
from config import Config
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
from sqlalchemy import and_, text, or_
from flask_migrate import Migrate
from datetime import datetime, timedelta, date
from dateutil.relativedelta import relativedelta
from sqlalchemy import func
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
import re
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
import io
from io import StringIO
from io import BytesIO
import csv
from flask import make_response
import pandas as pd 
from sqlalchemy.orm import aliased
from collections import defaultdict
from sqlalchemy import literal
import os
from models import db
import json
from sqlalchemy.orm import joinedload
from sqlalchemy import text
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from flask_cors import CORS
from flask import Flask
from flask import jsonify


db = SQLAlchemy() 

app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

from flask_cors import CORS

CORS(
    app,
    supports_credentials=True,
    resources={
        r"/admin/*": {
            "origins": "http://localhost:5173"
        }
    }
)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    return response


db_path = os.path.join(app.root_path, 'mydatabase.db') #this is for local
# db_path = '/home/nts_sqlite_db/mydatabase.db'          #this for server
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True  # True only if HTTPS
app.config["SESSION_COOKIE_HTTPONLY"] = True

from models import * 

db.init_app(app)
migrate = Migrate(app, db)

with app.app_context():
    db.create_all()
    print("✅ All tables created from models.py")
    
app.secret_key = "your_secret_key"

CORS(app, supports_credentials=True)  # Allow requests from React frontend

############## Authentication and Authorizarion-START###########
@app.route("/register", methods=["POST"])
def register():
    # Get JSON data from frontend
    data = request.get_json()

    empid = data.get("empid")
    fname = data.get("fname")
    lname = data.get("lname")
    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirm_password")
    dept_id = data.get("dept_id")
    approver_id = data.get("approver_id")

    # Check if passwords match
    if password != confirm_password:
        return jsonify({"error": "Passwords do not match. Please try again."}), 400

    # Check if the email already exists
    user = Employee_Info.query.filter_by(email=email).first()
    if user:
        return jsonify({"error": "Email already registered. Please log in."}), 400

    # Check if the empid already exists
    existing_emp = Employee_Info.query.filter_by(empid=empid).first()
    if existing_emp:
        return jsonify({"error": "Employee ID already exists. Please choose a different one."}), 400

    # Validate approver_id if provided
    if approver_id:
        approver = Employee_Info.query.filter_by(empid=approver_id).first()
        if not approver:
            return jsonify({"error": f"No employee found with empid {approver_id}. Please provide a valid approver ID."}), 400

    # Create a new user instance and hash the password
    new_user = Employee_Info(
        empid=empid,
        fname=fname,
        lname=lname,
        email=email,
        dept_id=dept_id,
        approver_id=approver_id if approver_id else None,
    )
    new_user.set_password(password)  # same password hashing method

    # Add the new user to the database
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "success"}), 201


# @app.route("/login", methods=["POST"])
# def login():
#     data = request.get_json()  # ✅ Receive JSON from React
#     email = data.get("email")
#     password = data.get("password")

#     if not email or not password:
#         return jsonify({"error": "Please enter both email and password"}), 400

#     user = Employee_Info.query.filter_by(email=email).first()

#     # if user and check_password_hash(user.password, password):
#     if user and (user.password == password or check_password_hash(user.password, password)):
#         # Store in session (optional)
#         session["user_id"] = user.empid
#         session["user_fname"] = user.fname
#         session["user_lname"] = user.lname
#         session["user_email"] = user.email

#         # Check role
#         # is_admin = 1 if user.empid == '1' else 0
#         is_admin = 1 if user.empid == 'N0482' else 0

#         # ✅ Return JSON response instead of redirect
#         return jsonify({
#             "message": "successful",
#             "user": {
#                 "empid": user.empid,
#                 "fname": user.fname,
#                 "lname": user.lname,
#                 "email": user.email,
#                 "is_admin": is_admin
#             }
#         }), 200
#     else:
#         return jsonify({"error": "Invalid credentials"}), 401
    
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Please enter both email and password"}), 400

    user = Employee_Info.query.filter_by(email=email).first()

    if user and (user.password == password or check_password_hash(user.password, password)):
        
        # Save session
        session["user_id"] = user.empid
        session["user_fname"] = user.fname
        session["user_lname"] = user.lname
        session["user_email"] = user.email
        session["role"] = user.role.lower()  # store role in session

        # --- ROLE HIERARCHY ---
        role = user.role.lower()

        is_admin = False
        is_manager = False
        is_approver = False
        is_employee = True   # everyone is at least employee

        if role == "admin":
            is_admin = True
            is_approver = True

        elif role == "manager":
            is_manager = True
            is_approver = True

        elif role == "approver":
            is_approver = True

        # employee stays as only employee

        # Return response
        return jsonify({
            "message": "successful",
            "user": {
                "empid": user.empid,
                "fname": user.fname,
                "lname": user.lname,
                "email": user.email,
                "role": role,
                "dept_id":user.dept_id,
                "permissions": {
                    "is_admin": is_admin,
                    "is_manager": is_manager,
                    "is_approver": is_approver,
                    "is_employee": is_employee,
                    
                }
            }
        }), 200

    return jsonify({"error": "Invalid credentials"}), 401

    

@app.route("/userclients", methods=["GET"])
def get_clients_for_user():
    user_id = session.get("user_id")
 
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401
 
    try:
        # Query all clients linked via Client_Employee
        clients = (
            db.session.query(Client_Info)
            .join(Client_Employee, Client_Employee.clientID == Client_Info.clientID)
            .filter(Client_Employee.empid == user_id)
            .distinct()
            .all()
        )
 
        result = [
            {
                "id": c.clientID,
                "client_name": c.client_name,
                "start_date": c.start_date.strftime("%Y-%m-%d") if c.start_date else None,
                "end_date": c.end_date.strftime("%Y-%m-%d") if c.end_date else None
            }
            for c in clients
        ]
 
        return jsonify(result), 200
 
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Server error"}), 500


@app.route("/userprojects", methods=["GET"])
def get_user_projects():
    user_id = session.get("user_id")
    client_id = request.args.get("clientID")
 
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401
 
    if not client_id:
        return jsonify({"error": "clientID required"}), 400
 
    # Convert to int if needed (due to earlier mismatch)
    try:
        client_id = int(client_id)
    except:
        return jsonify({"error": "Invalid clientID"}), 400
 
    try:
        projects = (
            db.session.query(Project_Info)
            .join(Employee_Project, Employee_Project.project_id == Project_Info.id)
            .filter(
                Employee_Project.empid == user_id,
                Project_Info.client_id == client_id
            )
            .all()
        )
 
        result = [
            {"id": p.id, "project_name": p.project_name}
            for p in projects
        ]
 
        return jsonify(result), 200
 
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Server error"}), 500


# @app.route("/logout")
# def logout():
#     session.clear()  # Clear session data
#     flash("You have been logged out.", "info")
#     return redirect(url_for("login"))  # Redirect to login instead of 'home'

@app.route("/logout")
def logout():
    session.clear()  # Clear session data
    return jsonify({"success": True, "message": "You have been logged out."}), 200


@app.route("/forgot_password", methods=["POST"])
def forgot_password():
    data = request.get_json()

    empid = data.get("empid")
    email = data.get("email")
    new_password = data.get("new_password")
    confirm_password = data.get("confirm_password")

    # Validate input
    if not empid or not email or not new_password or not confirm_password:
        return jsonify({"status": "error", "message": "All fields are required."}), 400

    if new_password != confirm_password:
        return jsonify({"status": "error", "message": "Passwords do not match."}), 400

    # Check if Employee ID and Email match an existing user
    user = Employee_Info.query.filter_by(empid=empid, email=email).first()

    if not user:
        return jsonify({"status": "error", "message": "Invalid Employee ID or Email."}), 400

    # Update password
    hashed_password = generate_password_hash(new_password)
    user.password = hashed_password
    db.session.commit()

    return jsonify({"status": "success", "message": "Password reset successful! You can now log in."}), 200


@app.route('/admin', methods=['GET'])
def admin_dashboard():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401
 
    if session['user_id'] != 'N0482':
        return jsonify({"error": "Access Denied"}), 403
 
    try:
        # Counts
        total_employees = Employee_Info.query.count()
        total_clients = Client_Info.query.count()
        total_projects = Project_Info.query.count()
 
        # Clients
        client_allocations = db.session.query(
            Client_Info.client_name,
            func.count(Client_Employee.empid).label("employee_count")
        ).join(Client_Employee, Client_Info.clientID == Client_Employee.clientID) \
         .group_by(Client_Info.client_name).all()
 
        client_data = [
            {"client_name": row.client_name, "employee_count": row.employee_count}
            for row in client_allocations
        ]
 
        # Departments
        dept_alloc = db.session.query(
            Department.dept_name,
            func.count(Employee_Info.empid).label("employee_count")
        ).join(Employee_Info, Employee_Info.dept_id == Department.id) \
         .group_by(Department.dept_name).all()
 
        dept_data = [
            {"dept_name": row.dept_name, "employee_count": row.employee_count}
            for row in dept_alloc
        ]
 
        # Billability
        bill = db.session.query(func.count()).filter(
            Project_Info.project_billability == "Billable").scalar()
 
        non_bill = db.session.query(func.count()).filter(
            Project_Info.project_billability == "Non-Billable").scalar()
 
        return jsonify({
            "stats": {
                "totalEmployees": total_employees,
                "totalClients": total_clients,
                "totalProjects": total_projects,
            },
            "clientAllocations": client_data,
            "departmentAllocations": dept_data,
            "billability": {
                "billable": bill,
                "nonBillable": non_bill
            }
        })
 
    except Exception as e:
        print("Admin error:", e)
        return jsonify({"error": "Server Error"}), 500
 
      
@app.route('/admin/export_client_allocations')
def export_client_allocations():
    if 'user_id' not in session:
        flash('Please login to continue', 'error')
        return redirect(url_for('login'))
    
    if session['user_id'] != 'N0482':
        # Not the admin user - redirect to unauthorized page or home
        flash('You do not have permission to access this feature', 'error')
        return redirect(url_for('login'))
    
    try:
        # Query to get client names and count of employees allocated to each client
        client_allocations = db.session.query(
            Client_Info.client_name,
            func.count(Client_Employee.empid).label('employee_count')
        ).join(
            Client_Employee, Client_Info.clientID == Client_Employee.clientID
        ).group_by(
            Client_Info.client_name
        ).all()
        
        # Create a string buffer for the CSV data
        si = StringIO()
        writer = csv.writer(si)
        
        # Write header row
        writer.writerow(['Full name of client', 'Resource count'])
        
        # Write data rows
        for client_name, employee_count in client_allocations:
            # Adjust display name for internal clients
            display_name = "Internal " if client_name.lower() == "internal" else client_name
            writer.writerow([display_name, employee_count])
        
        # Create response with CSV data
        output = make_response(si.getvalue())
        output.headers["Content-Disposition"] = "attachment; filename=client_allocations.csv"
        output.headers["Content-type"] = "text/csv"
        return output
        
    except Exception as e:
        print(f"Error exporting client allocations: {str(e)}")
        flash('Error exporting client allocations', 'error')
        return redirect(url_for('admin_dashboard'))

# @app.route('/admin/add_employee', methods=['GET', 'POST'])
# def add_employee():
#     if 'user_id' not in session:
#         flash('Please login to continue', 'error')
#         return redirect(url_for('login'))

#     clients = Client_Info.query.all()
#     departments = Department.query.all()# Fetch departments for dropdown
#     selected_leave_names = ["Sick leave", "Paid Time Off", "Restricted Holiday"]
#     leave_types = LeaveType.query.filter(LeaveType.leave_type.in_(selected_leave_names)).all()
#     print("Leave Types:", [lt.leave_type for lt in leave_types])


#     if request.method == 'POST':
#         try:
#             dept_id = request.form.get('dept_id')

#             # Add New Department
#             if dept_id == 'custom':
#                 custom_dept = request.form.get('custom_dept', '').strip()
#                 if not custom_dept:
#                     flash('New department name is required', 'error')
#                     return render_template('add_employee.html',
#                                         clients=clients,
#                                         departments=departments,
#                                         leave_types=leave_types,
#                                         today=datetime.now().strftime('%Y-%m-%d'))

#                 existing_dept = Department.query.filter_by(dept_name=custom_dept).first()
#                 if existing_dept:
#                     dept_id = existing_dept.id
#                 else:
#                     new_dept = Department(dept_name=custom_dept)
#                     db.session.add(new_dept)
#                     db.session.flush()
#                     dept_id = new_dept.id

#             # Edit Existing Department
#             elif dept_id == 'edit':
#                 edit_dept_id = request.form.get('edit_dept_id')
#                 new_dept_name = request.form.get('new_dept_name', '').strip()

#                 if not edit_dept_id or not new_dept_name:
#                     flash('Please select a department and provide a new name to edit', 'error')
#                     return render_template('add_employee.html',
#                                         clients=clients,
#                                         departments=departments,
#                                         leave_types=leave_types,
#                                         today=datetime.now().strftime('%Y-%m-%d'))

#                 existing = Department.query.filter_by(dept_name=new_dept_name).first()
#                 if existing:
#                     flash('A department with the new name already exists', 'error')
#                     return render_template('add_employee.html',
#                                         clients=clients,
#                                         departments=departments,
#                                         leave_types=leave_types,
#                                         today=datetime.now().strftime('%Y-%m-%d'))

#                 dept_to_edit = Department.query.get(edit_dept_id)
#                 if dept_to_edit:
#                     dept_to_edit.dept_name = new_dept_name
#                     db.session.flush()

#                 dept_id = edit_dept_id

#             required_fields = ['empid', 'fname', 'lname', 'email', 'designation',
#                                'mobile', 'gender', 'employee_type', 'location',
#                                'company', 'doj', 'approver_id', 'password']

#             has_error = False
#             for field in required_fields:
#                 if not request.form.get(field):
#                     flash(f'{field.replace("_", " ").title()} is required', 'error')
#                     has_error = True

#             email = request.form.get('email', '')
#             if email and not re.match(r"[^@]+@[^@]+\.[^@]+", email):
#                 flash('Invalid email format', 'error')
#                 has_error = True

#             mobile = request.form.get('mobile', '')
#             if mobile and not re.match(r"^\d{10}$", mobile):
#                 flash('Mobile number must be 10 digits', 'error')
#                 has_error = True

#             empid = request.form.get('empid', '')
#             if empid:
#                 existing_employee = Employee_Info.query.filter_by(empid=empid).first()
#                 if existing_employee:
#                     flash('Employee ID already exists', 'error')
#                     has_error = True

#             if email:
#                 existing_email = Employee_Info.query.filter_by(email=email).first()
#                 if existing_email:
#                     flash('Email already registered', 'error')
#                     has_error = True

#             doj, lwd = None, None
#             if request.form.get('doj'):
#                 try:
#                     doj = datetime.strptime(request.form['doj'], '%Y-%m-%d').date()
#                 except ValueError:
#                     flash('Invalid date format for Date of Joining', 'error')
#                     has_error = True

#             if request.form.get('lwd'):
#                 try:
#                     lwd = datetime.strptime(request.form['lwd'], '%Y-%m-%d').date()
#                     if doj and lwd <= doj:
#                         flash('Last working day must be after date of joining', 'error')
#                         has_error = True
#                 except ValueError:
#                     flash('Invalid date format for Last Working Day', 'error')
#                     has_error = True

#             selected_clients = request.form.getlist('clients')
#             for client_id in selected_clients:
#                 start_date = request.form.get(f'start_date_{client_id}')
#                 end_date = request.form.get(f'end_date_{client_id}')

#                 if not start_date:
#                     flash('Start date is required for selected clients', 'error')
#                     has_error = True
#                     continue

#                 try:
#                     start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
#                     if doj and start_date_obj < doj:
#                         flash('Client start date cannot be before date of joining', 'error')
#                         has_error = True
#                 except ValueError:
#                     flash(f'Invalid start date format for client {client_id}', 'error')
#                     has_error = True

#                 if end_date:
#                     try:
#                         end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
#                         if end_date_obj <= start_date_obj:
#                             flash('Client end date must be after start date', 'error')
#                             has_error = True
#                     except ValueError:
#                         flash(f'Invalid end date format for client {client_id}', 'error')
#                         has_error = True

#             if has_error:
#                 return render_template('add_employee.html',
#                                        clients=clients,
#                                        departments=departments,
#                                        leave_types=leave_types,
#                                        today=datetime.now().strftime('%Y-%m-%d'))

#             new_employee = Employee_Info(
#                 empid=request.form['empid'].upper(),
#                 fname=request.form['fname'].strip(),
#                 lname=request.form['lname'].strip(),
#                 email=email.lower(),
#                 dept_id=dept_id,  # Now using dept_id FK
#                 designation=request.form['designation'].strip(),
#                 mobile=mobile,
#                 gender=request.form['gender'],
#                 employee_type=request.form['employee_type'],
#                 location=request.form['location'],
#                 company=request.form['company'],
#                 work_location=request.form.get('work_location', '').strip(),
#                 payroll=request.form['company'],
#                 country=request.form['company'],
#                 city=request.form.get('city', '').strip(),
#                 core_skill=request.form.get('core_skill', '').strip(),
#                 skill_details=request.form.get('skill_details', '').strip(),
#                 doj=doj,
#                 lwd=lwd,
#                 approver_id=request.form['approver_id'].upper(),
#                 password=generate_password_hash(request.form['password']),
#                 prev_total_exp=float(request.form.get('prev_total_exp')) if request.form.get('prev_total_exp') else None
#             )

#             db.session.add(new_employee)
#             db.session.flush()
            
#             try:
#                 leave_balances = {
#                     int(key.split("[")[1].rstrip("]")): float(value) if value else 0.0
#                     for key, value in request.form.items()
#                     if key.startswith("leave_balances[")
#                 }

#                 for leave_id, balance in leave_balances.items():
#                     leave_entry = Leave_Balance(
#                         empid=new_employee.empid,
#                         leave_id=leave_id,
#                         balance=balance
#                     )
#                     db.session.add(leave_entry)

#                 db.session.commit()

#             except Exception as e:
#                 db.session.rollback()
#                 flash(f'Error saving leave balances: {str(e)}', 'error')
#                 return render_template(
#                     'add_employee.html',
#                     clients=clients,
#                     departments=departments,
#                     leave_types=leave_types,
#                     today=datetime.now().strftime('%Y-%m-%d')
#                 )

#             for client_id in selected_clients:
#                 start_date = request.form.get(f'start_date_{client_id}')
#                 end_date = request.form.get(f'end_date_{client_id}')

#                 start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
#                 end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date() if end_date else None

#                 client_employee_entry = Client_Employee(
#                     empid=new_employee.empid,
#                     clientID=client_id,
#                     start_date=start_date_obj,
#                     end_date=end_date_obj
#                 )
#                 db.session.add(client_employee_entry)

#             db.session.commit()
#             flash('Employee added successfully!', 'success')
#             return redirect(url_for('admin_dashboard'))

#         except IntegrityError:
#             db.session.rollback()
#             flash('Database error: Duplicate entry or invalid data', 'error')
#         except ValueError as e:
#             db.session.rollback()
#             flash(f'Invalid data format: {str(e)}', 'error')
#         except Exception as e:
#             db.session.rollback()
#             flash(f'Unexpected error: {str(e)}', 'error')

#     return render_template('add_employee.html', 
#                            clients=clients,
#                            departments=departments,
#                            leave_types=leave_types,
#                            today=datetime.now().strftime('%Y-%m-%d'))

# @app.route("/api/departments", methods=["GET"])
# def api_get_departments():
#     depts = Department.query.order_by(Department.dept_name).all()
#     return jsonify([
#         {"id": d.id, "dept_name": d.dept_name}
#         for d in depts
#     ])

# ✅ LIST EMPLOYEES
@app.route('/api/employees', methods=['GET'])
def list_employees():
    dept = request.args.get("dept", "")
    approver_id = request.args.get("approver_id", "")
    start_date = request.args.get("start_date", "")
    end_date = request.args.get("end_date", "")

    query = Employee_Info.query.options(joinedload(Employee_Info.department))

    if dept:
        query = query.filter(Employee_Info.dept_id == int(dept))

    if approver_id:
        query = query.filter(Employee_Info.approver_id == approver_id)

    if start_date and end_date:
        try:
            s = datetime.strptime(start_date, "%Y-%m-%d").date()
            e = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Employee_Info.doj.between(s, e))
        except:
            pass

    employees = query.all()

    def serialize(emp):
        return {
            "empid": emp.empid,
            "fname": emp.fname,
            "lname": emp.lname,
            "designation": emp.designation,
            "email": emp.email,
            "mobile": emp.mobile,
            "gender": emp.gender,
            "approver_id": emp.approver_id,
            "doj": emp.doj.strftime("%Y-%m-%d") if emp.doj else None,
            "lwd": emp.lwd.strftime("%Y-%m-%d") if emp.lwd else None,
            "department": {
                "id": emp.department.id,
                "dept_name": emp.department.dept_name
            } if emp.department else None
        }

    return jsonify({"employees": [serialize(e) for e in employees]}), 200




# @app.route('/api/employees/form-data', methods=['GET'])
# def get_employee_form_data():
#     clients = Client_Info.query.all()
#     departments = Department.query.all()
#     leave_types = LeaveType.query.all()
 
#     return jsonify({
#         "clients": [
#             {"clientID": c.clientID, "client_name": c.client_name}
#             for c in clients
#         ],
#         "departments": [
#             {"id": d.id, "dept_name": d.dept_name}
#             for d in departments
#         ],
#         "leave_types": [
#             {"leave_id": l.leave_id, "leave_type": l.leave_type}
#             for l in leave_types
#         ]
#     }), 200





# @app.route('/admin/add_employee', methods=['POST'])
# def add_employee():
#     data = request.json

#     try:
#         # ---------------------
#         # Validate required fields
#         # ---------------------
#         required_fields = [
#             "empid", "fname", "lname", "email", "designation",
#             "mobile", "gender", "employee_type", "location",
#             "company", "doj", "approver_id", "password"
#         ]

#         for field in required_fields:
#             if not data.get(field):
#                 return jsonify({"status": "error", "message": f"{field} is required"}), 400

#         # Email validation
#         if not re.match(r"[^@]+@[^@]+\.[^@]+", data["email"]):
#             return jsonify({"status": "error", "message": "Invalid email format"}), 400

#         # Mobile validation
#         if not re.match(r"^\d{10}$", data["mobile"]):
#             return jsonify({"status": "error", "message": "Mobile number must be 10 digits"}), 400

#         # Duplicate employee
#         if Employee_Info.query.filter_by(empid=data["empid"]).first():
#             return jsonify({"status": "error", "message": "Employee ID already exists"}), 400

#         if Employee_Info.query.filter_by(email=data["email"]).first():
#             return jsonify({"status": "error", "message": "Email already exists"}), 400

#         # ---------------------
#         # Department Logic
#         # ---------------------
#         dept_id = data.get("dept_id")

#         if dept_id == "custom":
#             custom_name = data.get("custom_dept", "").strip()
#             if not custom_name:
#                 return jsonify({"status": "error", "message": "New department name required"}), 400

#             existing = Department.query.filter_by(dept_name=custom_name).first()
#             if existing:
#                 dept_id = existing.id
#             else:
#                 new_dept = Department(dept_name=custom_name)
#                 db.session.add(new_dept)
#                 db.session.flush()
#                 dept_id = new_dept.id

#         elif dept_id == "edit":
#             edit_dept_id = data.get("edit_dept_id")
#             new_dept_name = data.get("new_dept_name", "").strip()

#             if not edit_dept_id or not new_dept_name:
#                 return jsonify({"status": "error", "message": "Department edit details missing"}), 400

#             existing = Department.query.filter_by(dept_name=new_dept_name).first()
#             if existing:
#                 return jsonify({"status": "error", "message": "Department name already exists"}), 400

#             dept_obj = Department.query.get(edit_dept_id)
#             dept_obj.dept_name = new_dept_name
#             dept_id = edit_dept_id

#         # ---------------------
#         # Dates
#         # ---------------------
#         doj = datetime.strptime(data["doj"], "%Y-%m-%d").date()
#         lwd = None

#         if data.get("lwd"):
#             lwd = datetime.strptime(data["lwd"], "%Y-%m-%d").date()
#             if lwd <= doj:
#                 return jsonify({"status": "error", "message": "Last working day must be later than DOJ"}), 400

#         # ---------------------
#         # Fix prev_total_exp (IMPORTANT)
#         # "" → None, "0", "1.5", etc. → float
#         # ---------------------
#         prev_exp = data.get("prev_total_exp")

#         try:
#             prev_exp = float(prev_exp) if prev_exp not in (None, "", " ") else None
#         except:
#             prev_exp = None  # fallback

#         # ---------------------
#         # Create Employee
#         # ---------------------
#         new_emp = Employee_Info(
#             empid=data["empid"].upper(),
#             fname=data["fname"],
#             lname=data["lname"],
#             email=data["email"].lower(),
#             dept_id=dept_id,
#             designation=data["designation"],
#             mobile=data["mobile"],
#             gender=data["gender"],
#             employee_type=data["employee_type"],
#             location=data["location"],
#             company=data["company"],
#             work_location=data.get("work_location", ""),
#             city=data.get("city", ""),
#             core_skill=data.get("core_skill", ""),
#             skill_details=data.get("skill_details", ""),
#             doj=doj,
#             lwd=lwd,
#             approver_id=data["approver_id"].upper(),
#             password=generate_password_hash(data["password"]),
#             prev_total_exp=prev_exp
#         )

#         db.session.add(new_emp)
#         db.session.flush()

#         # ---------------------
#         # Leave Balances
#         # ---------------------
#         leave_balances = data.get("leave_balances", {})

#         for leave_id, balance in leave_balances.items():
#             try:
#                 bal = float(balance) if balance not in ("", None) else 0.0
#             except:
#                 bal = 0.0

#             db.session.add(Leave_Balance(
#                 empid=new_emp.empid,
#                 leave_id=int(leave_id),
#                 balance=bal
#             ))

#         # ---------------------
#         # Client Assignments
#         # ---------------------
#         client_assignments = data.get("client_assignments", {})

#         for client_id, entry in client_assignments.items():
#             start = entry.get("start_date")
#             end = entry.get("end_date")

#             if not start:
#                 return jsonify({"status": "error", "message": "Client start date required"}), 400

#             sd = datetime.strptime(start, "%Y-%m-%d").date()

#             if end:
#                 ed = datetime.strptime(end, "%Y-%m-%d").date()
#                 if ed <= sd:
#                     return jsonify({"status": "error", "message": "Client end date must be after start date"}), 400
#             else:
#                 ed = None

#             db.session.add(Client_Employee(
#                 empid=new_emp.empid,
#                 clientID=int(client_id),
#                 start_date=sd,
#                 end_date=ed
#             ))

#         db.session.commit()

#         return jsonify({"status": "success", "message": "Employee Added Successfully!"}), 200

#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"status": "error", "message": str(e)}), 500

 
# @app.route('/admin/employees', methods=['GET'])
# @app.route('/admin/employees/view', methods=['GET'])
# def view_employees():
#     if 'user_id' not in session:
#         flash('Please login to continue', 'error')
#         return redirect(url_for('login'))

#     # If viewing a specific employee
#     if 'view_empid' in session:
#         empid = session['view_empid']
#         employee = Employee_Info.query.filter_by(empid=empid.upper()).first_or_404()
#         client_assignments = Client_Employee.query.filter_by(empid=empid.upper()).all()

#         client_details = []
#         for assignment in client_assignments:
#             client = Client_Info.query.filter_by(clientID=assignment.clientID).first()
#             if client:
#                 client_details.append({
#                     'client': client,
#                     'assignment': assignment
#                 })

#         session.pop('view_empid', None)

#         return render_template('view_employee.html',
#                                employee=employee,
#                                client_details=client_details)

#     # Get filter values from request
#     department_id = request.args.get('dept', '')  # dept is dept_id
#     approver_id = request.args.get('approver_id', '')
#     start_date = request.args.get('start_date', '')
#     end_date = request.args.get('end_date', '')

#     # Base query
#     query = Employee_Info.query.options(joinedload(Employee_Info.department))


#     # Filter by dept_id
#     if department_id:
#         query = query.filter(Employee_Info.dept_id == int(department_id))

#     # Filter by approver_id
#     if approver_id:
#         query = query.filter(Employee_Info.approver_id == approver_id)

#     # Filter by date range (doj)
#     if start_date and end_date:
#         try:
#             start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
#             end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
#             query = query.filter(Employee_Info.doj.between(start_date_obj, end_date_obj))
#         except ValueError:
#             flash('Invalid date format. Please use YYYY-MM-DD.', 'error')

#     employees = query.all()

#     # Get list of all departments (id + name)
#     departments = Department.query.order_by(Department.dept_name).all()

#     # Get list of distinct approver IDs
#     approvers = db.session.query(Employee_Info.approver_id).filter(
#         Employee_Info.approver_id.isnot(None)
#     ).distinct().all()

#     current_date = datetime.now().date()

#     return render_template('employee_list.html',
#                            employees=employees,
#                            current_date=current_date,
#                            departments=departments,
#                            approvers=approvers,
#                            selected_department=department_id,
#                            selected_approver=approver_id,
#                            start_date=start_date,
#                            end_date=end_date)

    
# @app.route('/api/employees/form-data', methods=['GET'])
# def employee_form_data():
#     try:
#         # Load clients
#         clients = Client.query.all()
#         clients_data = [
#             {"clientID": c.clientID, "client_name": c.client_name}
#             for c in clients
#         ]

#         # Load departments
#         departments = Department.query.all()
#         departments_data = [
#             {"id": d.id, "dept_name": d.dept_name}
#             for d in departments
#         ]

#         # Load leave types
#         leave_types = LeaveType.query.all()
#         leave_types_data = [
#             {"leave_id": lt.leave_id, "leave_type": lt.leave_type}
#             for lt in leave_types
#         ]

#         return jsonify({
#             "clients": clients_data,
#             "departments": departments_data,
#             "leave_types": leave_types_data
#         }), 200

#     except Exception as e:
#         return jsonify({"message": "Failed to load form data", "error": str(e)}), 500




# ===================================



# 🚀 1. FETCH FORM DATA (clients, departments, leave types)
# -------------------------------------------
@app.route('/api/employees/form-data', methods=['GET'])
def get_employee_form_data():
    clients = Client_Info.query.all()
    departments = Department.query.all()
    leave_types = LeaveType.query.all()

    return jsonify({
        "clients": [
            {"clientID": c.clientID, "client_name": c.client_name}
            for c in clients
        ],
        "departments": [
            {"id": d.id, "dept_name": d.dept_name}
            for d in departments
        ],
        "leave_types": [
            {"leave_id": l.leave_id, "leave_type": l.leave_type}
            for l in leave_types
        ]
    }), 200


# -------------------------------------------
# 🚀 2. ADD EMPLOYEE (FULL)
# -------------------------------------------
# @app.route('/admin/add_employee', methods=['POST'])
# def add_employee():
#     data = request.json

#     try:
#         # ---------------------
#         # Validate required fields
#         # ---------------------
#         required_fields = [
#             "empid", "fname", "lname", "email", "designation",
#             "mobile", "gender", "employee_type", "location",
#             "company", "doj", "approver_id", "password"
#         ]

#         for field in required_fields:
#             if not data.get(field):
#                 return jsonify({"status": "error", "message": f"{field} is required"}), 400

#         # Email validation
#         if not re.match(r"[^@]+@[^@]+\.[^@]+", data["email"]):
#             return jsonify({"status": "error", "message": "Invalid email format"}), 400

#         # Mobile validation
#         if not re.match(r"^\d{10}$", data["mobile"]):
#             return jsonify({"status": "error", "message": "Mobile number must be 10 digits"}), 400

#         # Duplicate employee
#         if Employee_Info.query.filter_by(empid=data["empid"]).first():
#             return jsonify({"status": "error", "message": "Employee ID already exists"}), 400

#         if Employee_Info.query.filter_by(email=data["email"]).first():
#             return jsonify({"status": "error", "message": "Email already exists"}), 400

#         # ---------------------
#         # Department Logic
#         # ---------------------
#         dept_id = data.get("dept_id")

#         if dept_id == "custom":
#             custom_name = data.get("custom_dept", "").strip()
#             if not custom_name:
#                 return jsonify({"status": "error", "message": "New department name required"}), 400

#             existing = Department.query.filter_by(dept_name=custom_name).first()
#             if existing:
#                 dept_id = existing.id
#             else:
#                 new_dept = Department(dept_name=custom_name)
#                 db.session.add(new_dept)
#                 db.session.flush()
#                 dept_id = new_dept.id

#         elif dept_id == "edit":
#             edit_dept_id = data.get("edit_dept_id")
#             new_dept_name = data.get("new_dept_name", "").strip()

#             if not edit_dept_id or not new_dept_name:
#                 return jsonify({"status": "error", "message": "Department edit details missing"}), 400

#             existing = Department.query.filter_by(dept_name=new_dept_name).first()
#             if existing:
#                 return jsonify({"status": "error", "message": "Department name already exists"}), 400

#             dept_obj = Department.query.get(edit_dept_id)
#             dept_obj.dept_name = new_dept_name
#             dept_id = edit_dept_id

#         # ---------------------
#         # Dates
#         # ---------------------
#         doj = datetime.strptime(data["doj"], "%Y-%m-%d").date()
#         lwd = None

#         if data.get("lwd"):
#             lwd = datetime.strptime(data["lwd"], "%Y-%m-%d").date()
#             if lwd <= doj:
#                 return jsonify({"status": "error", "message": "Last working day must be later than DOJ"}), 400

#         # ---------------------
#         # Fix prev_total_exp (IMPORTANT)
#         # "" → None, "0", "1.5", etc. → float
#         # ---------------------
#         prev_exp = data.get("prev_total_exp")

#         try:
#             prev_exp = float(prev_exp) if prev_exp not in (None, "", " ") else None
#         except:
#             prev_exp = None  # fallback

#         # ---------------------
#         # Create Employee
#         # ---------------------
#         new_emp = Employee_Info(
#             empid=data["empid"].upper(),
#             fname=data["fname"],
#             lname=data["lname"],
#             email=data["email"].lower(),
#             dept_id=dept_id,
#             designation=data["designation"],
#             mobile=data["mobile"],
#             gender=data["gender"],
#             employee_type=data["employee_type"],
#             location=data["location"],
#             company=data["company"],
#             work_location=data.get("work_location", ""),
#             city=data.get("city", ""),
#             core_skill=data.get("core_skill", ""),
#             skill_details=data.get("skill_details", ""),
#             doj=doj,
#             lwd=lwd,
#             approver_id=data["approver_id"].upper(),
#             password=generate_password_hash(data["password"]),
#             prev_total_exp=prev_exp
#         )

#         db.session.add(new_emp)
#         db.session.flush()

#         # ---------------------
#         # Leave Balances
#         # ---------------------
#         leave_balances = data.get("leave_balances", {})

#         for leave_id, balance in leave_balances.items():
#             try:
#                 bal = float(balance) if balance not in ("", None) else 0.0
#             except:
#                 bal = 0.0

#             db.session.add(Leave_Balance(
#                 empid=new_emp.empid,
#                 leave_id=int(leave_id),
#                 balance=bal
#             ))

#         # ---------------------
#         # Client Assignments
#         # ---------------------
#         client_assignments = data.get("client_assignments", {})

#         for client_id, entry in client_assignments.items():
#             start = entry.get("start_date")
#             end = entry.get("end_date")

#             if not start:
#                 return jsonify({"status": "error", "message": "Client start date required"}), 400

#             sd = datetime.strptime(start, "%Y-%m-%d").date()

#             if end:
#                 ed = datetime.strptime(end, "%Y-%m-%d").date()
#                 if ed <= sd:
#                     return jsonify({"status": "error", "message": "Client end date must be after start date"}), 400
#             else:
#                 ed = None

#             db.session.add(Client_Employee(
#                 empid=new_emp.empid,
#                 clientID=int(client_id),
#                 start_date=sd,
#                 end_date=ed
#             ))

#         db.session.commit()

#         return jsonify({"status": "success", "message": "Employee Added Successfully!"}), 200

#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"status": "error", "message": str(e)}), 500



# @app.route('/admin/add_employee', methods=['POST'])
# def add_employee():
#     data = request.json

#     try:
#         # ---------------------
#         # Validate required fields
#         # ---------------------
#         required_fields = [
#             "empid", "fname", "lname", "email", "designation",
#             "mobile", "gender", "employee_type", "location",
#             "company", "doj", "approver_id", "password"
#         ]

#         for field in required_fields:
#             if not data.get(field):
#                 return jsonify({"status": "error", "message": f"{field} is required"}), 400

#         # Email validation
#         if not re.match(r"[^@]+@[^@]+\.[^@]+", data["email"]):
#             return jsonify({"status": "error", "message": "Invalid email format"}), 400

#         # Mobile validation
#         if not re.match(r"^\d{10}$", data["mobile"]):
#             return jsonify({"status": "error", "message": "Mobile number must be 10 digits"}), 400

#         # Duplicate employee
#         if Employee_Info.query.filter_by(empid=data["empid"]).first():
#             return jsonify({"status": "error", "message": "Employee ID already exists"}), 400

#         if Employee_Info.query.filter_by(email=data["email"]).first():
#             return jsonify({"status": "error", "message": "Email already exists"}), 400

#         # ---------------------
#         # Department Logic
#         # ---------------------
#         dept_id = data.get("dept_id")

#         if dept_id == "custom":
#             custom_name = data.get("custom_dept", "").strip()
#             if not custom_name:
#                 return jsonify({"status": "error", "message": "New department name required"}), 400

#             existing = Department.query.filter_by(dept_name=custom_name).first()
#             if existing:
#                 dept_id = existing.id
#             else:
#                 new_dept = Department(dept_name=custom_name)
#                 db.session.add(new_dept)
#                 db.session.flush()
#                 dept_id = new_dept.id

#         elif dept_id == "edit":
#             edit_dept_id = data.get("edit_dept_id")
#             new_dept_name = data.get("new_dept_name", "").strip()

#             if not edit_dept_id or not new_dept_name:
#                 return jsonify({"status": "error", "message": "Department edit details missing"}), 400

#             existing = Department.query.filter_by(dept_name=new_dept_name).first()
#             if existing:
#                 return jsonify({"status": "error", "message": "Department name already exists"}), 400

#             dept_obj = Department.query.get(edit_dept_id)
#             dept_obj.dept_name = new_dept_name
#             dept_id = edit_dept_id

#         # ---------------------
#         # Dates
#         # ---------------------
#         doj = datetime.strptime(data["doj"], "%Y-%m-%d").date()
#         lwd = None

#         if data.get("lwd"):
#             lwd = datetime.strptime(data["lwd"], "%Y-%m-%d").date()
#             if lwd <= doj:
#                 return jsonify({"status": "error", "message": "Last working day must be later than DOJ"}), 400

#         # ---------------------
#         # prev_total_exp fix
#         # ---------------------
#         prev_exp = data.get("prev_total_exp")
#         try:
#             prev_exp = float(prev_exp) if prev_exp not in (None, "", " ") else None
#         except:
#             prev_exp = None

#         # ---------------------
#         # Secondary Approver (optional)
#         # ---------------------
#         secondary_approver = data.get("secondary_approver_id")
#         if secondary_approver:
#             secondary_approver = secondary_approver.upper()
#         else:
#             secondary_approver = None  # stored as NULL

#         # ---------------------
#         # Create Employee
#         # ---------------------
#         new_emp = Employee_Info(
#             empid=data["empid"].upper(),
#             fname=data["fname"],
#             lname=data["lname"],
#             email=data["email"].lower(),
#             dept_id=dept_id,
#             designation=data["designation"],
#             mobile=data["mobile"],
#             gender=data["gender"],
#             employee_type=data["employee_type"],
#             location=data["location"],
#             company=data["company"],
#             work_location=data.get("work_location", ""),
#             city=data.get("city", ""),
#             core_skill=data.get("core_skill", ""),
#             skill_details=data.get("skill_details", ""),
#             doj=doj,
#             lwd=lwd,

#             approver_id=data["approver_id"].upper(),
#             secondary_approver_id=secondary_approver,  # <-- NEW FIELD HERE

#             password=generate_password_hash(data["password"]),
#             prev_total_exp=prev_exp
#         )

#         db.session.add(new_emp)
#         db.session.flush()

#         # ---------------------
#         # Leave Balances
#         # ---------------------
#         leave_balances = data.get("leave_balances", {})

#         for leave_id, balance in leave_balances.items():
#             try:
#                 bal = float(balance) if balance not in ("", None) else 0.0
#             except:
#                 bal = 0.0

#             db.session.add(Leave_Balance(
#                 empid=new_emp.empid,
#                 leave_id=int(leave_id),
#                 balance=bal
#             ))

#         # ---------------------
#         # Client Assignments
#         # ---------------------
#         client_assignments = data.get("client_assignments", {})

#         for client_id, entry in client_assignments.items():
#             start = entry.get("start_date")
#             end = entry.get("end_date")

#             if not start:
#                 return jsonify({"status": "error", "message": "Client start date required"}), 400

#             sd = datetime.strptime(start, "%Y-%m-%d").date()

#             if end:
#                 ed = datetime.strptime(end, "%Y-%m-%d").date()
#                 if ed <= sd:
#                     return jsonify({"status": "error", "message": "Client end date must be after start date"}), 400
#             else:
#                 ed = None

#             db.session.add(Client_Employee(
#                 empid=new_emp.empid,
#                 clientID=int(client_id),
#                 start_date=sd,
#                 end_date=ed
#             ))

#         db.session.commit()

#         return jsonify({"status": "success", "message": "Employee Added Successfully!"}), 200

#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/admin/add_employee', methods=['POST'])
def add_employee():
    data = request.json

    try:
        # ---------------------
        # Validate required fields
        # ---------------------
        required_fields = [
            "empid", "fname", "lname", "email", "designation",
            "mobile", "gender", "employee_type", "location",
            "company", "doj", "approver_id", "password",
            "job_role_id"   # ✅ NEW REQUIRED FIELD
        ]

        for field in required_fields:
            if not data.get(field):
                return jsonify({"status": "error", "message": f"{field} is required"}), 400

        # ---------------------
        # Email & Mobile validation
        # ---------------------
        if not re.match(r"[^@]+@[^@]+\.[^@]+", data["email"]):
            return jsonify({"status": "error", "message": "Invalid email format"}), 400

        if not re.match(r"^\d{10}$", data["mobile"]):
            return jsonify({"status": "error", "message": "Mobile number must be 10 digits"}), 400

        # ---------------------
        # Duplicate employee checks
        # ---------------------
        if Employee_Info.query.filter_by(empid=data["empid"].upper()).first():
            return jsonify({"status": "error", "message": "Employee ID already exists"}), 400

        if Employee_Info.query.filter_by(email=data["email"].lower()).first():
            return jsonify({"status": "error", "message": "Email already exists"}), 400

        # ---------------------
        # Department Logic (UNCHANGED)
        # ---------------------
        dept_id = data.get("dept_id")

        if dept_id == "custom":
            custom_name = data.get("custom_dept", "").strip()
            if not custom_name:
                return jsonify({"status": "error", "message": "New department name required"}), 400

            existing = Department.query.filter_by(dept_name=custom_name).first()
            if existing:
                dept_id = existing.id
            else:
                new_dept = Department(dept_name=custom_name)
                db.session.add(new_dept)
                db.session.flush()
                dept_id = new_dept.id

        elif dept_id == "edit":
            edit_dept_id = data.get("edit_dept_id")
            new_dept_name = data.get("new_dept_name", "").strip()

            if not edit_dept_id or not new_dept_name:
                return jsonify({"status": "error", "message": "Department edit details missing"}), 400

            if Department.query.filter_by(dept_name=new_dept_name).first():
                return jsonify({"status": "error", "message": "Department name already exists"}), 400

            dept_obj = Department.query.get(edit_dept_id)
            dept_obj.dept_name = new_dept_name
            dept_id = edit_dept_id

        # ---------------------
        # ✅ JOB ROLE LOGIC (NEW)
        # ---------------------
        job_role_id = data.get("job_role_id")

        if job_role_id == "custom":
            role_name = data.get("custom_job_role", "").strip()

            if not role_name:
                return jsonify({"status": "error", "message": "New job role name required"}), 400

            # prevent duplicate role in same department
            existing_role = JobRole.query.filter_by(
                dept_id=dept_id,
                job_role=role_name
            ).first()

            if existing_role:
                job_role_id = existing_role.id
            else:
                new_role = JobRole(
                    dept_id=dept_id,
                    job_role=role_name
                )
                db.session.add(new_role)
                db.session.flush()
                job_role_id = new_role.id
        else:
            job_role_id = int(job_role_id)

        # ---------------------
        # Dates
        # ---------------------
        doj = datetime.strptime(data["doj"], "%Y-%m-%d").date()
        lwd = None

        if data.get("lwd"):
            lwd = datetime.strptime(data["lwd"], "%Y-%m-%d").date()
            if lwd <= doj:
                return jsonify({"status": "error", "message": "Last working day must be later than DOJ"}), 400

        # ---------------------
        # Previous Experience
        # ---------------------
        prev_exp = data.get("prev_total_exp")
        try:
            prev_exp = float(prev_exp) if prev_exp not in (None, "", " ") else None
        except:
            prev_exp = None

        # ---------------------
        # Secondary Approver
        # ---------------------
        secondary_approver = data.get("secondary_approver_id")
        secondary_approver = secondary_approver.upper() if secondary_approver else None

        # ---------------------
        # Create Employee
        # ---------------------
        new_emp = Employee_Info(
            empid=data["empid"].upper(),
            fname=data["fname"],
            lname=data["lname"],
            email=data["email"].lower(),
            dept_id=dept_id,
            job_role_id=job_role_id,   # ✅ ASSIGNED HERE
            designation=data["designation"],
            mobile=data["mobile"],
            gender=data["gender"],
            employee_type=data["employee_type"],
            location=data["location"],
            company=data["company"],
            work_location=data.get("work_location", ""),
            city=data.get("city", ""),
            core_skill=data.get("core_skill", ""),
            skill_details=data.get("skill_details", ""),
            doj=doj,
            lwd=lwd,
            approver_id=data["approver_id"].upper(),
            secondary_approver_id=secondary_approver,
            password=generate_password_hash(data["password"]),
            prev_total_exp=prev_exp
        )

        db.session.add(new_emp)
        db.session.flush()

        # ---------------------
        # Leave Balances (UNCHANGED)
        # ---------------------
        for leave_id, balance in data.get("leave_balances", {}).items():
            bal = float(balance) if balance not in ("", None) else 0.0
            db.session.add(Leave_Balance(
                empid=new_emp.empid,
                leave_id=int(leave_id),
                balance=bal
            ))

        # ---------------------
        # Client Assignments (UNCHANGED)
        # ---------------------
        for client_id, entry in data.get("client_assignments", {}).items():
            sd = datetime.strptime(entry["start_date"], "%Y-%m-%d").date()
            ed = datetime.strptime(entry["end_date"], "%Y-%m-%d").date() if entry.get("end_date") else None

            if ed and ed <= sd:
                return jsonify({"status": "error", "message": "Client end date must be after start date"}), 400

            db.session.add(Client_Employee(
                empid=new_emp.empid,
                clientID=int(client_id),
                start_date=sd,
                end_date=ed
            ))

        db.session.commit()
        return jsonify({"status": "success", "message": "Employee Added Successfully!"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route('/admin/job-roles/<int:dept_id>', methods=['GET'])
def get_job_roles_by_department(dept_id):
    try:
        roles = JobRole.query.filter_by(dept_id=dept_id).order_by(JobRole.job_role).all()

        return jsonify({
            "status": "success",
            "roles": [
                {
                    "id": role.id,
                    "job_role": role.job_role
                }
                for role in roles
            ]
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/admin/job-roles', methods=['POST'])
def create_job_role():
    data = request.json

    try:
        dept_id = data.get("dept_id")
        job_role_name = data.get("job_role", "").strip()

        if not dept_id or not job_role_name:
            return jsonify({
                "status": "error",
                "message": "Department ID and job role are required"
            }), 400

        # Check duplicate role in same department
        existing = JobRole.query.filter_by(
            dept_id=dept_id,
            job_role=job_role_name
        ).first()

        if existing:
            return jsonify({
                "status": "success",
                "role_id": existing.id,
                "job_role": existing.job_role,
                "message": "Job role already exists"
            }), 200

        new_role = JobRole(
            dept_id=dept_id,
            job_role=job_role_name
        )

        db.session.add(new_role)
        db.session.commit()

        return jsonify({
            "status": "success",
            "role_id": new_role.id,
            "job_role": new_role.job_role,
            "message": "Job role created successfully"
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route("/api/departments", methods=["GET"])
def api_get_departments():
    depts = Department.query.order_by(Department.dept_name).all()
    return jsonify([
        {"id": d.id, "dept_name": d.dept_name}
        for d in depts
    ])


# ===========================================



@app.route("/api/employees/export", methods=["GET"])
def export_employees():
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    # Filters
    department_name = request.args.get("dept", "")
    approver_id = request.args.get("approver_id", "")
    start_date = request.args.get("start_date", "")
    end_date = request.args.get("end_date", "")

    query = Employee_Info.query.outerjoin(
        Department, Employee_Info.dept_id == Department.id
    )

    if department_name:
        query = query.filter(Department.dept_name == department_name)

    if approver_id:
        query = query.filter(Employee_Info.approver_id == approver_id)

    if start_date and end_date:
        try:
            s = datetime.strptime(start_date, "%Y-%m-%d").date()
            e = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Employee_Info.doj.between(s, e))
        except ValueError:
            return jsonify({"error": "Invalid date format, use YYYY-MM-DD"}), 400

    employees = query.all()

    # Create CSV using StringIO
    output = StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        'Emp ID', 'Emp Name', 'Gender', 'Emp Type', 'Location', 'Company', 'Work location',
        'Country', 'City', 'Mobile', 'Email', 'Designation', 'Reporting Manager',
        'Core Skill', 'Skills details', 'Experience on DOJ', 'Total experience as on date',
        'NTS Emp DOJ', 'NTS Emp LWD', 'Department', 'Full name of client',
        'Client Start Date', 'Client End Date', 'Project Name', 'Project Type',
        'Project Billability', 'Daily Hours'
    ])

    current_date = date.today()

    # Data writing
    for emp in employees:
        dept_name = emp.department.dept_name if emp.department else ""

        exp_on_doj = "0"
        total_exp = "N/A"

        if emp.doj:
            yrs = (current_date - emp.doj).days / 365.25
            total_exp = f"{yrs:.1f}"

        base_row = [
            emp.empid,
            f"{emp.fname} {emp.lname}",
            emp.gender or "",
            emp.employee_type or "",
            emp.location or "",
            emp.company or "",
            emp.work_location or "",
            emp.country or "",
            emp.city or "",
            emp.mobile or "",
            emp.email,
            emp.designation or "",
            emp.approver_id or "",
            emp.core_skill or "",
            emp.skill_details or "",
            exp_on_doj,
            total_exp,
            emp.doj.strftime('%d-%m-%Y') if emp.doj else "",
            emp.lwd.strftime('%d-%m-%Y') if emp.lwd else "",
            dept_name
        ]

        client_assignments = Client_Employee.query.filter_by(empid=emp.empid).all()

        if client_assignments:
            for ca in client_assignments:
                client_name = ""
                daily_hours = ""
                project_name = ""
                project_type = ""
                project_billability = ""

                if ca.clientID:
                    client_info = Client_Info.query.get(int(ca.clientID))
                    if client_info:
                        client_name = client_info.client_name
                        daily_hours = str(client_info.daily_hours or "")

                        project = (
                            db.session.query(Project_Info)
                            .join(Employee_Project, Employee_Project.project_id == Project_Info.id)
                            .join(Client_Info, Project_Info.client_id == Client_Info.clientID)
                            .filter(Employee_Project.empid == emp.empid)
                            .filter(Client_Info.client_name == client_name)
                            .first()
                        )

                        if project:
                            project_name = project.project_name or ""
                            project_type = project.project_type or ""
                            project_billability = project.project_billability or ""

                writer.writerow(base_row + [
                    client_name,
                    ca.start_date.strftime('%d-%m-%Y') if ca.start_date else "",
                    ca.end_date.strftime('%d-%m-%Y') if ca.end_date else "",
                    project_name,
                    project_type,
                    project_billability,
                    daily_hours
                ])
        else:
            writer.writerow(base_row + ["", "", "", "", "", "", ""])

    # Convert to bytes
    byte_data = BytesIO(output.getvalue().encode("utf-8"))
    byte_data.seek(0)

    # Send CSV file
    return send_file(
        byte_data,
        mimetype="text/csv",
        as_attachment=True,
        download_name="employees_export.csv"
    )

# @app.route('/admin/export_employees')
# def export_employees():
#     if 'user_id' not in session:
#         flash('Please login to continue', 'error')
#         return redirect(url_for('login'))

#     # Get filter parameters
#     department_name = request.args.get('dept', '')
#     approver_id = request.args.get('approver_id', '')
#     start_date = request.args.get('start_date', '')
#     end_date = request.args.get('end_date', '')

#     # Base query (join Department for filtering)
#     query = Employee_Info.query.outerjoin(Department, Employee_Info.dept_id == Department.id)

#     # Department filter
#     if department_name:
#         query = query.filter(Department.dept_name == department_name)

#     # Approver filter
#     if approver_id:
#         query = query.filter(Employee_Info.approver_id == approver_id)

#     # DOJ range filter
#     if start_date and end_date:
#         try:
#             start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
#             end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
#             query = query.filter(Employee_Info.doj.between(start_date_obj, end_date_obj))
#         except ValueError:
#             flash('Invalid date format. Please use YYYY-MM-DD format.', 'error')

#     employees = query.all()

#     # Prepare CSV
#     si = StringIO()
#     writer = csv.writer(si)

#     # Header
#     writer.writerow([
#         'Emp ID', 'Emp Name', 'Gender', 'Emp Type', 'Location', 'Company', 'Work location',
#         'Country', 'City', 'Mobile', 'Email', 'Designation', 'Reporting Manager',
#         'Core Skill', 'Skills details', 'Experience on DOJ', 'Total experience as on date',
#         'NTS Emp DOJ', 'NTS Emp LWD', 'Department', 'Full name of client',
#         'Client Start Date', 'Client End Date', 'Project Name', 'Project Type',
#         'Project Billability', 'Daily Hours'
#     ])

#     current_date = date.today()

#     for emp in employees:
#         dept_name = emp.department.dept_name if emp.department else ""

#         # Experience calculations
#         exp_on_doj = "N/A"
#         total_exp = "N/A"
#         if emp.doj:
#             years_since_joining = (current_date - emp.doj).days / 365.25
#             total_exp = f"{years_since_joining:.1f}"
#             exp_on_doj = "0"  # Placeholder; adjust if you track prior exp

#         # Common emp data
#         employee_data = [
#             emp.empid,
#             f"{emp.fname} {emp.lname}",
#             emp.gender or "",
#             emp.employee_type or "",
#             emp.location or "",
#             emp.company or "",
#             emp.work_location or "",
#             emp.country or "",
#             emp.city or "",
#             emp.mobile or "",
#             emp.email,
#             emp.designation or "",
#             emp.approver_id or "",
#             emp.core_skill or "",
#             emp.skill_details or "",
#             exp_on_doj,
#             total_exp,
#             emp.doj.strftime('%d-%m-%Y') if emp.doj else "",
#             emp.lwd.strftime('%d-%m-%Y') if emp.lwd else "",
#             dept_name
#         ]

#         # Client assignments
#         client_assignments = Client_Employee.query.filter_by(empid=emp.empid).all()

#         if client_assignments:
#             for assignment in client_assignments:
#                 client_name, daily_hours = "", ""
#                 project_name, project_type, project_billability = "", "", ""

#                 if assignment.clientID:
#                     client_info = Client_Info.query.get(int(assignment.clientID))
#                     if client_info:
#                         client_name = client_info.client_name
#                         daily_hours = str(client_info.daily_hours or "")

#                         # Get projects linked to this client
#                         project = (
#                             db.session.query(Project_Info)
#                             .join(Employee_Project, Employee_Project.project_id == Project_Info.id)
#                             .join(Client_Info, Project_Info.client_id == Client_Info.clientID)
#                             .filter(Employee_Project.empid == emp.empid)
#                             .filter(Client_Info.client_name == client_name)
#                             .first()
#                         )

#                         if project:
#                             project_name = project.project_name or ""
#                             project_type = project.project_type or ""
#                             project_billability = project.project_billability or ""

#                 client_data = [
#                     client_name,
#                     assignment.start_date.strftime('%d-%m-%Y') if assignment.start_date else "",
#                     assignment.end_date.strftime('%d-%m-%Y') if assignment.end_date else "",
#                     project_name,
#                     project_type,
#                     project_billability,
#                     daily_hours
#                 ]

#                 writer.writerow(employee_data + client_data)
#         else:
#             writer.writerow(employee_data + ["", "", "", "", "", "", ""])

#     output = make_response(si.getvalue())
#     output.headers["Content-Disposition"] = "attachment; filename=employees_export.csv"
#     output.headers["Content-type"] = "text/csv"
#     return output

# @app.route('/admin/employees/<empid>', methods=['GET'])
# def view_employee(empid):
#     if 'user_id' not in session:
#         flash('Please login to continue', 'error')
#         return redirect(url_for('login'))

#     # Fetch employee details
#     employee = Employee_Info.query.filter_by(empid=empid.upper()).first_or_404()

#     # Calculate end_date as LWD if exists and <= today, else today
#     today = date.today()
#     end_date = employee.lwd if employee.lwd and employee.lwd <= today else today

#     # Calculate years in the company
#     years_in_company = 0
#     if employee.doj:
#         delta = end_date - employee.doj
#         years_in_company = delta.days / 365.25

#     # Add previous experience from prev_total_exp field
#     total_experience = years_in_company
#     if hasattr(employee, 'prev_total_exp') and employee.prev_total_exp:
#         try:
#             total_experience += float(employee.prev_total_exp)
#         except ValueError:
#             pass  # In case of bad data, skip adding

#     total_experience = round(total_experience, 1)

#     # Fetch client assignments
#     client_assignments = Client_Employee.query.filter_by(empid=empid.upper()).all()
#     client_details = [
#         {'client': a.client, 'assignment': a}
#         for a in client_assignments if a.client
#     ]

#     return render_template(
#         'employee_list.html',
#         employee=employee,
#         client_details=client_details,
#         total_experience=total_experience
#     )

# @app.route("/api/employees/<empid>", methods=["GET"])
# def employee_details(empid):
#     emp = Employee_Info.query.options(joinedload(Employee_Info.department)).filter_by(empid=empid.upper()).first()
#     if not emp:
#         return jsonify({"message": "Employee not found"}), 404

#     # Calculate company experience
#     today = date.today()
#     end_date = emp.lwd if emp.lwd and emp.lwd <= today else today

#     years_in_company = 0
#     if emp.doj:
#         years_in_company = (end_date - emp.doj).days / 365.25

#     total_experience = round(years_in_company + float(emp.prev_total_exp or 0), 1)

#     # Get client assignments
#     assignments = Client_Employee.query.filter_by(empid=empid.upper()).all()

#     client_details = []
#     for a in assignments:
#         client = Client_Info.query.filter_by(clientID=a.clientID).first()
#         if client:
#             client_details.append({
#                 "client": {
#                     "clientID": client.clientID,
#                     "client_name": client.client_name
#                 },
#                 "assignment": {
#                     "start_date": a.start_date.strftime("%Y-%m-%d") if a.start_date else None,
#                     "end_date": a.end_date.strftime("%Y-%m-%d") if a.end_date else None
#                 }
#             })

#     # Serialize employee for React
#     employee_data = {
#         "empid": emp.empid,
#         "fname": emp.fname,
#         "lname": emp.lname,
#         "email": emp.email,
#         "mobile": emp.mobile,
#         "gender": emp.gender,
#         "designation": emp.designation,
#         "employee_type": emp.employee_type,
#         "prev_total_exp": emp.prev_total_exp,
#         "total_experience": total_experience,
#         "location": emp.location,
#         "company": emp.company,
#         "work_location": emp.work_location,
#         "country": emp.country,
#         "city": emp.city,
#         "core_skill": emp.core_skill,
#         "skill_details": emp.skill_details,
#         "approver_id": emp.approver_id,
#         "doj": emp.doj.strftime("%Y-%m-%d") if emp.doj else None,
#         "lwd": emp.lwd.strftime("%Y-%m-%d") if emp.lwd else None,
#         "department": {
#             "id": emp.department.id,
#             "dept_name": emp.department.dept_name
#         } if emp.department else None
#     }

#     return jsonify({
#         "employee": employee_data,
#         "client_details": client_details
#     }), 200



# 2) GET SINGLE EMPLOYEE DETAILS
# ================================
@app.route("/api/employees/<empid>", methods=["GET"])
def employee_details(empid):
    emp = Employee_Info.query.options(joinedload(Employee_Info.department)).filter_by(empid=empid.upper()).first()
    if not emp:
        return jsonify({"message": "Employee not found"}), 404

    # Calculate company experience
    today = date.today()
    end_date = emp.lwd if emp.lwd and emp.lwd <= today else today

    years_in_company = 0
    if emp.doj:
        years_in_company = (end_date - emp.doj).days / 365.25

    total_experience = round(years_in_company + float(emp.prev_total_exp or 0), 1)

    # Get client assignments
    assignments = Client_Employee.query.filter_by(empid=empid.upper()).all()

    client_details = []
    for a in assignments:
        client = Client_Info.query.filter_by(clientID=a.clientID).first()
        if client:
            client_details.append({
                "client": {
                    "clientID": client.clientID,
                    "client_name": client.client_name
                },
                "assignment": {
                    "start_date": a.start_date.strftime("%Y-%m-%d") if a.start_date else None,
                    "end_date": a.end_date.strftime("%Y-%m-%d") if a.end_date else None
                }
            })

    # Serialize employee for React
    employee_data = {
        "empid": emp.empid,
        "fname": emp.fname,
        "lname": emp.lname,
        "email": emp.email,
        "mobile": emp.mobile,
        "gender": emp.gender,
        "designation": emp.designation,
        "employee_type": emp.employee_type,
        "prev_total_exp": emp.prev_total_exp,
        "total_experience": total_experience,
        "location": emp.location,
        "company": emp.company,
        "work_location": emp.work_location,
        "country": emp.country,
        "city": emp.city,
        "core_skill": emp.core_skill,
        "skill_details": emp.skill_details,
        "approver_id": emp.approver_id,
        "doj": emp.doj.strftime("%Y-%m-%d") if emp.doj else None,
        "lwd": emp.lwd.strftime("%Y-%m-%d") if emp.lwd else None,
        "department": {
            "id": emp.department.id,
            "dept_name": emp.department.dept_name
        } if emp.department else None
    }

    return jsonify({
        "employee": employee_data,
        "client_details": client_details
    }), 200



@app.route('/api/employee/<empid>', methods=['GET'])
def api_get_employee(empid):
    employee = Employee_Info.query.filter_by(empid=empid).first()
 
    is_admin = session.get('user_id') == 'N0482'
 
    client_assignments = Client_Employee.query.filter_by(empid=empid).all()
 
    response = {
        "is_admin": is_admin,
        "employee": {
            "fname": employee.fname,
            "lname": employee.lname,
            "email": employee.email,
            "mobile": employee.mobile,
            "gender": employee.gender,
            "core_skill": employee.core_skill,
            "skill_details": employee.skill_details,
            "dept_id": employee.dept_id,
            "designation": employee.designation,
            "employee_type": employee.employee_type,
            "prev_total_exp": employee.prev_total_exp,
            "approver_id": employee.approver_id,
            "doj": employee.doj.strftime("%Y-%m-%d") if employee.doj else "",
            "lwd": employee.lwd.strftime("%Y-%m-%d") if employee.lwd else "",
            "company": employee.company,
            "location": employee.location,
            "work_location": employee.work_location,
            "country": employee.country,
            "city": employee.city,
        },
        "departments": [
            {"id": d.id, "dept_name": d.dept_name}
            for d in Department.query.all()
        ],
        "available_clients": [
            {"clientID": c.clientID, "client_name": c.client_name}
            for c in Client_Info.query.all()
        ],
        "assignments": [
            {
                "clientID": ca.clientID,
                "start_date": ca.start_date.strftime("%Y-%m-%d") if ca.start_date else "",
                "end_date": ca.end_date.strftime("%Y-%m-%d") if ca.end_date else ""
            }
            for ca in client_assignments
        ],
    }
 
    return jsonify(response)


@app.route("/api/approvers_by_department", methods=["GET"])
def approvers_by_department():
    dept_id = request.args.get("dept_id")
    if not dept_id:
        return jsonify([]), 200

    approvers = Employee_Info.query.filter(
        Employee_Info.dept_id == int(dept_id),
        Employee_Info.approver_id.isnot(None)
    ).all()

    return jsonify([
        {
            "approver_id": a.approver_id,
            "fname": a.fname,
            "lname": a.lname
        }
        for a in approvers
    ]), 200



# @app.route('/dashboard/edit_employee/<empid>', methods=['GET', 'POST'])
# def edit_employee_dashboard(empid):
#     if 'user_id' not in session:
#         flash('Please login to continue', 'error')
#         return redirect(url_for('login'))

#     employee = Employee_Info.query.filter_by(empid=empid.upper()).first_or_404()

#     today = date.today()
#     end_date = employee.lwd if employee.lwd and employee.lwd <= today else today

#     years_in_company = 0
#     if employee.doj:
#         delta = end_date - employee.doj
#         years_in_company = delta.days / 365.25

#     total_experience = years_in_company
#     if hasattr(employee, 'prev_experience') and employee.prev_experience:
#         total_experience += float(employee.prev_experience)
#     total_experience = round(total_experience, 1)

#     is_admin = session.get('user_id') == 'N0482'
#     is_self_edit = session.get('user_id') == employee.empid

#     if not (is_admin or is_self_edit):
#         flash('You do not have permission to edit this employee information', 'error')
#         return redirect(url_for('dashboard'))

#     client_assignments = Client_Employee.query.filter_by(empid=empid.upper()).all()
#     assignment_dict = {
#         int(ca.clientID): {
#             'start_date': ca.start_date.strftime('%Y-%m-%d') if ca.start_date else '',
#             'end_date': ca.end_date.strftime('%Y-%m-%d') if ca.end_date else ''
#         } for ca in client_assignments
#     }

#     if request.method == 'POST':
#         print("Form submitted!")
#         try:
#             # Update Employee Info
#             employee.fname = request.form.get('fname', employee.fname)
#             employee.lname = request.form.get('lname', employee.lname)
#             employee.email = request.form.get('email', employee.email)
#             employee.mobile = request.form.get('mobile', employee.mobile)
#             employee.gender = request.form.get('gender', employee.gender)
#             employee.work_location = request.form.get('work_location', employee.work_location)
#             employee.country = request.form.get('country', employee.country)
#             employee.city = request.form.get('city', employee.city)
#             employee.core_skill = request.form.get('core_skill', employee.core_skill)
#             employee.skill_details = request.form.get('skill_details', employee.skill_details)

#             prev_exp = request.form.get('prev_experience')
#             if prev_exp is not None:
#                 try:
#                     employee.prev_total_exp = float(prev_exp)
#                 except ValueError:
#                     flash('Previous experience must be a valid number', 'error')

#             if is_admin:
#                 # Department & Admin fields
#                 is_new_dept = request.form.get('is_new_dept') == 'true'
#                 dept_value = request.form.get('dept_id')

#                 if is_new_dept and dept_value:
#                     existing_dept = Department.query.filter_by(dept_name=dept_value.strip()).first()
#                     if existing_dept:
#                         employee.dept_id = existing_dept.id
#                     else:
#                         new_dept = Department(dept_name=dept_value.strip())
#                         db.session.add(new_dept)
#                         db.session.flush()
#                         employee.dept_id = new_dept.id
#                 else:
#                     if dept_value and dept_value.isdigit():
#                         employee.dept_id = int(dept_value)
                        

#                 employee.designation = request.form.get('designation', employee.designation)
#                 employee.employee_type = request.form.get('employee_type', employee.employee_type)
#                 employee.location = request.form.get('location', employee.location)
#                 employee.company = request.form.get('company', employee.company)
#                 employee.approver_id = request.form.get('approver_id', employee.approver_id)

#                 doj = request.form.get('doj')
#                 lwd = request.form.get('lwd')

#                 if doj and doj.strip():
#                     employee.doj = datetime.strptime(doj, '%Y-%m-%d').date()
#                 if lwd and lwd.strip():
#                     employee.lwd = datetime.strptime(lwd, '%Y-%m-%d').date()
#                 else:
#                     employee.lwd = None

#                 db.session.commit()
#                 print("✅ Employee & client assignments saved")
#                 flash('Employee information updated successfully', 'success')
#                 return redirect(url_for('view_employee', empid=empid) if is_admin else url_for('dashboard'))

#         except Exception as e:
#             db.session.rollback()
#             print(f" Commit failed: {e}")
#             import traceback
#             traceback.print_exc()
#             flash(f'Error updating employee information: {str(e)}', 'error')

#     # Render page
#     available_clients = Client_Info.query.all() if is_admin else []
#     # ✅ Ensure safe JSON for JS
#     available_clients_js = json.dumps([
#         {"clientID": int(c.clientID), "client_name": c.client_name}
#         for c in available_clients
#     ]) if is_admin else "[]"

#     all_departments = Department.query.order_by(Department.dept_name).all()
#     assigned_client_ids = [int(ca.clientID) for ca in client_assignments]

#     return render_template(
#         'edit_employee.html',
#         employee=employee,
#         is_admin=is_admin,
#         client_assignments=client_assignments,
#         available_clients=available_clients,
#         available_clients_js=available_clients_js,
#         assigned_client_ids=assigned_client_ids,
#         assignment_dict=assignment_dict,
#         all_departments=all_departments,
#         total_experience=total_experience
#     )


# @app.route('/admin/edit_employee/<empid>', methods=['GET', 'POST'])
# def edit_employee(empid):
#     if 'user_id' not in session:
#         flash('Please login to continue', 'error')
#         return redirect(url_for('login'))

#     employee = Employee_Info.query.filter_by(empid=empid.upper()).first_or_404()
 
#     today = date.today()
#     end_date = employee.lwd if employee.lwd and employee.lwd <= today else today

#     years_in_company = 0
#     if employee.doj:
#         delta = end_date - employee.doj
#         years_in_company = delta.days / 365.25

#     total_experience = years_in_company
#     if hasattr(employee, 'prev_experience') and employee.prev_experience:
#         total_experience += float(employee.prev_experience)
#     total_experience = round(total_experience, 1)

#     is_admin = session.get('user_id') == 'N0482'
#     is_self_edit = session.get('user_id') == employee.empid

#     if not (is_admin or is_self_edit):
#         flash('You do not have permission to edit this employee information', 'error')
#         return redirect(url_for('dashboard'))

#     client_assignments = Client_Employee.query.filter_by(empid=empid.upper()).all()
#     assignment_dict = {
#         int(ca.clientID): {
#             'start_date': ca.start_date.strftime('%Y-%m-%d') if ca.start_date else '',
#             'end_date': ca.end_date.strftime('%Y-%m-%d') if ca.end_date else ''
#         } for ca in client_assignments
#     }

#     if request.method == 'POST':
#         print("Form submitted!")
#         try:
#             # Update Employee Info
#             employee.fname = request.form.get('fname', employee.fname)
#             employee.lname = request.form.get('lname', employee.lname)
#             employee.email = request.form.get('email', employee.email)
#             employee.mobile = request.form.get('mobile', employee.mobile)
#             employee.gender = request.form.get('gender', employee.gender)
#             employee.work_location = request.form.get('work_location', employee.work_location)
#             employee.country = request.form.get('country', employee.country)
#             employee.city = request.form.get('city', employee.city)
#             employee.core_skill = request.form.get('core_skill', employee.core_skill)
#             employee.skill_details = request.form.get('skill_details', employee.skill_details)

#             prev_exp = request.form.get('prev_experience')
#             if prev_exp is not None:
#                 try:
#                     employee.prev_total_exp = float(prev_exp)
#                 except ValueError:
#                     flash('Previous experience must be a valid number', 'error')

#             if is_admin:
#                 # 🏢 Department & Admin fields
#                 is_new_dept = request.form.get('is_new_dept') == 'true'
#                 dept_value = request.form.get('dept_id')

#                 if is_new_dept and dept_value:
#                     existing_dept = Department.query.filter_by(dept_name=dept_value.strip()).first()
#                     if existing_dept:
#                         employee.dept_id = existing_dept.id
#                     else:
#                         new_dept = Department(dept_name=dept_value.strip())
#                         db.session.add(new_dept)
#                         db.session.flush()
#                         employee.dept_id = new_dept.id
#                 else:
#                     if dept_value and dept_value.isdigit():
#                         employee.dept_id = int(dept_value)

#                 employee.designation = request.form.get('designation', employee.designation)
#                 employee.employee_type = request.form.get('employee_type', employee.employee_type)
#                 employee.location = request.form.get('location', employee.location)
#                 employee.company = request.form.get('company', employee.company)
#                 employee.approver_id = request.form.get('approver_id', employee.approver_id)

#                 doj = request.form.get('doj')
#                 lwd = request.form.get('lwd')

#                 if doj and doj.strip():
#                     employee.doj = datetime.strptime(doj, '%Y-%m-%d').date()
#                 if lwd and lwd.strip():
#                     employee.lwd = datetime.strptime(lwd, '%Y-%m-%d').date()
#                 else:
#                     employee.lwd = None

#                 # 📋 Client Assignments
#                 assignment_ids = request.form.getlist('assignment_ids[]')
#                 client_ids = request.form.getlist('client_ids[]')
#                 start_dates = request.form.getlist('start_dates[]')
#                 end_dates = request.form.getlist('end_dates[]')

#                 print("Assignment IDs:", assignment_ids)
#                 print("Client IDs:", client_ids)
#                 print("Start Dates:", start_dates)
#                 print("End Dates:", end_dates)
                
#                 # 1️⃣ Existing assignment IDs in DB
#                 existing_assignments = Client_Employee.query.filter_by(empid=empid.upper()).all()
#                 existing_ids = {str(a.id) for a in existing_assignments}

#                 # 2️⃣ Submitted assignment IDs (ignore blanks for new rows)
#                 submitted_ids = {aid for aid in assignment_ids if aid.strip()}

#                 # 3️⃣ Delete ones removed from form
#                 to_delete = existing_ids - submitted_ids
#                 for del_id in to_delete:
#                     assignment = Client_Employee.query.get(int(del_id))
#                     if assignment:
#                         db.session.delete(assignment)

#                 for i in range(len(client_ids)):
#                     try:
#                         aid = assignment_ids[i] if i < len(assignment_ids) else ""
#                         cid = int(client_ids[i])
#                         start_date = datetime.strptime(start_dates[i], '%Y-%m-%d').date() if start_dates[i] else None
#                         end_date = datetime.strptime(end_dates[i], '%Y-%m-%d').date() if end_dates[i] else None

#                         if not aid.strip():
#                             # New assignment
#                             new_assignment = Client_Employee(
#                                 empid=empid.upper(),
#                                 clientID=cid,
#                                 start_date=start_date,
#                                 end_date=end_date
#                             )
#                             db.session.add(new_assignment)
#                         else:
#                             # Update existing
#                             existing = Client_Employee.query.get(int(aid))
#                             if existing:
#                                 existing.clientID = cid
#                                 existing.start_date = start_date
#                                 existing.end_date = end_date
#                     except Exception as e:
#                         print(f"⚠ Error processing client assignment {i}: {e}")

#                 # ✅ Commit after loop
#                 db.session.commit()
#                 print("✅ Employee & client assignments saved")
#                 flash('Employee information updated successfully', 'success')
#                 return redirect(url_for('view_employee', empid=empid) if is_admin else url_for('dashboard'))

#         except Exception as e:
#             db.session.rollback()
#             print(f" Commit failed: {e}")
#             import traceback
#             traceback.print_exc()
#             flash(f'Error updating employee information: {str(e)}', 'error')

#     # Render page
#     available_clients = Client_Info.query.all() if is_admin else []
#     available_clients_js = [
#         {"clientID": c.clientID, "client_name": c.client_name}
#         for c in available_clients
#     ] if is_admin else []
#     print("User is admin:", is_admin)
#     print("🔁 available_clients_js:", available_clients_js)

#     all_departments = Department.query.order_by(Department.dept_name).all()
#     assigned_client_ids = [int(ca.clientID) for ca in client_assignments]

#     return render_template(
#         'edit_employee.html',
#         employee=employee,
#         is_admin=is_admin,
#         client_assignments=client_assignments,
#         available_clients=available_clients,
#         available_clients_js=available_clients_js,
#         assigned_client_ids=assigned_client_ids,
#         assignment_dict=assignment_dict,
#         all_departments=all_departments,
#         total_experience=total_experience
#     )

@app.route('/admin/editemployee/<empid>', methods=['PUT'])
def edit_employee(empid):
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Invalid JSON"}), 400

        form = data.get("form", {})
        assignments = data.get("assignments", [])

        employee = Employee_Info.query.filter_by(empid=empid).first()
        if not employee:
            return jsonify({"error": "Employee not found"}), 404

        # -------------------------------------------------------
        # BASIC FIELDS — editable by all
        # -------------------------------------------------------
        employee.fname = form.get("fname", employee.fname)
        employee.lname = form.get("lname", employee.lname)
        employee.email = form.get("email", employee.email)
        employee.mobile = form.get("mobile", employee.mobile)
        employee.gender = form.get("gender", employee.gender)
        employee.core_skill = form.get("core_skill", employee.core_skill)
        employee.skill_details = form.get("skill_details", employee.skill_details)
        employee.work_location = form.get("work_location", employee.work_location)
        employee.country = form.get("country", employee.country)
        employee.city = form.get("city", employee.city)

        # Previous experience
        prev_exp = form.get("prev_total_exp")
        if prev_exp not in (None, ""):
            try:
                employee.prev_total_exp = float(prev_exp)
            except:
                return jsonify({"error": "Invalid previous experience"}), 400

        # -------------------------------------------------------
        # ADMIN-ONLY FIELDS
        # -------------------------------------------------------
        logged_in_user = session.get("user_id")
        is_admin = logged_in_user == "N0482"   # your admin condition

        if is_admin:
            # ---------------------
            # DEPARTMENT
            # ---------------------
            employee.dept_id = form.get("dept_id", employee.dept_id)

            # ---------------------
            # JOB ROLE LOGIC (FULL FIX)
            # ---------------------
            job_role_id = form.get("job_role_id")

            if job_role_id == "custom":
                role_name = form.get("custom_job_role", "").strip()

                if not role_name:
                    return jsonify({"error": "New job role name required"}), 400

                existing_role = JobRole.query.filter_by(
                    dept_id=employee.dept_id,
                    job_role=role_name
                ).first()

                if existing_role:
                    employee.job_role_id = existing_role.id
                else:
                    new_role = JobRole(
                        dept_id=employee.dept_id,
                        job_role=role_name
                    )
                    db.session.add(new_role)
                    db.session.flush()   # REQUIRED
                    employee.job_role_id = new_role.id

            elif job_role_id:
                employee.job_role_id = int(job_role_id)

            # ---------------------
            # OTHER ADMIN FIELDS
            # ---------------------
            employee.designation = form.get("designation", employee.designation)
            employee.employee_type = form.get("employee_type", employee.employee_type)
            employee.location = form.get("location", employee.location)
            employee.company = form.get("company", employee.company)
            employee.approver_id = form.get("approver_id", employee.approver_id)

            # DOJ
            doj = form.get("doj")
            if doj:
                try:
                    employee.doj = datetime.strptime(doj, "%Y-%m-%d").date()
                except:
                    return jsonify({"error": "Invalid DOJ format"}), 400

            # LWD
            lwd = form.get("lwd")
            if lwd:
                try:
                    employee.lwd = datetime.strptime(lwd, "%Y-%m-%d").date()
                except:
                    return jsonify({"error": "Invalid LWD format"}), 400
            else:
                employee.lwd = None

            # -------------------------------------------------------
            # CLIENT ASSIGNMENTS (ADMIN)
            # -------------------------------------------------------
            Client_Employee.query.filter_by(empid=empid).delete()

            for a in assignments:
                if not a.get("clientID"):
                    continue

                start = a.get("start_date")
                end = a.get("end_date")

                new_assign = Client_Employee(
                    empid=empid,
                    clientID=a["clientID"],
                    start_date=datetime.strptime(start, "%Y-%m-%d").date() if start else None,
                    end_date=datetime.strptime(end, "%Y-%m-%d").date() if end else None
                )
                db.session.add(new_assign)

        # -------------------------------------------------------
        # COMMIT
        # -------------------------------------------------------
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Employee updated successfully!"
        }), 200

    except Exception as e:
        db.session.rollback()
        print("❌ ERROR Updating Employee:", e)
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    


# @app.route('/admin/add_client', methods=['GET', 'POST'])
# def add_client():
#     if request.method == 'POST':
#         try:
#             # Get form data
#             client_name = request.form['client_name'].strip()  # Trim whitespace
#             start_date = datetime.strptime(request.form['start_date'], '%Y-%m-%d').date() if request.form['start_date'] else None
#             end_date = datetime.strptime(request.form['end_date'], '%Y-%m-%d').date() if request.form['end_date'] else None
            
#             # Get daily hours value - handle empty input and convert to float
#             daily_hours = None
#             if request.form.get('daily_hours'):
#                 daily_hours = float(request.form['daily_hours'])
            
#             # Check if client already exists
#             existing_client = Client_Info.query.filter_by(client_name=client_name).first()
#             if existing_client:
#                 flash(f"Client '{client_name}' already exists!", "error")
#                 return redirect(url_for('add_client'))  # Redirect back to the form
            
#             # Create new client if not found
#             new_client = Client_Info(
#                 client_name=client_name,
#                 start_date=start_date,
#                 end_date=end_date,
#                 daily_hours=daily_hours  # Added the daily_hours field
#             )
            
#             # Add to database
#             db.session.add(new_client)
#             db.session.commit()
            
#             flash('Client added successfully!', 'success')
#             return redirect(url_for('add_client'))
        
#         except Exception as e:
#             db.session.rollback()
#             flash(f'Error adding client: {str(e)}', 'error')
#             return redirect(url_for('add_client'))
    
#     return render_template('add_client.html')



# @app.route('/admin/add_client', methods=['POST'])
# def add_client():
#     try:
#         data = request.get_json()
 
#         client_name = data.get("client_name", "").strip()
#         start_date = datetime.strptime(data["start_date"], '%Y-%m-%d').date()
#         end_date = (
#             datetime.strptime(data["end_date"], '%Y-%m-%d').date()
#             if data.get("end_date")
#             else None
#         )
#         daily_hours = float(data.get("daily_hours")) if data.get("daily_hours") else None
 
#         # Duplicate check
#         existing_client = Client_Info.query.filter_by(client_name=client_name).first()
#         if existing_client:
#             return jsonify({"message": "Client already exists!", "success": False}), 400
 
#         new_client = Client_Info(
#             client_name=client_name,
#             start_date=start_date,
#             end_date=end_date,
#             daily_hours=daily_hours
#         )
 
#         db.session.add(new_client)
#         db.session.commit()
 
#         return jsonify({"message": "Client added successfully!", "success": True}), 201
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"message": str(e), "success": False}), 500
    

# @app.route('/admin/view_clients')
# def view_clients():
#     try:
#         # Get search query from URL parameters
#         search_query = request.args.get('search', '').strip()

#         # If search query is provided, filter clients
#         if search_query:
#             clients = Client_Info.query.filter(
#                 Client_Info.client_name.ilike(f'%{search_query}%')
#             ).all()
#         else:
#             # If no search query, fetch all clients
#             clients = Client_Info.query.all()

#         # Convert SQLAlchemy objects to dictionaries
#         client_list = []
#         for c in clients:
#             client_list.append({
#                 "clientID": c.clientID,
#                 "client_name": c.client_name,
#                 "start_date": c.start_date.strftime('%Y-%m-%d') if c.start_date else None,
#                 "end_date": c.end_date.strftime('%Y-%m-%d') if c.end_date else None,
#             })

#         # Return JSON instead of HTML
#         return jsonify({
#             "success": True,
#             "clients": client_list,
#             "search_query": search_query
#         })

#     except Exception as e:
#         return jsonify({
#             "success": False,
#             "error": f"Error loading clients: {str(e)}",
#             "clients": [],
#             "search_query": ""
#         }), 500





# @app.route('/admin/view_clients')
# def view_clients():
#     try:
#         search_query = request.args.get('search', '').strip()

#         if search_query:
#             clients = Client_Info.query.filter(
#                 Client_Info.client_name.ilike(f'%{search_query}%')
#             ).all()
#         else:
#             clients = Client_Info.query.all()

#         client_list = []
#         for c in clients:
#             client_list.append({
#                 "clientID": c.clientID,
#                 "client_name": c.client_name,
#                 "start_date": c.start_date.strftime('%Y-%m-%d') if c.start_date else None,
#                 "end_date": c.end_date.strftime('%Y-%m-%d') if c.end_date else None,
#                 "daily_hours": c.daily_hours
#             })

#         return jsonify({
#             "success": True,
#             "clients": client_list,
#             "search_query": search_query
#         })

#     except Exception as e:
#         return jsonify({
#             "success": False,
#             "error": f"Error loading clients: {str(e)}",
#             "clients": [],
#             "search_query": ""
#         }), 500





# @app.route('/api/clients', methods=['GET'])
# def get_clients():
#     try:
#         clients = Client_Info.query.all()
#         result = [
#             {
#                 "clientID": c.clientID,
#                 "client_name": c.client_name
#             }
#             for c in clients
#         ]
#         return jsonify(result), 200
#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500
@app.route('/get_approvers_by_department')
def get_approvers_by_department():
    dept = request.args.get('dept')
    if not dept:
        return jsonify([])

    # Step 1: Get approver IDs from employees in the selected department
    approver_ids = db.session.query(Employee_Info.approver_id).filter(
        Employee_Info.dept == dept,
        Employee_Info.approver_id.isnot(None)
    ).distinct().all()

    # Flatten the list of tuples to a list of IDs
    approver_ids = [row[0] for row in approver_ids if row[0] is not None]

    if not approver_ids:
        return jsonify([])

    # Step 2: Get approver details using those IDs
    approvers = Employee_Info.query.filter(Employee_Info.empid.in_(approver_ids)).all()

    result = [
        {
            'approver_id': a.empid,
            'fname': a.fname,
            'lname': a.lname
        }
        for a in approvers
    ]

    return jsonify(result)


# @app.route('/admin/update_client/<int:id>', methods=['POST'])
# def update_client(id):
#     try:
#         # Get JSON data from request
#         data = request.get_json()
        
#         # Find the client
#         client = Client_Info.query.get_or_404(id)
        
#         # Update client information
#         client.client_name = data.get('client_name')
        
#         # Handle dates
#         start_date = data.get('start_date')
#         end_date = data.get('end_date')
        
#         if start_date:
#             client.start_date = datetime.strptime(start_date, '%Y-%m-%d')
#         else:
#             client.start_date = None
            
#         if end_date:
#             client.end_date = datetime.strptime(end_date, '%Y-%m-%d')
#         else:
#             client.end_date = None
        
#         # Handle daily hours (this was missing in your original code)
#         daily_hours = data.get('daily_hours')
#         if daily_hours:
#             client.daily_hours = float(daily_hours)
#         else:
#             client.daily_hours = None
        
#         # Save to database
#         db.session.commit()
        
#         return jsonify({'success': True})
#     except Exception as e:
#         # If there's an error, return error response
#         return jsonify({'success': False, 'error': str(e)}), 400




# @app.route('/admin/delete_client/<int:id>', methods=['POST'])
# def delete_client(id):
#     try:
#         # Find the client
#         client = Client_Info.query.get_or_404(id)
        
#         # Delete from database
#         db.session.delete(client)
#         db.session.commit()
        
#         return jsonify({'success': True})
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 400




# # ============================



# add new client details 
@app.route('/admin/add_client', methods=['POST'])
def add_client():
    # ---------- JSON POST (React / Postman) ----------
    if request.method == 'POST' and request.is_json:
        data = request.get_json()

        try:
            client_name = data.get('client_name', '').strip()
            start_date = datetime.strptime(data['start_date'], "%Y-%m-%d").date() if data.get('start_date') else None
            end_date = datetime.strptime(data['end_date'], "%Y-%m-%d").date() if data.get('end_date') else None

            if not client_name:
                return jsonify({"error": "client_name is required"}), 400

            # Check duplicate client
            if Client_Info.query.filter_by(client_name=client_name).first():
                return jsonify({"error": f"Client '{client_name}' already exists!"}), 400

            # Create client
            new_client = Client_Info(
                client_name=client_name,
                start_date=start_date,
                end_date=end_date
            )

            db.session.add(new_client)
            db.session.commit()

            return jsonify({"message": "Client added successfully"}), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500



@app.route('/admin/view_clients', methods=['GET'])
def view_clients():
    try:
        # Get search query from URL parameters (for Postman & React)
        search_query = request.args.get('search', '').strip()

        # Filter clients based on search text
        if search_query:
            clients = Client_Info.query.filter(
                Client_Info.client_name.ilike(f"%{search_query}%")
            ).all()
        else:
            clients = Client_Info.query.all()

        # Convert to JSON format
        client_list = [
            {
                "clientID": c.clientID,
                "client_name": c.client_name,
                "start_date": c.start_date.strftime('%Y-%m-%d') if c.start_date else None,
                "end_date": c.end_date.strftime('%Y-%m-%d') if c.end_date else None
            }
            for c in clients
        ]

        return jsonify({
            "total": len(client_list),
            "search_query": search_query,
            "clients": client_list
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




# @app.route('/admin/update_client/<int:id>', methods=['POST', 'PATCH'])
# def update_client(id):
#     try:
#         data = request.get_json()
#         if not data:
#             return jsonify({"error": "JSON body required"}), 400

#         client = Client_Info.query.get_or_404(id)

#         # Update fields
#         client.client_name = data.get('client_name', client.client_name)

#         start_date = data.get('start_date')
#         end_date = data.get('end_date')

#         client.start_date = datetime.strptime(start_date, '%Y-%m-%d').date() if start_date else None
#         client.end_date = datetime.strptime(end_date, '%Y-%m-%d').date() if end_date else None

#         daily_hours = data.get('daily_hours')
#         client.daily_hours = float(daily_hours) if daily_hours else None

#         db.session.commit()

#         return jsonify({"success": True, "message": "Client updated successfully"}), 200

#     except Exception as e:
#         db.session.rollback()
#         return jsonify({"success": False, "error": str(e)}), 400




# @app.route('/admin/delete_client/<int:id>', methods=['DELETE'])
# def delete_client(id):
#     try:
#         # Find the client
#         client = Client_Info.query.get_or_404(id)
        
#         # Delete from database
#         db.session.delete(client)
#         db.session.commit()
        
#         return jsonify({'success': True,"message": "Client deleted successfully"}), 200
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 400
    

@app.route('/admin/update_client/<int:id>', methods=['PUT', 'PATCH', 'POST'])
def update_client(id):
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"success": False, "error": "JSON body required"}), 400

        client = Client_Info.query.get_or_404(id)

        # Update fields
        if "client_name" in data:
            client.client_name = data.get('client_name') or client.client_name

        # start_date/end_date may come as null or empty string
        start_date = data.get('start_date')
        end_date = data.get('end_date')

        client.start_date = (
            datetime.strptime(start_date, '%Y-%m-%d').date() if start_date else None
        )
        client.end_date = (
            datetime.strptime(end_date, '%Y-%m-%d').date() if end_date else None
        )

        daily_hours = data.get('daily_hours')
        # accept null or numeric; if empty string treat as None
        if daily_hours in (None, ""):
            client.daily_hours = None
        else:
            client.daily_hours = float(daily_hours)

        db.session.commit()

        return jsonify({"success": True, "message": "Client updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 400

# ============================



# @app.route('/admin/manage_holidays', methods=['GET', 'POST'])
# def manage_holidays():
#     if 'user_id' not in session:
#         return redirect(url_for('login'))
    
#     # Hardcoded admin check
#     if session['user_id'] != 'N0482':
#         flash('You do not have permission to access the admin dashboard', 'error')
#         return redirect(url_for('login'))


#     if request.method == 'POST':
#         start_date = request.form.get('start_date')
#         end_date = request.form.get('end_date')
#         holiday_type = request.form.get('holiday_type')
#         dc = request.form.get('dc') or None
#         holiday_desc = request.form.get('holiday_desc')

#         insert_sql = text("""
#             INSERT INTO holidays (start_date, end_date, holiday_type, dc, holiday_desc)
#             VALUES (:start_date, :end_date, :holiday_type, :dc, :holiday_desc)
#         """)
#         db.session.execute(insert_sql, {
#             "start_date": start_date,
#             "end_date": end_date,
#             "holiday_type": holiday_type,
#             "dc": dc,
#             "holiday_desc": holiday_desc
#         })
#         db.session.commit()

#         flash('Holiday added successfully!', 'success')
#         return redirect(url_for('manage_holidays'))

#     # Fetch all holidays
#     fetch_sql = text("SELECT * FROM holidays ORDER BY start_date")
#     holidays = db.session.execute(fetch_sql).fetchall()

#     return render_template('manage_holidays.html', holidays=holidays)

# @app.route('/admin/delete_holiday/<int:holiday_id>', methods=['POST'])
# def delete_holiday(holiday_id):
#     if 'user_id' not in session:
#         return redirect(url_for('login'))
    
#     # Hardcoded admin check
#     if session['user_id'] != 'N0482':
#         flash('You do not have permission to access the admin dashboard', 'error')
#         return redirect(url_for('login'))

#     delete_sql = text("DELETE FROM holidays WHERE id = :holiday_id")
#     db.session.execute(delete_sql, {"holiday_id": holiday_id})
#     db.session.commit()

#     flash('Holiday deleted successfully!', 'success')
#     return redirect(url_for('manage_holidays'))

@app.route('/admin/manage_holidays', methods=['GET', 'POST'])
def manage_holidays():
    # Login check (same logic)
    # if 'user_id' not in session:
    #     return jsonify({"error": "You must log in first."}), 401
    
    # # Admin check (same logic)
    # if session['user_id'] != 'N0482':
    #     return jsonify({"error": "You do not have permission to access the admin dashboard"}), 403

    # --------------------- POST → Add Holiday ---------------------
    if request.method == 'POST':
        data = request.get_json()

        start_date = data.get('start_date')
        end_date = data.get('end_date')
        holiday_type = data.get('holiday_type')
        dc = data.get('dc') or None
        holiday_desc = data.get('holiday_desc')

        # Validation
        if not start_date or not end_date or not holiday_type:
            return jsonify({"error": "start_date, end_date, and holiday_type are required"}), 400

        insert_sql = text("""
            INSERT INTO holidays (start_date, end_date, holiday_type, dc, holiday_desc)
            VALUES (:start_date, :end_date, :holiday_type, :dc, :holiday_desc)
        """)
        db.session.execute(insert_sql, {
            "start_date": start_date,
            "end_date": end_date,
            "holiday_type": holiday_type,
            "dc": dc,
            "holiday_desc": holiday_desc
        })
        db.session.commit()

        return jsonify({"status":"success","message": "Holiday added successfully!"}), 201

    # --------------------- GET → List Holidays ---------------------
    fetch_sql = text("SELECT * FROM holidays ORDER BY start_date")
    rows = db.session.execute(fetch_sql).fetchall()

    holidays_list = []
    for row in rows:
        holidays_list.append({
            "id": row.id,
            "start_date": row.start_date,
            "end_date": row.end_date,
            "holiday_type": row.holiday_type,
            "dc": row.dc,
            "holiday_desc": row.holiday_desc
        })

    return jsonify({
        "holidays": holidays_list,
        "count": len(holidays_list)
    }), 200

# ============================
# POST /admin/delete_holiday/<int:holiday_id> (keeps method POST as original)
# Handles OPTIONS preflight first to avoid CORS blocks
# ============================
# @app.route('/admin/delete_holiday/<int:holiday_id>', methods=['POST', 'OPTIONS'])
# def delete_holiday(holiday_id):
#     # OPTIONS preflight
#     if request.method == 'OPTIONS':
#         origin = request.headers.get('Origin', '*')
#         resp = make_response()
#         resp.headers['Access-Control-Allow-Origin'] = origin
#         resp.headers['Access-Control-Allow-Credentials'] = 'true'
#         # allow POST here because your original used POST
#         resp.headers['Access-Control-Allow-Methods'] = 'POST,OPTIONS'
#         resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
#         return resp, 200

#     # Auth checks same as original
#     if 'user_id' not in session:
#         return jsonify({"status": "error", "message": "Not authenticated"}), 401

#     if session['user_id'] != 'N0482':
#         return jsonify({"status": "error", "message": "You do not have permission to access the admin dashboard"}), 403

#     try:
#         delete_sql = text("DELETE FROM holidays WHERE id = :holiday_id")
#         db.session.execute(delete_sql, {"holiday_id": holiday_id})
#         db.session.commit()
#         return jsonify({"status": "success", "message": "Holiday deleted successfully!"}), 200
#     except Exception:
#         db.session.rollback()
#         app.logger.exception("Error deleting holiday")
#         return jsonify({"status": "error", "message": "DB error while deleting holiday"}), 500

@app.route('/admin/delete_holiday/<int:holiday_id>', methods=['POST'])
def delete_holiday(holiday_id):
    if 'user_id' not in session:
        return jsonify({"error": "You must log in first."}), 401

    if session['user_id'] != 'N0482':
        return jsonify({"error": "You do not have permission to access the admin dashboard"}), 403

    delete_sql = text("DELETE FROM holidays WHERE id = :holiday_id")
    db.session.execute(delete_sql, {"holiday_id": holiday_id})
    db.session.commit()

    return jsonify({
        "message": "Holiday deleted successfully!",
        "deleted_id": holiday_id
    }), 200

# @app.route('/add_project', methods=['GET', 'POST'])
# def add_project():
#     clients = Client_Info.query.all()
#     existing_projects = Project_Info.query.all()

#     if request.method == 'POST':
#         # Get and clean form data
#         client_id = request.form['client_id']
#         project_name = request.form['project_name'].strip()
#         project_code = request.form['project_code'].strip()  # optional
#         project_type = request.form['project_type']
#         project_billability = request.form['project_billability']
#         start_date = request.form.get('start_date')
#         end_date = request.form.get('end_date')

#         # ✅ Validate required fields
#         if not project_name:
#             flash("Project name cannot be empty.", "danger")
#             return render_template('add_project.html', clients=clients, existing_projects=existing_projects)

#         if not project_type:
#             flash("Please select a project type.", "danger")
#             return render_template('add_project.html', clients=clients, existing_projects=existing_projects)

#         if not project_billability:
#             flash("Please select project billability.", "danger")
#             return render_template('add_project.html', clients=clients, existing_projects=existing_projects)

#         # ✅ Check if project name already exists
#         existing_project_name = Project_Info.query.filter_by(project_name=project_name).first()
#         if existing_project_name:
#             flash(f"Project name '{project_name}' already exists. Please use a different name.", "danger")
#             return render_template('add_project.html', clients=clients, existing_projects=existing_projects)

#         # ✅ Check if project code already exists (only if entered)
#         if project_code:
#             existing_project_code = Project_Info.query.filter_by(project_code=project_code).first()
#             if existing_project_code:
#                 flash(f"Project code '{project_code}' already exists. Please use a different code.", "danger")
#                 return render_template('add_project.html', clients=clients, existing_projects=existing_projects)

#         # 🗓️ Convert dates
#         start_date = datetime.strptime(start_date, '%Y-%m-%d').date() if start_date else date.today()
#         if end_date and end_date.strip():
#             end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
#             if end_date < start_date:
#                 flash("End date cannot be earlier than start date.", "danger")
#                 return render_template('add_project.html', clients=clients, existing_projects=existing_projects)
#         else:
#             end_date = None

#         try:
#             # ✅ Create and commit new project
#             new_project = Project_Info(
#                 client_id=client_id,
#                 project_name=project_name,
#                 project_code=project_code if project_code else None,  # store None if empty
#                 project_type=project_type,
#                 project_billability=project_billability,
#                 start_date=start_date,
#                 end_date=end_date
#             )
#             db.session.add(new_project)
#             db.session.commit()

#             client = Client_Info.query.get(client_id)
#             flash(f"Project '{project_name}' added for client '{client.client_name}' successfully!", "success")
#             return redirect(url_for('list_projects'))

#         except Exception as e:
#             db.session.rollback()
#             flash(f"Error adding project: {str(e)}", "danger")
#             return render_template('add_project.html', clients=clients, existing_projects=existing_projects)

#     return render_template('add_project.html', clients=clients, existing_projects=existing_projects)


@app.route('/api/add_project', methods=['POST'])
def add_project():
    try:
        data = request.get_json()

        client_id = data.get('client_id')
        project_name = data.get('project_name', '').strip()
        project_code = data.get('project_code', '').strip()
        project_type = data.get('project_type')
        project_billability = data.get('project_billability')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        daily_hours = data.get('daily_hours')

        # ---------- VALIDATIONS ----------
        if not project_name:
            return jsonify({"status": "error", "message": "Project name cannot be empty."}), 400
        
        if not project_type:
            return jsonify({"status": "error", "message": "Please select a project type."}), 400

        if not project_billability:
            return jsonify({"status": "error", "message": "Please select project billability."}), 400

        # NAME DUPLICATE CHECK
        existing_name = Project_Info.query.filter_by(project_name=project_name).first()
        if existing_name:
            return jsonify({"status": "error", "message": f"Project name '{project_name}' already exists."}), 400

        # CODE DUPLICATE CHECK
        if project_code:
            existing_code = Project_Info.query.filter_by(project_code=project_code).first()
            if existing_code:
                return jsonify({"status": "error", "message": f"Project code '{project_code}' already exists."}), 400

        # DATE PARSE
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date() if start_date else date.today()

        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            if end_date < start_date:
                return jsonify({"status": "error", "message": "End date cannot be earlier than start date."}), 400
        else:
            end_date = None

        # ---------- SAVE PROJECT ----------
        new_project = Project_Info(
            client_id=client_id,
            project_name=project_name,
            project_code=project_code if project_code else None,
            project_type=project_type,
            project_billability=project_billability,
            start_date=start_date,
            end_date=end_date,
            daily_hours=daily_hours
        )

        db.session.add(new_project)
        db.session.commit()

        client = Client_Info.query.get(client_id)

        return jsonify({
            "status": "success",
            "message": f"Project '{project_name}' added for client '{client.client_name}' successfully!"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": f"Server error: {str(e)}"}), 500
    

    
@app.route('/api/clients', methods=['GET'])
def get_clients():
    try:
        clients = Client_Info.query.all()
        result = [
            {
                "clientID": c.clientID,
                "client_name": c.client_name
            }
            for c in clients
        ]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# @app.route('/list_projects', methods=['GET'])
# def list_projects():
#     print("List projects route hit")  # Debug print

#     # Start query and join Client_Info for access to client_name
#     query = db.session.query(Project_Info, Client_Info.client_name).join(Client_Info)

#     # Filters
#     client_filter = request.args.get('client', '')
#     billability_filter = request.args.get('billability', '')
#     project_type_filter = request.args.get('project_type', '')
#     start_date_from = request.args.get('start_date_from', '')
#     start_date_to = request.args.get('start_date_to', '')
#     status_filter = request.args.get('status', '')

#     # Apply filters
#     if client_filter:
#         try:
#             client_id = int(client_filter)
#             query = query.filter(Project_Info.client_id == client_id)
#         except ValueError:
#             flash('Invalid client filter value.', 'error')

#     if billability_filter:
#         query = query.filter(Project_Info.project_billability == billability_filter)

#     if project_type_filter:
#         query = query.filter(Project_Info.project_type == project_type_filter)

#     if start_date_from:
#         try:
#             from_date = datetime.strptime(start_date_from, '%Y-%m-%d').date()
#             query = query.filter(Project_Info.start_date >= from_date)
#         except ValueError as e:
#             flash(f'Invalid start date format: {str(e)}', 'error')

#     if start_date_to:
#         try:
#             to_date = datetime.strptime(start_date_to, '%Y-%m-%d').date()
#             query = query.filter(Project_Info.start_date <= to_date)
#         except ValueError as e:
#             flash(f'Invalid end date format: {str(e)}', 'error')

#     if status_filter == 'ongoing':
#         query = query.filter(Project_Info.end_date == None)
#     elif status_filter == 'completed':
#         query = query.filter(Project_Info.end_date != None)

#     projects = query.all()
#     print(f"Found {len(projects)} projects")

#     # For dropdowns
#     unique_clients = db.session.query(Client_Info.clientID, Client_Info.client_name).distinct().all()
#     clients = Client_Info.query.all()
    
#     project_types = (
#         db.session.query(Project_Info.project_type)
#         .filter(Project_Info.project_type.isnot(None))
#         .distinct()
#         .all()
#     )
#     project_types = [ptype[0] for ptype in project_types]

#     return render_template(
#         'list_projects.html',
#         projects=projects,
#         unique_clients=unique_clients,
#         clients=clients,
#         project_types=project_types,
#         selected_project_type=project_type_filter
#     )

@app.route('/api/projects', methods=['GET'])
def list_projects():
    query = db.session.query(Project_Info, Client_Info.client_name)\
        .join(Client_Info)

    client = request.args.get("client")
    project_type = request.args.get("project_type")
    billability = request.args.get("billability")

    if client:
        query = query.filter(Project_Info.client_id == int(client))
    if billability:
        query = query.filter(Project_Info.project_billability == billability)
    if project_type:
        query = query.filter(Project_Info.project_type == project_type)

    data = []
    for project, cname in query.all():
        data.append({
            "id": project.id,
            "client_name": cname,
            "client_id": project.client_id,
            "project_name": project.project_name,
            "project_code": project.project_code,
            "start_date": str(project.start_date),
            "end_date": str(project.end_date) if project.end_date else None,
            "project_billability": project.project_billability,
            "project_type": project.project_type,
            "daily_hours":project.daily_hours
        })

    return jsonify(data)


@app.route('/api/update_project/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    print("****** Update project route hit ******")
    data = request.get_json()
    print(f"Received JSON: {data}")

    project = Project_Info.query.get_or_404(project_id)

    try:
        # Update fields
        project.client_name = data.get('client_name')
        project.project_name = data.get('project_name')
        project.project_code = data.get('project_code')
        project.project_billability = data.get('project_billability', 'Billable')
        project.project_type = data.get('project_type', '')
        project.daily_hours = data.get('daily_hours')

        # Start date
        start_date_str = data.get('start_date')
        if start_date_str:
            project.start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()

        # End date (optional)
        end_date_str = data.get('end_date')
        if end_date_str:
            project.end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        else:
            project.end_date = None

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Project updated successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Error updating project: {str(e)}"
        }), 400
    

@app.route('/api/delete_project/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    print("****** Delete project route hit ******")
    print("Project ID received:", project_id)

    project = Project_Info.query.get(project_id)
    if not project:
        print("Project not found")
        return jsonify({"success": False, "message": "Project not found"}), 404

    try:
        # DELETE dependent records first
        Employee_Project.query.filter_by(project_id=project_id).delete()

        # Now delete the main project
        db.session.delete(project)
        db.session.commit()

        print("Project deleted successfully")
        return jsonify({"success": True, "message": "Project deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        print("❌ ERROR WHILE DELETING:", str(e))
        return jsonify({"success": False, "message": str(e)}), 400
    
    
# @app.route('/reports')
# def reports():
#     return render_template('reports.html')
    
@app.route('/reports')
def reports():
    return render_template('reports.html')

# @app.route('/admin/leave_reports', methods=["GET"])
# def leave_reports_admin():
#     if "user_id" not in session:
#         flash("Please log in to continue", "error")
#         return redirect(url_for("login"))
   
#     # Detailed Leave Report Data (all leave requests)
#     leave_requests = Leave_Request.query.all()
#     history_leaves_data = []
#     for lr in leave_requests:
#         employee = Employee_Info.query.filter_by(empid=lr.empid).first()
#         history_leaves_data.append({
#             "id": lr.id,
#             "empid": lr.empid,
#             "employee_name": f"{employee.fname} {employee.lname}" if employee else "Unknown",
#             "dept": employee.dept if employee else "Unknown",
#             "leave_type": lr.leave_type,
#             "st_dt": lr.start_date.strftime("%Y-%m-%d") if lr.start_date else "",
#             "ed_dt": lr.end_date.strftime("%Y-%m-%d") if lr.end_date else "",
#             "total_days": float(lr.total_days),
#             "reason": lr.reason,
#             "status": lr.status,
#             "comments": lr.comments,
#             "applied_on": lr.applied_on.strftime("%Y-%m-%d %H:%M:%S") if lr.applied_on else "",
#             "approved_on": lr.approved_on.strftime("%Y-%m-%d %H:%M:%S") if hasattr(lr, "approved_on") and lr.approved_on else "",
#             "approved_by": lr.approver_id if lr.approver_id else ""
#         })
   
#     # Employee Leaves Count Data (each approved leave record, not grouped)
#     employee_leaves = db.session.query(
#         Employee_Info.empid,
#         Employee_Info.fname,
#         Employee_Info.lname,
#         Employee_Info.dept,
#         Leave_Request.leave_type,
#         Leave_Request.start_date,
#         Leave_Request.end_date,
#         Leave_Request.total_days,
#         Leave_Request.status,
#         Leave_Request.approver_id
#     ).join(Leave_Request, Employee_Info.empid == Leave_Request.empid) \
#      .filter(Leave_Request.status == 'Approved') \
#      .all()
   
#     employee_leaves_data = [{
#         "empid": emp.empid,
#         "employee_name": f"{emp.fname} {emp.lname}",
#         "dept": emp.dept,
#         "leave_type": emp.leave_type,
#         "st_dt": emp.start_date.strftime("%Y-%m-%d") if emp.start_date else "",
#         "ed_dt": emp.end_date.strftime("%Y-%m-%d") if emp.end_date else "",
#         "total_days": float(emp.total_days),
#         "status": emp.status,
#         "approved_by": emp.approver_id if emp.approver_id else ""
#     } for emp in employee_leaves]
   
#     # Leaves Report for Employee – for now we simply duplicate the detailed data.
#     employee_report_data = history_leaves_data
 
#     # List of Leave Approvers: distinct approvers from leave requests
#     approvers_query = db.session.query(Employee_Info.empid, Employee_Info.fname, Employee_Info.lname) \
#         .join(Leave_Request, Employee_Info.empid == Leave_Request.approver_id) \
#         .distinct().all()
#     approvers = [{
#         "empid": ap.empid,
#         "name": f"{ap.fname} {ap.lname}"
#     } for ap in approvers_query]
   
#     # For filtering dropdowns in the detailed report
#     departments = sorted(set([data["dept"] for data in history_leaves_data]))
#     employee_names = sorted(set([data["employee_name"] for data in history_leaves_data]))
   
#     return render_template(
#         "leave_reports_admin.html",
#         history_leaves=history_leaves_data,
#         employee_leaves=employee_leaves_data,
#         employeeReport=employee_report_data,
#         approvers=approvers,
#         departments=departments,
#         employee_names=employee_names,
#     )


# @app.route('/admin/leave_reports', methods=["GET"])
# def leave_reports_admin():
#     if "user_id" not in session:
#         flash("Please log in to continue", "error")
#         return redirect(url_for("login"))

#     # Fetch all leave requests
#     leave_requests = Leave_Request.query.all()
#     history_leaves_data = []
#     departments_set = set()
#     employee_names_set = set()
#     leave_types_set = set()

#     for lr in leave_requests:
#         employee = Employee_Info.query.filter_by(empid=lr.empid).first()
#         dept_name = employee.department.dept_name if employee and employee.department else "Unknown"
#         emp_name = f"{employee.fname} {employee.lname}" if employee else "Unknown"
#         leave_type = lr.leave_type

#         departments_set.add(dept_name)
#         employee_names_set.add(emp_name)
#         leave_types_set.add(leave_type)

#         history_leaves_data.append({
#             "id": lr.id,
#             "empid": lr.empid,
#             "employee_name": emp_name,
#             "dept": dept_name,
#             "leave_type": leave_type,
#             "st_dt": lr.start_date.strftime("%Y-%m-%d") if lr.start_date else "",
#             "ed_dt": lr.end_date.strftime("%Y-%m-%d") if lr.end_date else "",
#             "total_days": float(lr.total_days),
#             "reason": lr.reason,
#             "status": lr.status,
#             "comments": lr.comments,
#             "applied_on": lr.applied_on.strftime("%Y-%m-%d %H:%M:%S") if lr.applied_on else "",
#             "approved_by": lr.approver_id if lr.approver_id else ""
#         })

#     # Fetch all employees and their approver details using a self-join
#     employees_query = db.session.query(
#         Employee_Info.empid,
#         Employee_Info.fname,
#         Employee_Info.lname,
#         Department.dept_name.label('dept_name'),
#         Employee_Info.approver_id,
#         db.func.coalesce(db.session.query(Employee_Info.fname + " " + Employee_Info.lname)
#                          .filter(Employee_Info.empid == Employee_Info.approver_id)
#                          .scalar_subquery(), "N/A").label("approver_name")
#     ).join(Department, Employee_Info.dept_id == Department.id).all()

#     # List of Employees with Approvers
#     approvers = [{
#         "empid": emp.empid,
#         "employee_name": f"{emp.fname} {emp.lname}",
#         "dept": emp.dept_name,
#         "approver_id": emp.approver_id if emp.approver_id else "N/A",
#         "approver_name": emp.approver_name
#     } for emp in employees_query]

#     return render_template(
#         "leave_reports_admin.html",
#         history_leaves=history_leaves_data,
#         departments=sorted(departments_set),
#         employee_names=sorted(employee_names_set),
#         leave_types=sorted(leave_types_set),
#         approvers=approvers
#     )

# @app.route('/admin/leave_reports', methods=['GET'])
# def leave_reports_admin():
#     if "user_id" not in session:
#         return jsonify({"error": "Unauthorized"}), 401

#     # ---- Fetch leave requests ----
#     leave_requests = Leave_Request.query.all()
#     history_leaves_data = []
#     departments_set = set()
#     employee_names_set = set()
#     leave_types_set = set()

#     for lr in leave_requests:
#         employee = Employee_Info.query.filter_by(empid=lr.empid).first()
#         dept_name = employee.department.dept_name if employee and employee.department else "Unknown"
#         emp_name = f"{employee.fname} {employee.lname}" if employee else "Unknown"

#         departments_set.add(dept_name)
#         employee_names_set.add(emp_name)
#         leave_types_set.add(lr.leave_type)

#         history_leaves_data.append({
#             "id": lr.id,
#             "empid": lr.empid,
#             "employee_name": emp_name,
#             "dept": dept_name,
#             "leave_type": lr.leave_type,
#             "st_dt": lr.start_date.strftime("%Y-%m-%d") if lr.start_date else "",
#             "ed_dt": lr.end_date.strftime("%Y-%m-%d") if lr.end_date else "",
#             "total_days": float(lr.total_days),
#             "reason": lr.reason,
#             "status": lr.status,
#             "comments": lr.comments,
#             "applied_on": lr.applied_on.strftime("%Y-%m-%d %H:%M:%S") if lr.applied_on else "",
#             "approved_by": lr.approver_id if lr.approver_id else ""
#         })

#     # ---- Fetch approvers list ----
#     employees_query = db.session.query(
#         Employee_Info.empid,
#         Employee_Info.fname,
#         Employee_Info.lname,
#         Department.dept_name.label('dept_name'),
#         Employee_Info.approver_id,
#         db.func.coalesce(
#             db.session.query(Employee_Info.fname + " " + Employee_Info.lname)
#             .filter(Employee_Info.empid == Employee_Info.approver_id)
#             .scalar_subquery(),
#             "N/A"
#         ).label("approver_name")
#     ).join(Department, Employee_Info.dept_id == Department.id).all()

#     approvers = [{
#         "empid": emp.empid,
#         "employee_name": f"{emp.fname} {emp.lname}",
#         "dept": emp.dept_name,
#         "approver_id": emp.approver_id if emp.approver_id else "N/A",
#         "approver_name": emp.approver_name
#     } for emp in employees_query]

#     # ---- Always return JSON ----
#     return jsonify({
#         "history_leaves": history_leaves_data,
#         "departments": sorted(list(departments_set)),
#         "employee_names": sorted(list(employee_names_set)),
#         "leave_types": sorted(list(leave_types_set)),
#         "approvers": approvers
#     })



# =========================



@app.route("/api/admin/leave_reports", methods=["GET"])
def api_leave_reports():
    # Authentication
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    # ------------------ Fetch Leave Requests ------------------
    leave_requests = Leave_Request.query.all()

    history_leaves_data = []
    departments_set = set()
    employee_names_set = set()
    leave_types_set = set()

    for lr in leave_requests:
        employee = Employee_Info.query.filter_by(empid=lr.empid).first()
        dept_name = employee.department.dept_name if employee and employee.department else "Unknown"
        emp_name = f"{employee.fname} {employee.lname}" if employee else "Unknown"
        leave_type = lr.leave_type if lr.leave_type else "Unknown"

        departments_set.add(dept_name)
        employee_names_set.add(emp_name)
        leave_types_set.add(leave_type)

        history_leaves_data.append({
            "id": lr.id,
            "empid": lr.empid,
            "employee_name": emp_name,
            "dept": dept_name,
            "leave_type": leave_type,
            "st_dt": lr.start_date.strftime("%Y-%m-%d") if lr.start_date else "",
            "ed_dt": lr.end_date.strftime("%Y-%m-%d") if lr.end_date else "",
            "total_days": float(lr.total_days) if lr.total_days else 0,
            "reason": lr.reason,
            "status": lr.status,
            "approved_by": lr.approver_id or ""
        })

    # ------------------ Fetch Approvers List (Self Join) ------------------
    employees_query = db.session.query(
        Employee_Info.empid,
        Employee_Info.fname,
        Employee_Info.lname,
        Department.dept_name.label('dept_name'),
        Employee_Info.approver_id
    ).join(Department, Employee_Info.dept_id == Department.id).all()

    approvers = []

    for emp in employees_query:
        approver_emp = None
        if emp.approver_id:
            approver_emp = Employee_Info.query.filter_by(empid=emp.approver_id).first()

        approvers.append({
            "empid": emp.empid,
            "employee_name": f"{emp.fname} {emp.lname}",
            "dept": emp.dept_name,
            "approver_id": emp.approver_id if emp.approver_id else "N/A",
            "approver_name": f"{approver_emp.fname} {approver_emp.lname}" if approver_emp else "N/A"
        })

    # ------------------ Return JSON Response ------------------
    return jsonify({
        "history_leaves": history_leaves_data,
        "departments": sorted(departments_set),
        "employee_names": sorted(employee_names_set),
        "leave_types": sorted(leave_types_set),
        "approvers": approvers
    })




#########################Admin-END###################

# @app.route('/admin/client_reports', methods=['GET'])
# def client_reports():
#     if 'user_id' not in session:
#         return redirect(url_for('login'))

#     if session['user_id'] != 'N0482':
#         flash('You do not have permission to access the client reports page', 'error')
#         return redirect(url_for('login'))

#     try:
#         # Join Department to access dept_name
#         client_allocations = db.session.query(
#             Client_Info.client_name,
#             Department.dept_name,
#             func.count(Employee_Info.empid).label('employee_count')
#         ).join(
#             Client_Employee, Client_Info.clientID == Client_Employee.clientID
#         ).join(
#             Employee_Info, Client_Employee.empid == Employee_Info.empid
#         ).join(
#             Department, Employee_Info.dept_id == Department.id
#         ).group_by(
#             Client_Info.client_name, Department.dept_name
#         ).order_by(
#             Client_Info.client_name, Department.dept_name
#         ).all()

#         export = request.args.get('export', '').lower() == 'true'

#         if export:
#             output = io.StringIO()
#             writer = csv.writer(output)
#             writer.writerow(['Client Name', 'Department', 'Number of Employees'])

#             for allocation in client_allocations:
#                 writer.writerow([allocation.client_name, allocation.dept_name, allocation.employee_count])

#             output.seek(0)
#             response = make_response(output.getvalue())
#             response.headers["Content-Disposition"] = "attachment; filename=client_allocations.csv"
#             response.headers["Content-type"] = "text/csv"
#             return response

#         return render_template(
#             'client_reports.html',
#             session=session,
#             client_allocations=client_allocations
#         )

#     except Exception as e:
#         print(f"Error in client reports: {str(e)}")
#         flash('An error occurred while accessing client reports', 'error')
#         return render_template(
#             'client_reports.html',
#             session=session,
#             client_allocations=[]
#         )


# ==========================
# client_reports 3rd option

@app.route('/admin/client_reports', methods=['GET'])
def client_reports():
    # test = request.args.get("test", "false").lower()

    # if test != "true":   # normal behavior
    #     if 'user_id' not in session:
    #         return jsonify({"error": "Unauthorized"}), 401

    #     if session['user_id'] != 'N0482':
    #         return jsonify({"error": "No permission"}), 403
    try:
        client_allocations = db.session.query(
            Client_Info.client_name,
            Department.dept_name,
            func.count(Employee_Info.empid).label('employee_count')
        ).join(
            Client_Employee, Client_Info.clientID == Client_Employee.clientID
        ).join(
            Employee_Info, Client_Employee.empid == Employee_Info.empid
        ).join(
            Department, Employee_Info.dept_id == Department.id
        ).group_by(
            Client_Info.client_name, Department.dept_name
        ).order_by(
            Client_Info.client_name, Department.dept_name
        ).all()

        # ✅ Convert to list of dicts (JSON-serializable)
        results = [
            {
                "client_name": r.client_name,
                "dept_name": r.dept_name,
                "employee_count": r.employee_count
            }
            for r in client_allocations
        ]

        # CSV export
        export = request.args.get('export', '').lower() == 'true'
        if export:
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(['Client Name', 'Department', 'Number of Employees'])

            for row in results:
                writer.writerow([row['client_name'], row['dept_name'], row['employee_count']])

            output.seek(0)
            response = make_response(output.getvalue())
            response.headers["Content-Disposition"] = "attachment; filename=client_allocations.csv"
            response.headers["Content-type"] = "text/csv"
            return response

        # ✅ Return JSON directly (not nested in "data" key)
        return jsonify(results)

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": "Server error occurred"}), 500

# ==========================

 
 
# ============================
# Department Billability

# @app.route('/admin/department_billability', methods=['GET'])
# def get_department_billability():
#     start_date_str = request.args.get('start_date')
#     end_date_str = request.args.get('end_date')

#     try:
#         start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
#         end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None
#     except ValueError:
#         return jsonify({"error": "Invalid date format. Please use YYYY-MM-DD."}), 400

#     all_departments = Department.query.order_by(Department.dept_name).all()
#     department_billability = []

#     for dept in all_departments:
#         dept_empids = [emp.empid for emp in dept.employees]
#         total_count = len(dept_empids)
#         billable_count = 0
#         non_billable_count = 0

#         for empid in dept_empids:

#             project_query = db.session.query(Project_Info.project_billability).join(
#                 TimesheetEntry, Project_Info.id == TimesheetEntry.project_id
#             ).filter(TimesheetEntry.empid == empid)

#             if start_date:
#                 project_query = project_query.filter(TimesheetEntry.date >= start_date)
#             if end_date:
#                 project_query = project_query.filter(TimesheetEntry.date <= end_date)

#             project_billabilities = {row[0] for row in project_query.distinct().all()}

#             if "Billable" in project_billabilities:
#                 billable_count += 1
#             else:
#                 non_billable_count += 1

#         department_billability.append({
#             "department": dept.dept_name,
#             "billable_count": billable_count,
#             "non_billable_count": non_billable_count,
#             "total_count": total_count
#         })

#     return jsonify({
#         "start_date": start_date_str,
#         "end_date": end_date_str,
#         "data": department_billability
#     }), 200


# Department Billability + Experience

@app.route('/admin/department_billability', methods=['GET'])
def get_department_billability():
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None
    except ValueError:
        return jsonify({"error": "Invalid date format. Please use YYYY-MM-DD."}), 400

    today = date.today()

    all_departments = Department.query.order_by(Department.dept_name).all()
    department_billability = []

    for dept in all_departments:

        # BASE COUNTS
        total_employees = len(dept.employees)

        billable_count = 0
        non_billable_count = 0
        total_experience_years = 0

        # NEW COUNTS
        fresher_count = 0
        fresher_billable = 0
        fresher_non_billable = 0

        experienced_count = 0
        experienced_billable = 0
        experienced_non_billable = 0

        # LOOP EMPLOYEES
        for emp in dept.employees:

            # EXPERIENCE CALCULATION
            prev_exp = emp.prev_total_exp if emp.prev_total_exp else 0

            if emp.doj:
                days_after_joining = (today - emp.doj).days
                exp_after_joining = days_after_joining / 365
            else:
                exp_after_joining = 0

            total_exp = prev_exp + exp_after_joining
            total_experience_years += total_exp

            # CATEGORY CHECK
            is_fresher = total_exp < 2

            if is_fresher:
                fresher_count += 1
            else:
                experienced_count += 1

            # BILLABILITY CHECK
            project_query = db.session.query(Project_Info.project_billability).join(
                TimesheetEntry, Project_Info.id == TimesheetEntry.project_id
            ).filter(TimesheetEntry.empid == emp.empid)

            if start_date:
                project_query = project_query.filter(TimesheetEntry.date >= start_date)
            if end_date:
                project_query = project_query.filter(TimesheetEntry.date <= end_date)

            project_billabilities = {row[0] for row in project_query.distinct().all()}

            is_billable = "Billable" in project_billabilities

            # OLD TOTAL COUNTS
            if is_billable:
                billable_count += 1
            else:
                non_billable_count += 1

            # NEW CATEGORY COUNTS
            if is_fresher:
                if is_billable:
                    fresher_billable += 1
                else:
                    fresher_non_billable += 1
            else:
                if is_billable:
                    experienced_billable += 1
                else:
                    experienced_non_billable += 1

        # FINAL STRUCTURE
        department_billability.append({
            "department": dept.dept_name,

            # GENERAL
            "total_employees": total_employees,
            "billable_count": billable_count,
            "non_billable_count": non_billable_count,
            "total_experience_years": round(total_experience_years, 2),

            # FRESHER DATA
            "fresher_count": fresher_count,
            "fresher_billable": fresher_billable,
            "fresher_non_billable": fresher_non_billable,

            # EXPERIENCED DATA
            "experienced_count": experienced_count,
            "experienced_billable": experienced_billable,
            "experienced_non_billable": experienced_non_billable,

            # 🔵 NEW FIELDS ADDED (ONLY THESE TWO)
            "total_fresher": fresher_count,
            "total_experienced": experienced_count
        })

    return jsonify({
        "start_date": start_date_str,
        "end_date": end_date_str,
        "data": department_billability
    }), 200




# //return csv file for department billability
@app.route('/export_department_billability', methods=['GET'])
def export_department_billability():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    # Parse dates
    if start_date:
        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    if end_date:
        end_date = datetime.strptime(end_date, "%Y-%m-%d").date()

    # ✅ Get all departments
    all_departments = db.session.query(Department.dept_name).order_by(Department.dept_name).all()
    departments = [d[0] for d in all_departments]

    data = []

    for dept_name in departments:
        # ✅ Get all employees in this department
        dept_employees = (
            db.session.query(Employee_Info.empid)
            .join(Department, Employee_Info.dept_id == Department.id)
            .filter(Department.dept_name == dept_name)
            .all()
        )
        dept_empids = [emp[0] for emp in dept_employees]
        total_count = len(dept_empids)

        billable_count = 0
        non_billable_count = 0

        for empid in dept_empids:
            # ✅ Get all projects this employee logged timesheets for
            project_query = (
                db.session.query(Project_Info.project_billability)
                .join(TimesheetEntry, Project_Info.id == TimesheetEntry.project_id)
                .filter(TimesheetEntry.empid == empid)
            )

            # Apply date filter if given
            if start_date:
                project_query = project_query.filter(TimesheetEntry.date >= start_date)
            if end_date:
                project_query = project_query.filter(TimesheetEntry.date <= end_date)

            # Distinct project billabilities → e.g., {"Billable"} or {"Non-billable"}
            project_billabilities = {row[0] for row in project_query.distinct().all()}

            # ✅ Determine billable vs non-billable
            if "Billable" in project_billabilities:
                billable_count += 1
            else:
                non_billable_count += 1  # includes non-billable projects OR no timesheets

        data.append({
            "Department": dept_name,
            "Billable Count": billable_count,
            "Non-Billable Count": non_billable_count,
            "Total Count": total_count
        })

    # ✅ Convert to DataFrame for CSV
    df = pd.DataFrame(data)

    output = io.BytesIO()
    df.to_csv(output, index=False)
    output.seek(0)

    filename = f"department_billability_{datetime.now().strftime('%Y%m%d')}.csv"

    return send_file(
        output,
        mimetype="text/csv",
        as_attachment=True,
        download_name=filename
    )

# ============================




# ============================
# client_department_distribution

@app.route('/admin/client_department_distribution', methods=['GET'])
def client_department_distribution():
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    client_list = [client[0] for client in db.session.query(Client_Info.client_name)
                   .distinct().order_by(Client_Info.client_name).all()]

    departments = db.session.query(Department).order_by(Department.dept_name).all()

    client_department_counts = []

    for dept in departments:
        dept_empids = [emp.empid for emp in dept.employees]
        total_count = len(dept_empids)

        non_billable_count = 0
        for empid in dept_empids:
            employee_clients_query = db.session.query(Client_Info.client_name).join(
                Client_Employee, Client_Info.clientID == Client_Employee.clientID
            ).filter(Client_Employee.empid == empid)

            if start_date:
                employee_clients_query = employee_clients_query.filter(Client_Employee.start_date >= start_date)
            if end_date:
                employee_clients_query = employee_clients_query.filter(
                    or_(Client_Employee.start_date <= end_date, Client_Employee.start_date == None)
                )

            client_names = [client[0] for client in employee_clients_query.all()]
            if len(client_names) <= 1 and (not client_names or client_names[0] == 'Internal'):
                non_billable_count += 1

        client_counts_query = db.session.query(
            Client_Info.client_name,
            func.count(Employee_Info.empid).label('count')
        ).join(Client_Employee, Client_Info.clientID == Client_Employee.clientID) \
         .join(Employee_Info, Client_Employee.empid == Employee_Info.empid) \
         .filter(Employee_Info.dept_id == dept.id)

        if start_date:
            client_counts_query = client_counts_query.filter(Client_Employee.start_date >= start_date)
        if end_date:
            client_counts_query = client_counts_query.filter(
                or_(Client_Employee.start_date <= end_date, Client_Employee.start_date == None)
            )

        client_counts = client_counts_query.group_by(Client_Info.client_name).all()
        client_count_dict = {client.client_name: client.count for client in client_counts}

        row_data = {
            "department": dept.dept_name,
            "non_billable_count": non_billable_count,
            "total_count": total_count
        }

        for client in client_list:
            row_data[client] = client_count_dict.get(client, 0)

        client_department_counts.append(row_data)

    return jsonify({
        "client_list": client_list,
        "client_department_counts": client_department_counts,
        "start_date": start_date_str,
        "end_date": end_date_str
    })



@app.route('/export_client_department', methods=['GET'])
def export_client_department():
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None
    except ValueError:
        flash('Invalid date format. Please use YYYY-MM-DD format.', 'error')
        return redirect(url_for('client_department_distribution'))

    client_list = [client[0] for client in db.session.query(Client_Info.client_name).distinct().order_by(Client_Info.client_name).all()]
    departments = db.session.query(Department).order_by(Department.dept_name).all()

    output = StringIO()
    writer = csv.writer(output)

    # Header Row
    header = ['Department', 'Non-Billable Count', 'Total Count'] + client_list
    writer.writerow(header)

    for dept in departments:
        dept_empids = [emp.empid for emp in dept.employees]
        total_count = len(dept_empids)

        non_billable_count = 0
        for empid in dept_empids:
            employee_clients_query = db.session.query(Client_Info.client_name).join(
                Client_Employee, Client_Info.clientID == Client_Employee.clientID
            ).filter(Client_Employee.empid == empid)

            if start_date:
                employee_clients_query = employee_clients_query.filter(Client_Employee.start_date >= start_date)
            if end_date:
                employee_clients_query = employee_clients_query.filter(
                    or_(Client_Employee.start_date <= end_date, Client_Employee.start_date == None)
                )

            client_names = [client[0] for client in employee_clients_query.all()]
            if len(client_names) <= 1 and (not client_names or client_names[0] == 'Internal'):
                non_billable_count += 1

        client_counts_query = db.session.query(
            Client_Info.client_name,
            func.count(Employee_Info.empid).label('count')
        ).join(
            Client_Employee, Client_Info.clientID == Client_Employee.clientID
        ).join(
            Employee_Info, Client_Employee.empid == Employee_Info.empid
        ).filter(
            Employee_Info.dept_id == dept.id
        )

        if start_date:
            client_counts_query = client_counts_query.filter(Client_Employee.start_date >= start_date)
        if end_date:
            client_counts_query = client_counts_query.filter(
                or_(Client_Employee.start_date <= end_date, Client_Employee.start_date == None)
            )

        client_counts = client_counts_query.group_by(Client_Info.client_name).all()
        client_count_dict = {client.client_name: client.count for client in client_counts}

        row = [dept.dept_name, non_billable_count, total_count]
        for client in client_list:
            row.append(client_count_dict.get(client, 0))

        writer.writerow(row)

    output.seek(0)
    response = make_response(output.getvalue())
    response.headers['Content-Disposition'] = 'attachment; filename=client_department_distribution.csv'
    response.headers['Content-Type'] = 'text/csv'
    return response


from flask import jsonify
from sqlalchemy import func, case
from models import db, Employee_Info, Department

@app.route("/admin/workforce_skill_distribution", methods=["GET"])
def workforce_skill_distribution():
    experience = request.args.get("experience", "all")

    today = date.today()
    grouped = {}

    employees = (
        db.session.query(Employee_Info, Department.dept_name)
        .join(Department, Department.id == Employee_Info.dept_id)
        .all()
    )

    for emp, dept_name in employees:
        # ---------------- JOB ROLE (FIXED) ----------------
        job_role = emp.job_role.job_role if emp.job_role else "Unassigned"

        # ---------------- EXPERIENCE CALCULATION ----------------
        prev_exp = emp.prev_total_exp or 0
        doj_exp = ((today - emp.doj).days / 365) if emp.doj else 0
        total_exp = prev_exp + doj_exp
        is_fresher = total_exp < 2

        # ---------------- EXPERIENCE FILTER ----------------
        if experience == "fresher" and not is_fresher:
            continue
        if experience == "experienced" and is_fresher:
            continue
        
        # job_role = emp.job_role or "Unassigned"
        key = (dept_name, job_role)

        # key = (dept_name, core_skill)

        if key not in grouped:
            grouped[key] = {
                "department": dept_name,
                "job_role": job_role,
                "total_count": 0,
                "billable_count": 0,
                "non_billable_count": 0,
                "fresher_count": 0,
                "experienced_count": 0,
                "skill_details": set(),
            }

        # ---------------- BILLABILITY CHECK ----------------
        project_billabilities = {
            row[0]
            for row in (
                db.session.query(Project_Info.project_billability)
                .join(TimesheetEntry, Project_Info.id == TimesheetEntry.project_id)
                .filter(TimesheetEntry.empid == emp.empid)
                .distinct()
                .all()
            )
        }

        is_billable = "Billable" in project_billabilities

        # ---------------- COUNTS ----------------
        grouped[key]["total_count"] += 1

        if is_billable:
            grouped[key]["billable_count"] += 1
        else:
            grouped[key]["non_billable_count"] += 1

        if is_fresher:
            grouped[key]["fresher_count"] += 1
        else:
            grouped[key]["experienced_count"] += 1

        if emp.skill_details:
            grouped[key]["skill_details"].add(emp.skill_details)

    # ---------------- RESPONSE ----------------
    results = []
    for row in grouped.values():
        results.append({
            "department": row["department"],
            "job_role": row["job_role"],   # now STRING ✅
            "total_count": row["total_count"],
            "billable_count": row["billable_count"],
            "non_billable_count": row["non_billable_count"],
            "fresher_count": row["fresher_count"],
            "experienced_count": row["experienced_count"],
            # "skill_details": ", ".join(row["skill_details"]) if row["skill_details"] else None,
            "skill_details": ", ".join(row["skill_details"]) if row["skill_details"] else None,
        })

    return jsonify({
        "experience": experience,
        "data": results
    }), 200


@app.route("/admin/workforce_skill_distribution/export", methods=["GET"])
def export_workforce_skill_distribution():

    experience = request.args.get("experience", "all")

    today = date.today()
    grouped = {}

    employees = (
        db.session.query(Employee_Info, Department.dept_name)
        .join(Department, Department.id == Employee_Info.dept_id)
        .all()
    )

    for emp, dept_name in employees:
        core_skill = emp.core_skill or "Unassigned"

        prev_exp = emp.prev_total_exp or 0
        doj_exp = ((today - emp.doj).days / 365) if emp.doj else 0
        total_exp = prev_exp + doj_exp
        is_fresher = total_exp < 2

        if experience == "fresher" and not is_fresher:
            continue
        if experience == "experienced" and is_fresher:
            continue

        key = (dept_name, core_skill)

        if key not in grouped:
            grouped[key] = {
                "department": dept_name,
                "core_skill": core_skill,
                "total_count": 0,
                "skill_details": set(),
            }

        grouped[key]["total_count"] += 1

        if emp.skill_details:
            grouped[key]["skill_details"].add(emp.skill_details)

    def generate():
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow([
            "Department",
            "Core Skill",
            "Total Employees",
            "Skill Details"
        ])

        yield output.getvalue()
        output.seek(0)
        output.truncate(0)

        for row in grouped.values():
            writer.writerow([
                row["department"],
                row["core_skill"],
                row["total_count"],
                ", ".join(row["skill_details"]) if row["skill_details"] else ""
            ])

            yield output.getvalue()
            output.seek(0)
            output.truncate(0)

    return Response(
        generate(),
        mimetype="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=workforce_skill_distribution.csv"
        }
    )


@app.route("/admin/workforce_employee_details", methods=["GET"])
def workforce_employee_details():

    department_filter = request.args.get("department")
    core_skill_filter = request.args.get("core_skill")
    experience_filter = request.args.get("experience", "all")
    billable_filter = request.args.get("billable", "all")

    today = date.today()
    response = []
    billable_count = 0
    non_billable_count = 0


    employees = (
        db.session.query(Employee_Info, Department.dept_name)
        .join(Department, Department.id == Employee_Info.dept_id)
        .all()
    )

    for emp, dept_name in employees:

        # ---------------- EXPERIENCE ----------------
        prev_exp = emp.prev_total_exp or 0
        doj_exp = ((today - emp.doj).days / 365) if emp.doj else 0
        total_exp = prev_exp + doj_exp
        is_fresher = total_exp < 2

        if experience_filter == "fresher" and not is_fresher:
            continue
        if experience_filter == "experienced" and is_fresher:
            continue

        # ---------------- BILLABILITY ----------------
        project_billabilities = {
            row[0]
            for row in (
                db.session.query(Project_Info.project_billability)
                .join(TimesheetEntry, Project_Info.id == TimesheetEntry.project_id)
                .filter(TimesheetEntry.empid == emp.empid)
                .distinct()
                .all()
            )
        }

        is_billable = "Billable" in project_billabilities

        # ---- COUNT FOR SIDEBAR (DO NOT FILTER HERE) ----
        if is_billable:
            billable_count += 1
        else:
            non_billable_count += 1


        if billable_filter == "billable" and not is_billable:
            continue
        if billable_filter == "non-billable" and is_billable:
            continue

        # ---------------- DEPARTMENT FILTER ----------------
        if department_filter and dept_name != department_filter:
            continue

        # ---------------- CORE SKILL FILTER ----------------
        core_skill = emp.core_skill or "Unassigned"
        if core_skill_filter and core_skill != core_skill_filter:
            continue

        # ---------------- RESPONSE OBJECT ----------------
        response.append({
            "empid": emp.empid,
            "employee_name": f"{emp.fname} {emp.lname}" if emp.fname else None,
            "designation": emp.designation,
            "email": emp.email,
            "department": dept_name,
            "core_skill": core_skill,
            "skill_details": emp.skill_details,
            "experience_type": "Fresher" if is_fresher else "Experienced",
            "total_experience_years": round(total_exp, 2),
            "billable_status": "Billable" if is_billable else "Non-Billable"
        })

    return jsonify({
        "total_employees": len(response),
        "billable_count": billable_count,
        "non_billable_count": non_billable_count,
        "data": response
    }), 200



@app.route("/admin/workforce_employee_details/export", methods=["GET"])
def export_workforce_employee_details():

    department_filter = request.args.get("department")
    core_skill_filter = request.args.get("core_skill")
    experience_filter = request.args.get("experience", "all")
    billable_filter = request.args.get("billable", "all")

    today = date.today()

    output = io.StringIO()
    writer = csv.writer(output)

    # CSV HEADER
    writer.writerow([
        "Employee ID",
        "Employee Name",
        "Designation",
        "Email",
        "Total Experience (Years)",
        "Skill Set"
    ])

    employees = (
        db.session.query(Employee_Info, Department.dept_name)
        .join(Department, Department.id == Employee_Info.dept_id)
        .all()
    )

    print("EMPLOYEES COUNT:", len(employees))

    for emp, dept_name in employees:

        prev_exp = emp.prev_total_exp or 0
        doj_exp = ((today - emp.doj).days / 365) if emp.doj else 0
        total_exp = round(prev_exp + doj_exp, 2)
        is_fresher = total_exp < 2

        if experience_filter == "fresher" and not is_fresher:
            continue
        if experience_filter == "experienced" and is_fresher:
            continue

        project_billabilities = {
            row[0]
            for row in (
                db.session.query(Project_Info.project_billability)
                .join(TimesheetEntry, Project_Info.id == TimesheetEntry.project_id)
                .filter(TimesheetEntry.empid == emp.empid)
                .distinct()
                .all()
            )
        }
        is_billable = "Billable" in project_billabilities

        if billable_filter == "billable" and not is_billable:
            continue
        if billable_filter == "non-billable" and is_billable:
            continue

        core_skill = emp.core_skill or "Unassigned"
        if core_skill_filter and core_skill != core_skill_filter:
            continue

        if department_filter and dept_name != department_filter:
            continue

        # ✅ ALWAYS WRITE ROW
        writer.writerow([
            emp.empid or "",
            f"{emp.fname or ''} {emp.lname or ''}".strip(),
            emp.designation or "",
            emp.email or "",
            total_exp,
            emp.skill_details or ""
        ])

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={
            "Content-Disposition":
            "attachment; filename=workforce_employee_details.csv"
        }
    )








# ===========================




# ============================





# @app.route('/admin/client_department_distribution', methods=['GET'])
# def client_department_distribution():
#     start_date_str = request.args.get('start_date')
#     end_date_str = request.args.get('end_date')

#     try:
#         start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
#         end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None
#     except ValueError:
#         flash('Invalid date format. Please use YYYY-MM-DD format.', 'error')
#         start_date = end_date = None

#     client_list = [client[0] for client in db.session.query(Client_Info.client_name).distinct().order_by(Client_Info.client_name).all()]
#     departments = db.session.query(Department).order_by(Department.dept_name).all()

#     client_department_counts = []

#     for dept in departments:
#         dept_empids = [emp.empid for emp in dept.employees]
#         total_count = len(dept_empids)

#         non_billable_count = 0
#         for empid in dept_empids:
#             employee_clients_query = db.session.query(Client_Info.client_name).join(
#                 Client_Employee, Client_Info.clientID == Client_Employee.clientID
#             ).filter(Client_Employee.empid == empid)

#             if start_date:
#                 employee_clients_query = employee_clients_query.filter(Client_Employee.start_date >= start_date)
#             if end_date:
#                 employee_clients_query = employee_clients_query.filter(
#                     or_(Client_Employee.start_date <= end_date, Client_Employee.start_date == None)
#                 )

#             client_names = [client[0] for client in employee_clients_query.all()]
#             if len(client_names) <= 1 and (not client_names or client_names[0] == 'Internal'):
#                 non_billable_count += 1

#         client_counts_query = db.session.query(
#             Client_Info.client_name,
#             func.count(Employee_Info.empid).label('count')
#         ).join(
#             Client_Employee, Client_Info.clientID == Client_Employee.clientID
#         ).join(
#             Employee_Info, Client_Employee.empid == Employee_Info.empid
#         ).filter(
#             Employee_Info.dept_id == dept.id
#         )

#         if start_date:
#             client_counts_query = client_counts_query.filter(Client_Employee.start_date >= start_date)
#         if end_date:
#             client_counts_query = client_counts_query.filter(
#                 or_(Client_Employee.start_date <= end_date, Client_Employee.start_date == None)
#             )

#         client_counts = client_counts_query.group_by(Client_Info.client_name).all()
#         client_count_dict = {client.client_name: client.count for client in client_counts}

#         row_data = {
#             'department': dept.dept_name,
#             'non_billable_count': non_billable_count,
#             'total_count': total_count
#         }

#         for client in client_list:
#             row_data[client] = client_count_dict.get(client, 0)

#         client_department_counts.append(row_data)

#     return render_template('client_department_distribution.html',
#                            client_department_counts=client_department_counts,
#                            client_list=client_list,
#                            start_date=start_date_str,
#                            end_date=end_date_str)


# @app.route('/export_department_billability', methods=['GET'])
# def export_department_billability():
#     start_date = request.args.get('start_date')
#     end_date = request.args.get('end_date')

#     # Parse dates
#     if start_date:
#         start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
#     if end_date:
#         end_date = datetime.strptime(end_date, "%Y-%m-%d").date()

#     # ✅ Get all departments
#     all_departments = db.session.query(Department.dept_name).order_by(Department.dept_name).all()
#     departments = [d[0] for d in all_departments]

#     data = []

#     for dept_name in departments:
#         # ✅ Get all employees in this department
#         dept_employees = (
#             db.session.query(Employee_Info.empid)
#             .join(Department, Employee_Info.dept_id == Department.id)
#             .filter(Department.dept_name == dept_name)
#             .all()
#         )
#         dept_empids = [emp[0] for emp in dept_employees]
#         total_count = len(dept_empids)

#         billable_count = 0
#         non_billable_count = 0

#         for empid in dept_empids:
#             # ✅ Get all projects this employee logged timesheets for
#             project_query = (
#                 db.session.query(Project_Info.project_billability)
#                 .join(TimesheetEntry, Project_Info.id == TimesheetEntry.project_id)
#                 .filter(TimesheetEntry.empid == empid)
#             )

#             # Apply date filter if given
#             if start_date:
#                 project_query = project_query.filter(TimesheetEntry.date >= start_date)
#             if end_date:
#                 project_query = project_query.filter(TimesheetEntry.date <= end_date)

#             # Distinct project billabilities → e.g., {"Billable"} or {"Non-billable"}
#             project_billabilities = {row[0] for row in project_query.distinct().all()}

#             # ✅ Determine billable vs non-billable
#             if "Billable" in project_billabilities:
#                 billable_count += 1
#             else:
#                 non_billable_count += 1  # includes non-billable projects OR no timesheets

#         data.append({
#             "Department": dept_name,
#             "Billable Count": billable_count,
#             "Non-Billable Count": non_billable_count,
#             "Total Count": total_count
#         })

#     # ✅ Convert to DataFrame for CSV
#     df = pd.DataFrame(data)

#     output = io.BytesIO()
#     df.to_csv(output, index=False)
#     output.seek(0)

#     filename = f"department_billability_{datetime.now().strftime('%Y%m%d')}.csv"

#     return send_file(
#         output,
#         mimetype="text/csv",
#         as_attachment=True,
#         download_name=filename
#     )



# @app.route('/export_client_department', methods=['GET'])
# def export_client_department():
#     start_date_str = request.args.get('start_date')
#     end_date_str = request.args.get('end_date')

#     try:
#         start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
#         end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None
#     except ValueError:
#         flash('Invalid date format. Please use YYYY-MM-DD format.', 'error')
#         return redirect(url_for('client_department_distribution'))

#     client_list = [client[0] for client in db.session.query(Client_Info.client_name).distinct().order_by(Client_Info.client_name).all()]
#     departments = db.session.query(Department).order_by(Department.dept_name).all()

#     output = StringIO()
#     writer = csv.writer(output)

#     # Header Row
#     header = ['Department', 'Non-Billable Count', 'Total Count'] + client_list
#     writer.writerow(header)

#     for dept in departments:
#         dept_empids = [emp.empid for emp in dept.employees]
#         total_count = len(dept_empids)

#         non_billable_count = 0
#         for empid in dept_empids:
#             employee_clients_query = db.session.query(Client_Info.client_name).join(
#                 Client_Employee, Client_Info.clientID == Client_Employee.clientID
#             ).filter(Client_Employee.empid == empid)

#             if start_date:
#                 employee_clients_query = employee_clients_query.filter(Client_Employee.start_date >= start_date)
#             if end_date:
#                 employee_clients_query = employee_clients_query.filter(
#                     or_(Client_Employee.start_date <= end_date, Client_Employee.start_date == None)
#                 )

#             client_names = [client[0] for client in employee_clients_query.all()]
#             if len(client_names) <= 1 and (not client_names or client_names[0] == 'Internal'):
#                 non_billable_count += 1

#         client_counts_query = db.session.query(
#             Client_Info.client_name,
#             func.count(Employee_Info.empid).label('count')
#         ).join(
#             Client_Employee, Client_Info.clientID == Client_Employee.clientID
#         ).join(
#             Employee_Info, Client_Employee.empid == Employee_Info.empid
#         ).filter(
#             Employee_Info.dept_id == dept.id
#         )

#         if start_date:
#             client_counts_query = client_counts_query.filter(Client_Employee.start_date >= start_date)
#         if end_date:
#             client_counts_query = client_counts_query.filter(
#                 or_(Client_Employee.start_date <= end_date, Client_Employee.start_date == None)
#             )

#         client_counts = client_counts_query.group_by(Client_Info.client_name).all()
#         client_count_dict = {client.client_name: client.count for client in client_counts}

#         row = [dept.dept_name, non_billable_count, total_count]
#         for client in client_list:
#             row.append(client_count_dict.get(client, 0))

#         writer.writerow(row)

#     output.seek(0)
#     response = make_response(output.getvalue())
#     response.headers['Content-Disposition'] = 'attachment; filename=client_department_distribution.csv'
#     response.headers['Content-Type'] = 'text/csv'
#     return response
 
# @app.route('/admin/location_reports', methods=['GET'])
# def location_reports():
#     # Get counts by work_location
#     location_counts = db.session.query(
#         Employee_Info.location,
#         func.count(Employee_Info.empid).label('count')
#     ).group_by(
#         Employee_Info.location
#     ).all()
   
#     # Initialize the categorized location data
#     categorized_data = {
#         'Onsite': 0,
#         'Nearshore': 0,
#         'Offshore': 0
#     }
   
#     # Categorize each location into Onsite, Nearshore, or Offshore
#     for loc in location_counts:
#         location = loc.location.lower() if loc.location else 'unknown'
       
#         if 'onsite' in location or 'on-site' in location or 'local' in location:
#             categorized_data['Onsite'] += loc.count
#         elif 'nearshore' in location or 'near-shore' in location:
#             categorized_data['Nearshore'] += loc.count
#         else:
#             # Default to offshore for any other locations
#             categorized_data['Offshore'] += loc.count
   
#     # Transform to list format for template
#     location_data = [
#         {'location': category, 'count': count}
#         for category, count in categorized_data.items()
#     ]
   
#     # Calculate grand total
#     grand_total = sum(item['count'] for item in location_data)
   
#     # Check if export parameter is present (e.g., ?export=csv)
#     export_format = request.args.get('export')
   
#     if export_format == 'csv':
#         # Prepare data for CSV
#         data = [
#             {'Location': item['location'], 'Count': item['count']}
#             for item in location_data
#         ]
       
#         # Add grand total row
#         data.append({'Location': 'Grand Total', 'Count': grand_total})
       
#         # Create CSV file in memory
#         df = pd.DataFrame(data)
#         output = io.BytesIO()
#         df.to_csv(output, index=False)
#         output.seek(0)
       
#         # Generate filename with current date
#         filename = f"location_counts_{datetime.now().strftime('%Y%m%d')}.csv"
       
#         return send_file(
#             output,
#             mimetype='text/csv',
#             as_attachment=True,
#             download_name=filename
#         )
   
#     # Default: return HTML template
#     return render_template(
#         'admin_reports.html',
#         location_data=location_data,
#         grand_total=grand_total
#     )
 
# # # Employee Type Report (Contractor vs Employee)
# # @app.route('/admin/employee_type_reports', methods=['GET'])
# # def employee_type_reports():
#     # Get counts by employee_type - shared query for both formats
#     emp_type_counts = db.session.query(
#         Employee_Info.employee_type,
#         func.count(Employee_Info.empid).label('count')
#     ).group_by(
#         Employee_Info.employee_type
#     ).all()
   
#     # Transform and normalize to "Contractor" or "Employee" categories
#     emp_type_data = []
#     for emp_type in emp_type_counts:
#         type_name = emp_type.employee_type if emp_type.employee_type else 'Unspecified'
#         # Normalize to just "Contractor" or "Employee" categories
#         if 'contract' in type_name.lower():
#             category = 'Contractor'
#         else:
#             category = 'Employee'
#         emp_type_data.append({
#             'type': category,
#             'count': emp_type.count
#         })
   
#     # Consolidate counts for the same type
#     consolidated_data = {}
#     for item in emp_type_data:
#         if item['type'] in consolidated_data:
#             consolidated_data[item['type']] += item['count']
#         else:
#             consolidated_data[item['type']] = item['count']
   
#     # Calculate grand total
#     grand_total = sum(consolidated_data.values())
   
#     # Check if export parameter is present
#     export_format = request.args.get('export')
   
#     if export_format == 'csv':
#         # Format data for CSV
#         result_data = [{'Employee Type': k, 'Count': v} for k, v in consolidated_data.items()]
       
#         # Add grand total row
#         result_data.append({'Employee Type': 'Grand Total', 'Count': grand_total})
       
#         # Create CSV file in memory
#         df = pd.DataFrame(result_data)
#         output = io.BytesIO()
#         df.to_csv(output, index=False)
#         output.seek(0)
       
#         # Generate filename with current date
#         filename = f"employee_type_counts_{datetime.now().strftime('%Y%m%d')}.csv"
       
#         return send_file(
#             output,
#             mimetype='text/csv',
#             as_attachment=True,
#             download_name=filename
#         )
   
#     # Default: return HTML template with data formatted for template
#     result_data = [{'type': k, 'count': v} for k, v in consolidated_data.items()]
#     return render_template(
#         'admin_reports.html',
#         emp_type_data=result_data,
#         grand_total=grand_total
#     )

# @app.route('/admin/employee_type_reports', methods=['GET'])
# def employee_type_reports():
#     # Get counts by employee_type
#     emp_type_counts = db.session.query(
#         Employee_Info.employee_type,
#         func.count(Employee_Info.empid).label('count')
#     ).group_by(
#         Employee_Info.employee_type
#     ).all()
    
#     print(emp_type_counts)
#     # Initialize the categorized employee type data
#     categorized_data = {
#         'Contractor': 0,
#         'Employee': 0,
#         'Unspecified': 0
#     }
    
#     # Categorize each employee type
#     for emp_type in emp_type_counts:
#         type_name = emp_type.employee_type.lower() if emp_type.employee_type else 'unknown'
        
#         if 'contractor' in type_name or 'consultant' in type_name:
#             categorized_data['Contractor'] += emp_type.count
#         elif 'employee' in type_name or 'full-time' in type_name or 'fulltime' in type_name:
#             categorized_data['Employee'] += emp_type.count
#         else:
#             # Default to unspecified for any other types
#             categorized_data['Unspecified'] += emp_type.count
    
#     # Transform to list format for template
#     emp_type_data = [
#         {'type': category, 'count': count}
#         for category, count in categorized_data.items()
#     ]
    
#     # Calculate grand total
#     grand_total = sum(item['count'] for item in emp_type_data)
    
#     # Check if export parameter is present (e.g., ?export=csv)
#     export_format = request.args.get('export')
    
#     if export_format == 'csv':
#         # Prepare data for CSV
#         data = [
#             {'Employee Type': item['type'], 'Count': item['count']}
#             for item in emp_type_data
#         ]
        
#         # Add grand total row
#         data.append({'Employee Type': 'Grand Total', 'Count': grand_total})
        
#         # Create CSV file in memory
#         df = pd.DataFrame(data)
#         output = io.BytesIO()
#         df.to_csv(output, index=False)
#         output.seek(0)
        
#         # Generate filename with current date
#         filename = f"employee_type_counts_{datetime.now().strftime('%Y%m%d')}.csv"
        
#         return send_file(
#             output,
#             mimetype='text/csv',
#             as_attachment=True,
#             download_name=filename
#         )
    
#     # Default: return HTML template
#     return render_template(
#         'admin_reports.html',
#         emp_type_data=emp_type_data,
#         grand_total=grand_total
#     )

 
# # Billability and Utilization Report
# @app.route('/admin/billability_reports', methods=['GET'])
# def billability_reports():
#     # Get all employees
#     all_employees = db.session.query(Employee_Info.empid).all()
#     total_employees = len(all_employees)
#     all_empids = [emp[0] for emp in all_employees]
   
#     billable_count = 0
#     non_billable_count = 0
   
#     for empid in all_empids:
#         # Get all clients for this employee
#         employee_clients = db.session.query(Client_Info.client_name).join(
#             Client_Employee, Client_Info.clientID == Client_Employee.clientID
#         ).filter(Client_Employee.empid == empid).all()
       
#         client_names = [client[0] for client in employee_clients]
       
#         # Check if employee is billable (has clients other than 'Internal')
#         if len(client_names) > 1 or (len(client_names) == 1 and client_names[0] != 'Internal'):
#             billable_count += 1
#         else:
#             non_billable_count += 1
   
#     # Calculate utilization percentage
#     utilization_percentage = (billable_count / total_employees * 100) if total_employees > 0 else 0
#     rounded_percentage = round(utilization_percentage, 2)
   
#     # Check if export parameter is present
#     export_format = request.args.get('export')
   
#     if export_format == 'csv':
#         # Format data for CSV
#         data = [
#             {'Category': 'Billable', 'Count': billable_count},
#             {'Category': 'Non-Billable', 'Count': non_billable_count},
#             {'Category': 'Grand Total', 'Count': total_employees},
#             {'Category': 'Utilization %', 'Count': f"{rounded_percentage}%"}
#         ]
       
#         # Create CSV file in memory
#         df = pd.DataFrame(data)
#         output = io.BytesIO()
#         df.to_csv(output, index=False)
#         output.seek(0)
       
#         # Generate filename with current date
#         filename = f"billability_data_{datetime.now().strftime('%Y%m%d')}.csv"
       
#         return send_file(
#             output,
#             mimetype='text/csv',
#             as_attachment=True,
#             download_name=filename
#         )
   
#     # Default: return HTML template
#     billability_data = {
#         'billable_count': billable_count,
#         'non_billable_count': non_billable_count,
#         'total_count': total_employees,
#         'utilization_percentage': rounded_percentage
#     }
   
#     return render_template('admin_reports.html', billability_data=billability_data)


# @app.route('/admin/reports', methods=['GET'])
# def admin_reports():
#     # Get location data
#     location_data = get_location_data()
#     location_grand_total = sum(item['count'] for item in location_data)
    
#     # Get employee type data
#     emp_type_data = get_employee_type_data()
#     emp_type_grand_total = sum(item['count'] for item in emp_type_data)
    
#     # Get billability data
#     billability_data = get_billability_data()
    
#     return render_template(
#         'admin_reports.html',
#         location_data=location_data,
#         location_grand_total=location_grand_total,
#         emp_type_data=emp_type_data,
#         emp_type_grand_total=emp_type_grand_total,
#         billability_data=billability_data
#     )


# def get_location_data():
#     # Get counts by work_location
#     location_counts = db.session.query(
#         Employee_Info.location,
#         func.count(Employee_Info.empid).label('count')
#     ).group_by(
#         Employee_Info.location
#     ).all()
   
#     # Initialize the categorized location data
#     categorized_data = {
#         'Onsite': 0,
#         'Nearshore': 0,
#         'Offshore': 0
#     }
   
#     # Categorize each location into Onsite, Nearshore, or Offshore
#     for loc in location_counts:
#         location = loc.location.lower() if loc.location else 'unknown'
       
#         if 'onsite' in location or 'on-site' in location or 'local' in location:
#             categorized_data['Onsite'] += loc.count
#         elif 'nearshore' in location or 'near-shore' in location:
#             categorized_data['Nearshore'] += loc.count
#         else:
#             # Default to offshore for any other locations
#             categorized_data['Offshore'] += loc.count
   
#     # Transform to list format for template
#     location_data = [
#         {'location': category, 'count': count}
#         for category, count in categorized_data.items()
#     ]
    
#     return location_data

# def get_employee_type_data():
#     # Get counts by employee_type
#     emp_type_counts = db.session.query(
#         Employee_Info.employee_type,
#         func.count(Employee_Info.empid).label('count')
#     ).group_by(
#         Employee_Info.employee_type
#     ).all()
    
#     # Print for debugging
#     print(f"Raw employee type counts: {emp_type_counts}")
    
#     # Initialize the categorized employee type data
#     categorized_data = {
#         'Contractor': 0,
#         'Employee': 0,
#         'Unspecified': 0
#     }
    
#     # Categorize each employee type
#     for emp_type in emp_type_counts:
#         type_name = emp_type.employee_type.lower() if emp_type.employee_type else 'unknown'
#         print(f"Processing employee type: {type_name}")
        
#         if 'contractor' in type_name or 'consultant' in type_name:
#             categorized_data['Contractor'] += emp_type.count
#         elif 'employee' in type_name or 'full-time' in type_name or 'fulltime' in type_name:
#             categorized_data['Employee'] += emp_type.count
#         else:
#             # Default to unspecified for any other types
#             categorized_data['Unspecified'] += emp_type.count
    
#     # Transform to list format for template
#     emp_type_data = [
#         {'type': category, 'count': count}
#         for category, count in categorized_data.items()
#         if count > 0  # Only include categories with non-zero counts
#     ]
    
#     print(f"Processed employee type data: {emp_type_data}")
#     return emp_type_data

# def get_billability_data():
#     # Get all employees
#     all_employees = db.session.query(Employee_Info.empid).all()
#     total_employees = len(all_employees)
#     all_empids = [emp[0] for emp in all_employees]
   
#     billable_count = 0
#     non_billable_count = 0
   
#     for empid in all_empids:
#         # Get all clients for this employee
#         employee_clients = db.session.query(Client_Info.client_name).join(
#             Client_Employee, Client_Info.clientID == Client_Employee.clientID
#         ).filter(Client_Employee.empid == empid).all()
       
#         client_names = [client[0] for client in employee_clients]
       
#         # Check if employee is billable (has clients other than 'Internal')
#         if len(client_names) > 1 or (len(client_names) == 1 and client_names[0].lower() != 'internal'):
#             billable_count += 1
#         else:
#             non_billable_count += 1
   
#     # Calculate utilization percentage
#     utilization_percentage = (billable_count / total_employees * 100) if total_employees > 0 else 0
#     rounded_percentage = round(utilization_percentage, 2)
   
#     # Format for template
#     billability_data = {
#         'billable_count': billable_count,
#         'non_billable_count': non_billable_count,
#         'total_count': total_employees,
#         'utilization_percentage': rounded_percentage
#     }
    
#     print(f"Billability data: {billability_data}")
#     return billability_data

# Remove the first commented out implementation and keep the second one for employee_type_reports

@app.route('/admin/location_reports', methods=['GET'])
def location_reports():
    # Get location data
    location_data = get_location_data()
    
    # Calculate grand total
    grand_total = sum(item['count'] for item in location_data)
    
    # Check if export parameter is present (e.g., ?export=csv)
    export_format = request.args.get('export')
    
    if export_format == 'csv':
        # Prepare data for CSV
        data = [
            {'Location': item['lo/admincation'], 'Count': item['count']}
            for item in location_data
        ]
        
        # Add grand total row
        data.append({'Location': 'Grand Total', 'Count': grand_total})
        
        # Create CSV file in memory
        df = pd.DataFrame(data)
        output = io.BytesIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        # Generate filename with current date
        filename = f"location_counts_{datetime.now().strftime('%Y%m%d')}.csv"
        
        return send_file(
            output,
            mimetype='text/csv',
            as_attachment=True,
            download_name=filename
        )
    
    # Otherwise redirect to the main reports page
    return redirect(url_for('admin_reports'))



@app.route('/admin/employee_type_reports', methods=['GET'])
def employee_type_reports():
    # Get employee type data
    emp_type_data = get_employee_type_data()
    
    # Calculate grand total
    grand_total = sum(item['count'] for item in emp_type_data)
    
    # Check if export parameter is present (e.g., ?export=csv)
    export_format = request.args.get('export')
    
    if export_format == 'csv':
        # Prepare data for CSV
        data = [
            {'Employee Type': item['type'], 'Count': item['count']}
            for item in emp_type_data
        ]
        
        # Add grand total row
        data.append({'Employee Type': 'Grand Total', 'Count': grand_total})
        
        # Create CSV file in memory
        df = pd.DataFrame(data)
        output = io.BytesIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        # Generate filename with current date
        filename = f"employee_type_counts_{datetime.now().strftime('%Y%m%d')}.csv"
        
        return send_file(
            output,
            mimetype='text/csv',
            as_attachment=True,
            download_name=filename
        )
    
    # Otherwise redirect to the main reports page
    return redirect(url_for('admin_reports'))

@app.route('/admin/billability_reports', methods=['GET'])
def billability_reports():
    # Get billability data
    billability_data = get_billability_data()
    
    # Check if export parameter is present
    export_format = request.args.get('export')
    
    if export_format == 'csv':
        # Format data for CSV
        data = [
            {'Category': 'Billable', 'Count': billability_data['billable_count']},
            {'Category': 'Non-Billable', 'Count': billability_data['non_billable_count']},
            {'Category': 'Grand Total', 'Count': billability_data['total_count']},
            {'Category': 'Utilization %', 'Count': f"{billability_data['utilization_percentage']}%"}
        ]
        
        # Create CSV file in memory
        df = pd.DataFrame(data)
        output = io.BytesIO()
        df.to_csv(output, index=False)
        output.seek(0)
        
        # Generate filename with current date
        filename = f"billability_data_{datetime.now().strftime('%Y%m%d')}.csv"
        
        return send_file(
            output,
            mimetype='text/csv',
            as_attachment=True,
            download_name=filename
        )
    
    # Otherwise redirect to the main reports page
    return redirect(url_for('admin_reports'))



# @app.route('/admin/reports/data', methods=['GET'])
# def admin_reports_data():
#     try:
#         # ------- LOCATION DATA -------
#         location_data = get_location_data()
#         location_grand_total = sum(item['count'] for item in location_data)

#         # ------- EMPLOYEE TYPE DATA -------
#         emp_type_data = get_employee_type_data()
#         emp_type_grand_total = sum(item['count'] for item in emp_type_data) if emp_type_data else 0

#         # ------- BILLABILITY DATA -------
#         billability_data = get_billability_data()

#         return jsonify({
#             "status": "success",
#             "location_report": {
#                 "data": location_data,
#                 "total": location_grand_total
#             },
#             "employee_type_report": {
#                 "data": emp_type_data,
#                 "total": emp_type_grand_total
#             },
#             "billability_report": billability_data
#         }), 200

#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500

# ============================


from flask import jsonify  # make sure this import exists
@app.route('/admin/reports', methods=['GET'])
def admin_reports():
    try:
        # Get all data types
        location_data = get_location_data()
        location_grand_total = sum(item['count'] for item in location_data)

        emp_type_data = get_employee_type_data()
        emp_type_grand_total = (
            sum(item['count'] for item in emp_type_data) if emp_type_data else 0
        )

        billability_data = get_billability_data()

        # ✅ Return JSON instead of rendering a template
        return jsonify({
            "status": "success",
            "location_report": {
                "data": location_data,
                "total": location_grand_total
            },
            "employee_type_report": {
                "data": emp_type_data,
                "total": emp_type_grand_total
            },
            "billability_report": billability_data
        }), 200

    except Exception as e:
        # log in console
        print("ERROR in /admin/reports:", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500



def get_location_data():
    # Get counts by work_location
    location_counts = db.session.query(
        Employee_Info.location,
        func.count(Employee_Info.empid).label('count')
    ).group_by(
        Employee_Info.location
    ).all()
   
    # Initialize the categorized location data
    categorized_data = {
        'Onsite': 0,
        'Nearshore': 0,
        'Offshore': 0
    }
   
    # Categorize each location into Onsite, Nearshore, or Offshore
    for loc in location_counts:
        location = loc.location.lower() if loc.location else 'unknown'
       
        if 'onsite' in location or 'on-site' in location or 'local' in location:
            categorized_data['Onsite'] += loc.count
        elif 'nearshore' in location or 'near-shore' in location:
            categorized_data['Nearshore'] += loc.count
        else:
            # Default to offshore for any other locations
            categorized_data['Offshore'] += loc.count
   
    # Transform to list format for template
    location_data = [
        {'location': category, 'count': count}
        for category, count in categorized_data.items()
    ]
    
    return location_data

def get_employee_type_data():
    # Get counts by employee_type
    emp_type_counts = db.session.query(
        Employee_Info.employee_type,
        func.count(Employee_Info.empid).label('count')
    ).group_by(
        Employee_Info.employee_type
    ).all()
    
    # Print for debugging
    print(f"Raw employee type counts: {emp_type_counts}")
    
    # Initialize the categorized employee type data
    categorized_data = {
        'Contractor': 0,
        'Employee': 0,
        'Unspecified': 0
    }
    
    # Categorize each employee type
    for emp_type in emp_type_counts:
        type_name = emp_type.employee_type.lower() if emp_type.employee_type else 'unknown'
        print(f"Processing employee type: {type_name}")
        
        if 'contractor' in type_name or 'consultant' in type_name:
            categorized_data['Contractor'] += emp_type.count
        elif 'employee' in type_name or 'full-time' in type_name or 'fulltime' in type_name:
            categorized_data['Employee'] += emp_type.count
        else:
            # Default to unspecified for any other types
            categorized_data['Unspecified'] += emp_type.count
    
    # Transform to list format for template
    emp_type_data = [
        {'type': category, 'count': count}
        for category, count in categorized_data.items()
        if count > 0  # Only include categories with non-zero counts
    ]
    
    print(f"Processed employee type data: {emp_type_data}")
    return emp_type_data

def get_billability_data(start_date=None, end_date=None):
    # Get all employees
    all_employees = db.session.query(Employee_Info.empid).all()
    total_employees = len(all_employees)
    all_empids = [emp[0] for emp in all_employees]

    billable_count = 0
    non_billable_count = 0

    for empid in all_empids:
        # ✅ Get all projects this employee logged in timesheet
        project_query = (
            db.session.query(Project_Info.project_billability)
            .join(TimesheetEntry, Project_Info.id == TimesheetEntry.project_id)
            .filter(TimesheetEntry.empid == empid)
        )

        # Apply optional date filters
        if start_date:
            project_query = project_query.filter(TimesheetEntry.date >= start_date)
        if end_date:
            project_query = project_query.filter(TimesheetEntry.date <= end_date)

        # Distinct project billabilities → e.g., {"Billable"} or {"Non-billable"}
        project_billabilities = {row[0] for row in project_query.distinct().all()}

        # ✅ Decide employee billability
        if "Billable" in project_billabilities:
            billable_count += 1
        else:
            non_billable_count += 1  # includes employees with only non-billable projects OR no timesheets

    utilization_percentage = (billable_count / total_employees * 100) if total_employees > 0 else 0

    billability_data = {
        "billable_count": billable_count,
        "non_billable_count": non_billable_count,
        "total_count": total_employees,
        "utilization_percentage": round(utilization_percentage, 2)
    }

    print(f"Billability data: {billability_data}")
    return billability_data

# ================================
################################################################################

# @app.route('/timesheet_reports')
# def timesheet_reports():
#     start_date = request.args.get('start_date')
#     end_date = request.args.get('end_date')
#     department = request.args.get('department')  # ✅ single value from dropdown

#     query = db.session.query(
#         Employee_Info.empid,
#         (Employee_Info.fname + literal(' ') + Employee_Info.lname).label('emp_name'),
#         Department.dept_name.label('department'),
#         Client_Info.client_name,
#         Project_Info.project_name,
#         Project_Info.project_billability,
#         TimesheetEntry.hours_worked,
#         TimesheetEntry.work_date
#     ).join(
#         Department, Employee_Info.dept_id == Department.id
#     ).join(
#         TimesheetEntry, TimesheetEntry.empid == Employee_Info.empid
#     ).join(
#         Project_Info, TimesheetEntry.project_id == Project_Info.id
#     ).join(
#         Client_Info, Project_Info.client_id == Client_Info.clientID
#     )

#     # Apply date filters
#     if start_date:
#         query = query.filter(TimesheetEntry.work_date >= start_date)
#     if end_date:
#         query = query.filter(TimesheetEntry.work_date <= end_date)

#     # Apply department filter (if selected)
#     if department:
#         query = query.filter(Department.dept_name == department)

#     results = query.order_by(TimesheetEntry.work_date.desc()).all()

#     # Load department list for dropdown
#     departments = db.session.query(Department.dept_name).distinct().order_by(Department.dept_name).all()
#     department_list = [d[0] for d in departments]

#     return render_template(
#         'timesheet_reports.html',
#         data=results,
#         departments=department_list,
#         selected_department=department,  # ✅ used in the dropdown to keep selection
#         start_date=start_date,
#         end_date=end_date
#     )
   
   
# @app.route('/download_timesheet_report', methods=['GET'])
# def download_timesheet_report():
#     start_date = request.args.get('start_date')
#     end_date = request.args.get('end_date')
#     department = request.args.get('department')

#     query = db.session.query(
#         Employee_Info.empid,
#         (Employee_Info.fname + literal(' ') + Employee_Info.lname).label('emp_name'),
#         Department.dept_name.label('department'),
#         Client_Info.client_name,
#         Project_Info.project_name,
#         Project_Info.project_billability,
#         TimesheetEntry.hours_worked,
#         TimesheetEntry.work_date
#     ).join(
#         TimesheetEntry, TimesheetEntry.empid == Employee_Info.empid
#     ).join(
#         Project_Info, TimesheetEntry.project_id == Project_Info.id
#     ).join(
#         Client_Info, Project_Info.client_id == Client_Info.clientID
#     ).join(
#         Department, Employee_Info.dept_id == Department.id
#     )

#     if start_date:
#         query = query.filter(TimesheetEntry.work_date >= start_date)
#     if end_date:
#         query = query.filter(TimesheetEntry.work_date <= end_date)
#     if department:
#         query = query.filter(Department.dept_name == department)

#     results = query.order_by(TimesheetEntry.work_date.desc()).all()

#     output = io.StringIO()
#     writer = csv.writer(output)

#     # Write CSV Header
#     writer.writerow([
#         'Employee ID', 'Employee Name', 'Department',
#         'Client Name', 'Project Name', 'Billability',
#         'Hours Worked', 'Work Date'
#     ])

#     # Write CSV Rows
#     for row in results:
#         writer.writerow([
#             row.empid,
#             row.emp_name,
#             row.department,
#             row.client_name,
#             row.project_name,
#             row.project_billability,
#             row.hours_worked,
#             row.work_date.strftime("%Y-%m-%d") if row.work_date else ""
#         ])

#     response = make_response(output.getvalue())
#     response.headers["Content-Disposition"] = "attachment; filename=timesheet_report.csv"
#     response.headers["Content-type"] = "text/csv"
#     return response




# ================================
# Timesheet Reports - JSON version and CSV download

@app.route('/timesheet_reports')
def timesheet_reports():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    department = request.args.get('department')  # single value from dropdown
    print("here IIIIIIIII am")
    
    query = db.session.query(
        Employee_Info.empid,
        (Employee_Info.fname + literal(' ') + Employee_Info.lname).label('emp_name'),
        Department.dept_name.label('department'),
        Client_Info.client_name,
        Project_Info.project_name,
        Project_Info.project_billability,
        TimesheetEntry.hours_worked,
        TimesheetEntry.work_date
    ).join(
        Department, Employee_Info.dept_id == Department.id
    ).join(
        TimesheetEntry, TimesheetEntry.empid == Employee_Info.empid
    ).join(
        Project_Info, TimesheetEntry.project_id == Project_Info.id
    ).join(
        Client_Info, Project_Info.client_id == Client_Info.clientID
    )

    # Apply date filters
    if start_date:
        query = query.filter(TimesheetEntry.work_date >= start_date)
    if end_date:
        query = query.filter(TimesheetEntry.work_date <= end_date)

    # Apply department filter (if selected)
    if department:
        query = query.filter(Department.dept_name == department)

    results = query.order_by(TimesheetEntry.work_date.desc()).all()

    # Load department list for dropdown
    departments = db.session.query(Department.dept_name).distinct().order_by(Department.dept_name).all()
    department_list = [d[0] for d in departments]

    # Convert results to JSON
    data_list = []
    for row in results:
        data_list.append({
            "empid": row.empid,
            "emp_name": row.emp_name,
            "department": row.department,
            "client_name": row.client_name,
            "project_name": row.project_name,
            "project_billability": row.project_billability,
            "hours_worked": row.hours_worked,
            "work_date": str(row.work_date)
        })
    # Return JSON instead of template — NOTHING extra added
    return jsonify({
        "data": data_list,
        "departments": department_list,
        "selected_department": department,
        "start_date": start_date,
        "end_date": end_date
    })
   
   
@app.route('/download_timesheet_report', methods=['GET'])
def download_timesheet_report():
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    department = request.args.get('department')

    query = db.session.query(
        Employee_Info.empid,
        (func.trim(Employee_Info.fname) + ' ' + func.trim(Employee_Info.lname)).label('emp_name'),
        Department.dept_name.label('department'),
        Client_Info.client_name,
        Project_Info.project_name,
        Project_Info.project_billability,
        TimesheetEntry.hours_worked,
        TimesheetEntry.work_date
    ).join(
        TimesheetEntry, TimesheetEntry.empid == Employee_Info.empid
    ).join(
        Project_Info, TimesheetEntry.project_id == Project_Info.id
    ).join(
        Client_Info, Project_Info.client_id == Client_Info.clientID
    ).join(
        Department, Employee_Info.dept_id == Department.id
    )

    if start_date:
        query = query.filter(TimesheetEntry.work_date >= start_date)
    if end_date:
        query = query.filter(TimesheetEntry.work_date <= end_date)
    if department:
        query = query.filter(Department.dept_name == department)

    results = query.order_by(TimesheetEntry.work_date.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        'Employee ID', 'Employee Name', 'Department',
        'Client Name', 'Project Name', 'Billability',
        'Hours Worked', 'Work Date'
    ])

    for row in results:
        writer.writerow([
            row.empid,
            row.emp_name,
            row.department,
            row.client_name,
            row.project_name,
            row.project_billability,
            row.hours_worked,
            row.work_date.strftime("%Y-%m-%d") if row.work_date else ""
        ])

    response = make_response(output.getvalue())
    response.headers["Content-Disposition"] = "attachment; filename=timesheet_report.csv"
    response.headers["Content-type"] = "text/csv"
    return response


# ================================

# @app.route('/timesheet_approvers')
# def timesheet_approvers():
#     Emp = aliased(Employee_Info)
#     Approver = aliased(Employee_Info)

#     # Get filters from query params
#     department = request.args.get('department')
#     approver = request.args.get('approver')

#     # Base query with dept join
#     query = db.session.query(
#         Emp.empid.label('employee_id'),
#         (Emp.fname + literal(' ') + Emp.lname).label('employee_name'),
#         Approver.empid.label('approver_id'),
#         (Approver.fname + literal(' ') + Approver.lname).label('approver_name'),
#         Department.dept_name.label('department')
#     ).join(
#         Department, Emp.dept_id == Department.id
#     ).join(
#         Approver, Emp.approver_id == Approver.empid
#     )

#     # Apply department filter
#     if department:
#         query = query.filter(Department.dept_name == department)

#     # Apply approver filter
#     if approver:
#         query = query.filter((Approver.fname + literal(' ') + Approver.lname) == approver)

#     results = query.order_by(Emp.empid).all()

#     # Fetch all department names for dropdown
#     departments = [d.dept_name for d in db.session.query(Department.dept_name).distinct().order_by(Department.dept_name).all()]

#     # Fetch all unique approver names for dropdown
#     approvers_query = db.session.query(
#         (Employee_Info.fname + literal(' ') + Employee_Info.lname).label('approver_name')
#     ).filter(Employee_Info.empid.in_(
#         db.session.query(Employee_Info.approver_id).distinct().filter(Employee_Info.approver_id.isnot(None))
#     ))
#     approvers = [a.approver_name for a in approvers_query.all()]

#     return render_template(
#         'timesheet_approvers.html',
#         data=results,
#         departments=departments,
#         approvers=approvers
#     )

 
# @app.route('/download_timesheet_approvers')
# def download_timesheet_approvers():
#     Emp = aliased(Employee_Info)
#     Approver = aliased(Employee_Info)

#     # Join with Departments
#     results = db.session.query(
#         Emp.empid.label('employee_id'),
#         (Emp.fname + literal(' ') + Emp.lname).label('employee_name'),
#         Approver.empid.label('approver_id'),
#         (Approver.fname + literal(' ') + Approver.lname).label('approver_name'),
#         Department.dept_name.label('department')
#     ).join(
#         Approver, Emp.approver_id == Approver.empid
#     ).outerjoin(
#         Department, Emp.dept_id == Department.id
#     ).order_by(
#         Emp.empid
#     ).all()

#     # Prepare CSV in-memory
#     si = StringIO()
#     cw = csv.writer(si)
#     # Write CSV Header
#     cw.writerow(['Employee ID', 'Employee Name', 'Approver ID', 'Approver Name', 'Department'])

#     # Write data rows
#     for row in results:
#         cw.writerow(row)

#     # Return response as downloadable CSV
#     output = si.getvalue()
#     return Response(
#         output,
#         mimetype='text/csv',
#         headers={"Content-Disposition": "attachment;filename=timesheet_approvers.csv"}
#     )



# ===============================
# Timesheet Approvers - JSON version and CSV download

@app.route('/timesheet_approvers', methods=['GET'])
def timesheet_approvers():
    Emp = aliased(Employee_Info)
    Approver = aliased(Employee_Info)

    department = request.args.get('department')
    approver = request.args.get('approver')

    query = db.session.query(
        Emp.empid.label('employee_id'),
        (Emp.fname + literal(' ') + Emp.lname).label('employee_name'),
        Approver.empid.label('approver_id'),
        (Approver.fname + literal(' ') + Approver.lname).label('approver_name'),
        Department.dept_name.label('department')
    ).join(
        Department, Emp.dept_id == Department.id
    ).outerjoin(
        Approver, Emp.approver_id == Approver.empid
    )

    # ✅ Department filter (unchanged)
    if department:
        query = query.filter(Department.dept_name == department)

    # ✅ Approver filter (ID OR Name)
    if approver:
        full_name = (Approver.fname + literal(' ') + Approver.lname)

        query = query.filter(
            or_(
                Approver.empid == approver,
                full_name.ilike(f"%{approver}%")
            )
        )

    results = query.order_by(Emp.empid).all()

    data_list = [
        {
            "employee_id": r.employee_id,
            "employee_name": r.employee_name,
            "approver_id": r.approver_id,
            "approver_name": r.approver_name,
            "department": r.department
        }
        for r in results
    ]

    # ✅ Department dropdown
    departments = [
        d.dept_name for d in
        db.session.query(Department.dept_name)
        .distinct()
        .order_by(Department.dept_name)
        .all()
    ]

    # ✅ Approver dropdown (same as before)
    approvers = [
        a[0] for a in db.session.query(
            (Employee_Info.fname + literal(' ') + Employee_Info.lname)
        )
        .filter(Employee_Info.approver_id.isnot(None))
        .distinct()
        .all()
    ]

    return jsonify({
        "success": True,
        "total": len(data_list),
        "results": data_list,
        "departments": departments,
        "approvers": approvers,
        "selected_department": department,
        "selected_approver": approver
    }), 200

 
@app.route('/download_timesheet_approvers', methods=['GET'])
def download_timesheet_approvers():
    Emp = aliased(Employee_Info)
    Approver = aliased(Employee_Info)

    department = request.args.get('department')
    approver = request.args.get('approver')

    query = db.session.query(
        Emp.empid.label('employee_id'),
        (Emp.fname + literal(' ') + Emp.lname).label('employee_name'),
        Approver.empid.label('approver_id'),
        (Approver.fname + literal(' ') + Approver.lname).label('approver_name'),
        Department.dept_name.label('department')
    ).join(
        Approver, Emp.approver_id == Approver.empid
    ).outerjoin(
        Department, Emp.dept_id == Department.id
    )

    # ✅ Department filter (same logic as listing API)
    if department:
        query = query.filter(Department.dept_name == department)

    # ✅ Approver filter (ID OR Name)
    if approver:
        full_name = (Approver.fname + literal(' ') + Approver.lname)
        query = query.filter(
            or_(
                Approver.empid == approver,
                full_name.ilike(f"%{approver}%")
            )
        )

    query = query.order_by(Emp.empid)

    results = query.all()

    # CSV creation
    si = StringIO()
    cw = csv.writer(si)

    # Header (UNCHANGED)
    cw.writerow([
        'Employee ID',
        'Employee Name',
        'Approver ID',
        'Approver Name',
        'Department'
    ])

    # Rows (UNCHANGED)
    for r in results:
        cw.writerow([
            r.employee_id,
            r.employee_name,
            r.approver_id,
            r.approver_name,
            r.department
        ])

    output = si.getvalue()

    return Response(
        output,
        mimetype='text/csv',
        headers={
            "Content-Disposition": f"attachment; filename=timesheet_approvers_{datetime.now().strftime('%Y%m%d')}.csv"
        }
    )


# ================================

# @app.route('/timesheet_defaulters')
# def timesheet_defaulters():
#     start_date = request.args.get("start_date")
#     end_date = request.args.get("end_date")
#     department = request.args.get("department")
#     status = request.args.get("status")

#     # ✅ Fetch department names for the dropdown
#     departments = [d.dept_name for d in db.session.query(Department.dept_name).distinct().order_by(Department.dept_name).all()]

#     # ✅ Aliased for clarity
#     emp = aliased(Employee_Info)
#     dept = aliased(Department)

#     query = db.session.query(
#         emp.empid,
#         (emp.fname + literal(' ') + emp.lname).label('emp_name'),
#         dept.dept_name.label('department'),
#         Client_Info.client_name,
#         TimesheetEntry.work_date,
#         Timesheet.status
#     ).outerjoin(
#         Timesheet, emp.empid == Timesheet.empid
#     ).outerjoin(
#         TimesheetEntry, emp.empid == TimesheetEntry.empid
#     ).outerjoin(
#         Project_Info, TimesheetEntry.project_id == Project_Info.id
#     ).outerjoin(
#         Client_Info, Project_Info.client_id == Client_Info.clientID  # ✅ fixed
#     ).outerjoin(
#         dept, emp.dept_id == dept.id
#     )

#     # Filters
#     if start_date and end_date:
#         query = query.filter(TimesheetEntry.work_date.between(start_date, end_date))

#     if department:
#         query = query.filter(dept.dept_name == department)

#     if status:
#         query = query.filter(Timesheet.status == status)
#     else:
#         query = query.filter(Timesheet.status.in_(["Submitted", "Approved", "Not Submitted"]))

#     results = query.order_by(TimesheetEntry.work_date.desc()).all()

#     return render_template(
#         'timesheet_defaulter.html',
#         data=results,
#         departments=departments,
#         selected_department=department,
#         start_date=start_date,
#         end_date=end_date,
#         selected_status=status
#     )

 
# @app.route('/download_timesheet_defaulters')
# def download_timesheet_defaulters():
#     start_date = request.args.get("start_date")
#     end_date = request.args.get("end_date")
#     department = request.args.get("department")
#     status = request.args.get("status")

#     query = db.session.query(
#         Employee_Info.empid,
#         (Employee_Info.fname + literal(' ') + Employee_Info.lname).label('emp_name'),
#         Department.dept_name.label('department'),
#         Client_Info.client_name,
#         TimesheetEntry.work_date,
#         Timesheet.status
#     ).outerjoin(
#         Department, Employee_Info.dept_id == Department.id
#     ).outerjoin(
#         Timesheet, Employee_Info.empid == Timesheet.empid
#     ).outerjoin(
#         TimesheetEntry, Employee_Info.empid == TimesheetEntry.empid
#     ).outerjoin(
#         Project_Info, TimesheetEntry.project_id == Project_Info.id
#     ).outerjoin(
#         Client_Info, Project_Info.client_id == Client_Info.clientID  # ✅ correct join
#     )

#     if start_date and end_date:
#         query = query.filter(TimesheetEntry.work_date.between(start_date, end_date))

#     if department:
#         query = query.filter(Department.dept_name == department)

#     if status:
#         query = query.filter(Timesheet.status == status)
#     else:
#         query = query.filter(Timesheet.status.in_(["Submitted", "Approved", "Not Submitted"]))

#     results = query.order_by(TimesheetEntry.work_date.desc()).all()

#     def generate():
#         yield "Employee ID,Employee Name,Department,Client Name,Work Date,Status\n"
#         for row in results:
#             yield f"{row.empid},{row.emp_name},{row.department or ''},{row.client_name or ''},{row.work_date},{row.status or 'Not Submitted'}\n"

#     response = Response(generate(), mimetype="text/csv")
#     response.headers["Content-Disposition"] = "attachment; filename=timesheet_defaulters.csv"
#     return response



# ===============================
# Timesheet Defaulters - JSON version and CSV download

@app.route('/timesheet_defaulters', methods=['GET'])
def timesheet_defaulters():
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    department = request.args.get("department")
    status = request.args.get("status")
 
    # Fetch Department List for Filters
    departments = [d.dept_name for d in db.session.query(Department.dept_name).distinct().order_by(Department.dept_name).all()]
 
    emp = aliased(Employee_Info)
    dept = aliased(Department)
 
    query = db.session.query(
        emp.empid,
        (emp.fname + literal(' ') + emp.lname).label('emp_name'),
        dept.dept_name.label('department'),
        Client_Info.client_name,
        TimesheetEntry.work_date,
        Timesheet.status
    ).outerjoin(
        Timesheet, emp.empid == Timesheet.empid
    ).outerjoin(
        TimesheetEntry, emp.empid == TimesheetEntry.empid
    ).outerjoin(
        Project_Info, TimesheetEntry.project_id == Project_Info.id
    ).outerjoin(
        Client_Info, Project_Info.client_id == Client_Info.clientID
    ).outerjoin(
        dept, emp.dept_id == dept.id
    )
 
    # Apply Filters
    if start_date and end_date:
        query = query.filter(TimesheetEntry.work_date.between(start_date, end_date))
 
    if department:
        query = query.filter(dept.dept_name == department)
 
    if status:
        query = query.filter(Timesheet.status == status)
    else:
        query = query.filter(Timesheet.status.in_(["Submitted", "Approved", "Not Submitted"]))
 
    results = query.order_by(TimesheetEntry.work_date.desc()).all()
 
    defaulters_list = []
    for r in results:
        defaulters_list.append({
            "empid": r.empid,
            "emp_name": r.emp_name,
            "department": r.department,
            "client_name": r.client_name,
            "work_date": r.work_date.strftime('%Y-%m-%d') if r.work_date else None,
            "status": r.status
        })
 
    return jsonify({
        "success": True,
        "departments": departments,
        "selected_department": department,
        "start_date": start_date,
        "end_date": end_date,
        "selected_status": status,
        "data": defaulters_list
    }), 200
 
 
@app.route('/download_timesheet_defaulters')
def download_timesheet_defaulters():
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    department = request.args.get("department")
    status = request.args.get("status")
 
    query = db.session.query(
        Employee_Info.empid,
        (Employee_Info.fname + literal(' ') + Employee_Info.lname).label('emp_name'),
        Department.dept_name.label('department'),
        Client_Info.client_name,
        TimesheetEntry.work_date,
        Timesheet.status
    ).outerjoin(
        Department, Employee_Info.dept_id == Department.id
    ).outerjoin(
        Timesheet, Employee_Info.empid == Timesheet.empid
    ).outerjoin(
        TimesheetEntry, Employee_Info.empid == TimesheetEntry.empid
    ).outerjoin(
        Project_Info, TimesheetEntry.project_id == Project_Info.id
    ).outerjoin(
        Client_Info, Project_Info.client_id == Client_Info.clientID
    )
 
    # Filters
    if start_date and end_date:
        query = query.filter(TimesheetEntry.work_date.between(start_date, end_date))
    if department:
        query = query.filter(Department.dept_name == department)
    if status:
        query = query.filter(Timesheet.status == status)
    else:
        query = query.filter(Timesheet.status.in_(["Submitted", "Approved", "Not Submitted"]))
 
    results = query.order_by(TimesheetEntry.work_date.desc()).all()
 
    def generate():
        yield "Employee ID,Employee Name,Department,Client Name,Work Date,Status\n"
        for row in results:
            work_date = row.work_date.strftime('%Y-%m-%d') if row.work_date else ""
            status = row.status if row.status else "Not Submitted"
            yield f"{row.empid},{row.emp_name},{row.department or ''},{row.client_name or ''},{work_date},{status}\n"
 
    response = Response(generate(), mimetype="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=timesheet_defaulters.csv"
    return response
 

# ================================


# @app.route("/admin/utilization", methods=["GET", "POST"])
# def utilization():
#     if "user_id" not in session:
#         flash("Please log in to continue", "error")
#         return redirect(url_for("admin_dashboard"))

#     # Approvers list (direct + indirect)
#     approvers_query = (
#         db.session.query(Employee_Info.empid, Employee_Info.fname, Employee_Info.lname)
#         .filter(Employee_Info.empid.in_(
#             db.session.query(Employee_Info.approver_id).filter(Employee_Info.approver_id.isnot(None))
#         ))
#         .distinct()
#         .all()
#     )
#     approvers_list = [{"empid": a.empid, "name": f"{a.fname} {a.lname}"} for a in approvers_query]
#     approvers_list.insert(0, {"empid": "all", "name": "All Approvers"})

#     departments_list = Department.query.order_by(Department.dept_name).all()
#     clients_list = Client_Info.query.order_by(Client_Info.client_name).all()

#     selected_approver_id = None
#     selected_department = None
#     selected_client = "All"
#     start_date = None
#     end_date = None
#     employees = []
#     emp_client_data = {}
#     total_billable_hours = 0
#     total_non_billable_hours = 0

#     if request.method == "POST":
#         selected_approver_id = request.form.get('approver_id')
#         selected_department = request.form.get('department')
#         selected_client = request.form.get('client') or "All"
#         start_date = request.form.get('start_date')
#         end_date = request.form.get('end_date')

#         if not start_date or not end_date:
#             flash("Please provide both start and end date.", "warning")
#             return redirect(url_for("utilization"))

#         start_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
#         end_obj = datetime.strptime(end_date, "%Y-%m-%d").date()

#         # Filter employees by approver
#         if selected_approver_id and selected_approver_id != "all":
#             first_level = Employee_Info.query.filter_by(approver_id=selected_approver_id).all()
#             first_ids = [e.empid for e in first_level]
#             second_level = Employee_Info.query.filter(Employee_Info.approver_id.in_(first_ids)).all()
#             employees = first_level + second_level
#         else:
#             employees = Employee_Info.query.all()

#         # Department filter
#         if selected_department and selected_department != "All":
#             employees = [
#                 e for e in employees
#                 if e.department and e.department.dept_name == selected_department
#             ]

#         emp_ids = [e.empid for e in employees]

#         # Get client assignments
#         assignment_query = (
#             db.session.query(
#                 Client_Employee.empid,
#                 Client_Info.client_name,
#                 Client_Employee.start_date,
#                 Client_Employee.end_date,
#                 Client_Info.daily_hours,
#                 Client_Info.clientID
#             )
#             .join(Client_Info, Client_Employee.clientID == Client_Info.clientID)
#             .filter(Client_Employee.empid.in_(emp_ids))
#         )

#         if selected_client != "All":
#             assignment_query = assignment_query.filter(Client_Info.client_name == selected_client)

#         client_assignments = assignment_query.all()

#         for empid, client_name, client_start, client_end, daily_hours, _ in client_assignments:
#             if empid not in emp_client_data:
#                 emp_client_data[empid] = {}

#             # Adjust assignment range within selected date range
#             client_start_adj = max(start_obj, client_start) if client_start else start_obj
#             client_end_adj = min(end_obj, client_end) if client_end else end_obj

#             # Fetch holidays from Holidays table
#             holiday_dates = set(
#                 d[0] for d in db.session.query(Holidays.start_date)
#                 .filter(Holidays.start_date.between(client_start_adj, client_end_adj))
#                 .all()
#             )

#             # Count valid weekdays (Mon–Fri) excluding holidays
#             working_days = sum(
#                 1
#                 for i in range((client_end_adj - client_start_adj).days + 1)
#                 if (client_start_adj + timedelta(days=i)).weekday() < 5
#                 and (client_start_adj + timedelta(days=i)) not in holiday_dates
#             )

#             daily_hrs = daily_hours or 8  # Default to 8 if not set
#             billable = working_days * daily_hrs

#             emp_client_data[empid][client_name] = {
#                 "start_date": client_start,
#                 "end_date": client_end,
#                 "billable": billable,
#                 "billed": 0,
#                 "non_billable": 0,
#                 "billed_utilization": 0.0,
#                 "non_billable_utilization": 0.0
#             }

#         # Timesheet entries (filtered by client if needed)
#         entry_query = (
#             db.session.query(
#                 TimesheetEntry.empid,
#                 TimesheetEntry.hours_worked,
#                 Project_Info.project_billability,
#                 Client_Info.client_name,
#                 Project_Info.project_name  # ✅ added
#             )
#             .join(Project_Info, TimesheetEntry.project_id == Project_Info.id)
#             .join(Client_Info, Project_Info.client_id == Client_Info.clientID)
#             .join(Timesheet, TimesheetEntry.timesheet_id == Timesheet.id)
#             .filter(TimesheetEntry.empid.in_(emp_ids))
#             .filter(TimesheetEntry.work_date.between(start_obj, end_obj))
#             .filter(Timesheet.status != "Rejected")
#         )


#         if selected_client != "All":
#             entry_query = entry_query.filter(Client_Info.client_name == selected_client)

#         timesheet_entries = entry_query.all()

#         for emp_id, hours, billability, project_client_name, project_name in timesheet_entries:
#             billability = (billability or "").strip().lower()
#             if emp_id in emp_client_data and project_client_name in emp_client_data[emp_id]:
#                 if "projects" not in emp_client_data[emp_id][project_client_name]:
#                     emp_client_data[emp_id][project_client_name]["projects"] = set()

#                 if project_name:
#                     emp_client_data[emp_id][project_client_name]["projects"].add(project_name)

#                 if billability == "billable":
#                     emp_client_data[emp_id][project_client_name]["billed"] += hours
#                 elif billability == "non-billable":
#                     emp_client_data[emp_id][project_client_name]["non_billable"] += hours

#         for emp_clients in emp_client_data.values():
#             for client in emp_clients.values():
#                 billable_hours = client["billable"]
#                 billed_hours = client["billed"]
#                 non_billable_hours = client["non_billable"]

#                 if billable_hours > 0:
#                     client["billed_utilization"] = round((billed_hours / billable_hours) * 100, 2)
#                     client["non_billable_utilization"] = round((non_billable_hours / billable_hours) * 100, 2)

#         total_billable_hours = sum(c["billable"] for emp in emp_client_data.values() for c in emp.values())
#         total_non_billable_hours = sum(c["non_billable"] for emp in emp_client_data.values() for c in emp.values())

#     return render_template(
#         "utilization.html",
#         approvers_list=approvers_list,
#         selected_approver_id=selected_approver_id,
#         departments_list=departments_list,
#         selected_department=selected_department,
#         clients_list=clients_list,
#         selected_client=selected_client,
#         start_date=start_date,
#         end_date=end_date,
#         employees=employees,
#         emp_client_data=emp_client_data,
#         total_billable_hours=total_billable_hours,
#         total_non_billable_hours=total_non_billable_hours
#     )


@app.route("/admin/utilization", methods=["GET"])
def utilization_filters():
    if "user_id" not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401
 
    departments_list = Department.query.order_by(Department.dept_name).all()
    clients_list = Client_Info.query.order_by(Client_Info.client_name).all()
 
    return jsonify({
        "status": "success",
        "departments_list": [
            {"dept_name": d.dept_name} for d in departments_list
        ],
        "clients_list": [
            {"client_name": c.client_name} for c in clients_list
        ]
    }), 200
 

@app.route("/admin/utilization", methods=["POST"])
def api_utilization():
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"}), 401
 
    selected_department = request.form.get("department", "All")
    selected_client = request.form.get("client", "All")
    start_date = request.form.get("start_date")
    end_date = request.form.get("end_date")
 
    if not start_date or not end_date:
        return jsonify({"status": "success", "data": []}), 200
 
    # Convert date to object
    start_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
    end_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
 
    # Filter employees first
    employees_query = Employee_Info.query
 
    if selected_department != "All":
        employees_query = (
            employees_query.join(Department, Employee_Info.dept_id == Department.id)
            .filter(Department.dept_name == selected_department)
        )
 
    if selected_client != "All":
        employees_query = (
            employees_query.join(Client_Employee, Employee_Info.empid == Client_Employee.empid)
            .join(Client_Info, Client_Employee.clientID == Client_Info.clientID)
            .filter(Client_Info.client_name == selected_client)
        )
 
    employees = employees_query.all()
    emp_ids = [e.empid for e in employees]
 
    if not emp_ids:
        return jsonify({"status": "success", "data": []}), 200
 
    # Fetch client assignments with date filtering
    assignment_query = (
        db.session.query(Client_Employee, Client_Info)
        .join(Client_Info, Client_Employee.clientID == Client_Info.clientID)
        .filter(Client_Employee.empid.in_(emp_ids))
        .filter(Client_Employee.start_date <= end_obj)
        .filter((Client_Employee.end_date == None) | (Client_Employee.end_date >= start_obj))
    )
 
    if selected_client != "All":
        assignment_query = assignment_query.filter(Client_Info.client_name == selected_client)
 
    emp_client_data = {}
 
    for a, client in assignment_query:
        emp_client_data.setdefault(a.empid, {})
 
        client_start = max(start_obj, a.start_date)
        client_end = min(end_obj, a.end_date) if a.end_date else end_obj
 
        working_days = sum(
            1
            for i in range((client_end - client_start).days + 1)
            if (client_start + timedelta(days=i)).weekday() < 5
        )
 
        daily_hrs = client.daily_hours or 8
        billable = working_days * daily_hrs
 
        emp_client_data[a.empid][client.client_name] = {
            "start_date": client_start.strftime("%Y-%m-%d"),
            "end_date": client_end.strftime("%Y-%m-%d") if a.end_date else "Ongoing",
            "billable": billable,
            "billed": 0,
            "non_billable": 0,
            "projects": [],
        }
 
    # Timesheet entries
    entry_query = (
        db.session.query(
            TimesheetEntry.empid,
            TimesheetEntry.hours_worked,
            Project_Info.project_billability,
            Client_Info.client_name,
            Project_Info.project_name,
        )
        .select_from(TimesheetEntry)
        .join(Project_Info, TimesheetEntry.project_id == Project_Info.id)
        .join(Client_Info, Project_Info.client_id == Client_Info.clientID)
        .join(Timesheet, TimesheetEntry.timesheet_id == Timesheet.id)
        .filter(TimesheetEntry.empid.in_(emp_ids))
        .filter(TimesheetEntry.work_date.between(start_obj, end_obj))
        .filter(Timesheet.status != "Rejected")
    )
 
    if selected_client != "All":
        entry_query = entry_query.filter(Client_Info.client_name == selected_client)
 
    for emp_id, hrs, bill, cname, pname in entry_query:
        if emp_id not in emp_client_data or cname not in emp_client_data[emp_id]:
            continue
 
        data = emp_client_data[emp_id][cname]
 
        if pname and pname not in data["projects"]:
            data["projects"].append(pname)
 
        if (bill or "").lower() == "billable":
            data["billed"] += hrs
        else:
            data["non_billable"] += hrs
 
    # Build final results
    result = []
    for emp in employees:
        empid = emp.empid
        if empid not in emp_client_data:
            continue
 
        for client, d in emp_client_data[empid].items():
            billable = d["billable"]
            billed = d["billed"]
            non_billable = d["non_billable"]
 
            result.append({
                "employee_name": f"{emp.fname} {emp.lname}",
                "department": emp.department.dept_name if emp.department else "N/A",
                "client_name": client,
                "projects": d["projects"],
                "client_start_end": f"{d['start_date']} - {d['end_date']}",
                "billed_hours": billed,
                "non_billable_hours": non_billable,
                "billable_hours": billable,
                "billed_utilization": round((billed / billable) * 100, 2) if billable else 0,
                "non_billable_utilization": round((non_billable / billable) * 100, 2) if billable else 0,
            })
 
    return jsonify({"status": "success", "data": result}), 200


# @app.route("/admin/utilization/download", methods=["GET", "POST"])
# def download_utilization():
#     if "user_id" not in session:
#         flash("Please log in to continue", "error")
#         return redirect(url_for("login"))

#     # --- Get filters ---
#     start_date = request.args.get("start_date") or request.form.get("start_date")
#     end_date = request.args.get("end_date") or request.form.get("end_date")
#     selected_department = request.args.get("department") or request.form.get("department")
#     selected_employee = request.args.get("employee") or request.form.get("employee")
#     selected_client = request.args.get("client") or request.form.get("client")
    
#     print("DEBUG: selected_department =", selected_department)
#     print("DEBUG: selected_employee =", selected_employee)
#     print("DEBUG: selected_client =", selected_client)


#     if not start_date or not end_date:
#         flash("Start date and end date are required to download utilization report.", "error")
#         return redirect(url_for("utilization"))

#     start_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
#     end_obj = datetime.strptime(end_date, "%Y-%m-%d").date()

#     # --- Filter employees first ---
#     employees_query = Employee_Info.query

#     if selected_department and selected_department != "All":
#         employees_query = employees_query.join(Department).filter(Department.dept_name == selected_department)

#     if selected_employee and selected_employee != "All":
#         employees_query = employees_query.filter(Employee_Info.empid == selected_employee)

#     if selected_client and selected_client != "All":
#         employees_query = employees_query.join(Client_Employee, Employee_Info.empid == Client_Employee.empid) \
#                                          .join(Client_Info, Client_Employee.clientID == Client_Info.clientID) \
#                                          .filter(Client_Info.client_name == selected_client)

#     employees = employees_query.all()
#     emp_ids = [e.empid for e in employees]
#     print("DEBUG: emp_ids =", emp_ids)
 

#     if not employees:
#         flash("No employees found for the selected filters.", "error")
#         return redirect(url_for("utilization"))

#     # --- Holidays ---
#     holiday_ranges = db.session.query(Holidays.start_date, Holidays.end_date).filter(
#         and_(Holidays.end_date >= start_obj, Holidays.start_date <= end_obj)
#     ).all()

#     holiday_dates = set()
#     for start, end in holiday_ranges:
#         current = start
#         while current <= end:
#             holiday_dates.add(current)
#             current += timedelta(days=1)

#     # --- Client Assignments ---
#     client_assignments_query = (
#         db.session.query(
#             Client_Employee.empid,
#             Client_Info.client_name,
#             Client_Employee.start_date,
#             Client_Employee.end_date,
#             Client_Info.daily_hours,
#             Client_Info.clientID
#         )
#         .join(Client_Info, Client_Employee.clientID == Client_Info.clientID)
#         .filter(Client_Employee.empid.in_(emp_ids))
#     )

#     if selected_client and selected_client != "All":
#         client_assignments_query = client_assignments_query.filter(Client_Info.client_name == selected_client)

#     client_assignments = client_assignments_query.all()

#     emp_client_data = {}

#     for empid, client_name, client_start, client_end, daily_hours, _ in client_assignments:
#         # enforce client filter (handles casing/spacing issues)
#         if selected_client and selected_client != "All" and client_name.strip().lower() != selected_client.strip().lower():
#             continue

#         if empid not in emp_client_data:
#             emp_client_data[empid] = {}

#         client_start_adj = max(start_obj, client_start) if client_start else start_obj
#         client_end_adj = min(end_obj, client_end) if client_end else end_obj

#         working_days = sum(
#             1
#             for i in range((client_end_adj - client_start_adj).days + 1)
#             if (client_start_adj + timedelta(days=i)).weekday() < 5
#             and (client_start_adj + timedelta(days=i)) not in holiday_dates
#         )

#         daily_hrs = daily_hours or 8
#         billable = working_days * daily_hrs

#         emp_client_data[empid][client_name] = {
#             "start_date": client_start.strftime('%Y-%m-%d') if client_start else "N/A",
#             "end_date": client_end.strftime('%Y-%m-%d') if client_end else "Present",
#             "billable": billable,
#             "non_billable": 0,
#             "billed": 0,
#             "billed_utilization": 0.0,
#             "non_billable_utilization": 0.0,
#             "projects": []
#         }

#     # --- Timesheet Entries ---
#     timesheet_entries_query = (
#         db.session.query(
#             TimesheetEntry.empid,
#             TimesheetEntry.hours_worked,
#             Project_Info.project_billability,
#             Client_Info.client_name,
#             Project_Info.project_name
#         )
#         .join(Project_Info, TimesheetEntry.project_id == Project_Info.id)
#         .join(Client_Info, Project_Info.client_id == Client_Info.clientID)
#         .join(Timesheet, TimesheetEntry.timesheet_id == Timesheet.id)
#         .filter(TimesheetEntry.empid.in_(emp_ids))
#         .filter(TimesheetEntry.work_date.between(start_obj, end_obj))
#         .filter(Timesheet.status != "Rejected")
#     )

#     if selected_client and selected_client != "All":
#         timesheet_entries_query = timesheet_entries_query.filter(Client_Info.client_name == selected_client)

#     timesheet_entries = timesheet_entries_query.all()

#     for emp_id, hours, billability, client_name, project_name in timesheet_entries:
#         # enforce client filter (handles casing/spacing issues)
#         if selected_client and selected_client != "All" and client_name.strip().lower() != selected_client.strip().lower():
#             continue

#         billability = (billability or "").strip().lower()
#         client_name = (client_name or "").strip()

#         if emp_id in emp_client_data:
#             for stored_client, client_data in emp_client_data[emp_id].items():
#                 if stored_client.strip().lower() == client_name.lower():
#                     if project_name and project_name not in client_data["projects"]:
#                         client_data["projects"].append(project_name)

#                     if billability == "billable":
#                         client_data["billed"] += hours
#                     elif billability == "non-billable":
#                         client_data["non_billable"] += hours
#                     break

#     # --- Utilization % ---
#     for emp_clients in emp_client_data.values():
#         for client in emp_clients.values():
#             billable_hours = client["billable"]
#             billed_hours = client["billed"]
#             non_billable_hours = client["non_billable"]

#             if billable_hours > 0:
#                 client["billed_utilization"] = round((billed_hours / billable_hours) * 100, 2)
#                 client["non_billable_utilization"] = round((non_billable_hours / billable_hours) * 100, 2)

#     # --- CSV ---
#     si = io.StringIO()
#     cw = csv.writer(si)
#     cw.writerow([
#         "Emp ID", "Employee Name", "Department", "Client Name", "Project Name(s)",
#         "Client Start Date", "Client End Date", "Billable Hours", "Billed Hours",
#         "Non-Billable Hours", "Billed Utilization (%)", "Non-Billable Utilization (%)"
#     ])

#     for emp in employees:
#         empid = emp.empid
#         emp_name = f"{emp.fname} {emp.lname}"
#         dept = emp.department.dept_name if emp.department else "N/A"

#         if empid in emp_client_data:
#             for client_name, data in emp_client_data[empid].items():
#                 # enforce client filter again before writing
#                 if selected_client and selected_client != "All" and client_name.strip().lower() != selected_client.strip().lower():
#                     continue

#                 cw.writerow([
#                     empid,
#                     emp_name,
#                     dept,
#                     client_name,
#                     ", ".join(data["projects"]) if data["projects"] else "-",
#                     data["start_date"],
#                     data["end_date"],
#                     data["billable"],
#                     data["billed"],
#                     data["non_billable"],
#                     data["billed_utilization"],
#                     data["non_billable_utilization"]
#                 ])

#     output = make_response(si.getvalue())
#     output.headers["Content-Disposition"] = f"attachment; filename=utilization_report_{start_date}_to_{end_date}.csv"
#     output.headers["Content-type"] = "text/csv"
#     return output

 
@app.route("/admin/utilization/download", methods=["GET", "POST"])
def api_download_utilization():
    # ✅ Auth check (secure)
    if "user_id" not in session:
        return jsonify({"error": "You must log in to download the utilization report."}), 401
 
    # --- Get filters (support both GET/POST; JSON or form/query) ---
    if request.method == "POST" and request.is_json:
        payload = request.get_json() or {}
        start_date = payload.get("start_date")
        end_date = payload.get("end_date")
        selected_department = payload.get("department")
        selected_employee = payload.get("employee")
        selected_client = payload.get("client")
    else:
        start_date = request.args.get("start_date") or request.form.get("start_date")
        end_date = request.args.get("end_date") or request.form.get("end_date")
        selected_department = request.args.get("department") or request.form.get("department")
        selected_employee = request.args.get("employee") or request.form.get("employee")
        selected_client = request.args.get("client") or request.form.get("client")
 
    # Normalize defaults
    selected_department = selected_department or "All"
    selected_employee = selected_employee or "All"
    selected_client = selected_client or "All"
 
    if not start_date or not end_date:
        return jsonify({"error": "Start date and end date are required to download utilization report."}), 400
 
    try:
        start_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
        end_obj = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400
 
    # --- Filter employees first ---
    employees_query = Employee_Info.query
 
    if selected_department != "All":
        employees_query = (
            employees_query
            .join(Department, Employee_Info.dept_id == Department.id)
            .filter(Department.dept_name == selected_department)
        )
 
    if selected_employee != "All":
        employees_query = employees_query.filter(Employee_Info.empid == selected_employee)
 
    if selected_client != "All":
        employees_query = (
            employees_query
            .join(Client_Employee, Employee_Info.empid == Client_Employee.empid)
            .join(Client_Info, Client_Employee.clientID == Client_Info.clientID)
            .filter(Client_Info.client_name == selected_client)
        )
 
    employees = employees_query.all()
    emp_ids = [e.empid for e in employees]
 
    if not employees:
        return jsonify({
            "error": "No employees found for the selected filters.",
            "filters": {
                "start_date": start_date,
                "end_date": end_date,
                "department": selected_department,
                "employee": selected_employee,
                "client": selected_client
            }
        }), 404
 
    # --- Holidays ---
    holiday_ranges = db.session.query(Holidays.start_date, Holidays.end_date).filter(
        and_(Holidays.end_date >= start_obj, Holidays.start_date <= end_obj)
    ).all()
 
    holiday_dates = set()
    for h_start, h_end in holiday_ranges:
        current = h_start
        while current <= h_end:
            holiday_dates.add(current)
            current += timedelta(days=1)
 
    # --- Client Assignments ---
    client_assignments_query = (
        db.session.query(
            Client_Employee.empid,
            Client_Info.client_name,
            Client_Employee.start_date,
            Client_Employee.end_date,
            Client_Info.daily_hours,
            Client_Info.clientID
        )
        .select_from(Client_Employee)
        .join(Client_Info, Client_Employee.clientID == Client_Info.clientID)
        .filter(Client_Employee.empid.in_(emp_ids))
    )
 
    if selected_client != "All":
        client_assignments_query = client_assignments_query.filter(Client_Info.client_name == selected_client)
 
    client_assignments = client_assignments_query.all()
 
    emp_client_data = {}
 
    for empid, client_name, client_start, client_end, daily_hours, _ in client_assignments:
        # Enforce client filter again defensively
        if selected_client != "All" and client_name.strip().lower() != selected_client.strip().lower():
            continue
 
        if empid not in emp_client_data:
            emp_client_data[empid] = {}
 
        client_start_adj = max(start_obj, client_start) if client_start else start_obj
        client_end_adj = min(end_obj, client_end) if client_end else end_obj
 
        # Count working days (Mon–Fri) excluding holidays
        working_days = sum(
            1
            for i in range((client_end_adj - client_start_adj).days + 1)
            if (client_start_adj + timedelta(days=i)).weekday() < 5
            and (client_start_adj + timedelta(days=i)) not in holiday_dates
        )
 
        daily_hrs = daily_hours or 8
        billable = working_days * daily_hrs
 
        emp_client_data[empid][client_name] = {
            "start_date": client_start.strftime('%Y-%m-%d') if client_start else "N/A",
            "end_date": client_end.strftime('%Y-%m-%d') if client_end else "Present",
            "billable": billable,
            "non_billable": 0,
            "billed": 0,
            "billed_utilization": 0.0,
            "non_billable_utilization": 0.0,
            "projects": []
        }
 
    # --- Timesheet Entries (this is where your error was – we fix with select_from) ---
    ts_query = (
        db.session.query(
            TimesheetEntry.empid,
            TimesheetEntry.hours_worked,
            Project_Info.project_billability,
            Client_Info.client_name,
            Project_Info.project_name
        )
        .select_from(TimesheetEntry)  # ✅ IMPORTANT: remove ambiguous FROMs
        .join(Project_Info, TimesheetEntry.project_id == Project_Info.id)
        .join(Client_Info, Project_Info.client_id == Client_Info.clientID)
        .join(Timesheet, TimesheetEntry.timesheet_id == Timesheet.id)
        .filter(TimesheetEntry.empid.in_(emp_ids))
        .filter(TimesheetEntry.work_date.between(start_obj, end_obj))
        .filter(Timesheet.status != "Rejected")
    )
 
    if selected_client != "All":
        ts_query = ts_query.filter(Client_Info.client_name == selected_client)
 
    ts_entries = ts_query.all()
 
    for empid, hrs, bill, cname, pname in ts_entries:
        # Enforce client filter again defensively
        if selected_client != "All" and cname.strip().lower() != selected_client.strip().lower():
            continue
 
        bill_type = (bill or "").strip().lower()
        cname = (cname or "").strip()
 
        if empid in emp_client_data:
            for stored_client, client_data in emp_client_data[empid].items():
                if stored_client.strip().lower() == cname.lower():
                    if pname and pname not in client_data["projects"]:
                        client_data["projects"].append(pname)
 
                    if bill_type == "billable":
                        client_data["billed"] += hrs
                    elif bill_type == "non-billable":
                        client_data["non_billable"] += hrs
                    break
 
    # --- Utilization % ---
    for emp_clients in emp_client_data.values():
        for client in emp_clients.values():
            billable_hours = client["billable"]
            billed_hours = client["billed"]
            non_billable_hours = client["non_billable"]
 
            if billable_hours > 0:
                client["billed_utilization"] = round((billed_hours / billable_hours) * 100, 2)
                client["non_billable_utilization"] = round((non_billable_hours / billable_hours) * 100, 2)
 
    # --- Build CSV in memory ---
    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow([
        "Emp ID", "Employee Name", "Department", "Client Name", "Project Name(s)",
        "Client Start Date", "Client End Date", "Billable Hours", "Billed Hours",
        "Non-Billable Hours", "Billed Utilization (%)", "Non-Billable Utilization (%)"
    ])
 
    for emp in employees:
        empid = emp.empid
        emp_name = f"{emp.fname} {emp.lname}"
        dept_name = emp.department.dept_name if emp.department else "N/A"
 
        if empid in emp_client_data:
            for client_name, data in emp_client_data[empid].items():
                # Extra client filter just in case
                if selected_client != "All" and client_name.strip().lower() != selected_client.strip().lower():
                    continue
 
                cw.writerow([
                    empid,
                    emp_name,
                    dept_name,
                    client_name,
                    ", ".join(data["projects"]) if data["projects"] else "-",
                    data["start_date"],
                    data["end_date"],
                    data["billable"],
                    data["billed"],
                    data["non_billable"],
                    data["billed_utilization"],
                    data["non_billable_utilization"]
                ])
 
    csv_content = si.getvalue()
    filename = f"utilization_report_{start_date}_to_{end_date}.csv"
 
    # ✅ JSON-only response (no flash, no redirect, no HTML)
    return jsonify({
        "status": "success",
        "filename": filename,
        "file": csv_content,
        "filters": {
            "start_date": start_date,
            "end_date": end_date,
            "department": selected_department,
            "employee": selected_employee,
            "client": selected_client
        }
    }), 200




# @app.route("/api/utilization_data", methods=["GET"])
# def api_utilization_data():
#     try:
#         # Step 1: Fetch all employees
#         employees = Employee_Info.query.all()
#         emp_ids = [emp.empid for emp in employees]
 
#         # Step 2: Fetch client assignments (not used for computation but can be included if needed)
#         client_assignments = (
#             db.session.query(Client_Employee, Client_Info)
#             .join(Client_Info, Client_Employee.clientID == Client_Info.clientID)
#             .filter(Client_Employee.empid.in_(emp_ids))
#             .all()
#         )
 
#         emp_clients = {}
#         for assignment, client in client_assignments:
#             emp_clients.setdefault(assignment.empid, []).append(client.client_name)
 
#         # Step 3: Initialize utilization data
#         emp_data = {emp_id: {"billable": 0, "non_billable": 0, "billed": 0} for emp_id in emp_ids}
 
#         # Step 4: Fetch timesheet entries with project billability
#         timesheet_entries = (
#             db.session.query(TimesheetEntry, Project_Info.project_billability)
#             .join(Project_Info, TimesheetEntry.project_id == Project_Info.id)
#             .filter(TimesheetEntry.empid.in_(emp_ids))
#             .all()
#         )
 
#         # Step 5: Calculate billable, billed, and non-billable hours
#         for entry, project_billability in timesheet_entries:
#             emp_id = entry.empid
#             hours = entry.hours_worked
#             billability = project_billability.lower() if project_billability else "non-billable"
 
#             if billability == "non-billable":
#                 emp_data[emp_id]["non_billable"] += hours
#             else:
#                 emp_data[emp_id]["billable"] += hours
#                 emp_data[emp_id]["billed"] += hours
 
#         # Step 6: Prepare final API response
#         api_data = []
#         for emp in employees:
#             billable_hours = emp_data[emp.empid]["billable"]
#             billed_hours = emp_data[emp.empid]["billed"]
#             non_billable_hours = emp_data[emp.empid]["non_billable"]
 
#             # Utilization calculations
#             billed_utilization = round((billed_hours / billable_hours) * 100, 2) if billable_hours > 0 else 0.0
#             non_billable_utilization = round((non_billable_hours / billable_hours) * 100, 2) if billable_hours > 0 else 0.0
 
#             emp_record = {
#                 "empid": emp.empid,
#                 "emp_name": f"{emp.fname} {emp.lname}",
#                 "department": emp.dept,
#                 "billable_hours": billable_hours,
#                 "billed_hours": billed_hours,
#                 "non_billable_hours": non_billable_hours,
#                 "billed_utilization_percentage": billed_utilization,
#                 "non_billable_utilization_percentage": non_billable_utilization,
#                 "clients": ", ".join(emp_clients.get(emp.empid, []))  # Optional, if you want to show clients
#             }
 
#             api_data.append(emp_record)
 
#         # Step 7: Return as JSON
#         return jsonify(api_data), 200
 
#     except Exception as e:
#         print("Error fetching utilization data for API:", e)
#         return jsonify({"error": "Failed to fetch data"}), 500
 

@app.route("/api/utilization_data", methods=["GET"])
def api_utilization_data():
    try:
        # Step 1: Fetch all employees
        employees = Employee_Info.query.all()
        emp_ids = [emp.empid for emp in employees]
 
        # Step 2: Fetch client assignments
        client_assignments = (
            db.session.query(Client_Employee, Client_Info)
            .join(Client_Info, Client_Employee.clientID == Client_Info.clientID)
            .filter(Client_Employee.empid.in_(emp_ids))
            .all()
        )
 
        emp_clients = {}
        for assignment, client in client_assignments:
            emp_clients.setdefault(assignment.empid, set()).add(client.client_name)
 
        # Step 3: Initialize utilization data per employee
        emp_data = {
            emp_id: {"billable": 0.0, "non_billable": 0.0, "billed": 0.0}
            for emp_id in emp_ids
        }
 
        # Step 4: Fetch timesheet entries w/ project billability
        timesheet_entries = (
            db.session.query(TimesheetEntry, Project_Info.project_billability)
            .join(Project_Info, TimesheetEntry.project_id == Project_Info.id)
            .filter(TimesheetEntry.empid.in_(emp_ids))
            .filter(Timesheet.status != "Rejected")
            .all()
        )
 
        # Step 5: Calculate hours
        for entry, project_billability in timesheet_entries:
            emp_id = entry.empid
            hours = float(entry.hours_worked or 0)
            billability = (project_billability or "").strip().lower()
 
            if billability == "non-billable":
                emp_data[emp_id]["non_billable"] += hours
            else:
                emp_data[emp_id]["billable"] += hours
                emp_data[emp_id]["billed"] += hours
 
        # Step 6: Build final response
        api_data = []
        for emp in employees:
            emp_id = emp.empid
            billable_hours = emp_data[emp_id]["billable"]
            billed_hours = emp_data[emp_id]["billed"]
            non_billable_hours = emp_data[emp_id]["non_billable"]
 
            billed_utilization = (
                round((billed_hours / billable_hours) * 100, 2)
                if billable_hours > 0 else 0.0
            )
            non_billable_utilization = (
                round((non_billable_hours / billable_hours) * 100, 2)
                if billable_hours > 0 else 0.0
            )
 
            api_data.append({
                "empid": emp_id,
                "emp_name": f"{emp.fname} {emp.lname}",
                "department": emp.department.dept_name if emp.department else "N/A",
                "billable_hours": billable_hours,
                "billed_hours": billed_hours,
                "non_billable_hours": non_billable_hours,
                "billed_utilization_percentage": billed_utilization,
                "non_billable_utilization_percentage": non_billable_utilization,
                "clients": ", ".join(emp_clients.get(emp_id, [])) or "-",
            })
 
        return jsonify({
            "status": "success",
            "total_employees": len(api_data),
            "data": api_data
        }), 200
 
    except Exception as e:
        print("Error fetching utilization data API:", e)
        return jsonify({"status": "error", "message": "Failed to fetch data"}), 500
 

################################start timesheet################################ 

@app.route("/dashboard", methods=["GET", "POST"])
def dashboard():
    if request.method == "POST":
        # print("RAW FORM DATA:", request.form)
        # print("RAW DATA:", request.data)
        # print("HEADERS:", request.headers)

        data = request.get_json(silent=True) or request.form

        projects_count = int(data.get("projects_count", 0))
        start_of_week_str = data.get("week_start_date")
        print("Parsed start_of_week:", start_of_week_str)

        if not start_of_week_str:
            return jsonify({"status": "error", "message": "Week start date is missing."}), 400

        try:
            start_of_week = datetime.strptime(start_of_week_str, "%Y-%m-%d")
        except ValueError:
            return jsonify({"status": "error", "message": "Invalid week start date format."}), 400

        error_days = []
        days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

        # ---------------- Leave Validation ----------------
        for i in range(projects_count):
            client = request.form.get(f"client_{i}", "").strip().lower()
            project = request.form.get(f"project_{i}", "").strip().lower()

            if client == "internal" and project == "leave":
                for day in days:
                    try:
                        hours_val = float(request.form.get(f"{day}_{i}", 0))
                    except ValueError:
                        hours_val = 0

                    if hours_val > 0:
                        work_date = start_of_week.date() + timedelta(days=days.index(day))
                        leave_entry = (
                            Leave_Entries.query.join(Leave_Request, Leave_Entries.leave_req_id == Leave_Request.id)
                            .filter(
                                Leave_Request.empid == session["user_id"],
                                Leave_Request.status.in_(["Pending", "Approved"]),
                                Leave_Entries.date == work_date
                            ).first()
                        )
                        if not leave_entry:
                            error_days.append(work_date.strftime("%Y-%m-%d"))

        if error_days:
            return jsonify({
                "status": "error",
                "message": "Please apply leave for: " + ", ".join(error_days)
            }), 400

        # ---------------- Timesheet Fetch/Create ----------------
        timesheet = (db.session.query(Timesheet)
                     .filter(
                         Timesheet.empid == session["user_id"],
                         Timesheet.week_start_date == start_of_week.date(),
                     ).first())

        if not timesheet:
            timesheet = Timesheet(
                empid=session["user_id"],
                week_start_date=start_of_week,
                submitted_date=datetime.now(),
                status="Not Submitted",
            )
            db.session.add(timesheet)
            db.session.commit()

        # ---------------- Insert/Update Entries ----------------
        for i in range(projects_count):
            client = data.get(f"client_{i}")
            project = data.get(f"project_{i}")

            project1 = Project_Info.query.filter_by(project_name=project).first()
            if project1:
                project = project1.project_code

            hours = {
                "mon": float(data.get(f"mon_{i}", 0)),
                "tue": float(data.get(f"tue_{i}", 0)),
                "wed": float(data.get(f"wed_{i}", 0)),
                "thu": float(data.get(f"thu_{i}", 0)),
                "fri": float(data.get(f"fri_{i}", 0)),
                "sat": float(data.get(f"sat_{i}", 0)),
                "sun": float(data.get(f"sun_{i}", 0)),
            }

            project_info = (db.session.query(Project_Info)
                            .join(Client_Info)
                            .filter(
                                Project_Info.project_code == project,
                                Client_Info.clientID == client
                            ).first())

            if project_info:
                for day, hour in hours.items():
                    work_date = start_of_week + timedelta(days=list(hours.keys()).index(day))

                    existing_entry = (TimesheetEntry.query
                                      .filter(
                                          TimesheetEntry.empid == session["user_id"],
                                          TimesheetEntry.timesheet_id == timesheet.id,
                                          TimesheetEntry.project_id == project_info.id,
                                          TimesheetEntry.work_date == work_date.date(),
                                      ).first())

                    if existing_entry:
                        existing_entry.hours_worked = hour
                    else:
                        db.session.add(TimesheetEntry(
                            empid=session["user_id"],
                            timesheet_id=timesheet.id,
                            project_id=project_info.id,
                            work_date=work_date,
                            hours_worked=hour,
                        ))

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Timesheet saved successfully",
            "redirect_to": f"/dashboard/timesheet_review?week_start_date={start_of_week_str}"
        }), 200

    # -------------------------------- GET METHOD --------------------------------
    else:
        if "user_id" not in session:
            return jsonify({"status": "error", "message": "Authentication required"}), 401

        user_id = session["user_id"]
        user_fname = session["user_fname"]
        user_lname = session["user_lname"]
        emp_name = f"{user_fname} {user_lname}"

        is_approver = 1 if Employee_Info.query.filter(Employee_Info.approver_id == user_id).first() else 0

        start_of_week_str = request.args.get("week_start_date")
        if not start_of_week_str:
            current_date = datetime.now()
            start_of_week = current_date - timedelta(days=current_date.weekday())
        else:
            start_of_week = datetime.strptime(start_of_week_str, "%Y-%m-%d")

        status = db.session.query(Timesheet.status).filter(
            Timesheet.empid == user_id,
            Timesheet.week_start_date == start_of_week.date()
        ).first()

        ts_status = status[0] if status else None

        prev_week_st_date = (start_of_week + timedelta(days=-7)).date()
        prev_status_query = db.session.query(Timesheet.status).filter(
            Timesheet.empid == user_id,
            Timesheet.week_start_date == prev_week_st_date
        ).first()

        prev_status = prev_status_query[0] if prev_status_query else None

        # Assigned Projects
        assigned_projects = (db.session.query(
                Project_Info.project_name,
                Client_Info.client_name,
                Project_Info.project_code
            )
            .join(Client_Info, Project_Info.client_id == Client_Info.clientID)
            .join(Employee_Project, Project_Info.id == Employee_Project.project_id)
            .filter(Employee_Project.empid == user_id)
            .all())

        # Timesheet Entries
        timesheet_entries = (db.session.query(
                TimesheetEntry,
                Project_Info.project_name,
                Client_Info.client_name,
                Project_Info.project_code,
            )
            .join(Project_Info, TimesheetEntry.project_id == Project_Info.id)
            .join(Client_Info, Project_Info.client_id == Client_Info.clientID)
            .join(Employee_Project, Employee_Project.project_id == Project_Info.id)
            .filter(
                TimesheetEntry.empid == user_id,
                TimesheetEntry.work_date > start_of_week + timedelta(days=-1),
                TimesheetEntry.work_date < start_of_week + timedelta(days=6),
            )
            .all())

        # ---------------- HOLIDAYS FOR THIS WEEK ----------------
        holidays = (
            db.session.query(Holidays.start_date)
            .filter(
                Holidays.start_date >= start_of_week.date(),
                Holidays.start_date <= (start_of_week + timedelta(days=6)).date()
            )
            .all()
        )

        holiday_list = [h[0].strftime("%Y-%m-%d") for h in holidays]


        # ---------------- APPLIED LEAVES FOR THIS WEEK ----------------
        leave_entries = (
            db.session.query(Leave_Entries.date)
            .join(Leave_Request, Leave_Entries.leave_req_id == Leave_Request.id)
            .filter(
                Leave_Request.empid == user_id,
                Leave_Request.status.in_(["Pending", "Approved"]),
                Leave_Entries.date >= start_of_week.date(),
                Leave_Entries.date <= (start_of_week + timedelta(days=6)).date(),
            )
            .all()
        )

        leave_list = [l[0].strftime("%Y-%m-%d") for l in leave_entries]

        # Prepare hours structure
        hours_by_project = {}
        for project in assigned_projects:
            hours_by_project[project.project_code] = {
                "client_name": project.client_name,
                "project_name": project.project_name,
                "hours": {day: 0 for day in ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]},
            }

        for entry, project_name, client_name, project_code in timesheet_entries:
            if project_code not in hours_by_project:
                hours_by_project[project_code] = {
                    "client_name": client_name,
                    "project_name": project_name,
                    "hours": {day: 0 for day in ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]},
                }

            day_name = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"][entry.work_date.weekday()]
            hours_by_project[project_code]["hours"][day_name] += entry.hours_worked

        # Total hours
        total_hours_by_day = {day: 0 for day in ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]}
        weekly_total_hours = 0

        for project_code, project_data in hours_by_project.items():
            project_total = 0
            for day, hours in project_data["hours"].items():
                total_hours_by_day[day] += hours
                project_total += hours
            hours_by_project[project_code]["total_hours"] = project_total
            weekly_total_hours += project_total

        end_of_week = start_of_week + timedelta(days=6)

        return jsonify({
            "status": "success",
            "data": {
               
                "start_of_week": start_of_week.strftime("%Y-%m-%d"),
                "end_of_week": end_of_week.strftime("%Y-%m-%d"),
                "emp_name": emp_name,
                "projects_count": len(assigned_projects),
                "rows": list(hours_by_project.values()),
                "total_hours_by_day": total_hours_by_day,
                "weekly_total_hours": weekly_total_hours,
                "is_approver": is_approver,
                "ts_status": ts_status,
                "prev_week_start_date": str(prev_week_st_date),
                "prev_status": prev_status,
                "holidays": holiday_list,
                "leaves": leave_list,

            }
        }), 200
    

            
@app.route('/dashboard/clone')
def clone_prev_week():
    return "Work is under Progress"
    return redirect (url_for("dashboard"))

# @app.route("/dashboard/timesheet_review", methods=["GET"])
# def timesheet_review():
#     if "user_id" not in session:
#         flash("You must log in first.", "warning")
#         return redirect(url_for("login"))

#     start_of_week_str = request.args.get("week_start_date")
#     if not start_of_week_str:
#         flash("Week start date is required.", "error")
#         return redirect(url_for("dashboard"))
    
#     print(f"[DEBUG] Requested week_start_date: {start_of_week_str}")
#     start_of_week = datetime.strptime(start_of_week_str, "%Y-%m-%d")
    
#     print(f"[DEBUG] Logged in user ID: {session['user_id']}")

#     # Fetch timesheet information
#     timesheet = (
#         db.session.query(Timesheet)
#         .filter(
#             and_(
#                 Timesheet.empid == session["user_id"],
#                 Timesheet.week_start_date == start_of_week.date(),
#             )
#         )
#         .first()
#     )

#     if not timesheet:
#         print(f"[DEBUG] No timesheet found for user {session['user_id']} and week {start_of_week.date()}")
#         flash("No timesheet found for the selected week.", "error")
#         return redirect(url_for("dashboard"))
    
#     print(f"[DEBUG] Timesheet ID: {timesheet.id} | Week Start: {timesheet.week_start_date}")

#     # Fetch timesheet entries with project details
#     timesheet_entries = (
#         db.session.query(
#             TimesheetEntry,
#             Project_Info.project_name,
#             Project_Info.project_code,
#             Client_Info.client_name
#         )
#         .join(Project_Info, TimesheetEntry.project_id == Project_Info.id)
#         .join(Client_Info, Project_Info.client_id == Client_Info.clientID)
#         .filter(TimesheetEntry.timesheet_id == timesheet.id)
#         .order_by(Client_Info.client_name, Project_Info.project_name)
#         .all()
#     )
    
#     print(f"[DEBUG] Total entries found: {len(timesheet_entries)}")
    
#     # Organize the data for display
#     hours_by_project = {}
#     total_hours = {day: 0 for day in ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]}

#     for entry, project_name, project_code, client_name in timesheet_entries:
#         if project_code not in hours_by_project:
#             hours_by_project[project_code] = {
#                 "client_name": client_name,
#                 "project_name": project_name,
#                 "hours": {
#                     day: 0 for day in ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
#                 },
#                 "total": 0,
#             }

#         day_of_week = entry.work_date.weekday()
#         day_name = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"][day_of_week]

#         hours_by_project[project_code]["hours"][day_name] = entry.hours_worked
#         hours_by_project[project_code]["total"] += entry.hours_worked
#         total_hours[day_name] += entry.hours_worked
        
#     print(f"[DEBUG] Total hours by project: {hours_by_project}")
#     print(f"[DEBUG] Total hours by day: {total_hours}")
#     print(f"[DEBUG] Week total hours: {sum(total_hours.values())}")

#     # Calculate week range
#     end_of_week = start_of_week + timedelta(days=6)
    
#     emp_name = f"{session['user_fname']} {session['user_lname']}"
#     print(f"[DEBUG] Rendering timesheet for employee: {emp_name}")

#     return render_template(
#         "timesheet_review.html",
#         timesheet=timesheet,
#         hours_by_project=hours_by_project,
#         total_hours=total_hours,
#         week_total=sum(total_hours.values()),
#         start_of_week=start_of_week_str,
#         end_of_week=end_of_week.strftime("%Y-%m-%d"),
#         emp_name=f"{session['user_fname']} {session['user_lname']}",
#     )




@app.route("/dashboard/timesheet_review", methods=["GET"])
def timesheet_review():
    if "user_id" not in session:
        return jsonify({"status": "error", "message": "Authentication required"}), 401
 
    start_of_week_str = request.args.get("week_start_date")
    if not start_of_week_str:
        return jsonify({"status": "error", "message": "Week start date is required"}), 400
 
    try:
        start_of_week = datetime.strptime(start_of_week_str, "%Y-%m-%d")
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid date format"}), 400
 
    user_id = session["user_id"]
    emp_name = f"{session['user_fname']} {session['user_lname']}"
 
    # Fetch Timesheet
    timesheet = (
        db.session.query(Timesheet)
        .filter(
            Timesheet.empid == user_id,
            Timesheet.week_start_date == start_of_week.date()
        )
        .first()
    )
 
    if not timesheet:
        return jsonify({
            "status": "error",
            "message": "Timesheet not found for the selected week"
        }), 404
 
    # Fetch entries
    entries = (
        db.session.query(
            TimesheetEntry,
            Project_Info.project_name,
            Project_Info.project_code,
            Client_Info.client_name
        )
        .join(Project_Info, TimesheetEntry.project_id == Project_Info.id)
        .join(Client_Info, Project_Info.client_id == Client_Info.clientID)
        .filter(TimesheetEntry.timesheet_id == timesheet.id)
        .all()
    )
 
    # Organize response structure
    hours_by_project = {}
    total_hours_by_day = {day: 0 for day in ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]}
    week_total = 0
 
    for entry, project_name, project_code, client_name in entries:
        if project_code not in hours_by_project:
            hours_by_project[project_code] = {
                "client_name": client_name,
                "project_name": project_name,
                "hours": {day: 0 for day in total_hours_by_day.keys()},
                "total_hours": 0
            }
 
        day = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"][entry.work_date.weekday()]
        hours_by_project[project_code]["hours"][day] = entry.hours_worked
        hours_by_project[project_code]["total_hours"] += entry.hours_worked
        total_hours_by_day[day] += entry.hours_worked
        week_total += entry.hours_worked
 
    end_of_week = (start_of_week + timedelta(days=6)).strftime("%Y-%m-%d")
 
    return jsonify({
        "status": "success",
        "data": {
            "emp_name": emp_name,
            "start_of_week": start_of_week_str,
            "end_of_week": end_of_week,
            "hours_by_project": hours_by_project,
            "total_hours_by_day": total_hours_by_day,
            "week_total_hours": week_total,
            "ts_status": timesheet.status,
            "timesheet_id":timesheet.id
        }
    }), 200



# @app.route("/timesheet/review_modal/<timesheet_id>", methods=["GET"])
# def get_timesheet_review_modal(timesheet_id):
#     if "user_id" not in session:
#         return jsonify({"success": False, "error": "You must log in first."}), 401

#     print(f"[DEBUG] Fetching timesheet review modal for timesheet_id: {timesheet_id}")

#     try:
#         # Fetch timesheet and employee
#         timesheet_with_employee = (
#             db.session.query(Timesheet, Employee_Info)
#             .join(Employee_Info, Timesheet.empid == Employee_Info.empid)
#             .filter(Timesheet.id == timesheet_id)
#             .first_or_404()
#         )

#         timesheet = timesheet_with_employee[0]
#         employee = timesheet_with_employee[1]
#         emp_name = f"{employee.fname} {employee.lname}"
#         print(f"[DEBUG] Employee: {emp_name}")

#         # Fetch timesheet entries with project and client info
#         timesheet_entries = (
#             db.session.query(
#                 TimesheetEntry,
#                 Project_Info.project_name,
#                 Project_Info.project_code,
#                 Client_Info.client_name
#             )
#             .join(Project_Info, TimesheetEntry.project_id == Project_Info.id)
#             .join(Client_Info, Project_Info.client_id == Client_Info.clientID)
#             .filter(TimesheetEntry.timesheet_id == timesheet.id)
#             .order_by(Client_Info.client_name, Project_Info.project_name)
#             .all()
#         )

#         print(f"[DEBUG] Number of entries fetched: {len(timesheet_entries)}")

#         # Organize data
#         hours_by_project = {}
#         total_hours = {day: 0 for day in ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]}

#         for entry, project_name, project_code, client_name in timesheet_entries:
#             if project_code not in hours_by_project:
#                 hours_by_project[project_code] = {
#                     "client_name": client_name,
#                     "project_name": project_name,
#                     "hours": {day: 0 for day in total_hours},
#                     "total": 0,
#                 }

#             day_of_week = entry.work_date.weekday()  # 0 = Mon, 6 = Sun
#             day_key = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"][day_of_week]

#             hours_by_project[project_code]["hours"][day_key] = entry.hours_worked
#             hours_by_project[project_code]["total"] += entry.hours_worked
#             total_hours[day_key] += entry.hours_worked

#         print(f"[DEBUG] Total hours by day: {total_hours}")

#         # Week range
#         start_of_week = timesheet.week_start_date
#         end_of_week = start_of_week + timedelta(days=6)
#         week_total = sum(total_hours.values())

#         # ✅ Generate day_labels (e.g., {'mon': {'date': '21-Jul', 'label': 'Mon'}})
#         day_labels = {}
#         for i, key in enumerate(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]):
#             date_obj = start_of_week + timedelta(days=i)
#             day_labels[key] = {
#                 "date": date_obj.strftime("%d-%b"),   # e.g. 21-Jul
#                 "label": date_obj.strftime("%a")      # e.g. Mon
#             }

#         # Render modal HTML
#         html_content = render_template(
#             "view_timesheet.html",
#             timesheet=timesheet,
#             emp_name=emp_name,
#             start_of_week=start_of_week.strftime("%Y-%m-%d"),
#             end_of_week=end_of_week.strftime("%Y-%m-%d"),
#             hours_by_project=hours_by_project,
#             total_hours=total_hours,
#             week_total=week_total,
#             day_labels=day_labels  # ✅ Pass to template
#         )

#         return jsonify({"success": True, "html": html_content})

#     except Exception as e:
#         return jsonify({"success": False, "error": str(e)}), 400


@app.route("/timesheet/review_modal/<timesheet_id>", methods=["GET"])
def get_timesheet_review_modal(timesheet_id):
    if "user_id" not in session:
        return jsonify({"success": False, "error": "You must log in first."}), 401
 
    print(f"[DEBUG] Fetching timesheet review modal for timesheet_id: {timesheet_id}")
 
    try:
        # Fetch timesheet + employee
        timesheet_with_employee = (
            db.session.query(Timesheet, Employee_Info)
            .join(Employee_Info, Timesheet.empid == Employee_Info.empid)
            .filter(Timesheet.id == timesheet_id)
            .first_or_404()
        )
 
        timesheet = timesheet_with_employee[0]
        employee = timesheet_with_employee[1]
 
        emp_name = f"{employee.fname} {employee.lname}"
        print(f"[DEBUG] Employee: {emp_name}")
 
        # Fetch timesheet entries with project + client
        timesheet_entries = (
            db.session.query(
                TimesheetEntry,
                Project_Info.project_name,
                Project_Info.project_code,
                Client_Info.client_name
            )
            .join(Project_Info, TimesheetEntry.project_id == Project_Info.id)
            .join(Client_Info, Project_Info.client_id == Client_Info.clientID)
            .filter(TimesheetEntry.timesheet_id == timesheet.id)
            .order_by(Client_Info.client_name, Project_Info.project_name)
            .all()
        )
 
        print(f"[DEBUG] Number of entries fetched: {len(timesheet_entries)}")
 
        # Organize
        hours_by_project = {}
        total_hours = {day: 0 for day in ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]}
 
        for entry, project_name, project_code, client_name in timesheet_entries:
 
            if project_code not in hours_by_project:
                hours_by_project[project_code] = {
                    "client_name": client_name,
                    "project_name": project_name,
                    "hours": {day: 0 for day in total_hours},
                    "total": 0,
                }
 
            day_of_week = entry.work_date.weekday()  # 0=Mon
            day_key = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"][day_of_week]
 
            hours_by_project[project_code]["hours"][day_key] = entry.hours_worked
            hours_by_project[project_code]["total"] += entry.hours_worked
            total_hours[day_key] += entry.hours_worked
 
        print(f"[DEBUG] Total hours by day: {total_hours}")
 
        # Week range
        start_of_week = timesheet.week_start_date
        end_of_week = start_of_week + timedelta(days=6)
        week_total = sum(total_hours.values())
 
        # Day labels for JSON
        day_labels = {}
        for i, key in enumerate(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]):
            date_obj = start_of_week + timedelta(days=i)
            day_labels[key] = {
                "date": date_obj.strftime("%d-%b"),
                "label": date_obj.strftime("%a")
            }
 
        # ------------------------------------------------
        # ✅ FINAL JSON RESPONSE (No HTML)
        # ------------------------------------------------
        response_data = {
            "success": True,
            "timesheet": {
                "id": timesheet.id,
                "empid": timesheet.empid,
                "week_start_date": start_of_week.strftime("%Y-%m-%d"),
                "week_end_date": end_of_week.strftime("%Y-%m-%d"),
                "status": timesheet.status,
            },
            "employee_name": emp_name,
            "hours_by_project": hours_by_project,
            "total_hours": total_hours,
            "week_total": week_total,
            "day_labels": day_labels
        }
 
        return jsonify(response_data)
 
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400
    





# @app.route("/dashboard/submit_timesheet", methods=["POST"])
# def dashboard_submit_timesheet():
#     if "user_id" not in session:
#         flash("You must log in first.", "warning")
#         return redirect(url_for("login"))

#     timesheet_id = request.form.get("timesheet_id")
#     week_start_date = request.form.get("week_start_date")

#     if not timesheet_id:
#         flash("Timesheet ID is required.", "error")
#         return redirect(url_for("dashboard"))

#     # Fetch the timesheet
#     timesheet = (
#         db.session.query(Timesheet)
#         .filter(
#             and_(Timesheet.id == timesheet_id, Timesheet.empid == session["user_id"])
#         )
#         .first()
#     )
#     print(timesheet)

#     if not timesheet:
#         flash("Timesheet not found.", "error")
#         return redirect(url_for("dashboard"))

#     # Update timesheet status
#     if timesheet.status == "Approved":
#         return "Approved....can't submit now"
#     else:
#         timesheet.status = "Submitted"
#         timesheet.submitted_date = datetime.now()

#     try:
#         db.session.commit()
#         flash("Timesheet submitted successfully!", "success")
#     except Exception as e:
#         db.session.rollback()
#         flash("Error submitting timesheet. Please try again.", "error")

#     return redirect(url_for("my_timesheets"))


@app.route("/dashboard/submit_timesheet", methods=["POST"])
def dashboard_submit_timesheet():
    if "user_id" not in session:
        return jsonify({
            "status": "error",
            "message": "You must log in first."
        }), 401
 
    # Accept JSON body OR form-data
    data = request.get_json(silent=True) or request.form
 
    timesheet_id = data.get("timesheet_id")
    week_start_date = data.get("week_start_date")
 
    if not timesheet_id:
        return jsonify({
            "status": "error",
            "message": "Timesheet ID is required."
        }), 400
 
    # Fetch the timesheet
    timesheet = (
        db.session.query(Timesheet)
        .filter(
            Timesheet.id == timesheet_id,
            Timesheet.empid == session["user_id"]
        )
        .first()
    )
 
    print(timesheet)
 
    if not timesheet:
        return jsonify({
            "status": "error",
            "message": "Timesheet not found."
        }), 404
 
    # Update status with SAME logic
    if timesheet.status == "Approved":
        return jsonify({
            "status": "error",
            "message": "Approved... can't submit now"
        }), 400
    else:
        timesheet.status = "Submitted"
        timesheet.submitted_date = datetime.now()
 
    try:
        db.session.commit()
        return jsonify({
            "status": "success",
            "message": "Timesheet submitted successfully!",
            "timesheet_id": timesheet.id,
            "week_start_date": week_start_date
        }), 200
 
    except Exception:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Error submitting timesheet. Please try again."
        }), 500




# @app.route("/delete_project", methods=["POST"])
# def delete_project():
#     print("HIi")
#     project_code = request.json.get("project_code")
#     start_of_week_str = request.json.get("start_of_week")
#     start_of_week = datetime.strptime(start_of_week_str, "%Y-%m-%d")

#     if not project_code:
#         return jsonify({"message": "Project code is required"}), 400

#     try:
#         # Fetch the timesheet for the user and week start date
#         timesheet = (
#             db.session.query(Timesheet)
#             .filter(
#                 Timesheet.empid == session["user_id"],
#                 Timesheet.week_start_date == start_of_week.date(),
#             )
#             .first()
#         )

#         if not timesheet:
#             return jsonify({"message": "Timesheet not found"}), 404

#         # Fetch the project to delete from the database
#         project_info = (
#             db.session.query(Project_Info).filter_by(project_code=project_code).first()
#         )
#         if not project_info:
#             return jsonify({"message": "Project not found"}), 404

#         # Delete all associated TimesheetEntry for this project
#         db.session.query(TimesheetEntry).filter(
#             TimesheetEntry.timesheet_id == timesheet.id,
#             TimesheetEntry.project_id == project_info.id,
#         ).delete()

#         # Check if there are any remaining TimesheetEntry for this Timesheet
#         remaining_entries = (
#             db.session.query(TimesheetEntry).filter_by(timesheet_id=timesheet.id).all()
#         )

#         # If there are no remaining entries, delete the timesheet
#         if not remaining_entries:
#             db.session.delete(timesheet)

#         # Commit the changes to the database
#         db.session.commit()

#         return jsonify({"message": "Project deleted successfully"}), 200
#     except Exception as e:
#         db.session.rollback()
#         print(f"Error deleting project: {str(e)}")  # Log the error for debugging
#         return jsonify({"message": f"An error occurred: {str(e)}"}), 500

# @app.route("/dashboard/my_timesheets", methods=["GET", "POST"])
# def my_timesheets():
#     if "user_id" not in session:
#         flash("You must log in first.", "warning")
#         return redirect(url_for("login"))
 
#     user_id = session["user_id"]
#     user_fname = session["user_fname"]
#     user_lname = session["user_lname"]
#     user_details = {
#         "user_id": user_id,
#         "user_fname": user_fname,
#         "user_lname": user_lname,
#     }
 
#     # Get filter values from form
#     start_date = request.form.get("start_date")
#     end_date = request.form.get("end_date")
#     filter_type = request.form.get("filter_type", "week_start_date")  # Default to week_start_date
 
#     query = Timesheet.query.filter_by(empid=user_id)
 
#     if start_date and end_date:
#         try:
#             start_date = datetime.strptime(start_date, "%Y-%m-%d")
#             end_date = datetime.strptime(end_date, "%Y-%m-%d")
 
#             if filter_type == "week_start_date":
#                 query = query.filter(Timesheet.week_start_date.between(start_date, end_date))
#             else:  # Filter by submitted_date
#                 query = query.filter(Timesheet.submitted_date.between(start_date, end_date))
       
#         except ValueError:
#             flash("Invalid date format. Please select valid dates.", "danger")
 
#     timesheets = query.all()
 
#     return render_template(
#         "my_timesheets.html",
#         timesheets=timesheets,
#         user_details=user_details,
#         timedelta=timedelta,  # Pass timedelta to template
#         start_date=start_date.strftime("%Y-%m-%d") if start_date else "",
#         end_date=end_date.strftime("%Y-%m-%d") if end_date else "",
#         filter_type=filter_type,
#     )
 

def process_timesheet_approval(timesheet, approver_id, action, comments):
    """Helper function to process single timesheet approval"""
    new_status = "Approved" if action == "approve" else "Rejected"
    timesheet.status = new_status
    timesheet.approver_id = approver_id
    timesheet.approval_date = datetime.now()
    timesheet.comments = comments
    return new_status

@app.route("/assign_secondary_approver", methods=["POST"])
def assign_secondary_approver():
    data = request.get_json()

    if not data:
        return jsonify({"status": "error", "message": "Missing JSON body"}), 400

    employee_ids = data.get("employee_ids", [])
    secondary_approver_id = data.get("secondary_approver_id")

    if not employee_ids:
        return jsonify({"status": "error", "message": "No employees selected"}), 400

    if not secondary_approver_id:
        return jsonify({"status": "error", "message": "Secondary approver ID is required"}), 400

    # Convert to int (VERY IMPORTANT)
    try:
        secondary_approver_id = secondary_approver_id
        employee_ids = [(eid) for eid in employee_ids]
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid ID format"}), 400

    # Validate approver exists
    approver = Employee_Info.query.filter_by(empid=secondary_approver_id).first()
    if not approver:
        return jsonify({"status": "error", "message": "Approver ID does not exist"}), 400

    try:
        # Ensure approver role
        approver.role = "approver"
        db.session.add(approver)

        # Assign secondary approver to employees
        for empid in employee_ids:
            emp = Employee_Info.query.filter_by(empid=empid).first()
            if emp:
                emp.secondary_approver_id = secondary_approver_id
                db.session.add(emp)

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Secondary approver assigned successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500



@app.route("/employees/by-approver/<approver_id>", methods=["GET"])
def get_employees_by_approver(approver_id):
    try:
        # keep approver_id as string (as per your design)
        approver_id = str(approver_id).strip()

        if not approver_id:
            return jsonify({
                "status": "error",
                "message": "Approver ID is required"
            }), 400

        # Fetch employees where:
        # - approver_id = logged-in approver
        # - OR secondary_approver_id = logged-in approver
        employees = (
            Employee_Info.query
            .filter(
                or_(
                    Employee_Info.approver_id == approver_id,
                    Employee_Info.secondary_approver_id == approver_id
                )
            )
            .order_by(Employee_Info.fname.asc())
            .all()
        )

        result = []
        for e in employees:
            result.append({
                "empid": e.empid,
                "fname": e.fname,
                "lname": e.lname,
                "email": e.email,
                "designation": e.designation,
                "approver_id": e.approver_id,
                "secondary_approver_id": e.secondary_approver_id,
                "department": {
                    "dept_id": e.department.id if e.department else None,
                    "dept_name": e.department.dept_name if e.department else None
                }
            })

        return jsonify(result), 200

    except Exception as ex:
        return jsonify({
            "status": "error",
            "message": str(ex)
        }), 500



@app.route("/employees/by_department/<dept_id>", methods=["GET"])
def get_employees_by_department(dept_id):
    employees = Employee_Info.query.filter_by(dept_id=dept_id).all()
    return jsonify([
        {
            "empid": e.empid,
            "fname": e.fname,
            "lname": e.lname,
            "email": e.email,
            "role": e.role
        }
        for e in employees
    ])




@app.route("/dashboard/my_timesheets", methods=["GET", "POST"])
def my_timesheets():
    if "user_id" not in session:
        return jsonify({
            "status": "error",
            "message": "You must log in first."
        }), 401
 
    user_id = session["user_id"]
    user_fname = session["user_fname"]
    user_lname = session["user_lname"]
 
    user_details = {
        "user_id": user_id,
        "user_fname": user_fname,
        "user_lname": user_lname,
    }
 
    # Get filters
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    filter_type = request.args.get("filter_type", "week_start_date")
 
    query = Timesheet.query.filter_by(empid=user_id)
 
    # Apply filter logic
    if start_date and end_date:
        try:
            start_date_dt = datetime.strptime(start_date, "%Y-%m-%d").date()
            end_date_dt = datetime.strptime(end_date, "%Y-%m-%d").date()


            if filter_type == "week_start_date":
                query = query.filter(
                    Timesheet.week_start_date.between(start_date_dt, end_date_dt)
                )
            else:
                query = query.filter(
                    Timesheet.submitted_date.between(start_date_dt, end_date_dt)
                )
 
        except ValueError:
            return jsonify({
                "status": "error",
                "message": "Invalid date format. Please select valid dates."
            }), 400
 
    timesheets = query.all()
 
    # Convert DB objects to JSON serializable format
    timesheet_list = [
        {
            "id": t.id,
            "week_start_date": t.week_start_date.strftime("%Y-%m-%d"),
            "week_end_date": (t.week_start_date + timedelta(days=6)).strftime("%Y-%m-%d"),
            "submitted_date": t.submitted_date.strftime("%Y-%m-%d") if t.submitted_date else None,
            "status": t.status
        }
        for t in timesheets
    ]
 
    return jsonify({
        "status": "success",
        "data": timesheet_list,
        "user": user_details,
        "filters": {
            "start_date": start_date,
            "end_date": end_date,
            "filter_type": filter_type
        }
    }), 200



# @app.route("/dashboard/approve_timesheets", methods=["GET", "POST"])
# def approve_timesheets():
#     if "user_id" not in session:
#         flash("Please log in to continue", "error")
#         return redirect(url_for("auth.login"))

#     approver_id = session["user_id"]

#     # Handle POST request for single approval/rejection
#     if request.method == "POST":
#         try:
#             data = request.get_json()
#             timesheet_id = data.get("timesheet_id")
#             action = data.get("action")
#             comments = data.get("comments", "")

#             # Validation
#             if not timesheet_id or action not in ["approve", "reject"]:
#                 return jsonify({"success": False, "error": "Invalid parameters"}), 400

#             # Get timesheet and verify
#             timesheet = Timesheet.query.get(timesheet_id)
#             if not timesheet:
#                 return jsonify({"success": False, "error": "Timesheet not found"}), 404

#             # Verify approver permission
#             employee = Employee_Info.query.filter_by(empid=timesheet.empid).first()
#             if not employee or employee.approver_id != approver_id:
#                 return jsonify({"success": False, "error": "Unauthorized access"}), 403

#             # Process approval
#             try:
#                 new_status = process_timesheet_approval(
#                     timesheet, approver_id, action, comments
#                 )
#                 db.session.commit()

#                 return jsonify(
#                     {
#                         "success": True,
#                         "message": f"Timesheet {action}d successfully",
#                         "new_status": new_status,
#                         "saved_comments": timesheet.comments,
#                     }
#                 )
#             except Exception as e:
#                 db.session.rollback()
#                 return jsonify(
#                     {"success": False, "error": f"Database error: {str(e)}"}
#                 ), 500

#         except Exception as e:
#             return jsonify({"success": False, "error": str(e)}), 500

#     # Handle GET request
#     try:
#         # Get employees under this approver
#         # employees = Employee_Info.query.filter_by(approver_id=approver_id).all()
#         # emp_ids = [emp.empid for emp in employees]



#         employees = Employee_Info.query.filter_by(approver_id=approver_id).all()
#         emp_ids = [emp.empid for emp in employees]
#         res = []
#         for emp in emp_ids:
#             if emp not in res:
#                 res.append(emp)
#         for emp in res:
#             employees = Employee_Info.query.filter_by(approver_id=emp).all()
#             emp_ids = [emp.empid for emp in employees]
#             for emp in emp_ids:
#                 if emp not in res:
#                     res.append(emp)
#         emp_ids = res

#         # Query for submitted timesheets
#         timesheets_query = (
#             db.session.query(
#                 Timesheet.id,
#                 Timesheet.week_start_date,
#                 Timesheet.submitted_date,
#                 Timesheet.empid,
#                 Employee_Info.fname,
#                 Employee_Info.lname,
#                 Timesheet.status,
#                 Timesheet.comments,
#                 func.coalesce(func.sum(TimesheetEntry.hours_worked), 0).label(
#                     "total_hours"
#                 ),
#             )
#             .join(Employee_Info, Employee_Info.empid == Timesheet.empid)
#             .outerjoin(TimesheetEntry, TimesheetEntry.timesheet_id == Timesheet.id)
#             .filter(Timesheet.empid.in_(emp_ids), Timesheet.status == "Submitted")
#             .group_by(
#                 Timesheet.id,
#                 Timesheet.week_start_date,
#                 Timesheet.submitted_date,
#                 Timesheet.empid,
#                 Employee_Info.fname,
#                 Employee_Info.lname,
#                 Timesheet.status,
#                 Timesheet.comments,
#             )
#         ).all()

#         timesheets_data = [
#             {
#                 "id": ts.id,
#                 "employee_name": f"{ts.fname} {ts.lname}",
#                 "week_start_date": ts.week_start_date.strftime("%Y-%m-%d"),
#                 "submitted_date": ts.submitted_date.strftime("%Y-%m-%d"),
#                 "total_hours": float(ts.total_hours),
#                 "status": ts.status,
#                 "comments": ts.comments,
#             }
#             for ts in timesheets_query
#         ]

#         return render_template("approve_ts.html", timesheets=timesheets_data)

#     except Exception as e:
#         flash("Error fetching timesheets", "error")
#         return redirect(url_for("dashboard.index"))

# @app.route("/dashboard/bulk_approve_timesheets", methods=["POST"])
# def bulk_approve_timesheets():
#     if "user_id" not in session:
#         return jsonify({"success": False, "error": "Authentication required"}), 401

#     approver_id = session["user_id"]

#     try:
#         data = request.get_json()

#         timesheet_ids = data.get("timesheet_ids", [])
#         action = data.get("action")
#         comments = data.get("comments", "")

#         # Validation
#         if not timesheet_ids or action not in ["approve", "reject"]:
#             print(f"Invalid parameters: timesheet_ids={timesheet_ids}, action={action}")
#             return jsonify({"success": False, "error": "Invalid parameters"}), 400

#         # Convert string IDs to integers if needed
#         timesheet_ids = [int(id) for id in timesheet_ids]

#         # Get all timesheets in one query
#         timesheets = (
#             Timesheet.query.join(Employee_Info, Employee_Info.empid == Timesheet.empid)
#             .filter(
#                 Timesheet.id.in_(timesheet_ids),
#                 Timesheet.status == "Submitted",  # Only process submitted timesheets
#             )
#             .all()
#         )

#         if not timesheets:
#             return jsonify(
#                 {"success": False, "error": "No valid timesheets found"}
#             ), 404

#         # Verify permissions
#         for timesheet in timesheets:
#             employee = Employee_Info.query.filter_by(empid=timesheet.empid).first()
#             if not employee or employee.approver_id != approver_id:
#                 return jsonify(
#                     {
#                         "success": False,
#                         "error": f"Unauthorized to approve timesheet {timesheet.id}",
#                     }
#                 ), 403

#         # Process all timesheets
#         new_status = "approved" if action == "approve" else "rejected"
#         processed_count = 0

#         for timesheet in timesheets:
#             timesheet.status = new_status
#             timesheet.approver_id = approver_id
#             timesheet.approval_date = datetime.now()
#             timesheet.comments = comments
#             processed_count += 1
#             print(f"Processing timesheet {timesheet.id}")  # Debug print

#         try:
#             db.session.commit()
#             print(f"Successfully processed {processed_count} timesheets")  # Debug print

#             return jsonify(
#                 {
#                     "success": True,
#                     "message": f"{processed_count} timesheets {action}d successfully",
#                     "new_status": new_status,
#                     "saved_comments": comments,
#                 }
#             )

#         except Exception as e:
#             db.session.rollback()
#             print(f"Database error: {str(e)}")  # Debug print
#             return jsonify(
#                 {"success": False, "error": f"Database error: {str(e)}"}
#             ), 500

#     except Exception as e:
#         print(f"General error: {str(e)}")  # Debug print
#         return jsonify({"success": False, "error": str(e)}), 500


@app.route("/timesheetdashboard/approve_timesheets", methods=["GET", "POST"])
def approve_timesheets():
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401

    approver_id = session["user_id"]

    # ---------------- POST: Approve / Reject ----------------
    if request.method == "POST":
        data = request.get_json()

        timesheet_id = data.get("timesheet_id")
        action = data.get("action")
        comments = data.get("comments", "")

        if not timesheet_id or not action:
            return jsonify({"error": "Missing data"}), 400

        timesheet = Timesheet.query.get(timesheet_id)
        if not timesheet:
            return jsonify({"error": "Timesheet not found"}), 404

        employee = Employee_Info.query.filter_by(empid=timesheet.empid).first()
        if not employee:
            return jsonify({"error": "Employee not found"}), 404

        # ✅ Allow primary OR secondary approver
        if approver_id not in (
            employee.approver_id,
            employee.secondary_approver_id,
        ):
            return jsonify({"error": "Unauthorized"}), 403

        new_status = process_timesheet_approval(
            timesheet, approver_id, action, comments
        )

        db.session.commit()

        return jsonify({"success": True, "new_status": new_status})

    # ---------------- GET: Fetch Timesheets ----------------

    # ✅ Employees where logged-in user is primary OR secondary approver
    employees = Employee_Info.query.filter(
        (Employee_Info.approver_id == approver_id)
        | (Employee_Info.secondary_approver_id == approver_id)
    ).all()

    emp_ids = list({emp.empid for emp in employees})

    if not emp_ids:
        return jsonify([])

    query = (
        db.session.query(
            Timesheet.id,
            Timesheet.week_start_date,
            Timesheet.submitted_date,
            Timesheet.empid,
            Employee_Info.fname,
            Employee_Info.lname,
            Timesheet.status,
            Timesheet.comments,
            func.sum(TimesheetEntry.hours_worked).label("total_hours"),
        )
        .join(Employee_Info, Employee_Info.empid == Timesheet.empid)
        .outerjoin(TimesheetEntry, TimesheetEntry.timesheet_id == Timesheet.id)
        .filter(
            Timesheet.empid.in_(emp_ids),
            Timesheet.status == "Submitted"
        )
        .group_by(
            Timesheet.id,
            Employee_Info.fname,
            Employee_Info.lname,
            Timesheet.week_start_date,
            Timesheet.submitted_date,
            Timesheet.status,
            Timesheet.comments,
        )
        .order_by(Timesheet.submitted_date.desc())
    ).all()

    timesheets_data = [
        {
            "id": t.id,
            "empid": t.empid,
            "employee_name": f"{t.fname} {t.lname}",
            "week_start_date": t.week_start_date.strftime("%Y-%m-%d"),
            "submitted_date": t.submitted_date.strftime("%Y-%m-%d"),
            "total_hours": float(t.total_hours or 0),
            "status": t.status,
        }
        for t in query
    ]

    return jsonify(timesheets_data)



@app.route("/timesheetdashboard/bulk_approve_timesheets", methods=["POST"])
def bulk_approve_timesheets():
    if "user_id" not in session:
        return jsonify({"success": False, "error": "Authentication required"}), 401

    approver_id = session["user_id"]

    try:
        data = request.get_json()

        timesheet_ids = data.get("timesheet_ids", [])
        action = data.get("action")
        comments = data.get("comments", "")

        # Validation
        if not timesheet_ids or action not in ["approve", "reject"]:
            print(f"Invalid parameters: timesheet_ids={timesheet_ids}, action={action}")
            return jsonify({"success": False, "error": "Invalid parameters"}), 400

        # Convert string IDs to integers if needed
        timesheet_ids = [int(id) for id in timesheet_ids]

        # Get all timesheets in one query
        timesheets = (
            Timesheet.query.join(Employee_Info, Employee_Info.empid == Timesheet.empid)
            .filter(
                Timesheet.id.in_(timesheet_ids),
                Timesheet.status == "Submitted",  # Only process submitted timesheets
            )
            .all()
        )

        if not timesheets:
            return jsonify(
                {"success": False, "error": "No valid timesheets found"}
            ), 404

        # Verify permissions
        for timesheet in timesheets:
            employee = Employee_Info.query.filter_by(empid=timesheet.empid).first()
            if not employee or employee.approver_id != approver_id:
                return jsonify(
                    {
                        "success": False,
                        "error": f"Unauthorized to approve timesheet {timesheet.id}",
                    }
                ), 403

        # Process all timesheets
        new_status = "Approved" if action == "approve" else "rejected"
        processed_count = 0

        for timesheet in timesheets:
            timesheet.status = new_status
            timesheet.approver_id = approver_id
            timesheet.approval_date = datetime.now()
            timesheet.comments = comments
            processed_count += 1
            print(f"Processing timesheet {timesheet.id}")  # Debug print

        try:
            db.session.commit()
            print(f"Successfully processed {processed_count} timesheets")  # Debug print

            return jsonify(
                {
                    "success": True,
                    "message": f"{processed_count} timesheets {action}d successfully",
                    "new_status": new_status,
                    "saved_comments": comments,
                }
            )

        except Exception as e:
            db.session.rollback()
            print(f"Database error: {str(e)}")  # Debug print
            return jsonify(
                {"success": False, "error": f"Database error: {str(e)}"}
            ), 500

    except Exception as e:
        print(f"General error: {str(e)}")  # Debug print
        return jsonify({"success": False, "error": str(e)}), 500

# @app.route('/timesheet/download/<int:timesheet_id>', methods=['GET'])
# def download_timesheet(timesheet_id):
#     if 'user_id' not in session:
#         return jsonify({
#             'success': False,
#             'error': 'You must log in first.'
#         }), 401

#     try:
#         # Fetch timesheet with employee info
#         timesheet_with_employee = (
#             db.session.query(Timesheet, Employee_Info)
#             .join(Employee_Info, Timesheet.empid == Employee_Info.empid)
#             .filter(Timesheet.id == timesheet_id)
#             .first_or_404()
#         )
       
#         timesheet = timesheet_with_employee[0]
#         employee = timesheet_with_employee[1]
       
#         # Fetch timesheet entries
#         timesheet_entries = (
#             db.session.query(
#                 TimesheetEntry,
#                 Project_Info.project_name,
#                 Client_Info.client_name,
#                 Project_Info.project_code
#             )
#             .join(Project_Info, TimesheetEntry.project_id == Project_Info.id)
#             .join(Client_Info, Project_Info.client_id == Client_Info.clientID)
#             .filter(TimesheetEntry.timesheet_id == timesheet.id)
#             .order_by(Client_Info.client_name, Project_Info.project_name)
#             .all()
#         )

#         # Organize data by project and day
#         hours_by_project = {}
#         days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
#         total_hours = {day: 0 for day in days}
#         week_start = timesheet.week_start_date
       
#         for entry, project_name, client_name, project_code in timesheet_entries:
#             if project_code not in hours_by_project:
#                 hours_by_project[project_code] = {
#                     'client_name': client_name,
#                     'project_name': project_name,
#                     'hours': {day: 0 for day in days}
#                 }
           
#             day_index = entry.work_date.weekday()
#             day_name = days[day_index]
#             hours_by_project[project_code]['hours'][day_name] = entry.hours_worked
#             total_hours[day_name] += entry.hours_worked

#         # --- PDF Setup (landscape) ---
#         buffer = io.BytesIO()
#         doc = SimpleDocTemplate(
#             buffer,
#             pagesize=landscape(letter),   # ✅ switched to landscape
#             rightMargin=40,
#             leftMargin=40,
#             topMargin=50,
#             bottomMargin=50
#         )

#         # Styles
#         styles = getSampleStyleSheet()
#         wrap_style = styles['Normal']
#         wrap_style.fontSize = 8   # slightly smaller so text fits better
#         wrap_style.leading = 10   # line spacing
        
#         from reportlab.lib.styles import ParagraphStyle
#         from reportlab.lib import colors
#         from reportlab.lib.enums import TA_CENTER
        
#         header_style = ParagraphStyle(
#             'HeaderStyle',
#             fontSize=9,
#             leading=11,
#             alignment=TA_CENTER,  # center align
#             textColor=colors.white
#         )
                
        
#         title_style = ParagraphStyle(
#             'CustomTitle',
#             parent=styles['Heading1'],
#             fontSize=16,
#             spaceAfter=20,
#             alignment=TA_CENTER
#         )

#         # Content elements
#         elements = []

#         # --- Logo ---
#         from reportlab.platypus import Image
#         logo_path = "static/images/neutrinologo_white.png"  # optional
#         try:
#             elements.append(Image(logo_path, width=120, height=50))
#             elements.append(Spacer(1, 12))
#         except:
#             pass

#         # --- Title ---
#         elements.append(Paragraph("<b><u>Weekly Timesheet</u></b>", title_style))
#         elements.append(Spacer(1, 10))

#         # --- Employee Info ---
#         employee_info = [
#             ["Employee:", f"{employee.fname} {employee.lname}", "Employee ID:", employee.empid],
#             ["Status:", timesheet.status, "Timesheet ID:", timesheet.id],
#             ["Week:", f"{week_start.strftime('%B %d, %Y')} - {(week_start + timedelta(days=6)).strftime('%B %d, %Y')}", "", ""]
#         ]
#         info_table = Table(employee_info, colWidths=[1.2*inch, 2.5*inch, 1.2*inch, 2.5*inch])
#         elements.append(info_table)
#         elements.append(Spacer(1, 20))

#         # --- Table Data ---
#         table_data = []
#         headers = ['Project Code', 'Client', 'Project']
#         for i, day in enumerate(days):
#             actual_date = (week_start + timedelta(days=i)).strftime('%d-%b')
#             headers.append(f"{day}\n({actual_date})")
#         headers.append('Total')
#         table_data.append(headers)

#         weekly_total = 0
#         for project_code, data in hours_by_project.items():
#             row = [
#                 Paragraph(str(project_code), wrap_style),
#                 Paragraph(data['client_name'], wrap_style),
#                 Paragraph(data['project_name'], wrap_style)
#             ]
#             project_total = 0
#             for day in days:
#                 hours = data['hours'][day]
#                 row.append(f"{hours:.2f}" if hours else "-")
#                 project_total += hours
#             row.append(f"{project_total:.2f}")
#             weekly_total += project_total
#             table_data.append(row)

#         total_row = ['', Paragraph('<b>Daily Totals</b>', wrap_style), '']
#         for day in days:
#             total_row.append(f"{total_hours[day]:.2f}")
#         total_row.append(f"{weekly_total:.2f}")
#         table_data.append(total_row)

#         # ✅ Auto-fit column widths
#         available_width = doc.width
#         available_width = doc.width
#         col_widths = [
#             available_width * 0.15,  # Project Code (wider than before)
#             available_width * 0.10,  # Client (smaller, names are short)
#             available_width * 0.25,  # Project (enough space but not overkill)
#             available_width * 0.07,  # Mon
#             available_width * 0.07,  # Tue
#             available_width * 0.07,  # Wed
#             available_width * 0.07,  # Thu
#             available_width * 0.07,  # Fri
#             available_width * 0.07,  # Sat
#             available_width * 0.07,  # Sun
#             available_width * 0.11,  # Total
#         ]


#         # Styled Table
#         table = Table(table_data, colWidths=col_widths, repeatRows=1)
#         table.setStyle(TableStyle([
#             ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
#             ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#003366")),
#             ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
#             ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
#             ('FONTSIZE', (0, 0), (-1, 0), 10),
#             ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
#             ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
#             ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
#             ('ROWBACKGROUNDS', (0,1), (-1,-2), [colors.whitesmoke, colors.lightgrey]),
#             ('ALIGN', (0, 0), (2, -1), 'LEFT'),
#             ('ALIGN', (3, 1), (-1, -1), 'CENTER'),
#             ('LEFTPADDING', (2,0), (2,-1), 3),
#             ('RIGHTPADDING', (2,0), (2,-1), 3),
#         ]))
#         elements.append(table)


#         # --- Footer ---
#         elements.append(Spacer(1, 30))
#         elements.append(Paragraph(
#             "<font size=8 color='grey'>This is a system-generated timesheet. No signature is required if approved electronically.</font>",
#             styles['Normal']
#         ))

#         # Build PDF
#         doc.build(elements)

#         buffer.seek(0)
#         return send_file(
#             buffer,
#             mimetype='application/pdf',
#             as_attachment=True,
#             download_name=f'Timesheet_{employee.fname}_{employee.lname}_{week_start.strftime("%Y%m%d")}.pdf'
#         )

#     except Exception as e:
#         return jsonify({
#             'success': False,
#             'error': str(e)
#         }), 400



@app.route('/timesheet/download/<int:timesheet_id>', methods=['GET'])
def download_timesheet(timesheet_id):
    if 'user_id' not in session:
        return jsonify({
            'success': False,
            'error': 'You must log in first.'
        }), 401

    try:
        # Fetch timesheet with employee info
        timesheet_with_employee = (
            db.session.query(Timesheet, Employee_Info)
            .join(Employee_Info, Timesheet.empid == Employee_Info.empid)
            .filter(Timesheet.id == timesheet_id)
            .first_or_404()
        )
       
        timesheet = timesheet_with_employee[0]
        employee = timesheet_with_employee[1]
       
        # Fetch timesheet entries
        timesheet_entries = (
            db.session.query(
                TimesheetEntry,
                Project_Info.project_name,
                Client_Info.client_name,
                Project_Info.project_code
            )
            .join(Project_Info, TimesheetEntry.project_id == Project_Info.id)
            .join(Client_Info, Project_Info.client_id == Client_Info.clientID)
            .filter(TimesheetEntry.timesheet_id == timesheet.id)
            .order_by(Client_Info.client_name, Project_Info.project_name)
            .all()
        )

        # Organize data by project and day
        hours_by_project = {}
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        total_hours = {day: 0 for day in days}
        week_start = timesheet.week_start_date
       
        for entry, project_name, client_name, project_code in timesheet_entries:
            if project_code not in hours_by_project:
                hours_by_project[project_code] = {
                    'client_name': client_name,
                    'project_name': project_name,
                    'hours': {day: 0 for day in days}
                }
           
            day_index = entry.work_date.weekday()
            day_name = days[day_index]
            hours_by_project[project_code]['hours'][day_name] = entry.hours_worked
            total_hours[day_name] += entry.hours_worked

        # --- PDF Setup (landscape) ---
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(letter),   # ✅ switched to landscape
            rightMargin=40,
            leftMargin=40,
            topMargin=50,
            bottomMargin=50
        )

        # Styles
        styles = getSampleStyleSheet()
        wrap_style = styles['Normal']
        wrap_style.fontSize = 8   # slightly smaller so text fits better
        wrap_style.leading = 10   # line spacing
        
        from reportlab.lib.styles import ParagraphStyle
        from reportlab.lib import colors
        from reportlab.lib.enums import TA_CENTER
        
        header_style = ParagraphStyle(
            'HeaderStyle',
            fontSize=9,
            leading=11,
            alignment=TA_CENTER,  # center align
            textColor=colors.white
        )
                
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=20,
            alignment=TA_CENTER
        )

        # Content elements
        elements = []

        # --- Logo ---
        from reportlab.platypus import Image
        logo_path = "static/images/neutrinologo_white.png"  # optional
        try:
            elements.append(Image(logo_path, width=120, height=50))
            elements.append(Spacer(1, 12))
        except:
            pass

        # --- Title ---
        elements.append(Paragraph("<b><u>Weekly Timesheet</u></b>", title_style))
        elements.append(Spacer(1, 10))

        # --- Employee Info ---
        employee_info = [
            ["Employee:", f"{employee.fname} {employee.lname}", "Employee ID:", employee.empid],
            ["Status:", timesheet.status, "Timesheet ID:", timesheet.id],
            ["Week:", f"{week_start.strftime('%B %d, %Y')} - {(week_start + timedelta(days=6)).strftime('%B %d, %Y')}", "", ""]
        ]
        info_table = Table(employee_info, colWidths=[1.2*inch, 2.5*inch, 1.2*inch, 2.5*inch])
        elements.append(info_table)
        elements.append(Spacer(1, 20))

        # --- Table Data ---
        table_data = []
        headers = ['Project Code', 'Client', 'Project']
        for i, day in enumerate(days):
            actual_date = (week_start + timedelta(days=i)).strftime('%d-%b')
            headers.append(f"{day}\n({actual_date})")
        headers.append('Total')
        table_data.append(headers)

        weekly_total = 0
        for project_code, data in hours_by_project.items():
            row = [
                Paragraph(str(project_code), wrap_style),
                Paragraph(data['client_name'], wrap_style),
                Paragraph(data['project_name'], wrap_style)
            ]
            project_total = 0
            for day in days:
                hours = data['hours'][day]
                row.append(f"{hours:.2f}" if hours else "-")
                project_total += hours
            row.append(f"{project_total:.2f}")
            weekly_total += project_total
            table_data.append(row)

        total_row = ['', Paragraph('<b>Daily Totals</b>', wrap_style), '']
        for day in days:
            total_row.append(f"{total_hours[day]:.2f}")
        total_row.append(f"{weekly_total:.2f}")
        table_data.append(total_row)

        # ✅ Auto-fit column widths
        available_width = doc.width
        available_width = doc.width
        col_widths = [
            available_width * 0.15,  # Project Code (wider than before)
            available_width * 0.10,  # Client (smaller, names are short)
            available_width * 0.25,  # Project (enough space but not overkill)
            available_width * 0.07,  # Mon
            available_width * 0.07,  # Tue
            available_width * 0.07,  # Wed
            available_width * 0.07,  # Thu
            available_width * 0.07,  # Fri
            available_width * 0.07,  # Sat
            available_width * 0.07,  # Sun
            available_width * 0.11,  # Total
        ]


        # Styled Table
        table = Table(table_data, colWidths=col_widths, repeatRows=1)
        table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#003366")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('ROWBACKGROUNDS', (0,1), (-1,-2), [colors.whitesmoke, colors.lightgrey]),
            ('ALIGN', (0, 0), (2, -1), 'LEFT'),
            ('ALIGN', (3, 1), (-1, -1), 'CENTER'),
            ('LEFTPADDING', (2,0), (2,-1), 3),
            ('RIGHTPADDING', (2,0), (2,-1), 3),
        ]))
        elements.append(table)


        # --- Footer ---
        elements.append(Spacer(1, 30))
        elements.append(Paragraph(
            "<font size=8 color='grey'>This is a system-generated timesheet. No signature is required if approved electronically.</font>",
            styles['Normal']
        ))

        # Build PDF
        doc.build(elements)
        buffer.seek(0)

        # 🔥 Convert binary PDF → Base64 for JSON API
        import base64
        pdf_base64 = base64.b64encode(buffer.read()).decode("utf-8")

        # Return JSON instead of file
        return jsonify({
            "success": True,
            "filename": f"Timesheet_{employee.fname}_{employee.lname}_{week_start.strftime('%Y%m%d')}.pdf",
            "filedata": pdf_base64
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400




# @app.route("/dashboard/approve_timesheets/approval_history")
# def approval_history():
#     if 'user_id' not in session:
#         flash('Please log in to continue', 'error')
#         return redirect(url_for('auth.login'))

#     approver_id = session['user_id']

#     try:
#         # Get employees under this approver
#         employees = Employee_Info.query.filter_by(approver_id=approver_id).all()
#         emp_ids = [emp.empid for emp in employees]

#         # Extract unique departments (via relationships)
#         departments = list(set(emp.department.name for emp in employees if emp.department))

#         # Get filter parameters
#         employee_name = request.args.get('employee_name', '').strip()
#         status = request.args.get('status', '').strip()
#         date_range = request.args.get('date_range', '').strip()
#         selected_department = request.args.get('department', '').strip()

#         # Filter employees based on the selected department
#         if selected_department:
#             employees = [emp for emp in employees if emp.department and emp.department.name == selected_department]
#             emp_ids = [emp.empid for emp in employees]  # Update emp_ids accordingly

#         # Base query for timesheets
#         timesheets_query = (
#             db.session.query(
#                 Timesheet.id,
#                 Timesheet.week_start_date,
#                 Timesheet.submitted_date,
#                 Timesheet.empid,
#                 Employee_Info.fname,
#                 Employee_Info.lname,
#                 Department.name.label("department_name"),
#                 Timesheet.status,
#                 Timesheet.comments,
#                 func.coalesce(func.sum(TimesheetEntry.hours_worked), 0).label("total_hours")
#             )
#             .join(Employee_Info, Employee_Info.empid == Timesheet.empid)
#             .join(Department, Department.id == Employee_Info.dept_id)
#             .outerjoin(TimesheetEntry, TimesheetEntry.timesheet_id == Timesheet.id)
#             .filter(Timesheet.empid.in_(emp_ids))
#             .filter(Timesheet.status.in_(['Approved', 'Rejected']))
#         )

#         # Apply department filter
#         if selected_department:
#             timesheets_query = timesheets_query.filter(Department.name == selected_department)

#         # Apply employee name filter
#         if employee_name:
#             timesheets_query = timesheets_query.filter(
#                 func.concat(Employee_Info.fname, ' ', Employee_Info.lname).ilike(f'%{employee_name}%')
#             )

#         # Apply status filter
#         if status:
#             status = status.title()
#             timesheets_query = timesheets_query.filter(Timesheet.status == status)

#         results = timesheets_query.group_by(
#             Timesheet.id, Timesheet.week_start_date, Timesheet.submitted_date,
#             Timesheet.empid, Employee_Info.fname, Employee_Info.lname,
#             Department.name, Timesheet.status, Timesheet.comments
#         ).all()

#         timesheets_data = [{
#             'id': ts.id,
#             'employee_name': f"{ts.fname} {ts.lname}",
#             'department': ts.department_name,
#             'week_start_date': ts.week_start_date.strftime('%Y-%m-%d'),
#             # 'submitted_date': ts.submitted_date.strftime('%Y-%m-%d') if ts.submitted_date else '',
#             'total_hours': float(ts.total_hours),
#             'status': ts.status,
#             'comments': ts.comments
#         } for ts in results]

#         return render_template(
#             'approval_history.html',
#             employees=employees,
#             departments=departments,
#             selected_department=selected_department,
#             timesheets=timesheets_data
#         )

#     except Exception as e:
#         print(f"Error in approval_history: {str(e)}")
#         flash('Error fetching approval history', 'error')
#         return redirect(url_for('dashboard'))

# @app.route("/dashboard/approve_timesheets/approval_history")
# def approval_history():
#     if 'user_id' not in session:
#         flash('Please log in to continue', 'error')
#         return redirect(url_for('login'))

#     approver_id = session['user_id']

#     try:
#         # ✅ Employees under the approver
#         employees = Employee_Info.query.filter_by(approver_id=approver_id).all()
#         emp_ids = [emp.empid for emp in employees]

#         # ✅ Department list for dropdown
#         departments = Department.query.all()

#         # ✅ Filters from GET
#         selected_department = request.args.get('department', '').strip()
#         employee_name = request.args.get('employee_name', '').strip()
#         status = request.args.get('status', '').strip().title()
#         date_range = request.args.get('date_range', '').strip()
#         custom_start_date = request.args.get('custom_start_date', '').strip()
#         custom_end_date = request.args.get('custom_end_date', '').strip()

#         print(f"🔍 Filters => Dept: '{selected_department}', Emp: '{employee_name}', "
#               f"Status: '{status}', Date Range: '{date_range}', "
#               f"Custom: {custom_start_date} to {custom_end_date}")
    

#         # ✅ Base query
#         timesheets_query = (
#             db.session.query(
#                 Timesheet.id,
#                 Timesheet.week_start_date,
#                 Timesheet.submitted_date,
#                 Timesheet.empid,
#                 Employee_Info.fname,
#                 Employee_Info.lname,
#                 Department.dept_name.label("department_name"),
#                 Timesheet.status,
#                 Timesheet.comments,
#                 func.coalesce(func.sum(TimesheetEntry.hours_worked), 0).label("total_hours")
#             )
#             .join(Employee_Info, Employee_Info.empid == Timesheet.empid)
#             .join(Department, Department.id == Employee_Info.dept_id)
#             .outerjoin(TimesheetEntry, TimesheetEntry.timesheet_id == Timesheet.id)
#             .filter(Timesheet.empid.in_(emp_ids))
#         )

#         # Department filter
#         if selected_department:
#             timesheets_query = timesheets_query.filter(Employee_Info.dept_id == int(selected_department))

#         # Employee name filter
#         if employee_name:
#             timesheets_query = timesheets_query.filter(
#                 func.lower(func.concat(Employee_Info.fname, ' ', Employee_Info.lname))
#                 .ilike(f"%{employee_name.lower()}%")
#             )

#         # Get today's date without time
#         today = datetime.today().date()

#         # Apply Status filter
#         if status:
#             if status.lower() == "pending":
#                 timesheets_query = timesheets_query.filter(Timesheet.status == "Submitted")
#             else:
#                 timesheets_query = timesheets_query.filter(Timesheet.status == status)

#         # Apply Date range filter
#         if date_range == "this_week":
#             start = today - timedelta(days=today.weekday())  # Monday of this week
#             end = start + timedelta(days=6)                  # Sunday of this week
#             timesheets_query = timesheets_query.filter(
#                 Timesheet.week_start_date.between(start, end)
#             )

#         elif date_range == "last_week":
#             start = today - timedelta(days=today.weekday() + 7)  # Monday of last week
#             end = start + timedelta(days=6)                      # Sunday of last week
#             timesheets_query = timesheets_query.filter(
#                 Timesheet.week_start_date.between(start, end)
#             )

#         elif date_range == "custom" and custom_start_date and custom_end_date:
#             # Ensure they are date objects (if coming in as strings)
#             if isinstance(custom_start_date, str):
#                 custom_start_date = datetime.strptime(custom_start_date, "%Y-%m-%d").date()
#             if isinstance(custom_end_date, str):
#                 custom_end_date = datetime.strptime(custom_end_date, "%Y-%m-%d").date()

#             timesheets_query = timesheets_query.filter(
#                 Timesheet.week_start_date.between(custom_start_date, custom_end_date)
#             )
            
#         # ✅ Execute query
#         results = timesheets_query.group_by(
#             Timesheet.id,
#             Timesheet.week_start_date,
#             Timesheet.submitted_date,
#             Timesheet.empid,
#             Employee_Info.fname,
#             Employee_Info.lname,
#             Department.dept_name,
#             Timesheet.status,
#             Timesheet.comments
#         ).all()

#         timesheets_data = [{
#             'id': ts.id,
#             'employee_name': f"{ts.fname} {ts.lname}",
#             'department': ts.department_name,
#             'week_start_date': ts.week_start_date.strftime('%Y-%m-%d'),
#             'total_hours': float(ts.total_hours),
#             'status': ts.status,
#             'comments': ts.comments
#         } for ts in results]

#         print(f"✅ Query returned {len(timesheets_data)} rows")

#         return render_template(
#             'approval_history.html',
#             employees=employees,
#             departments=departments,
#             selected_department=selected_department,
#             timesheets=timesheets_data
#         )

#     except Exception as e:
#         print(f"❌ Error in approval_history: {str(e)}")
#         flash('Error fetching approval history', 'error')
#         return redirect(url_for('dashboard'))


# @app.route("/dashboard/approve_timesheets/delete/<int:timesheet_id>", methods=["POST"])
# def delete_timesheet(timesheet_id):
#     if 'user_id' not in session:
#         flash("Please log in to continue", "error")
#         return redirect(url_for("login"))

#     approver_id = session['user_id']
    

#     # Find timesheet
#     timesheet = Timesheet.query.get(timesheet_id)
#     if not timesheet:
#         flash("Timesheet not found.", "error")
#         return redirect(url_for("approval_history"))

#     # Check if this approver owns the employee
#     emp = Employee_Info.query.filter_by(empid=timesheet.empid, approver_id=approver_id).first()
#     if not emp:
#         flash("You are not authorized to delete this timesheet.", "error")
#         return redirect(url_for("approval_history"))

#     # Only allow deleting approved timesheets
#     if timesheet.status != "Approved":
#         flash("Only approved timesheets can be deleted.", "error")
#         return redirect(url_for("approval_history"))

#     try:
#         # Delete all related timesheet entries first
#         TimesheetEntry.query.filter_by(timesheet_id=timesheet.id).delete()

#         # Delete timesheet
#         db.session.delete(timesheet)
#         db.session.commit()

#         flash("Approved timesheet deleted. Employee can now resubmit for that week.", "success")
#     except Exception as e:
#         db.session.rollback()
#         flash(f"Error deleting timesheet: {str(e)}", "error")

#     return redirect(url_for("approval_history"))


# @app.route("/dashboard/approve_timesheets/download_csv")
# def download_approval_history_csv():
#     if 'user_id' not in session:
#         flash('Please log in to continue', 'error')
#         return redirect(url_for('login'))

#     approver_id = session['user_id']

#     try:
#         # ✅ Employees under approver
#         employees = Employee_Info.query.filter_by(approver_id=approver_id).all()
#         emp_ids = [emp.empid for emp in employees]

#         # ✅ Filters from GET
#         selected_department = request.args.get('department', '').strip()
#         employee_name = request.args.get('employee_name', '').strip()
#         status = request.args.get('status', '').strip().title()
#         date_range = request.args.get('date_range', '').strip()
#         custom_start_date = request.args.get('custom_start_date', '').strip()
#         custom_end_date = request.args.get('custom_end_date', '').strip()

#         today = datetime.today().date()

#         # ✅ Base query (without total_hours)
#         timesheets_query = (
#             db.session.query(
#                 Timesheet.id,
#                 Timesheet.week_start_date,
#                 Timesheet.submitted_date,
#                 Timesheet.empid,
#                 Employee_Info.fname,
#                 Employee_Info.lname,
#                 Department.dept_name.label("department_name"),
#                 Timesheet.status,
#                 Timesheet.comments
#             )
#             .join(Employee_Info, Employee_Info.empid == Timesheet.empid)
#             .join(Department, Department.id == Employee_Info.dept_id)
#             .filter(Timesheet.empid.in_(emp_ids))
#         )

#         # ✅ Department filter
#         if selected_department:
#             timesheets_query = timesheets_query.filter(Employee_Info.dept_id == int(selected_department))

#         # ✅ Employee name filter
#         if employee_name:
#             timesheets_query = timesheets_query.filter(
#                 func.lower(func.concat(Employee_Info.fname, ' ', Employee_Info.lname))
#                 .ilike(f"%{employee_name.lower()}%")
#             )

#         # ✅ Status filter
#         if status:
#             if status.lower() == "pending":
#                 timesheets_query = timesheets_query.filter(Timesheet.status == "Submitted")
#             else:
#                 timesheets_query = timesheets_query.filter(Timesheet.status == status)

#         # ✅ Date range filter
#         if date_range == "this_week":
#             start = today - timedelta(days=today.weekday())
#             end = start + timedelta(days=6)
#             timesheets_query = timesheets_query.filter(Timesheet.week_start_date.between(start, end))

#         elif date_range == "last_week":
#             start = today - timedelta(days=today.weekday() + 7)
#             end = start + timedelta(days=6)
#             timesheets_query = timesheets_query.filter(Timesheet.week_start_date.between(start, end))

#         elif date_range == "custom" and custom_start_date and custom_end_date:
#             if isinstance(custom_start_date, str):
#                 custom_start_date = datetime.strptime(custom_start_date, "%Y-%m-%d").date()
#             if isinstance(custom_end_date, str):
#                 custom_end_date = datetime.strptime(custom_end_date, "%Y-%m-%d").date()

#             timesheets_query = timesheets_query.filter(
#                 Timesheet.week_start_date.between(custom_start_date, custom_end_date)
#             )

#         # ✅ Execute query
#         results = timesheets_query.group_by(
#             Timesheet.id,
#             Timesheet.week_start_date,
#             Timesheet.submitted_date,
#             Timesheet.empid,
#             Employee_Info.fname,
#             Employee_Info.lname,
#             Department.dept_name,
#             Timesheet.status,
#             Timesheet.comments
#         ).all()

#         # ✅ Prepare CSV data (without total_hours)
#         csv_output = [["Timesheet ID", "Employee Name", "Department", "Week Start Date", "Submitted Date", "Status", "Comments"]]
#         for ts in results:
#             csv_output.append([
#                 ts.id,
#                 f"{ts.fname} {ts.lname}",
#                 ts.department_name,
#                 ts.week_start_date.strftime("%Y-%m-%d") if ts.week_start_date else "",
#                 ts.submitted_date.strftime("%Y-%m-%d") if ts.submitted_date else "",
#                 ts.status,
#                 ts.comments or ""
#             ])

#         # ✅ Stream CSV
#         def generate():
#             for row in csv_output:
#                 yield ",".join(map(str, row)) + "\n"

#         response = Response(generate(), mimetype="text/csv")
#         response.headers["Content-Disposition"] = "attachment; filename=approval_history.csv"
#         return response

#     except Exception as e:
#         print(f"❌ Error in download_approval_history_csv: {str(e)}")
#         flash("Error generating CSV", "error")
#         return redirect(url_for("dashboard"))


# @app.route("/timesheetdashboard/approve_timesheets/approval_history_json")
# def approval_history_json():
#     if 'user_id' not in session:
#         return jsonify({"error": "Unauthorized"}), 401

#     approver_id = session['user_id']

#     try:
#         # Employees under this approver
#         employees = Employee_Info.query.filter_by(approver_id=approver_id).all()
#         emp_ids = [emp.empid for emp in employees]

#         # Department list
#         departments = Department.query.all()

#         # Filters
#         selected_department = request.args.get('department', '').strip()
#         employee_name = request.args.get('employee_name', '').strip()
#         status = request.args.get('status', '').strip().title()
#         date_range = request.args.get('date_range', '').strip()
#         custom_start_date = request.args.get('custom_start_date', '').strip()
#         custom_end_date = request.args.get('custom_end_date', '').strip()

#         today = datetime.today().date()

#         # Base Query
#         timesheets_query = (
#             db.session.query(
#                 Timesheet.id,
#                 Timesheet.week_start_date,
#                 Timesheet.submitted_date,
#                 Timesheet.empid,
#                 Employee_Info.fname,
#                 Employee_Info.lname,
#                 Department.dept_name.label("department_name"),
#                 Timesheet.status,
#                 Timesheet.comments,
#                 func.coalesce(func.sum(TimesheetEntry.hours_worked), 0).label("total_hours")
#             )
#             .join(Employee_Info, Employee_Info.empid == Timesheet.empid)
#             .join(Department, Department.id == Employee_Info.dept_id)
#             .outerjoin(TimesheetEntry, TimesheetEntry.timesheet_id == Timesheet.id)
#             .filter(Timesheet.empid.in_(emp_ids))
#         )

#         # Department filter
#         if selected_department:
#             timesheets_query = timesheets_query.filter(
#                 Employee_Info.dept_id == int(selected_department)
#             )

#         # Employee name filter
#         if employee_name:
#             timesheets_query = timesheets_query.filter(
#                 func.lower(func.concat(Employee_Info.fname, ' ', Employee_Info.lname))
#                 .ilike(f"%{employee_name.lower()}%")
#             )

#         # # Status filter
#         # if status:
#         #     if status.lower() == "pending":
#         #         timesheets_query = timesheets_query.filter(Timesheet.status == "Submitted")
#         #     else:
#         #         timesheets_query = timesheets_query.filter(Timesheet.status == status)
#         status = request.args.get('status', '').strip()

#         if status:
#             if status == "Pending":
#                 timesheets_query = timesheets_query.filter(Timesheet.status == "Submitted")
#             elif status == "Rejected":
#                 timesheets_query = timesheets_query.filter(Timesheet.status == "Rejected")
#             elif status == "Approved":
#                 timesheets_query = timesheets_query.filter(Timesheet.status == "Approved")


#         # Date Range Filter
#         if date_range == "this_week":
#             start = today - timedelta(days=today.weekday())
#             end = start + timedelta(days=6)
#             timesheets_query = timesheets_query.filter(Timesheet.week_start_date.between(start, end))

#         elif date_range == "last_week":
#             start = today - timedelta(days=today.weekday() + 7)
#             end = start + timedelta(days=6)
#             timesheets_query = timesheets_query.filter(Timesheet.week_start_date.between(start, end))

#         elif date_range == "custom" and custom_start_date and custom_end_date:
#             custom_start_date = datetime.strptime(custom_start_date, "%Y-%m-%d").date()
#             custom_end_date = datetime.strptime(custom_end_date, "%Y-%m-%d").date()
#             timesheets_query = timesheets_query.filter(
#                 Timesheet.week_start_date.between(custom_start_date, custom_end_date)
#             )

#         # Execute Query
#         results = timesheets_query.group_by(
#             Timesheet.id,
#             Timesheet.week_start_date,
#             Timesheet.submitted_date,
#             Timesheet.empid,
#             Employee_Info.fname,
#             Employee_Info.lname,
#             Department.dept_name,
#             Timesheet.status,
#             Timesheet.comments
#         ).all()

#         # Prepare JSON response
#         timesheets_data = [{
#             'id': ts.id,
#             'employee_name': f"{ts.fname} {ts.lname}",
#             'department': ts.department_name,
#             'week_start_date': ts.week_start_date.strftime('%Y-%m-%d'),
#             'submitted_date': ts.submitted_date.strftime('%Y-%m-%d') if ts.submitted_date else "",
#             'total_hours': float(ts.total_hours),
#             'status': ts.status,
#             'comments': ts.comments
#         } for ts in results]

#         return jsonify({
#             "employees": [{"empid": e.empid, "fname": e.fname, "lname": e.lname} for e in employees],
#             "departments": [{"id": d.id, "dept_name": d.dept_name} for d in departments],
#             "timesheets": timesheets_data
#         })

#     except Exception as e:
#         print("Error =>", str(e))
#         return jsonify({"error": "Server Error"}), 500


@app.route("/timesheetdashboard/approve_timesheets/approval_history_json")
def approval_history_json():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    approver_id = session['user_id']

    try:
        employees = Employee_Info.query.filter_by(approver_id=approver_id).all()
        emp_ids = [emp.empid for emp in employees]

        departments = Department.query.all()

        selected_department = request.args.get('department', '').strip()
        employee_name = request.args.get('employee_name', '').strip()
        status = request.args.get('status', '').strip()
        date_range = request.args.get('date_range', '').strip()
        custom_start_date = request.args.get('custom_start_date', '').strip()
        custom_end_date = request.args.get('custom_end_date', '').strip()

        today = datetime.today().date()

        timesheets_query = (
            db.session.query(
                Timesheet.id,
                Timesheet.week_start_date,
                Timesheet.submitted_date,
                Timesheet.empid,
                Employee_Info.fname,
                Employee_Info.lname,
                Department.dept_name.label("department_name"),
                Timesheet.status,
                Timesheet.comments,
                func.coalesce(func.sum(TimesheetEntry.hours_worked), 0).label("total_hours")
            )
            .join(Employee_Info, Employee_Info.empid == Timesheet.empid)
            .join(Department, Department.id == Employee_Info.dept_id)
            .outerjoin(TimesheetEntry, TimesheetEntry.timesheet_id == Timesheet.id)
            .filter(Timesheet.empid.in_(emp_ids))
        )

        # ✅ Department filter
        if selected_department and selected_department.isdigit():
            timesheets_query = timesheets_query.filter(
                Employee_Info.dept_id == int(selected_department)
            )

        # ✅ Employee name filter (SQLite-safe)
        if employee_name:
            timesheets_query = timesheets_query.filter(
                func.lower(Employee_Info.fname + ' ' + Employee_Info.lname)
                .ilike(f"%{employee_name.lower()}%")
            )

        # ✅ Status filter
        if status:
            if status.lower() == "pending":
                timesheets_query = timesheets_query.filter(Timesheet.status == "Submitted")
            else:
                timesheets_query = timesheets_query.filter(Timesheet.status == status)

        # ✅ Date filters
        if date_range == "this_week":
            start = today - timedelta(days=today.weekday())
            end = start + timedelta(days=6)
            timesheets_query = timesheets_query.filter(Timesheet.week_start_date.between(start, end))

        elif date_range == "last_week":
            start = today - timedelta(days=today.weekday() + 7)
            end = start + timedelta(days=6)
            timesheets_query = timesheets_query.filter(Timesheet.week_start_date.between(start, end))

        elif date_range == "custom" and custom_start_date and custom_end_date:
            start = datetime.strptime(custom_start_date, "%Y-%m-%d").date()
            end = datetime.strptime(custom_end_date, "%Y-%m-%d").date()
            timesheets_query = timesheets_query.filter(
                Timesheet.week_start_date.between(start, end)
            )

        results = timesheets_query.group_by(
            Timesheet.id,
            Timesheet.week_start_date,
            Timesheet.submitted_date,
            Timesheet.empid,
            Employee_Info.fname,
            Employee_Info.lname,
            Department.dept_name,
            Timesheet.status,
            Timesheet.comments
        ).all()

        timesheets_data = [{
            "id": ts.id,
            "employee_name": f"{ts.fname} {ts.lname}",
            "department": ts.department_name,
            "week_start_date": ts.week_start_date.strftime('%Y-%m-%d'),
            "submitted_date": ts.submitted_date.strftime('%Y-%m-%d') if ts.submitted_date else "",
            "total_hours": float(ts.total_hours),
            "status": ts.status,
            "comments": ts.comments
        } for ts in results]

        return jsonify({
            "employees": [{"empid": e.empid, "fname": e.fname, "lname": e.lname} for e in employees],
            "departments": [{"id": d.id, "dept_name": d.dept_name} for d in departments],
            "timesheets": timesheets_data
        })

    except Exception as e:
        print("🔥 Approval History Error:", str(e))
        return jsonify({"error": "Server Error"}), 500




@app.route("/timesheetdashboard/approve_timesheets/delete/<int:timesheet_id>", methods=["POST"])
def delete_timesheet_json(timesheet_id):
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    approver_id = session["user_id"]

    timesheet = Timesheet.query.get(timesheet_id)
    if not timesheet:
        return jsonify({"error": "Timesheet not found"}), 404

    emp = Employee_Info.query.filter_by(empid=timesheet.empid, approver_id=approver_id).first()
    if not emp:
        return jsonify({"error": "Not authorized"}), 403

    if timesheet.status != "Approved":
        return jsonify({"error": "Only approved timesheets can be deleted"}), 400

    try:
        TimesheetEntry.query.filter_by(timesheet_id=timesheet_id).delete()
        db.session.delete(timesheet)
        db.session.commit()

        return jsonify({"message": "Approved timesheet deleted successfully"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



@app.route("/timesheetdashboard/approve_timesheets/download_csv")
def download_approval_history_csv():
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    approver_id = session['user_id']

    try:
        employees = Employee_Info.query.filter_by(approver_id=approver_id).all()
        emp_ids = [emp.empid for emp in employees]

        selected_department = request.args.get('department', '').strip()
        employee_name = request.args.get('employee_name', '').strip()
        status = request.args.get('status', '').strip().title()
        date_range = request.args.get('date_range', '').strip()
        custom_start_date = request.args.get('custom_start_date', '').strip()
        custom_end_date = request.args.get('custom_end_date', '').strip()

        today = datetime.today().date()

        # Base query (without hours)
        timesheets_query = (
            db.session.query(
                Timesheet.id,
                Timesheet.week_start_date,
                Timesheet.submitted_date,
                Employee_Info.fname,
                Employee_Info.lname,
                Department.dept_name.label("department_name"),
                Timesheet.status,
                Timesheet.comments
            )
            .join(Employee_Info, Employee_Info.empid == Timesheet.empid)
            .join(Department, Department.id == Employee_Info.dept_id)
            .filter(Timesheet.empid.in_(emp_ids))
        )

        # Apply filters (same as JSON)
        if selected_department:
            timesheets_query = timesheets_query.filter(Employee_Info.dept_id == int(selected_department))

        if employee_name:
            timesheets_query = timesheets_query.filter(
                func.lower(func.concat(Employee_Info.fname, " ", Employee_Info.lname))
                .ilike(f"%{employee_name.lower()}%")
            )

        if status:
            if status.lower() == "pending":
                timesheets_query = timesheets_query.filter(Timesheet.status == "Submitted")
            else:
                timesheets_query = timesheets_query.filter(Timesheet.status == status)

        if date_range == "this_week":
            start = today - timedelta(days=today.weekday())
            end = start + timedelta(days=6)
            timesheets_query = timesheets_query.filter(Timesheet.week_start_date.between(start, end))

        elif date_range == "last_week":
            start = today - timedelta(days=today.weekday() + 7)
            end = start + timedelta(days=6)
            timesheets_query = timesheets_query.filter(Timesheet.week_start_date.between(start, end))

        elif date_range == "custom" and custom_start_date and custom_end_date:
            start = datetime.strptime(custom_start_date, "%Y-%m-%d").date()
            end = datetime.strptime(custom_end_date, "%Y-%m-%d").date()
            timesheets_query = timesheets_query.filter(Timesheet.week_start_date.between(start, end))

        results = timesheets_query.group_by(
            Timesheet.id,
            Timesheet.week_start_date,
            Timesheet.submitted_date,
            Employee_Info.fname,
            Employee_Info.lname,
            Department.dept_name,
            Timesheet.status,
            Timesheet.comments
        ).all()

        csv_output = [["Timesheet ID", "Employee Name", "Department", "Week Start Date",
                       "Submitted Date", "Status", "Comments"]]

        for ts in results:
            csv_output.append([
                ts.id,
                f"{ts.fname} {ts.lname}",
                ts.department_name,
                ts.week_start_date.strftime("%Y-%m-%d") if ts.week_start_date else "",
                ts.submitted_date.strftime("%Y-%m-%d") if ts.submitted_date else "",
                ts.status,
                ts.comments or ""
            ])

        def generate():
            for row in csv_output:
                yield ",".join(map(str, row)) + "\n"

        response = Response(generate(), mimetype="text/csv")
        response.headers["Content-Disposition"] = "attachment; filename=approval_history.csv"
        return response

    except Exception as e:
        print("CSV Error =>", str(e))
        return jsonify({"error": "CSV generation failed"}), 500

# @app.route('/charge_code', methods=['GET', 'POST'])
# def charge_code():
#     if 'user_id' not in session:
#         return redirect(url_for('login'))

#     emp_id = session['user_id']
#     print(f"👤 Logged-in Employee ID: {emp_id}")

#     if request.method == 'POST':
#         selected_project_ids = set(map(int, request.form.getlist('project_ids')))
#         print(f"📥 Received Selected Project IDs: {selected_project_ids}")

#         existing_project_ids = {
#             p.project_id for p in Employee_Project.query.filter_by(empid=emp_id).all()
#         }
#         print(f"🔎 Existing Assigned Projects: {existing_project_ids}")

#         new_projects = selected_project_ids - existing_project_ids
#         print(f"New Projects to Add: {new_projects}")

#         for project_id in new_projects:
#             db.session.add(Employee_Project(empid=emp_id, project_id=project_id))

#         removed_projects = existing_project_ids - selected_project_ids
#         print(f"Projects to Remove: {removed_projects}")

#         if removed_projects:
#             Employee_Project.query.filter(
#                 Employee_Project.empid == emp_id,
#                 Employee_Project.project_id.in_(removed_projects)
#             ).delete(synchronize_session=False)

#         db.session.commit()
#         db.session.flush()
#         print("Changes saved to database!")
#         flash('Project assignments updated successfully!', 'success')

#     # ✅ Fetch assigned projects after update
#     assigned_project_ids = {
#         ep.project_id for ep in Employee_Project.query.filter_by(empid=emp_id).all()
#     }
#     print(f"Updated Assigned Projects: {assigned_project_ids}")

#     # ✅ Fetch assigned clients
#     today = date.today()
#     assigned_clients = db.session.query(Client_Info.clientID, Client_Info.client_name).join(
#         Client_Employee, Client_Employee.clientID == Client_Info.clientID
#     ).filter(
#         Client_Employee.empid == emp_id,
#         Client_Employee.start_date <= today,
#         (Client_Employee.end_date == None) | (Client_Employee.end_date >= today)
#     ).all()

#     # ✅ Fetch projects and group them under clients using client_id
#     client_projects = {}
#     for client in assigned_clients:
#         projects = db.session.query(
#             Project_Info.id, Project_Info.project_name, Project_Info.project_code
#         ).filter(Project_Info.client_id == client.clientID).all()

#         client_projects[client.clientID] = [
#             {
#                 "id": p.id,
#                 "name": p.project_name,
#                 "code": p.project_code,
#                 "checked": p.id in assigned_project_ids
#             }
#             for p in projects
#         ]
#         print(f"Client {client.clientID} ({client.client_name}) Projects: {client_projects[client.clientID]}")

#     return render_template(
#         'charge_code.html',
#         clients=assigned_clients,
#         client_projects=client_projects
#     )

@app.route('/api/add_project_in_timesheet/', methods=['GET', 'POST'])
def add_project_in_timesheet():

    empid = request.args.get("empid")
    print("🔍 Received empid:", empid)

    if not empid:
        return jsonify({"error": "empid required"}), 400

    # -----------------------------
    # POST → Save project updates
    # -----------------------------
    if request.method == "POST":
        data = request.json

        # Convert project_ids from strings → integers
        selected_project_ids = {int(pid) for pid in data.get("project_ids", [])}
        print("Selected:", selected_project_ids)

        # Fetch existing assigned projects
        existing = {
            p.project_id for p in Employee_Project.query.filter_by(empid=empid).all()
        }
        print("Existing:", existing)

        # New projects to add
        new_projects = selected_project_ids - existing
        print("To Add:", new_projects)

        for pid in new_projects:
            db.session.add(Employee_Project(empid=empid, project_id=pid))

        # Projects to remove
        removed = existing - selected_project_ids
        print("To Remove:", removed)

        if removed:
            Employee_Project.query.filter(
                Employee_Project.empid == empid,
                Employee_Project.project_id.in_(removed)
            ).delete(synchronize_session=False)

        # Commit changes
        db.session.commit()
        print("Commit successful!")

        return jsonify({"message": "Project assignments updated successfully!"})

    # -----------------------------
    # GET → Return data for React UI
    # -----------------------------
    today = date.today()

    assigned_clients = db.session.query(
        Client_Info.clientID,
        Client_Info.client_name
    ).join(
        Client_Employee, Client_Employee.clientID == Client_Info.clientID
    ).filter(
        Client_Employee.empid == empid,
        Client_Employee.start_date <= today,
        (Client_Employee.end_date == None) | (Client_Employee.end_date >= today)
    ).all()

    print("🟢 Clients found:", assigned_clients)

    client_list = [
        {"clientID": c.clientID, "client_name": c.client_name}
        for c in assigned_clients
    ]

    client_projects = {}
    for c in assigned_clients:
        rows = Project_Info.query.filter_by(client_id=c.clientID).all()
        client_projects[c.clientID] = [
            {"id": p.id, "name": p.project_name, "code": p.project_code}
            for p in rows
        ]

    assigned_project_ids = [
        ep.project_id for ep in Employee_Project.query.filter_by(empid=empid).all()
    ]

    return jsonify({
        "clients": client_list,
        "client_projects": client_projects,
        "assigned_projects": assigned_project_ids
    })

 
@app.route('/get_projects/<int:client_id>')
def get_projects(client_id):
    if 'user_id' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    emp_id = session['user_id']

    # ✅ Check if client exists (optional but good practice)
    client = db.session.query(Client_Info).filter(Client_Info.clientID == client_id).first()
    if not client:
        return jsonify({"error": "Client not found"}), 404

    print(f"✅ Found client: {client.client_name} (ID: {client.clientID})")

    # 🔗 Get assigned project IDs for employee
    assigned_project_ids = {
        ep.project_id for ep in Employee_Project.query.filter_by(empid=emp_id).all()
    }
    print(f"🔗 Assigned Project IDs: {assigned_project_ids}")

    # ✅ Fetch projects under the given client_id
    projects = db.session.query(
        Project_Info.id, Project_Info.project_name, Project_Info.project_code
    ).filter(Project_Info.client_id == client_id).all()

    if not projects:
        print(f"⚠️ No projects found for client ID {client_id}")
        return jsonify([])

    project_list = [
        {
            "id": p.id,
            "name": p.project_name,
            "code": p.project_code,
            "checked": p.id in assigned_project_ids
        }
        for p in projects
    ]

    print(f"📜 Returning projects: {project_list}")
    return jsonify(project_list)



@app.route('/get_timesheet_data/<week_start>')
def get_timesheet_data(week_start):
    print(f"\n [ROUTE] get_timesheet_data called with week_start: {week_start}")

    if 'user_id' not in session:
        print(" [ERROR] Unauthorized access - no user_id in session")
        return jsonify({"error": "Unauthorized"}), 401

    emp_id = session['user_id']
    print(f"👤 [SESSION] Logged-in Employee ID: {emp_id}")

    try:
        start_date = datetime.strptime(week_start, '%Y-%m-%d').date()
    except ValueError:
        print("[ERROR] Invalid date format for week_start")
        return jsonify({"error": "Invalid date format"}), 400

    end_date = start_date + timedelta(days=6)
    print(f"[WEEK RANGE] Start: {start_date} ➡️ End: {end_date}")

    # ✅ Fetch timesheet status
    ts_record = Timesheet.query.filter_by(empid=emp_id, week_start_date=start_date).first()
    ts_status = ts_record.status if ts_record else "Not Submitted"
    print(f" [TIMESHEET STATUS] {ts_status}")

    # ✅ Fetch assigned project IDs
    assigned_project_ids = {
        ep.project_id for ep in Employee_Project.query.filter_by(empid=emp_id).all()
    }
    print(f"🔗 [ASSIGNED PROJECTS] {assigned_project_ids}")

    # ✅ Fetch actual timesheet entries
    entries = db.session.query(
        TimesheetEntry.project_id,
        TimesheetEntry.work_date,
        db.func.sum(TimesheetEntry.hours_worked).label('daily_hours')
    ).filter(
        TimesheetEntry.empid == emp_id,
        TimesheetEntry.work_date.between(start_date, end_date)
    ).group_by(
        TimesheetEntry.project_id,
        TimesheetEntry.work_date
    ).all()

    print("🗂️ [DB RAW ENTRIES] Timesheet Entries from DB:")
    for entry in entries:
        print(f"    ▶️ Project ID: {entry.project_id}, Date: {entry.work_date}, Hours: {entry.daily_hours}")

    # ✅ Build timesheet data per project
    project_map = defaultdict(lambda: defaultdict(float))
    total_hours_by_day = defaultdict(float)
    total_weekly_hours = 0.0

    for pid, work_date, hours in entries:
        day = work_date.strftime('%a')
        hrs = float(hours)
        project_map[pid][day] = hrs
        total_hours_by_day[day] += hrs
        total_weekly_hours += hrs

    print("\n📊 [DAILY TOTALS]")
    for day, hrs in total_hours_by_day.items():
        print(f"    {day}: {hrs} hours")

    print(f"📈 [WEEKLY TOTAL HOURS] {total_weekly_hours} hours")

    # ✅ Conditionally add empty rows for assigned projects (only if Not Submitted)
    if ts_status == "Not Submitted":
        print("\n [INFO] Timesheet NOT submitted — adding all assigned projects to the UI.")
        for pid in assigned_project_ids:
            if pid not in project_map:
                print(f" [ADD] Assigned Project ID {pid} has no entries — adding empty row")
                project_map[pid] = defaultdict(float)
    else:
        print(f"\n🚫 [INFO] Timesheet already '{ts_status}' — skipping unfilled assigned projects.")

    # ✅ Build final project list
    result = []
    for pid, day_hours in project_map.items():
        project = Project_Info.query.get(pid)
        if not project:
            print(f"⚠️ [WARNING] Project not found for ID {pid}, skipping...")
            continue
        
        client = Client_Info.query.get(project.client_id)
        client_name = client.client_name if client else "Unknown"

        print(f"\n🧩 [PROJECT] {project.project_name} | Client: {client_name}")

        # Ensure all 7 days are present
        full_day_hours = {day: day_hours.get(day, 0.0) for day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
        row_total = sum(full_day_hours.values())
        print(f"    ⏱️ Row total: {row_total} hours")
        print(f"    📅 Day-wise: {full_day_hours}")

        result.append({
            "project_name": project.project_name,
            "client_name": client_name,
            "hours_by_day": full_day_hours,
            "row_total": row_total
        })

    # ✅ Final response
    final_response = {
        "week_start": str(start_date),
        "week_end": str(end_date),
        "ts_status": ts_status,
        "weekly_total_hours_by_day": dict(total_hours_by_day),
        "weekly_total_hours": total_weekly_hours,
        "entries": result
    }

    print("\n✅ [FINAL RESPONSE JSON] Payload to frontend:")
    print(json.dumps(final_response, indent=2, default=str))

    return jsonify(final_response)



#######################Timesheet Part-END###########################




############leave management start##############################
# @app.route('/emp_leave_dashboard')
# def emp_leave_dashboard():
#     try:
#         # Get logged-in user's ID
#         user_id = session.get("user_id")
#         print(f"User ID: {user_id}")  # Debug print
 
#         if not user_id:
#             flash('Please login first', 'error')
#             return redirect(url_for('login'))
 
#         # Fetch leave balance for the logged-in user
#         leave_balance = db.session.query(Leave_Balance).filter_by(empid=user_id).first()
 
#         # Set balance
#         balance = {
#             'sick_leave': leave_balance.sick_leave if leave_balance else 0,
#             'restricted_holiday': leave_balance.restricted_holiday if leave_balance else 0,
#             'earned_leave': leave_balance.earned_leave if leave_balance else 0
#         }
 
#         # Fetch leave history for the logged-in user
#         leave_history = db.session.execute(
#             text('''
#                 SELECT
#                     lr.id,
#                     lr.leave_type,
#                     lr.start_date,
#                     lr.end_date,
#                     lr.total_days,
#                     lr.reason,
#                     lr.status,
#                     lr.approver_id,
#                     lr.applied_on,
#                     lr.comments
#                 FROM leave_requests lr
#                 WHERE lr.empid = :empid
#                 ORDER BY lr.start_date DESC
#             '''), {'empid': user_id}
#         ).fetchall()
 
#         leaves = []
#         for leave in leave_history:
#             try:
#                 from_date = datetime.strptime(leave[2], '%Y-%m-%d') if isinstance(leave[2], str) else leave[2]
#                 to_date = datetime.strptime(leave[3], '%Y-%m-%d') if isinstance(leave[3], str) else leave[3]
#                 leaves.append({
#                     'id': leave[0],
#                     'leave_type': leave[1],
#                     'from_date': from_date,
#                     'to_date': to_date,
#                     'total_days': leave[4],
#                     'reason': leave[5],
#                     'status': leave[6],
#                     'approver_id': leave[7],
#                     'applied_on': leave[8],
#                     'comments': leave[9],
#                     'can_cancel': leave[6] == 'Pending'
#                 })
#             except Exception as e:
#                 print(f"Error processing leave record: {str(e)}")
#                 continue
 
#         # Fetch all holidays from the Holidays table
#         # holidays = db.session.query(Holidays).order_by(Holidays.start_date.asc()).all()
 
#         # Get today's date
#         today = datetime.now().date()
 
#         # Fetch holidays with start_date greater than today, sorted in ascending order
#         holidays = db.session.query(Holidays).filter(Holidays.start_date > today).order_by(Holidays.start_date.asc()).all()
 
#         return render_template('emp_leave_dashboard.html',
#                                balance=balance,
#                                leaves=leaves,
#                                holidays=holidays)  # Pass holidays to template
 
#     except Exception as e:
#         print(f"Dashboard Error: {str(e)}")
#         import traceback
#         print(traceback.format_exc())  # Print full error stack
#         flash('Error loading dashboard. Please contact support.', 'error')
#         return redirect(url_for('login'))

# @app.route('/emp_leave_dashboard')
# def emp_leave_dashboard():
#     try:
#         user_id = session.get("user_id")
#         print(f"User ID: {user_id}")  # Debug print

#         if not user_id:
#             flash('Please login first', 'error')
#             return redirect(url_for('login'))

#         # Fetch all leave balances for the logged-in user
#         leave_balances = db.session.query(Leave_Balance).join(LeaveType).filter(Leave_Balance.empid == user_id).all()

#         # Map to dictionary like {'sick_leave': 5.0, 'earned_leave': 10.0, ...}
#         balance = {
#             lb.leave_type.leave_type.lower().replace(" ", "_"): lb.balance
#             for lb in leave_balances
#         }

#        # Get all leave types from the DB
#         leave_types = LeaveType.query.all()

#         # Make sure every leave type has a default entry in balance
#         for lt in leave_types:
#             key = lt.leave_type.lower().replace(" ", "_")
#             balance.setdefault(key, 0)


#         # Fetch leave history
#         leave_history = db.session.execute(
#             text('''
#                 SELECT
#                     lr.id,
#                     lr.leave_type,
#                     lr.start_date,
#                     lr.end_date,
#                     lr.total_days,
#                     lr.reason,
#                     lr.status,
#                     lr.approver_id,
#                     lr.applied_on,
#                     lr.comments
#                 FROM leave_requests lr
#                 WHERE lr.empid = :empid
#                 ORDER BY lr.start_date DESC
#             '''), {'empid': user_id}
#         ).fetchall()

#         leaves = []
#         for leave in leave_history:
#             try:
#                 from_date = datetime.strptime(leave[2], '%Y-%m-%d') if isinstance(leave[2], str) else leave[2]
#                 to_date = datetime.strptime(leave[3], '%Y-%m-%d') if isinstance(leave[3], str) else leave[3]
#                 leaves.append({
#                     'id': leave[0],
#                     'leave_type': leave[1],
#                     'from_date': from_date,
#                     'to_date': to_date,
#                     'total_days': leave[4],
#                     'reason': leave[5],
#                     'status': leave[6],
#                     'approver_id': leave[7],
#                     'applied_on': leave[8],
#                     'comments': leave[9],
#                     'can_cancel': leave[6] == 'Pending'
#                 })
#             except Exception as e:
#                 print(f"Error processing leave record: {str(e)}")
#                 continue

#         today = datetime.now().date()
#         holidays = db.session.query(Holidays).filter(Holidays.start_date > today).order_by(Holidays.start_date.asc()).all()

#         return render_template('emp_leave_dashboard.html',
#                                balance=balance,
#                                leaves=leaves,
#                                holidays=holidays)

#     except Exception as e:
#         print(f"Dashboard Error: {str(e)}")
#         import traceback
#         print(traceback.format_exc())
#         flash('Error loading dashboard. Please contact support.', 'error')
#         return redirect(url_for('login'))

@app.route('/api/emp_leave_dashboard')
def emp_leave_dashboard():
    try:
        user_id = session.get("user_id")
        if not user_id:
            return {"error": "Unauthorized"}, 401

        # Leave balances
        leave_balances = db.session.query(Leave_Balance).join(LeaveType) \
            .filter(Leave_Balance.empid == user_id).all()

        balance = {
            lb.leave_type.leave_type.lower().replace(" ", "_"): lb.balance
            for lb in leave_balances
        }

        # Ensure all types present
        for lt in LeaveType.query.all():
            key = lt.leave_type.lower().replace(" ", "_")
            balance.setdefault(key, 0)

        # Leave history (🚫 exclude canceled leaves)
        leave_history = db.session.execute(text('''
            SELECT id, leave_type, start_date, end_date, total_days,
                   reason, status, approver_id, applied_on, comments
            FROM leave_requests
            WHERE empid = :empid
              AND status != 'Canceled'   -- <-- HIDE canceled leaves
            ORDER BY start_date DESC
        '''), {"empid": user_id}).fetchall()

        leaves = []
        for leave in leave_history:
            leaves.append({
                "id": leave[0],
                "leave_type": leave[1],
                "from_date": str(leave[2]),
                "to_date": str(leave[3]),
                "reason": leave[5],
                "status": leave[6],
                "applied_on": str(leave[8]),
                "comments": leave[9]
            })

        # Upcoming holidays
        today = datetime.now().date()
        holiday_rows = Holidays.query.filter(
            Holidays.start_date > today
        ).order_by(Holidays.start_date.asc()).all()

        holidays = [{
            "id": h.id,
            "start_date": str(h.start_date),
            "holiday_type": h.holiday_type,
            "holiday_desc": h.holiday_desc
        } for h in holiday_rows]

        return {
            "balance": balance,
            "leaves": leaves,
            "holidays": holidays
        }

    except Exception as e:
        print(str(e))
        return {"error": "Server error"}, 500


# @app.route('/dashboard/apply_leave', methods=['GET', 'POST'])
# def apply_leave():
#     user_id = session.get("user_id")
#     if not user_id:
#         flash("Please log in to apply for leave", "error")
#         return redirect(url_for('login'))

#     empid = user_id

#     # ✅ Fetch public holidays (PH)
#     public_holidays = Holidays.query.filter_by(holiday_type="PH").all()
#     public_holiday_dates = {h.start_date for h in public_holidays}

#     # ✅ Fetch restricted holidays (RH)
#     current_date = datetime.now().date()
#     restricted_holidays = Holidays.query.filter(
#         (Holidays.holiday_type == "RH") & (Holidays.start_date >= current_date)
#     ).order_by(Holidays.start_date.asc()).all()

#     if request.method == 'POST':
#         try:
#             # ✅ Step 1: Parse input
#             leave_type_id = int(request.form['leave_type'])
#             start_date = datetime.strptime(request.form['start_date'], '%Y-%m-%d').date()
#             end_date = datetime.strptime(request.form['end_date'], '%Y-%m-%d').date()
#             reason = request.form['reason']
#             applied_on_date = datetime.now().date()

#             # ✅ Step 2: Get LeaveType object
#             leave_type_obj = LeaveType.query.filter_by(leave_id=leave_type_id).first()
#             if not leave_type_obj:
#                 flash("Invalid leave type selected.", "error")
#                 return redirect(url_for('apply_leave'))

#             leave_type_name = leave_type_obj.leave_type

#             # ✅ Step 3: Calculate total leave days
#             total_days = 0
#             leave_entries_list = []
#             current = start_date

#             while current <= end_date:
#                 if current.weekday() < 5 and current not in public_holiday_dates:
#                     leave_duration_key = f"leave_duration_{current.strftime('%Y-%m-%d')}"
#                     leave_duration = request.form.get(leave_duration_key, "Full Day")
#                     is_half_day = leave_duration == "Half Day"
#                     half_type = request.form.get(f"half_day_period_{current.strftime('%Y-%m-%d')}", None) if is_half_day else None
#                     total_days += 0.5 if is_half_day else 1

#                     leave_entries_list.append(
#                         Leave_Entries(
#                             date=current,
#                             is_half=is_half_day,
#                             half_type=half_type
#                         )
#                     )
#                 current += timedelta(days=1)

#             # ✅ Handle Restricted Holiday case
#             if leave_type_name == "Restricted Holiday":
#                 selected_rh_date = request.form.get("holiday_date")
#                 if not selected_rh_date:
#                     flash("Please select a restricted holiday date.", "error")
#                     return redirect(url_for('apply_leave'))

#                 selected_rh_date_obj = datetime.strptime(selected_rh_date, '%Y-%m-%d').date()
#                 total_days = 1  # RH is always 1 day

#                 leave_entries_list = [
#                     Leave_Entries(
#                         date=selected_rh_date_obj,
#                         is_half=False,
#                         half_type=None
#                     )
#                 ]

#                 start_date = end_date = selected_rh_date_obj

#             # ✅ Step 4: Check leave balance
#             leave_balance_record = Leave_Balance.query.filter_by(empid=empid, leave_id=leave_type_id).first()
#             available_balance = leave_balance_record.balance if leave_balance_record else 0

#             if total_days > available_balance:
#                 flash(f'Insufficient {leave_type_name} balance. Available: {available_balance} days, Requested: {total_days} days', 'error')
#                 return redirect(url_for('apply_leave'))

#             # ✅ Step 5: Insert leave request
#             new_leave_request = Leave_Request(
#                 empid=empid,
#                 leave_type=leave_type_name,
#                 start_date=start_date,
#                 end_date=end_date,
#                 total_days=total_days,
#                 reason=reason,
#                 applied_on=applied_on_date,
#                 status='Pending',
#             )
#             db.session.add(new_leave_request)
#             db.session.flush()

#             for entry in leave_entries_list:
#                 entry.leave_req_id = new_leave_request.id
#                 db.session.add(entry)

#             # ✅ Step 6: Deduct balance and commit
#             leave_balance_record.balance = available_balance - total_days
#             db.session.commit()

#             flash('Leave request submitted successfully!', 'success')
#             return redirect(url_for('emp_leave_dashboard'))

#         except Exception as e:
#             db.session.rollback()
#             flash(f'An error occurred: {str(e)}', 'error')
#             return redirect(url_for('apply_leave'))

#     # ✅ GET: Load leave form
#     leave_balances = Leave_Balance.query.options(joinedload(Leave_Balance.leave_type)).filter_by(empid=empid).all()

#     public_holidays_data = [{"start_date": h.start_date.strftime('%Y-%m-%d')} for h in public_holidays]
#     restricted_holiday_data = [
#         {
#             'start_date': h.start_date.strftime('%Y-%m-%d'),
#             'description': h.holiday_desc  # 'dc' is your holiday description field
#         }
#         for h in restricted_holidays
#     ]

#     disable_submit = all(lb.balance <= 0 for lb in leave_balances)

#     return render_template(
#         'apply_leave.html',
#         leave_balance=leave_balances,
#         public_holidays=public_holidays_data,
#         holidays=restricted_holiday_data,
#         restricted_holidays=restricted_holidays,
#         disable_submit=disable_submit
#     )


@app.route('/api/apply_leave', methods=['GET', 'POST'])
def apply_leave():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
 
    empid = user_id
 
    if request.method == "GET":
        # GET: return data for the form
        public_holidays = Holidays.query.filter_by(holiday_type="PH").all()
        public_holidays_data = [{"start_date": h.start_date.strftime('%Y-%m-%d')} for h in public_holidays]
 
        today = datetime.now().date()
        restricted_holidays = Holidays.query.filter(
            (Holidays.holiday_type == "RH") & (Holidays.start_date >= today)
        ).order_by(Holidays.start_date.asc()).all()
        restricted_holiday_data = [
            {"start_date": h.start_date.strftime('%Y-%m-%d'), "description": h.holiday_desc}
            for h in restricted_holidays
        ]
 
        # leave balances for the user
        leave_balances = Leave_Balance.query.options(joinedload(Leave_Balance.leave_type)).filter_by(empid=empid).all()
        leave_balance_data = []
        for lb in leave_balances:
            leave_balance_data.append({
                "leave_id": lb.leave_type.leave_id if hasattr(lb.leave_type, 'leave_id') else lb.leave_id,
                "leave_type": {"leave_type": lb.leave_type.leave_type} if hasattr(lb.leave_type, 'leave_type') else {"leave_type": str(lb.leave_type)},
                "balance": float(lb.balance)
            })
 
        disable_submit = all(lb.balance <= 0 for lb in leave_balances)
 
        return jsonify({
            "leave_balance": leave_balance_data,
            "public_holidays": public_holidays_data,
            "restricted_holidays": restricted_holiday_data,
            "disable_submit": disable_submit
        }), 200
 
    # POST: accept JSON payload from React
    try:
        data = request.get_json()
        # Extract
        leave_type_id = int(data.get("leave_type_id"))
        start_date = datetime.strptime(data.get("start_date"), "%Y-%m-%d").date()
        end_date = datetime.strptime(data.get("end_date"), "%Y-%m-%d").date()
        reason = data.get("reason", "")
        applied_on_date = datetime.now().date()
        leave_entries_payload = data.get("leave_entries", [])
        holiday_date = data.get("holiday_date")  # for RH
 
        # Validate leave type
        leave_type_obj = LeaveType.query.filter_by(leave_id=leave_type_id).first()
        if not leave_type_obj:
            return jsonify({"status": "error", "message": "Invalid leave type."}), 400
 
        leave_type_name = leave_type_obj.leave_type
 
        leave_entries_list = []
        total_days = 0.0
 
        # compute entries for normal leave: payload should already contain entries
        if leave_type_name == "Restricted Holiday":
            if not holiday_date:
                return jsonify({"status": "error", "message": "Restricted holiday date missing."}), 400
            selected_rh_date = datetime.strptime(holiday_date, "%Y-%m-%d").date()
            total_days = 1.0
            # create a single Leave_Entries
            leave_entries_list.append(Leave_Entries(date=selected_rh_date, is_half=False, half_type=None))
            start_date = selected_rh_date
            end_date = selected_rh_date
        else:
            # iterate over provided entries
            for ent in leave_entries_payload:
                date_str = ent.get("date")
                is_half = bool(ent.get("is_half", False))
                half_type = ent.get("half_type") if is_half else None
 
                if not date_str:
                    continue
                dt = datetime.strptime(date_str, "%Y-%m-%d").date()
                # Only count entries that are working days (you may want additional checks)
                # Check public holiday set
                ph_set = {h.start_date for h in Holidays.query.filter_by(holiday_type="PH").all()}
                if dt.weekday() < 5 and (dt not in ph_set):
                    total_days += 0.5 if is_half else 1.0
                    leave_entries_list.append(Leave_Entries(date=dt, is_half=is_half, half_type=half_type))
 
        # check available balance
        leave_balance_record = Leave_Balance.query.filter_by(empid=empid, leave_id=leave_type_id).first()
        available_balance = leave_balance_record.balance if leave_balance_record else 0
        if total_days > available_balance:
            return jsonify({"status": "error", "message": f"Insufficient balance (available {available_balance}, requested {total_days})"}), 400
 
        # Insert Leave_Request
        new_leave_request = Leave_Request(
            empid=empid,
            leave_type=leave_type_name,
            start_date=start_date,
            end_date=end_date,
            total_days=total_days,
            reason=reason,
            applied_on=applied_on_date,
            status='Pending'
        )
        db.session.add(new_leave_request)
        db.session.flush()  # get id
 
        # Add entries
        for entry in leave_entries_list:
            entry.leave_req_id = new_leave_request.id
            db.session.add(entry)
 
        # Deduct balance
        if leave_balance_record:
            leave_balance_record.balance = float(available_balance) - float(total_days)
 
        db.session.commit()
        return jsonify({"status": "success", "message": "Leave request submitted successfully!"}), 200
 
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
    

# @app.route('/cancel_leave', methods=['POST'])
# def cancel_leave():
   
#     leave_id = request.form.get('leave_id')
#     empid = session['user_id']
 
#     if not leave_id:
#         flash('Invalid request', 'error')
#         return redirect(url_for('dashboard'))
   
#     try:
#         leave_request = Leave_Request.query.filter_by(id=leave_id).first()
#         if leave_request.status != "Approved":
           
#             leave_request.status = "Canceled"
#             # db.session.delete(leave_request)
#             leave_id = leave_request.id
#             empid = leave_request.empid
#             total_days = leave_request.total_days
#             leave_type = leave_request.leave_type
#             leave_balance = Leave_Balance.query.filter_by(empid = empid).first()
           
#             if leave_type == "Sick Leave":
#                 leave_balance.sick_leave += total_days
#             elif leave_type == "Restricted Holiday":
#                 leave_balance.restricted_holiday += total_days
#             elif leave_type == "Paid Time Off":
#                 leave_balance.paid_time_off += total_days
 
#         else:
#             flash('Leave is already approved. You cannot cancle it now!', 'success')
#             return redirect(url_for('/empleavedashboard'))
 
#         db.session.commit()
#         flash('Leave cancelled successfully and balance updated', 'success')
#         return redirect(url_for('/empleavedashboard'))
       
#     except Exception as e:
#         # db.execute('ROLLBACK')
#         flash(f'Error cancelling leave: {str(e)}', 'error')
#         return redirect(url_for('dashboard'))


from flask import request, jsonify, session

@app.route("/cancel_leave", methods=["POST"])
def cancel_leave():
    try:
        data = request.get_json(silent=True) or {}
        leave_id = data.get("leave_id")
        empid = session.get("user_id")

        if not leave_id:
            return jsonify(success=False, message="Leave ID missing"), 400

        leave_request = Leave_Request.query.filter_by(
            id=leave_id, empid=empid
        ).first()

        if not leave_request:
            return jsonify(success=False, message="Leave not found"), 404

        if leave_request.status.lower() == "canceled":
            return jsonify(success=False, message="Already cancelled"), 400

        total_days = leave_request.total_days or 0
        leave_type_name = leave_request.leave_type

        # 🔑 Get same balance record used in apply_leave
        leave_type_obj = LeaveType.query.filter_by(
            leave_type=leave_type_name
        ).first()

        if not leave_type_obj:
            return jsonify(success=False, message="Leave type not found"), 400

        leave_balance = Leave_Balance.query.filter_by(
            empid=empid,
            leave_id=leave_type_obj.leave_id
        ).first()

        if not leave_balance:
            return jsonify(success=False, message="Leave balance not found"), 404

        # ✅ RESTORE BALANCE (THIS IS THE KEY FIX)
        leave_balance.balance = float(leave_balance.balance) + float(total_days)

        leave_request.status = "Canceled"
        db.session.commit()

        return jsonify(success=True, message="Leave cancelled & balance restored")

    except Exception as e:
        db.session.rollback()
        print("❌ CANCEL ERROR:", e)
        return jsonify(success=False, message=str(e)), 500

  


# @app.route('/dashboard/approve_leaves', methods=["GET", "POST"])
# def approve_leaves():
#     if "user_id" not in session:
#         flash("Please log in to continue", "error")
#         return redirect(url_for("auth.login"))
 
#     approver_id = session["user_id"]
 
#     if request.method == "POST":
#         try:
#             data = request.get_json()
#             leave_req_id = data.get("leave_req_id")
#             action = data.get("action")
#             comments = data.get("comments", "")
#             empid = data.get("empid")
 
#             leave_request = db.session.get(Leave_Request, leave_req_id)
#             if not leave_request:
#                 return jsonify({"success": False, "error": "Leave request not found"}), 404
 
#             if leave_request.status != "Canceled":
#                 leave_request.status = "Approved" if action == "approve" else "Rejected"
#                 leave_request.approver_id = approver_id
#                 leave_request.comments = comments if comments else ""
 
#                 if action != "approve":
#                     leave_balance = Leave_Balance.query.filter_by(empid=empid).first()
#                     if leave_balance:
#                         total_days = leave_request.total_days
#                         leave_type = leave_request.leave_type
 
#                         if leave_type == "Sick Leave":
#                             leave_balance.sick_leave += total_days
#                         elif leave_type == "Restricted Holiday":
#                             leave_balance.restricted_holiday += total_days
#                         elif leave_type == "Earned Leave":
#                             leave_balance.earned_leave += total_days
 
#                 db.session.commit()
 
#                 return jsonify({
#                     "success": True,
#                     "message": f"Leave request {action}d successfully",
#                     "new_status": leave_request.status,
#                     "saved_comments": leave_request.comments,
#                 })
#             else:
#                 flash('Leave is Canceled. You cannot act on it now!', 'success')
#                 return redirect(url_for('dashboard'))
 
#         except Exception as e:
#             db.session.rollback()
#             return jsonify({"success": False, "error": str(e)}), 500
 
#     # ✅ Get Direct Reports
#     direct_reports = Employee_Info.query.filter_by(approver_id=approver_id).all()
#     direct_emp_ids = [emp.empid for emp in direct_reports]
 
#     # ✅ Get Indirect Reports
#     indirect_reports = []
#     for emp in direct_reports:
#         second_level = Employee_Info.query.filter_by(approver_id=emp.empid).all()
#         for indirect_emp in second_level:
#             indirect_reports.append({
#                 "empid": indirect_emp.empid,
#                 "name": f"{indirect_emp.fname} {indirect_emp.lname}",
#                 "direct_reporter": emp.empid  # Stores direct reporter for filtering
#             })
 
#     all_reporting_ids = direct_emp_ids + [emp["empid"] for emp in indirect_reports]
 
#     # ✅ Query for leave requests
#     leave_requests = (
#         db.session.query(
#             Leave_Request.id,
#             Leave_Request.empid,
#             Leave_Request.leave_type,
#             Leave_Request.start_date,
#             Leave_Request.end_date,
#             Leave_Request.total_days,
#             Leave_Request.reason,
#             Leave_Request.status,
#             Employee_Info.fname,
#             Employee_Info.lname,
#             Employee_Info.approver_id
#         )
#         .join(Employee_Info, Employee_Info.empid == Leave_Request.empid)
#         .filter(Leave_Request.empid.in_(all_reporting_ids), Leave_Request.status == "Pending")
#     ).all()
 
#     # ✅ Prepare leave requests data
#     leave_requests_data = [
#         {
#             "id": lr.id,
#             "empid": lr.empid,
#             "employee_name": f"{lr.fname} {lr.lname}",
#             "leave_type": lr.leave_type,
#             "st_dt": lr.start_date.strftime("%Y-%m-%d"),
#             "ed_dt": lr.end_date.strftime("%Y-%m-%d"),
#             "total_days": float(lr.total_days),
#             "reason": lr.reason,
#             "status": lr.status,
#             "reporting_type": "Direct" if lr.empid in direct_emp_ids else "Indirect",
#             "direct_reporter": lr.approver_id  # Storing direct manager ID
#         }
#         for lr in leave_requests
#     ]
 
#     # ✅ Prepare direct reports dropdown data
#     direct_reports_data = [{"empid": emp.empid, "name": f"{emp.fname} {emp.lname}"} for emp in direct_reports]
 
#     return render_template(
#         "approve_leaves.html",
#         leave_requests=leave_requests_data,
#         direct_reports=direct_reports_data,
#     )
 
# @app.route('/dashboard/approve_leaves', methods=["GET", "POST"])
# def approve_leaves():
#     if "user_id" not in session:
#         flash("Please log in to continue", "error")
#         return redirect(url_for("auth.login"))

#     approver_id = session["user_id"]
#     is_leave_admin = session.get("is_leave_admin", False)

#     if request.method == "POST":
#         try:
#             data = request.get_json()
#             leave_requests = data.get("leave_requests", [])
#             single_leave = data.get("leave_req_id")

#             comments = data.get("comments", "")

#             if single_leave:
#                 leave_requests = [{
#                     "leave_req_id": single_leave,
#                     "action": data.get("action"),
#                     "empid": data.get("empid")
#                 }]

#             if not leave_requests:
#                 return jsonify({"success": False, "error": "No leave requests selected"}), 400

#             # ✅ Admin Approver Scope
#             approvable_ids = []
#             if is_leave_admin:
#                 # Only approve Senior Manager & Manager — meaning they have subordinates
#                 direct_reports_of_others = Employee_Info.query.with_entities(Employee_Info.approver_id).distinct()
#                 approvable_ids = [row.approver_id for row in direct_reports_of_others if row.approver_id]

#             for req in leave_requests:
#                 empid = req.get("empid")
#                 if is_leave_admin and empid not in approvable_ids:
#                     continue  # Skip - not in admin's scope

#                 leave_req_id = req.get("leave_req_id")
#                 action = req.get("action")

#                 leave_request = db.session.get(Leave_Request, leave_req_id)
#                 if not leave_request or leave_request.status == "Canceled":
#                     continue

#                 leave_request.status = "Approved" if action == "approve" else "Rejected"
#                 leave_request.approver_id = approver_id
#                 leave_request.comments = comments

#                 if action != "approve":
#                     leave_balance = Leave_Balance.query.filter_by(empid=empid).first()
#                     if leave_balance:
#                         if leave_request.leave_type == "Sick Leave":
#                             leave_balance.sick_leave += leave_request.total_days
#                         elif leave_request.leave_type == "Restricted Holiday":
#                             leave_balance.restricted_holiday += leave_request.total_days
#                         elif leave_request.leave_type == "Earned Leave":
#                             leave_balance.earned_leave += leave_request.total_days

#             db.session.commit()
#             return jsonify({"success": True, "message": f"{len(leave_requests)} leave request(s) processed."})

#         except Exception as e:
#             db.session.rollback()
#             return jsonify({"success": False, "error": str(e)}), 500

#     # ✅ View Logic
#     if is_leave_admin:
#         # Admin should only see leave requests of Senior Manager and Manager level
#         potential_approvers = Employee_Info.query.with_entities(Employee_Info.approver_id).distinct()
#         allowed_empids = [row.approver_id for row in potential_approvers if row.approver_id]

#         leave_requests = (
#             db.session.query(
#                 Leave_Request.id,
#                 Leave_Request.empid,
#                 Leave_Request.leave_type,
#                 Leave_Request.start_date,
#                 Leave_Request.end_date,
#                 Leave_Request.total_days,
#                 Leave_Request.reason,
#                 Leave_Request.status,
#                 Employee_Info.fname,
#                 Employee_Info.lname,
#                 Employee_Info.approver_id
#             )
#             .join(Employee_Info, Employee_Info.empid == Leave_Request.empid)
#             .filter(Leave_Request.empid.in_(allowed_empids), Leave_Request.status == "Pending")
#         ).all()
#     else:
#         # Normal approver logic (2-layer)
#         direct_reports = Employee_Info.query.filter_by(approver_id=approver_id).all()
#         direct_emp_ids = [emp.empid for emp in direct_reports]

#         indirect_reports = []
#         for emp in direct_reports:
#             second_level = Employee_Info.query.filter_by(approver_id=emp.empid).all()
#             for indirect_emp in second_level:
#                 indirect_reports.append({
#                     "empid": indirect_emp.empid,
#                     "name": f"{indirect_emp.fname} {indirect_emp.lname}",
#                     "direct_reporter": emp.empid
#                 })

#         all_reporting_ids = direct_emp_ids + [emp["empid"] for emp in indirect_reports]

#         leave_requests = (
#             db.session.query(
#                 Leave_Request.id,
#                 Leave_Request.empid,
#                 Leave_Request.leave_type,
#                 Leave_Request.start_date,
#                 Leave_Request.end_date,
#                 Leave_Request.total_days,
#                 Leave_Request.reason,
#                 Leave_Request.status,
#                 Employee_Info.fname,
#                 Employee_Info.lname,
#                 Employee_Info.approver_id
#             )
#             .join(Employee_Info, Employee_Info.empid == Leave_Request.empid)
#             .filter(Leave_Request.empid.in_(all_reporting_ids), Leave_Request.status == "Pending")
#         ).all()

#     leave_requests_data = [
#         {
#             "id": lr.id,
#             "empid": lr.empid,
#             "employee_name": f"{lr.fname} {lr.lname}",
#             "leave_type": lr.leave_type,
#             "st_dt": lr.start_date.strftime("%Y-%m-%d"),
#             "ed_dt": lr.end_date.strftime("%Y-%m-%d"),
#             "total_days": float(lr.total_days),
#             "reason": lr.reason,
#             "status": lr.status,
#             "reporting_type": "Admin" if is_leave_admin else "Direct/Indirect",
#             "direct_reporter": lr.approver_id
#         }
#         for lr in leave_requests
#     ]

#     return render_template(
#         "approve_leaves.html",
#         leave_requests=leave_requests_data,
#         direct_reports=[]  # Optional for admin view
#     )

 # --- GET leave requests (for React) ---
@app.route("/api/leave_requests", methods=["GET"])
def leave_requests():
    if "user_id" not in session:
        return jsonify({"error": "unauthenticated"}), 401

    approver_id = session["user_id"]
    is_leave_admin = session.get("is_leave_admin", False)

    # Build response similar to your earlier code
    if is_leave_admin:
        potential_approvers = Employee_Info.query.with_entities(Employee_Info.approver_id).distinct()
        allowed_empids = [row.approver_id for row in potential_approvers if row.approver_id]

        rows = (
            db.session.query(
                Leave_Request.id,
                Leave_Request.empid,
                Leave_Request.leave_type,
                Leave_Request.start_date,
                Leave_Request.end_date,
                Leave_Request.total_days,
                Leave_Request.reason,
                Leave_Request.status,
                Employee_Info.fname,
                Employee_Info.lname,
                Employee_Info.approver_id
            )
            .join(Employee_Info, Employee_Info.empid == Leave_Request.empid)
            .filter(Leave_Request.empid.in_(allowed_empids), Leave_Request.status == "Pending")
        ).all()
    else:
        direct_reports = Employee_Info.query.filter_by(approver_id=approver_id).all()
        direct_emp_ids = [emp.empid for emp in direct_reports]

        indirect_reports = []
        for emp in direct_reports:
            second_level = Employee_Info.query.filter_by(approver_id=emp.empid).all()
            for indirect_emp in second_level:
                indirect_reports.append({
                    "empid": indirect_emp.empid,
                    "name": f"{indirect_emp.fname} {indirect_emp.lname}",
                    "direct_reporter": emp.empid
                })

        all_reporting_ids = direct_emp_ids + [emp["empid"] for emp in indirect_reports]

        rows = (
            db.session.query(
                Leave_Request.id,
                Leave_Request.empid,
                Leave_Request.leave_type,
                Leave_Request.start_date,
                Leave_Request.end_date,
                Leave_Request.total_days,
                Leave_Request.reason,
                Leave_Request.status,
                Employee_Info.fname,
                Employee_Info.lname,
                Employee_Info.approver_id
            )
            .join(Employee_Info, Employee_Info.empid == Leave_Request.empid)
            .filter(Leave_Request.empid.in_(all_reporting_ids), Leave_Request.status == "Pending")
        ).all()

    leave_requests_data = [
        {
            "id": lr.id,
            "empid": lr.empid,
            "employee_name": f"{lr.fname} {lr.lname}",
            "leave_type": lr.leave_type,
            "st_dt": lr.start_date.strftime("%Y-%m-%d"),
            "ed_dt": lr.end_date.strftime("%Y-%m-%d"),
            "total_days": float(lr.total_days),
            "reason": lr.reason,
            "status": lr.status,
            "reporting_type": "Admin" if is_leave_admin else "Direct/Indirect",
            "direct_reporter": lr.approver_id
        }
        for lr in rows
    ]

    # Build direct_reports list for the indirect filter (only for non-admin)
    direct_reports_payload = []
    if not is_leave_admin:
        direct_reports_payload = [
            {"empid": d.empid, "name": f"{d.fname} {d.lname}"} for d in direct_reports
        ]

    return jsonify({
        "leave_requests": leave_requests_data,
        "direct_reports": direct_reports_payload,
        "is_leave_admin": is_leave_admin
    })


# --- POST approve/reject (from React) ---
@app.route("/api/approve_leaves", methods=["POST"])
def approve_leaves():
    if "user_id" not in session:
        return jsonify({"error": "unauthenticated"}), 401

    approver_id = session["user_id"]
    is_leave_admin = session.get("is_leave_admin", False)

    try:
        data = request.get_json() or {}
        leave_requests = data.get("leave_requests", [])
        comments = data.get("comments", "")

        if not leave_requests:
            return jsonify({"success": False, "error": "No leave requests provided"}), 400

        # Admin approver scope
        approvable_ids = []
        if is_leave_admin:
            direct_reports_of_others = Employee_Info.query.with_entities(Employee_Info.approver_id).distinct()
            approvable_ids = [row.approver_id for row in direct_reports_of_others if row.approver_id]

        processed_count = 0
        for req in leave_requests:
            empid = req.get("empid")
            if is_leave_admin and empid not in approvable_ids:
                continue  # skip outside admin scope

            leave_req_id = req.get("leave_req_id")
            action = req.get("action")

            leave_request = db.session.get(Leave_Request, leave_req_id)
            if not leave_request or leave_request.status == "Canceled":
                continue

            leave_request.status = "Approved" if action == "approve" else "Rejected"
            leave_request.approver_id = approver_id
            leave_request.comments = comments

            if action != "approve":
                leave_balance = Leave_Balance.query.filter_by(empid=empid).first()
                if leave_balance:
                    if leave_request.leave_type == "Sick Leave":
                        leave_balance.sick_leave += leave_request.total_days
                    elif leave_request.leave_type == "Restricted Holiday":
                        leave_balance.restricted_holiday += leave_request.total_days
                    elif leave_request.leave_type == "Paid Time Off":
                        leave_balance.paid_time_off += leave_request.total_days

            processed_count += 1

        db.session.commit()
        return jsonify({"success": True, "message": f"{processed_count} leave request(s) processed."})

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


# --- GET leave details (existing endpoint used by React) ---
@app.route("/api/get_leave_details/<int:leave_req_id>", methods=["GET"])
def get_leave_details(leave_req_id):
    if "user_id" not in session:
        return jsonify({"error": "unauthenticated"}), 401

    # You should implement DB query to fetch leave entries (dates / half day / half type)
    # Example:
    leave_request = db.session.get(Leave_Request, leave_req_id)
    if not leave_request:
        return jsonify({"error": "not found"}), 404

    # Suppose you have a Leave_Entry model that stores per-date rows for a leave
    try:
        entries = []
        if hasattr(leave_request, "entries"):
            for e in leave_request.entries:
                entries.append({
                    "date": e.date.strftime("%Y-%m-%d") if hasattr(e.date, "strftime") else str(e.date),
                    "is_half": bool(getattr(e, "is_half", False)),
                    "half_type": getattr(e, "half_type", None),
                })
        else:
            # If you store dates differently, adapt this block
            entries = []
        return jsonify({"leave_entries": entries})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
 
@app.route('/dashboard/get_leave_calendar_data', methods=["GET"])
def get_leave_calendar_data():
    if "user_id" not in session:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
 
    approver_id = session["user_id"]
 
    # Get Direct Reports
    direct_reports = Employee_Info.query.filter_by(approver_id=approver_id).all()
    direct_emp_ids = [emp.empid for emp in direct_reports]
 
    # Get Indirect Reports
    indirect_emp_ids = Employee_Info.query.filter(Employee_Info.approver_id.in_(direct_emp_ids)).with_entities(Employee_Info.empid).all()
    indirect_emp_ids = [emp.empid for emp in indirect_emp_ids]
 
    all_reporting_ids = direct_emp_ids + indirect_emp_ids
 
    # Fetch Approved Leaves
    leave_requests = (
        db.session.query(
            Leave_Request.empid,
            Leave_Request.leave_type,
            Leave_Request.start_date,
            Leave_Request.end_date,
            Employee_Info.fname,
            Employee_Info.lname
        )
        .join(Employee_Info, Employee_Info.empid == Leave_Request.empid)
        .filter(Leave_Request.empid.in_(all_reporting_ids), Leave_Request.status == "Approved")
        .all()
    )
 
    leave_data = [
        {
            "employee_name": f"{lr.fname} {lr.lname}",
            "leave_type": lr.leave_type,
            "start_date": lr.start_date.strftime("%Y-%m-%d"),
            "end_date": lr.end_date.strftime("%Y-%m-%d"),
        }
        for lr in leave_requests
    ]
    print(leave_data)
    return jsonify({"success": True, "leaves": leave_data})
 
@app.route('/dashboard/calendar_view')
def calendar_view():
    if "user_id" not in session:
        flash("Please log in to continue", "error")
        return redirect(url_for("auth.login"))
 
    return render_template("calendar_view.html")
 
 

# @app.route('/dashboard/approval_history_leaves', methods=["GET"])
# def approval_history_leaves():
#     if "user_id" not in session:
#         flash("Please log in to continue", "error")
#         return redirect(url_for("auth.login"))

#     approver_id = session["user_id"]

#     # ✅ Fetch leave history (Approved or Rejected) handled by approver
#     history_leaves_query = (
#         db.session.query(
#             Leave_Request.id,
#             Leave_Request.empid,
#             Leave_Request.leave_type,
#             Leave_Request.start_date,
#             Leave_Request.end_date,
#             Leave_Request.total_days,
#             Leave_Request.reason,
#             Leave_Request.status,
#             Leave_Request.approver_id,
#             Leave_Request.comments,
#             Employee_Info.fname,
#             Employee_Info.lname,
#             Department.dept_name.label("department_name")  # <-- update this if needed
#         )
#         .join(Employee_Info, Employee_Info.empid == Leave_Request.empid)
#         .join(Department, Department.id == Employee_Info.dept_id)
#         .filter(
#             Leave_Request.approver_id == approver_id,
#             Leave_Request.status.in_(["Approved", "Rejected"])
#         )
#         .all()
#     )

#     # ✅ Format the leave history
#     history_leaves_data = [
#         {
#             "id": lr.id,
#             "empid": lr.empid,
#             "employee_name": f"{lr.fname} {lr.lname}",
#             "dept": lr.department_name,
#             "leave_type": lr.leave_type,
#             "st_dt": lr.start_date.strftime("%Y-%m-%d"),
#             "ed_dt": lr.end_date.strftime("%Y-%m-%d"),
#             "total_days": float(lr.total_days),
#             "reason": lr.reason,
#             "status": lr.status,
#             "comments": lr.comments,
#         }
#         for lr in history_leaves_query
#     ]

#     # ✅ Dropdown for departments (based on department table)
#     departments = db.session.query(Department.dept_name).distinct().all()
#     departments = [d[0] for d in departments]

#     # ✅ Dropdown for employee names
#     employee_names = db.session.query(Employee_Info.fname, Employee_Info.lname).distinct().all()
#     employee_names = [f"{e[0]} {e[1]}" for e in employee_names]

#     return render_template(
#         "approval_history_leaves.html",
#         history_leaves=history_leaves_data,
#         departments=departments,
#         employee_names=employee_names,
#     )

@app.route("/api/approval_history_leaves", methods=["GET"])
def approval_history_leaves():
    if "user_id" not in session:
        return jsonify({"error": "unauthenticated"}), 401

    approver_id = session["user_id"]

    # Query leave requests approved/rejected by this approver
    history_query = (
        db.session.query(
            Leave_Request.id,
            Leave_Request.empid,
            Leave_Request.leave_type,
            Leave_Request.start_date,
            Leave_Request.end_date,
            Leave_Request.total_days,
            Leave_Request.reason,
            Leave_Request.status,
            Leave_Request.approver_id,
            Leave_Request.comments,
            Employee_Info.fname,
            Employee_Info.lname,
            Department.dept_name.label("department_name")
        )
        .join(Employee_Info, Employee_Info.empid == Leave_Request.empid)
        .join(Department, Department.id == Employee_Info.dept_id)
        .filter(
            Leave_Request.approver_id == approver_id,
            Leave_Request.status.in_(["Approved", "Rejected"])
        )
        .order_by(Leave_Request.start_date.desc())
        .all()
    )

    history = []
    for lr in history_query:
        history.append({
            "id": lr.id,
            "empid": lr.empid,
            "employee_name": f"{lr.fname} {lr.lname}",
            "dept": lr.department_name,
            "leave_type": lr.leave_type,
            "st_dt": lr.start_date.strftime("%Y-%m-%d") if lr.start_date else None,
            "ed_dt": lr.end_date.strftime("%Y-%m-%d") if lr.end_date else None,
            "total_days": float(lr.total_days) if lr.total_days is not None else 0,
            "reason": lr.reason,
            "status": lr.status,
            "comments": lr.comments,
            # optional fields for details
            "approver_id": lr.approver_id,
            # you can add approver_name or approved_on if available
        })

    # Departments list (distinct)
    departments_q = db.session.query(Department.dept_name).distinct().all()
    departments = [d[0] for d in departments_q]

    # Employees list (distinct full names)
    employees_q = db.session.query(Employee_Info.fname, Employee_Info.lname).distinct().all()
    employees = [f"{e[0]} {e[1]}" for e in employees_q]

    return jsonify({
        "history": history,
        "departments": departments,
        "employees": employees
    })
 


# @app.route('/dashboard/get_leave_details/<int:leave_req_id>', methods=["GET"])
# def get_leave_details(leave_req_id):
#     leave_entries = Leave_Entries.query.filter_by(leave_req_id=leave_req_id).all()
#     leave_entries_data = [
#         {
#             "date": entry.date.strftime("%Y-%m-%d"),
#             "is_half": entry.is_half,
#             "half_type": entry.half_type
#         } for entry in leave_entries
#     ]
    
#     return jsonify({"leave_entries": leave_entries_data})

@app.route("/download_leaves")
def download_leaves():
    if "user_id" not in session:
        flash("Please log in to continue", "error")
        return redirect(url_for("login"))

    # Join Leave_Request with Employee_Info and Department
    leaves = (
        db.session.query(
            Leave_Request.id,
            Leave_Request.empid,
            Employee_Info.fname,
            Employee_Info.lname,
            Department.dept_name,
            Leave_Request.leave_type,
            Leave_Request.start_date,
            Leave_Request.end_date,
            Leave_Request.total_days,
            Leave_Request.reason,
            Leave_Request.status,
            Leave_Request.comments,
        )
        .join(Employee_Info, Employee_Info.empid == Leave_Request.empid)
        .join(Department, Department.id == Employee_Info.dept_id)
        .all()
    )

    # Create an in-memory text stream to store CSV data
    output = io.StringIO()
    writer = csv.writer(output)

    # Write CSV header
    writer.writerow([
        "ID",
        "Employee ID",
        "Employee Name",
        "Department",
        "Leave Type",
        "Start Date",
        "End Date",
        "Total Days",
        "Reason",
        "Status",
        "Comments"
    ])

    # Write leave data rows
    for leave in leaves:
        writer.writerow([
            leave.id,
            leave.empid,
            f"{leave.fname} {leave.lname}",
            leave.dept_name,
            leave.leave_type,
            leave.start_date.strftime("%Y-%m-%d") if leave.start_date else "",
            leave.end_date.strftime("%Y-%m-%d") if leave.end_date else "",
            float(leave.total_days) if leave.total_days else 0,
            leave.reason,
            leave.status,
            leave.comments or ""
        ])

    # Reset stream position
    output.seek(0)

    # Return CSV as response
    return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=leaves_data.csv"}
    )
 

#############leave management end################################

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
 
