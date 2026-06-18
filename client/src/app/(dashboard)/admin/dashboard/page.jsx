"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../../../../lib/api";

export default function AdminDashboard() {
const [dashboard, setDashboard] =
useState({
todayBookings: 0,
todayRevenue: 0,
totalCustomers: 0,
newCustomersToday: 0,
totalServices: 0,
pendingBookings: 0,
approvedBookings: 0,
revenueThisMonth: 0,
completionRate: 0,
mostRequestedService: null,
leastRequestedService: null,
unreadNotifications: [],
});

const [loading, setLoading] =
useState(true);

const fetchDashboard =
async () => {
try {
const res =
await api.get(
"/dashboard"
);


    setDashboard(
      res.data.data
    );
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
fetchDashboard();
}, []);

const stats = [
{
label:
"Today's Bookings",
value:
dashboard.todayBookings,
icon: "📅",
color:
"from-blue-500 to-blue-600",
},


{
  label:
    "Total Customers",
  value:
    dashboard.totalCustomers,
  icon: "👥",
  color:
    "from-emerald-500 to-emerald-600",
},

{
  label:
    "Today's Revenue",
  value: `$${Number(
    dashboard.todayRevenue
  ).toLocaleString()}`,
  icon: "💰",
  color:
    "from-[#8B6B4F] to-[#6F523C]",
},

{
  label:
    "Total Services",
  value:
    dashboard.totalServices,
  icon: "💆",
  color:
    "from-purple-500 to-purple-600",
},

{
  label:
    "New Customers Today",
  value:
    dashboard.newCustomersToday,
  icon: "🆕",
  color:
    "from-cyan-500 to-cyan-600",
},

{
  label:
    "Pending Bookings",
  value:
    dashboard.pendingBookings,
  icon: "⏳",
  color:
    "from-amber-500 to-amber-600",
},

{
  label:
    "Approved Bookings",
  value:
    dashboard.approvedBookings,
  icon: "✅",
  color:
    "from-green-500 to-green-600",
},

{
  label:
    "Revenue This Month",
  value: `$${Number(
    dashboard.revenueThisMonth
  ).toLocaleString()}`,
  icon: "📈",
  color:
    "from-indigo-500 to-indigo-600",
},

{
  label:
    "Booking Completion Rate",
  value: `${dashboard.completionRate}%`,
  icon: "🎯",
  color:
    "from-pink-500 to-pink-600",
},


];

if (loading) {
return ( <div className="p-6">
Loading Dashboard... </div>
);
}

return ( <div className="space-y-8">


  {/* HEADER */}

  <div>
    <h1
      className="
        text-3xl
        font-bold
        font-[var(--font-heading)]
      "
    >
      Dashboard
    </h1>

    <p className="text-gray-500 mt-1">
      Welcome back!
      Here&apos;s what&apos;s
      happening today.
    </p>
  </div>

  {/* STATS */}

  <div
    className="
      grid
      grid-cols-1
      md:grid-cols-2
      xl:grid-cols-3
      gap-6
    "
  >
    {stats.map(
      (item) => (
        <div
          key={
            item.label
          }
          className="
            bg-white
            rounded-2xl
            p-6
            border
            border-gray-100
            shadow-sm
            hover:shadow-lg
            transition
          "
        >
          <div
            className="
              flex
              justify-between
              items-start
            "
          >
            <div>
              <p
                className="
                  text-sm
                  text-gray-500
                  mb-2
                "
              >
                {
                  item.label
                }
              </p>

              <h2
                className="
                  text-3xl
                  font-bold
                "
              >
                {
                  item.value
                }
              </h2>
            </div>

            <div
              className={`
                w-14
                h-14
                rounded-2xl
                text-white
                text-2xl
                flex
                items-center
                justify-center
                bg-gradient-to-br
                ${item.color}
              `}
            >
              {
                item.icon
              }
            </div>
          </div>
        </div>
      )
    )}
  </div>

  {/* SERVICES */}

  <div
    className="
      grid
      lg:grid-cols-2
      gap-6
    "
  >
    <div
      className="
        bg-white
        rounded-2xl
        border
        border-gray-100
        p-6
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <span className="text-3xl">
          🔥
        </span>

        <div>
          <h2
            className="
              text-lg
              font-bold
            "
          >
            Most Requested
            Service
          </h2>

          <p className="text-gray-500">
            {dashboard
              .mostRequestedService
              ? dashboard
                  .mostRequestedService
                  .name
              : "No Bookings"}
          </p>

          {dashboard
            .mostRequestedService && (
            <p
              className="
                text-sm
                text-[#8B6B4F]
                mt-1
              "
            >
              Total Bookings:
              {" "}
              {
                dashboard
                  .mostRequestedService
                  .total
              }
            </p>
          )}
        </div>
      </div>
    </div>

    <div
      className="
        bg-white
        rounded-2xl
        border
        border-gray-100
        p-6
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <span className="text-3xl">
          📉
        </span>

        <div>
          <h2
            className="
              text-lg
              font-bold
            "
          >
            Least Requested
            Service
          </h2>

          <p className="text-gray-500">
            {dashboard
              .leastRequestedService
              ? dashboard
                  .leastRequestedService
                  .name
              : "No Bookings"}
          </p>

          {dashboard
            .leastRequestedService && (
            <p
              className="
                text-sm
                text-[#8B6B4F]
                mt-1
              "
            >
              Total Bookings:
              {" "}
              {
                dashboard
                  .leastRequestedService
                  .total
              }
            </p>
          )}
        </div>
      </div>
    </div>
  </div>

  {/* NOTIFICATIONS */}

  <div
    className="
      bg-white
      rounded-2xl
      border
      border-gray-100
      overflow-hidden
    "
  >
    <div
      className="
        p-6
        border-b
        border-gray-100
        flex
        justify-between
        items-center
      "
    >
      <h2
        className="
          text-lg
          font-bold
        "
      >
        Unread Notifications
      </h2>

      <Link
        href="/admin/notifications"
        className="
          text-[#8B6B4F]
          font-medium
          hover:underline
        "
      >
        View All
      </Link>
    </div>

    <div className="divide-y">
      {dashboard
        .unreadNotifications
        .length ===
      0 ? (
        <div
          className="
            p-8
            text-center
            text-gray-400
          "
        >
          No unread
          notifications
        </div>
      ) : (
        dashboard
          .unreadNotifications
          .map(
            (
              notification
            ) => (
              <div
                key={
                  notification.id
                }
                className="
                  p-5
                  hover:bg-gray-50
                "
              >
                <div
                  className="
                    flex
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <h3
                      className="
                        font-semibold
                      "
                    >
                      {
                        notification.title
                      }
                    </h3>

                    <p
                      className="
                        text-sm
                        text-gray-500
                        mt-1
                      "
                    >
                      {
                        notification.message
                      }
                    </p>
                  </div>

                  <span
                    className="
                      text-xs
                      text-gray-400
                      whitespace-nowrap
                    "
                  >
                    {new Date(
                      notification.created_at
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )
          )
      )}
    </div>
  </div>
</div>


);
}
