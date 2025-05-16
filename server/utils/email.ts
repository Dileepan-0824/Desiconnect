import nodemailer from 'nodemailer';

// Configure transporter for development (logs to console) or production
const createTransporter = () => {
  // In production, you would use actual email service credentials
  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Use console logging for development
  return {
    sendMail: async (mailOptions: any) => {
      console.log('===============================');
      console.log('Email notification would be sent:');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('Text:', mailOptions.text);
      console.log('HTML:', mailOptions.html);
      console.log('===============================');
      return { messageId: 'dev-mode' };
    },
  };
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  password: string,
  userType: 'customer' | 'seller' | 'admin'
) => {
  const transporter = createTransporter();

  const portalName = 
    userType === 'customer' ? 'Customer Account' :
    userType === 'seller' ? 'Seller Dashboard' : 'Admin Dashboard';

  await transporter.sendMail({
    from: `"DesiConnect" <${process.env.EMAIL_FROM || 'noreply@desiconnect.com'}>`,
    to: email,
    subject: 'Your DesiConnect Password Reset',
    text: `Hello ${name},

We received a request to reset your password for your DesiConnect ${portalName}.

Your new temporary password is: ${password}

Please use this password to log in and update your password immediately.

If you did not request this password reset, please contact our support team.

Thank you,
DesiConnect Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF6B35;">DesiConnect Password Reset</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset your password for your DesiConnect ${portalName}.</p>
        <p>Your new temporary password is: <strong>${password}</strong></p>
        <p>Please use this password to log in and update your password immediately.</p>
        <p>If you did not request this password reset, please contact our support team.</p>
        <p>Thank you,<br>DesiConnect Team</p>
      </div>
    `,
  });
};

export const sendWelcomeEmail = async (
  email: string,
  name: string,
  userType: 'customer' | 'seller' | 'admin'
) => {
  const transporter = createTransporter();

  const portalName = 
    userType === 'customer' ? 'Customer Account' :
    userType === 'seller' ? 'Seller Dashboard' : 'Admin Dashboard';

  await transporter.sendMail({
    from: `"DesiConnect" <${process.env.EMAIL_FROM || 'noreply@desiconnect.com'}>`,
    to: email,
    subject: 'Welcome to DesiConnect',
    text: `Hello ${name},

Welcome to DesiConnect! Your ${portalName} has been successfully created.

Thank you for joining our platform. We're excited to have you as part of our community.

If you have any questions, please contact our support team.

Thank you,
DesiConnect Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #FF6B35;">Welcome to DesiConnect</h2>
        <p>Hello ${name},</p>
        <p>Welcome to DesiConnect! Your ${portalName} has been successfully created.</p>
        <p>Thank you for joining our platform. We're excited to have you as part of our community.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Thank you,<br>DesiConnect Team</p>
      </div>
    `,
  });
};
