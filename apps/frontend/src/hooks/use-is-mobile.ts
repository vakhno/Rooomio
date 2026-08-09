import { useLayoutEffect, useState } from "react";

import { getDeviceType } from "@/lib/utils/get-device-type";

export const useIsMobile = () => {
	const [isMobileDevice, setIsMobileDevice] = useState(false);

	useLayoutEffect(() => {
		const deviceType = getDeviceType();

		if (deviceType !== "desktop") {
			setIsMobileDevice(true);
		}
	}, []);

	return isMobileDevice;
};
