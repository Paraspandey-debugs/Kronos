import { Request, Response } from 'express';
import { databaseService } from '../services/database.service';
import { Webhook } from 'svix';

export const clerkWebhook = async (req: Request, res: Response) => {
  const payloadString = req.body.toString();
  const svixHeaders = req.headers;
  
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (WEBHOOK_SECRET) {
    const wh = new Webhook(WEBHOOK_SECRET);
    try {
      wh.verify(payloadString, {
        'svix-id': svixHeaders['svix-id'] as string,
        'svix-timestamp': svixHeaders['svix-timestamp'] as string,
        'svix-signature': svixHeaders['svix-signature'] as string,
      });
    } catch (err: any) {
      console.error('Error verifying webhook:', err.message);
      res.status(400).json({ error: 'Error verifying webhook' });
      return;
    }
  }

  let payloadBody;
  try {
    payloadBody = JSON.parse(payloadString);
  } catch (e) {
    payloadBody = req.body;
  }

  const { type, data } = payloadBody;

  try {
    switch (type) {
      case 'user.created':
      case 'user.updated':
        await databaseService.upsertUser({
          clerkId: data.id,
          email: data.email_addresses?.[0]?.email_address,
        });
        break;
      case 'user.deleted':
        await databaseService.deleteUser(data.id);
        break;
      default:
        break;
    }
    res.status(200).end();
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
