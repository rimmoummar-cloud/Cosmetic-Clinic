"use client";
import "../globals.css"
import AdminDashboard from "./dashboard/page";
import { useEffect } from "react";
export default function Page() {


     useEffect(() => {

        const token =
            localStorage.getItem(
                "token"
            );

        if (!token) {

            window.location.href =
                "/login";

        }

    }, []);

    return (
          <AdminDashboard />
    );
}


