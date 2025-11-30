import { searchLocations } from '../../../scripts/lib/seo_client';

export const GET = async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (!query || query.length < 3) {
        return new Response(JSON.stringify([]), { status: 200 });
    }

    const locations = await searchLocations(query);

    return new Response(JSON.stringify(locations), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}