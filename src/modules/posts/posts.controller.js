import * as postsService from './posts.service.js';

export async function listPublished(req, res) {
  res.json(await postsService.listPublished(req.validated.query));
}

export async function showPublished(req, res) {
  res.json({ data: await postsService.findPublishedBySlug(req.validated.params.slug) });
}

export async function list(req, res) {
  res.json(await postsService.list(req.validated.query));
}

export async function show(req, res) {
  res.json({ data: await postsService.findById(req.validated.params.id) });
}

export async function create(req, res) {
  res.status(201).json({ data: await postsService.create(req.validated.body, req.user.id) });
}

export async function update(req, res) {
  res.json({ data: await postsService.update(req.validated.params.id, req.validated.body) });
}

export async function remove(req, res) {
  await postsService.remove(req.validated.params.id);
  res.status(204).end();
}
