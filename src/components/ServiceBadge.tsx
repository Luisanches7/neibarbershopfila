import React from 'react';
import { Clock } from 'lucide-react';
import { Service } from '../types/services';

interface ServiceBadgeProps {
  service: Service;
  className?: string;
}

export default function ServiceBadge({ service, className = '' }: ServiceBadgeProps) {
  return (
    <div className={`flex items-center text-sm ${className}`}>
      <Clock className="w-4 h-4 mr-1" />
      <span>{service.name} ({service.duration}min)</span>
    </div>
  );
}