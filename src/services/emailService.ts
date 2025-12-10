export interface EmailCredentials {
  homeownerEmail: string;
  homeownerName: string;
  temporaryPassword: string;
  portalUrl: string;
  projectType: string;
  address: string;
  startDate: string;
  projectManager: string;
}

import { formatDateUTC } from '@/lib/utils';

export async function sendHomeownerCredentials(credentials: EmailCredentials): Promise<boolean> {
  console.log('📧 Preparing to send email to:', credentials.homeownerEmail);
  console.log('✅ Email would be sent with these details:');
  console.log('To:', credentials.homeownerEmail);
  console.log('Password:', credentials.temporaryPassword);
  console.log('Portal:', credentials.portalUrl);
  
  // Return true so UI shows success
  // You'll manually send the email using the credentials shown on screen
  return true;
}

export function getEmailTemplate(credentials: EmailCredentials): string {
  return `Hi ${credentials.homeownerName},

Great news! Your Arctic Roofing project portal is now active. You can track your project progress, view updates, and see photos in real-time.

🔑 YOUR LOGIN CREDENTIALS:

Portal URL: ${credentials.portalUrl}
Email: ${credentials.homeownerEmail}
Password: ${credentials.temporaryPassword}

📋 YOUR PROJECT DETAILS:

Project Type: ${credentials.projectType}
Address: ${credentials.address}
Start Date: ${formatDateUTC(credentials.startDate)}
Project Manager: ${credentials.projectManager}

WHAT YOU CAN DO IN YOUR PORTAL:
✅ Track project progress through 5 stages
📸 View real-time photos of your project
📝 Read updates from your project manager
📊 See completion timeline and budget
📱 Access from any device, anytime

Simply click the portal URL above and login with your credentials.

We're excited to work with you!

Arctic Roofing Team`;
}