# Blood Bank MS – Architecture UML Diagrams

This document provides high-level System Context and Component diagrams for onboarding and architecture reference.

## How to Use

- Render in GitHub Markdown, VS Code Markdown Preview, or Mermaid Live Editor.
- Diagrams provide a 10,000-foot view of system boundaries and internal organization.

---

## 1) System Context Diagram

Shows the Blood Bank Management System and its interactions with external actors and systems.

```mermaid
graph TB
    User["👤 Users (Staff/Admin)"]
    Hospital["🏥 Hospital Staff"]
    Donor["🩸 Donors"]
    
    subgraph "Blood Bank MS"
        App["Blood Bank<br/>Management System"]
    end
    
    Email["📧 Email Service<br/>(SMTP)"]
    SMS["📱 SMS Service"]
    DB["🗄️ Database<br/>(MongoDB)"]
    FileStore["📁 File Storage"]
    
    User -->|Login, Manage| App
    Hospital -->|Blood Requests| App
    Donor -->|Donations, Profile| App
    
    App -->|Send Notifications| Email
    App -->|Send Notifications| SMS
    App -->|Read/Write| DB
    App -->|Upload/Delete| FileStore
```

---

## 2) High-Level Component Diagram

Shows the internal modular structure and key dependencies.

```mermaid
graph TB
    subgraph "Presentation Layer"
        ViewRouter["View Router<br/>(EJS Pages)"]
        Partial["Partials<br/>(Sidebar, Header, etc)"]
    end
    
    subgraph "API Layer"
        APIRouter["API Router<br/>(/api/*)"]
        Auth["Auth Routes"]
        Donation["Donation Routes"]
        Dashboard["Dashboard Routes"]
        Files["Files Routes"]
        Notif["Notification Routes"]
    end
    
    subgraph "Middleware & Utils"
        AuthMW["UserMiddleware<br/>(Authentication)"]
        Validator["Validators<br/>(Joi)"]
        Logger["Logger<br/>(Winston)"]
        Response["StandardResponse"]
    end
    
    subgraph "Business Logic Layer"
        AuthS["AuthService"]
        DonorS["DonorService"]
        DonationS["DonationService"]
        BloodUnitS["BloodUnitService"]
        DashboardS["DashboardService"]
        NotifS["NotificationService"]
        FileS["FileService"]
    end
    
    subgraph "Data Access Layer"
        AuthRepo["AuthRepository"]
        DonorRepo["DonorRepository"]
        DonationRepo["DonationRepository"]
        BloodUnitRepo["BloodUnitRepository"]
        NotifRepo["NotificationRepository"]
        UserRepo["UserRepository"]
    end
    
    subgraph "External Integrations"
        EmailSvc["EmailService<br/>(Nodemailer + React)"]
        SMSSvc["SmsService<br/>(Logger-based)"]
        FileStore["File Storage"]
    end
    
    subgraph "Data Models"
        UserModel["User Model"]
        DonorModel["Donor Model"]
        DonationModel["Donation Model"]
        BloodUnitModel["BloodUnit Model"]
        NotifModel["Notification Model"]
    end
    
    ViewRouter -->|Uses| Partial
    APIRouter --> Auth
    APIRouter --> Donation
    APIRouter --> Dashboard
    APIRouter --> Files
    APIRouter --> Notif
    
    Auth -->|Uses| AuthMW
    Donation -->|Uses| AuthMW
    Dashboard -->|Uses| AuthMW
    Files -->|Uses| AuthMW
    Notif -->|Uses| AuthMW
    
    Auth -->|Validate| Validator
    Donation -->|Validate| Validator
    Notif -->|Validate| Validator
    
    Auth -->|Call| AuthS
    Donation -->|Call| DonorS
    Donation -->|Call| DonationS
    Donation -->|Call| BloodUnitS
    Dashboard -->|Call| DashboardS
    Notif -->|Call| NotifS
    Files -->|Call| FileS
    
    AuthS -->|Query| AuthRepo
    DonorS -->|Query| DonorRepo
    DonationS -->|Query| DonationRepo
    BloodUnitS -->|Query| BloodUnitRepo
    NotifS -->|Query| NotifRepo
    DashboardS -->|Query| DonorRepo
    DashboardS -->|Query| BloodUnitRepo
    DashboardS -->|Query| UserRepo
    
    AuthRepo -->|Read/Write| UserModel
    DonorRepo -->|Read/Write| DonorModel
    DonationRepo -->|Read/Write| DonationModel
    BloodUnitRepo -->|Read/Write| BloodUnitModel
    NotifRepo -->|Read/Write| NotifModel
    
    NotifS -->|Send| EmailSvc
    NotifS -->|Send| SMSSvc
    FileS -->|Manage| FileStore
    
    AuthS -->|Log| Logger
    DonationS -->|Log| Logger
    BloodUnitS -->|Log| Logger
    NotifS -->|Log| Logger
    
    Auth -->|Format| Response
    Donation -->|Format| Response
    Dashboard -->|Format| Response
    Files -->|Format| Response
    Notif -->|Format| Response
```

---

## 3) Module Dependency Graph (Simplified)

Shows cross-module dependencies without data models.

```mermaid
graph LR
    Auth["Auth<br/>Module"]
    User["User<br/>Module"]
    Donor["Donor<br/>Module"]
    Donation["Donation<br/>Module"]
    BloodUnit["BloodUnit<br/>Module"]
    Dashboard["Dashboard<br/>Module"]
    Notif["Notification<br/>Module"]
    Files["Files<br/>Module"]
    
    Donation -->|Uses| Donor
    Donation -->|Creates| BloodUnit
    Dashboard -->|Queries| Donor
    Dashboard -->|Queries| BloodUnit
    Dashboard -->|Queries| User
    Notif -->|Queries| Donor
    Files -->|Standalone| Files
    Auth -->|Issues tokens| User
```

---

## 4) Data Flow Overview

Shows how data flows through the system during a typical donation creation scenario.

```mermaid
graph TB
    A["👤 Staff<br/>Initiates Donation"]
    B["API Request<br/>POST /api/donations"]
    C["DonationController"]
    D["DonationService"]
    E["Donor Lookup"]
    F["Create Donation<br/>Record"]
    G["Create Blood<br/>Units 1..N"]
    H["Update Donor Stats"]
    I["Transaction<br/>Commit"]
    J["Response:<br/>Donation + Units"]
    K["🗄️ MongoDB"]
    
    A -->|Submit form| B
    B -->|Route| C
    C -->|Validate| C
    C -->|Call| D
    D -->|Query| K
    K -->|Return donor| E
    E -->|Verified| F
    F -->|Create records| K
    G -->|Bulk insert| K
    H -->|Update| K
    K -->|Confirm| I
    I -->|Payload| J
    J -->|Return 200| A
```

---

## 5) Detailed Module Component Diagram

Shows the boundaries and interfaces of each major module with internal organization.

```mermaid
graph TB
    subgraph "Auth Module"
        AuthRoute["Routes:<br/>login, signup, refresh"]
        AuthCtrl["AuthController"]
        AuthSvc["AuthService"]
        AuthRepo["AuthRepository"]
        AuthValidator["AuthValidator"]
    end
    
    subgraph "Donation Module"
        DonRoute["Routes:<br/>create, list, detail"]
        DonCtrl["DonationController"]
        DonSvc["DonationService"]
        DonRepo["DonationRepository"]
        DonValidator["DonationValidator"]
    end
    
    subgraph "Blood Unit Module"
        BURoute["Routes:<br/>list, detail,<br/>status transition"]
        BUCtrl["BloodUnitController"]
        BUSvc["BloodUnitService"]
        BURepo["BloodUnitRepository"]
        BUValidator["BloodUnitValidator"]
    end
    
    subgraph "Dashboard Module"
        DBRoute["Routes:<br/>cards, menu"]
        DBCtrl["DashboardController"]
        DBSvc["DashboardService"]
    end
    
    subgraph "Notification Module"
        NRoute["Routes:<br/>send, history"]
        NCtrl["NotificationController"]
        NSvc["NotificationService"]
        NRepo["NotificationRepository"]
        NValidator["NotificationValidator"]
        EmailSvc["EmailService"]
        SMSSvc["SmsService"]
    end
    
    subgraph "Files Module"
        FRoute["Routes:<br/>upload, delete"]
        FCtrl["FileController"]
        FSvc["FileService"]
    end
    
    subgraph "User Module"
        UserRoute["Routes:<br/>profile, update"]
        UserCtrl["UserController"]
        UserSvc["UserService"]
        UserRepo["UserRepository"]
    end
    
    AuthRoute --> AuthCtrl --> AuthValidator
    AuthCtrl --> AuthSvc --> AuthRepo
    
    DonRoute --> DonCtrl --> DonValidator
    DonCtrl --> DonSvc --> DonRepo
    DonSvc -->|Uses| BUSvc
    
    BURoute --> BUCtrl --> BUValidator
    BUCtrl --> BUSvc --> BURepo
    
    DBRoute --> DBCtrl --> DBSvc
    
    NRoute --> NCtrl --> NValidator
    NCtrl --> NSvc --> NRepo
    NSvc --> EmailSvc
    NSvc --> SMSSvc
    NSvc -->|Queries| DonSvc
    
    FRoute --> FCtrl --> FSvc
    
    UserRoute --> UserCtrl --> UserSvc --> UserRepo
    
    AuthSvc -->|Interacts with| UserSvc
    DBSvc -->|Queries| BUSvc
    DBSvc -->|Queries| DonSvc
    DBSvc -->|Queries| UserSvc
```

---

## 6) Blood Unit State Diagram (Lifecycle)

Shows all possible states and valid transitions for a blood unit.

```mermaid
stateDiagram-v2
    [*] --> DONATED: Blood collected<br/>from donor
    
    DONATED --> TESTING: Unit sent to lab
    DONATED --> QUARANTINED: Initial issues detected
    
    TESTING --> AVAILABLE: Tests pass,<br/>unit approved
    TESTING --> QUARANTINED: Failed tests,<br/>unit held
    TESTING --> DISCARDED: Fatal test failures
    
    QUARANTINED --> AVAILABLE: Investigation<br/>resolved, approved
    QUARANTINED --> DISCARDED: Unable to<br/>resolve, discard
    
    AVAILABLE --> RESERVED: Hospital<br/>requests unit
    AVAILABLE --> EXPIRED: Expiry date<br/>reached
    AVAILABLE --> DISCARDED: Quality check<br/>failure
    
    RESERVED --> TRANSFUSED: Transfusion<br/>completed
    RESERVED --> AVAILABLE: Reservation<br/>cancelled
    RESERVED --> EXPIRED: Expires before<br/>transfusion
    RESERVED --> DISCARDED: Damage during<br/>transport
    
    TRANSFUSED --> [*]: Unit<br/>consumed
    EXPIRED --> [*]: Unit<br/>discarded
    DISCARDED --> [*]: Unit<br/>destroyed
    
    note right of DONATED
        Initial state after collection.
        Awaiting lab testing.
    end note
    
    note right of TESTING
        Unit under quality assessment.
        Results determine next state.
    end note
    
    note right of AVAILABLE
        Approved and ready for use.
        Can be reserved or expired.
    end note
    
    note right of RESERVED
        Allocated to a hospital request.
        Awaiting transfusion or return.
    end note
    
    note right of QUARANTINED
        Unit on hold pending review.
        May be approved or discarded.
    end note
    
    note right of TRANSFUSED
        Final state: unit given to patient.
    end note
    
    note right of EXPIRED
        Expiry date reached.
        Unit removed from circulation.
    end note
    
    note right of DISCARDED
        Unit cannot be used.
        Removed safely.
    end note
```

---

## Architecture Principles

- **Layered Architecture**: Routes → Controllers → Services → Repositories → Models.
- **Middleware**: Authentication, logging, and response formatting applied globally.
- **Transaction Support**: Critical multi-step operations (donations) use DB transactions.
- **Separation of Concerns**: Domain logic in services, data access in repositories, HTTP concerns in controllers.
- **External Integrations**: Email/SMS decoupled via services; file storage abstracted.
- **State Management**: Blood unit lifecycle enforced via transitions; invalid transitions rejected by service layer.

---

## Links to Related Documentation

- **Flowchart Scenarios** (detailed control flow): [`README-UML.md`](./README-UML.md)
- **Sequence Diagrams** (high-level interactions): [`README-UML-SEQUENCE.md`](./README-UML-SEQUENCE.md)
