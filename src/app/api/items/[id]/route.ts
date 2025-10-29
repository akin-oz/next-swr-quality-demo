import { NextRequest } from 'next/server';

const ITEMS = [
  { id: 1, title: 'First Item', completed: false },
  { id: 2, title: 'Second Item', completed: true },
];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  const item = ITEMS.find((i) => i.id === numId);
  if (!item) {
    return new Response(JSON.stringify({ message: 'Not Found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }
  return Response.json({ data: item });
}
