import type { PageServerLoad } from './$types';
import { getDisplayConfig } from '$lib/server/config';

export const load: PageServerLoad = async () => {
	const config = await getDisplayConfig();
	return { config };
};
