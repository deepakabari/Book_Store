import { createTransport, SentMessageInfo } from 'nodemailer';
import dotenv from 'dotenv';
import { logger } from './logger';
dotenv.config();

interface EmailAuth {
    user: string;
    pass: string;
}

const transporter: SentMessageInfo = createTransport({
    service: 'ethereal',
    auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
    } as EmailAuth,
    tls: { rejectUnauthorized: false },
});

export const sendEmail = async ({
    to,
    subject,
    text,
    html,
    attachments,
}: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    attachments?: { filename: string; path: string }[];
}) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text,
        html,
        attachments,
    };

    new Promise(() => {
        transporter
            .sendMail(mailOptions)
            .then((info: string) => {
                logger.info(info);
            })
            .catch((err: Error) => {
                logger.error('Error in sent', err);
            });
    });
};
