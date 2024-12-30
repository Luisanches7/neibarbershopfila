import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminButton() {
  const { isAdmin } = useAuth();

  // Don't show the button if already logged in as admin
  if (isAdmin) return null;

  return (
    <Link
      to="/login"
      className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
      aria-label="Área administrativa"
    >
      Admin
    </Link>
  );
}