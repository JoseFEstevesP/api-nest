export const objectError = ({ name, msg }: { name: string; msg: string }) => ({
	[name]: { message: msg },
});
