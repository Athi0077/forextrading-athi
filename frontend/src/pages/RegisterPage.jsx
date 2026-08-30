import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import TermsCondition from '../components/TermsCondition';
import logo from '../assets/logo.jpeg';
import bgVideo from '../assets/bgvideo.mp4';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('You must accept the Terms & Conditions to register.');
      return;
    }
    try {
      setError('');
      setLoading(true);
      await register(displayName, email, password);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Video Background */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={bgVideo} type="video/mp4" />
      </video>
      
      {/* Overlay to darken video */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="relative z-10 max-w-md w-full space-y-8 bg-brand-dark/90 backdrop-blur-md p-8 rounded-2xl border border-slate-800 shadow-xl">
        <div className="text-center">
          <img src={logo} alt="ForexTrading Logo" className="mx-auto h-16 w-auto object-contain rounded-xl" />
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Create an account
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="displayName">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-slate-700 placeholder-slate-500 text-white bg-slate-800/50 rounded-md focus:outline-none focus:ring-brand-gold focus:border-brand-gold focus:z-10 sm:text-sm"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
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
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>
        </form>
        
        <div className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-gold hover:text-brand-goldHover">
            Sign in
          </Link>
        </div>
      </div>
      
      {showTerms && <TermsCondition onClose={() => setShowTerms(false)} />}
    </div>
  );
}
