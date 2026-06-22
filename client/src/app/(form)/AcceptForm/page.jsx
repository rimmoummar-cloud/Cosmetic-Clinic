import { Suspense } from "react";
import BookingReviewContent from "./BookingReviewContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingReviewContent />
    </Suspense>
  );
}