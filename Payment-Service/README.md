# Payment Service

Payment processing microservice with webhook support and payment providers.

## Features

- Payment processing with multiple providers (Mock, Stripe)
- Webhook dispatcher and receiver with HMAC verification
- Partner management and registration
- Event normalization
- Retry mechanism for failed webhooks

## Installation

```bash
npm install
```

## Running the service

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run start:prod
```

## Testing

```bash
npm test
npm run test:cov
```

## Environment Variables

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=admin123
DATABASE_NAME=sistema-chifles

JWT_SECRET=supersecreto123
JWT_EXPIRES_IN=1h

PAYMENT_SERVICE_PORT=3002
```

## Architecture

- **providers/**: Payment provider implementations
- **adapters/**: Payment adapter patterns (Mock, Stripe)
- **payments/**: Payment CRUD operations
- **partners/**: Partner management
- **webhooks/**: Webhook dispatcher and receiver
- **models/**: Data models and entities
- **utils/**: Helper functions and utilities
