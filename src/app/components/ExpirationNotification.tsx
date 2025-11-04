'use client';

import { useState, useEffect } from 'react';
import { isExpiringWithin2Days, getDaysUntilExpiration } from '@/lib/utils/dateUtils';

interface ExpirationNotificationProps {
  endDate: string;
  adTitle: string;
  className?: string;
}

export default function ExpirationNotification({ endDate, adTitle, className = '' }: ExpirationNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    if (isExpiringWithin2Days(endDate)) {
      setIsVisible(true);
      setDaysLeft(getDaysUntilExpiration(endDate));
    }
  }, [endDate]);

  if (!isVisible) return null;

  const getUrgencyColor = () => {
    if (daysLeft <= 1) return 'bg-red-100 border-red-500 text-red-800';
    if (daysLeft <= 3) return 'bg-orange-100 border-orange-500 text-orange-800';
    return 'bg-yellow-100 border-yellow-500 text-yellow-800';
  };

  const getUrgencyText = () => {
    if (daysLeft <= 1) return 'CRITICAL';
    if (daysLeft <= 3) return 'WARNING';
    return 'NOTICE';
  };

  return (
    <div className={`border-l-4 p-4 mb-4 ${getUrgencyColor()} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">
            <strong>{getUrgencyText()}:</strong> Ad "{adTitle}" expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
          </p>
          <p className="text-sm mt-1">
            Please review and extend the ad if necessary to avoid service interruption.
          </p>
        </div>
      </div>
    </div>
  );
}