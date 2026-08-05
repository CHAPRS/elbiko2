import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import { dataset, projectId } from '@/sanity/env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-08-05',
  useCdn: true,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: any) {
  return builder.image(source)
}