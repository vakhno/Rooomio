export const getDeviceType = (): "desktop" | "tablet" | "mobile" => {
	if (typeof window === "undefined")
		return "desktop";

	const userAgent = navigator.userAgent;

	if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
		return "tablet";
	}

	if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
		return "mobile";
	}

	return "desktop";
};
