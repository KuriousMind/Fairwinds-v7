import React, { useState, useEffect } from 'react';
import { MaintenanceRecord } from '@/types/models';

interface MaintenanceCalendarProps {
  records: MaintenanceRecord[];
  onSelectDate?: (date: Date, records: MaintenanceRecord[]) => void;
}

/**
 * MaintenanceCalendar component for displaying maintenance records in a calendar view
 * 
 * Features:
 * - Monthly calendar view
 * - Highlights dates with maintenance records
 * - Shows record counts on each date
 * - Allows clicking on a date to view records for that day
 */
const MaintenanceCalendar: React.FC<MaintenanceCalendarProps> = ({
  records,
  onSelectDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Get records for a specific date
  const getRecordsForDate = (date: Date) => {
    return records.filter(record => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getFullYear() === date.getFullYear() &&
        recordDate.getMonth() === date.getMonth() &&
        recordDate.getDate() === date.getDate()
      );
    });
  };
  
  // Get status class for a date based on records
  const getDateStatusClass = (date: Date) => {
    const dateRecords = getRecordsForDate(date);
    
    if (dateRecords.length === 0) {
      return '';
    }
    
    // Check if any records are overdue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const hasOverdue = dateRecords.some(record => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return !record.type.toLowerCase().includes('completed') && recordDate < today;
    });
    
    // Check if any records are completed
    const hasCompleted = dateRecords.some(record => 
      record.type.toLowerCase().includes('completed')
    );
    
    // Check if any records are upcoming
    const hasUpcoming = dateRecords.some(record => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return !record.type.toLowerCase().includes('completed') && recordDate >= today;
    });
    
    if (hasOverdue) {
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    } else if (hasUpcoming) {
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    } else if (hasCompleted) {
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    }
    
    return '';
  };
  
  // Handle date click
  const handleDateClick = (date: Date) => {
    const dateRecords = getRecordsForDate(date);
    setSelectedDate(date);
    
    if (onSelectDate && dateRecords.length > 0) {
      onSelectDate(date, dateRecords);
    }
  };
  
  // Navigate to previous month
  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const prevMonth = new Date(prev);
      prevMonth.setMonth(prev.getMonth() - 1);
      return prevMonth;
    });
  };
  
  // Navigate to next month
  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const nextMonth = new Date(prev);
      nextMonth.setMonth(prev.getMonth() + 1);
      return nextMonth;
    });
  };
  
  // Navigate to current month
  const handleCurrentMonth = () => {
    setCurrentMonth(new Date());
  };
  
  // Render calendar
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Create array of day cells
    const dayCells = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      dayCells.push(
        <div key={`empty-${i}`} className="h-24 border border-gray-200 bg-gray-50"></div>
      );
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateRecords = getRecordsForDate(date);
      const statusClass = getDateStatusClass(date);
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
      
      dayCells.push(
        <div
          key={`day-${day}`}
          className={`h-24 border border-gray-200 p-1 cursor-pointer transition-colors ${
            isToday ? 'border-blue-500 border-2' : ''
          } ${
            isSelected ? 'ring-2 ring-blue-500' : ''
          } ${statusClass || 'hover:bg-gray-100'}`}
          onClick={() => handleDateClick(date)}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
              {day}
            </span>
            {dateRecords.length > 0 && (
              <span className="text-xs font-medium bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center">
                {dateRecords.length}
              </span>
            )}
          </div>
          
          {/* Show first record title if available */}
          {dateRecords.length > 0 && (
            <div className="mt-1 text-xs truncate">
              {dateRecords[0].title}
              {dateRecords.length > 1 && <span> +{dateRecords.length - 1} more</span>}
            </div>
          )}
        </div>
      );
    }
    
    return dayCells;
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Calendar header */}
      <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-navy">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-full hover:bg-gray-200"
            title="Previous month"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleCurrentMonth}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            title="Current month"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-full hover:bg-gray-200"
            title="Next month"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="p-2">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendar()}
        </div>
      </div>
      
      {/* Legend */}
      <div className="p-3 bg-gray-50 border-t flex flex-wrap gap-3 text-xs">
        <div className="flex items-center">
          <span className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded-full mr-1"></span>
          <span>Upcoming</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 bg-red-100 border border-red-200 rounded-full mr-1"></span>
          <span>Overdue</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 bg-green-100 border border-green-200 rounded-full mr-1"></span>
          <span>Completed</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 border border-blue-500 border-2 rounded-full mr-1"></span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCalendar;
