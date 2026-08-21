import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiHome } from 'react-icons/fi';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-xl shadow p-8 max-w-md text-center">
        <span className="text-5xl">🚫</span>
        <h2 className="text-xl font-bold mt-4 text-gray-800">Access Denied</h2>
        <p className="text-gray-500 mt-2">
          You do not have permission to view this page.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          <FiHome /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
