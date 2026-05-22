import type { Metadata } from 'next'
import LegalPage from '@/components/ui/LegalPage'

export const metadata: Metadata = {
  title: 'SMS Terms & Consent | Operon Automation',
  description: 'SMS terms and consent policy for Operon Automation and Revenue Autopilot.',
}

export default function SmsTermsPage() {
  return (
    <LegalPage title="SMS Terms & Consent" lastUpdated="May 20, 2025">
      <p>
        Operon Automation and the Revenue Autopilot platform include SMS and text message functionality that may be used by businesses to communicate with their customers. This document outlines the terms and requirements for SMS use.
      </p>

      <h2>1. SMS Program Description</h2>
      <p>
        Operon Automation provides SMS automation tools that allow businesses to send automated text messages to their customers, including lead follow-ups, appointment reminders, invoice reminders, review requests, and reactivation messages.
      </p>

      <h2>2. Required Consent from End Customers</h2>
      <p>
        <strong>Businesses using Operon's SMS features are solely responsible for ensuring they have proper consent from their customers before sending any text messages.</strong>
      </p>
      <p>This includes:</p>
      <ul>
        <li>Obtaining express written consent before sending marketing text messages</li>
        <li>Maintaining records of consent for each customer</li>
        <li>Providing a clear description of the messages customers will receive</li>
        <li>Disclosing that message and data rates may apply</li>
      </ul>

      <h2>3. Opt-Out Requirements</h2>
      <p>All SMS communications must support opt-out. Customers must be able to opt out at any time by replying:</p>
      <ul>
        <li><strong>STOP</strong> — to unsubscribe from all messages</li>
        <li><strong>HELP</strong> — to receive help information</li>
        <li><strong>CANCEL, END, QUIT, UNSUBSCRIBE</strong> — also accepted opt-out keywords</li>
      </ul>
      <p>
        Businesses must honor opt-out requests immediately and not send further messages to opted-out numbers.
      </p>

      <h2>4. Message and Data Rates</h2>
      <p>
        Message and data rates may apply to customers receiving SMS messages. This should be disclosed in consent language when customers opt in to receive text messages.
      </p>

      <h2>5. Prohibited SMS Content</h2>
      <p>You may not use Operon's SMS tools to send:</p>
      <ul>
        <li>Unsolicited bulk messages (spam)</li>
        <li>Messages to contacts who have not consented</li>
        <li>Messages to contacts who have opted out</li>
        <li>Content that violates TCPA, CTIA guidelines, or carrier requirements</li>
        <li>Fraudulent, misleading, or deceptive content</li>
      </ul>

      <h2>6. TCPA Compliance</h2>
      <p>
        Businesses using Operon's SMS features must comply with the Telephone Consumer Protection Act (TCPA) and all applicable federal, state, and local laws governing text message communications.
      </p>

      <h2>7. Carrier Requirements</h2>
      <p>
        SMS delivery is subject to carrier policies and requirements. Operon Automation does not guarantee delivery of all messages and is not responsible for carrier filtering or blocking.
      </p>

      <h2>8. Business Responsibility</h2>
      <p>
        Businesses using Operon's SMS features are entirely responsible for:
      </p>
      <ul>
        <li>Maintaining compliance with all applicable SMS laws and regulations</li>
        <li>Obtaining and documenting proper customer consent</li>
        <li>Honoring opt-out requests</li>
        <li>The content of messages sent through the platform</li>
      </ul>
      <p>
        Operon Automation is a technology provider and is not responsible for how businesses use the SMS tools or for non-compliant use.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about SMS terms? Contact us at ceo@operonauto.com.
      </p>
    </LegalPage>
  )
}
