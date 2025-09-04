import {
	CallHandler,
	ExecutionContext,
	Injectable,
	Logger,
	NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger(LoggingInterceptor.name);

	intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const req = context.switchToHttp().getRequest();
		const { method, url } = req;
		const now = Date.now();

		this.logger.log(`Request ${method} ${url} received...`);

		return next.handle().pipe(
			tap(() => {
				const res = context.switchToHttp().getResponse();
				const { statusCode } = res;
				this.logger.log(
					`Response ${method} ${url} - Status: ${statusCode} - ${Date.now() - now}ms`,
				);
			}),
			catchError(err => {
				this.logger.error(
					`Error ${method} ${url} - ${err.message} - ${Date.now() - now}ms`,
					err.stack,
				);
				throw err;
			}),
		);
	}
}
