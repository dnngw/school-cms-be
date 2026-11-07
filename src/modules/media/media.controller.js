import { ApiError } from '../../utils/api-error.js';
import * as mediaService from './media.service.js';

export async function list(req, res) {
  res.json(await mediaService.list(req.validated.query));
}

export async function upload(req, res) {
  if (!req.file) throw ApiError.badRequest('No file uploaded (use the "file" field)');
  res.status(201).json({ data: await mediaService.create(req.file, req.user.id) });
}

export async function update(req, res) {
  res.json({ data: await mediaService.update(req.validated.params.id, req.validated.body) });
}

export async function remove(req, res) {
  await mediaService.remove(req.validated.params.id);
  res.status(204).end();
}
