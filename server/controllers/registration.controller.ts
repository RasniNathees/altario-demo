import { Request, Response } from 'express';
import { RegistrationService } from '../services';
import { ApiResponse } from '../utils';

export class RegistrationController {
  private service = new RegistrationService();

  getAll = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await this.service.getAll(page, limit, search);
    res.json(result);
  };

  getAllSimple = async (req: Request, res: Response) => {
    const registrations = await this.service.getAllSimple();
    res.json(registrations);
  };

  create = async (req: Request, res: Response) => {
    const { fullName, email, company } = req.body;
    const registration = await this.service.create({ fullName, email, company });
    res.status(201).json(registration);
  };

  updateStatus = async (req: Request, res: Response) => {
    const { status } = req.body;
    const registration = await this.service.updateStatus(req.params.id, status);
    res.json(registration);
  };

  delete = async (req: Request, res: Response) => {
    const id = await this.service.delete(req.params.id);
    res.json(id);
  };
}