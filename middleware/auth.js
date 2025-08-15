import { findUserById } from '../db.js'

export function ensureAuthenticated(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.redirect('/auth/login')
  }
  return next()
}

export function ensureGuest(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard')
  }
  return next()
}

export function attachCurrentUser(req, res, next) {
  const userId = req.session?.userId
  if (userId) {
    const user = findUserById(userId)
    if (user) {
      req.user = user
      res.locals.currentUser = { id: user.id, name: user.name, email: user.email }
    }
  }
  res.locals.flash = {
    success: req.flash('success'),
    error: req.flash('error')
  }
  next()
}