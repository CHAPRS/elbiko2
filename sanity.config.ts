'use client'

/**
 * This configuration is used for the Sanity Studio that’s mounted on the `\src\app\studio\[[...tool]]\page.tsx` route
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { SchemaTypeDefinition } from 'sanity';


// Импортируем версию API и схемы
import { apiVersion } from './src/sanity/env'
import { schema } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'

export default defineConfig({
  basePath: '/studio',
  
  // Вставьте сюда ваши реальные данные из аккаунта sanity.io/manage или файла .env
  projectId: '9qjrff3g', 
  dataset: 'production', 

schema: {
  types: (Array.isArray(schema) ? schema : (schema as any).types || []) as any,
},




  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
