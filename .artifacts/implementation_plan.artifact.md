# Implementation Plan - Fix User App Signup Issues

The user reported two issues in the Customer (User) App:
1.  **Duplicate registration error:** When a user starts registration but doesn't verify their email with OTP, then tries to register again, they get an error saying the email/number is already registered.
2.  **OTP not coming:** Emails containing OTPs are not being received by users.

## User Review Required

> [!IMPORTANT]
> To fix the **"OTP not coming"** issue permanently, you must ensure that your Resend API Key is valid and that you have verified your domain in the Resend dashboard. If you are using `onboarding@resend.dev`, you can only send emails to the email address associated with your Resend account.

## Proposed Changes

### Backend Components

#### [MODIFY] [customer.controller.js](file:///D:/go-long-drive/backend/src/controllers/customer.controller.js)
Modify the `register` function to allow retrying registration if the existing account is unverified. If an unverified account matches the email or phone number, we will delete the old unverified account and allow the new registration to proceed.

#### [MODIFY] [driver.controller.js](file:///D:/go-long-drive/backend/src/controllers/driver.controller.js)
Apply the same fix to the driver registration logic for consistency.

#### [MODIFY] [email.service.js](file:///D:/go-long-drive/backend/src/services/email.service.js)
Improve logging in the `sendMail` helper to provide more clarity when an email fails to send, especially in development environments.

## Verification Plan

### Automated Tests
I will create a small script to test the duplicate registration logic by:
1.  Registering a user but not verifying their email.
2.  Registering the same user again and verifying that it succeeds (by deleting the old unverified account).

### Manual Verification
1.  **Duplicate Registration:**
    -   In the User App, enter details for a new user and hit "Register".
    -   When on the OTP screen, hit "Back" or restart the app.
    -   Try to register again with the same details.
    -   Verify that it no longer says "Email/Number already registered" and proceeds to the OTP screen.
2.  **OTP Delivery:**
    -   Try to register with an email address you have access to.
    -   Check if the OTP email arrives.
    -   If it doesn't arrive, check the backend console logs for the `[DEV OTP]` message to get the OTP manually and proceed with testing.
