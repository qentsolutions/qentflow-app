import AWS from "aws-sdk";

// Vérification des variables d'environnement
if (
  !process.env.NEXT_AWS_REGION ||
  !process.env.NEXT_AWS_ACCESS_KEY_ID ||
  !process.env.NEXT_AWS_SECRET_ACCESS_KEY ||
  !process.env.NEXT_AWS_SES_FROM_EMAIL
) {
  throw new Error("Missing AWS SES configuration environment variables");
}

// Configuration de AWS SES
const ses = new AWS.SES({
  region: process.env.NEXT_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY,
  },
});

const domain = process.env.NEXT_PUBLIC_APP_URL;
const fromEmail = process.env.NEXT_AWS_SES_FROM_EMAIL;

// Fonction d'envoi d'email générique
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

// Modèle HTML d'e-mail
export const sendBeautifulEmail = async (
  email: string,
  subject: string,
  content: string
) => {
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #007bff;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #007bff;
          color: white;
          text-align: center;
          padding: 20px;
          font-size: 24px;
        }
        .content {
          padding: 20px;
          line-height: 1.6;
        }
        .content p {
          margin: 10px 0;
        }
        .button {
          display: inline-block;
          margin: 20px 0;
          padding: 12px 20px;
          font-size: 16px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        }
        .footer {
          text-align: center;
          padding: 10px;
          background-color: #007bff;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          QentFlow
        </div>
        <div class="content">
          ${content}
          <p>If you have any questions, feel free to contact us at <a href="mailto:support@qentsolutions.com">support@qentsolutions.com</a>.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} QentFlow. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(email, subject, emailTemplate);
};

// Fonction pour vérifier une adresse email
export const verifyEmailAddress = async (emailAddress: string) => {
  try {
    await ses
      .verifyEmailIdentity({
        EmailAddress: emailAddress,
      })
      .promise();
    return `Verification email sent to ${emailAddress}. Please check your inbox.`;
  } catch (error) {
    console.error("Error verifying email:", error);
    throw new Error("Failed to initiate email verification");
  }
};

// Cas d'utilisation spécifiques

// Envoi d'un e-mail avec un code 2FA
export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  const content = `<p>Your 2FA code is: <strong>${token}</strong>. Enter this code to complete your login.</p>`;
  await sendBeautifulEmail(email, "Your 2FA Code", content);
};

// Envoi d'un e-mail de réinitialisation de mot de passe
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/reset-password?token=${token}`;
  const content = `<p>We received a request to reset your password. Click the button below to proceed:</p>
    <a class="button" href="${resetLink}">Reset Password</a>`;
  await sendBeautifulEmail(email, "Reset Your Password", content);
};

// Envoi d'un e-mail de vérification
export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/verify?token=${token}`;
  const content = `<p>Thank you for signing up! Please confirm your email address by clicking the button below:</p>
    <a class="button" href="${confirmLink}">Confirm Email</a>`;
  await sendBeautifulEmail(email, "Confirm Your Email Address", content);
};
