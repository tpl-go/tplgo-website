// Reuse all editor/OTP stability checks and add account-email contract cases.
process.env.TPL_ACCOUNT_EMAIL_QA = '1';
await import('./s8e725-step1-stability-browser.mjs');
