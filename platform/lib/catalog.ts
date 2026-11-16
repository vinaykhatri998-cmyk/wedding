import catalog from '@/templates/catalog.json'
import type { Theme } from './types'

/** Designs shipped with the website (a .html file in templates/ plus a picture in public/thumbs/). */
export type CatalogEntry = { name: string; category: string; tier: 'standard' | 'premium'; sort: number; description: string; themes: Theme[] }
export const CATALOG = catalog as Record<string, CatalogEntry>
export const hasThumb = (id: string) => id in CATALOG
