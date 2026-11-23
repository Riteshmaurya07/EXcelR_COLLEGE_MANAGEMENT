import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/timetable')
      .then((res) => setTimetable(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Standard 5 slots per Step 5
  const slots = [
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:15 - 12:15',
    '13:00 - 14:00',
    '14:00 - 15:00',
  ];

  const days = [
    { key: 'MONDAY', label: 'Monday' },
    { key: 'TUESDAY', label: 'Tuesday' },
    { key: 'WEDNESDAY', label: 'Wednesday' },
    { key: 'THURSDAY', label: 'Thursday' },
    { key: 'FRIDAY', label: 'Friday' },
    { key: 'SATURDAY', label: 'Saturday (Holiday)' },
    { key: 'SUNDAY', label: 'Sunday (Holiday)' },
  ];

  const getSlotData = (dayKey, slotTime) => {
    return timetable.find(
      (t) => t.day?.toUpperCase() === dayKey && t.timeSlot === slotTime
    );
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Weekly Class Timetable</h1>
        <p className="text-muted small mb-0">Monday to Friday schedule with course codes, assigned faculty, and room locations</p>
      </div>

      <div className="card">
        <div className="card-header bg-white">
          <span className="fw-semibold">Weekly Timetable Grid</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-sm align-middle text-center mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: '130px' }}>Day</th>
                  {slots.map((slot) => (
                    <th key={slot} style={{ minWidth: '170px' }}>{slot}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-5 text-muted">Loading timetable...</td>
                  </tr>
                ) : (
                  days.map((day) => {
                    const isHoliday = day.key === 'SATURDAY' || day.key === 'SUNDAY';
                    return (
                      <tr key={day.key} style={{ backgroundColor: isHoliday ? '#F8F9FA' : 'inherit' }}>
                        <td className="fw-bold bg-light text-start ps-3">{day.label}</td>
                        {isHoliday ? (
                          <td colSpan="5" className="text-muted py-3 fw-semibold">
                            WEEKEND HOLIDAY (NO CLASSES)
                          </td>
                        ) : (
                          slots.map((slot) => {
                            const item = getSlotData(day.key, slot);
                            return (
                              <td key={slot} className="p-2">
                                {item ? (
                                  <div>
                                    <div className="fw-bold" style={{ color: 'var(--color-primary)' }}>
                                      {item.courseCode}
                                    </div>
                                    <div className="text-muted" style={{ fontSize: '12px' }}>
                                      {item.facultyName}
                                    </div>
                                    <div className="badge bg-light text-dark border mt-1" style={{ fontSize: '11px' }}>
                                      {item.roomNo}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted small">-</span>
                                )}
                              </td>
                            );
                          })
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;
