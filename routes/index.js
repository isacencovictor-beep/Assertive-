import express from 'express'
import { ensureAuthenticated } from '../middleware/auth.js'

export const router = express.Router()

router.get('/', (req, res) => {
  res.render('home', { title: 'Home' })
})

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', { title: 'Dashboard' })
})