import * as messagesService from './messages.service.js';

export async function create(req, res) {
  await messagesService.create(req.validated.body);
  res.status(201).json({ data: { message: 'Pesan berhasil dikirim' } });
}

export async function list(req, res) {
  res.json(await messagesService.list(req.validated.query));
}

export async function update(req, res) {
  res.json({ data: await messagesService.update(req.validated.params.id, req.validated.body) });
}

export async function remove(req, res) {
  await messagesService.remove(req.validated.params.id);
  res.status(204).end();
}
