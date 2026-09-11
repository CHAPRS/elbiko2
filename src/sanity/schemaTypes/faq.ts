import { defineType, defineField } from 'sanity'

export const faqSchema = defineType({
  name: 'faq',
  title: 'FAQ (Вопросы и ответы)',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Вопрос',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Ответ',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Порядок отображения',
      type: 'number',
      description: 'Чем меньше число, тем выше вопрос в списке',
    }),
  ],
})
