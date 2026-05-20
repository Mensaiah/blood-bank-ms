# APPENDICES

This section contains representative code snippets from the Blood Bank Management System implementation.

---

## Appendix A: API Route Composition

**Source:** `src/routes/api.ts`

```ts
import { Router } from "express";
import "express-async-errors"

import authsRoutes from '../modules/auth/routes';
import donationRoutes from '../modules/blood-donation/routes';
import dashboardRoutes from '../modules/dashboard/routes';
import filesRoutes from '../modules/files/routes';
import notificationRoutes from '../modules/notifications/routes';

import UserMiddleware from "../middlewares/user";

const router = Router();

router.use("/auth", authsRoutes);
router.use("/donations", UserMiddleware.authenticate, donationRoutes);

router.use("/dashboard", UserMiddleware.authenticate, dashboardRoutes);
router.use("/files", UserMiddleware.authenticate, filesRoutes);
router.use("/notifications", notificationRoutes);

export default router;
```

---

## Appendix B: Transactional Donation Creation

**Source:** `src/modules/blood-donation/services/DonationService.ts`

```ts
public static async createDonation(input: ICreateDonation) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const donor = await DonorRepository.findOne({ _id: input.donorId });
    if (!donor) return { data: null, error: 'Donor not found' };

    const [donation] = await DonationRepository.createDonation({
      donorId: input.donorId as any,
      status: input.status || 'completed',
      donationDate: input.donationDate || new Date(),
      notes: input.notes,
      collectedBy: input.collectedBy,
    }, session);

    const unitsToCreate = input.bloodGroupUnits && input.bloodGroupUnits > 0 ? input.bloodGroupUnits : 1;
    const createdUnitIds: string[] = [];

    for (let i = 0; i < unitsToCreate; i++) {
      const [unitRecord] = await BloodUnitRepository.createBloodUnit({
        donorId: input.donorId as any,
        unitId: `${input.donorId}-${Date.now()}-${i}`,
        collectionDate: input.donationDate || new Date(),
        expiryDate: BloodUnitService.calculateExpiryDate(input.donationDate),
        bloodGroup: donor.bloodGroup,
        status: undefined,
      } as any, session);

      unitRecord?._id && createdUnitIds.push(unitRecord._id.toString());
    }

    await DonationRepository.updateDonationWithUnits(donation._id.toString(), createdUnitIds, session);

    await DonorRepository.update({ _id: donor._id }, {
      $inc: { donationCount: 1 },
      $set: { lastDonated: donation.donationDate },
    }, session);

    await session.commitTransaction();

    return { data: await DonationRepository.findById(donation._id.toString()), error: null };
  } catch (error) {
    await session.abortTransaction();
    return { data: null, error: 'Failed to create donation' };
  } finally {
    session.endSession();
  }
}
```

---

## Appendix C: Blood Unit Status Transition Logic

**Source:** `src/modules/blood-donation/services/BloodUnitService.ts`

```ts
public static async transitionStatus(
  userType: UserType,
  id: string,
  nextStatus: BloodUnitStatus,
  userId: string,
  userName: string
) {
  const bloodUnit = await this.getBloodUnitById(id);

  if (!bloodUnit) {
    return { error: "Specified Blood Unit cannot be found" };
  }

  const userAllowedStatuses = USER_ALLOWED_TO_TRANSITION_STATUS[userType] || [];
  if (!userAllowedStatuses.includes(nextStatus)) {
    return { error: `User type ${userType} is not allowed to transition to ${nextStatus}` };
  }

  const allowedTransitions = BLOOD_UNIT_STATUS_FLOW[bloodUnit.status] || [];
  if (!allowedTransitions.includes(nextStatus)) {
    return { error: `Transition from ${bloodUnit.status} to ${nextStatus} is not authorized` };
  }

  const previousStatus = bloodUnit.status;
  bloodUnit.status = nextStatus;

  bloodUnit.transactionHistory = bloodUnit.transactionHistory || [];
  bloodUnit.transactionHistory.push({
    fromStatus: previousStatus,
    toStatus: nextStatus,
    userId: userId as any,
    userName,
    timestamp: new Date(),
  });

  await bloodUnit.save();
  return { data: bloodUnit };
}
```

---

## Appendix D: Notification Send Service (Broadcast/Targeted)

**Source:** `src/modules/notifications/services/NotificationService.ts`

```ts
public async sendNotification(sentBy: string, input: ISendNotificationInput) {
  const { audience, channel, donorId, bloodGroup } = input;

  if (audience === "DONOR" && !donorId) {
    return { error: "donorId is required for donor notification" };
  }

  const donorsData = audience === "DONOR"
    ? [await DonorService.getDonorById(String(donorId))]
    : await this.getAllDonors(bloodGroup);

  const donors = donorsData.filter(Boolean) as any[];
  const logs: Array<Partial<INotificationLog>> = [];

  for (const donor of donors) {
    logs.push(await this.processDonorNotification(sentBy, input, donor, channel));
  }

  if (logs.length) {
    await NotificationModel.insertMany(logs);
  }

  const sentCount = logs.filter((item) => item.status === "SENT").length;
  const failedCount = logs.filter((item) => item.status === "FAILED").length;
  const skippedCount = logs.filter((item) => item.status === "SKIPPED").length;

  return {
    data: {
      total: logs.length,
      sent: sentCount,
      failed: failedCount,
      skipped: skippedCount,
    },
  };
}
```

---

## Appendix E: Notification Validation Rule Snippet

**Source:** `src/modules/notifications/validators/NotificationValidator.ts`

```ts
const schema = Joi.object({
  audience: Joi.string().valid("BROADCAST", "DONOR").required(),
  channel: Joi.string().valid("EMAIL", "SMS").required(),
  templateType: Joi.string().valid("EMERGENCY_BROADCAST", "DONOR_BIRTHDAY", "DONOR_APPEAL").required(),
  donorId: Joi.when("audience", {
    is: "DONOR",
    then: Joi.string().required(),
    otherwise: Joi.string().allow("", null).optional(),
  }),
  bloodGroup: Joi.when("templateType", {
    is: "DONOR_APPEAL",
    then: Joi.string().valid("ALL", ...Object.values(BloodGroup)).allow("", null).optional(),
    otherwise: Joi.string().valid("ALL", ...Object.values(BloodGroup)).allow("", null).optional(),
  }),
  subject: Joi.string().allow("", null).optional(),
  message: Joi.string().required(),
});
```

---

## Appendix F: Dashboard Cards Aggregation

**Source:** `src/modules/dashboard/services/DashboardService.ts`

```ts
public static async getCards() {
  const now = new Date();
  const aboutToExpireDate = new Date(now);
  aboutToExpireDate.setDate(aboutToExpireDate.getDate() + ABOUT_TO_EXPIRE_IN_DAYS);

  const [totalAvailableUnits, donorsCount, aboutToExpire, registeredHospital] = await Promise.all([
    BloodUnitRepository.count({ status: BloodUnitStatus.AVAILABLE }),
    DonorRepository.count({}),
    BloodUnitRepository.count({
      status: BloodUnitStatus.AVAILABLE,
      expiryDate: {
        $gte: now,
        $lte: aboutToExpireDate,
      },
    } as any),
    UserService.getUserCounts({ type: UserType.HOSPITAL_REP }),
  ]);

  return [
    { title: "Total Available Units", value: totalAvailableUnits },
    { title: "Donors Count", value: donorsCount },
    { title: "About to Expire", value: aboutToExpire },
    { title: "Registered Hospital", value: registeredHospital },
  ];
}
```

---

## Appendix G: Email Delivery (Raw HTML Send)

**Source:** `src/modules/notifications/email/EmailService.ts`

```ts
public async sendRawMail(
  mailOptions: MailOptions,
  html: string
): Promise<any> {
  try {
    const options: MailOptions = {
      ...mailOptions,
      from: config.env.mailServer.senderId,
      html,
    };

    const info = await this.transporter.sendMail(options);
    Logger.info(JSON.stringify(info));
    return info;
  } catch (error) {
    Logger.error("Error sending raw email", error);
    throw error;
  }
}
```
