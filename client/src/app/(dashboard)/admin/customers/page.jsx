"use client";

import { bookings } from "../../../data/bookings";

export default function AdminCustomersPage() {
  // Extract unique customers from bookings
  const customers = Array.from(
    new Map(
      bookings.map((b) => [
        b.customerEmail,
        { name: b.customerName, email: b.customerEmail, phone: b.customerPhone },
      ])
    ).values()
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-[var(--font-heading)]">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage customer information</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => {
          const customerBookings = bookings.filter(
            (b) => b.customerEmail === customer.email
          );
          return (
            <div
              key={customer.email}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                  {customer.name[0]}
                </div>
                <div>
                  <h3 className="font-semibold">{customer.name}</h3>
                  <p className="text-xs text-gray-400">{customer.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium">{customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bookings</span>
                  <span className="font-medium">{customerBookings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Visit</span>
                  <span className="font-medium">{customerBookings[customerBookings.length - 1]?.date}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50">
                <button className="w-full py-2 text-sm text-primary font-medium hover:bg-accent rounded-lg transition-colors">
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
