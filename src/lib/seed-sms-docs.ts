export const SMS_DOCS_PRODUCT = "sms-otp";

export const DEFAULT_SMS_DOCS = [
  {
    slug: "overview",
    title: "What SMS & OTP is",
    summary: "Account required. Send OTP codes or text messages with an API key.",
    sortOrder: 10,
    body: `SMS & OTP is Zeohost’s messaging API.

You need a Zeohost customer account to open this documentation, create projects, and issue keys. A browser login does not authorize API calls — every request uses an API key.

Use OTP when an app needs a one-time code to confirm a phone number. Use SMS when you already know the message text.

Every send is listed under SMS & OTP in your account, and in the admin panel.`,
  },
  {
    slug: "start",
    title: "Create a project and a developer key",
    summary: "Sign in, create a project, then issue a zh_test_ key.",
    sortOrder: 20,
    body: `1. Sign in to Zeohost.
2. Open [SMS & OTP → API keys](/sms/keys).
3. Create a project for one app.
4. Create a **developer** API key, copy the secret once, and leave on only the scopes that app needs.

Developer keys use the \`zh_test_\` prefix. You can create them yourself after signing in.

Scopes:

- \`otp:send\` sends or resends a verification code
- \`otp:verify\` checks a code
- \`sms:send\` sends a text
- \`sms:read\` reads a message status

A new project starts with the sender ID Zeohost. That value is a label on the message, not a carrier registration.`,
  },
  {
    slug: "tokens",
    title: "Developer and production tokens",
    summary: "zh_test_ for building. zh_live_ after a live provider is connected.",
    sortOrder: 25,
    body: `Zeohost issues two kinds of API keys:

| Kind | Prefix | Who creates it |
| --- | --- | --- |
| Developer | \`zh_test_\` | You, from SMS & OTP → API keys |
| Production | \`zh_live_\` | Zeohost admin, after a live SMS provider is connected |

Use developer keys while you integrate and test. They work against the current mock connector.

Production keys are issued when we get in touch with a live messaging provider and turn that path on for your project. Open [Support](/support) and ask for production SMS access. An admin then creates a \`zh_live_\` key for your project.

Do not put production secrets in public repos or client-side code.`,
  },
  {
    slug: "authentication",
    title: "Authenticate each request",
    summary: "The key goes in the Authorization header.",
    sortOrder: 30,
    body: `Send the secret on every call:

\`\`\`
Authorization: Bearer zh_test_your_key
Content-Type: application/json
\`\`\`

A browser session does not authorize these routes. A missing or wrong key returns 401. A key that is missing the scope for that route returns 403.`,
  },
  {
    slug: "otp-send",
    title: "Send a verification code",
    summary: "POST /api/v1/otp/send",
    sortOrder: 40,
    body: `This call needs the \`otp:send\` scope.

\`\`\`
curl -X POST {{baseUrl}}/api/v1/otp/send \\
  -H "Authorization: Bearer zh_test_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"phone":"+233241234567","purpose":"login"}'
\`\`\`

\`\`\`
{
  "success": true,
  "request_id": "cm...",
  "expires_in": 300
}
\`\`\`

\`phone\` is E.164, with the country code. \`purpose\` is a short label you choose, such as \`login\` or \`checkout\`. The response does not include the code.`,
  },
  {
    slug: "otp-verify",
    title: "Check a verification code",
    summary: "POST /api/v1/otp/verify",
    sortOrder: 50,
    body: `This call needs the \`otp:verify\` scope. Use the same \`phone\` and \`purpose\` you used when sending.

\`\`\`
curl -X POST {{baseUrl}}/api/v1/otp/verify \\
  -H "Authorization: Bearer zh_test_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"phone":"+233241234567","code":"123456","purpose":"login"}'
\`\`\`

\`\`\`
{ "success": true, "verified": true }
\`\`\`

A wrong, expired, or locked code returns \`verified: false\`.`,
  },
  {
    slug: "otp-status",
    title: "Resend a code or read its status",
    summary: "The status never includes the code.",
    sortOrder: 60,
    body: `\`POST {{baseUrl}}/api/v1/otp/resend\` uses the same body as send and the \`otp:send\` scope. During the cooldown it returns 429.

\`GET {{baseUrl}}/api/v1/otp/status/REQUEST_ID\` needs \`otp:send\` or \`otp:verify\`. Replace REQUEST_ID with the \`request_id\` from send.

The status is one of \`pending\`, \`verified\`, \`expired\`, \`invalidated\`, or \`locked\`.`,
  },
  {
    slug: "sms-send",
    title: "Send a text message",
    summary: "POST /api/v1/sms/send",
    sortOrder: 70,
    body: `This call needs the \`sms:send\` scope.

\`\`\`
curl -X POST {{baseUrl}}/api/v1/sms/send \\
  -H "Authorization: Bearer zh_test_your_key" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order-1042" \\
  -d '{"to":"+233241234567","message":"Your order is confirmed.","sender_id":"Zeohost"}'
\`\`\`

\`\`\`
{
  "success": true,
  "message_id": "cm...",
  "status": "queued"
}
\`\`\`

\`GET {{baseUrl}}/api/v1/sms/MESSAGE_ID\` needs \`sms:read\` and returns the status. \`sender_id\` must be enabled on the project.`,
  },
  {
    slug: "statuses",
    title: "Message statuses",
    summary: "What each status means after you send.",
    sortOrder: 80,
    body: `- \`queued\` — stored and waiting
- \`processing\` — a worker has claimed it
- \`sent\` — handed to the connector
- \`delivered\` — a receipt was recorded
- \`failed\` — it could not be sent after the retries
- \`expired\` — it was not completed in time
- \`rejected\` — the connector refused it`,
  },
  {
    slug: "errors",
    title: "Errors",
    summary: "The status code tells you what to fix.",
    sortOrder: 90,
    body: `- \`400\` — the phone, purpose, sender, or message is not valid
- \`401\` — the API key is missing or invalid
- \`403\` — the key does not have the required scope
- \`404\` — that message or request does not exist
- \`429\` — the cooldown or a rate limit blocked the call

The response body is \`{ "success": false, "error": "..." }\`.`,
  },
  {
    slug: "delivery",
    title: "Developer vs live delivery",
    summary: "Mock connector today. Live network after provider onboarding.",
    sortOrder: 100,
    body: `With a developer key, messages are queued in Zeohost and marked delivered by the development mock connector. That receipt is not a delivery from a mobile network.

When a live provider is connected for your account, an admin issues a production key and this section is updated to match the live path.`,
  },
];
