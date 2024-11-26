import BackButton from "@/components/back-button";

export default function PrivacyPolicy() {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <BackButton />
        <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
        <p className="mb-4">
          Your privacy is important to us. This Privacy Policy explains what information we collect, how we use it, and
          your rights regarding your data.
        </p>
  
        <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
        <p className="mb-4">
          When you sign up or log in using Google OAuth, we collect the following information from your Google account:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Name</li>
          <li>Email address</li>
          <li>Profile picture</li>
        </ul>
  
        <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
        <p className="mb-4">
          The data we collect is used to create and manage your account, personalize your experience, and provide you with
          the services you expect. We do not share your data with third parties without your explicit consent.
        </p>
  
        <h2 className="text-xl font-semibold mb-2">3. Your Rights</h2>
        <p className="mb-4">
          Under applicable privacy laws, you have the right to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Access the data we collect about you.</li>
          <li>Request corrections to your data.</li>
          <li>Delete your account and associated data.</li>
        </ul>
  
        <h2 className="text-xl font-semibold mb-2">4. Data Retention</h2>
        <p className="mb-4">
          We retain your data as long as your account is active or as required to provide our services. Once your account
          is deleted, your data will be permanently removed from our systems.
        </p>
  
        <h2 className="text-xl font-semibold mb-2">5. Contact Us</h2>
        <p className="mb-4">
          If you have questions about this Privacy Policy or your data, please contact us at{' '}
          <a href="mailto:support@qentsolutions.com" className="text-blue-500 hover:underline">
            support@qentsolutions.com
          </a>
          .
        </p>
  
        <p className="mb-4">Last Updated: November 21, 2024</p>
      </div>
    );
  }
  