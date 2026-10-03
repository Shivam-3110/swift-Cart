# Marketplace with AI Buddy

A full-stack **microservices-based e-commerce marketplace** built with Node.js and Express. The platform includes an AI-powered shopping assistant that can search products and manage the cart via natural language using LangChain and Google Gemini.

---

## Architecture Overview

The project is structured as independent microservices, each with its own database connection, routes, and responsibilities. Services communicate asynchronously via **RabbitMQ** message queues.

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Auth      │    │   Product   │    │    Cart     │    │   Order     │
│  :3000      │    │  :3001      │    │  :3002      │    │  :3003      │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       └──────────────────┴──────────────────┴──────────────────┘
                                    │
                               RabbitMQ
                                    │
       ┌──────────────────┬─────────┴──────────┬──────────────────┐
┌──────┴──────┐    ┌──────┴──────┐    ┌────────┴────┐    ┌────────┴────┐
│   Payment   │    │Notification │    │   Seller    │    │  AI Buddy   │
│  :3004      │    │  :3005      │    │  Dashboard  │    │  :3006      │
└─────────────┘    └─────────────┘    │  :3007      │    └─────────────┘
                                      └─────────────┘
```

---

## Services

### 1. Auth Service (`/Auth`)
Handles all user identity and session management.

**Endpoints:**
| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login with email/username + password | No |
| GET | `/api/auth/me` | Get current authenticated user | Yes |
| GET | `/api/auth/logout` | Logout and blacklist token | No |
| GET | `/api/auth/user/users/me/addresses` | Get user addresses | No* |
| POST | `/users/me/addresses` | Add a new address | Yes |
| DELETE | `/api/auth/users/me/addresses/:addressId` | Delete an address | Yes |

**Key Features:**
- Password hashing with `bcryptjs`
- JWT tokens stored in HTTP-only cookies
- Token blacklisting on logout via **Redis**
- Publishes `AUTH_NOTIFICATION.USER_CREATED` and `AUTH_SELLER_DASHBOARD.USER_CREATED` events on registration

**User Roles:** `user`, `seller`

---

### 2. Product Service (`/product`)
Manages product listings with image upload support.

**Endpoints:**
| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/products` | Create a product | seller / admin |
| GET | `/api/products` | Search/list products | No |
| GET | `/api/products/:id` | Get product by ID | No |
| PATCH | `/api/products/:id` | Update product | seller |
| DELETE | `/api/products/:id` | Delete product | seller |
| GET | `/api/products/seller` | Get seller's own products | seller |

**Key Features:**
- Image uploads via **ImageKit** (up to 5 images per product)
- Full-text search on `title` and `description` using MongoDB text index
- Price filtering with `minprice` / `maxprice` query params
- Pagination with `skip` and `limit`
- Publishes `PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED` and `PRODUCT_NOTIFICATION.PRODUCT_CREATED` events

---

### 3. Cart Service (`/cart`)
Manages per-user shopping carts stored in MongoDB.

**Endpoints:**
| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/cart` | Get current user's cart | user |
| POST | `/api/cart/items` | Add item to cart | user |
| PATCH | `/api/cart/items/:productId` | Update item quantity | user |

**Key Features:**
- Auto-creates an empty cart if none exists
- Increments quantity if item already exists in cart

---

### 4. Order Service (`/order`)
Handles order creation by fetching cart and product data from other services via HTTP.

**Endpoints:**
| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/orders` | Create order from cart | user |
| GET | `/api/orders/me` | Get current user's orders | user |
| GET | `/api/orders/:id` | Get order by ID | user / admin |
| POST | `/api/orders/:id/cancel` | Cancel a pending order | user |
| PATCH | `/api/orders/:id/address` | Update shipping address | user |

**Key Features:**
- Fetches cart from Cart Service and product details from Product Service
- Calculates total price dynamically
- Only `PENDING` orders can be cancelled or have address updated
- Publishes `ORDER_SELLER_DASHBOARD.ORDER_CREATED` event

---

### 5. Payment Service (`/Payment`)
Integrates with **Razorpay** for payment processing.

**Endpoints:**
| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/payments/create/:orderId` | Initiate payment for an order | user |
| POST | `/api/payments/verify` | Verify Razorpay payment signature | user |

**Key Features:**
- Fetches order details from Order Service
- Creates Razorpay order and stores payment record
- Verifies HMAC signature on payment completion
- Publishes payment events: `PAYMENT_INITIATED`, `PAYMENT_COMPLETED`, `PAYMENT_FAILED`

---

### 6. Notification Service (`/notification`)
Listens to RabbitMQ queues and sends transactional emails via **Nodemailer** with Gmail OAuth2.

**Listens to:**
| Queue | Trigger |
|-------|---------|
| `AUTH_NOTIFICATION.USER_CREATED` | Welcome email on registration |
| `PAYMENT_NOTIFICATION.PAYMENT_INITIATED` | Payment initiated email |
| `PAYMENT_NOTIFICATION.PAYMENT_COMPLETED` | Payment success email |
| `PAYMENT_NOTIFICATION.PAYMENT_FAILED` | Payment failure email |
| `PRODUCT_NOTIFICATION.PRODUCT_CREATED` | New product notification to seller |

---

### 7. Seller Dashboard (`/seller-dashboard`)
Provides analytics and data aggregation for sellers. Maintains its own local copies of data synced via RabbitMQ.

**Endpoints:**
| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/metrics` | Sales, revenue, top products | seller |
| GET | `/orders` | All orders for seller's products | seller |
| GET | `/products` | All seller's products | seller |

**Listens to:**
- `AUTH_SELLER_DASHBOARD.USER_CREATED`
- `PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED`
- `ORDER_SELLER_DASHBOARD.ORDER_CREATED`
- `PAYMENT_SELLER_DASHBOARD.PAYMENT_CREATED`
- `PAYMENT_SELLER_DASHBOARD.PAYMENT_UPDATE`

---

### 8. AI Buddy (`/ai-buddy`)
An AI-powered shopping assistant using **LangChain** + **Google Gemini 2.0 Flash**, exposed via **WebSocket**.

**How it works:**
- Users connect via Socket.IO (authenticated via JWT cookie)
- Messages are processed by a LangGraph `StateGraph` agent
- The agent has two tools:
  - `search_product` — searches products via Product Service API
  - `addproducttocart` — adds a product to the user's cart via Cart Service API
- The agent decides when to call tools and responds conversationally

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (ESM modules) |
| Framework | Express.js v5 |
| Database | MongoDB (Mongoose) |
| Cache / Token Blacklist | Redis (ioredis) |
| Message Broker | RabbitMQ (amqplib) |
| Authentication | JWT + HTTP-only cookies |
| Image Storage | ImageKit |
| Payment Gateway | Razorpay |
| Email | Nodemailer (Gmail OAuth2) |
| AI Agent | LangChain + LangGraph + Google Gemini |
| File Upload | Multer (memory storage) |
| Validation | express-validator |
| Testing | Jest + Supertest |

---

## Environment Variables

Each service has its own `.env` file. Common variables:

```env
MONGODB_URI=mongodb://...
JWT_SECRET=your_jwt_secret
RABBIT_URL=amqp://localhost
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

Service-specific:
```env
# Product Service
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

# Payment Service
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Notification Service
EMAIL_USER=
CLIENT_ID=
CLIENT_SECRET=
REFRESH_TOKEN=

# AI Buddy
GOOGLE_API_KEY=
```

---

## Getting Started

Each service is independent. To run a service:

```bash
cd <service-folder>   # e.g., cd Auth
npm install
npm run dev
```

Make sure RabbitMQ, MongoDB, and Redis are running before starting the services.

---

## Message Queue Events

```
AUTH_NOTIFICATION.USER_CREATED          → Notification Service
AUTH_SELLER_DASHBOARD.USER_CREATED      → Seller Dashboard

PRODUCT_NOTIFICATION.PRODUCT_CREATED   → Notification Service
PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED → Seller Dashboard

ORDER_SELLER_DASHBOARD.ORDER_CREATED    → Seller Dashboard

PAYMENT_NOTIFICATION.PAYMENT_INITIATED → Notification Service
PAYMENT_NOTIFICATION.PAYMENT_COMPLETED → Notification Service
PAYMENT_NOTIFICATION.PAYMENT_FAILED    → Notification Service
PAYMENT_SELLER_DASHBOARD.PAYMENT_CREATED → Seller Dashboard
PAYMENT_SELLER_DASHBOARD.PAYMENT_UPDATED → Seller Dashboard
```

---

## ⚠️ Issues & Missing Code

### Auth Service

| # | File | Issue |
|---|------|-------|
| 1 | `Auth/src/db/db.js` | `catch` block references `err` but the parameter is named `error` — will throw a ReferenceError on DB connection failure |
| 2 | `Auth/src/routes/auth.routes.js` | `GET /api/auth/user/users/me/addresses` has middleware in wrong order — `authController.getUserAddresses` is placed before `authMiddleware`, so the route runs the controller without authentication |
| 3 | `Auth/src/routes/auth.routes.js` | `POST /users/me/addresses` is missing the `/api/auth` prefix, inconsistent with all other routes |
| 4 | `Auth/src/routes/auth.routes.js` | `GET /api/auth/logout` should be a `POST` request — logout should not be a GET since it has side effects (blacklisting token) |
| 5 | `Auth/src/middlewares/auth.middleware.js` | Does not check Redis blacklist before accepting the token — a logged-out token can still be used to authenticate |
| 6 | `Auth/src/models/user.model.js` | Address schema uses `zip` field but the controller sends `pincode` — field name mismatch causes pincode to never be saved |

---

### Product Service

| # | File | Issue |
|---|------|-------|
| 7 | `product/src/controllers/product.controller.js` | `createProduct` calls `uploadImage(...)` directly but it is not imported — should be `imagekitService.uploadImage(...)` |
| 8 | `product/src/models/product.model.js` | `productSchema.index(...)` is called after `mongoose.model(...)` — the text index must be defined before the model is compiled |
| 9 | `product/src/routes/product.routes.js` | `GET /seller` route is defined after `GET /:id` — Express will match `/seller` as an `:id` param and never reach the seller route. It must be defined before `/:id` |

---

### Cart Service

| # | File | Issue |
|---|------|-------|
| 10 | `cart/src/controllers/cart.controller.js` | `addItemToCart` and `updateItemQuantity` use `qty` variable which is never defined — the destructured variable is named `quantity` |
| 11 | `cart/src/controllers/cart.controller.js` | `getCart` calls `cart.items.reduce((sum, item) => sum + item.quantity)` with no initial value — will crash on an empty cart |

---

### Order Service

| # | File | Issue |
|---|------|-------|
| 12 | `order/src/controllers/order.controller.js` | `createOrder`, `getMyOrders`, and `getOrderById` use `OrderModel` (capital O) which is never imported — the import is `orderModel` (lowercase) |
| 13 | `order/src/controllers/order.controller.js` | `product.price * item.quantity` — `product.price` is an object `{ amount, currency }`, not a number. Should be `product.price.amount * item.quantity` |
| 14 | `order/src/controllers/order.controller.js` | `product.inStock` is checked but the Product model has no `inStock` field — it has `stock` (Number). Should use `product.stock` |
| 15 | `order/src/models/order.model.js` | `status` enum uses mixed casing: `'pending'` (lowercase) but controller sets `"PENDING"` and checks `"PENDING"` — will fail enum validation on create |
| 16 | `order/src/models/order.model.js` | Total price field is named `totalprice` in the schema but the controller writes to `totalPrice` (camelCase) — data will never be saved |
| 17 | `order/src/models/order.model.js` | `currency` is defined as a sibling of `price` inside `items[]` instead of being nested inside `price` — schema structure does not match what the controller writes |

---

### Payment Service

| # | File | Issue |
|---|------|-------|
| 18 | `Payment/src/controllers/payment.controller.js` | `razorpay.orders.create(price)` — Razorpay expects `{ amount, currency }` object but `price` from the order response may not match this shape directly |
| 19 | `Payment/src/controllers/payment.controller.js` | Uses `require(...)` inside an ES module (`verifyPayment`) — mixing CommonJS `require` in an ESM file will throw a ReferenceError |
| 20 | `Payment/src/models/payment.model.js` | `status` field is defined twice in the schema — the second definition overrides the first, but this is a code smell and should be cleaned up |
| 21 | `Payment/src/app.js` | `cookierParser` is a typo — should be `cookieParser` |

---

### Seller Dashboard

| # | File | Issue |
|---|------|-------|
| 22 | `seller-dashboard/src/routes/seller.routes.js` | `createAuthMiddleware` is called with two arguments `(["seller"], controller.getMetrics)` but the middleware factory only accepts `roles` — the controller is passed as a role, not as the route handler |
| 23 | `seller-dashboard/src/routes/seller.routes.js` | Import path for controller is missing `.js` extension: `"../controllers/seller.controller"` — will fail in ESM |
| 24 | `seller-dashboard/src/broker/listener.js` | Listens to `PAYMENT_SELLER_DASHBOARD.PAYMENT_UPDATE` but the Payment Service publishes `PAYMENT_SELLER_DASHBOARD.PAYMENT_UPDATED` — queue name mismatch means payment updates are never received |

---

### AI Buddy

| # | File | Issue |
|---|------|-------|
| 25 | `ai-buddy/src/sockets/socket.server.js` | `socket.token` is never set — the JWT is decoded and stored as `socket.user` but the agent receives `socket.token` (undefined) as the auth token for tool calls |
| 26 | `ai-buddy/src/agent/tools.js` | `searchProduct` uses `https://localhost:3000` — should be `http://localhost:3001` (Product Service port, not Auth, and not HTTPS for local dev) |
| 27 | `ai-buddy/src/agent/tools.js` | `addProductToCart` sends `qty` in the request body but the Cart Service controller destructures `quantity` — the field name mismatch means quantity is always undefined |
