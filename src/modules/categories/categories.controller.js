import * as categoriesService from './categories.service.js';

export async function list(_req, res) {
  res.json({ data: await categoriesService.list() });
}

export async function create(req, res) {
  res.status(201).json({ data: await categoriesService.create(req.validated.body) });
}

export async function update(req, res) {
  res.json({ data: await categoriesService.update(req.validated.params.id, req.validated.body) });
}

export async function remove(req, res) {
  await categoriesService.remove(req.validated.params.id);
  res.status(204).end();
}
