# Blood Bank MS – High-Level UML Sequence Diagrams

This document provides high-level UML sequence diagrams for key scenarios in the app.

## How to Use

- Render in GitHub Markdown, VS Code Markdown Preview, or Mermaid Live Editor.
- Diagram type used: `sequenceDiagram`.
- Scope is intentionally high-level (actors, layers, outcomes).

---

## 1) User Login

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant API as Auth API
    participant AuthC as AuthController
    participant AuthS as Auth Service
    participant DB as Database

    User->>API: POST /api/auth/login (credentials)
    API->>AuthC: Route request
    AuthC->>AuthS: Validate credentials
    AuthS->>DB: Find user + verify password
    DB-->>AuthS: User record / validation result
    AuthS-->>AuthC: Tokens or error
    AuthC-->>User: 200 with auth payload / 4xx error
```

## 2) Authenticated Page Load (Dashboard/Home)

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant View as View Router
    participant MW as UserMiddleware
    participant Page as EJS Renderer

    User->>View: GET /
    View->>MW: Authenticate session/token
    MW-->>View: User context or unauthorized
    alt Authenticated
        View->>Page: Render page + partials
        Page-->>User: HTML response
    else Unauthorized
        View-->>User: Redirect / error response
    end
```

## 3) Create Donation (Transaction + Blood Units)

```mermaid
sequenceDiagram
    autonumber
    actor Staff
    participant API as Donation API
    participant DonC as DonationController
    participant DonS as DonationService
    participant DonorRepo as Donor Repository
    participant DonationRepo as Donation Repository
    participant UnitRepo as BloodUnit Repository
    participant DB as Database

    Staff->>API: POST /api/donations (donorId, units, details)
    API->>DonC: Handle request
    DonC->>DonS: createDonation(input)
    DonS->>DB: Start transaction
    DonS->>DonorRepo: Verify donor exists
    DonS->>DonationRepo: Create donation
    loop For each unit requested
        DonS->>UnitRepo: Create blood unit
    end
    DonS->>DonationRepo: Link units to donation
    DonS->>DonorRepo: Update donor stats
    DonS->>DB: Commit transaction
    DonS-->>DonC: Created donation payload
    DonC-->>Staff: 200 success / rollback error
```

## 4) Blood Unit Status Transition

```mermaid
sequenceDiagram
    autonumber
    actor Staff
    participant API as Blood Unit API
    participant BUC as BloodUnitController
    participant BUS as BloodUnitService
    participant Repo as BloodUnit Repository
    participant DB as Database

    Staff->>API: PATCH /api/donations/units/:id/status
    API->>BUC: transitionStatus request
    BUC->>BUS: transitionStatus(userType, id, nextStatus)
    BUS->>Repo: Load blood unit
    Repo-->>BUS: Current unit state
    BUS->>BUS: Validate role permissions
    BUS->>BUS: Validate status flow rules
    alt Valid transition
        BUS->>DB: Save new status + history
        BUS-->>BUC: Updated unit
        BUC-->>Staff: 200 success
    else Invalid transition
        BUS-->>BUC: Domain error
        BUC-->>Staff: 4xx error
    end
```

## 5) Notification Send (Broadcast or Single Donor)

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant API as Notification API
    participant NotifC as NotificationController
    participant Validator as NotificationValidator
    participant NotifS as NotificationService
    participant DonorS as DonorService
    participant Email as EmailService
    participant SMS as SmsService
    participant NotifRepo as Notification Log Repository

    Admin->>API: POST /api/notifications/send
    API->>NotifC: sendNotification(req)
    NotifC->>Validator: Validate payload
    alt Invalid payload
        Validator-->>NotifC: Validation error
        NotifC-->>Admin: 422 response
    else Valid payload
        NotifC->>NotifS: sendNotification(userId, input)
        NotifS->>DonorS: Resolve target donors
        loop For each target donor
            alt Channel EMAIL
                NotifS->>Email: sendRawMail(...)
            else Channel SMS
                NotifS->>SMS: send(phone, message)
            end
        end
        NotifS->>NotifRepo: Persist SENT/FAILED/SKIPPED logs
        NotifS-->>NotifC: Delivery summary
        NotifC-->>Admin: 200 success
    end
```

## 6) Notification History Query

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant API as Notification API
    participant NotifC as NotificationController
    participant NotifS as NotificationService
    participant NotifRepo as Notification Repository

    Admin->>API: GET /api/notifications/history?page=&limit=
    API->>NotifC: getHistory(req.query)
    NotifC->>NotifS: getHistory(filter)
    NotifS->>NotifRepo: Paginated query
    NotifRepo-->>NotifS: History docs + metadata
    NotifS-->>NotifC: Paginated history
    NotifC-->>Admin: 200 JSON response
```

## 7) Dashboard Cards Aggregation

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant API as Dashboard API
    participant DashC as DashboardController
    participant DashS as DashboardService
    participant UnitRepo as BloodUnit Repository
    participant DonorRepo as Donor Repository
    participant UserS as UserService

    User->>API: GET /api/dashboard/cards
    API->>DashC: getCards
    DashC->>DashS: getCards()
    par Parallel counts
        DashS->>UnitRepo: Count AVAILABLE units
        DashS->>DonorRepo: Count donors
        DashS->>UnitRepo: Count about-to-expire units
        DashS->>UserS: Count hospital reps
    end
    DashS-->>DashC: Card list
    DashC-->>User: 200 cards payload
```

## 8) File Upload / Delete

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant API as File API
    participant MW as UserMiddleware
    participant FileC as FileController
    participant Store as File Storage

    User->>API: POST /api/files/upload or DELETE /api/files
    API->>MW: Authenticate
    MW-->>API: User context
    API->>FileC: Handle file operation
    alt Upload
        FileC->>Store: Save file + metadata
    else Delete
        FileC->>Store: Remove file + metadata
    end
    FileC-->>User: Success / error response
```

## 9) 404 / Missing Resource Path

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant View as View Router
    participant Service as Domain Service
    participant Page as EJS Renderer

    User->>View: GET /resource/:id
    View->>Service: Fetch resource by id
    Service-->>View: null (not found)
    View->>Page: Render pages/404
    Page-->>User: 404 page response
```

---

## Related Documentation

- **Flowcharts** (detailed control flow): [`README-UML.md`](./README-UML.md)
- **Architecture diagrams** (system context, components): [`README-UML-ARCHITECTURE.md`](./README-UML-ARCHITECTURE.md)
