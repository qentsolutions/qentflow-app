import AWS from 'aws-sdk';

if (!process.env.AWS_REGION || 
    !process.env.AWS_ACCESS_KEY_ID || 
    !process.env.AWS_SECRET_ACCESS_KEY || 
    !process.env.AWS_SES_FROM_EMAIL) {
  throw new Error("Missing AWS SES configuration environment variables");
}

const ses = new AWS.SES({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const domain = process.env.NEXT_PUBLIC_APP_URL;
const fromEmail = process.env.AWS_SES_FROM_EMAIL;

const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
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
      // Check for verification errors
      if (error.message.includes("not verified")) {
        console.error(`Email address verification error: ${error.message}`);
        throw new Error(
          "Email address must be verified in AWS SES before sending. " +
          "Please verify both sender and recipient email addresses in sandbox mode."
        );
      }
      throw error;
    }
    throw new Error("Failed to send email");
  }
};

// Utility function to verify an email address
export const verifyEmailAddress = async (emailAddress: string) => {
  try {
    await ses.verifyEmailIdentity({
      EmailAddress: emailAddress
    }).promise();
    return `Verification email sent to ${emailAddress}. Please check your inbox.`;
  } catch (error) {
    console.error("Error verifying email:", error);
    throw new Error("Failed to initiate email verification");
  }
};

export const sendTwoFactorTokenEmail = async (
  email: string,
  token: string
) => {
  await sendEmail(
    email,
    "2FA Code",
    `<p>Your 2FA code: ${token}</p>`
  );
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;
  
  await sendEmail(
    email,
    "Reset your password",
    `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`
  );
};

export const sendVerificationEmail = async (
  email: string, 
  token: string
) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  await sendEmail(
    email,
    "Confirm your email",
    `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`
  );
};