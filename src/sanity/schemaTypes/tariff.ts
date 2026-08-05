export default {
  name: 'tariff',
  title: 'Тариф',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Название тарифа',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'subtitle',
      title: 'Подзаголовок',
      type: 'string',
    },
    {
      name: 'price',
      title: 'Цена',
      type: 'number',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'period',
      title: 'Период',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'features',
      title: 'Преимущества',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'popular',
      title: 'Популярный тариф',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'order',
      title: 'Порядок отображения',
      type: 'number',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'price',
    },
  },
}