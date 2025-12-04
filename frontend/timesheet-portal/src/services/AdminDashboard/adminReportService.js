import { useEffect, useState } from "react";
import axios from "axios";

export default function ReportsDashboard() {
    const [report, setReport] = useState(null);

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/admin/reports/data")
            .then(res => setReport(res.data))
            .catch(err => console.error("Report Load Error", err));
    }, []);

    if (!report) return <p>Loading...</p>;

    return (
        <div>
            <h1>Reports Dashboard</h1>

            {/* Location Report */}
            <h2>Location Report</h2>
            <pre>{JSON.stringify(report.location_report, null, 2)}</pre>

            {/* Employee Type */}
            <h2>Employee Type Report</h2>
            <pre>{JSON.stringify(report.employee_type_report, null, 2)}</pre>

            {/* Billability */}
            <h2>Billability Report</h2>
            <pre>{JSON.stringify(report.billability_report, null, 2)}</pre>
        </div>
    );
}
