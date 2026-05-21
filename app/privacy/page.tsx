import type { Metadata } from 'next'
import LegalPage from '@/components/ui/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy | Operon Automation',
  description: 'Privacy Policy for Operon Automation and the Revenue Autopilot platform.',
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="May 20, 2025">
      <h2>1. Introduction</h2>
      <p>
        Operon Automation (&quot;Operon,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website operonauto.com and the Revenue Autopilot platform. This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our services.
      </p>
      <p>
        By using our website or services, you agree to the collection and use of information in accordance with this policy.
      </p>

      <h2>2. Information We Collect</h2>
      <h3>Information you provide directly</h3>
      <ul>
        <li>Name, email address, phone number, and business information submitted through forms</li>
        <li>Revenue Leak Scanner answers and responses</li>
        <li>Contact form submissions and communications</li>
        <li>Account information if you create an account</li>
      </ul>

      <h3>Information collected automatically</h3>
      <ul>
        <li>Log data including IP address, browser type, pages visited, and time on site</li>
        <li>Cookies and similar tracking technologies</li>
        <li>Analytics data through tools like Google Analytics (see Section 5)</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, operate, and improve our services</li>
        <li>Generate and deliver your Revenue Leak Score and report</li>
        <li>Send you product updates, service information, and marketing communications (with your consent)</li>
        <li>Respond to your inquiries and support requests</li>
        <li>Analyze how our services are used to improve the experience</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>4. Sharing Your Information</h2>
      <p>
        We do not sell your personal information. We may share your information with:
      </p>
      <ul>
        <li><strong>Service providers:</strong> Third-party vendors who help us operate our services (hosting, email delivery, analytics), bound by confidentiality agreements</li>
        <li><strong>Legal compliance:</strong> When required by law, court order, or governmental authority</li>
        <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
      </ul>

      <h2>5. Cookies and Tracking</h2>
      <p>
        We use cookies and similar technologies to improve your experience, analyze usage, and support marketing. This may include:
      </p>
      <ul>
        <li>Google Analytics for website usage analysis</li>
        <li>Meta Pixel for advertising performance tracking</li>
        <li>Session cookies for form functionality</li>
      </ul>
      <p>
        You can control cookie settings through your browser. Disabling cookies may affect some functionality.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain your information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your personal data at any time by contacting us at hello@operonauto.com.
      </p>

      <h2>7. Your Rights</h2>
      <p>Depending on your location, you may have rights to:</p>
      <ul>
        <li>Access the personal information we hold about you</li>
        <li>Request correction of inaccurate information</li>
        <li>Request deletion of your information</li>
        <li>Opt out of marketing communications at any time</li>
      </ul>

      <h2>8. Security</h2>
      <p>
        We use commercially reasonable security measures to protect your information. However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
      </p>

      <h2>9. Children's Privacy</h2>
      <p>
        Our services are not directed to children under 13. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date. Your continued use of our services after changes constitutes acceptance of the updated policy.
      </p>

      <h2>11. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, please contact us at:<br />
        Operon Automation<br />
        Email: hello@operonauto.com<br />
        Website: operonauto.com
      </p>
    </LegalPage>
  )
}
