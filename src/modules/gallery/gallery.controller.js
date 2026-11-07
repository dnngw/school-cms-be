import * as galleryService from './gallery.service.js';

export async function listVisible(req, res) {
  res.json(await galleryService.listVisible(req.validated.query));
}

export async function listAlbums(_req, res) {
  res.json({ data: await galleryService.listAlbums() });
}

export async function list(req, res) {
  res.json(await galleryService.list(req.validated.query));
}

export async function create(req, res) {
  res.status(201).json({ data: await galleryService.create(req.validated.body) });
}

export async function update(req, res) {
  res.json({ data: await galleryService.update(req.validated.params.id, req.validated.body) });
}

export async function remove(req, res) {
  await galleryService.remove(req.validated.params.id);
  res.status(204).end();
}
