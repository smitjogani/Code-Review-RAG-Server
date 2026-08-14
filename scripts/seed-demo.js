import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../src/models/project.model.js';

dotenv.config();

const DEMO_PROJECT_ID = new mongoose.Types.ObjectId('674a1b2c3d4e5f6789012345');

const DEMO_ANALYSIS_REPORT = `# Codebase Audit & Strategy Report

## Executive Summary

**ShopFlow E-Commerce API** is a mature TypeScript monolith serving a React storefront and admin dashboard. The codebase demonstrates solid domain separation and production-ready patterns in core commerce flows, with room to improve cross-cutting concerns around authentication, observability, and test coverage.

**Overall File Quality Grade: B+** — Well-structured service layer and clear API boundaries; auth middleware and error handling need hardening before scale.

---

## Architecture & Design Pattern

The project follows a **Layered Architecture** with a thin controller layer, service/domain layer, and repository pattern for data access.

| Layer | Responsibility | Key Directories |
|-------|----------------|-----------------|
| Routes | HTTP routing, validation | \`src/routes/\` |
| Controllers | Request/response mapping | \`src/controllers/\` |
| Services | Business logic | \`src/services/\` |
| Repositories | Database access | \`src/repositories/\` |
| Models | Mongoose schemas | \`src/models/\` |

🟢 **Strong:** Clear separation between \`order.service.ts\` and \`payment.service.ts\` — each owns a single domain.
🟡 **Minor:** Some controllers still contain inline validation that belongs in validators.
🟠 **Medium:** Shared utilities in \`src/utils/\` are growing without sub-module boundaries.

---

## Folder Structure & Architecture

### Current Folder Structure

\`\`\`
shopflow-api/
├── src/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── utils/
├── tests/
├── docker-compose.yml
└── package.json
\`\`\`

### Suggested New Folder Structure

\`\`\`
shopflow-api/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── orders/
│   │   ├── payments/
│   │   └── catalog/
│   ├── shared/
│   │   ├── middleware/
│   │   ├── errors/
│   │   └── validators/
│   └── config/
├── tests/
│   ├── unit/
│   └── integration/
└── package.json
\`\`\`

| Aspect | Current | Suggested |
|--------|---------|-----------|
| Discoverability | Moderate — flat layers | High — feature modules |
| Onboarding time | ~2 weeks | ~1 week |
| Cross-module coupling | Some leakage via utils | Explicit module boundaries |

---

## Code Quality Assessment

### Strong Points
- 🟢 **Repository pattern** consistently applied across all data models
- 🟢 **TypeScript strict mode** enabled with minimal \`any\` usage (3 instances)
- 🟢 **Docker Compose** stack mirrors production topology

### Weak Points
- 🟠 **Auth middleware** duplicated across 4 route files instead of centralized guard
- 🟠 **Order service** at 680 lines — candidate for extraction into sub-services
- 🟡 **Test coverage** at 42% — integration tests missing for payment webhooks

### Critical Risks
- 🔴 **\`auth.middleware.ts\`** — JWT secret read from env without rotation strategy; no token blacklist on logout
- 🔴 **\`payment.service.ts\`** — Stripe webhook signature verification commented out in dev branch (line 142)
- 🔴 **SQL injection surface** — raw query in \`report.repository.ts:87\` uses string concatenation

---

## Detailed Code Review & File Quality

- 🟢 \`src/repositories/order.repository.ts\` — Clean query builders, proper index hints on \`userId\` + \`status\`
- 🟢 \`src/config/database.ts\` — Connection pooling configured (min: 5, max: 20)
- 🟡 \`src/services/email.service.ts\` — Template rendering works but lacks retry/backoff for SendGrid failures
- 🟠 \`src/controllers/checkout.controller.ts\` — 340 lines; mixes cart validation with payment orchestration
- 🔴 \`src/middlewares/auth.middleware.ts\` — Missing rate limiting on token refresh endpoint
- 🔴 \`src/services/inventory.service.ts\` — Race condition in stock decrement (no optimistic locking)

---

## Strategic Recommendations

1. **🔴 P0 — Secure auth pipeline:** Centralize JWT middleware, enable webhook signature verification, add token blacklist via Redis.
2. **🟠 P1 — Modularize by domain:** Migrate to \`src/modules/*\` structure over 2 sprints to reduce cross-import coupling.
3. **🟠 P1 — Fix inventory race condition:** Add optimistic locking or Redis-based distributed lock on stock updates.
4. **🟡 P2 — Raise test coverage to 70%:** Prioritize payment webhook and checkout integration tests.
5. **🟡 P2 — Add structured logging:** Replace \`console.log\` in 12 service files with Winston + correlation IDs.

--- SUGGESTED_QUESTIONS ---
- What is the core architectural pattern used in this codebase?
- Explain the authentication and authorization data flow
- Where is technical debt highest and what should we fix first?
`;

const DEMO_STRUCTURE = {
  "shopflow-api": {
    src: {
      controllers: ["order.controller.ts", "auth.controller.ts", "checkout.controller.ts"],
      middlewares: ["auth.middleware.ts", "error.middleware.ts"],
      models: ["user.model.ts", "order.model.ts", "product.model.ts"],
      repositories: ["order.repository.ts", "user.repository.ts"],
      routes: ["order.routes.ts", "auth.routes.ts"],
      services: ["order.service.ts", "payment.service.ts", "inventory.service.ts"],
      utils: ["ApiError.ts", "logger.ts"],
    },
    tests: ["unit", "integration"],
  },
};

async function seed() {
  const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/codebase_rag';

  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB');

  await Project.deleteOne({ _id: DEMO_PROJECT_ID });

  const project = await Project.create({
    _id: DEMO_PROJECT_ID,
    name: 'ShopFlow E-Commerce API',
    type: 'github',
    language: 'TypeScript, Node.js',
    framework: 'Express, React',
    tools: 'PostgreSQL, Redis, Docker',
    repoUrl: 'https://github.com/acme-corp/shopflow-api',
    status: 'completed',
    analysisReport: DEMO_ANALYSIS_REPORT,
    structure: DEMO_STRUCTURE,
    metadata: { demo: true },
  });

  console.log('\n✅ Demo project seeded successfully!\n');
  console.log(`   Project ID: ${project._id}`);
  console.log(`   Name:       ${project.name}`);
  console.log(`   Status:     ${project.status}`);
  console.log('\n📸 Screenshot URLs:');
  console.log(`   Client demo (no backend):  http://localhost:5173/chat?demo=true`);
  console.log(`   Client + API:              http://localhost:5173/chat?project=${project._id}`);
  console.log('');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
