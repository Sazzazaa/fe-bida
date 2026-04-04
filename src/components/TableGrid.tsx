import React, { useState, useEffect } from 'react';
import { Clock, Zap, AlertCircle } from 'lucide-react';
import { TABLE_RATE_PER_MINUTE_VND } from '../constants/pricing';
import '../styles/table-grid.css';

export interface TableData {
  id: number;
  name: string;
  type: 'Pool' | 'Carom';
  status: 'available' | 'playing' | 'reserved' | 'maintenance';
  elapsedSeconds?: number;
  billAmount?: number;
  fnbAmount?: number;
  startTime?: Date | string;
}

interface TableGridProps {
  tables: TableData[];
  onTableClick?: (table: TableData) => void;
}

export const TableGrid: React.FC<TableGridProps> = ({
  tables = [],
  onTableClick,
}) => {
  const [activeTables, setActiveTables] = useState<{ [key: number]: { elapsed: string; bill: number } }>({});

  const formatMoney = (amount: number) => (
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const updated: { [key: number]: { elapsed: string; bill: number } } = {};

      tables.forEach((table) => {
        if (table.status === 'playing') {
          const fallbackStartTime = Date.now() - (table.elapsedSeconds ?? 0) * 1000;
          const startTimeMs = table.startTime
            ? new Date(table.startTime).getTime()
            : fallbackStartTime;
          const elapsedMs = Date.now() - startTimeMs;
          const totalSeconds = Math.floor(elapsedMs / 1000);
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;

          const timeStr = hours > 0
            ? `${hours}h ${minutes}m`
            : `${minutes}m ${seconds}s`;

          // Calculate bill: table fee (VND/min) + F&B total of the current session
          const tableFee = (totalSeconds / 60) * TABLE_RATE_PER_MINUTE_VND;
          const fnbAmount = table.fnbAmount ?? 0;

          updated[table.id] = {
            elapsed: timeStr,
            bill: tableFee + fnbAmount,
          };
        }
      });

      setActiveTables(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [tables]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'playing':
        return 'red';
      case 'reserved':
        return 'yellow';
      case 'maintenance':
        return 'grey';
      default:
        return 'grey';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'playing':
        return 'In Use';
      case 'reserved':
        return 'Reserved';
      case 'maintenance':
        return 'Maintenance';
      default:
        return status;
    }
  };

  return (
    <div className="table-grid-container">
      <div className="table-grid">
        {tables.length === 0 && (
          <div className="table-grid-empty">No tables available</div>
        )}

        {tables.map((table) => {
          const tableTimer = activeTables[table.id];
          const statusColor = getStatusColor(table.status);

          return (
            <div
              key={table.id}
              className={`table-card status-${statusColor}`}
              onClick={() => onTableClick?.(table)}
              role={onTableClick ? 'button' : undefined}
              tabIndex={onTableClick ? 0 : undefined}
              onKeyDown={(e) => {
                if (!onTableClick) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onTableClick(table);
                }
              }}
            >
              {/* Status Badge */}
              <div className="table-status-badge">
                <span className={`status-dot status-${statusColor}`}></span>
                <span className="status-text">{getStatusLabel(table.status)}</span>
              </div>

              {/* Card Content */}
              <div className="table-card-content">
                <h3 className="table-name">{table.name}</h3>
                <p className="table-type">{table.type}</p>

                {/* Live Timer for Playing Tables */}
                {table.status === 'playing' && tableTimer && (
                  <div className="table-timer">
                    <div className="timer-display">
                      <Clock size={16} />
                      <span className="timer-text">{tableTimer.elapsed}</span>
                    </div>
                    <div className="bill-display">
                      <Zap size={16} />
                      <span className="bill-amount">{formatMoney(tableTimer.bill)}</span>
                    </div>
                  </div>
                )}

                {/* Maintenance Alert */}
                {table.status === 'maintenance' && (
                  <div className="maintenance-alert">
                    <AlertCircle size={16} />
                    <span>Under Maintenance</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button className="table-action-btn" title={`Manage ${table.name}`}>
                <span>→</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableGrid;
