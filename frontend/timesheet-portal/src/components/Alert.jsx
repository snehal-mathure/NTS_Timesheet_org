// src/components/Alert.jsx
import React from "react";

export default function Alert({ type = "success", message, onClose }) {
  const base =
    "relative rounded-md px-4 py-3 text-sm flex justify-between items-start border";

  const classes =
    type === "success"
      ? `${base} bg-green-50 text-green-800 border-green-300`
      : `${base} bg-red-50 text-red-800 border-red-300`;

  return (
    <div className={classes}>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="text-xl ml-4 hover:opacity-70 leading-none"
      >
        &times;
      </button>
    </div>
  );
}
