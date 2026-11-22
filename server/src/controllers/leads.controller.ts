import { Request, Response } from 'express';
import { leadService } from '../services/lead.service';
import { ListLeadsQuery } from '../validation/lead.schemas';

export const createLead = async (req: Request, res: Response) => {
  const lead = await leadService.create(req.body);
  res.status(201).json({ data: lead });
};

export const listLeads = async (req: Request, res: Response) => {
  const result = await leadService.list(req.query as unknown as ListLeadsQuery);
  res.status(200).json(result);
};

export const getLeadById = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const lead = await leadService.getById(id);
  res.status(200).json({ data: lead });
};

export const updateLead = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const lead = await leadService.update(id, req.body);
  res.status(200).json({ data: lead });
};

export const deleteLead = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await leadService.remove(id);
  res.status(204).send();
};
