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
 * - Shows maintenance records grouped by month
 * - Allows selecting a month to view all records for that month
 */
const MaintenanceCalendar: React.FC<MaintenanceCalendarProps> = ({
  records,
  onSelectDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  
  // Get records for a specific month
  const getRecordsForMonth = (date: Date) => {
    return records.filter(record => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getFullYear() === date.getFullYear() &&
        recordDate.getMonth() === date.getMonth()
      );
    });
  };
  
  // Get status class for a month based on records
  const getMonthStatusClass = (date: Date) => {
    const monthRecords = getRecordsForMonth(date);
    
    if (monthRecords.length === 0) {
      return '';
    }
    
    // Check if any records are overdue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const hasOverdue = monthRecords.some(record => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return !record.type.toLowerCase().includes('completed') && recordDate < today;
    });
    
    // Check if any records are completed
    const hasCompleted = monthRecords.some(record => 
      record.type.toLowerCase().includes('completed')
    );
    
    // Check if any records are upcoming
    const hasUpcoming = monthRecords.some(record => {
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
  
  // Handle month click
  const handleMonthClick = (date: Date) => {
    const monthRecords = getRecordsForMonth(date);
    setSelectedMonth(date);
    
    if (onSelectDate && monthRecords.length > 0) {
      onSelectDate(date, monthRecords);
    }
  };
  
  // Navigate to previous year
  const handlePrevYear = () => {
    setCurrentMonth(prev => {
      const prevYear = new Date(prev);
      prevYear.setFullYear(prev.getFullYear() - 1);
      return prevYear;
    });
  };
  
  // Navigate to next year
  const handleNextYear = () => {
    setCurrentMonth(prev => {
      const nextYear = new Date(prev);
      nextYear.setFullYear(prev.getFullYear() + 1);
      return nextYear;
    });
  };
  
  // Navigate to current year
  const handleCurrentYear = () => {
    setCurrentMonth(new Date());
  };
  
  // Render year calendar with months
  const renderYearCalendar = () => {
    const year = currentMonth.getFullYear();
    const currentDate = new Date();
    const monthCells = [];
    
    // Add cells for each month of the year
    for (let month = 0; month < 12; month++) {
      const date = new Date(year, month, 1);
      const monthRecords = getRecordsForMonth(date);
      const statusClass = getMonthStatusClass(date);
      const isCurrentMonth = currentDate.getFullYear() === year && currentDate.getMonth() === month;
      const isSelected = selectedMonth && 
                         selectedMonth.getFullYear() === year && 
                         selectedMonth.getMonth() === month;
      
      monthCells.push(
        <div
          key={`month-${month}`}
          className={`border border-gray-200 p-3 cursor-pointer transition-colors ${
            isCurrentMonth ? 'border-blue-500 border-2' : ''
          } ${
            isSelected ? 'ring-2 ring-blue-500' : ''
          } ${statusClass || 'hover:bg-gray-100'}`}
          onClick={() => handleMonthClick(date)}
        >
          <div className="flex justify-between items-center">
            <span className={`font-medium ${isCurrentMonth ? 'text-blue-600' : ''}`}>
              {date.toLocaleString('default', { month: 'long' })}
            </span>
            {monthRecords.length > 0 && (
              <span className="text-xs font-medium bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center">
                {monthRecords.length}
              </span>
            )}
          </div>
          
          {/* Show summary of records if available */}
          {monthRecords.length > 0 && (
            <div className="mt-2 text-xs">
              <div className="font-medium">Top items:</div>
              <ul className="mt-1 space-y-1">
                {monthRecords.slice(0, 2).map((record, idx) => (
                  <li key={idx} className="truncate">{record.title}</li>
                ))}
                {monthRecords.length > 2 && (
                  <li className="text-gray-500">+{monthRecords.length - 2} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      );
    }
    
    return monthCells;
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Calendar header */}
      <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
        <h2 className="text-lg font-medium text-navy">
          {currentMonth.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handlePrevYear}
            className="p-1 rounded-full hover:bg-gray-200"
            title="Previous year"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleCurrentYear}
            className="btn-primary text-xs px-2 py-1 h-auto text-white rounded"
            title="Current year"
          >
            This Year
          </button>
          <button
            onClick={handleNextYear}
            className="p-1 rounded-full hover:bg-gray-200"
            title="Next year"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Calendar grid - months only */}
      <div className="p-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {renderYearCalendar()}
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
          <span>Current Month</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceCalendar;
