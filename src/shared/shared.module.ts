import { EmailService } from '@/services/email.service';
import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Global()
@Module({
	providers: [EmailService, JwtService],
	exports: [EmailService, JwtService],
})
export class SharedModule {}
