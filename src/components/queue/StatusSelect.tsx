import React from 'react';
import { Customer } from '../../types';

interface StatusSelectProps {
  status: Customer['status'];
  onChange: (status: Customer['status']) => void;
  disabled?: boolean;
}

export default function StatusSelect({ status, onChange, disabled }: StatusSelectProps) {
  const statusOptions: Customer['status'][] = ['waiting', 'in-service', 'completed'];
  
  const getStatusLabel = (status: Customer['status']) => {
    switch (status) {
      case 'waiting':
        return 'Aguardando';
      case 'in-service':
        return 'Em Atendimento';
      case 'completed':
        return 'Finalizado';
      default:
        return status;
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value as Customer['status'])}
      disabled={disabled}
      className={`
        rounded-md text-sm font-medium px-2 py-1
        ${status === 'in-service' ? 'bg-blue-100 text-blue-800' : 
          status === 'waiting' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-gray-100 text-gray-800'}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {statusOptions.map((option) => (
        <option key={option} value={option}>
          {getStatusLabel(option)}
        </option>
      ))}
    </select>
  );
}