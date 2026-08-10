import { type SchemaTypeDefinition } from 'sanity'
import { tariffSchema } from './tariff'
import { heroSchema } from './hero'
import { reviewSchema } from './review'
import { faqSchema } from './faq'
import { bikeSchema } from './bike'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [tariffSchema, heroSchema, reviewSchema, faqSchema, bikeSchema],
}
