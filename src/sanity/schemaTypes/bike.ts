export default {
  name: 'bike',
  title: 'Велосипед',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Название модели',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Описание',
      type: 'text',
    },
    {
      name: 'price',
      title: 'Цена аренды в день',
      type: 'number',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'range',
      title: 'Запас хода',
      type: 'string',
    },
    {
      name: 'speed',
      title: 'Максимальная скорость',
      type: 'string',
    },
    {
      name: 'power',
      title: 'Мощность',
      type: 'string',
    },
    {
      name: 'image',
      title: 'Изображение',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'available',
      title: 'Доступен для аренды',
      type: 'boolean',
      defaultValue: true,
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
      media: 'image',
    },
  },
}