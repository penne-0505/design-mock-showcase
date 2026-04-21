type ShowcaseError = Error & {
	status: number;
	statusCode: number;
};

function createShowcaseError(message: string, status: number): ShowcaseError {
	const error = new Error(message) as ShowcaseError;
	error.status = status;
	error.statusCode = status;
	return error;
}

export function notFoundError(message: string): ShowcaseError {
	return createShowcaseError(message, 404);
}

export function badRequestError(message: string): ShowcaseError {
	return createShowcaseError(message, 400);
}

export function conflictError(message: string): ShowcaseError {
	return createShowcaseError(message, 409);
}
