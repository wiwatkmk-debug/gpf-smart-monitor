import { getSystemConfig } from "./system-config";

export async function sendGoogleChatAlert(message: string) {
    try {
        const webhookUrl = await getSystemConfig("GOOGLE_CHAT_WEBHOOK_URL");

        if (!webhookUrl) {
            console.warn("Google Chat Webhook URL not configured");
            return;
        }

        const data = { text: message };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            console.error(`Error sending Google Chat alert: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error("Failed to send Google Chat alert", error);
    }
}
