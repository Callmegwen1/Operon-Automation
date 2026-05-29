import type { Metadata } from 'next'
import LegalPage from '@/components/ui/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service | Operon Automation',
  description: 'Terms of Service for Operon Automation and the Revenue Autopilot platform.',
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="May 29, 2026">
      <p>
        Please read these Terms of Service carefully before using Operon Automation services. By accessing or using our website or services, you agree to be bound by these terms.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing operonauto.com or using any Operon Automation product or service, including the Revenue Leak Scanner and Revenue Autopilot, you agree to these Terms of Service and our Privacy Policy.
      </p>

      <h2>2. Description of Services</h2>
      <p>
        Operon Automation provides business automation tools, the Revenue Leak Scanner, the Revenue Autopilot platform, and related consulting and implementation services for small businesses.
      </p>

      <h2>3. Revenue Leak Scores and Results</h2>
      <p>
        Revenue Leak Scores, reports, and estimated opportunity figures are informational and based on the information you provide. Operon Automation does not guarantee specific financial results, revenue increases, or customer acquisition outcomes. All scores and estimates are provided for educational and planning purposes only.
      </p>

      <h2>4. User Responsibilities</h2>
      <p>You agree to:</p>
      <ul>
        <li>Provide accurate information when using our services</li>
        <li>Use our services only for lawful business purposes</li>
        <li>Not attempt to reverse engineer, copy, or redistribute our software</li>
        <li>Maintain the security of your account credentials</li>
        <li>Comply with all applicable laws and regulations</li>
      </ul>

      <h2>4a. Email Sending and Contact Lists</h2>
      <p>
        Operon Automation provides tools that send emails on your behalf to contacts you manage. You are solely responsible for:
      </p>
      <ul>
        <li>Ensuring you have obtained proper consent from every contact before adding them to Operon and sending them automated messages</li>
        <li>The accuracy, completeness, and legality of your contact lists</li>
        <li>The content of any messages sent through our platform, including that content is truthful and not misleading</li>
        <li>Complying with all applicable email and communications laws including CAN-SPAM, GDPR, CASL, and any other regulations that apply to your location or your contacts&apos; locations</li>
        <li>Honoring unsubscribe and opt-out requests promptly</li>
      </ul>
      <p>
        Operon Automation acts as a data processor on your behalf. You are the data controller responsible for the lawful basis of processing your contacts&apos; information. We provide the infrastructure; you own the relationship and legal responsibility for your communications.
      </p>

      <h2>5. Prohibited Uses</h2>
      <p>You may not use our services to:</p>
      <ul>
        <li>Violate any applicable law or regulation</li>
        <li>Send unsolicited communications (spam) or contact people without their consent</li>
        <li>Add contacts to your account without their knowledge or consent</li>
        <li>Collect or harvest personal information without authorization</li>
        <li>Impersonate any person or entity</li>
        <li>Interfere with or disrupt our services</li>
        <li>Send communications that are false, misleading, or deceptive</li>
      </ul>

      <h2>6. Intellectual Property</h2>
      <p>
        All content, software, and materials on operonauto.com are the intellectual property of Operon Automation and are protected by copyright and other applicable laws. You may not reproduce, distribute, or create derivative works without our written permission.
      </p>

      <h2>7. Third-Party Services</h2>
      <p>
        Our services may integrate with or recommend third-party tools (e.g., CRM platforms, email providers). We are not responsible for the practices of third-party services. Your use of third-party services is governed by their respective terms.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, Operon Automation shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, revenue, or business opportunities, arising from your use of our services.
      </p>

      <h2>9. Disclaimer of Warranties</h2>
      <p>
        Our services are provided &quot;as is&quot; without warranty of any kind. We make no warranties regarding accuracy, reliability, or fitness for a particular purpose.
      </p>

      <h2>10. Termination</h2>
      <p>
        We reserve the right to suspend or terminate your access to our services at any time for violation of these terms or for any other reason at our discretion.
      </p>

      <h2>11. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.
      </p>

      <h2>12. Changes to Terms</h2>
      <p>
        We may update these Terms at any time. Continued use of our services after changes are posted constitutes acceptance of the updated Terms.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these Terms? Contact us at ceo@operonauto.com.
      </p>
    </LegalPage>
  )
}
