import * as authService from './auth.service.js';

export async function login(req, res) {
  const result = await authService.login(req.validated.body);
  res.json({ data: result });
}

export async function me(req, res) {
  res.json({ data: await authService.getProfile(req.user.id) });
}

export async function updateMe(req, res) {
  res.json({ data: await authService.updateProfile(req.user.id, req.validated.body) });
}

export async function changePassword(req, res) {
  await authService.changePassword(req.user.id, req.validated.body);
  res.status(204).end();
}
