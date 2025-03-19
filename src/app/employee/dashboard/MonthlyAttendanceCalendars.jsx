"use client"

import { useState, useEffect } from "react"
import Calendar from "react-calendar"
import axios from "axios"
import "../../../component/common/react-calendar/Calendar.css"
import CalendarShimmer from "./CalendarShimmer"
import { Hourglass } from "lucide-react";

const calendarStyles = `
  .custom-calendar .react-calendar {
    width: 100%;
    max-width: 650px;
    background: white;
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.5;
  }

  .custom-calendar .react-calendar__navigation {
    display: none; /* Hide default navigation */
  }

  .custom-calendar .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.75rem;
    padding: 8px 0;
    color: #6b7280;
  }

  .custom-calendar .react-calendar__month-view__weekdays__weekday {
    padding: 8px;
  }

  .custom-calendar .react-calendar__month-view__weekdays__weekday abbr {
    text-decoration: none;
  }

  .custom-calendar .react-calendar__month-view__days__day--weekend {
    color: #ef4444;
  }

  .custom-calendar .react-calendar__tile {
    padding: 10px;
    position: relative;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-size: 0.9rem;
    color: #374151;
  }

  .custom-calendar .react-calendar__tile:hover {
    background-color: #f3f4f6;
  }

  .custom-calendar .react-calendar__tile--active {
    background-color: #3b82f6 !important;
    color: white;
  }

  .custom-calendar .react-calendar__tile--now {
    font-weight: bold;
  }

  .custom-calendar .react-calendar__month-view__days__day--neighboringMonth {
    color: #d1d5db;
  }

  /* Status indicators */
  .status-dot {
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  /* Attendance details card */
  .attendance-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding: 16px;
    width: 300px;
    border: 1px solid #e5e7eb;
  }

  .attendance-card-header {
    text-align: center;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f3f4f6;
    font-weight: 600;
    color: #111827;
  }

  .attendance-detail {
    padding: 10px;
    margin-bottom: 8px;
    border-radius: 6px;
  }

  .attendance-detail-in {
    background-color: #eff6ff;
  }

  .attendance-detail-out {
    background-color: #fef2f2;
  }

  .attendance-detail-total {
    background-color: #f0fdf4;
  }

  .attendance-detail-label {
    font-size: 0.8rem;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .attendance-detail-value {
    font-size: 0.9rem;
  }

  /* Navigation buttons */
  .nav-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s;
  }

  .nav-button-prev {
    background-color: #f3f4f6;
    color: #4b5563;
  }

  .nav-button-prev:hover {
    background-color: #e5e7eb;
  }

  .nav-button-next {
    background-color: #3b82f6;
    color: white;
  }

  .nav-button-next:hover {
    background-color: #2563eb;
  }

  /* Legend */
  .legend-container {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 12px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    color: #6b7280;
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
`
const MonthlyAttendanceCalendars = ({ selectedEmployee }) => {
  const [apiData, setApiData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [clickedDate, setClickedDate] = useState(null)
  const [clickedDateDetails, setClickedDateDetails] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.innerHTML = calendarStyles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_ATTENDANCE_URL}user/attendance/employee`, {
          params: {
            employeeCode: selectedEmployee || "WIBRO0065",
            filterType: "month",
            startDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString(),
          },
        })

        if (response.data?.data?.length === 0) {
          alert("Employee ID is incorrect,attendance will not be shown!")
          return
        }
        if (response.data && response.data.data) {
          const transformedData = response.data.data.map((item) => ({
            date: new Date(item.actualPunchInTime),
            isAbsent: item.isAbsent,
            inTime: item.userpunchInTime ? new Date(item.userpunchInTime) : null,
            outTime: item.userPunchOutTime ? new Date(item.userPunchOutTime) : null,
            totalHours: item.totalHours,
          }))
          setApiData(transformedData)
        }

      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to fetch attendance data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentMonth])

  // Helper function to check if two dates are the same
  const isSameDay = (date1, date2) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()

  // Click handler for each date
  const handleDateClick = (date) => {
    setClickedDate(date)
    const attendanceData = apiData.find((data) => isSameDay(data.date, date))
    let options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      hour12: true,
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
    };
    if (attendanceData) {
      // Format the in time
      const inTime = attendanceData.inTime
      let formattedInTime = "N/A"
      if (inTime) {
        // const day = inTime.getDate()
        // const month = months[inTime.getMonth()].substring(0, 3)
        // const hours = inTime.getHours().toString().padStart(2, "0")
        // const minutes = inTime.getMinutes().toString().padStart(2, "0")
        // const seconds = inTime.getSeconds().toString().padStart(2, "0")
        // const ampm = hours >= 12 ? "pm" : "am"
        // const displayHours = hours % 12 || 12
        // formattedInTime = `${inTime.toLocaleDateString("en-US", { weekday: "long" })} ${day} ${month} ${inTime.getFullYear()} at ${displayHours}:${minutes}:${seconds} ${ampm}`
        formattedInTime = new Intl.DateTimeFormat('en-GB', options).format(inTime)
      }

      // Format the out time
      const outTime = attendanceData.outTime
      let formattedOutTime = "N/A"
      if (outTime) {
        //   const day = outTime.getDate()
        //   const month = months[outTime.getMonth()].substring(0, 3)
        //   const hours = outTime.getHours().toString().padStart(2, "0")
        //   const minutes = outTime.getMinutes().toString().padStart(2, "0")
        //   const seconds = outTime.getSeconds().toString().padStart(2, "0")
        //   const ampm = hours >= 12 ? "pm" : "am"
        //   const displayHours = hours % 12 || 12
        //   formattedOutTime = `${outTime.toLocaleDateString("en-US", { weekday: "long" })} ${day} ${month} ${outTime.getFullYear()} at ${displayHours}:${minutes}:${seconds} ${ampm}`
        formattedOutTime = attendanceData.outTime
          ? new Intl.DateTimeFormat("en-GB", options).format(outTime)
          : "N/A"
      }

      // Format total hours
      let totalHours = "N/A"
      if (attendanceData.totalHours) {
        totalHours = attendanceData.totalHours
      }

      setClickedDateDetails({
        formattedInTime,
        formattedOutTime,
        totalHours,
      })
    } else {
      setClickedDateDetails(null)
    }
  }

  // Navigation handlers
  const handlePrevMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1))
  const handleNextMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1))

  // Render date styles (Green: Present, Red: Absent)
  const renderCustomTileContent = ({ date }) => {
    const status = apiData.find((data) => isSameDay(data.date, date))

    const dotColor = status?.isAbsent
      ? "bg-red-500" // Absent
      : status
        ? "bg-green-500" // Present
        : null // No data

    if (!dotColor) return null

    return (
      <div className="w-2 h-2 absolute bottom-1 left-1/2 transform -translate-x-1/2">
        <div className={`w-full h-full ${dotColor} rounded-full`}></div>
      </div>
    )
  }

  // Format date for attendance card header
  const formatAttendanceDate = (date) => {
    if (!date) return ""
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  // UI Rendering
  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Month navigation and title */}
        <div className="flex justify-between items-center mb-6">
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

          <h2 className="text-xl font-bold text-gray-800">
            {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>

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

        {/* Legend */}
        <div className="flex justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Selected</span>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Calendar */}
          <div className="">
            <div className="bg-white rounded-lg shadow-sm p-4 custom-calendar">
              {loading ? (
                <CalendarShimmer />
              ) : (
                <Calendar
                  tileContent={renderCustomTileContent}
                  value={currentMonth}
                  onClickDay={handleDateClick}
                  showNavigation={false}
                  className="border-none"
                />
              )}
            </div>

            {/* Error Message */}
            {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
          </div>

          {/* Attendance Details */}
          {clickedDate && clickedDateDetails !== null ? (
            <div className="w-fit md:w-27">
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-gray-600"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  <h3 className="text-base font-semibold text-gray-800">
                    Attendance for {formatAttendanceDate(clickedDate)}
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Punch In Time */}
                  <div className="p-3 bg-blue-50 rounded-md">
                    <div className="text-sm font-medium text-blue-700 mb-1">Punch In Time</div>
                    <div className="flex items-center">
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
                        className="mr-2 text-blue-500"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="text-sm text-gray-700">{clickedDateDetails.formattedInTime}</span>
                    </div>
                  </div>

                  {/* Punch Out Time */}
                  <div className="p-3 bg-red-50 rounded-md">
                    <div className="text-sm font-medium text-red-700 mb-1">Punch Out Time</div>
                    <div className="flex items-center">
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
                        className="mr-2 text-red-500"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                      <span className="text-sm text-gray-700">{clickedDateDetails.formattedOutTime}</span>
                    </div>
                  </div>

                  {/* Total Hours */}
                  <div className="p-3 bg-green-50 rounded-md">
                    <div className="text-sm font-medium text-green-700 mb-1">Total Hours</div>
                    <div className="flex items-center">
                      <Hourglass size={20} className="text-gray-500" />
                      <span className="text-sm text-gray-700">{clickedDateDetails.totalHours}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full md:w-80">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 text-center text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto mb-3 text-gray-400"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                <p>Select a date to view attendance details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MonthlyAttendanceCalendars