import React, { useState } from "react";
import { uploadEmployeeExcel } from "../services/employeeUploadService";
import { FiUploadCloud, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const EmployeeExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".xlsx") && !selectedFile.name.endsWith(".xls")) {
      setError("Only Excel files are allowed (.xlsx, .xls)");
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an Excel file");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await uploadEmployeeExcel(file);
      setResult(response);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-gradient-to-r from-[#4C6FFF] via-[#6C5CE7] to-[#8B5CF6] p-[1px] rounded-3xl">
        <div className="bg-white rounded-3xl p-6 space-y-5">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <FiUploadCloud className="text-blue-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Upload Employee Data
              </h2>
              <p className="text-xs text-slate-500">
                Upload an Excel file to insert or update employee records
              </p>
            </div>
          </div>

          {/* Upload Box */}
          <div className="border border-dashed border-slate-300 rounded-2xl bg-slate-50 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 truncate">
              <FiUploadCloud className="text-slate-400" size={18} />
              <span className="text-sm text-slate-600 truncate">
                {file ? file.name : "No file selected"}
              </span>
            </div>

            <label className="text-sm font-medium text-[#4C6FFF] cursor-pointer hover:underline">
              Browse
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full h-11 rounded-xl font-medium text-white
              bg-gradient-to-r from-[#4C6FFF] to-[#6C5CE7]
              hover:opacity-90 transition
              disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {loading ? "Uploading..." : "Upload File"}
          </button>

          {/* Success */}
          {result && (
            <div className="border border-green-200 bg-green-50 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <FiCheckCircle />
                {result.message}
              </div>

              <div className="text-sm text-green-700">
                <p>Inserted Records: <strong>{result.inserted_records}</strong></p>
                <p>Updated Records: <strong>{result.updated_records}</strong></p>
              </div>

              {result.skipped_records?.length > 0 && (
                <ul className="list-disc ml-5 text-sm text-green-700 space-y-1">
                  {result.skipped_records.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="border border-red-200 bg-red-50 rounded-2xl p-4 text-sm text-red-700 flex items-center gap-2">
              <FiAlertCircle />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeExcelUpload;
