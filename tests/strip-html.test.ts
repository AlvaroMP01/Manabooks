import { describe, expect, it } from "vitest";

import { stripHtml } from "@/lib/utils/strip-html";

describe("stripHtml", () => {
  it("returns null when input is null", () => {
    expect(stripHtml(null)).toBeNull();
  });

  it("returns null when input is undefined", () => {
    expect(stripHtml(undefined)).toBeNull();
  });

  it("returns null when input is an empty string", () => {
    expect(stripHtml("")).toBeNull();
  });

  it("returns null when input is whitespace only", () => {
    expect(stripHtml("   \t\n  ")).toBeNull();
  });

  it("strips simple tags: <p>hello</p> -> 'hello'", () => {
    expect(stripHtml("<p>hello</p>")).toBe("hello");
  });

  it("strips nested tags: <p><b>x</b> <i>y</i></p> -> 'x y'", () => {
    expect(stripHtml("<p><b>x</b> <i>y</i></p>")).toBe("x y");
  });

  it("strips self-closing and odd tags: <br/> and <hr> -> spaces (collapsed)", () => {
    const result = stripHtml("a<br/>b<hr>c");
    expect(result).toBe("a b c");
  });

  it("decodes named entities: &amp; &lt; &gt; &quot; &apos; &nbsp;", () => {
    expect(stripHtml("a &amp; b &lt; c &gt; d &quot;e&quot; f&apos;s g&nbsp;h")).toBe(
      `a & b < c > d "e" f's g h`
    );
  });

  it("decodes numeric entities: &#39; and &#x27; both decode to single-quote", () => {
    expect(stripHtml("it&#39;s")).toBe("it's");
    expect(stripHtml("it&#x27;s")).toBe("it's");
  });

  it("does NOT double-decode &amp;lt; (output remains literal &lt;, per &amp;-last order)", () => {
    expect(stripHtml("&amp;lt;")).toBe("&lt;");
  });

  it("collapses multiple whitespace runs to single space", () => {
    expect(stripHtml("a   b\n\nc\td")).toBe("a b c d");
  });

  it("trims leading and trailing whitespace", () => {
    expect(stripHtml("  hello world  ")).toBe("hello world");
  });

  it("handles a realistic Google Books HTML sample (paragraph + bold + entity)", () => {
    const input =
      "<p><b>Harry Potter</b> is a series of seven fantasy novels written by <i>J.K. Rowling</i>. It&#x27;s a &quot;classic&quot; &amp; beloved story.</p>";
    const result = stripHtml(input);
    expect(result).toBe(
      `Harry Potter is a series of seven fantasy novels written by J.K. Rowling . It's a "classic" & beloved story.`
    );
  });
});
