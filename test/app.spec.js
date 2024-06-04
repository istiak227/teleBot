const assert = require("assert");
const { expect } = require("chai");
const { add } = require("./add");

describe("the add fucntion", () => {
  it("should add 2 numbers together", () => {
    const result = add(2, 2);
    expect(result).to.be.equal(4);
  });

  it("should be able to handle one argument", () => {
    const result = add(2);
    expect(result).to.be.equal(2);
  });

  it("should return 0 if anything other than numbers used as argument", () => {
    const result = add(2, true);
    expect(result).to.be.equal(0);
  });
});
