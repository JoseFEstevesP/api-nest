import { ConflictException } from '@nestjs/common';

// Custom ConflictException that preserves a structured response
// while also exposing a human-readable message for toThrow checks.
export class ExtendedConflictException extends ConflictException {
	private readonly _responseObj: any;

	constructor(responseObj: any) {
		// Derive a readable message from the structured response if possible
		let message = '';
		if (responseObj && typeof responseObj === 'object') {
			const fields = Object.keys(responseObj);
			if (fields.length > 0) {
				const first = responseObj[fields[0]];
				if (first && typeof first === 'object' && 'message' in first) {
					// If we have a specific message for the first field, use it as the basis
					message = first.message;
				}
			}
			// Build a broader message if multiple fields exist
			if (fields.length > 1) {
				const joined = fields.join(', ');
				message = `El valor para ${joined} ya está en uso.`;
			}
		}

		// Initialize as a normal ConflictException with a derived message
		// Cast second arg to any to satisfy differing overload signatures in environment
		super(message || 'Conflict', 409 as any);
		this._responseObj = responseObj;
	}

	getResponse(): any {
		return this._responseObj;
	}
}
