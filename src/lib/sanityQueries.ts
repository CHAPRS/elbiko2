import { client } from './sanity'

export async function getHero() {
  return client.fetch(`
    *[_type == "hero"][0]{
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
    }
  `)
}

export async function getTariffs() {
  return client.fetch(`
    *[_type == "tariff"] | order(order asc){
      _id,
      name,
      subtitle,
      price,
      period,
      features,
      popular
    }
  `)
}

export async function getReviews() {
  return client.fetch(`
    *[_type == "review"] | order(order asc){
      _id,
      author,
      platform,
      duration,
      rating,
      text
    }
  `)
}

export async function getFAQ() {
  return client.fetch(`
    *[_type == "faq"] | order(order asc){
      _id,
      question,
      answer
    }
  `)
}

export async function getBikes() {
  return client.fetch(`
    *[_type == "bike" && available == true] | order(order asc){
      _id,
      name,
      description,
      price,
      range,
      speed,
      power,
      image
    }
  `)
}