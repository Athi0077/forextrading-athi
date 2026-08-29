import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createSupportTicket, getUserSupportTickets } from '../services/supportService';
import { 
  Search, 
  Activity, 
  Bot, 
  BookOpen, 
  Wrench, 
  Shield, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  LifeBuoy, 
  Send, 
  Loader2, 
  AlertCircle,
  FileText,
  CheckCircle2,
  Clock,
  MessageSquare
} from 'lucide-react';

const QUICK_HELP_CARDS = [
  {
    title: 'Market Data',
    icon: Activity,
    description: 'Get help with live Forex prices, market updates and chart data.',
    topics: ['Live price not updating', 'Market data unavailable', 'Chart data delay', 'Market status']
  },
  {
    title: 'AI Assistant',
    icon: Bot,
    description: 'Learn how AI analysis and market insights work.',
    topics: ['AI analysis', 'AI responses', 'Market insights', 'AI limitations']
  },
  {
    title: 'Trade Journal',
    icon: BookOpen,
    description: 'Manage your recorded trades, P/L and trading history.',
    topics: ['Add a trade', 'Edit or delete trades', 'Trade P/L', 'Journal history']
  },
  {
    title: 'Trading Tools',
    icon: Wrench,
    description: 'Get help with Risk Calculator, Watchlist and Price Alerts.',
    topics: ['Risk calculation', 'Watchlist', 'Price alerts', 'Position sizing']
  },
  {
    title: 'Account & Security',
    icon: Shield,
    description: 'Manage your account, profile and security settings.',
    topics: ['Login issues', 'Account settings', 'Password/security', 'Account data']
  },
  {
    title: 'Technical Issues',
    icon: Settings,
    description: 'Troubleshoot application, loading and connection problems.',
    topics: ['Page not loading', 'API errors', 'Connection problems', 'Unexpected errors']
  }
];

const FAQS = [
  {
    q: 'How does the live Forex market data work?',
    a: 'The application uses the configured live market-data provider to retrieve current Forex market information. Prices may change frequently and availability can depend on the data provider and market conditions.'
  },
  {
    q: 'Why is my market price not updating?',
    a: 'Live market data may temporarily be unavailable because of network issues, provider limits, market status or API rate limits. Please wait a moment and try again. If the issue continues, contact support.'
  },
  {
    q: 'How is my trading P/L calculated?',
    a: 'Profit and loss is calculated using your recorded trade information such as trade direction, entry price, exit price and position size. The displayed result is based on the data stored in your Trade Journal.'
  },
  {
    q: 'How does the Risk Calculator work?',
    a: 'The Risk Calculator estimates the amount you may risk based on your account balance, selected risk percentage and stop-loss distance. Results are estimates and should be reviewed before making trading decisions.'
  },
  {
    q: 'How do I add a currency pair to my Watchlist?',
    a: 'Open the Watchlist section, search for the currency pair and select Add to Watchlist. Your selected pairs are saved to your account and can be accessed again later.'
  },
  {
    q: 'How do Price Alerts work?',
    a: 'Create an alert by selecting a currency pair, choosing Above or Below and entering a target price. When the configured condition is reached, the alert will be marked as triggered and an in-app notification can be shown.'
  },
  {
    q: 'How does AI Market Analysis work?',
    a: 'AI Market Analysis uses available market information and technical context to generate an informational market overview. AI output can be inaccurate and should not be treated as guaranteed trading signals or financial advice.'
  },
  {
    q: 'Can the AI guarantee profitable trades?',
    a: 'No. AI cannot guarantee profits or predict the market with certainty. AI-generated analysis is intended for informational and educational purposes only.'
  },
  {
    q: 'Can I edit or delete a trade?',
    a: 'Yes. Open Trade Journal, select the relevant trade and use the available Edit or Delete action.'
  },
  {
    q: 'Is my trading data private?',
    a: 'Your application data should be associated with your authenticated account and protected through server-side authorization. Users should only be able to access their own trading data.'
  },
  {
    q: 'What should I do if the application shows an error?',
    a: 'First refresh the page and check your internet connection. If the issue continues, submit a support request with the affected feature, a short description and an optional screenshot.'
  },
  {
    q: 'Where can I report a technical problem?',
    a: 'Use the Contact Support form below. Select Technical Issue as the category and provide enough information for the support team to reproduce the problem.'
  }
];

export default function SupportPage() {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // FAQ State
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    category: 'Other',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState(null);

  // Tickets State
  const [tickets, setTickets] = useState([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    try {
      const res = await getUserSupportTickets();
      if (res.success) setTickets(res.tickets);
    } catch (error) {
      console.error('Failed to load tickets', error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredCards = QUICK_HELP_CARDS.filter(card => 
    card.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    card.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFaqs = FAQS.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage(null);

    try {
      await createSupportTicket(formData);
      setFormMessage({ type: 'success', text: 'Support request submitted successfully. Your request has been received. You can track its status below.' });
      setFormData(prev => ({ ...prev, subject: '', message: '' }));
      fetchTickets();
    } catch (error) {
      setFormMessage({ type: 'error', text: error.message || 'Failed to submit request.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Open</span>;
      case 'IN PROGRESS': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">In Progress</span>;
      case 'RESOLVED': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Resolved</span>;
      case 'CLOSED': return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">Closed</span>;
      default: return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">{status}</span>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header Section */}
      <div className="bg-brand-surface border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-extrabold text-brand-text mb-4">How can we help?</h1>
            <p className="text-brand-muted text-lg mb-8">Find answers, troubleshoot issues, or contact our support team.</p>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" />
              <input
                type="text"
                placeholder="Search for help, features or common issues..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-4 bg-brand-base border border-brand-border rounded-2xl text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Quick Help Section */}
        {filteredCards.length > 0 && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-brand-text">Quick Help</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map((card, idx) => (
                <div key={idx} className="bg-brand-surface border border-brand-border rounded-2xl p-6 hover:border-brand-accent/50 transition-colors group flex flex-col h-full">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent mr-4 group-hover:scale-110 transition-transform">
                      <card.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-brand-text">{card.title}</h3>
                  </div>
                  <p className="text-sm text-brand-muted mb-6 flex-grow">{card.description}</p>
                  <div className="space-y-2 mb-6">
                    {card.topics.map((topic, i) => (
                      <div key={i} className="flex items-center text-xs text-brand-muted">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-accent/50 mr-2" />
                        {topic}
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-2.5 rounded-xl border border-brand-border text-sm font-semibold text-brand-text hover:bg-brand-elevated transition-colors mt-auto">
                    View Help
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQs Section */}
        {filteredFaqs.length > 0 && (
          <section>
            <div className="mb-6 text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-brand-text">Frequently Asked Questions</h2>
              <p className="text-brand-muted mt-2">Quick answers to common questions.</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden transition-all duration-200">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-elevated/50 transition-colors"
                  >
                    <span className="font-semibold text-brand-text text-sm sm:text-base pr-4">{faq.q}</span>
                    {expandedFaq === idx ? (
                      <ChevronUp className="w-5 h-5 text-brand-accent flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-brand-muted flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === idx && (
                    <div className="p-4 pt-0 text-sm text-brand-muted border-t border-brand-border/50 bg-brand-elevated/30">
                      <p className="mt-4">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {(filteredCards.length === 0 && filteredFaqs.length === 0) && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-brand-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-brand-text">No matching help articles found.</h3>
            <p className="text-brand-muted mt-2">Can't find what you're looking for?</p>
            <button onClick={() => { setSearchQuery(''); document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' }); }} className="mt-6 px-6 py-2.5 bg-brand-accent text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-accent/20 hover:opacity-90 transition-opacity">
              Contact Support
            </button>
          </div>
        )}

        {/* Contact Form Section */}
        <section id="contact-form" className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-brand-text">Still need help?</h2>
            <p className="text-brand-muted mt-2">Our support team can help with account, application and technical issues.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-brand-surface border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            {formMessage && (
              <div className={`p-4 rounded-xl flex items-start text-sm font-medium border ${formMessage.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                {formMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
                {formMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-brand-muted mb-2 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-muted mb-2 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  disabled={!!currentUser?.email}
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-muted mb-2 uppercase tracking-wider">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent appearance-none transition-all cursor-pointer"
              >
                <option value="Account">Account</option>
                <option value="Market Data">Market Data</option>
                <option value="AI Assistant">AI Assistant</option>
                <option value="Trade Journal">Trade Journal</option>
                <option value="Trading Tools">Trading Tools</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-muted mb-2 uppercase tracking-wider">Subject</label>
              <input
                type="text"
                required
                maxLength={150}
                placeholder="Briefly describe your issue"
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-muted mb-2 uppercase tracking-wider">Message</label>
              <textarea
                required
                rows={5}
                maxLength={2000}
                placeholder="Tell us what happened and provide any useful details..."
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full bg-brand-elevated border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-brand-accent text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-accent/20 hover:opacity-90 transition-opacity flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                Submit Support Request
              </button>
            </div>
          </form>
        </section>

        {/* Support Requests Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-brand-text">My Support Requests</h2>
            <button onClick={fetchTickets} className="text-sm text-brand-accent hover:underline font-medium">Refresh</button>
          </div>

          <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-sm">
            {isLoadingTickets ? (
              <div className="p-8 text-center text-brand-muted flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-accent mb-4" />
                <p>Loading your support requests...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-brand-elevated flex items-center justify-center mb-4">
                  <LifeBuoy className="w-8 h-8 text-brand-muted" />
                </div>
                <h3 className="text-lg font-bold text-brand-text mb-2">No Support Requests</h3>
                <p className="text-brand-muted text-sm max-w-sm">You haven't submitted any support requests yet. If you need help, use the form above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-brand-elevated/50 border-b border-brand-border">
                      <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider">Ticket ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-xs font-bold text-brand-muted uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {tickets.map(ticket => (
                      <tr key={ticket._id} className="hover:bg-brand-elevated/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-text">{ticket.ticketNumber}</td>
                        <td className="px-6 py-4 text-sm text-brand-text max-w-[200px] truncate">{ticket.subject}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-muted">{ticket.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(ticket.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-muted">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button 
                            onClick={() => setSelectedTicket(ticket)}
                            className="text-sm font-bold text-brand-accent hover:opacity-80 transition-opacity"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Footer Contact Info */}
        <section className="bg-brand-surface border border-brand-border rounded-2xl p-8 text-center max-w-4xl mx-auto flex flex-col items-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-accent/5 pointer-events-none" />
          <LifeBuoy className="w-12 h-12 text-brand-accent mb-4 relative z-10" />
          <h2 className="text-xl font-bold text-brand-text mb-2 relative z-10">Need more assistance?</h2>
          <p className="text-brand-muted text-sm max-w-lg mb-8 relative z-10">Submit a support request and provide as much detail as possible so we can help you faster.</p>
          <div className="flex gap-4 relative z-10">
            <button onClick={() => { document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' }); }} className="px-6 py-2.5 bg-brand-accent text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-accent/20 hover:opacity-90 transition-opacity">
              Contact Support
            </button>
            <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-6 py-2.5 bg-brand-elevated text-brand-text border border-brand-border rounded-xl text-sm font-bold hover:bg-brand-border transition-colors">
              View FAQs
            </button>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="border-t border-brand-border pt-8 pb-12 text-center px-4">
          <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">Trading Risk Disclaimer</p>
          <p className="text-xs text-brand-muted/70 max-w-4xl mx-auto leading-relaxed">
            Forex trading involves significant risk and may not be suitable for every investor. Market data, calculations and AI-generated insights are provided for informational and educational purposes only and should not be considered financial advice or a guarantee of profit.
          </p>
        </div>

      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTicket(null)} />
          <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-2xl relative z-10 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-brand-border flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-bold text-brand-text">{selectedTicket.ticketNumber}</h3>
                {getStatusBadge(selectedTicket.status)}
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-brand-muted hover:text-brand-text p-1">
                <ChevronDown className="w-6 h-6 rotate-90" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8">
              <div>
                <h4 className="text-xl font-bold text-brand-text mb-2">{selectedTicket.subject}</h4>
                <div className="flex items-center text-xs text-brand-muted space-x-4">
                  <span className="flex items-center"><FileText className="w-3.5 h-3.5 mr-1" /> {selectedTicket.category}</span>
                  <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-brand-base border border-brand-border rounded-xl p-5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-brand-elevated flex items-center justify-center text-brand-text font-bold text-xs border border-brand-border">
                      {selectedTicket.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-text">{selectedTicket.name}</p>
                      <p className="text-xs text-brand-muted">You</p>
                    </div>
                  </div>
                  <p className="text-sm text-brand-text whitespace-pre-wrap leading-relaxed">{selectedTicket.message}</p>
                </div>

                {selectedTicket.supportReply && (
                  <div className="bg-brand-accent/5 border border-brand-accent/20 rounded-xl p-5 relative">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-brand-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">STAFF</div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        <LifeBuoy className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brand-text">Support Team</p>
                        <p className="text-xs text-brand-muted">Response</p>
                      </div>
                    </div>
                    <p className="text-sm text-brand-text whitespace-pre-wrap leading-relaxed">{selectedTicket.supportReply}</p>
                  </div>
                )}
                
                {!selectedTicket.supportReply && selectedTicket.status !== 'CLOSED' && (
                  <div className="text-center p-6 border border-dashed border-brand-border rounded-xl bg-brand-base/50">
                    <MessageSquare className="w-8 h-8 text-brand-muted mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-brand-muted">Our support team is reviewing your request. We'll reply here as soon as possible.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-brand-border bg-brand-base rounded-b-2xl flex-shrink-0 flex justify-end">
              <button 
                onClick={() => setSelectedTicket(null)}
                className="px-6 py-2.5 bg-brand-elevated border border-brand-border text-brand-text rounded-xl text-sm font-bold hover:bg-brand-border transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
