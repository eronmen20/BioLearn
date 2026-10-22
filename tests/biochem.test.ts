import "./env.ts";
import assert from "node:assert/strict";
import test from "node:test";

const {
  PREDEFINED_SAMPLES,
  ENZYME_DEFINITIONS,
  runBiochemicalTest,
  simulateEnzymeKinetics,
  calculateTemperatureFactor,
  calculatePhFactor,
  createDigestedFoodSample,
} = await import("@/lib/biochem-engine");

test("Food tests: Lugol detects starch accurately", () => {
  const starchRes = runBiochemicalTest(PREDEFINED_SAMPLES.starch_sol, "lugol");
  assert.equal(starchRes.qualitativeResult, "positive");
  assert.equal(starchRes.colorHex, "#161b33"); // deep blue-black

  const eggRes = runBiochemicalTest(PREDEFINED_SAMPLES.egg_white, "lugol");
  assert.equal(eggRes.qualitativeResult, "negative");
});

test("Food tests: Biuret detects proteins (peptide bonds)", () => {
  const eggRes = runBiochemicalTest(PREDEFINED_SAMPLES.egg_white, "biuret");
  assert.equal(eggRes.qualitativeResult, "positive");
  assert.equal(eggRes.colorHex, "#5f27cd"); // violet

  const starchRes = runBiochemicalTest(PREDEFINED_SAMPLES.starch_sol, "biuret");
  assert.equal(starchRes.qualitativeResult, "negative");
});

test("Food tests: Benedict requires heating and detects reducing sugars", () => {
  // Without heat, should be inconclusive / invalid
  const coldRes = runBiochemicalTest(PREDEFINED_SAMPLES.fruit_juice, "benedict", { heated: false });
  assert.equal(coldRes.qualitativeResult, "inconclusive");
  assert.equal(coldRes.heated, false);

  // With heat, fruit juice (rich in fructose/glucose) must give brick-red positive
  const hotFruit = runBiochemicalTest(PREDEFINED_SAMPLES.fruit_juice, "benedict", { heated: true });
  assert.equal(hotFruit.qualitativeResult, "positive");
  assert.equal(hotFruit.colorHex, "#c0392b"); // brick-red

  // Pure starch has negligible reducing sugars -> negative
  const hotStarch = runBiochemicalTest(PREDEFINED_SAMPLES.starch_sol, "benedict", { heated: true });
  assert.equal(hotStarch.qualitativeResult, "negative");
});

test("Food tests: Lipid Emulsion requires water addition step", () => {
  // Unmixed with water
  const unmixed = runBiochemicalTest(PREDEFINED_SAMPLES.vegetable_oil, "emulsion", { mixedWithWater: false });
  assert.equal(unmixed.qualitativeResult, "inconclusive");

  // Mixed with water -> positive milky emulsion
  const oilRes = runBiochemicalTest(PREDEFINED_SAMPLES.vegetable_oil, "emulsion", { mixedWithWater: true });
  assert.equal(oilRes.qualitativeResult, "positive");
  assert.equal(oilRes.colorHex, "#f5f6fa");

  // Starch solution has no lipids -> negative
  const starchRes = runBiochemicalTest(PREDEFINED_SAMPLES.starch_sol, "emulsion", { mixedWithWater: true });
  assert.equal(starchRes.qualitativeResult, "negative");
});

test("Enzyme Kinetics: Temperature response & denaturation", () => {
  const amylase = ENZYME_DEFINITIONS.amylase;

  // Optimum temperature (~37°C) factor should be ~1.0
  const optFactor = calculateTemperatureFactor(37, amylase.optimumTemp, amylase.denaturationTemp);
  assert.ok(optFactor > 0.9 && optFactor <= 1.05);

  // Cold temperature (4°C) slows reaction significantly
  const coldFactor = calculateTemperatureFactor(4, amylase.optimumTemp, amylase.denaturationTemp);
  assert.ok(coldFactor < 0.3);

  // Boiling / Denaturing temperature (75°C) drops activity to 0
  const denatFactor = calculateTemperatureFactor(75, amylase.optimumTemp, amylase.denaturationTemp);
  assert.equal(denatFactor, 0.0);
});

test("Enzyme Kinetics: pH sensitivity bell curve", () => {
  const amylase = ENZYME_DEFINITIONS.amylase;

  // Optimum pH (~6.8) factor is ~1.0
  const optPh = calculatePhFactor(6.8, amylase.optimumPh, amylase.phTolerance);
  assert.ok(optPh > 0.95);

  // Extreme acid (pH 2) destroys amylase activity
  const acidPh = calculatePhFactor(2.0, amylase.optimumPh, amylase.phTolerance);
  assert.ok(acidPh < 0.1);

  // Extreme base (pH 12) destroys amylase activity
  const basePh = calculatePhFactor(12.0, amylase.optimumPh, amylase.phTolerance);
  assert.ok(basePh < 0.05);
});

test("Enzyme Kinetics: Substrate depletion over time", () => {
  const result = simulateEnzymeKinetics("amylase", {
    temperature: 37,
    ph: 6.8,
    substrateConc: 50,
    enzymeConc: 50,
    durationMinutes: 30,
  });

  assert.equal(result.isDenatured, false);
  assert.ok(result.conversionPercent > 60);
  assert.ok(result.finalSubstrate < 20);
  assert.ok(result.finalProduct > 30);
  assert.equal(result.timeSeries.length, 61);
});

test("Cross-Module Integration: Digested starch changes subsequent food test results", () => {
  const originalStarch = PREDEFINED_SAMPLES.starch_sol;

  // 1. Initial tests on starch
  const initialLugol = runBiochemicalTest(originalStarch, "lugol");
  const initialBenedict = runBiochemicalTest(originalStarch, "benedict", { heated: true });
  assert.equal(initialLugol.qualitativeResult, "positive"); // blue-black
  assert.equal(initialBenedict.qualitativeResult, "negative"); // blue

  // 2. Digest with amylase at 37°C, pH 6.8 for 30 minutes
  const reaction = simulateEnzymeKinetics("amylase", {
    temperature: 37,
    ph: 6.8,
    substrateConc: originalStarch.composition.starch,
    enzymeConc: 80,
    durationMinutes: 30,
  });

  const digestedSample = createDigestedFoodSample(originalStarch, "amylase", reaction);

  // 3. Re-test digested sample
  const postLugol = runBiochemicalTest(digestedSample, "lugol");
  const postBenedict = runBiochemicalTest(digestedSample, "benedict", { heated: true });

  // Starch was hydrolyzed!
  // Lugol becomes trace or negative, Benedict becomes positive!
  assert.ok(postLugol.qualitativeResult !== "positive");
  assert.equal(postBenedict.qualitativeResult, "positive");
  assert.ok(digestedSample.composition.reducing_sugar > 2.0);
});
