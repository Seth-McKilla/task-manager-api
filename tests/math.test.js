const { calculateTip } = require("../src/math");

test("Calculate total with custom tip amount", () => {
  const total = calculateTip(10, 0.3);
  expect(total).toBe(13);
});

test("Calculate total using default tip amount", () => {
  const total = calculateTip(10);
  expect(total).toBe(12.5);
});
