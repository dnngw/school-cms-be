import * as sectionsService from './sections.service.js';

export async function listPublic(_req, res) {
  res.json({ data: await sectionsService.list({ pageId: 'home', onlyVisible: true }) });
}

export async function list(req, res) {
  res.json({ data: await sectionsService.list({ pageId: req.validated.query.pageId }) });
}

export async function show(req, res) {
  res.json({ data: await sectionsService.findById(req.validated.params.id) });
}

export async function create(req, res) {
  res.status(201).json({ data: await sectionsService.create(req.validated.body) });
}

export async function update(req, res) {
  res.json({ data: await sectionsService.update(req.validated.params.id, req.validated.body) });
}

export async function duplicate(req, res) {
  res.status(201).json({ data: await sectionsService.duplicate(req.validated.params.id) });
}

export async function remove(req, res) {
  await sectionsService.remove(req.validated.params.id);
  res.status(204).end();
}

export async function reorder(req, res) {
  await sectionsService.reorder(req.validated.body.ids);
  res.status(204).end();
}
