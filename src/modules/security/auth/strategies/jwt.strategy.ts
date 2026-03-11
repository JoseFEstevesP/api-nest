import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { PayloadJWT } from '../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: (req: Request) => {
				return req.cookies?.accessToken || null;
			},
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET,
		});
	}

	async validate(payload: PayloadJWT) {
		return {
			uid: payload.uid,
			uidRol: payload.uidRol,
			dataLog: payload.dataLog,
		};
	}
}
