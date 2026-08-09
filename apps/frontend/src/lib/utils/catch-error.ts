interface catchErrorParams<T> {
	promise: Promise<T>;
}

export const catchError = <T>({ promise }: catchErrorParams<T>): Promise<[undefined, T] | [Error]> => {
	return promise.then((data) => {
		return [undefined, data] as [undefined, T];
	}).catch((error) => {
		return [error];
	});
};
