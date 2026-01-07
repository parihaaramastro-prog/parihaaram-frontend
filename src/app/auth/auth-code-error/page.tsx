import Link from 'next/link'

export default function AuthCodeError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 text-center bg-slate-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100 space-y-6">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Authentication Error</h2>
                <p className="text-slate-500">There was an issue signing you in. The link may have expired or is invalid.</p>
                <div className="pt-4">
                    <Link href="/" className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
