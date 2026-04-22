import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const revalidate = 60;

const CLASSES = [
  { id: '1', day: 'Seg', date: '21/04', time: '07:00', studentId: 's1', type: 'Hipertrofia', status: 'confirmed' },
  { id: '2', day: 'Ter', date: '22/04', time: '18:00', studentId: 's1', type: 'Powerlifting', status: 'pending' }
];

export async function GET() {
  return NextResponse.json(
    CLASSES,
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=120',
        'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    }
  );
}