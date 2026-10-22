import {defineArrayMember, defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: rule => rule.required()}),
    defineField({name: 'slug', title: 'URL slug', type: 'slug', options: {source: 'title'}, validation: rule => rule.required()}),
    defineField({name: 'publishedAt', title: 'Publish date', type: 'datetime', initialValue: () => new Date().toISOString(), validation: rule => rule.required()}),
    defineField({name: 'excerpt', title: 'Short summary', type: 'text', rows: 3, description: 'Appears on the blog page under the title.', validation: rule => rule.required().max(220)}),
    defineField({name: 'seoDescription', title: 'Search description', type: 'text', rows: 3, description: 'A short, unique description for search results.', validation: rule => rule.max(160)}),
    defineField({name: 'coverImage', title: 'Cover image', type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', title: 'Image description', type: 'string', validation: rule => rule.required()})]}),
    defineField({name: 'body', title: 'Article', type: 'array', of: [defineArrayMember({type: 'block'}), defineArrayMember({type: 'image', fields: [defineField({name: 'alt', title: 'Image description', type: 'string', validation: rule => rule.required()})]})], validation: rule => rule.required()}),
  ],
  preview: {select: {title: 'title', subtitle: 'publishedAt', media: 'coverImage'}},
})
