/**
 * BioChem Lab — Scientific Simulation Engine
 * 
 * Implements deterministic biochemical testing logic and enzyme kinetics
 * modeling for biology education.
 * 
 * Theoretical models:
 * 1. Qualitative food biomolecule detection (Lugol, Biuret, Benedict's, Lipid Emulsion)
 * 2. Michaelis-Menten enzyme kinetics modified with:
 *    - Arrhenius temperature activation with thermal denaturation transition
 *    - Double-ionization bell curve for pH dependency
 *    - Numerical time-step integration for substrate depletion and product accumulation
 */

export type BiomoleculeType = "starch" | "reducing_sugar" | "protein" | "lipid";

export interface SampleComposition {
  starch: number;         // Arbitrary normalized units (0 - 100)
  reducing_sugar: number; // g% (approx 0 - 5.0 g/dL)
  protein: number;        // Arbitrary normalized units (0 - 100)
  lipid: number;          // Arbitrary normalized units (0 - 100)
  descriptionId: string;
  descriptionEn: string;
}

export type SampleId =
  | "starch_sol"
  | "bread_extract"
  | "milk"
  | "egg_white"
  | "fruit_juice"
  | "vegetable_oil"
  | "mixed_broth"
  | "digested_aliquot";

export interface FoodSample {
  id: SampleId;
  nameId: string;
  nameEn: string;
  colorHex: string;
  composition: SampleComposition;
  origin: "standard" | "digested";
}

export const PREDEFINED_SAMPLES: Record<Exclude<SampleId, "digested_aliquot">, FoodSample> = {
  starch_sol: {
    id: "starch_sol",
    nameId: "Larutan Pati Murni (1%)",
    nameEn: "Pure Starch Solution (1%)",
    colorHex: "#f1f2f6",
    composition: {
      starch: 85,
      reducing_sugar: 0.05,
      protein: 0,
      lipid: 0,
      descriptionId: "Suspensi amilosa dan amilopektin murni dari pati jagung/kentang.",
      descriptionEn: "Pure suspension of amylose and amylopectin from maize/potato starch.",
    },
    origin: "standard",
  },
  bread_extract: {
    id: "bread_extract",
    nameId: "Ekstrak Roti Tawar",
    nameEn: "White Bread Extract",
    colorHex: "#f8f1e5",
    composition: {
      starch: 70,
      reducing_sugar: 0.4,
      protein: 15,
      lipid: 3,
      descriptionId: "Filtrat roti tawar lumat dalam akuades; kaya karbohidrat kompleks dengan sedikit protein gluten.",
      descriptionEn: "Macerated white bread filtrate in water; rich in complex carbohydrates with trace gluten protein.",
    },
    origin: "standard",
  },
  milk: {
    id: "milk",
    nameId: "Susu Segar (Full Cream)",
    nameEn: "Fresh Whole Milk",
    colorHex: "#ffffff",
    composition: {
      starch: 0,
      reducing_sugar: 1.8, // Laktosa adalah gula pereduksi
      protein: 45,        // Kasein & whey
      lipid: 40,          // Lemak susu
      descriptionId: "Emulsi alami mengandung laktosa (gula pereduksi), protein kasein, dan butiran lemak susu.",
      descriptionEn: "Natural emulsion containing lactose (reducing sugar), casein protein, and milk fat globules.",
    },
    origin: "standard",
  },
  egg_white: {
    id: "egg_white",
    nameId: "Larutan Putih Telur (Albumin)",
    nameEn: "Egg White Solution (Albumin)",
    colorHex: "#fdfefe",
    composition: {
      starch: 0,
      reducing_sugar: 0.1,
      protein: 90,
      lipid: 0,
      descriptionId: "Larutan ovalbumin pekat; kaya ikatan peptida tanpa kandungan karbohidrat maupun lemak.",
      descriptionEn: "Concentrated ovalbumin solution; rich in peptide bonds with negligible carbs or lipids.",
    },
    origin: "standard",
  },
  fruit_juice: {
    id: "fruit_juice",
    nameId: "Sari Buah Apel Segar",
    nameEn: "Fresh Apple Juice",
    colorHex: "#fdeaa8",
    composition: {
      starch: 2,
      reducing_sugar: 3.8, // Fruktosa & glukosa tinggi
      protein: 1,
      lipid: 0,
      descriptionId: "Ekstrak buah kaya monosakarida pereduksi bebas (glukosa dan fruktosa).",
      descriptionEn: "Fruit extract rich in free reducing monosaccharides (glucose and fructose).",
    },
    origin: "standard",
  },
  vegetable_oil: {
    id: "vegetable_oil",
    nameId: "Minyak Nabati (Trigliserida)",
    nameEn: "Vegetable Oil (Triglycerides)",
    colorHex: "#fff2a8",
    composition: {
      starch: 0,
      reducing_sugar: 0,
      protein: 0,
      lipid: 95,
      descriptionId: "Trigliserida murni rantai panjang; hidrofobik dan tidak larut dalam air.",
      descriptionEn: "Pure long-chain triglycerides; hydrophobic and insoluble in pure water.",
    },
    origin: "standard",
  },
  mixed_broth: {
    id: "mixed_broth",
    nameId: "Kaldu Makanan Campuran (Nutrient Broth)",
    nameEn: "Mixed Nutrient Broth",
    colorHex: "#e8d8b8",
    composition: {
      starch: 30,
      reducing_sugar: 1.2,
      protein: 40,
      lipid: 25,
      descriptionId: "Campuran kompleks dari sari daging, kaldu pati, dan lemak sayur.",
      descriptionEn: "Complex mixture of meat bouillon, starch extract, and vegetable lipids.",
    },
    origin: "standard",
  },
};

export type TestId = "lugol" | "biuret" | "benedict" | "emulsion";

export interface TestResult {
  testId: TestId;
  sampleId: string;
  sampleNameId: string;
  sampleNameEn: string;
  testedAt: number;
  heated: boolean;
  mixedWithWater: boolean;
  colorHex: string;
  appearanceId: string;
  appearanceEn: string;
  qualitativeResult: "positive" | "trace" | "negative" | "inconclusive";
  interpretationId: string;
  interpretationEn: string;
  scientificNoteId: string;
  scientificNoteEn: string;
}

/**
 * Simulate Biochemical Food Testing
 */
export function runBiochemicalTest(
  sample: FoodSample,
  testId: TestId,
  options: { heated?: boolean; mixedWithWater?: boolean } = {}
): TestResult {
  const { heated = false, mixedWithWater = false } = options;
  const comp = sample.composition;

  switch (testId) {
    case "lugol": {
      // Deteksi Amilum / Pati
      // Lugol (I2/KI): Baseline cokelat kekuningan (#c98a2c).
      // Positif: Biru tua kehitaman (#1e2749).
      const isPos = comp.starch >= 20;
      const isTrace = comp.starch >= 5 && comp.starch < 20;

      let colorHex = "#c98a2c"; // default yellow-brown
      let appearanceId = "Kuning kecokelatan (warna reagen iodin)";
      let appearanceEn = "Yellow-brown (iodine reagent baseline)";
      let qualitativeResult: TestResult["qualitativeResult"] = "negative";

      if (isPos) {
        colorHex = "#161b33"; // deep blue-black
        appearanceId = "Biru tua kehitaman pekat";
        appearanceEn = "Deep blue-black precipitate / complex";
        qualitativeResult = "positive";
      } else if (isTrace) {
        colorHex = "#3a4a7a"; // faint blue-purple
        appearanceId = "Biru pudar keunguan";
        appearanceEn = "Faint bluish-purple tint";
        qualitativeResult = "trace";
      }

      return {
        testId,
        sampleId: sample.id,
        sampleNameId: sample.nameId,
        sampleNameEn: sample.nameEn,
        testedAt: Date.now(),
        heated,
        mixedWithWater,
        colorHex,
        appearanceId,
        appearanceEn,
        qualitativeResult,
        interpretationId:
          qualitativeResult === "positive"
            ? "Mengandung amilum (pati) dalam konsentrasi tinggi."
            : qualitativeResult === "trace"
            ? "Mengandung sedikit jejak amilum."
            : "Tidak terdeteksi amilum (negatif).",
        interpretationEn:
          qualitativeResult === "positive"
            ? "Contains high concentration of starch (amylose helical complex)."
            : qualitativeResult === "trace"
            ? "Contains trace amounts of starch."
            : "No starch detected (negative).",
        scientificNoteId:
          "Molekul iodin (I3-) terperangkap di dalam heliks amilosa menghasilkan transfer muatan optik yang menyerap spektrum cahaya tampak dan tampak biru-hitam.",
        scientificNoteEn:
          "Triiodide ions slip inside amylose helical spirals, altering light absorption to produce the characteristic blue-black appearance.",
      };
    }

    case "biuret": {
      // Deteksi Ikatan Peptida (Protein)
      // Reagen Biuret: Biru muda baseline (#54a0ff).
      // Positif: Ungu / Violet (#6c5ce7).
      const isPos = comp.protein >= 20;
      const isTrace = comp.protein >= 8 && comp.protein < 20;

      let colorHex = "#74b9ff"; // light blue baseline
      let appearanceId = "Biru muda jernih (warna dasar ion Cu²⁺)";
      let appearanceEn = "Clear light blue (Cu²⁺ ion baseline)";
      let qualitativeResult: TestResult["qualitativeResult"] = "negative";

      if (isPos) {
        colorHex = "#5f27cd"; // vibrant violet/purple
        appearanceId = "Ungu / Violet terang";
        appearanceEn = "Vibrant violet / purple solution";
        qualitativeResult = "positive";
      } else if (isTrace) {
        colorHex = "#a29bfe"; // pale lavender
        appearanceId = "Merah muda keunguan pudar (lavender)";
        appearanceEn = "Pale lavender / pinkish-purple";
        qualitativeResult = "trace";
      }

      return {
        testId,
        sampleId: sample.id,
        sampleNameId: sample.nameId,
        sampleNameEn: sample.nameEn,
        testedAt: Date.now(),
        heated,
        mixedWithWater,
        colorHex,
        appearanceId,
        appearanceEn,
        qualitativeResult,
        interpretationId:
          qualitativeResult === "positive"
            ? "Mengandung protein (memiliki banyak ikatan peptida)."
            : qualitativeResult === "trace"
            ? "Mengandung oligopeptida atau konsentrasi protein rendah."
            : "Tidak terdeteksi protein (negatif).",
        interpretationEn:
          qualitativeResult === "positive"
            ? "Contains proteins (abundant peptide bonds)."
            : qualitativeResult === "trace"
            ? "Contains oligopeptides or low protein concentration."
            : "No protein detected (negative).",
        scientificNoteId:
          "Ion tembaga Cu²⁺ dalam suasana basa membentuk kompleks koordinasi dengan 4 atom nitrogen dari ikatan peptida polipeptida.",
        scientificNoteEn:
          "Cu²⁺ ions in an alkaline environment form coordination complexes with peptide nitrogen atoms, shifting the color to violet.",
      };
    }

    case "benedict": {
      // Deteksi Gula Pereduksi
      // KRITIS: Wajib dipanaskan (heated === true) dalam penangas air!
      if (!heated) {
        return {
          testId,
          sampleId: sample.id,
          sampleNameId: sample.nameId,
          sampleNameEn: sample.nameEn,
          testedAt: Date.now(),
          heated: false,
          mixedWithWater,
          colorHex: "#0984e3", // cold blue
          appearanceId: "Tetap biru bening (BELUM DIPANASKAN)",
          appearanceEn: "Stays clear blue (NOT HEATED YET)",
          qualitativeResult: "inconclusive",
          interpretationId: "Uji tidak valid: Reaksi reduksi tembaga Benedict memerlukan pemanasan (water bath ~80–100°C).",
          interpretationEn: "Invalid test: Benedict's reduction reaction requires heat energy (~80–100°C water bath).",
          scientificNoteId:
            "Reaksi reduksi Cu²⁺ menjadi endapan Cu₂O memiliki energi aktivasi tinggi yang membutuhkan panas untuk berlangsung dalam waktu praktikum.",
          scientificNoteEn:
            "Reduction of cupric (Cu²⁺) to cuprous oxide (Cu₂O) has high activation energy requiring heat to proceed within observable time.",
        };
      }

      const sugar = comp.reducing_sugar;
      let colorHex = "#0984e3"; // blue
      let appearanceId = "Biru terang (tidak ada endapan)";
      let appearanceEn = "Clear blue (no precipitate)";
      let qualitativeResult: TestResult["qualitativeResult"] = "negative";
      let interpretationId = "Tidak ada gula pereduksi terdeteksi (< 0.5 g%).";
      let interpretationEn = "No reducing sugar detected (< 0.5 g%).";

      if (sugar >= 2.5) {
        colorHex = "#c0392b"; // brick-red
        appearanceId = "Endapan merah bata pekat";
        appearanceEn = "Dense brick-red precipitate";
        qualitativeResult = "positive";
        interpretationId = "Kadar gula pereduksi sangat tinggi (> 2.0 g%).";
        interpretationEn = "Very high reducing sugar concentration (> 2.0 g%).";
      } else if (sugar >= 1.5) {
        colorHex = "#e67e22"; // orange
        appearanceId = "Endapan jingga / oranye";
        appearanceEn = "Orange precipitate";
        qualitativeResult = "positive";
        interpretationId = "Kadar gula pereduksi sedang (1.5 - 2.0 g%).";
        interpretationEn = "Moderate reducing sugar concentration (1.5 - 2.0 g%).";
      } else if (sugar >= 0.8) {
        colorHex = "#f1c40f"; // yellow
        appearanceId = "Endapan kuning kehijauan";
        appearanceEn = "Yellow-green precipitate";
        qualitativeResult = "positive";
        interpretationId = "Kadar gula pereduksi rendah (0.8 - 1.5 g%).";
        interpretationEn = "Low reducing sugar concentration (0.8 - 1.5 g%).";
      } else if (sugar >= 0.3) {
        colorHex = "#27ae60"; // green
        appearanceId = "Kehijauan keruh (sedikit endapan)";
        appearanceEn = "Turbid green tint (slight precipitate)";
        qualitativeResult = "trace";
        interpretationId = "Jejak gula pereduksi terdeteksi (0.3 - 0.8 g%).";
        interpretationEn = "Trace reducing sugars detected (0.3 - 0.8 g%).";
      }

      return {
        testId,
        sampleId: sample.id,
        sampleNameId: sample.nameId,
        sampleNameEn: sample.nameEn,
        testedAt: Date.now(),
        heated: true,
        mixedWithWater,
        colorHex,
        appearanceId,
        appearanceEn,
        qualitativeResult,
        interpretationId,
        interpretationEn,
        scientificNoteId:
          "Gugus aldehida atau alfa-hidroksiketon bebas pada gula pereduksi mereduksi Cu²⁺ (biru) menjadi endapan tembaga(I) oksida Cu₂O (merah bata).",
        scientificNoteEn:
          "Free aldehyde or alpha-hydroxyketone groups donate electrons to Cu²⁺, precipitating red/orange cuprous oxide (Cu₂O).",
      };
    }

    case "emulsion": {
      // Uji Emulsi Lemak (Etanol + Air)
      // Sampel dilarutkan dalam etanol, kemudian ditambahkan air.
      // Lipid larut dalam etanol murni, namun saat air ditambahkan, lipid mengendap membentuk emulsi putih keruh.
      if (!mixedWithWater) {
        const isDissolved = comp.lipid > 10;
        return {
          testId,
          sampleId: sample.id,
          sampleNameId: sample.nameId,
          sampleNameEn: sample.nameEn,
          testedAt: Date.now(),
          heated,
          mixedWithWater: false,
          colorHex: isDissolved ? "#f5f6fa" : "#ffffff",
          appearanceId: "Larutan etanol bening (BELUM DITAMBAHKAN AIR)",
          appearanceEn: "Clear ethanol mixture (WATER NOT YET ADDED)",
          qualitativeResult: "inconclusive",
          interpretationId: "Uji belum lengkap: Tambahkan akuades untuk menguji pembentukan emulsi lipid hidrofobik.",
          interpretationEn: "Incomplete test: Add water to precipitate hydrophobic lipid droplets into an emulsion.",
          scientificNoteId:
            "Lipid larut baik dalam pelarut organik non-polar seperti etanol, tetapi tidak larut dalam air.",
          scientificNoteEn:
            "Lipids readily dissolve in organic ethanol but precipitate when diluted with aqueous solvent.",
        };
      }

      const isPos = comp.lipid >= 20;
      const isTrace = comp.lipid >= 5 && comp.lipid < 20;

      let colorHex = "#ecf0f1"; // transparent clear
      let appearanceId = "Larutan jernih homogen tanpa emulsi";
      let appearanceEn = "Homogeneous clear solution without emulsion";
      let qualitativeResult: TestResult["qualitativeResult"] = "negative";

      if (isPos) {
        colorHex = "#f5f6fa"; // milky opaque white
        appearanceId = "Emulsi putih keruh seperti susu (lapisan lemak terpisah di atas)";
        appearanceEn = "Milky white cloudy emulsion with lipid droplet layer";
        qualitativeResult = "positive";
      } else if (isTrace) {
        colorHex = "#dfe4ea";
        appearanceId = "Keruh keputihan tipis";
        appearanceEn = "Faint hazy white turbidity";
        qualitativeResult = "trace";
      }

      return {
        testId,
        sampleId: sample.id,
        sampleNameId: sample.nameId,
        sampleNameEn: sample.nameEn,
        testedAt: Date.now(),
        heated,
        mixedWithWater: true,
        colorHex,
        appearanceId,
        appearanceEn,
        qualitativeResult,
        interpretationId:
          qualitativeResult === "positive"
            ? "Positif mengandung lipid/lemak (membentuk emulsi minyak dalam air)."
            : qualitativeResult === "trace"
            ? "Mengandung sedikit jejak lipid."
            : "Tidak terdeteksi lipid (negatif).",
        interpretationEn:
          qualitativeResult === "positive"
            ? "Positive for lipids (forms milky oil-in-water emulsion)."
            : qualitativeResult === "trace"
            ? "Contains trace amounts of lipids."
            : "No lipid detected (negative).",
        scientificNoteId:
          "Molekul lipid yang sebelumnya terdispersi dalam etanol mendadak mengumpul saat polaritas pelarut meningkat tajam karena penambahan air, memantulkan cahaya tampak sebagai warna putih keruh.",
        scientificNoteEn:
          "Lipids precipitate out of the sudden high-polarity ethanol-water mixture as colloidal droplets that scatter light.",
      };
    }
  }
}

// ─────────────────────────────────────────────────────────────
// ENZYME REACTION ENGINE
// ─────────────────────────────────────────────────────────────

export type EnzymeId = "amylase" | "protease" | "lipase";

export interface EnzymeDefinition {
  id: EnzymeId;
  nameId: string;
  nameEn: string;
  sourceId: string;
  sourceEn: string;
  substrateId: string;
  substrateEn: string;
  substrateType: BiomoleculeType;
  productId: string;
  productEn: string;
  productType: BiomoleculeType;
  optimumTemp: number; // Celsius (~37°C)
  denaturationTemp: number; // Celsius (~65°C)
  optimumPh: number;   // e.g. 6.8 for amylase, 2.0 for pepsin, 8.0 for trypsin/lipase
  phTolerance: number; // bell width
  kcat: number;        // s^-1
  km: number;          // mM
  descriptionId: string;
  descriptionEn: string;
}

export const ENZYME_DEFINITIONS: Record<EnzymeId, EnzymeDefinition> = {
  amylase: {
    id: "amylase",
    nameId: "Amilase (Alfa-Amilase)",
    nameEn: "Amylase (Alpha-Amylase)",
    sourceId: "Kelenjar saliva / pankreas",
    sourceEn: "Salivary glands / pancreas",
    substrateId: "Pati / Amilum",
    substrateEn: "Starch / Amylose",
    substrateType: "starch",
    productId: "Maltosa & Dekstrin (Gula Pereduksi)",
    productEn: "Maltose & Dextrins (Reducing Sugars)",
    productType: "reducing_sugar",
    optimumTemp: 37,
    denaturationTemp: 62,
    optimumPh: 6.8,
    phTolerance: 1.5,
    kcat: 120, // rapid hydrolysis
    km: 15,
    descriptionId:
      "Memotong ikatan alfa-1,4-glikosidik pada amilum secara acak menghasilkan maltosa, maltotriosa, dan dekstrin yang bersifat gula pereduksi.",
    descriptionEn:
      "Cleaves alpha-1,4-glucosidic bonds in starch, generating reducing disaccharides (maltose) and short dextrins.",
  },
  protease: {
    id: "protease",
    nameId: "Protease (Tripsin / Pepsin-like)",
    nameEn: "Protease (Trypsin / Pancreatic Peptidase)",
    sourceId: "Lambung / Pankreas",
    sourceEn: "Gastric / Pancreatic juice",
    substrateId: "Protein (Albumin / Kasein)",
    substrateEn: "Protein (Albumin / Casein)",
    substrateType: "protein",
    productId: "Oligopeptida & Asam Amino",
    productEn: "Peptides & Free Amino Acids",
    productType: "protein", // smaller fragments
    optimumTemp: 37,
    denaturationTemp: 65,
    optimumPh: 7.5,
    phTolerance: 1.8,
    kcat: 85,
    km: 20,
    descriptionId:
      "Menghidrolisis ikatan peptida antara asam amino, memecah protein kompleks menjadi rantai peptida pendek dan asam amino bebas.",
    descriptionEn:
      "Hydrolyzes peptide bonds between amino acid residues, breaking intact proteins down into small oligopeptides and free amino acids.",
  },
  lipase: {
    id: "lipase",
    nameId: "Lipase Pankreas",
    nameEn: "Pancreatic Lipase",
    sourceId: "Cairan pankreas",
    sourceEn: "Pancreatic juice",
    substrateId: "Trigliserida (Lemak)",
    substrateEn: "Triglycerides (Lipids)",
    substrateType: "lipid",
    productId: "Asam Lemak Bebas & Gliserol",
    productEn: "Free Fatty Acids & Glycerol",
    productType: "lipid",
    optimumTemp: 37,
    denaturationTemp: 60,
    optimumPh: 8.0,
    phTolerance: 1.6,
    kcat: 95,
    km: 25,
    descriptionId:
      "Menghidrolisis ikatan ester pada trigliserida menghasilkan asam lemak bebas dan gliserol, yang menurunkan densitas emulsi dan mengasamkan medium.",
    descriptionEn:
      "Cleaves ester bonds in triglycerides to liberate free fatty acids and glycerol, reducing emulsion density and acidifying the medium.",
  },
};

export interface ReactionConditions {
  temperature: number; // 0 - 80 °C
  ph: number;          // 1 - 14
  substrateConc: number; // 0 - 100 mM (or normalized units)
  enzymeConc: number;    // 0 - 100 nM (or normalized units)
  durationMinutes: number; // 0 - 60 minutes
}

export interface ReactionTimePoint {
  timeMinutes: number;
  substrate: number;  // [S]
  product: number;    // [P]
  rate: number;       // velocity v
}

export interface ReactionSimulationResult {
  enzyme: EnzymeDefinition;
  conditions: ReactionConditions;
  initialRate: number; // v0 (mM/min)
  finalSubstrate: number;
  finalProduct: number;
  conversionPercent: number;
  temperatureFactor: number;
  phFactor: number;
  isDenatured: boolean;
  isColdInhibited: boolean;
  timeSeries: ReactionTimePoint[];
  explanationId: string;
  explanationEn: string;
}

/**
 * Temperature activity factor f(T)
 * Combines Arrhenius activation rate with steep thermal denaturation transition
 */
export function calculateTemperatureFactor(tempC: number, optTemp: number, denatTemp: number): number {
  if (tempC <= 0) return 0.02; // very slow molecular movement, reversible

  // Arrhenius factor (Q10 approx 2 up to optimum)
  const tempK = tempC + 273.15;
  const optK = optTemp + 273.15;
  
  // Activation curve up to optimum
  const activation = Math.exp(0.045 * (tempC - optTemp));

  // Denaturation sigmoid above optimum
  // Around denatTemp, protein undergoes irreversible conformational collapse
  const kDenat = 0.35;
  const denaturation = 1 / (1 + Math.exp(kDenat * (tempC - (optTemp + (denatTemp - optTemp) * 0.7))));

  // High temperature hard cutoff (complete thermal unraveling of active site)
  if (tempC >= 75) return 0.00;
  if (tempC >= 68) return 0.04;

  const raw = activation * denaturation;
  // Normalize so that at optTemp, factor is ~1.0
  const optNorm = 1 / (1 + Math.exp(kDenat * (optTemp - (optTemp + (denatTemp - optTemp) * 0.7))));
  return Math.max(0, Math.min(1.05, raw / optNorm));
}

/**
 * pH activity factor f(pH)
 * Modeled via classic Michaelis double-ionization bell curve
 */
export function calculatePhFactor(ph: number, optPh: number, tolerance: number): number {
  // Bell-shaped curve centered around optPh
  const diff = ph - optPh;
  const variance = Math.pow(tolerance / 1.6, 2);
  const factor = Math.exp(-Math.pow(diff, 2) / (2 * variance));

  // Extreme pH causes acid/base irreversible denaturation
  if (ph < 2.0 && optPh > 4.0) return 0.01;
  if (ph > 11.5) return 0.01;

  return Math.max(0, Math.min(1.0, factor));
}

/**
 * Run Enzyme Kinetics Simulation over Time
 */
export function simulateEnzymeKinetics(
  enzymeId: EnzymeId,
  conditions: ReactionConditions,
  sampleStartingComposition?: SampleComposition
): ReactionSimulationResult {
  const enzyme = ENZYME_DEFINITIONS[enzymeId];
  const { temperature, ph, substrateConc, enzymeConc, durationMinutes } = conditions;

  // Environmental factors
  const tempFactor = calculateTemperatureFactor(temperature, enzyme.optimumTemp, enzyme.denaturationTemp);
  const phFactor = calculatePhFactor(ph, enzyme.optimumPh, enzyme.phTolerance);

  const isDenatured = temperature >= enzyme.denaturationTemp;
  const isColdInhibited = temperature <= 10;

  // Scaled effective Vmax = kcat * [E] * f(T) * f(pH)
  const effectiveVmax = (enzyme.kcat * (enzymeConc / 50)) * tempFactor * phFactor * 0.15; // normalized scaling

  // Initial velocity v0 via Michaelis-Menten
  const initialRate = substrateConc > 0
    ? (effectiveVmax * substrateConc) / (enzyme.km + substrateConc)
    : 0;

  // Numerical simulation over duration
  const steps = 60; // 60 time points for smooth charts
  const dt = durationMinutes / steps;
  let currentS = substrateConc;
  let currentP = 0;

  const timeSeries: ReactionTimePoint[] = [
    { timeMinutes: 0, substrate: currentS, product: 0, rate: initialRate }
  ];

  for (let i = 1; i <= steps; i++) {
    const t = i * dt;
    // Current rate depends on remaining substrate
    const v = currentS > 0
      ? (effectiveVmax * currentS) / (enzyme.km + currentS)
      : 0;

    const deltaP = Math.min(currentS, v * dt);
    currentS = Math.max(0, currentS - deltaP);
    currentP += deltaP;

    timeSeries.push({
      timeMinutes: Math.round(t * 10) / 10,
      substrate: Math.round(currentS * 100) / 100,
      product: Math.round(currentP * 100) / 100,
      rate: Math.round(v * 100) / 100,
    });
  }

  const finalSubstrate = timeSeries[timeSeries.length - 1].substrate;
  const finalProduct = timeSeries[timeSeries.length - 1].product;
  const conversionPercent = substrateConc > 0
    ? Math.round((finalProduct / substrateConc) * 100)
    : 0;

  // Pedagogical Explanation
  let explanationId = "";
  let explanationEn = "";

  if (isDenatured) {
    explanationId = `Pada suhu ${temperature}°C, enzim mengalami denaturasi termal. Ikatan hidrogen dan interaksi non-kovalen pada struktur tersier enzim rusak, merusak geometri sisi aktif secara permanen sehingga laju reaksi mendekati nol.`;
    explanationEn = `At ${temperature}°C, the enzyme underwent thermal denaturation. Hydrogen and hydrophobic bonds stabilizing the tertiary structure collapsed, permanently deforming the active site.`;
  } else if (phFactor < 0.2) {
    explanationId = `Kondisi pH ${ph} sangat jauh dari optimum (${enzyme.optimumPh}). Ionisasi gugus fungsi R pada sisi aktif terganggu, mengubah muatan listrik dan melemahkan pengikatan substrat.`;
    explanationEn = `A pH of ${ph} is far from the enzyme's optimum (${enzyme.optimumPh}). The altered ionization states of critical active-site amino acids disrupt electrostatic binding with the substrate.`;
  } else if (isColdInhibited) {
    explanationId = `Suhu rendah (${temperature}°C) menurunkan energi kinetik molekul substrat dan enzim, sehingga frekuensi tumbukan efektif sangat rendah meski sisi aktif tidak rusak.`;
    explanationEn = `Low temperature (${temperature}°C) lowers the kinetic energy of reactant molecules, decreasing effective collision frequency without denaturing the active site.`;
  } else {
    explanationId = `Kondisi reaksi mendekati optimum (Suhu ${temperature}°C, pH ${ph}). Enzim bekerja efisien mengonversi ${conversionPercent}% substrat menjadi produk.`;
    explanationEn = `Reaction conditions are close to optimum (${temperature}°C, pH ${ph}). The enzyme efficiently converted ${conversionPercent}% of substrate into product.`;
  }

  return {
    enzyme,
    conditions,
    initialRate: Math.round(initialRate * 100) / 100,
    finalSubstrate: Math.round(finalSubstrate * 100) / 100,
    finalProduct: Math.round(finalProduct * 100) / 100,
    conversionPercent,
    temperatureFactor: Math.round(tempFactor * 100) / 100,
    phFactor: Math.round(phFactor * 100) / 100,
    isDenatured,
    isColdInhibited,
    timeSeries,
    explanationId,
    explanationEn,
  };
}

/**
 * Generate a Digested Food Sample Aliquot from Enzyme Reaction Results
 * This dynamically creates a new food sample that can be taken back to the Food Lab bench!
 */
export function createDigestedFoodSample(
  originalSample: FoodSample,
  enzymeId: EnzymeId,
  reactionResult: ReactionSimulationResult
): FoodSample {
  const comp = { ...originalSample.composition };
  const conv = reactionResult.conversionPercent / 100; // fraction 0 - 1.0

  if (enzymeId === "amylase") {
    // Starch decreases, reducing sugar increases proportionally!
    const digestedStarch = comp.starch * conv;
    comp.starch = Math.max(0, comp.starch - digestedStarch);
    // 10 units of starch generates ~0.6 g% of maltose (reducing sugar)
    comp.reducing_sugar += (digestedStarch / 10) * 0.6;
    comp.reducing_sugar = Math.min(5.0, Math.round(comp.reducing_sugar * 100) / 100);
    comp.descriptionId = `Hasil digesti ${originalSample.nameId} dengan amilase (${reactionResult.conditions.temperature}°C, pH ${reactionResult.conditions.ph}). Amilum terurai menjadi maltosa.`;
    comp.descriptionEn = `Digested ${originalSample.nameEn} with amylase (${reactionResult.conditions.temperature}°C, pH ${reactionResult.conditions.ph}). Starch hydrolyzed into maltose.`;
  } else if (enzymeId === "protease") {
    // Protein intact level decreases into smaller peptides
    const digestedProtein = comp.protein * conv;
    comp.protein = Math.max(0, comp.protein - (digestedProtein * 0.65));
    comp.descriptionId = `Hasil digesti ${originalSample.nameId} dengan protease (${reactionResult.conditions.temperature}°C, pH ${reactionResult.conditions.ph}). Protein terhidrolisis menjadi oligopeptida.`;
    comp.descriptionEn = `Digested ${originalSample.nameEn} with protease (${reactionResult.conditions.temperature}°C, pH ${reactionResult.conditions.ph}). Proteins cleaved into short peptides.`;
  } else if (enzymeId === "lipase") {
    // Lipid level decreases into free fatty acids
    const digestedLipid = comp.lipid * conv;
    comp.lipid = Math.max(0, comp.lipid - (digestedLipid * 0.7));
    comp.descriptionId = `Hasil digesti ${originalSample.nameId} dengan lipase (${reactionResult.conditions.temperature}°C, pH ${reactionResult.conditions.ph}). Trigliserida terurai menjadi asam lemak dan gliserol.`;
    comp.descriptionEn = `Digested ${originalSample.nameEn} with lipase (${reactionResult.conditions.temperature}°C, pH ${reactionResult.conditions.ph}). Triglycerides hydrolyzed to free fatty acids.`;
  }

  return {
    id: "digested_aliquot",
    nameId: `Produk Reaksi: ${originalSample.nameId} + ${ENZYME_DEFINITIONS[enzymeId].nameId}`,
    nameEn: `Digested Aliquot: ${originalSample.nameEn} + ${ENZYME_DEFINITIONS[enzymeId].nameEn}`,
    colorHex: comp.reducing_sugar > 1.5 ? "#f1c40f" : originalSample.colorHex,
    composition: comp,
    origin: "digested",
  };
}

// ─────────────────────────────────────────────────────────────
// LAB OBSERVATION LOG & REPORT STRUCTURES
// ─────────────────────────────────────────────────────────────

export interface ObservationLogEntry {
  id: string;
  timestamp: number;
  type: "food_test" | "enzyme_reaction";
  titleId: string;
  titleEn: string;
  sampleName: string;
  testOrEnzyme: string;
  conditionsSummary: string;
  observationId: string;
  observationEn: string;
  interpretationId: string;
  interpretationEn: string;
  resultBadge: string;
  colorHex?: string;
}

export interface VirtualLabReport {
  title: string;
  studentName: string;
  date: string;
  researchQuestion: string;
  hypothesis: string;
  independentVariable: string;
  dependentVariable: string;
  controlledVariables: string;
  materialsAndReagents: string;
  procedureSummary: string;
  discussion: string;
  conclusion: string;
  modelLimitations: string;
}

export const DEFAULT_LAB_REPORT: VirtualLabReport = {
  title: "Laporan Praktikum: Uji Biomolekul & Kinetika Enzim",
  studentName: "",
  date: new Date().toISOString().split("T")[0],
  researchQuestion: "Bagaimana hidrolisis enzimatik amilase terhadap pati mengubah karakteristik uji Lugol dan uji Benedict pada sampel makanan?",
  hypothesis: "Jika larutan pati dihidrolisis oleh enzim amilase pada suhu 37°C dan pH 6.8, maka kadar amilum akan menurun (uji Lugol memudar/negatif) dan kadar gula pereduksi maltosa akan meningkat (uji Benedict membentuk endapan jingga/merah bata).",
  independentVariable: "Waktu reaksi dan variasi suhu/pH penambahan enzim amilase",
  dependentVariable: "Perubahan warna uji kualitatif Lugol (pati) dan uji Benedict (gula pereduksi)",
  controlledVariables: "Konsentrasi substrat awal, volume reagen penguji, waktu pemanasan penangas air",
  materialsAndReagents: "Tabung reaksi, rak tabung, reagen Lugol (I2/KI), reagen Biuret, reagen Benedict, etanol 95%, penangas air, enzim alfa-amilase, termometer digital, pH meter.",
  procedureSummary: "1. Siapkan sampel pati dan uji awal dengan Lugol & Benedict.\n2. Buat alikuot reaksi dengan penambahan amilase pada kondisi 37°C pH 6.8 selama 15 menit.\n3. Ambil produk digesti dan uji ulang menggunakan Lugol dan Benedict (dengan pemanasan).\n4. Bandingkan hasil sebelum dan sesudah digesti.",
  discussion: "",
  conclusion: "",
  modelLimitations: "Model kinetika menggunakan aproksimasi Michaelis-Menten deterministik dengan respon temperatur dan pH ideal. Pada realitas laboratorium, aktivitas enzim dapat dipengaruhi oleh kofaktor ion klorida (Cl-), kemurnian sediaan enzim, dan heterogenitas suspensi bahan pangan.",
};
