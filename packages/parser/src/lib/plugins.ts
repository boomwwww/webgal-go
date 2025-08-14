import type { Article, Section } from './config';
import type { ParserPlugin } from './parser';

export const trimPlugin: ParserPlugin = (input) => ({
  ...input,
  sections: input.sections.map((section) => ({
    ...section,
    header: section.header.trim(),
    body: section.body.trim(),
    attributes: section.attributes.map((attribute) => ({
      key: attribute.key.trim(),
      value: typeof attribute.value === 'string' ? attribute.value.trim() : attribute.value,
    })),
  })),
});

export const createDequotationPlugin = (quotations: Array<[string, string]>): ParserPlugin => {
  const removeQuotation = (str: string) => {
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
      header: removeQuotation(section.header),
      body: removeQuotation(section.body),
      attributes: section.attributes.map((attribute) => ({
        key: removeQuotation(attribute.key),
        value: typeof attribute.value === 'string' ? removeQuotation(attribute.value) : attribute.value,
      })),
    })),
  });
};

export const attributePlugin: ParserPlugin = (input) => ({
  ...input,
  sections: input.sections.map((section) => ({
    ...section,
    attributes: section.attributes.map((attribute) => ({
      key: attribute.key,
      value: ['true', 'True', 'TRUE'].includes(attribute.value.toString())
        ? true
        : ['false', 'False', 'FALSE'].includes(attribute.value.toString())
        ? false
        : attribute.value !== '' && !isNaN(Number(attribute.value))
        ? Number(attribute.value)
        : attribute.value,
    })),
  })),
});

export interface ArticleWithAssets<T> extends Article {
  // todo
  sections: Array<SectionWithAssets<T>>;
  assets?: Array<T>;
}

interface SectionWithAssets<T> extends Section {
  assets?: Array<T>;
}
