import { type ParserPlugin } from './config'
import { concat } from './utils'

export const trimPlugin: ParserPlugin = (inputArticle) => ({
  ...inputArticle,
  sections: inputArticle.sections.map((section) => ({
    ...section,
    header: section.header?.trim(),
    body: section.body?.trim(),
    attributes: section.attributes.map((attribute) => ({
      key: attribute.key?.trim(),
      value: typeof attribute.value === 'string' ? attribute.value.trim() : attribute.value,
    })),
  })),
})

export const createDequotationPlugin = (quotations: Array<[string, string]>): ParserPlugin => {
  const _removeQuotation = (str: string | undefined) => {
    if (!str) return str
    for (const [quotationStart, quotationEnd] of quotations) {
      if (str.startsWith(quotationStart) && str.endsWith(quotationEnd)) {
        return str.slice(quotationStart.length, -quotationEnd.length)
      }
    }
    return str
  }
  return (inputArticle) => ({
    ...inputArticle,
    sections: inputArticle.sections.map((section) => ({
      ...section,
      header: _removeQuotation(section.header),
      body: _removeQuotation(section.body),
      attributes: section.attributes.map((attribute) => ({
        key: _removeQuotation(attribute.key),
        value: typeof attribute.value === 'string' ? _removeQuotation(attribute.value) : attribute.value,
      })),
    })),
  })
}

export const attributePlugin: ParserPlugin = (inputArticle) => ({
  ...inputArticle,
  sections: inputArticle.sections.map((section) => ({
    ...section,
    attributes: section.attributes.map((attribute) => {
      if (attribute.value === undefined) return attribute
      return {
        key: attribute.key,
        value: ['true', 'True', 'TRUE'].includes(attribute.value.toString())
          ? true
          : ['false', 'False', 'FALSE'].includes(attribute.value.toString())
          ? false
          : attribute.value !== '' && !isNaN(Number(attribute.value))
          ? Number(attribute.value)
          : attribute.value,
      }
    }),
  })),
})

export const undefinedPlugin: ParserPlugin = (inputArticle) => ({
  ...inputArticle,
  sections: inputArticle.sections.map((section) => ({
    ...section,
    header: concat(section.header),
    body: concat(section.body),
    attributes: section.attributes.map((attribute) => ({
      key: concat(attribute.key),
      value: attribute.value === undefined ? true : attribute.value,
    })),
    comment: concat(section.comment),
  })),
})
