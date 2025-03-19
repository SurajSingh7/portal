import React, { useState, useEffect, useCallback } from "react";
import { Select, Button } from "antd";
import axios from "axios";
import BarGraphComponent from "./BarGraphComponent";
const { Option } = Select;

const AttendanceGraph = ({ selectedEmployee, setSelectedEmployee }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (month) => {
    setLoading(true);
    setError(null);
    try {
      const startDate = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
      const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString();

      const response = await axios.get(`${process.env.NEXT_PUBLIC_ATTENDANCE_URL}user/attendance/employee`, {
        params: {
          employeeCode: selectedEmployee,
          filterType: "custom",
          startDate,
          endDate,
        },
      });

      if (response.data && response.data.data.length > 0) {
        setAttendanceData(response.data.data);
      } else {
        setAttendanceData([]);
      }
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError("Failed to fetch attendance data.");
    } finally {
      setLoading(false);
    }
  }, [selectedEmployee]);

  useEffect(() => {
    fetchData(currentMonth);
  }, [currentMonth, fetchData]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const formatChartData = () => {
    const dates = attendanceData.map(item =>
      new Date(item.actualPunchInTime).toDateString()
    );

    // Convert times to total minutes
    const punchInTimes = attendanceData.map(item => {
      const inTime = new Date(item.userpunchInTime);
      return inTime.getUTCHours() * 60 + inTime.getUTCMinutes();
    });

    const punchOutTimes = attendanceData.map(item => {
      const outTime = new Date(item.userPunchOutTime);
      return outTime.getUTCHours() * 60 + outTime.getUTCMinutes();
    });

    const lateTimes = attendanceData.map(item => {
      const actualInTime = new Date(item.actualPunchInTime);
      const userInTime = new Date(item.userpunchInTime);

      const actualTotalMinutes =
        actualInTime.getUTCHours() * 60 + actualInTime.getUTCMinutes();
      const userTotalMinutes =
        userInTime.getUTCHours() * 60 + userInTime.getUTCMinutes();
      const diff = userTotalMinutes - actualTotalMinutes;

      return diff > 0 ? diff : 0;
    });

    // The custom ticks you actually want to label:
    const desiredTicks = [0, 12, 24, 36, 48, 60];

    return {
      series: [
        {
          name: "Punch In Time",
          data: punchInTimes,
          color: "#3498db",
          type: "bar",
          stack: "punch",
        },
        {
          name: "Late Time",
          data: lateTimes,
          color: "#e74c3c",
          type: "bar",
          stack: "punch",
        },
        {
          name: "Punch Out Time",
          data: punchOutTimes,
          color: "#2ecc71",
          type: "bar",
          stack: "out",
        },
      ],
      options: {
        chart: {
          type: "bar",
        },
        xaxis: {
          categories: dates,
        },
        yaxis: {
          min: 0,
          forceNiceScale: true,
          labels: {
            formatter: (val) => {
              // Round the current tick to nearest integer
              const rounded = Math.round(val);

              // Show the label ONLY if it's in our desired array
              if (desiredTicks.includes(rounded)) {
                return `${rounded} min`;
              }

              // Otherwise, hide it (return empty string)
              return "";
            },
          },
          title: {
            text: "Minutes",
          },
        },
        tooltip: {
          y: {
            formatter: (value, { seriesIndex }) => {
              // Convert total minutes -> HH:MM
              const hh = Math.floor(value / 60);
              const mm = String(value % 60).padStart(2, "0");

              if (seriesIndex === 1) {
                return `${value} min (Late)`;
              } else if (seriesIndex === 2) {
                return `Punched out at ${hh}:${mm} hrs`;
              } else {
                return `Punched in at ${hh}:${mm} hrs`;
              }
            },
          },
        },
        plotOptions: {
          bar: {
            columnWidth: attendanceData.length > 20 ? "30%" : "50%",
          },
        },
        dataLabels: {
          enabled: false,
        },
      },
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button
          className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-all"
          onClick={handlePrevMonth}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>Previous</span>
        </button>
        <h3 className="text-lg font-semibold text-gray-500">
          {currentMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <button
          className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all"
          onClick={handleNextMonth}
        >
          <span>Next</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : attendanceData.length > 0 ? (
        <BarGraphComponent options={formatChartData().options} series={formatChartData().series} />
      ) : (
        <h4 className="text-gray-600 flex items-center justify-center">No data available for this month.</h4>
      )}
    </div>
  );
};

export default AttendanceGraph;