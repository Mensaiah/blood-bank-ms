# Database Schema

This document describes the MongoDB schema used by the Blood Bank Management System.

## ER Diagram (High-Level)

```mermaid
erDiagram
    USERS ||--o{ AUTHS : "has credentials"
    USERS ||--o{ DEVICES : "registers"
    USERS ||--o{ FILES : "uploads"
    USERS ||--o{ BLOOD_UNITS : "transitions status"

    DONORS ||--o{ DONATIONS : "makes"
    DONORS ||--o{ BLOOD_UNITS : "provides"
    DONORS ||--o{ NOTIFICATIONS : "receives"

    DONATIONS ||--o{ BLOOD_UNITS : "contains"

    USERS {
      ObjectId _id PK
      string email UK
      string firstName
      string lastName
      string status
      string type
      date lastLoginAt
      string profileImage
      date createdAt
      date updatedAt
    }

    AUTHS {
      ObjectId _id PK
      string username UK
      string password
      string userId
      date createdAt
      date updatedAt
    }

    DONORS {
      ObjectId _id PK
      string donationId UK
      string name
      string phoneNumber
      string email
      string bloodGroup
      date lastDonated
      date createdAt
      date updatedAt
    }

    DONATIONS {
      ObjectId _id PK
      ObjectId donorId FK
      string donationCode UK
      string status
      date donationDate
      ObjectId[] bloodUnits
      string notes
      string collectedBy
      date createdAt
      date updatedAt
    }

    BLOOD_UNITS {
      ObjectId _id PK
      ObjectId donorId FK
      string unitId UK
      date collectionDate
      date expiryDate
      string status
      string bloodGroup
      object[] transactionHistory
      date createdAt
      date updatedAt
    }

    BLOOD_REQUESTS {
      ObjectId _id PK
      string requestedBy
      string requesterName
      string requesterHospital
      string contactPhone
      string bloodGroup
      number units
      string urgency
      string status
      date neededBy
      date createdAt
      date updatedAt
    }

    NOTIFICATIONS {
      ObjectId _id PK
      string sentBy
      string audience
      string channel
      string templateType
      ObjectId donorId FK
      string recipientEmail
      string recipientPhoneNumber
      string bloodGroup
      string status
      string message
      date createdAt
      date updatedAt
    }

    FILES {
      ObjectId _id PK
      string userId
      string uniqueId
      string name
      string type
      string url
      number size
      object metadata
      date deletedAt
      date createdAt
      date updatedAt
    }

    DEVICES {
      ObjectId _id PK
      ObjectId userId FK
      string deviceId
      string token
      string deviceName
      string platform
      date deletedAt
      date createdAt
      date updatedAt
    }

    CUSTOM_MESSAGES {
      ObjectId _id PK
      string title
      string message
      date deletedAt
      date createdAt
      date updatedAt
    }

    THIRD_PARTY_API_CALLS {
      ObjectId _id PK
      string endpoint
      number statusCode
      object payload
      object response
      object error
      number duration
      string reqId
      string sessionId
      date createdAt
      date updatedAt
    }
```

## Data Dictionary (Core Collections)

### Users Collection:
- `user_id` (`ObjectId`, Primary Key) → stored as `_id`
- `name` (`String`) → represented by `firstName` + `lastName`
- `email` (`String`, Unique)
- `password` (`String`, Hashed) → stored in related `auths.password`
- `role` (`Enum`) → stored as `type` (`ADMIN`, `LAB_REP`, `HOSPITAL_REP`, `USER`)

### Donors Collection:
- `donor_id` (`ObjectId`, Primary Key) → stored as `_id`
- `fullName` (`String`) → stored as `name`
- `bloodGroup` (`Enum`: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`)
- `lastDonationDate` (`Date`) → stored as `lastDonated`

### BloodUnits Collection (The Core Inventory):
- `unit_id` (`ObjectId`, Primary Key) → stored as `_id` (business key: `unitId`)
- `donor_id` (`ObjectId`, Foreign Key referencing Donors) → stored as `donorId`
- `collectionDate` (`Date`)
- `expiryDate` (`Date`)
- `status` (`Enum`: `DONATED`, `QUARANTINED`, `SCREENED`, `AVAILABLE`, `RESERVED`, `DISPATCHED`, `EXPIRED`)

### LabResults Collection:
- Current implementation note: there is no standalone `lab_results` collection yet.
- Lab screening workflow is represented through blood unit lifecycle transitions and audit history.
- Equivalent tracked fields are in `blood_units.transactionHistory[]`:
  - `fromStatus` (`String`)
  - `toStatus` (`String`)
  - `userId` (`ObjectId`, reference to Users)
  - `userName` (`String`)
  - `timestamp` (`Date`)

## Collections and Key Fields

### `users`
- PK: `_id`
- Unique: `email`
- Important fields: `firstName`, `lastName`, `status`, `type`, `lastLoginAt`
- Model: `src/modules/users/models/user.model.ts`

### `auths`
- PK: `_id`
- Unique: `username`
- Relation: `userId` → user identity reference
- Model: `src/modules/auth/models/auth.model.ts`

### `donors`
- PK: `_id`
- Unique: `donationId`
- Indexed/search fields: `name`, `phoneNumber`, `email`, `bloodGroup`
- Model: `src/modules/blood-donation/models/donor.model.ts`

### `donations`
- PK: `_id`
- Unique: `donationCode`
- Relations:
  - `donorId` → `donors._id`
  - `bloodUnits[]` → `blood_units._id`
- Model: `src/modules/blood-donation/models/donation.model.ts`

### `blood_units`
- PK: `_id`
- Unique: `unitId`
- Relation: `donorId` → `donors._id`
- Embedded audit trail: `transactionHistory[]` (`fromStatus`, `toStatus`, `userId`, `userName`, `timestamp`)
- Model: `src/modules/blood-donation/models/bloodUnit.model.ts`

### `blood_requests`
- PK: `_id`
- Operational fields: `requesterHospital`, `bloodGroup`, `units`, `urgency`, `status`
- Model: `src/modules/requests/models/request.model.ts`

### `notifications`
- PK: `_id`
- Relation: optional `donorId` → donor target
- Operational fields: `audience`, `channel`, `templateType`, `status`, `message`
- Model: `src/modules/notifications/models/notification.model.ts`

### `files`
- PK: `_id`
- Composite unique index: `(userId, uniqueId)`
- Soft delete: `deletedAt`
- Model: `src/modules/files/models/file.model.ts`

### `devices`
- PK: `_id`
- Relation: `userId` → `users._id`
- Soft delete: `deletedAt`
- Model: `src/modules/notifications/models/device.model.ts`

### `custom_messages`
- PK: `_id`
- Fields: `title`, `message`, `deletedAt`
- Model: `src/modules/notifications/models/custom-message.model.ts`

### `third_party_api_calls`
- PK: `_id`
- Audit/log fields: `endpoint`, `statusCode`, `payload`, `response`, `error`, `duration`
- Model: `src/externalServices/models/third-party-api-calls.model.ts`

## Notes
- Schemas use Mongoose with timestamps (`createdAt`, `updatedAt`) in most collections.
- Several collections use `mongoose-paginate-v2` for list endpoints.
- Some relations are stored as `ObjectId` refs, while some legacy links are plain strings (`userId`, `requestedBy`, `sentBy`).
