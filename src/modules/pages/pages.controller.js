import * as pagesService from './pages.service.js';

export async function showPublished(req, res) {
  res.json({ data: await pagesService.findPublishedBySlug(req.validated.params.slug) });
}

export async function list(_req, res) {
  res.json({ data: await pagesService.list() });
}

export async function show(req, res) {
  res.json({ data: await pagesService.findById(req.validated.params.id) });
}

export async function create(req, res) {
  res.status(201).json({ data: await pagesService.create(req.validated.body) });
}

export async function update(req, res) {
  res.json({ data: await pagesService.update(req.validated.params.id, req.validated.body) });
}

export async function remove(req, res) {
  await pagesService.remove(req.validated.params.id);
  res.status(204).end();
}
