function cleanHtmlAttributes(html: string): string {
  // Remove class attributes
  let cleaned = html.replace(/\s+class="[^"]*"/gi, '');
  
  // Remove id attributes
  cleaned = cleaned.replace(/\s+id="[^"]*"/gi, '');
  
  // Remove data attributes (data-*)
  cleaned = cleaned.replace(/\s+data-[^=]*="[^"]*"/gi, '');
  
  // Remove srcset attributes
  cleaned = cleaned.replace(/\s+srcset="[^"]*"/gi, '');
  
  // Remove alt attributes
  cleaned = cleaned.replace(/\s+alt="[^"]*"/gi, '');
  
  // Remove loading attributes
  cleaned = cleaned.replace(/\s+loading="[^"]*"/gi, '');
  
  // Remove decoding attributes
  cleaned = cleaned.replace(/\s+decoding="[^"]*"/gi, '');
  
  // Remove sizes attributes
  cleaned = cleaned.replace(/\s+sizes="[^"]*"/gi, '');
  
  // Remove style attributes
  cleaned = cleaned.replace(/\s+style="[^"]*"/gi, '');
  
  // Remove full SVG elements
  cleaned = cleaned.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');
  
  return cleaned;
}

export default cleanHtmlAttributes;