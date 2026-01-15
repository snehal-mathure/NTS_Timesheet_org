import pandas as pd
import re
from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from datetime import datetime

from models import (
    db,
    Employee_Info,
    Department,
    JobRole
)

employee_upload_bp = Blueprint("employee_upload", __name__)

def normalize_columns(df):
    df.columns = (
        df.columns
        .str.strip()
        .str.lower()
        .str.replace(" ", "_")
    )
    return df


def map_excel_columns(df):
    column_map = {
        "emp_id": "empid",
        "department": "dept_name",
        "emp_type": "employee_type",
        "approver": "approver_id",
        "secondary_approver": "secondary_approver_id",
        "nts_emp_doj": "doj",
        "nts_emp_lwd": "lwd",
        "skills_details": "skill_details",
        "previous_total_experience": "prev_total_exp"
    }
    return df.rename(columns=column_map)


def split_employee_name(df):
    if "emp_name" in df.columns:
        names = (
            df["emp_name"]
            .fillna("")
            .str.strip()
            .str.split(" ", n=1, expand=True)
        )
        df["fname"] = names[0]
        df["lname"] = names[1].fillna("")
    return df


def ensure_password(df):
    if "password" not in df.columns:
        df["password"] = None
    return df


def safe_date(val):
    if pd.isna(val) or val == "":
        return None
    return pd.to_datetime(val).date()


def validate_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)


def validate_mobile(mobile):
    return re.match(r"^\d{10}$", str(mobile))


def normalize_value(val):
    if val is None:
        return ""
    if isinstance(val, str):
        return val.strip()
    if isinstance(val, float) and pd.isna(val):
        return ""
    return val


def upload_employees_from_excel(df):

    duplicate_empids = (
        df["empid"]
        .str.upper()
        .value_counts()
    )

    duplicates = duplicate_empids[duplicate_empids > 1].index.tolist()

    if duplicates:
        raise ValueError(
            f"Duplicate empid(s) found in Excel: {', '.join(duplicates)}"
        )


    required = [
        "empid", "fname", "lname", "email",
        "mobile", "designation", "gender",
        "employee_type", "location", "company",
        "doj", "approver_id",
        "dept_name", "job_role"
    ]

    missing = set(required) - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {', '.join(missing)}")

    # --------------------------------------------------
    # 🔥 LOAD EXISTING EMPLOYEES + SNAPSHOTS
    # --------------------------------------------------
    existing_employees = {}
    existing_snapshots = {}

    for e in Employee_Info.query.all():
        existing_employees[e.empid] = e
        existing_snapshots[e.empid] = {
            "fname": normalize_value(e.fname),
            "lname": normalize_value(e.lname),
            "email": normalize_value(e.email),
            "mobile": normalize_value(e.mobile),
            "designation": normalize_value(e.designation),
            "gender": normalize_value(e.gender),
            "employee_type": normalize_value(e.employee_type),
            "location": normalize_value(e.location),
            "company": normalize_value(e.company),
            "dept_id": e.dept_id,
            "job_role_id": e.job_role_id,
            "approver_id": normalize_value(e.approver_id),
            "secondary_approver_id": normalize_value(e.secondary_approver_id),
            "prev_total_exp": normalize_value(e.prev_total_exp),
            "doj": e.doj,
            "lwd": e.lwd,
            "work_location": normalize_value(e.work_location),
            "country": normalize_value(e.country),
            "city": normalize_value(e.city),
            "core_skill": normalize_value(e.core_skill),
            "skill_details": normalize_value(e.skill_details),
        }

    email_to_empid = {
        e.email.lower(): e.empid
        for e in Employee_Info.query.all()
    }

    employee_lookup = set(existing_employees.keys())

    dept_map = {
        d.dept_name.lower(): d.id
        for d in Department.query.all()
    }

    inserted = 0
    updated = 0
    skipped = []

    # --------------------------------------------------
    # 🔁 PROCESS ROWS
    # --------------------------------------------------
    for idx, row in df.iterrows():
        empid = row.empid.upper().strip()
        email = row.email.lower().strip()

        existing_emp = existing_employees.get(empid)

        # 🚨 Email conflict
        if email in email_to_empid and email_to_empid[email] != empid:
            raise ValueError(
                f"Row {idx+2}: email already belongs to another employee"
            )

        if not validate_email(email):
            raise ValueError(f"Row {idx+2}: invalid email")

        if not validate_mobile(row.mobile):
            raise ValueError(f"Row {idx+2}: invalid mobile")

        # ---------------- Department ----------------
        dept_name = row.dept_name.strip()
        if dept_name.lower() not in dept_map:
            new_dept = Department(dept_name=dept_name)
            db.session.add(new_dept)
            db.session.flush()
            dept_id = new_dept.id
            dept_map[dept_name.lower()] = dept_id
        else:
            dept_id = dept_map[dept_name.lower()]

        # ---------------- Job Role ----------------
        role_name = row.job_role.strip()
        role = JobRole.query.filter_by(
            dept_id=dept_id,
            job_role=role_name
        ).first()

        if not role:
            role = JobRole(dept_id=dept_id, job_role=role_name)
            db.session.add(role)
            db.session.flush()

        doj = safe_date(row.doj)
        lwd = safe_date(row.lwd)

        if lwd and doj and lwd <= doj:
            raise ValueError(f"Row {idx+2}: LWD must be after DOJ")

        approver = row.approver_id.upper()
        if approver not in employee_lookup:
            raise ValueError(f"Row {idx+2}: approver not found")

        secondary = row.get("secondary_approver_id")
        secondary = secondary.upper() if pd.notna(secondary) else None

        # ======================================================
        # 🔁 UPDATE EXISTING (ONLY IF REAL CHANGE)
        # ======================================================
        if existing_emp:
            snapshot = existing_snapshots[empid]

            updates = {
                "fname": row.fname,
                "lname": row.lname,
                "email": email,
                "mobile": row.mobile,
                "designation": row.designation,
                "gender": row.gender,
                "employee_type": row.employee_type,
                "location": row.location,
                "company": row.company,
                "dept_id": dept_id,
                "job_role_id": role.id,
                "approver_id": approver,
                "secondary_approver_id": secondary,
                "prev_total_exp": row.get("prev_total_exp"),
                "work_location": row.get("work_location"),
                "country": row.get("country"),
                "city": row.get("city"),
                "core_skill": row.get("core_skill"),
                "skill_details": row.get("skill_details"),
            }

            if pd.notna(row.doj):
                updates["doj"] = doj
            if pd.notna(row.lwd):
                updates["lwd"] = lwd

            changed = False
            for field, new_val in updates.items():
                if normalize_value(snapshot.get(field)) != normalize_value(new_val):
                    changed = True
                    break

            if changed:
                for field, value in updates.items():
                    setattr(existing_emp, field, value)

                if row.password and str(row.password).strip():
                    existing_emp.set_password(row.password)

                updated += 1

        # ======================================================
        # ➕ INSERT NEW
        # ======================================================
        else:
            emp = Employee_Info(
                empid=empid,
                fname=row.fname,
                lname=row.lname,
                email=email,
                mobile=row.mobile,
                designation=row.designation,
                gender=row.gender,
                employee_type=row.employee_type,
                location=row.location,
                company=row.company,
                dept_id=dept_id,
                job_role_id=role.id,
                doj=doj,
                lwd=lwd,
                approver_id=approver,
                secondary_approver_id=secondary,
                prev_total_exp=row.get("prev_total_exp"),
                work_location=row.get("work_location"),
                country=row.get("country"),
                city=row.get("city"),
                core_skill=row.get("core_skill"),
                skill_details=row.get("skill_details"),
            )

            emp.set_password(row.password if row.password else f"{empid}@123")

            db.session.add(emp)
            inserted += 1
            employee_lookup.add(empid)

    return {
        "inserted": inserted,
        "updated": updated,
        "skipped": skipped
    }


@employee_upload_bp.route("/upload-employees", methods=["POST"])
def upload_employees():
    file = request.files.get("file")

    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    try:
        df = pd.read_excel(file)

        df = normalize_columns(df)
        df = map_excel_columns(df)
        df = split_employee_name(df)
        df = ensure_password(df)

        print("Excel empids:", df["empid"].tolist())

        with db.session.begin():
            result = upload_employees_from_excel(df)

        inserted = result["inserted"]
        updated = result["updated"]

        if inserted > 0 and updated > 0:
            message = "Employees added and updated successfully"
        elif updated > 0:
            message = "Employees updated successfully"
        elif inserted > 0:
            message = "Employees added successfully"
        else:
            message = "No changes detected"

        return jsonify({
            "message": message,
            "inserted_records": inserted,
            "updated_records": updated,
            "skipped_records": result["skipped"]
        }), 200

    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Database constraint violation"}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

