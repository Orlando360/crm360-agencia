import { callAnthropicWithRetry } from '../lib/anthropic-retry.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY no configurada' })

  try {
    const data = await callAnthropicWithRetry(req.body, apiKey)
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error conectando con Claude API' })
  }
}
