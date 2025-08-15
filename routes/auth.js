import express from 'express'
import bcrypt from 'bcryptjs'
import { createUser, findUserByEmail } from '../db.js'
import { ensureAuthenticated, ensureGuest } from '../middleware/auth.js'

export const router = express.Router()

router.get('/register', ensureGuest, (req, res) => {
  res.render('register', { title: 'Create account' })
})

router.post('/register', ensureGuest, async (req, res) => {
  try {
    const { name, email, password, confirm } = req.body

    const errors = []
    if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters')
    const normalizedEmail = (email || '').trim().toLowerCase()
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) errors.push('A valid email is required')
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters')
    if (password !== confirm) errors.push('Passwords do not match')

    if (errors.length > 0) {
      req.flash('error', errors)
      return res.redirect('/auth/register')
    }

    const existing = findUserByEmail(normalizedEmail)
    if (existing) {
      req.flash('error', 'Email is already registered')
      return res.redirect('/auth/register')
    }

    const passwordHash = await bcrypt.hash(password, 12)
    createUser({ name, email: normalizedEmail, passwordHash })

    req.flash('success', 'Account created. Please log in.')
    return res.redirect('/auth/login')
  } catch (err) {
    console.error(err)
    req.flash('error', 'Unable to create account')
    return res.redirect('/auth/register')
  }
})

router.get('/login', ensureGuest, (req, res) => {
  res.render('login', { title: 'Sign in' })
})

router.post('/login', ensureGuest, async (req, res) => {
  try {
    const { email, password } = req.body
    const normalizedEmail = (email || '').trim().toLowerCase()

    const user = findUserByEmail(normalizedEmail)
    if (!user) {
      req.flash('error', 'Invalid email or password')
      return res.redirect('/auth/login')
    }

    const ok = await bcrypt.compare(password || '', user.passwordHash)
    if (!ok) {
      req.flash('error', 'Invalid email or password')
      return res.redirect('/auth/login')
    }

    req.session.userId = user.id
    req.flash('success', 'Welcome back!')
    return res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    req.flash('error', 'Unable to sign in')
    return res.redirect('/auth/login')
  }
})

router.post('/logout', ensureAuthenticated, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid')
    res.redirect('/')
  })
})