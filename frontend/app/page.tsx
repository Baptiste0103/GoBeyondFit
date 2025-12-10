'use client'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            GoBeyondFit
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Comprehensive Fitness Coaching Platform
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/auth/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Login
            </a>
            <a
              href="/auth/signup"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Sign Up
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">For Coaches</h3>
            <p className="text-gray-600">
              Create custom workout programs, manage groups of students, and track their progress.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">For Students</h3>
            <p className="text-gray-600">
              Follow personalized fitness programs, log your workouts, and earn badges.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Advanced Features</h3>
            <p className="text-gray-600">
              Video uploads, real-time progress tracking, and comprehensive statistics.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
