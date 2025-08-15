import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import path from 'path'
import { fileURLToPath } from 'url'
import morgan from 'morgan'
import helmet from 'helmet'
import methodOverride from 'method-override'
import flash from 'connect-flash'

import { attachCurrentUser, ensureAuthenticated } from './middleware/auth.js'
import { router as indexRouter } from './routes/index.js'
import { router as authRouter } from './routes/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(morgan('dev'))
app.use(helmet())

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}))

app.use(flash())
app.use(attachCurrentUser)


app.use('/', indexRouter)
app.use('/auth', authRouter)


app.use((req, res) => {
  res.status(404).render('error', { title: 'Not Found', message: 'Page not found' })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).render('error', { title: 'Server Error', message: 'An unexpected error occurred.' })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})