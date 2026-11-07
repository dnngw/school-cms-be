import * as staffService from './staff.service.js';

export async function listVisible(req, res) {
  res.json({ data: await staffService.listVisible(req.validated.query) });
}

export async function list(_req, res) {
  res.json({ data: await staffService.list() });
}

export async function create(req, res) {
  res.status(201).json({ data: await staffService.create(req.validated.body) });
}

export async function update(req, res) {
  res.json({ data: await staffService.update(req.validated.params.id, req.validated.body) });
}

export async function remove(req, res) {
  await staffService.remove(req.validated.params.id);
  res.status(204).end();
}

export async function reorder(req, res) {
  await staffService.reorder(req.validated.body.ids);
  res.status(204).end();
}
