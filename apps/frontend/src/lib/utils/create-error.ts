interface CreateErrorParams {
	message: string;
	name?: string;
}

const DEFAULT_NAME = "Error";

export const createError = ({ message, name = DEFAULT_NAME }: CreateErrorParams): Error => {
	const error = new Error(message);
	error.name = name;

	return error;
};
