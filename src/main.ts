import * as core from '@actions/core'
import * as github from '@actions/github'
import fetch from 'node-fetch'

type Embed = {
  title: string
  description: string
  color?: number
  image?: ImageEmbed
}

type ImageEmbed = {
  url: string
}

type Body = {
  avatar_url?: string
  username?: string
  embeds: Embed[]
}

async function run(): Promise<void> {
  try {
    const webhookUrl = core.getInput('webhook_url', {required: true})
    core.info(webhookUrl)
    const title = core.getInput('title', {required: true})
    const message = core.getInput('message', {required: true})
    const avatar_url = core.getInput('avatar_url')
    const username = core.getInput('username')
    const colour = core.getInput('colour')

    const embed: Embed = {
      title,
      description: message
    }

    if (colour !== '') {
      embed.color = parseInt(colour.replace('#', ''), 16)
    }

    const include_image = core.getBooleanInput('include_image')
    if (include_image && github.context.eventName === 'pull_request') {
      embed['image'] = {
        url: `https://opengraph.githubassets.com/${github.context.sha}/${github.context.repo.owner}/${github.context.repo.repo}/pull/${github.context.payload.pull_request?.number}`
      }
    }

    const body: Body = {
      embeds: [embed]
    }

    if (avatar_url !== '') {
      body['avatar_url'] = avatar_url
    }

    if (username !== '') {
      body['username'] = avatar_url
    }
    core.info(JSON.stringify(body))
    await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {'Content-Type': 'application/json'}
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
