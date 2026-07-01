"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clerkWebhook = void 0;
const database_service_1 = require("../services/database.service");
const svix_1 = require("svix");
const clerkWebhook = async (req, res) => {
    const payloadString = req.body.toString();
    const svixHeaders = req.headers;
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (WEBHOOK_SECRET) {
        const wh = new svix_1.Webhook(WEBHOOK_SECRET);
        try {
            wh.verify(payloadString, {
                'svix-id': svixHeaders['svix-id'],
                'svix-timestamp': svixHeaders['svix-timestamp'],
                'svix-signature': svixHeaders['svix-signature'],
            });
        }
        catch (err) {
            console.error('Error verifying webhook:', err.message);
            res.status(400).json({ error: 'Error verifying webhook' });
            return;
        }
    }
    let payloadBody;
    try {
        payloadBody = JSON.parse(payloadString);
    }
    catch (e) {
        payloadBody = req.body;
    }
    const { type, data } = payloadBody;
    try {
        switch (type) {
            case 'user.created':
            case 'user.updated':
                await database_service_1.databaseService.upsertUser({
                    clerkId: data.id,
                    email: data.email_addresses?.[0]?.email_address,
                });
                break;
            case 'user.deleted':
                await database_service_1.databaseService.deleteUser(data.id);
                break;
            default:
                break;
        }
        res.status(200).end();
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};
exports.clerkWebhook = clerkWebhook;
