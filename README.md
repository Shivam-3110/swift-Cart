# 🛒 SwiftCart — AI-Powered E-Commerce Microservices

SwiftCart is a **scalable, microservice-based e-commerce platform** designed to demonstrate how modern backend systems can be built using independent services, asynchronous communication, caching, containerization, and AI-powered shopping assistance.

The project follows a **distributed architecture**, where different business responsibilities are separated into independent services that communicate through APIs and message queues.

---

## 🚀 Key Features

* 🛍️ Product management
* 🛒 Shopping cart management
* 📦 Order management
* 🔔 Asynchronous notification system
* ⚡ Redis-based caching
* 📨 RabbitMQ message broker
* 🤖 AI Shopping Buddy
* 🔐 Authentication and authorization
* 🗄️ MongoDB-based persistence
* 🐳 Dockerized services
* 🔄 Event-driven communication
* 📈 Scalable microservice architecture
* 🧩 Independent service deployment

---

## 🏗️ Architecture

```text
                         ┌────────────────────┐
                         │      Client        │
                         │   Web / Frontend   │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │    API Gateway     │
                         └─────────┬──────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
       ┌─────────────┐      ┌─────────────┐      ┌──────────────┐
       │   Product   │      │    Cart     │      │    Order     │
       │   Service   │      │   Service   │      │   Service    │
       └──────┬──────┘      └──────┬──────┘      └──────┬───────┘
              │                    │                    │
              ▼                    ▼                    ▼
       ┌─────────────┐      ┌─────────────┐      ┌──────────────┐
       │   MongoDB   │      │    Redis    │      │   MongoDB    │
       └─────────────┘      └─────────────┘      └──────────────┘
                                   │
                                   │ Events
                                   ▼
                         ┌────────────────────┐
                         │      RabbitMQ      │
                         │   Message Broker   │
                         └─────────┬──────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
             ┌─────────────┐              ┌──────────────┐
             │ Notification│              │ AI Shopping  │
             │   Service   │              │    Buddy     │
             └─────────────┘              └──────────────┘
```

---

## 🧩 Microservices

### 1. Product Service

Responsible for managing the product catalog.

**Responsibilities:**

* Create products
* Update products
* Delete products
* Fetch product details
* Product search
* Product availability
* Product inventory information

**Technology:**

* Node.js
* Express.js
* MongoDB
* Mongoose
* Redis

---

### 2. Cart Service

Handles user shopping carts.

**Responsibilities:**

* Add products to cart
* Remove products
* Update cart items
* Retrieve user cart
* Calculate cart totals
* Manage cart state

Redis can be used for fast access to frequently requested cart data.

---

### 3. Order Service

Responsible for processing customer orders.

**Responsibilities:**

* Create orders
* Validate cart information
* Calculate order totals
* Maintain order status
* Store order history
* Publish order-related events

Example order lifecycle:

```text
Cart
  │
  ▼
Create Order
  │
  ▼
Validate Order
  │
  ▼
Store Order
  │
  ▼
Publish Event
  │
  ▼
RabbitMQ
```

---

### 4. Notification Service

The Notification Service consumes events from RabbitMQ and performs notification-related tasks.

For example:

```text
Order Created
      │
      ▼
   RabbitMQ
      │
      ▼
Notification Service
      │
      ├──► Email
      │
      └──► Other Notifications
```

This keeps notification processing independent from the Order Service.

---

### 5. 🤖 AI Shopping Buddy

SwiftCart also includes an AI-powered shopping assistant designed to improve the shopping experience.

The AI assistant can help users:

* Discover products
* Understand product features
* Compare products
* Answer shopping-related questions
* Recommend products based on requirements
* Assist users during product discovery

Example:

```text
User:
"I need a laptop for programming under ₹70,000."

                │
                ▼

          AI Shopping Buddy
                │
                ▼
        Product Service
                │
                ▼
       Relevant Products
                │
                ▼
        AI Recommendation
```

The AI layer can be extended to use product catalog data, user preferences, and contextual conversations.

---

# 📨 RabbitMQ Event-Driven Architecture

SwiftCart uses **RabbitMQ** for asynchronous communication between services.

Instead of tightly coupling services through direct synchronous requests, important events can be published through a message broker.

Example:

```text
Order Service
     │
     │ OrderCreated
     ▼
  RabbitMQ
     │
     ├──────────────► Notification Service
     │
     └──────────────► Other Consumers
```

### Example Events

```text
OrderCreated
OrderCancelled
PaymentCompleted
ProductUpdated
StockUpdated
```

This architecture makes it easier to add new consumers without modifying the original producer service.

---

# ⚡ Redis

Redis is used as a high-performance in-memory data store.

Potential use cases in SwiftCart include:

* Product caching
* Cart storage
* Session data
* Frequently accessed information
* Rate limiting
* Temporary data

Example:

```text
Client
  │
  ▼
Product Service
  │
  ├──► Redis ──► Cache Hit
  │
  └──► MongoDB ──► Cache Miss
```

This reduces unnecessary database queries and improves response times for frequently accessed data.

---

# 🗄️ Database Architecture

Each microservice can maintain ownership of its own data.

```text
Product Service  ──► Product Database

Cart Service     ──► Cart Data / Redis

Order Service    ──► Order Database

Notification     ──► Notification Data
```

This follows the microservice principle of **service-level data ownership**, reducing tight coupling between services.

---

# 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* JavaScript

### Database

* MongoDB
* Mongoose

### Caching

* Redis

### Message Broker

* RabbitMQ
* AMQP

### AI

* Google Gemini API / LLM integration

### DevOps

* Docker
* Docker Compose

### Development Tools

* Git
* GitHub
* Postman
* npm / pnpm

---

# 📁 Project Structure

A possible project structure:

```text
SwiftCart/
│
├── api-gateway/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   └── server.js
│
├── services/
│
│   ├── product-service/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   │
│   ├── cart-service/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   │
│   ├── order-service/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   │
│   └── notification-service/
│       ├── consumers/
│       ├── services/
│       └── server.js
│
├── ai-shopping-buddy/
│   ├── controllers/
│   ├── services/
│   ├── prompts/
│   └── server.js
│
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

---

# 🔄 Example Order Flow

A typical SwiftCart order flow looks like:

```text
              User
                │
                ▼
             Cart
                │
                ▼
         Create Order
                │
                ▼
         Order Service
                │
                ▼
          Save Order
                │
                ▼
        Publish Event
                │
                ▼
            RabbitMQ
                │
        ┌───────┴────────┐
        ▼                ▼
 Notification        Other Services
   Service
        │
        ▼
   Notification
```

This allows the Order Service to complete its primary responsibility without waiting for every downstream operation.

---

# 🔐 Environment Variables

Create a `.env` file for each service where required.

Example:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

REDIS_URL=your_redis_connection_string

RABBITMQ_URL=your_rabbitmq_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key
```

> ⚠️ Never commit `.env` files or API keys to GitHub.

Add them to `.gitignore`:

```gitignore
node_modules/
.env
.env.*
!.env.example
```

---

# 🐳 Running with Docker

Make sure Docker is installed and running.

Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
cd SwiftCart
```

Build the services:

```bash
docker compose build
```

Start the application:

```bash
docker compose up
```

Run in detached mode:

```bash
docker compose up -d
```

Stop the services:

```bash
docker compose down
```

---

# 💻 Running Locally

Install dependencies:

```bash
npm install
```

or:

```bash
pnpm install
```

Create the required `.env` files.

Start the individual services:

```bash
npm run dev
```

Make sure the following infrastructure services are available:

```text
MongoDB
Redis
RabbitMQ
```

---

# 🧪 API Testing

SwiftCart APIs can be tested using **Postman**.

Example API categories:

### Products

```http
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Cart

```http
GET    /api/cart
POST   /api/cart
PUT    /api/cart/:id
DELETE /api/cart/:id
```

### Orders

```http
POST   /api/orders
GET    /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id
```

### AI Shopping Buddy

```http
POST /api/ai/chat
```

Example request:

```json
{
  "message": "Suggest a good laptop for programming under ₹70000"
}
```

---

# 🔑 Core Microservice Concepts Demonstrated

SwiftCart is designed to demonstrate practical backend engineering concepts including:

* Microservice architecture
* Service isolation
* REST APIs
* Event-driven architecture
* Message queues
* Asynchronous communication
* Redis caching
* Database-per-service principles
* Docker containerization
* API Gateway architecture
* Fault isolation
* Horizontal scalability
* AI integration
* Inter-service communication

---

# 📈 Future Improvements

Possible future improvements include:

* [ ] API Gateway with authentication
* [ ] Centralized authentication service
* [ ] Payment Service
* [ ] Inventory Service
* [ ] Elasticsearch-based product search
* [ ] Kafka integration for high-volume events
* [ ] Distributed tracing
* [ ] Centralized logging
* [ ] Prometheus + Grafana monitoring
* [ ] Kubernetes deployment
* [ ] CI/CD pipeline
* [ ] AI-based personalized recommendations
* [ ] AI shopping agent with tool calling
* [ ] Product recommendation based on purchase history
* [ ] Fault tolerance and retry mechanisms
* [ ] Dead-letter queues
* [ ] Circuit breaker pattern

---

# 🎯 Learning Objectives

This project was built to understand how production-oriented backend systems can move beyond a traditional monolithic architecture.

The project focuses on:

```text
Monolith
   │
   ▼
Microservices
   │
   ├── REST APIs
   ├── Redis
   ├── RabbitMQ
   ├── MongoDB
   ├── Docker
   └── AI Integration
```

The goal is to understand not only how to build APIs, but also how independent services communicate, share events, handle asynchronous workloads, and scale independently.

---

# 👨‍💻 Author

**Shivam Tiwari**

B.Tech Computer Science Engineering

Interested in:

* Backend Development
* Microservices
* Cloud Computing
* Distributed Systems
* AI & Agentic AI

---

# ⭐ If You Like This Project

If you found SwiftCart useful for learning microservices, feel free to ⭐ the repository and explore the implementation.
