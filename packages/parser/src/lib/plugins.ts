import type { Article, Section } from './config';
import type { ParserPlugin } from './parser';

export const trimPlugin: ParserPlugin = (input) => ({
  ...input,
  sections: input.sections.map((section) => ({
    ...section,
    header: section.header?.trim(),
    body: section.body?.trim(),
    attributes: section.attributes.map((attribute) => ({
      key: attribute.key?.trim(),
      value: typeof attribute.value === 'string' ? attribute.value.trim() : attribute.value,
    })),
  })),
});

export const createDequotationPlugin = (quotations: Array<[string, string]>): ParserPlugin => {
  const _removeQuotation = (str: string | undefined) => {
    if (!str) return str;
    for (const [quotationStart, quotationEnd] of quotations) {
      if (str.startsWith(quotationStart) && str.endsWith(quotationEnd)) {
        return str.slice(quotationStart.length, -quotationEnd.length);
      }
    }
    return str;
  };
  return (input) => ({
    ...input,
    sections: input.sections.map((section) => ({
      ...section,
      header: _removeQuotation(section.header),
      body: _removeQuotation(section.body),
      attributes: section.attributes.map((attribute) => ({
        key: _removeQuotation(attribute.key),
        value: typeof attribute.value === 'string' ? _removeQuotation(attribute.value) : attribute.value,
      })),
    })),
  });
};

export const attributePlugin: ParserPlugin = (input) => ({
  ...input,
  sections: input.sections.map((section) => ({
    ...section,
    attributes: section.attributes.map((attribute) => {
      if (attribute.value === undefined) return attribute;
      return {
        key: attribute.key,
        value: ['true', 'True', 'TRUE'].includes(attribute.value.toString())
          ? true
          : ['false', 'False', 'FALSE'].includes(attribute.value.toString())
          ? false
          : attribute.value !== '' && !isNaN(Number(attribute.value))
          ? Number(attribute.value)
          : attribute.value,
      };
    }),
  })),
});

export const commentPlugin: ParserPlugin = (input) => ({
  ...input,
  sections: input.sections.map((section) => {
    if (section.body !== undefined) return section;
    return {
      ...section,
      header: 'comment',
      body: section.comment,
    };
  }),
});

export interface ArticleWithAssets<T> extends Article {
  sections: Array<SectionWithAssets<T>>;
  assets?: Array<T>;
}

export interface SectionWithAssets<T> extends Section {
  assets?: Array<T>;
}
