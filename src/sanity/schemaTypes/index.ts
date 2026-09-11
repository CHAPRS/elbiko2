import { type SchemaTypeDefinition } from 'sanity'
import { tariffSchema } from './tariff'
import { heroSchema } from './hero'
import { reviewSchema } from './review'
import { faqSchema } from './faq'
import { bikeSchema } from './bike'
import { featureSchema } from './feature'
import { stepSchema } from './step'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [tariffSchema, heroSchema, reviewSchema, faqSchema, bikeSchema, featureSchema, stepSchema],
}
