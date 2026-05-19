import { UserType } from "../../../enum/User";

export enum BloodUnitStatus {
  DONATED = "DONATED",
  QUARANTINED = "QUARANTINED",
  SCREENED = "SCREENED",
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  DISPATCHED = "DISPATCHED",
  EXPIRED = "EXPIRED",
}

export const BLOOD_UNIT_STATUS_FLOW: Record<BloodUnitStatus, BloodUnitStatus[]> = {
  [BloodUnitStatus.DONATED]: [BloodUnitStatus.QUARANTINED],
  [BloodUnitStatus.QUARANTINED]: [BloodUnitStatus.SCREENED],
  [BloodUnitStatus.SCREENED]: [BloodUnitStatus.AVAILABLE, BloodUnitStatus.RESERVED],
  [BloodUnitStatus.AVAILABLE]: [BloodUnitStatus.RESERVED],
  [BloodUnitStatus.RESERVED]: [BloodUnitStatus.DISPATCHED, BloodUnitStatus.AVAILABLE],
  [BloodUnitStatus.DISPATCHED]: [],
  [BloodUnitStatus.EXPIRED]: [],

};

export const USER_ALLOWED_TO_TRANSITION_STATUS: Record<UserType, BloodUnitStatus[]> = {
  [UserType.ADMIN]:  [BloodUnitStatus.QUARANTINED, BloodUnitStatus.SCREENED, BloodUnitStatus.AVAILABLE, BloodUnitStatus.RESERVED, BloodUnitStatus.DISPATCHED, BloodUnitStatus.EXPIRED],
  [UserType.HOSPITAL_REP]: [],
  [UserType.LAB_REP]: [BloodUnitStatus.QUARANTINED, BloodUnitStatus.SCREENED],
  [UserType.USER]: [],


}
