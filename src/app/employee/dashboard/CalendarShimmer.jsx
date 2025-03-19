const CalendarShimmer = () => {
  return (
    <div className="animate-pulse">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={`header-${index}`} className="h-6 bg-gray-200 rounded-md"></div>
        ))}
      </div>

      {/* Calendar grid - 6 rows of 7 days */}
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid grid-cols-7 gap-1 mb-1">
          {Array.from({ length: 7 }).map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-10 bg-gray-200 rounded-md flex items-center justify-center"
            >
              <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default CalendarShimmer;