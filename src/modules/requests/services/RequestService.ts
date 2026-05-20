import BloodRequestModel from "../models/request.model";

export interface ICreateRequestInput {
  requesterName: string;
  requesterHospital: string;
  contactPhone: string;
  bloodGroup: string;
  units: number;
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  neededBy?: Date;
  notes?: string;
}

export default class RequestService {
  public static async createRequest(requestedBy: string | undefined, input: ICreateRequestInput) {
    const payload = {
      requestedBy,
      requesterName: input.requesterName,
      requesterHospital: input.requesterHospital,
      contactPhone: input.contactPhone,
      bloodGroup: input.bloodGroup,
      units: Number(input.units),
      urgency: input.urgency,
      neededBy: input.neededBy ? new Date(input.neededBy) : undefined,
      notes: input.notes,
      status: "PENDING" as const,
    };

    const created = await BloodRequestModel.create(payload);

    return { data: created, error: null };
  }

  public static async getRecentRequests(limit = 20) {
    return BloodRequestModel.find({})
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}
