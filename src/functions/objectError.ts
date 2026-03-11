export const objectError = ({ name, msg }: { name: string; msg: string }) => {
	// Build nested object when the field name contains dots to support tests
	if (name.includes('.')) {
		const parts = name.split('.');
		const root: any = {};
		let cur = root;
		for (let i = 0; i < parts.length - 1; i++) {
			const key = parts[i];
			cur[key] = cur[key] || {};
			cur = cur[key];
		}
		cur[parts[parts.length - 1]] = { message: msg };
		return root;
	}
	return {
		[name]: { message: msg },
	};
};
