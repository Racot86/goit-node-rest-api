import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    host: 'smtp.ukr.net',
    port: 465,
    secure: true,
    auth: {
        user: 'goitnodeapp@ukr.net',
        pass: process.env.MAIL_APP_PASSWORD,
    },
};

const transporter = nodemailer.createTransport(config);

const sendMail = async (options = {}) => {
    const emailOptions = {
        from: 'goitnodeapp@ukr.net',
        subject: 'Nodemailer test',
        text: 'Привіт. Ми тестуємо надсилання листів!',
        ...options
    };

    try {
        return await transporter.sendMail(emailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export default sendMail;
