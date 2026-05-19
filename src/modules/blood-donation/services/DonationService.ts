import mongoose from 'mongoose';
import DonationRepository from '../repositories/DonationRepository';
import BloodUnitRepository from '../repositories/BloodUnitRepository';
import BloodUnitService from './BloodUnitService';
import DonorRepository from '../repositories/DonorRepository';
import { ICreateDonation, IGetDonationsFilter } from '../interfaces/IDonation';
import Logger from '../../../libs/logger';
import DonationModel from '../models/donation.model';

export default class DonationService {
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
      console.log('error:', error)
      Logger.error('Error creating donation', { error });
      await session.abortTransaction();
      return { data: null, error: 'Failed to create donation' };
    } finally {
      session.endSession();
    }
  }

  public static async getDonationById(id: string) {
    const donation = await DonationRepository.findById(id) as any;

    if (!donation) {
      return null;
    }

    await donation.populate('donorId');
    await donation.populate('bloodUnits');

    return donation;
  }

  public static async getSummaryCounts() {
    try {
      const now = new Date();
      // Start of week (Monday)
      const day = now.getDay(); // 0 (Sun) - 6 (Sat)
      const diffToMonday = (day + 6) % 7; // days since Monday
      const startOfWeek = new Date(now);
      startOfWeek.setHours(0,0,0,0);
      startOfWeek.setDate(now.getDate() - diffToMonday);

      // Start of month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Start of year
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const [weekCount, monthCount, yearCount] = await Promise.all([
        DonationModel.countDocuments({ donationDate: { $gte: startOfWeek } }),
        DonationModel.countDocuments({ donationDate: { $gte: startOfMonth } }),
        DonationModel.countDocuments({ donationDate: { $gte: startOfYear } }),
      ]);

      return [
        { label: 'This Week', key: 'week', count: weekCount },
        { label: 'This Month', key: 'month', count: monthCount },
        { label: 'This Year', key: 'year', count: yearCount },
      ];
    } catch (error) {
      Logger.error('Error fetching donation summary counts', { error });
      return [
        { label: 'This Week', key: 'week', count: 0 },
        { label: 'This Month', key: 'month', count: 0 },
        { label: 'This Year', key: 'year', count: 0 },
      ];
    }
  }

  public static async getDonations(filter: IGetDonationsFilter) {
    const { limit = 10, page = 1, ...others } = filter;
    
    const query: any = {};

    if (others.donorId) {
      query.donorId = others.donorId;
    }

    if (others.startDate || others.endDate) {
      query.donationDate = {};
      if (others.startDate) {
        query.donationDate.$gte = new Date(others.startDate);
      }
      if (others.endDate) {
        query.donationDate.$lte = new Date(others.endDate);
      }
    }

    if (others.status) {
      query.status = others.status;
    }

    const donations = await DonationRepository.all(query, { _id: -1 }, Number(page), Number(limit));
    return {data: donations};
  }
}
