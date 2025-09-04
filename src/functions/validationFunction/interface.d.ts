export interface ValidatePropertyDataProps<T extends { status: boolean }> {
	property: object;
	data: T;
	msg: MsgStructure;
	checkErrors?: ({
		data,
		msg,
		name,
	}: CheckValidationErrorsProps<unknown>) => void;
}

export interface CheckValidationErrorsProps<T extends { status: boolean }> {
	data: T;
	msg: MsgStructure;
	name: string;
}

export interface MsgStructure {
	validation: {
		disability: string;
		default: string;
	};
}
