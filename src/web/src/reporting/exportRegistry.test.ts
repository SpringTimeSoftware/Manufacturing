import { describe, expect, it } from "vitest";
import { createDelimitedText } from "./exportRegistry";

describe("createDelimitedText", () => {
  it("quotes values that contain delimiters", () => {
    const text = createDelimitedText(
      [
        { header: "Code", value: (record: { code: string }) => record.code },
        { header: "Description", value: (record: { description: string }) => record.description }
      ],
      [{ code: "FG-OZ-50", description: "Tank, large assembly" }],
      ","
    );

    expect(text).toContain("\"Tank, large assembly\"");
  });
});
