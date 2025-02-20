import AWS from "aws-sdk";

// AWS Configuration check
if (
  !process.env.NEXT_AWS_REGION ||
  !process.env.NEXT_AWS_ACCESS_KEY_ID ||
  !process.env.NEXT_AWS_SECRET_ACCESS_KEY ||
  !process.env.NEXT_AWS_SES_FROM_EMAIL
) {
  throw new Error("Missing AWS SES configuration environment variables");
}

// AWS SES Configuration
const ses = new AWS.SES({
  region: process.env.NEXT_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY,
  },
});

const domain = process.env.NEXT_PUBLIC_APP_URL;
const fromEmail = process.env.NEXT_AWS_SES_FROM_EMAIL;

const sendEmail = async (to: string, subject: string, html: string) => {
  if (!fromEmail) {
    throw new Error("FROM_EMAIL is not configured in environment variables");
  }
  if (!to || !subject || !html) {
    throw new Error("Missing required email parameters");
  }

  const params: AWS.SES.SendEmailRequest = {
    Source: fromEmail,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: html,
          Charset: "UTF-8",
        },
      },
    },
  };

  try {
    await ses.sendEmail(params).promise();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not verified")) {
        console.error(`Email address verification error: ${error.message}`);
        throw new Error(
          "Email address must be verified in AWS SES before sending. Please verify both sender and recipient email addresses in sandbox mode."
        );
      }
      throw error;
    }
    throw new Error("Failed to send email");
  }
};

// Modern Email Template
export const sendBeautifulEmail = async (
  email: string,
  subject: string,
  content: string
) => {
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #F0F9FF;
          color: #1F2937;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #FFFFFF;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .header {
          background-color: #FFFFFF;
          text-align: center;
          padding: 32px 24px;
          border-bottom: 1px solid #E5E7EB;
        }
        .logo {
          height: 40px;
          margin-bottom: 16px;
        }
        .content {
          padding: 32px 24px;
          line-height: 1.7;
          color: #374151;
        }
        .content h1 {
          margin: 0 0 24px;
          color: #111827;
          font-size: 24px;
          font-weight: 600;
          line-height: 1.3;
        }
        .content p {
          margin: 16px 0;
          font-size: 16px;
        }
        .button {
          display: inline-block;
          margin: 24px 0;
          padding: 12px 24px;
          background-color: #0EA5E9;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          text-align: center;
          transition: background-color 0.2s ease;
        }
        .button:hover {
          background-color: #0284C7;
        }
        .footer {
          text-align: center;
          padding: 24px;
          background-color: #F9FAFB;
          color: #6B7280;
          font-size: 14px;
          border-top: 1px solid #E5E7EB;
        }
        .social-links {
          margin-top: 16px;
        }
        .social-link {
          display: inline-block;
          margin: 0 8px;
          color: #6B7280;
          text-decoration: none;
        }
        .social-link:hover {
          color: #374151;
        }
        .divider {
          height: 1px;
          background-color: #E5E7EB;
          margin: 24px 0;
        }
        @media (max-width: 600px) {
          .container {
            margin: 20px;
            width: auto;
          }
          .content {
            padding: 24px 16px;
          }
          .button {
            display: block;
            text-align: center;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${domain}/logo.png" alt="QentFlow" class="logo">
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} QentFlow. All rights reserved.</p>
          <p>For any questions, contact us at <a href="mailto:support@qentsolutions.com" style="color: #0EA5E9; text-decoration: none;">support@qentsolutions.com</a></p>
          <div class="social-links">
            <a href="#" class="social-link">Twitter</a>
            <span style="color: #D1D5DB">•</span>
            <a href="#" class="social-link">LinkedIn</a>
            <span style="color: #D1D5DB">•</span>
            <a href="#" class="social-link">Facebook</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, subject, emailTemplate);
};

// Email verification
export const verifyEmailAddress = async (emailAddress: string) => {
  try {
    await ses
      .verifyEmailIdentity({
        EmailAddress: emailAddress,
      })
      .promise();
    return `A verification email has been sent to ${emailAddress}. Please check your inbox.`;
  } catch (error) {
    console.error("Error verifying email:", error);
    throw new Error("Unable to initiate email verification");
  }
};

// 2FA Email
export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const content = `
    <h1>Your Verification Code</h1>
    <p>Here is your two-step verification code:</p>
    <div style="
      background-color: #F3F4F6;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
      font-size: 32px;
      letter-spacing: 4px;
      font-weight: 600;
      color: #111827;
    ">${token}</div>
    <p>This code will expire in 5 minutes. Do not share it with anyone.</p>
  `;

  await sendBeautifulEmail(email, "Your Verification Code", content);
};

// Password Reset Email
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/reset-password?token=${token}`;
  const content = `
    <h1>Reset Your Password</h1>
    <p>We have received a request to reset your password. To proceed with the change, click the button below:</p>
    <a class="button" href="${resetLink}">Reset My Password</a>
    <p style="margin-top: 24px; font-size: 14px; color: #6B7280;">If you did not request this reset, you can safely ignore this email.</p>
  `;

  await sendBeautifulEmail(email, "Reset Your Password", content);
};

// Email Verification
export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;
  const content = `
    <h1>Welcome to QentFlow!</h1>
    <p>Thank you for signing up. To start using your account, please confirm your email address:</p>
    <a class="button" href="${confirmLink}">Confirm My Email</a>
    <p style="margin-top: 24px; color: #6B7280;">This link will expire in 24 hours.</p>
    <div class="divider"></div>
    <p style="font-size: 14px; color: #6B7280;">If you did not create an account, you can ignore this email.</p>
  `;

  await sendBeautifulEmail(email, "Confirm Your Email Address", content);
};

// Workspace Invitation
export const sendWorkspaceInvitationEmail = async (
  email: string,
  inviterName: string,
  workspaceName: string
) => {
  const subject = `${inviterName} invites you to join ${workspaceName} on QentFlow`;
  const content = `
    <h1>You've Been Invited to a Workspace!</h1>
    <p>${inviterName} invites you to join the "${workspaceName}" workspace on QentFlow.</p>
    <p>QentFlow is a powerful platform that allows you to manage your projects and workflows efficiently. By joining this workspace, you can easily collaborate with your team.</p>
    <a class="button" href="https://app.qentflow.com/auth/login">Join the Workspace</a>
    <div style="
      background-color: #F3F4F6;
      border-radius: 8px;
      padding: 16px;
      margin: 24px 0;
    ">
      <p style="margin: 0; font-size: 14px; color: #4B5563;">
        ✨ <strong>New to QentFlow?</strong> No worries! We'll guide you through all the steps after accepting the invitation.
      </p>
    </div>
    <p style="font-size: 14px; color: #6B7280;">This invitation will expire in 7 days.</p>
  `;

  await sendBeautifulEmail(email, subject, content);
};
