import * as usersService from './users.service.js';

export async function list(_req, res) {
  res.json({ data: await usersService.list() });
}

export async function create(req, res) {
  res.status(201).json({ data: await usersService.create(req.validated.body) });
}

export async function update(req, res) {
  res.json({ data: await usersService.update(req.validated.params.id, req.validated.body) });
}

export async function remove(req, res) {
  await usersService.remove(req.validated.params.id, req.user.id);
  res.status(204).end();
}
