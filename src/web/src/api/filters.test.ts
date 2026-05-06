import { describe, expect, it } from "vitest";
import { serializeFilters } from "./filters";

describe("serializeFilters", () => {
  it("omits empty values and serializes arrays as repeated keys", () => {
    const value = serializeFilters({
      page: 1,
      pageSize: 25,
      search: "laser",
      status: "",
      keys: ["bom", "wo"]
    });

    expect(value).toBe("page=1&pageSize=25&search=laser&keys=bom&keys=wo");
  });
});
