
import AdminBookingsPage from "./booking";
async function getBooking() {
  const res = await fetch(

     `http://localhost:5000/api/bookings/WithDetails`,
    {
    cache: "no-store"
    }
  );

  return res.json();
}

export default async function Page() {
   const bookings = await getBooking();
 return (
<AdminBookingsPage bookings={bookings} />
 );
}