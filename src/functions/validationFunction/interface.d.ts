export interface ValidatePropertyDataProps<T extends { status: boolean }> {
	property: Partial<T>;
	data: T;
	msg: MsgStructure;
	checkErrors?: (props: CheckValidationErrorsProps<T>) => void;
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
