import * as eventsService from './events.service.js';

export async function listPublished(req, res) {
  res.json(await eventsService.listPublished(req.validated.query));
}

export async function showPublished(req, res) {
  res.json({ data: await eventsService.findPublishedBySlug(req.validated.params.slug) });
}

export async function list(req, res) {
  res.json(await eventsService.list(req.validated.query));
}

export async function show(req, res) {
  res.json({ data: await eventsService.findById(req.validated.params.id) });
}

export async function create(req, res) {
  res.status(201).json({ data: await eventsService.create(req.validated.body) });
}

export async function update(req, res) {
  res.json({ data: await eventsService.update(req.validated.params.id, req.validated.body) });
}

export async function remove(req, res) {
  await eventsService.remove(req.validated.params.id);
  res.status(204).end();
}
