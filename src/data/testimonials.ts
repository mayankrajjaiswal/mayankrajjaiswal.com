export interface Testimonial {
  id: string;
  /** Verbatim quote. Do not paraphrase or embellish. */
  quote: string;
  /** Full name of the person giving the recommendation. */
  author: string;
  /** Their role at the time of writing, e.g. "Engineering Manager". */
  role: string;
  /** Their organisation, e.g. "Thales Group". */
  company: string;
  /**
   * Optional link that lets a reader verify the quote themselves — normally the
   * permalink to the LinkedIn recommendation. Strongly recommended: an
   * unverifiable testimonial carries far less weight, especially on a site whose
   * subject matter is trust and security.
   */
  sourceUrl?: string;
}

/**
 * Real, attributable recommendations only.
 *
 * The Testimonials section auto-hides while this array is empty, so the site
 * never shows an empty or half-finished block — adding the first entry is what
 * makes the section appear.
 *
 * To add one: copy the text verbatim from the LinkedIn recommendation (or ask
 * the person for written permission first if it was given privately), and
 * include `sourceUrl` wherever a public permalink exists.
 */
export const testimonials: Testimonial[] = [];
