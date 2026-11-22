import { Request, Response } from 'express';
import { leadService } from '../services/lead.service';
import { ListLeadsQuery } from '../validation/lead.schemas';

export const createLead = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const lead = await leadService.create(userId, req.body);
  res.status(201).json({ data: lead });
};

export const listLeads = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await leadService.list(
    userId,
    req.query as unknown as ListLeadsQuery
  );
  res.status(200).json(result);
};

export const getLeadById = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params as { id: string };
  const lead = await leadService.getById(userId, id);
  res.status(200).json({ data: lead });
};

export const updateLead = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params as { id: string };
  const lead = await leadService.update(userId, id, req.body);
  res.status(200).json({ data: lead });
};

export const deleteLead = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params as { id: string };
  await leadService.remove(userId, id);
  res.status(204).send();
};

export const getLeadStats = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const stats = await leadService.getStats(userId);
  res.status(200).json({
    ...stats,
    data: stats,
  });
};
