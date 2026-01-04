interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(initialMode === 'login');

    // Reset state when modal opens/closes or initialMode changes
    useEffect(() => {
        setIsLogin(initialMode === 'login');
    }, [initialMode, isOpen]);

    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        },
                    },
                });
                if (error) throw error;

                if (!data.session) {
                    setError("Account created. Please check your email to verify your identity.");
                    setLoading(false);
                    return;
                }
            }

            onClose();
            router.refresh(); // Force refresh to update Navbar and Role states
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-md bg-white rounded-2xl p-8 md:p-10 relative overflow-hidden shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center space-y-4 mb-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-indigo-600 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                <ShieldCheck className="w-3 h-3" />
                                {isLogin ? "Secure Access" : "Create Customer Account"}
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                                {isLogin ? "Welcome Back" : "Register Seeker Profile"}
                            </h2>
                            <p className="text-slate-500 text-sm font-medium">
                                {isLogin ? "Access your saved birth charts and reports." : "Establish your astronomical identity for precision analysis."}
                            </p>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-5">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                                            <User className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="divine-input !pl-12 !h-12"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                                        <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="divine-input !pl-12 !h-12"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                                        <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="divine-input !pl-12 !h-12"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-[11px] font-bold text-center bg-red-50 py-2 rounded-lg border border-red-100">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                                )}
                            </button>

                            <p className="text-center text-xs font-medium text-slate-500">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-indigo-600 font-bold hover:underline"
                                >
                                    {isLogin ? "Sign Up" : "Log In"}
                                </button>
                            </p>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center items-center opacity-40">
                            <span className="text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase">Secure Environment • SSL Encrypted</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
