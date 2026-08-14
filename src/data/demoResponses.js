export const DEMO_CHAT_RESPONSES = {
  "What is the core architectural pattern used in this codebase?": {
    answer: `## Architectural Pattern: Layered Architecture

ShopFlow uses a **classic Layered (N-Tier) Architecture** with four distinct tiers:

\`\`\`
HTTP Request
    ↓
Routes → Controllers → Services → Repositories → Database
\`\`\`

**1. Routes** define endpoints and attach middleware.
**2. Controllers** handle HTTP concerns only.
**3. Services** contain all business logic.
**4. Repositories** encapsulate all database queries.`,
    sources: [
      { file: "src/routes/order.routes.ts" },
      { file: "src/services/order.service.ts" },
      { file: "src/repositories/order.repository.ts" },
    ],
    suggestions: [
      "How are services communicating with each other?",
      "Show me the order creation flow step by step",
      "What would a microservices split look like for ShopFlow?",
    ],
  },

  "Explain the authentication and authorization data flow": {
    answer: `## Authentication & Authorization Flow

1. Client sends credentials to \`POST /auth/login\`
2. \`AuthService\` validates via bcrypt and issues JWT access + refresh tokens
3. Protected routes use \`auth.middleware.ts\` to verify JWT and attach \`req.user\`
4. \`role.middleware.ts\` enforces admin/customer/vendor roles

**Critical gaps:** no token blacklist on logout, refresh endpoint lacks rate limiting, 2 admin routes missing role checks.`,
    sources: [
      { file: "src/middlewares/auth.middleware.ts" },
      { file: "src/services/auth.service.ts" },
      { file: "src/routes/auth.routes.ts" },
    ],
    suggestions: [
      "How should we implement token blacklisting with Redis?",
      "Which admin routes are missing role checks?",
      "What OAuth providers could we add alongside JWT?",
    ],
  },

  "Where is technical debt highest and what should we fix first?": {
    answer: `## Technical Debt Heat Map

| Priority | Area | Impact |
|----------|------|--------|
| 🔴 P0 | Auth & security | Data breach risk |
| 🔴 P0 | Payment webhooks | Revenue loss |
| 🟠 P1 | Inventory service | Overselling risk |
| 🟡 P2 | Test coverage | Regression risk |

**Fix first:** re-enable Stripe webhook verification, centralize auth middleware, patch raw SQL in report.repository.ts.`,
    sources: [
      { file: "src/services/payment.service.ts" },
      { file: "src/services/inventory.service.ts" },
      { file: "src/middlewares/auth.middleware.ts" },
    ],
    suggestions: [
      "Walk me through the inventory race condition in detail",
      "What does the Stripe webhook fix look like in code?",
      "How should we structure the modules migration?",
    ],
  },
};

export function getDemoChatResponse(question) {
  const normalized = question.trim().toLowerCase();

  for (const [key, response] of Object.entries(DEMO_CHAT_RESPONSES)) {
    if (key.toLowerCase() === normalized) {
      return response;
    }
  }

  for (const [key, response] of Object.entries(DEMO_CHAT_RESPONSES)) {
    const keyWords = key.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    const matchCount = keyWords.filter((w) => normalized.includes(w)).length;
    if (matchCount >= 2) {
      return response;
    }
  }

  return {
    answer: "Based on my analysis of **ShopFlow E-Commerce API**, I can help you explore architecture, auth flows, payment integration, and technical debt priorities. Try one of the suggested questions.",
    sources: [{ file: "src/services/order.service.ts" }],
    suggestions: Object.keys(DEMO_CHAT_RESPONSES),
  };
}
