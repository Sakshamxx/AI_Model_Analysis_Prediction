import { Link } from 'react-router-dom';

export default function HistoryPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.4em] text-purple-600">History</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">Past Predictions</h1>
      <p className="mt-3 max-w-sm text-sm text-gray-500">
        Your prediction history will appear here once you sign in and run predictions.
      </p>
      <Link
        to="/login"
        className="mt-6 rounded-2xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-700"
      >
        Go to login
      </Link>
    </div>
  );
}
