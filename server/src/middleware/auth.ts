import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type AuthPayload = {
  userId: string;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;

    if (!token) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
        (req as any).userId = payload.userId;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired session', });
    }
}