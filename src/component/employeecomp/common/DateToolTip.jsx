"use client"
import { useState } from "react"
import axios from "axios"

export const DateTooltip = ({ date, employeeCode, children }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipData, setTooltipData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const fetchTooltipData = async () => {
    if (!date) return

    setLoading(true)
    try {
      const formattedDate = date.toISOString()

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_ATTENDANCE_URL}user/attendance/employee`,
        {
          params: {
            employeeCode: employeeCode,
            filterType: "date",
            startDate: formattedDate
          }
        }
      )

      if (response.data && response.data.length > 0) {
        setTooltipData(response.data[0])
      } else {
        setTooltipData(null)
      }
    } catch (error) {
      console.error("Error fetching tooltip data:", error)
      setTooltipData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleMouseEnter = e => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPosition({
      top: rect.top - 10,
      left: rect.right + 10
    })
    setShowTooltip(true)
    fetchTooltipData()
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}

      {showTooltip && (
        <div
          className="fixed z-50 w-64 p-3 text-sm bg-white border rounded-md shadow-lg"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: "translateY(-50%)"
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center p-2">
              <div className="w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>
              <span className="ml-2">Loading...</span>
            </div>
          ) : tooltipData ? (
            <div className="space-y-2">
              <p className="font-bold text-gray-800">
                {date.toLocaleDateString()}
              </p>
              <div className="grid grid-cols-2 gap-1 text-gray-600">
                <span className="font-medium">Punch In:</span>
                <span>
                  {tooltipData.inTime
                    ? new Date(tooltipData.inTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "N/A"}
                </span>

                <span className="font-medium">Punch Out:</span>
                <span>
                  {tooltipData.outTime
                    ? new Date(tooltipData.outTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "N/A"}
                </span>

                {tooltipData.inTime && tooltipData.outTime && (
                  <>
                    <span className="font-medium">Total Hours:</span>
                    <span>
                      {(
                        (new Date(tooltipData.outTime) -
                          new Date(tooltipData.inTime)) /
                        (1000 * 60 * 60)
                      ).toFixed(2)}{" "}
                      hrs
                    </span>
                  </>
                )}

                <span className="font-medium">Status:</span>
                <span
                  className={`font-medium ${
                    tooltipData.status === "Present"
                      ? "text-green-600"
                      : tooltipData.status === "Absent"
                      ? "text-red-600"
                      : tooltipData.status === "WeeklyOff"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {tooltipData.status || "Unknown"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No attendance data available</p>
          )}
        </div>
      )}
    </div>
  )
}
