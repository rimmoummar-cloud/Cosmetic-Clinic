"use client";

import { useState } from "react";
import axios from "axios";

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(e) {

        e.preventDefault();

        try {

            const res = await axios.post(
                "http://localhost:5000/api/login",
                {
                    email,
                    password
                }
            );

            localStorage.setItem(
                "token",
                res.data.token
            );

            window.location.href = "/admin";

        } catch (error) {

            alert("Login failed");

        }

    }

    return (

        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f1ea] to-[#e8dfd3]">

            <div className="backdrop-blur-xl bg-white/60 border border-white/40 shadow-2xl rounded-3xl p-10 w-[350px]">

                <h1 className="text-3xl font-semibold text-center text-[#6b5b4b] mb-8">
                    Admin Login
                </h1>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-3 rounded-xl bg-white/70 border border-[#e0d6c8] focus:outline-none focus:ring-2 focus:ring-[#cbb89d]"
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-3 rounded-xl bg-white/70 border border-[#e0d6c8] focus:outline-none focus:ring-2 focus:ring-[#cbb89d]"
                    />

                    <button
                        type="submit"
                        className="mt-4 bg-[#cbb89d] hover:bg-[#b8a389] text-white font-medium py-3 rounded-xl transition"
                    >
                        Login
                    </button>

                </form>

            </div>

        </div>

    );

}