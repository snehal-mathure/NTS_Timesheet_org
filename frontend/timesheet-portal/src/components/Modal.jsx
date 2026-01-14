import React from "react";
import { FiX } from "react-icons/fi";

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Modal box */}
      <div className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
        >
          <FiX size={18} />
        </button>

        {children}
      </div>
    </div>
  );
};

export default Modal;
