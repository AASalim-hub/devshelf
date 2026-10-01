# DevShelf .NET Server Flow Guide

This guide teaches the DevShelf backend flow by flow, not file by file.

The goal is to help you understand the server deeply enough to rebuild it, explain it, and teach beginners who are starting their backend journey with .NET.

The server is an ASP.NET Core Web API. It currently focuses on authentication and profile access using:

- ASP.NET Core controllers
- Dependency Injection
- Entity Framework Core
- SQLite
- DTOs
- Services
- Models/entities
- JWT authentication
- BCrypt password hashing
- Middleware
- Basic OOP principles

## How To Use This Guide

Do not start by memorizing files. Start by understanding what happens when a user performs an action.

Every backend feature can be explained with this question:

> When the user does something, what path does the request follow inside the server?

For every flow, teach students in this order:

1. The user action
2. The HTTP request
3. The controller that receives it
4. The DTO that carries the data
5. The service that handles the business logic
6. The model/entity involved
7. The EF Core database action
8. The response returned to the client
9. The design concepts used
10. The common mistakes to watch for

## The Big Picture

DevShelf is a developer productivity app. The backend is responsible for:

- Registering users
- Logging users in
- Issuing JWT tokens
- Protecting private endpoints
- Reading user identity from tokens
- Saving and reading data through EF Core

The frontend should never talk directly to the database. It talks to the API. The API decides what is allowed.

Think of the server like this:

```text
Frontend
   |
   v
HTTP Request
   |
   v
ASP.NET Core Middleware
   |
   v
Controller
   |
   v
Service
   |
   v
EF Core DbContext
   |
   v
SQLite Database
```

## Core Vocabulary

### API

An API is a contract that allows one application to talk to another.

In DevShelf, the React frontend talks to the ASP.NET Core API.

Example:

```text
POST /api/auth/register
```

This means: "I want to create a new account."

### HTTP

HTTP is the language clients and servers use to communicate.

Common HTTP methods:

- `GET`: read data
- `POST`: create data
- `PUT`: replace/update data
- `PATCH`: partially update data
- `DELETE`: remove data

Common status codes:

- `200 OK`: success
- `400 Bad Request`: invalid request
- `401 Unauthorized`: not logged in or invalid token
- `403 Forbidden`: logged in but not allowed
- `404 Not Found`: resource does not exist
- `500 Internal Server Error`: unexpected server failure

### Controller

A controller receives HTTP requests and returns HTTP responses.

In DevShelf:

- `AuthController` handles registration and login.
- `ProfileController` handles the logged-in user's profile.

The controller should not contain heavy business logic. It should coordinate the request.

### DTO

DTO means Data Transfer Object.

A DTO defines the shape of data entering or leaving the API.

In DevShelf:

- `RegisterDto` carries registration input.
- `LoginDto` carries login input.
- `AuthResponseDto` carries login output.
- `ProfileResponseDto` carries profile output.

DTOs protect the server from exposing internal database details.

### Model or Entity

A model/entity represents data stored in the database.

In DevShelf:

- `User` represents a row in the `Users` table.

The model is not the same thing as the DTO.

### Service

A service contains business logic.

In DevShelf:

- `AuthService` handles registration and login rules.
- `JwtService` handles token creation.

Services keep controllers clean.

### DbContext

`AppDbContext` is the EF Core gateway to the database.

It represents a session with the database and exposes database tables through `DbSet`.

In DevShelf:

```text
Users table -> DbSet<User>
```

### Middleware

Middleware is code that runs before the request reaches the controller.

In DevShelf, middleware handles:

- CORS
- Authentication
- Authorization
- HTTPS redirection

### Dependency Injection

Dependency Injection, or DI, means ASP.NET Core creates objects and provides them where needed.

For example:

```text
AuthController needs AuthService.
AuthService needs AppDbContext and JwtService.
JwtService needs IConfiguration.
```

Instead of manually creating all these objects, ASP.NET Core injects them.

## Flow 1: Server Startup Flow

### User Story

Before anyone can register or login, the server must start successfully.

### What Happens

When the API starts, ASP.NET Core builds the application.

The startup flow prepares:

- Configuration
- Database access
- Services
- Authentication
- CORS
- Controllers
- Request pipeline

### Step By Step

1. The server creates a web application builder.
2. The server registers EF Core and SQLite.
3. The server registers custom services like `AuthService` and `JwtService`.
4. The server reads JWT configuration from app settings.
5. The server configures JWT bearer authentication.
6. The server configures CORS for the frontend.
7. The server adds controller support.
8. The server builds the app.
9. The server defines middleware order.
10. The server maps controllers.
11. The server starts listening for requests.

### Concepts Needed

#### ASP.NET Core Hosting

ASP.NET Core apps need startup configuration. In modern .NET, this is usually done in `Program.cs`.

Teach it like this:

> Program startup is where we tell the server what tools it has and how requests should move through it.

#### Dependency Injection Registration

Before ASP.NET can inject a service, that service must be registered.

In DevShelf:

- `AppDbContext` is registered for database access.
- `AuthService` is registered for auth business logic.
- `JwtService` is registered for token creation.

#### Service Lifetime

Common lifetimes:

- `Transient`: new instance every time
- `Scoped`: one instance per HTTP request
- `Singleton`: one instance for the whole app

For EF Core and services that depend on EF Core, `Scoped` is usually correct.

#### Middleware Order

Order matters.

Authentication must run before authorization.

Correct mental model:

```text
CORS -> Authentication -> Authorization -> Controllers
```

### Teaching Script

When the server starts, it is not handling user data yet. It is preparing itself. It registers the database, registers services, configures JWT rules, allows the frontend origin, and builds a request pipeline. Once startup is complete, the server is ready to receive HTTP requests.

### Common Mistakes

- Forgetting to register a service in DI
- Putting authorization before authentication
- Missing JWT configuration
- Allowing the wrong frontend origin in CORS
- Hardcoding configuration values that should come from app settings

## Flow 2: Register Flow

### User Story

A new user wants to create an account.

### HTTP Request

```text
POST /api/auth/register
```

The frontend sends data like:

```json
{
  "userName": "Ada",
  "email": "ada@example.com",
  "password": "secret-password"
}
```

### High-Level Flow

```text
Frontend
   |
   v
POST /api/auth/register
   |
   v
AuthController.Register
   |
   v
RegisterDto
   |
   v
AuthService.Register
   |
   v
Check if email exists
   |
   v
Hash password with BCrypt
   |
   v
Create User entity
   |
   v
Save with EF Core
   |
   v
Return response
```

### Step By Step

1. The frontend sends registration data.
2. ASP.NET Core matches the route to `AuthController`.
3. The request body is bound to `RegisterDto`.
4. The controller calls `AuthService.Register`.
5. `AuthService` checks if the email already exists.
6. If the email exists, the service returns failure.
7. If the email is new, the password is hashed using BCrypt.
8. A new `User` entity is created.
9. EF Core adds the user to the database context.
10. EF Core saves changes to SQLite.
11. The service returns success.
12. The controller returns `200 OK`.

### Concepts Needed

#### Model Binding

Model binding is how ASP.NET Core converts JSON request data into a C# object.

In this flow, JSON becomes `RegisterDto`.

Teach it like this:

> The user sends JSON. ASP.NET turns that JSON into a C# object we can work with.

#### DTO Pattern

`RegisterDto` is used because the API should accept only what registration needs.

The user should not be allowed to send fields like:

- `Id`
- `CreatedAt`
- `PasswordHash`

Those belong to the server.

#### Service Layer Pattern

The controller delegates the real registration rules to `AuthService`.

This keeps the controller simple.

#### EF Core Querying

The service asks EF Core:

```text
Is there already a user with this email?
```

EF Core translates that into a database query.

#### Password Hashing

Passwords must never be stored as plain text.

BCrypt turns the password into a secure hash.

Important teaching point:

> Hashing is one-way. We do not decrypt passwords. We compare hashes.

#### Entity Creation

The server creates a `User` entity after validation passes.

The entity represents the database record.

#### Encapsulation

The `User` entity controls how its password hash is set.

This is an example of encapsulation.

### OOP Principles In This Flow

#### Encapsulation

The `User` model protects `PasswordHash` with a private setter.

Meaning:

> Not every part of the app should freely change sensitive fields.

#### Abstraction

The controller does not know how password hashing or database saving works.

It only knows:

```text
AuthService can register a user.
```

#### Inheritance

`AuthController` inherits from `ControllerBase`, giving it web response helpers like `Ok` and `BadRequest`.

#### Polymorphism

This is not strongly used yet, but it can be introduced later with interfaces like `IAuthService`.

### Design Patterns In This Flow

- DTO Pattern
- Service Layer Pattern
- Unit of Work through EF Core `DbContext`
- Dependency Injection

### Teaching Script

When a user registers, the frontend sends their name, email, and password to the API. The controller receives the request, but it does not do the registration itself. It passes the data to the authentication service. The service checks whether the email already exists, hashes the password, creates a user object, and asks EF Core to save it. The database stores the new user, and the API returns a success message.

### Common Mistakes

- Storing plain text passwords
- Returning the password hash in the API response
- Putting all logic in the controller
- Not checking if email already exists
- Trusting the client to provide fields like `Id` or `CreatedAt`
- Forgetting to call `SaveChangesAsync`

## Flow 3: Login Flow

### User Story

An existing user wants to login.

### HTTP Request

```text
POST /api/auth/login
```

The frontend sends:

```json
{
  "email": "ada@example.com",
  "password": "secret-password"
}
```

### High-Level Flow

```text
Frontend
   |
   v
POST /api/auth/login
   |
   v
AuthController.Login
   |
   v
LoginDto
   |
   v
AuthService.Login
   |
   v
Find user by email
   |
   v
Verify password with BCrypt
   |
   v
JwtService.GenerateToken
   |
   v
Return AuthResponseDto
```

### Step By Step

1. The frontend sends email and password.
2. ASP.NET Core binds the request body to `LoginDto`.
3. The controller calls `AuthService.Login`.
4. The service searches for a user by email.
5. If no user is found, login fails.
6. If a user is found, BCrypt verifies the submitted password.
7. If the password is wrong, login fails.
8. If the password is correct, `JwtService` creates a JWT.
9. The service builds `AuthResponseDto`.
10. The controller returns the response to the frontend.

### Concepts Needed

#### Authentication

Authentication answers:

> Who are you?

Login proves the user's identity using email and password.

#### BCrypt Verification

The server does not decrypt the stored password hash.

Instead, BCrypt checks whether the submitted password matches the stored hash.

#### JWT

JWT means JSON Web Token.

A JWT is a signed token that proves the user has logged in.

It usually contains claims such as:

- User id
- Username
- Email
- Expiration time
- Issuer
- Audience

#### Claims

Claims are pieces of identity information stored inside the token.

In DevShelf, claims include:

- `NameIdentifier`: user id
- `Name`: username
- `Email`: email address

#### Response DTO

`AuthResponseDto` returns safe login data to the frontend.

It should include the token, but not the password hash.

### Design Patterns In This Flow

- DTO Pattern
- Service Layer Pattern
- Dependency Injection
- Single Responsibility Principle

### Teaching Script

When a user logs in, the API first looks for the account by email. If the account does not exist, it returns a general error. If the account exists, the server asks BCrypt to verify the password. When the password is correct, the server creates a JWT. The token is returned to the frontend, and the frontend uses it for future protected requests.

### Common Mistakes

- Saying "email not found" and "password wrong" separately
- Returning password hash in the response
- Creating tokens before verifying the password
- Using weak JWT secrets
- Making tokens that never expire
- Storing sensitive data inside JWT claims

## Flow 4: Protected Profile Flow

### User Story

A logged-in user wants to view their profile.

### HTTP Request

```text
GET /api/profile
```

The frontend must send an authorization header:

```text
Authorization: Bearer <token>
```

### High-Level Flow

```text
Frontend
   |
   v
GET /api/profile with JWT
   |
   v
Authentication middleware validates token
   |
   v
Authorization checks [Authorize]
   |
   v
ProfileController.GetProfile
   |
   v
Read claims from User
   |
   v
Return ProfileResponseDto
```

### Step By Step

1. The frontend sends a request with a JWT.
2. Authentication middleware checks the token.
3. The server validates signature, issuer, audience, and expiration.
4. If the token is invalid, request fails with `401 Unauthorized`.
5. If the token is valid, ASP.NET creates a `User` identity for the request.
6. `[Authorize]` allows the request to reach the controller.
7. The controller reads claims from the authenticated user.
8. The controller builds `ProfileResponseDto`.
9. The server returns the profile data.

### Concepts Needed

#### Authentication Middleware

Authentication middleware checks whether the request has a valid identity.

In DevShelf, it validates JWT tokens.

#### Authorization

Authorization answers:

> Are you allowed to access this?

The `[Authorize]` attribute says:

> Only authenticated users can access this endpoint.

#### ClaimsPrincipal

After token validation, ASP.NET stores identity information in `User`.

The controller can read claims from it.

### Teaching Script

After login, the frontend receives a token. When the user asks for their profile, the frontend sends that token with the request. Before the controller runs, ASP.NET checks whether the token is valid. If it is valid, the request is allowed into the protected controller. The controller then reads the user's id, email, and username from the token claims and returns them.

### Common Mistakes

- Forgetting the `Bearer` prefix
- Forgetting `[Authorize]`
- Calling `UseAuthorization` without `UseAuthentication`
- Putting middleware in the wrong order
- Assuming a token is valid without checking it
- Trusting user id from the frontend body instead of the token

## Flow 5: Database Flow

### User Story

The server needs to save and retrieve data.

### High-Level Flow

```text
C# Entity
   |
   v
AppDbContext
   |
   v
EF Core
   |
   v
SQLite
   |
   v
Database table
```

### Step By Step

1. You define a C# entity like `User`.
2. You expose it in `AppDbContext` using `DbSet<User>`.
3. EF Core understands that `User` maps to a database table.
4. Migrations describe how to create or update the database schema.
5. The app queries the database through `AppDbContext`.
6. The app adds, updates, or removes entities.
7. `SaveChangesAsync` commits changes to the database.

### Concepts Needed

#### Entity

An entity is a C# class that EF Core stores in the database.

In DevShelf:

```text
User entity -> Users table
```

#### DbSet

A `DbSet` represents a table.

In DevShelf:

```text
DbSet<User> Users
```

#### DbContext

`AppDbContext` is the main database access object.

It tracks entities and sends changes to the database.

#### Migration

A migration is a history file that describes database schema changes.

Teach it like this:

> A migration is EF Core's way of saying: here is how the database structure should change.

#### Async Database Calls

Database calls should usually be async because they involve waiting on external work.

This helps the server handle more requests efficiently.

### EF Core Mental Model

EF Core does three major things:

1. Maps C# classes to database tables.
2. Converts LINQ queries into SQL.
3. Tracks changes and saves them.

### Common Mistakes

- Confusing DTOs with entities
- Forgetting to add a `DbSet`
- Forgetting to create migrations after model changes
- Forgetting to apply migrations to the database
- Calling database queries synchronously in web requests
- Not understanding when EF Core sends SQL to the database

## Flow 6: Dependency Injection Flow

### User Story

The server needs classes to work together without manually creating everything.

### High-Level Flow

```text
Request comes in
   |
   v
ASP.NET creates AuthController
   |
   v
AuthController asks for AuthService
   |
   v
ASP.NET creates AuthService
   |
   v
AuthService asks for AppDbContext and JwtService
   |
   v
ASP.NET injects them
```

### Step By Step

1. Services are registered during startup.
2. A request reaches a controller route.
3. ASP.NET needs to create the controller.
4. ASP.NET looks at the controller constructor.
5. It sees what dependencies the controller needs.
6. It creates or retrieves those dependencies.
7. It passes them into the constructor.
8. The controller uses them.

### Concepts Needed

#### Constructor Injection

Constructor injection means a class declares its dependencies in its constructor.

Teach it like this:

> A class should clearly ask for the tools it needs to do its job.

#### Inversion Of Control

Instead of your class controlling object creation, the framework controls it.

This makes code easier to test and maintain.

#### Service Lifetime

DI needs to know how long an object should live.

For this server:

- `AppDbContext`: scoped
- `AuthService`: scoped
- `JwtService`: scoped

### Common Mistakes

- Forgetting to register a service
- Registering EF Core-related services as singleton
- Creating dependencies manually inside controllers
- Making services depend on controllers
- Putting too much logic in constructors

## Flow 7: Error Flow

### User Story

Something goes wrong and the API must respond correctly.

### Types Of Errors

#### Email Already Exists

Flow:

```text
Register request
   |
   v
AuthService checks database
   |
   v
Email exists
   |
   v
Return 400 Bad Request
```

Reason:

The user's input conflicts with existing data.

#### Invalid Login

Flow:

```text
Login request
   |
   v
User not found or password wrong
   |
   v
Return general error
```

Reason:

Do not reveal whether the email or password was wrong.

#### Missing Token

Flow:

```text
Protected request
   |
   v
No Authorization header
   |
   v
Authentication fails
   |
   v
Return 401 Unauthorized
```

#### Expired Token

Flow:

```text
Protected request
   |
   v
Token is expired
   |
   v
Authentication fails
   |
   v
Return 401 Unauthorized
```

#### Missing Claims

Flow:

```text
Token validates
   |
   v
Required claim missing
   |
   v
Controller returns Unauthorized
```

### Concepts Needed

#### Fail Fast

When a request is invalid, stop early and return a clear response.

#### Security-Friendly Errors

Some errors should not reveal too much.

For login, this is better:

```text
Invalid email or password
```

This is risky:

```text
Email exists but password is wrong
```

#### HTTP Status Codes

Students should learn that backend errors are not all the same.

Use the right status code to describe what happened.

### Common Mistakes

- Returning `200 OK` for failed operations
- Revealing too much during login
- Throwing exceptions for normal validation failures
- Returning raw exception messages to users
- Not validating request input

## Flow 8: Future Feature Flow

The current server has authentication and profile. DevShelf's README describes future features:

- Snippets
- Resources
- Tasks
- Dashboard

The same backend pattern can be reused.

### Generic CRUD Flow

```text
Frontend action
   |
   v
HTTP request
   |
   v
Controller endpoint
   |
   v
DTO
   |
   v
Service method
   |
   v
EF Core query or command
   |
   v
Response DTO
```

### Example: Create Snippet Flow

User story:

> A logged-in user wants to save a code snippet.

Flow:

```text
POST /api/snippets
   |
   v
JWT is validated
   |
   v
SnippetsController receives CreateSnippetDto
   |
   v
SnippetService validates input
   |
   v
Service reads current user id from token
   |
   v
Create Snippet entity
   |
   v
Save with EF Core
   |
   v
Return SnippetResponseDto
```

Concepts needed:

- Protected routes
- Entity relationships
- One user has many snippets
- Foreign keys
- DTOs
- Service layer
- EF Core migrations
- Query filtering by user id

Important teaching point:

> A user should only see their own snippets. The backend must enforce this, not the frontend.

### Example: List Snippets Flow

User story:

> A logged-in user wants to see their snippets.

Flow:

```text
GET /api/snippets
   |
   v
JWT is validated
   |
   v
Read user id from claims
   |
   v
Query snippets where UserId equals current user id
   |
   v
Return list of snippet DTOs
```

Concepts needed:

- Filtering
- Authorization by ownership
- LINQ
- Projection to DTOs
- Async queries

### Example: Update Snippet Flow

User story:

> A logged-in user wants to edit one of their snippets.

Flow:

```text
PUT /api/snippets/{id}
   |
   v
JWT is validated
   |
   v
Find snippet by id and current user id
   |
   v
If not found, return 404
   |
   v
Update allowed fields
   |
   v
Save changes
   |
   v
Return updated DTO
```

Concepts needed:

- Route parameters
- Ownership checks
- Update tracking
- Not found responses
- Avoiding overposting

### Example: Delete Snippet Flow

User story:

> A logged-in user wants to delete one of their snippets.

Flow:

```text
DELETE /api/snippets/{id}
   |
   v
JWT is validated
   |
   v
Find snippet by id and current user id
   |
   v
If found, remove it
   |
   v
Save changes
   |
   v
Return success
```

Concepts needed:

- Ownership checks
- Remove operations
- Idempotency discussion
- 404 versus 204 response choices

## Design Patterns To Teach With DevShelf

### DTO Pattern

Used to separate external API contracts from internal database models.

Where it appears:

- Registration input
- Login input
- Auth response
- Profile response

Why it matters:

- Protects sensitive fields
- Makes API responses predictable
- Prevents clients from controlling server-owned values

### Service Layer Pattern

Used to keep business logic out of controllers.

Where it appears:

- `AuthService`
- `JwtService`

Why it matters:

- Cleaner controllers
- Easier testing
- Easier reuse
- Better separation of concerns

### Unit Of Work Pattern

EF Core `DbContext` behaves like a unit of work.

It tracks changes and commits them together when `SaveChangesAsync` is called.

Why it matters:

- Multiple changes can be saved as one operation
- EF Core knows which entities are new, changed, or deleted

### Repository Pattern

The project does not currently use custom repositories.

Teach it later, not first.

Why:

EF Core already provides many repository-like features through `DbSet`.

When to introduce it:

- When queries become repeated
- When data access logic becomes complex
- When you want clearer testing boundaries

### Dependency Injection Pattern

Used throughout ASP.NET Core.

Where it appears:

- Controllers receive services
- Services receive database context
- Services receive configuration

Why it matters:

- Reduces tight coupling
- Improves testability
- Makes dependencies explicit

### Middleware Pattern

Used in the request pipeline.

Where it appears:

- CORS
- Authentication
- Authorization
- HTTPS redirection

Why it matters:

- Cross-cutting concerns happen before controllers
- Controllers stay focused on request-specific behavior

## OOP Pillars As Applied To DevShelf

### Encapsulation

Meaning:

> Keep internal data protected and expose controlled behavior.

Applied example:

The `User` entity protects `PasswordHash`.

Teaching explanation:

Sensitive data should not be changed freely from anywhere in the app.

### Abstraction

Meaning:

> Hide implementation details behind simple methods or services.

Applied example:

`AuthController` does not know exactly how JWT tokens are built.

It relies on `AuthService` and `JwtService`.

### Inheritance

Meaning:

> A class can receive behavior from a parent class.

Applied example:

Controllers inherit from `ControllerBase`.

That gives access to response helpers like:

- `Ok`
- `BadRequest`
- `Unauthorized`

### Polymorphism

Meaning:

> Different classes can be used through the same contract.

Applied future example:

You could define:

```text
IAuthService
```

Then the controller can depend on the interface instead of a concrete class.

This makes testing easier.

## SOLID Principles As Applied To DevShelf

### Single Responsibility Principle

Each class should have one main reason to change.

Good examples:

- `AuthController`: HTTP auth endpoints
- `AuthService`: auth business logic
- `JwtService`: token creation
- `AppDbContext`: database access

### Open Closed Principle

Code should be open for extension but closed for careless modification.

Example:

Instead of rewriting auth logic everywhere, add new auth behavior inside the auth service.

### Liskov Substitution Principle

This becomes clearer when interfaces and inheritance are introduced.

Teaching version:

> If class B replaces class A, the app should still behave correctly.

### Interface Segregation Principle

Do not create giant interfaces.

Future example:

Prefer smaller interfaces like:

- `IAuthService`
- `IJwtService`
- `ISnippetService`

Instead of one huge `IApplicationService`.

### Dependency Inversion Principle

High-level code should depend on abstractions, not details.

Future improvement:

Controllers can depend on service interfaces instead of concrete service classes.

## Teaching Roadmap

### Lesson 1: What Problem Does The Server Solve?

Goal:

Students understand why backend exists.

Teach:

- Frontend versus backend
- Client-server communication
- API responsibility
- Why the database is protected behind the API

Student should be able to explain:

> The frontend asks. The backend decides. The database stores.

### Lesson 2: HTTP And API Basics

Goal:

Students understand requests and responses.

Teach:

- URL
- Route
- Method
- Body
- Headers
- Status codes
- JSON

Use DevShelf examples:

- Register
- Login
- Profile

### Lesson 3: Server Startup Flow

Goal:

Students understand how the app prepares itself.

Teach:

- Configuration
- Service registration
- Middleware pipeline
- Controller mapping

### Lesson 4: Register Flow

Goal:

Students understand their first complete backend feature.

Teach:

- DTO
- Controller
- Service
- Entity
- EF Core
- Password hashing
- HTTP response

### Lesson 5: Login Flow

Goal:

Students understand authentication.

Teach:

- Finding users
- Password verification
- JWT creation
- Safe error messages

### Lesson 6: Protected Profile Flow

Goal:

Students understand protected endpoints.

Teach:

- Authorization header
- Bearer token
- Authentication middleware
- `[Authorize]`
- Claims

### Lesson 7: EF Core Flow

Goal:

Students understand how C# talks to the database.

Teach:

- Entity
- DbSet
- DbContext
- Migration
- Query
- Save changes
- SQLite

### Lesson 8: Dependency Injection Flow

Goal:

Students understand how ASP.NET connects classes.

Teach:

- Constructor injection
- Service registration
- Lifetimes
- Loose coupling

### Lesson 9: Error Handling Flow

Goal:

Students understand failure as part of API design.

Teach:

- Validation failure
- Auth failure
- Missing token
- Expired token
- Bad request
- Unauthorized

### Lesson 10: Build Future Features Using The Same Flow

Goal:

Students can transfer the pattern to new features.

Teach:

- Snippets CRUD
- Resources CRUD
- Tasks CRUD
- Dashboard stats
- Ownership checks

## How To Explain Any New Feature

Use this template:

```text
1. What is the user trying to do?
2. What endpoint should receive the request?
3. Does the user need to be authenticated?
4. What data comes from the frontend?
5. What DTO represents that data?
6. What controller action receives it?
7. What service handles the business rule?
8. What entity is saved or queried?
9. What EF Core operation is needed?
10. What response should the API return?
```

Example:

```text
Feature: Create a snippet

User action: Save a code snippet.
Endpoint: POST /api/snippets.
Authentication: Required.
DTO: CreateSnippetDto.
Controller: SnippetsController.
Service: SnippetService.
Entity: Snippet.
Database: Add snippet linked to current user.
Response: Created snippet data.
```

## Backend Thinking Checklist

Before building any endpoint, ask:

- Is this endpoint public or protected?
- What HTTP method fits the action?
- What route name is clear?
- What request DTO is needed?
- What response DTO is needed?
- What business rules must be enforced?
- What database tables are involved?
- Does this data belong to a specific user?
- What should happen if the data is missing?
- What should happen if the user is not allowed?
- What status code should be returned?

## Security Checklist

For this server, always remember:

- Never store plain text passwords.
- Never return password hashes.
- Never trust user id from the frontend when a token already identifies the user.
- Validate JWT issuer, audience, signature, and lifetime.
- Use strong JWT secrets.
- Keep secrets out of source control.
- Use HTTPS in production.
- Return general login errors.
- Protect private endpoints with `[Authorize]`.
- Filter user-owned data by the current authenticated user.

## Beginner-Friendly Analogies

### Controller

The receptionist. It receives the visitor and sends them to the right office.

### Service

The office worker who knows the actual business rules.

### DTO

The form the visitor fills.

### Model

The official record kept by the organization.

### DbContext

The clerk who knows how to read and write the record book.

### Database

The record book.

### JWT

An ID card that proves the user has already logged in.

### Middleware

Security checks at the building entrance before the visitor reaches the office.

## Recommended Teaching Style

For beginners, avoid starting with definitions only.

Use this pattern:

1. Tell a user story.
2. Draw the flow.
3. Explain each part in plain language.
4. Name the technical concept.
5. Show where the concept appears in DevShelf.
6. Ask students to retell the flow in their own words.

Example:

> A user wants to login. The frontend sends email and password. The controller receives the request. The service checks the database. BCrypt verifies the password. JWT service creates a token. The server returns the token. That is authentication.

## What To Master First

Master these in order:

1. HTTP request and response
2. Controllers
3. DTOs
4. Services
5. Models/entities
6. EF Core and DbContext
7. Dependency Injection
8. JWT authentication
9. Authorization
10. Error handling
11. CRUD features
12. Clean architecture improvements

## Final Mental Model

Every backend flow in DevShelf can be understood like this:

```text
Request comes in
   |
   v
Middleware checks cross-cutting concerns
   |
   v
Controller receives the request
   |
   v
DTO carries input data
   |
   v
Service applies business rules
   |
   v
EF Core talks to the database
   |
   v
Response DTO shapes output
   |
   v
Controller returns HTTP response
```

If you can explain that clearly, you can teach this server.

