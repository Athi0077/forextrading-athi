import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import TermsCondition from '../components/TermsCondition';
import logo from '../assets/logo.jpeg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [reportMessage, setReportMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('You must accept the Terms & Conditions to sign in.');
      return;
    }
    try {
      setError('');
      setLoading(true);
      const data = await login(email, password);
      if (data.user && data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleReportClick = () => {
    const text = encodeURIComponent(reportMessage || 'Why block my account..');
    window.open(`https://wa.me/916379981170?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-darker px-4">
      <div className="max-w-md w-full space-y-8 bg-brand-dark p-8 rounded-2xl border border-slate-800 shadow-xl">
        <div className="text-center">
          <img src={logo} alt="ForexTrading Logo" className="mx-auto h-16 w-auto object-contain rounded-xl" />
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
              {error.toLowerCase().includes('blocked') && (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={reportMessage}
                    onChange={(e) => setReportMessage(e.target.value)}
                    placeholder="Why block my account.."
                    className="w-full px-3 py-2 border border-red-500/50 placeholder-red-500/50 text-red-500 bg-red-500/10 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleReportClick}
                    className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Report
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-slate-700 placeholder-slate-500 text-white bg-slate-800/50 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-slate-700 placeholder-slate-500 text-white bg-slate-800/50 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="h-4 w-4 text-brand-gold focus:ring-brand-gold border-slate-700 rounded bg-slate-800"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-slate-300">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-brand-gold hover:text-brand-goldHover font-medium"
              >
                Terms & Conditions
              </button>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !acceptedTerms}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-brand-darker bg-brand-gold hover:bg-brand-goldHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
        
        <div className="text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-brand-gold hover:text-brand-goldHover">
            Register here
          </Link>
        </div>
      </div>
      
      {showTerms && <TermsCondition onClose={() => setShowTerms(false)} />}
    </div>
  );
}
