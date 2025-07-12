# EmailJS Setup Instructions

## Step 1: Create EmailJS Account

1. Go to [emailjs.com](https://www.emailjs.com)
2. Sign up for a free account
3. Verify your email address

## Step 2: Connect Your Email Service

1. Go to **Email Services** in your EmailJS dashboard
2. Click **Add New Service**
3. Choose **Gmail** (recommended)
4. Follow the instructions to connect your Gmail account
5. Note down your **Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Template

1. Go to **Email Templates** in your dashboard
2. Click **Create New Template**
3. Use this template content:

```
Subject: 🎮 Sonic Game Feedback - {{feedback_type}}

Hi!

You received new feedback for the Sonic game:

**Feedback Type:** {{feedback_type}}
**Character:** {{character}}
**Level:** {{level}}
**Timestamp:** {{timestamp}}

**Description:**
{{description}}

**Security Answer:** {{security_answer}}
**Browser:** {{user_agent}}

---
Sent from the Sonic Platformer Game
```

4. Save the template and note down your **Template ID** (e.g., `template_xyz789`)

## Step 4: Get Your Public Key

1. Go to **Account** > **General**
2. Copy your **Public Key** (e.g., `user_abcdef123456`)

## Step 5: Update the Game Code

Replace these placeholders in `game.js`:

```javascript
// Line 1605: Replace with your public key
emailjs.init("user_abcdef123456"); 

// Line 1706: Replace with your service ID
'service_abc123',

// Line 1707: Replace with your template ID  
'template_xyz789',
```

## Step 6: Test the Setup

1. Open the game in your browser
2. Click the "🐛 Report Bug / Suggest Feature" button
3. Fill out the form with test data
4. Check that you receive the email

## Security Features

- **Security Question**: Prevents spam by requiring knowledge of Sonic characters
- **Accepted Answers**: sonic, shadow, tails, knuckles, amy, eggman, etc.
- **Form Validation**: All required fields must be filled
- **Rate Limiting**: EmailJS free tier allows 200 emails/month

## Troubleshooting

- **No email received**: Check your spam folder
- **Form not working**: Check browser console for errors
- **EmailJS errors**: Verify your service ID, template ID, and public key
- **Security question failing**: Make sure to enter any Sonic character name

## Email Template Variables

The following variables are sent to your email:
- `{{feedback_type}}` - Bug report, feature request, etc.
- `{{character}}` - Character being played
- `{{level}}` - Level where issue occurred
- `{{description}}` - User's feedback description
- `{{security_answer}}` - Security question answer
- `{{timestamp}}` - When feedback was sent
- `{{user_agent}}` - Browser information for debugging