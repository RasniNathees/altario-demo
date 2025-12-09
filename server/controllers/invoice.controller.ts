import { Request, Response } from 'express';
import { InvoiceService } from '../services';
import { ApiResponse } from '../utils';

export class InvoiceController {
  private service = new InvoiceService();

  getAll = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    console.log('Search Query:', search);
    const result = await this.service.getAll(page, limit, search);
   // console.log(result)
    res.json(result);
  };

  create = async (req: Request, res: Response) => {
    const { registrationId, dueDate, status, items, vatRate, notes } = req.body;
    const invoice = await this.service.create({
      registrationId,
      dueDate,
      status,
      items,
      vatRate,
      notes,
    });
    res.status(201).json(invoice);
  };

  update = async (req: Request, res: Response) => {
    const { status, notes, items } = req.body;
    const invoice = await this.service.update(req.params.id, {
      status,
      notes,
      items,
    });
    res.json(invoice);
  };

  delete = async (req: Request, res: Response) => {
    const id = await this.service.delete(req.params.id);
    res.json(id);
  };
}