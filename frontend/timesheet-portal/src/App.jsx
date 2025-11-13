import React, { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-blue-100 via-white to-purple-100 text-gray-800 overflow-x-hidden">
      {/* Header */}
      <h1 className="text-4xl font-bold mb-6 text-blue-600 text-center">
        Welcome to Vite + React + Tailwind 🚀
      </h1>

      {/* Card */}
      <div className="bg-white shadow-xl rounded-2xl p-8 w-[90%] sm:w-[400px] text-center">
        <p className="text-lg mb-6">This is a Tailwind CSS test page!</p>

        <button
          onClick={() => setCount((c) => c + 1)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-lg transition-all duration-200"
        >
          Count is {count}
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-sm text-gray-600 text-center">
        Made with ❤️ using React + Vite + Tailwind
      </footer>
    </div>
  );
}

export default App;
