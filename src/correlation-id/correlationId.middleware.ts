import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

export const correlationIdHeader = 'X-Correlation-Id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		const id = randomUUID();
		req[correlationIdHeader] = id;
		res.set(correlationIdHeader, id);
		next();
	}
}
