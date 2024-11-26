import BackButton from "@/components/back-button";

export default function TermsOfUse() {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <BackButton />
        <h1 className="text-2xl font-bold mb-4">Terms of Use</h1>
        <p className="mb-4">
          Welcome to our application. By accessing or using our platform, you agree to the following Terms of Use. Please
          read them carefully before using our services.
        </p>
  
        <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By creating an account or using our services, you agree to these Terms of Use and our{' '}
          <a href="/privacy-policy" className="text-blue-500 hover:underline">
            Privacy Policy
          </a>
          . If you do not agree, you may not use our platform.
        </p>
  
        <h2 className="text-xl font-semibold mb-2">2. Use of Google OAuth</h2>
        <p className="mb-4">
          You may register or log in using your Google account. By doing so, you agree that we can access specific
          information from your Google account, including your name, email address, and profile picture, as required for
          account creation. For more information, see our{' '}
          <a href="/privacy-policy" className="text-blue-500 hover:underline">
            Privacy Policy
          </a>
          .
        </p>
  
        <h2 className="text-xl font-semibold mb-2">3. User Responsibilities</h2>
        <p className="mb-4">
          You are responsible for maintaining the confidentiality of your account credentials and ensuring that all
          activities under your account comply with these Terms of Use.
        </p>
  
        <h2 className="text-xl font-semibold mb-2">4. Changes to the Terms</h2>
        <p className="mb-4">
          We reserve the right to update these Terms of Use at any time. If changes are made, we will notify you by
          updating the &apos;Last Updated&apos; date at the top of this page.
        </p>
  
        <p className="mb-4">Last Updated: November 21, 2024</p>
      </div>
    );
  }
  