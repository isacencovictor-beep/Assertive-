import { JSONFileSyncPreset } from 'lowdb/node'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import { nanoid } from 'nanoid'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir)
}

const defaultData = { users: [] }
export const db = JSONFileSyncPreset(path.join(dataDir, 'db.json'), defaultData)

export function findUserByEmail(email) {
  if (!email) return undefined
  const normalizedEmail = String(email).trim().toLowerCase()
  return db.data.users.find(u => u.email === normalizedEmail)
}

export function findUserById(userId) {
  return db.data.users.find(u => u.id === userId)
}

export function createUser({ name, email, passwordHash }) {
  const user = {
    id: nanoid(),
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString()
  }
  db.data.users.push(user)
  db.write()
  return user
}