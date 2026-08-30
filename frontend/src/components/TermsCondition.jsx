export default function TermsCondition({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-hidden">
      <div className="bg-brand-elevated rounded-2xl border border-slate-800 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 flex-shrink-0">
          <h2 className="text-xl font-bold text-brand-text">Terms & Conditions</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-brand-text transition-colors text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto text-slate-300 text-sm space-y-4">
          <p><strong>Last Updated: August 29, 2026</strong></p>
          <p>Welcome to our Liquiva Platform. By creating an account, accessing, or using our platform, you agree to comply with and be legally bound by these Terms & Conditions. Please read them carefully before using the platform.</p>
          
          <h3 className="text-brand-text font-semibold text-lg mt-6">1. Acceptance of Terms</h3>
          <p>By registering for an account or using any feature of this platform, you confirm that you have read, understood, and agreed to these Terms & Conditions, our Privacy Policy, and other applicable policies.</p>
          <p>If you do not agree with any part of these terms, you should not use the platform.</p>
          
          <h3 className="text-brand-text font-semibold text-lg mt-6">2. User Account</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Users must provide accurate, complete, and up-to-date information during registration.</li>
            <li>Each user is responsible for maintaining the confidentiality of their login credentials.</li>
            <li>Users must not share their account, password, OTP, or authentication credentials with another person.</li>
            <li>Users are responsible for all activities performed through their account.</li>
            <li>Providing false, misleading, or fraudulent information may result in account suspension or termination.</li>
            <li>One person should not create multiple accounts unless explicitly permitted by the platform.</li>
          </ul>

          <h3 className="text-brand-text font-semibold text-lg mt-6">3. Account Inactivity and Deactivation</h3>
          <p>To maintain platform security and data integrity, accounts may be considered inactive if the user has not logged in or used the platform for <strong>15 consecutive days</strong>.</p>
          <p>After 15 consecutive days of inactivity:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The account may be automatically deactivated or temporarily restricted.</li>
            <li>The user may be required to complete the login or account-verification process to reactivate the account.</li>
            <li>Deactivation does not necessarily mean that the user's data will be immediately deleted.</li>
            <li>Certain account information may be retained for security, legal, regulatory, fraud-prevention, or operational purposes.</li>
            <li>The platform reserves the right to permanently delete an account and associated data where permitted or required by applicable law and the platform's data-retention policy.</li>
          </ul>
          <p>We may send an email, notification, or other communication before or after account deactivation where reasonably possible.</p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">4. Accuracy of User Trading Data</h3>
          <p>Users are responsible for ensuring that all trading information entered into the platform is accurate.</p>
          <p>This includes, but is not limited to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Currency pair</li>
            <li>Buy/Sell direction</li>
            <li>Entry price</li>
            <li>Exit price</li>
            <li>Trading quantity or lot size</li>
            <li>Stop-loss</li>
            <li>Take-profit</li>
            <li>Trade date and time</li>
            <li>Profit and loss information</li>
            <li>Other transaction-related information</li>
          </ul>
          <p>If a user enters incorrect or incomplete information, the platform's calculations, statistics, reports, charts, or performance analysis may also be incorrect.</p>
          <p>The platform is not responsible for losses, incorrect calculations, or decisions resulting from inaccurate user-entered information.</p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">5. Buy and Sell Transactions</h3>
          <p>Users are solely responsible for reviewing and confirming their Buy and Sell information before submitting or recording a transaction.</p>
          <p>Once a transaction or trade record has been submitted, users should verify the details displayed by the platform.</p>
          <p>The platform does not guarantee that every displayed market price, trade price, or transaction value will exactly match the price available from a broker, exchange, liquidity provider, or third-party market-data provider.</p>
          <p>Any difference may occur because of market movements, spreads, latency, data-provider limitations, network issues, or other technical factors.</p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">6. Trading Risk and Loss Disclaimer</h3>
          <p><strong>Forex and financial-market trading involve substantial risk and may result in partial or complete loss of capital.</strong></p>
          <p>Users acknowledge that:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Trading decisions are made entirely at the user's own risk.</li>
            <li>The platform does not guarantee profits or a specific rate of return.</li>
            <li>Past performance does not guarantee future results.</li>
            <li>Market prices can change rapidly and unexpectedly.</li>
            <li>Users may lose more or less than expected depending on the nature of the trading activity and applicable broker or market conditions.</li>
            <li>The platform is not responsible for financial losses resulting from a user's trading decisions.</li>
          </ul>
          <p><strong>The platform, its owners, developers, employees, or service providers shall not be held responsible for losses resulting from trades or investment decisions made by users based on information displayed on the platform, except where liability cannot legally be excluded.</strong></p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">7. AI Analysis and Suggestions</h3>
          <p>The platform may provide AI-powered features such as:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Market analysis</li>
            <li>Trading insights</li>
            <li>Buy/Sell-related analysis</li>
            <li>Entry and exit suggestions</li>
            <li>Technical analysis</li>
            <li>Market summaries</li>
            <li>Risk-related observations</li>
            <li>Chat-based trading assistance</li>
          </ul>
          <p>AI-generated information is provided for <strong>informational and educational purposes only</strong>.</p>
          <p>AI-generated analysis:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Is not guaranteed to be accurate.</li>
            <li>May contain errors or outdated information.</li>
            <li>Does not guarantee market movement or trading success.</li>
            <li>Should not be treated as personalized financial, investment, or trading advice.</li>
            <li>Should not be used as the sole basis for making financial decisions.</li>
          </ul>
          <p>Users are responsible for independently evaluating any information before taking action.</p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">8. Market Data Disclaimer</h3>
          <p>Market prices, charts, indicators, news, currency rates, and other financial information may be obtained from third-party data providers.</p>
          <p>Although reasonable efforts may be made to provide reliable and timely information:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Data may be delayed.</li>
            <li>Data may occasionally be unavailable.</li>
            <li>Prices may contain errors or discrepancies.</li>
            <li>Third-party services may experience outages or rate limitations.</li>
            <li>Displayed prices may differ from actual executable prices offered by a broker or trading venue.</li>
          </ul>
          <p>The platform does not guarantee the completeness, accuracy, reliability, or real-time availability of third-party market data.</p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">9. No Guarantee of Service Availability</h3>
          <p>We aim to keep the platform available and operational; however, continuous or uninterrupted availability cannot be guaranteed.</p>
          <p>The platform may temporarily become unavailable because of:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Server maintenance</li>
            <li>Software updates</li>
            <li>Network problems</li>
            <li>Database issues</li>
            <li>Third-party service outages</li>
            <li>API failures</li>
            <li>Security incidents</li>
            <li>Internet-service interruptions</li>
            <li>Other technical or unforeseen circumstances</li>
          </ul>
          <p>We shall not be responsible for losses caused solely by temporary service interruptions, except where applicable law provides otherwise.</p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">10. User Responsibility</h3>
          <p>Users agree to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use the platform only for lawful purposes.</li>
            <li>Provide accurate information.</li>
            <li>Keep account information secure.</li>
            <li>Verify trading information before relying on it.</li>
            <li>Maintain appropriate risk management.</li>
            <li>Comply with applicable laws and regulations.</li>
            <li>Not attempt to manipulate, exploit, damage, or disrupt the platform.</li>
            <li>Not use automated methods, bots, scripts, or other systems to abuse platform functionality unless expressly authorized.</li>
          </ul>

          <h3 className="text-brand-text font-semibold text-lg mt-6">11. Prohibited Activities</h3>
          <p>Users must not:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Create accounts using false information.</li>
            <li>Attempt unauthorized access to another user's account.</li>
            <li>Reverse engineer or exploit the platform.</li>
            <li>Introduce malicious code, viruses, or harmful software.</li>
            <li>Attempt to bypass authentication or security controls.</li>
            <li>Manipulate platform data.</li>
            <li>Abuse APIs or third-party services.</li>
            <li>Use the platform for illegal activities.</li>
            <li>Attempt to interfere with other users' access to the platform.</li>
          </ul>
          <p>Violation of these rules may result in immediate suspension or termination of the account.</p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">12. Account Suspension and Termination</h3>
          <p>We reserve the right to suspend, restrict, deactivate, or terminate an account if:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>The user violates these Terms & Conditions.</li>
            <li>Fraudulent or suspicious activity is detected.</li>
            <li>The account presents a security risk.</li>
            <li>False information has been provided.</li>
            <li>The platform is being misused.</li>
            <li>Required verification is not completed.</li>
            <li>The account remains inactive for the applicable period.</li>
            <li>Termination is required by applicable law or legal authority.</li>
          </ul>
          <p>Where appropriate and legally permitted, we may provide notice before taking such action.</p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">13. Data and Privacy</h3>
          <p>We may collect and process information necessary to provide and improve the platform, including account information, trading records, platform activity, and technical information.</p>
          <p>User data will be handled in accordance with our Privacy Policy and applicable data-protection laws.</p>
          <p>Certain information may be retained after account deactivation or termination when required for legal, security, fraud-prevention, dispute-resolution, or legitimate operational purposes.</p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">14. Changes to the Platform</h3>
          <p>We may add, modify, suspend, or remove platform features from time to time.</p>
          <p>Features, calculations, AI functionality, market-data sources, and other services may be updated without prior notice when reasonably necessary.</p>
          <p>Continued use of the platform after changes are made may constitute acceptance of the updated Terms & Conditions.</p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">15. Changes to These Terms</h3>
          <p>We may update these Terms & Conditions from time to time.</p>
          <p>When material changes are made, we may provide reasonable notice through the platform or other available communication methods.</p>
          <p>Users are responsible for reviewing the latest version of these Terms & Conditions.</p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">16. Third-Party Services</h3>
          <p>The platform may integrate with third-party services, APIs, payment providers, market-data providers, authentication providers, or other external services.</p>
          <p>We are not responsible for the availability, accuracy, security, or performance of third-party services that are outside our reasonable control.</p>
          <p>Third-party services may have their own terms and privacy policies.</p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">17. Intellectual Property</h3>
          <p>All platform software, design, branding, logos, graphics, content, features, and other proprietary materials belong to the platform or its respective licensors unless otherwise stated.</p>
          <p>Users may not copy, reproduce, distribute, modify, sell, or commercially exploit platform content without appropriate authorization.</p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">18. Limitation of Liability</h3>
          <p>To the maximum extent permitted by applicable law, the platform and its owners, developers, employees, affiliates, and service providers shall not be liable for indirect, incidental, consequential, or financial losses arising from:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Trading decisions</li>
            <li>Market movements</li>
            <li>Incorrect user-entered information</li>
            <li>Delayed or unavailable market data</li>
            <li>AI-generated information</li>
            <li>Technical failures</li>
            <li>Internet or network interruptions</li>
            <li>Third-party service failures</li>
            <li>Unauthorized account access caused by the user's failure to protect credentials</li>
          </ul>
          <p>Nothing in these Terms is intended to exclude liability that cannot legally be excluded or limited.</p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">19. No Financial Advice</h3>
          <p>Nothing on this platform should be interpreted as a recommendation to buy, sell, hold, or trade any financial instrument.</p>
          <p>Users should obtain independent professional financial advice where appropriate before making investment or trading decisions.</p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">20. User Acknowledgement of Risk</h3>
          <p>By using the platform, you acknowledge that you understand the risks associated with financial-market and forex trading and that you are responsible for your own trading decisions.</p>
          <p>You further acknowledge that:</p>
          <p><strong>No profit is guaranteed, and losses are possible.</strong></p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">21. Governing Law</h3>
          <p>These Terms & Conditions shall be governed by and interpreted in accordance with the applicable laws and regulations of the jurisdiction in which the platform operates, subject to mandatory legal requirements.</p>
          <p>Any dispute shall be handled by the appropriate courts or authorities having jurisdiction.</p>

          <h3 className="text-brand-text font-semibold text-lg mt-6">22. Contact and Support</h3>
          <p>If you have questions regarding these Terms & Conditions, account deactivation, data, transactions, or platform functionality, please contact our support team through the official support channels provided on the platform.</p>

          <hr className="my-6 border-slate-700" />

          <h3 className="text-brand-text font-semibold text-lg">Final User Confirmation</h3>
          <p>By clicking <strong>"I Agree"</strong>, creating an account, or continuing to use the platform, you confirm that:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>You have read and understood these Terms & Conditions.</li>
            <li>You agree to comply with these Terms & Conditions.</li>
            <li>You understand that forex and financial-market trading involves risk.</li>
            <li>You understand that losses can occur and that the platform does not guarantee profits.</li>
            <li>You understand that AI-generated information is not guaranteed to be accurate or profitable.</li>
            <li>You agree that you are responsible for verifying your trading information and decisions.</li>
          </ul>
          <p><strong>By continuing to use the platform, you acknowledge and accept these Terms & Conditions.</strong></p>
        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2 bg-brand-gold text-brand-darker font-bold rounded hover:bg-brand-goldHover transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}
