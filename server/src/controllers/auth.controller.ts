import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export const signup = async (req: Request, res: Response) => {
  const result = await authService.signup(req.body);
  res.status(201).json(result);
};

export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.status(200).json(result);
};

export const getMe = async (req: Request, res: Response) => {
  const user = await authService.getUserById(req.user!.id);
  res.status(200).json({ user });
};
