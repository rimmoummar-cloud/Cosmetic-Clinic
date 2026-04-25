

// "use client";
// import { useQuery } from "@tanstack/react-query";
// import AdminBookingsPage from "./booking";
// const { data: bookings = [] } = useQuery({
//   queryKey: ["bookings"],
//   queryFn: async () => {
//     const res = await fetch(
//       "http://localhost:5000/api/bookings/WithDetails"
//     );
//     return res.json();
//   },
// });

// export default async function Page() {

//  return (
// <AdminBookingsPage bookings={bookings} />
//  );
// }
import AdminBookingsPage from "./booking";

export default function Page() {
  return <AdminBookingsPage />;
}