import { NextRequest } from 'next/server';

const ITEMS = [
  { id: 1, title: 'First Item', completed: false },
  { id: 2, title: 'Second Item', completed: true },
];

export async function GET(_req: NextRequest) {
  return Response.json({ data: ITEMS });
}
