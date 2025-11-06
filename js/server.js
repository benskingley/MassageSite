const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
// 1. Import and load dotenv to access variables from the .env file
require('dotenv').config();

const app = express();
// Use the port defined in the environment variables, or default to 8081
const port = process.env.PORT || 8081;

// --- Middleware Configuration ---
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// --- Email Sending Route ---
app.post('/send-email', (req, res) => {
    // Log that a request was received (useful for debugging)
    console.log('Received request for /send-email.');
    
    const { name, email, message } = req.body;

    // 1. Configure the SMTP transporter with explicit Gmail settings
    // This configuration is more reliable than using service: 'gmail'
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', 
        port: 465, 
        secure: true, // true for 465, false for other ports
        auth: {
            // Get credentials from the environment variables (stored in .env file)
            user: process.env.GMAIL_USER, 
            pass: process.env.GMAIL_PASS 
        }
    });

    // 2. Email options
    let mailOptions = {
        from: email, 
        to: process.env.RECIPIENT_EMAIL || process.env.GMAIL_USER, // Send email to yourself or a designated recipient
        subject: `New Message from Contact Form: ${name}`,
        text: `
Name: ${name}
Email: ${email}

Message:
${message}
        `,
        // Optional: Include an HTML body for better formatting
        html: `
            <h3>Contact Details</h3>
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Email:</strong> ${email}</li>
            </ul>
            <h3>Message</h3>
            <p>${message}</p>
        `
    };

    // 3. Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            // IMPORTANT: Log the detailed error to the server console for debugging
            console.error('Nodemailer Error:', error); 
            
            // Send a generic failure response to the client
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to send email. Check server console for details.', 
                error: error.message 
            });
        }
        
        console.log('Message sent: %s', info.messageId);
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