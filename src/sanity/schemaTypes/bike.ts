import { defineType, defineField } from 'sanity'

export const bikeSchema = defineType({
  name: 'bike',
  title: 'Электровелосипеды',
  type: 'document',
  fields: [
    defineField({
      name: 'modelName',
      title: 'Модель',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'serialNumber',
      title: 'Серийный номер / ID рамы',
      type: 'string',
    }),
    defineField({
      name: 'condition',
      title: 'Техническое состояние',
      type: 'string',
      options: {
        list: [
          { title: 'Отличное (Новый)', value: 'excellent' },
          { title: 'Хорошее (После ТО)', value: 'good' },
          { title: 'Требуется ремонт', value: 'needs_repair' },
        ],
      },
    }),
  ],
})
