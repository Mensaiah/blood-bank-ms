import { Request, Response } from 'express';
import DonationService from '../services/DonationService';
import StandardResponse from '../../../utils/StandardResponse';
import DonationValidator from '../validators/DonationValidator';
import DonationRepository from '../repositories/DonationRepository';

export default class DonationController {
  public static async create(req: Request, res: Response) {
    const body = req.body;
    const validationError = DonationValidator.createDonation(body);
    if (validationError) return StandardResponse.errorResponse(res, validationError, 422);

    const { data, error } = await DonationService.createDonation(body);
    if (error) return StandardResponse.errorResponse(res, error, 400);
    return StandardResponse.successResponse(res, 'Donation created', data, 201);
  }

  public static async getById(req: Request, res: Response) {
    const id = String(req.params.id);
    const donation = await DonationService.getDonationById(id);
    if (!donation) return StandardResponse.errorResponse(res, 'Donation not found', 404);
    return StandardResponse.successResponse(res, 'Donation fetched', donation, 200);
  }

  public static async getAll(req: Request, res: Response) {
    const limit = req.query.limit ? Number(req.query.limit) : 25;
    const offset = req.query.offset ? Number(req.query.offset) : 0;

    const donations = await DonationRepository.getRecentDonations(limit, offset);

    if (req.get('HX-Request') === 'true') {
      return res.render('partials/donation-list', { donations: donations || [] });
    }

    return StandardResponse.successResponse(res, 'Donations fetched', donations, 200);
  }
}
