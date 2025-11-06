const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

// 1. Import and load dotenv to access variables from the .env file
// The variables from .env (GMAIL_USER, GMAIL_PASS, RECIPIENT_EMAIL) will be loaded here.
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8081;

// --- Middleware Configuration ---
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// --- Email Sending Route ---
app.post('/send-email', (req, res) => {
    // Log for debugging
    console.log('--- New Email Request Received ---');
    console.log('Recipient Email set to:', process.env.RECIPIENT_EMAIL);
    
    const { name, email, message } = req.body;

    // 1. Configure the SMTP transporter
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', 
        port: 465, 
        secure: true, // Use SSL/TLS
        auth: {
            // Credentials for the authorized account (benskingley@gmail.com)
            user: process.env.GMAIL_USER, 
            pass: process.env.GMAIL_PASS 
        }
    });

    // 2. Email options
    let mailOptions = {
        // IMPORTANT FIX: Use GMAIL_USER as the FROM address to satisfy Gmail's security requirements.
        from: process.env.GMAIL_USER, 
        
        // This is the intended recipient (kciuba62@gmail.com)
        to: process.env.RECIPIENT_EMAIL, 
        
        // Set the customer's email as the REPLY-TO header so you can easily respond.
        replyTo: email, 
        
        subject: `[Masaż] New Message from Contact Form: ${name}`,
        
        // Plain text version
        text: `
Name: ${name}
Email: ${email}

Message:
${message}
        `,
        // HTML version
        html: `
            <h3>Contact Details</h3>
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
            </ul>
            <h3>Message</h3>
            <p>${message}</p>
            <hr>
            <small>Sent via Contact Form at ${new Date().toLocaleString()}</small>
        `
    };

    // 3. Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Nodemailer Error:', error); 
            
            // Send a failure response to the client
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to send email. Check server console for details.', 
                error: error.message 
            });
        }
        
        console.log('Message sent successfully. ID: %s', info.messageId);
        res.status(200).json({ 
            success: true, 
            message: 'Email sent successfully!', 
            info: info 
        });
    });
});

// --- Server Startup ---
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Ready to receive POST requests at /send-email`);
});