import * as menusService from './menus.service.js';

export async function getMenus(_req, res) {
  res.json({ data: await menusService.getMenus() });
}

export async function list(_req, res) {
  res.json({ data: await menusService.list() });
}

export async function create(req, res) {
  res.status(201).json({ data: await menusService.create(req.validated.body) });
}

export async function update(req, res) {
  res.json({ data: await menusService.update(req.validated.params.id, req.validated.body) });
}

export async function remove(req, res) {
  await menusService.remove(req.validated.params.id);
  res.status(204).end();
}

export async function reorder(req, res) {
  await menusService.reorder(req.validated.body.ids);
  res.status(204).end();
}
