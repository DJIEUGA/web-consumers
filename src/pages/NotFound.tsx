import React from 'react'
import { COLORS } from "../styles/colors";
import { Link } from 'react-router-dom'

const NotFound = () => {
    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
                <p className="text-xl text-slate-600 mb-6">
                    The page you are looking for does not exist.
                </p>
                <Link to="/">
                    <button className="action-btn">
                        Back to Home
                    </button>
                </Link>
            </div>
        </div>
    )
}

export default NotFound
