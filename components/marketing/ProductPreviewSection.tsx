import React from "react";

export default function ProductPreviewSection() {
  return (
    <section className="bg-gray-50 py-24 px-6 sm:px-12 lg:px-24 text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-16">
          A Scheduling Tool Built for Speed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Card 1 */}
          <div className="flex flex-col items-center">
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 flex-1 aspect-[4/3] flex flex-col pt-4">
              {/* Abstract Dashboard Mock */}
              <div className="mx-4 flex gap-2 mb-4">
                <div className="h-3 w-16 bg-gray-200 rounded-full" />
                <div className="h-3 w-12 bg-gray-200 rounded-full" />
              </div>
              <div className="flex-1 bg-gray-50 m-4 rounded-xl border border-gray-100 p-4">
                <div className="h-4 w-3/4 bg-indigo-100 rounded-md mb-4" />
                <div className="h-10 w-full bg-white rounded-md border border-gray-200 shadow-sm mb-2" />
                <div className="h-10 w-full bg-white rounded-md border border-gray-200 shadow-sm" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Create booking links</h3>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col items-center">
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 flex-1 aspect-[4/3] flex flex-col pt-4">
              {/* Abstract Availability Mock */}
              <div className="mx-4 flex justify-between items-center mb-4">
                <div className="h-3 w-24 bg-gray-200 rounded-full" />
                <div className="h-4 w-8 bg-green-100 rounded-full" />
              </div>
              <div className="flex-1 bg-gray-50 m-4 rounded-xl border border-gray-100 p-4 flex gap-2">
                <div className="w-1/3 bg-white border border-gray-200 rounded-md flex flex-col justify-center items-center gap-2">
                  <div className="h-2 w-8 bg-gray-200 rounded-full" />
                  <div className="h-12 w-1 bg-indigo-200 rounded-full" />
                </div>
                <div className="w-2/3 bg-white border border-gray-200 rounded-md flex flex-col gap-2 p-2">
                  <div className="h-6 w-full bg-indigo-50 border border-indigo-100 rounded px-2 font-mono text-[8px] text-indigo-400 flex items-center">9:00 - 17:00</div>
                  <div className="h-6 w-full bg-indigo-50 border border-indigo-100 rounded px-2 font-mono text-[8px] text-indigo-400 flex items-center">9:00 - 17:00</div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Set availability</h3>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col items-center">
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 flex-1 aspect-[4/3] flex flex-col pt-4">
              {/* Abstract Calendar Booking Mock */}
              <div className="mx-4 flex gap-4 mb-4">
                <div className="h-10 w-10 bg-indigo-100 rounded-full" />
                <div className="flex flex-col gap-2 flex-1 justify-center">
                  <div className="h-3 w-1/2 bg-gray-200 rounded-full" />
                  <div className="h-2 w-1/3 bg-gray-100 rounded-full" />
                </div>
              </div>
              <div className="flex-1 bg-gray-50 m-4 rounded-xl border border-gray-100 p-2 grid grid-cols-4 gap-1">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className={`rounded ${i === 6 ? 'bg-indigo-500 shadow' : 'bg-white border border-gray-100'} h-6`} />
                ))}
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Get booked instantly</h3>
          </div>
        </div>
      </div>
    </section>
  );
}
