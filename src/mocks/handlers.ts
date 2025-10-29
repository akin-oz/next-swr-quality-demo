import { http, HttpResponse } from 'msw';

const ITEMS = [
  { id: 1, title: 'First Item', completed: false },
  { id: 2, title: 'Second Item', completed: true },
];

export const handlers = [
  http.get('/api/items', () => {
    return HttpResponse.json({ data: ITEMS });
  }),
  http.get('/api/items/:id', ({ params }) => {
    const id = Number(params.id);
    const item = ITEMS.find((i) => i.id === id);
    if (!item) {
      return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
    }
    return HttpResponse.json({ data: item });
  }),
];
