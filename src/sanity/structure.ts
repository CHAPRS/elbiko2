import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Контент')
    .items([
      S.listItem()
        .title('Главная страница')
        .child(
          S.list()
            .title('Главная страница')
            .items([
              S.listItem()
                .title('Hero секция')
                .schemaType('hero'),
              S.listItem()
                .title('Тарифы')
                .schemaType('tariff'),
              S.listItem()
                .title('Отзывы')
                .schemaType('review'),
              S.listItem()
                .title('FAQ')
                .schemaType('faq'),
            ])
        ),
      S.divider(),
      S.listItem()
        .title('Велосипеды')
        .schemaType('bike'),
    ])