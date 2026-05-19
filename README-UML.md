# Blood Bank MS – UML Flowchart Scenarios

This document provides UML-style flowchart diagrams (via Mermaid) for the main scenarios in the app.

## How to Use

- Render these diagrams in GitHub, VS Code Markdown Preview, or any Mermaid-compatible tool.
- Diagram type used: `flowchart`.
- API base path: `/api`.

---

## 1) Global Request Lifecycle

```mermaid
flowchart TD
    A[Client Request] --> B{Path starts with /api?}
    B -- Yes --> C[API Router]
    B -- No --> D[View Router]
    C --> E{Protected route?}
    E -- Yes --> F[UserMiddleware.authenticate]
    E -- No --> G[Controller]
    F --> G
    G --> H[Service Layer]
    H --> I[Repository/Model]
    I --> J[StandardResponse JSON]
    D --> K[EJS Render]
    K --> L[HTML Response]
```

## 2) Authentication: Login / Signup / Token Refresh

```mermaid
flowchart TD
    A[User submits auth request] --> B{Endpoint}
    B -->|POST /api/auth/login| C[AuthController.login]
    B -->|POST /api/auth/signup| D[AuthController.signup]
    B -->|POST /api/auth/refresh-token| E[AuthController.refreshToken]
    C --> F[Validate credentials]
    D --> G[Create account]
    E --> H[Validate refresh token]
    F --> I{Valid?}
    I -- No --> J[401/4xx error]
    I -- Yes --> K[Issue access/refresh tokens]
    G --> K
    H --> K
    K --> L[Return auth payload]
```

## 3) Password & Verification Flow

```mermaid
flowchart TD
    A[User action] --> B{Action Type}
    B -->|Forgot Password| C[POST /api/auth/forgot-password]
    B -->|Reset Password| D[POST /api/auth/reset-password]
    B -->|Change Password| E[POST /api/auth/change-password]
    B -->|Send Code| F[POST/GET /api/auth/send-code/:type]
    B -->|Verify Code| G[POST /api/auth/verify-code/:type]
    E --> H[Auth required]
    F --> H
    G --> H
    H --> I[AuthController handles request]
    C --> I
    D --> I
    I --> J[Validate input/code/token]
    J --> K{Valid?}
    K -- No --> L[4xx validation/error]
    K -- Yes --> M[Persist change / success response]
```

## 4) Dashboard Data Flow

```mermaid
flowchart TD
    A[GET /api/dashboard/cards] --> B[DashboardController.getCards]
    B --> C[DashboardService.getCards]
    C --> D[Count available blood units]
    C --> E[Count donors]
    C --> F[Count about-to-expire units]
    C --> G[Count hospital reps]
    D --> H[Compose card payload]
    E --> H
    F --> H
    G --> H
    H --> I[Return dashboard cards]
```

## 5) Donor Management (List / Create / Update / Details)

```mermaid
flowchart TD
    A[User/API request for donors] --> B{Operation}
    B -->|GET /api/donations/donors| C[DonorController.getAll]
    B -->|GET /api/donations/donors/:id| D[DonorController.getById]
    B -->|POST /api/donations/donors| E[DonorController.create]
    B -->|POST /api/donations/donors/:id| F[DonorController.update]
    C --> G[DonorService.getDonors]
    D --> H[DonorService.getDonorById]
    E --> I[DonorService.createDonor]
    F --> J[DonorService.updateDonor]
    G --> K[(Donor Repository/Model)]
    H --> K
    I --> K
    J --> K
    K --> L[JSON response]
```

## 6) Donation Creation Flow (with Blood Unit Generation)

```mermaid
flowchart TD
    A[POST /api/donations] --> B[DonationController.create]
    B --> C[DonationService.createDonation]
    C --> D[Start DB transaction]
    D --> E[Fetch donor]
    E --> F{Donor found?}
    F -- No --> G[Return error]
    F -- Yes --> H[Create donation record]
    H --> I[Create 1..N blood units]
    I --> J[Link unit IDs to donation]
    J --> K[Update donor stats/lastDonated]
    K --> L[Commit transaction]
    L --> M[Return created donation]
    C --> N[On exception: abort transaction]
```

## 7) Donation Listing & Detail Flow

```mermaid
flowchart TD
    A[GET /api/donations or /api/donations/:id] --> B[DonationController]
    B --> C{List or Detail}
    C -->|List| D[DonationService.getDonations]
    C -->|Detail| E[DonationService.getDonationById]
    D --> F[Apply filters: donorId, dates, status]
    F --> G[(Donation Repository)]
    E --> G
    E --> H[Populate donor + bloodUnits]
    G --> I[Return response]
    H --> I
```

## 8) Blood Unit Inventory, FEFO, and Percentages

```mermaid
flowchart TD
    A[Blood unit read request] --> B{Endpoint}
    B -->|GET /api/donations/units| C[getBloodUnits]
    B -->|GET /api/donations/units/fefo| D[getFefoInventory]
    B -->|GET /api/donations/units/blood-group-percentages| E[getBloodGroupPercentages]
    C --> F[Filter by donor/status/bloodGroup]
    D --> G[AVAILABLE + nearest expiry first]
    E --> H[Aggregate available by blood group]
    F --> I[(BloodUnit Repository)]
    G --> I
    H --> I
    I --> J[Return inventory payload]
```

## 9) Blood Unit Status Transition Flow

```mermaid
flowchart TD
    A[PATCH /api/donations/units/:id/status] --> B[BloodUnitController.transitionStatus]
    B --> C[BloodUnitService.transitionStatus]
    C --> D[Load blood unit]
    D --> E{Exists?}
    E -- No --> F[Return not found error]
    E -- Yes --> G[Check role-based allowed statuses]
    G --> H{Allowed for user type?}
    H -- No --> I[Return authorization error]
    H -- Yes --> J[Check status flow transition]
    J --> K{Transition valid?}
    K -- No --> L[Return invalid transition error]
    K -- Yes --> M[Update status]
    M --> N[Append transactionHistory entry]
    N --> O[Save and return updated unit]
```

## 10) Notification History Flow

```mermaid
flowchart TD
    A[GET /api/notifications/history] --> B[Auth middleware]
    B --> C[NotificationController.getHistory]
    C --> D[NotificationService.getHistory]
    D --> E[Build query filters]
    E --> F[(Notification paginate query)]
    F --> G[Return paginated history]
```

## 11) Notification Send Flow (Broadcast / Single Donor, Email or SMS)

```mermaid
flowchart TD
    A[POST /api/notifications/send] --> B[Auth middleware]
    B --> C[NotificationController.sendNotification]
    C --> D[NotificationValidator.sendNotification]
    D --> E{Valid payload?}
    E -- No --> F[Return 422]
    E -- Yes --> G[NotificationService.sendNotification]
    G --> H{Audience = DONOR?}
    H -- Yes --> I[Load one donor by donorId]
    H -- No --> J[Load donors list optional bloodGroup]
    I --> K[For each donor]
    J --> K
    K --> L{Channel}
    L -->|EMAIL| M[Build template + sendRawMail]
    L -->|SMS| N[SmsService.send]
    M --> O[Build log SENT/FAILED/SKIPPED]
    N --> O
    O --> P[Insert notification logs]
    P --> Q[Return totals sent/failed/skipped]
```

## 12) File Upload & Delete Flow

```mermaid
flowchart TD
    A[File API request] --> B{Endpoint}
    B -->|POST /api/files/upload| C[Auth middleware]
    B -->|DELETE /api/files| D[Auth middleware]
    C --> E[FileController.uploadFile]
    D --> F[FileController.deleteFile]
    E --> G[Store file / metadata]
    F --> H[Remove file / metadata]
    G --> I[Return success/error]
    H --> I
```

## 13) View Rendering Scenarios (EJS)

```mermaid
flowchart TD
    A[Browser navigation] --> B{Route type}
    B -->|Authenticated pages| C[UserMiddleware.authenticate]
    B -->|Public pages| D[Render directly]
    C --> E{Data required?}
    E -- Yes --> F[Load service data]
    E -- No --> G[Render page]
    F --> G
    G --> H[Render EJS + partials]
    H --> I[Return HTML]
    I --> J{Missing resource?}
    J -- Yes --> K[Render 404 page]
    J -- No --> L[Normal page load]
```

## 14) Scheduled Jobs (Cron) – Current State

```mermaid
flowchart TD
    A[Application start] --> B[CronService.cronStart]
    B --> C[registerCronJob]
    C --> D{Jobs registered?}
    D -- No --> E[No-op / empty schedule]
    D -- Yes --> F[Start each scheduled task]
    F --> G[Periodic background execution]
```

---

## Suggested Next UML Additions

- Sequence diagrams for `NotificationController -> NotificationService -> EmailService`.
- State diagram for blood unit lifecycle (`DONATED -> TESTING -> AVAILABLE -> ...`).
- Component diagram for module boundaries (auth, donation, dashboard, notifications, files).
