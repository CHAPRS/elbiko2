import { client } from './sanity'

export async function getHero() {
  const query = `*[_type == "hero"][0]{
    backgroundImage,
    title,
    subtitle,
    badge,
    stat1_label,
    stat1_value,
    stat2_label,
    stat2_value,
    stat3_label,
    stat3_value,
    cta_text,
    cta_link,
    secondary_cta_text,
    secondary_cta_link
  }`
  return await client.fetch(query)
}

export async function getTariffs() {
  const query = `*[_type == "tariff"] | order(order asc){
    name,
    subtitle,
    price,
    period,
    features,
    popular,
    order,
    image
  }`
  return await client.fetch(query)
}

export async function getReviews() {
  const query = `*[_type == "review"] | order(order asc){
    author,
    avatar,
    platform,
    duration,
    rating,
    text,
    order
  }`
  return await client.fetch(query)
}

export async function getFAQ() {
  const query = `*[_type == "faq"] | order(order asc){
    question,
    answer,
    order
  }`
  return await client.fetch(query)
}

export async function getBikes() {
  const query = `*[_type == "bike" && available == true] | order(order asc){
    name,
    description,
    price,
    range,
    speed,
    power,
    image,
    available,
    order
  }`
  return await client.fetch(query)
}

export async function getFeatures() {
  const query = `*[_type == "feature"] | order(order asc){
    icon,
    image,
    title,
    description,
    order
  }`
  return await client.fetch(query)
}

export async function getSteps() {
  const query = `*[_type == "step"] | order(order asc){
    number,
    image,
    title,
    description,
    order
  }`
  return await client.fetch(query)
}
