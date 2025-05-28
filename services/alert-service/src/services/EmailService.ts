import nodemailer from 'nodemailer';
import { createLogger } from '@warehouse/utils';
import { Alert } from '../entities/Alert';

const logger = createLogger('email-service');

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendAlertNotification(alert: Alert): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.ALERT_EMAIL_RECIPIENTS || 'admin@warehouse.com',
        subject: `[${alert.severity}] ${alert.title}`,
        html: `
          <h2>Warehouse Alert Notification</h2>
          <p><strong>Type:</strong> ${alert.type}</p>
          <p><strong>Severity:</strong> ${alert.severity}</p>
          <p><strong>Message:</strong> ${alert.message}</p>
          <p><strong>Time:</strong> ${alert.createdAt}</p>
          ${alert.productId ? `<p><strong>Product ID:</strong> ${alert.productId}</p>` : ''}
          <hr>
          <p><em>This is an automated message from the Warehouse Management System.</em></p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      
      logger.info('Alert email sent successfully', {
        alertId: alert.id,
        type: alert.type,
        severity: alert.severity
      });
    } catch (error) {
      logger.error('Failed to send alert email:', {
        error: error.message,
        alertId: alert.id
      });
    }
  }

  async sendTestEmail(): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.SMTP_USER,
        subject: 'Test Email from Warehouse Alert Service',
        text: 'This is a test email to verify email configuration.'
      };

      await this.transporter.sendMail(mailOptions);
      logger.info('Test email sent successfully');
      return true;
    } catch (error) {
      logger.error('Failed to send test email:', error);
      return false;
    }
  }
}
