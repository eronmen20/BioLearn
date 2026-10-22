/**
 * BioChem Lab — Internationalization Dictionary (ID & EN)
 */

export interface BiochemTranslations {
  // Navigation & Headers
  labTitle: string;
  labSubtitle: string;
  labDescription: string;
  tabOverview: string;
  tabFoodTest: string;
  tabEnzyme: string;
  tabReport: string;
  estimatedTime: string;
  safetyNote: string;
  safetyNoteText: string;
  learningObjectivesTitle: string;
  objectives: string[];
  
  // Modes
  modeGuided: string;
  modeFree: string;
  modeGuidedDesc: string;
  modeFreeDesc: string;
  
  // Food Testing
  foodTestTitle: string;
  foodTestSubtitle: string;
  selectSample: string;
  selectReagent: string;
  transferSample: string;
  addReagent: string;
  heatWaterBath: string;
  addWaterMix: string;
  resetBench: string;
  recordObservation: string;
  viewExplanation: string;
  sendToEnzymeLab: string;
  tubeRackTitle: string;
  emptyTube: string;
  reagentLugolName: string;
  reagentBiuretName: string;
  reagentBenedictName: string;
  reagentEmulsionName: string;
  reagentLugolDesc: string;
  reagentBiuretDesc: string;
  reagentBenedictDesc: string;
  reagentEmulsionDesc: string;

  // Enzyme Lab
  enzymeLabTitle: string;
  enzymeLabSubtitle: string;
  selectEnzyme: string;
  reactionConditionsTitle: string;
  tempLabel: string;
  phLabel: string;
  substrateConcLabel: string;
  enzymeConcLabel: string;
  durationLabel: string;
  startReaction: string;
  pauseReaction: string;
  resetReaction: string;
  reactionProgress: string;
  chartSubstrateProduct: string;
  chartRateVsTemp: string;
  chartRateVsPh: string;
  currentRate: string;
  substrateRemaining: string;
  productFormed: string;
  conversionYield: string;
  compareConditions: string;
  sendDigestedToFoodTest: string;

  // Lab Report
  reportTitle: string;
  reportSubtitle: string;
  tabObservationLog: string;
  tabFullReport: string;
  exportCsv: string;
  printReport: string;
  saveReport: string;
  clearLog: string;
  noObservationsYet: string;
  studentNameLabel: string;
  dateLabel: string;
  researchQuestionLabel: string;
  hypothesisLabel: string;
  independentVarLabel: string;
  dependentVarLabel: string;
  controlledVarLabel: string;
  materialsLabel: string;
  procedureLabel: string;
  discussionLabel: string;
  conclusionLabel: string;
  limitationsLabel: string;

  // Checkpoints
  checkpointTitle: string;
  checkAnswer: string;
  retry: string;
  correctBadge: string;
  incorrectBadge: string;
}

export const BIOCHEM_I18N: { id: BiochemTranslations; en: BiochemTranslations } = {
  id: {
    labTitle: "BioChem Lab",
    labSubtitle: "Investigasi Biomolekul & Kinetika Reaksi Enzim",
    labDescription:
      "Laboratorium biokimia virtual interaktif untuk mengidentifikasi biomolekul pangan, menguji kinetika enzim, serta membuktikan bagaimana enzim mentransformasi molekul penopang kehidupan.",
    tabOverview: "Ikhtisar Lab",
    tabFoodTest: "1. Uji Biomolekul Pangan",
    tabEnzyme: "2. Reaksi Enzimatis",
    tabReport: "3. Hasil & Laporan Praktikum",
    estimatedTime: "Estimasi Waktu: 20–30 Menit",
    safetyNote: "Catatan Simulasi Laboratorium",
    safetyNoteText:
      "Simulasi ini menggunakan model komputasi matematis deterministik untuk tujuan pembelajaran. Di laboratorium fisik nyata, gunakan selalu jas lab, kacamata pelindung, dan hindari kontak langsung dengan reagen korosif (seperti NaOH pada Biuret).",
    learningObjectivesTitle: "Tujuan Pembelajaran Khusus",
    objectives: [
      "Mengidentifikasi karbohidrat (pati & gula pereduksi), protein, dan lipid menggunakan reagen biokimia yang tepat.",
      "Memahami prinsip kimiawi dan batasan uji kualitatif bahan makanan.",
      "Menjelaskan spesifisitas enzim dan pengaruh faktor lingkungan (suhu, pH, konsentrasi substrat/enzim).",
      "Menghubungkan digesti enzimatik dengan perubahan hasil uji biomolekul pada sampel makanan yang sama.",
      "Menyusun laporan praktikum ilmiah terstruktur dengan pemisahan data, analisis, dan simpulan yang tepat.",
    ],
    modeGuided: "Mode Terpandu (Guided Investigation)",
    modeFree: "Mode Eksplorasi Bebas (Free Lab)",
    modeGuidedDesc: "Ikuti langkah investigasi terstruktur: Buktikan hidrolisis amilum menjadi maltosa oleh enzim amilase.",
    modeFreeDesc: "Eksplorasi bebas: Pilih sampel mana saja, atur parameter suhu 0–80°C dan pH 1–14 sesukamu.",
    
    // Food Testing
    foodTestTitle: "Uji Kualitatif Biomolekul Pangan",
    foodTestSubtitle: "Lakukan uji biokimia pada tabung reaksi virtual untuk mendeteksi kandungan makronutrien.",
    selectSample: "Pilih Sampel Makanan",
    selectReagent: "Pilih Reagen Uji",
    transferSample: "Isi Tabung Reaksi",
    addReagent: "Teteskan Reagen",
    heatWaterBath: "Panaskan Penangas Air (Water Bath)",
    addWaterMix: "Kocok & Tambah Akuades",
    resetBench: "Kosongkan Rak Tabung",
    recordObservation: "Catat ke Jurnal Pengamatan",
    viewExplanation: "Penjelasan Ilmiah",
    sendToEnzymeLab: "Bawa Alikuot ke Lab Enzim ➡️",
    tubeRackTitle: "Rak Tabung Reaksi Virtual",
    emptyTube: "Tabung Kosong",
    reagentLugolName: "Reagen Lugol (Iodin / I₂-KI)",
    reagentBiuretName: "Reagen Biuret (CuSO₄ + NaOH)",
    reagentBenedictName: "Reagen Benedict (CuSO₄ Basa)",
    reagentEmulsionName: "Uji Emulsi Etanol (Etanol + Air)",
    reagentLugolDesc: "Mendeteksi ikatan heliks amilosa pada pati/amilum (menghasilkan warna biru-kehitaman).",
    reagentBiuretDesc: "Mendeteksi ikatan peptida pada rantai protein polipeptida (menghasilkan warna ungu/violet).",
    reagentBenedictDesc: "Mendeteksi gula pereduksi bebas; WAJIB dipanaskan dalam penangas air (menghasilkan endapan hijau-merah bata).",
    reagentEmulsionDesc: "Mendeteksi lipid/lemak melalui pelarutan dalam etanol dan presipitasi emulsi putih keruh dalam air.",

    // Enzyme Lab
    enzymeLabTitle: "Simulasi Kinetika Reaksi Enzim",
    enzymeLabSubtitle: "Atur parameter fisikokimia dan amati laju reaksi, penipisan substrat, serta pembentukan produk secara real-time.",
    selectEnzyme: "Pilih Enzim",
    reactionConditionsTitle: "Parameter Kondisi Reaksi",
    tempLabel: "Suhu Reaksi (°C)",
    phLabel: "Derajat Keasaman (pH)",
    substrateConcLabel: "Konsentrasi Substrat [S] (mM)",
    enzymeConcLabel: "Konsentrasi Enzim [E] (nM)",
    durationLabel: "Durasi Reaksi (Menit)",
    startReaction: "Mulai Reaksi",
    pauseReaction: "Jeda",
    resetReaction: "Atur Ulang",
    reactionProgress: "Progres Kinetika Reaksi",
    chartSubstrateProduct: "Dinamika Substrat [S] & Produk [P] terhadap Waktu",
    chartRateVsTemp: "Profil Laju Awal v₀ vs Suhu (°C)",
    chartRateVsPh: "Profil Laju Awal v₀ vs pH",
    currentRate: "Laju Awal v₀",
    substrateRemaining: "Substrat Tersisa",
    productFormed: "Produk Terbentuk",
    conversionYield: "Efisiensi Konversi",
    compareConditions: "Bandingkan 2 Kondisi Eksperimen",
    sendDigestedToFoodTest: "🧪 Bawa Hasil Digesti ke Uji Makanan",

    // Lab Report
    reportTitle: "Jurnal & Laporan Praktikum Virtual",
    reportSubtitle: "Rekam jejak pengamatan laboratorium dan susun laporan ilmiah lengkap yang siap cetak atau ekspor.",
    tabObservationLog: "Tabel Data Pengamatan",
    tabFullReport: "Lembar Laporan Praktikum",
    exportCsv: "Ekspor CSV Data",
    printReport: "Cetak / Simpan PDF",
    saveReport: "Simpan Laporan",
    clearLog: "Bersihkan Jurnal",
    noObservationsYet: "Belum ada pengamatan yang dicatat. Lakukan uji makanan atau reaksi enzim lalu klik 'Catat Pengamatan'.",
    studentNameLabel: "Nama Praktikan / Kelompok",
    dateLabel: "Tanggal Praktikum",
    researchQuestionLabel: "Rumusan Masalah",
    hypothesisLabel: "Hipotesis Ilmiah",
    independentVarLabel: "Variabel Bebas (Independent Variable)",
    dependentVarLabel: "Variabel Terikat (Dependent Variable)",
    controlledVarLabel: "Variabel Kontrol (Controlled Variables)",
    materialsLabel: "Alat dan Bahan / Reagen Virtual",
    procedureLabel: "Ringkasan Langkah Kerja (Prosedur)",
    discussionLabel: "Pembahasan Hasil & Analisis Data",
    conclusionLabel: "Kesimpulan Ilmiah",
    limitationsLabel: "Keterbatasan Model Komputasi & Sumber Ketidakpastian",

    // Checkpoints
    checkpointTitle: "Pertanyaan Uji Pemahaman",
    checkAnswer: "Periksa Jawaban",
    retry: "Coba Lagi",
    correctBadge: "Tepat Sekali! 🎉",
    incorrectBadge: "Belum Tepat 🤔",
  },
  en: {
    labTitle: "BioChem Lab",
    labSubtitle: "Food Biomolecule & Enzyme Reaction Investigation",
    labDescription:
      "Interactive virtual biochemistry laboratory to identify food biomolecules, explore enzyme kinetics, and discover how biological reactions transform the molecules of life.",
    tabOverview: "Lab Overview",
    tabFoodTest: "1. Food Biomolecule Testing",
    tabEnzyme: "2. Enzyme Kinetics Lab",
    tabReport: "3. Results & Lab Report",
    estimatedTime: "Estimated Duration: 20–30 Minutes",
    safetyNote: "Virtual Simulation Note",
    safetyNoteText:
      "This simulation implements deterministic computational models for educational inquiry. In physical wet laboratories, always wear PPE (lab coat, goggles) and avoid skin contact with corrosive reagents (such as NaOH in Biuret).",
    learningObjectivesTitle: "Primary Learning Objectives",
    objectives: [
      "Identify carbohydrates (starch & reducing sugars), proteins, and lipids using standard qualitative biochemical assays.",
      "Understand the chemical principles and diagnostic boundaries of qualitative food tests.",
      "Explain enzyme-substrate specificity and the influence of temperature, pH, substrate and enzyme concentrations.",
      "Directly connect enzymatic digestion with altered subsequent food test profiles on the same biological sample.",
      "Construct a structured scientific lab report differentiating raw observations, quantitative kinetic trends, and valid conclusions.",
    ],
    modeGuided: "Guided Investigation",
    modeFree: "Free Exploration Lab",
    modeGuidedDesc: "Follow a step-by-step investigation: Discover how amylase enzyme converts complex starch into reducing maltose sugar.",
    modeFreeDesc: "Free laboratory bench: Select any food sample or pure substrate, fine-tune temperature from 0–80°C and pH from 1–14.",

    // Food Testing
    foodTestTitle: "Qualitative Food Biomolecule Testing",
    foodTestSubtitle: "Perform biochemical assays in virtual test tubes to identify essential macronutrients.",
    selectSample: "Select Food Sample",
    selectReagent: "Select Test Reagent",
    transferSample: "Fill Test Tube",
    addReagent: "Dispense Reagent",
    heatWaterBath: "Heat in Water Bath (~85°C)",
    addWaterMix: "Shake & Dilute with Water",
    resetBench: "Clear Tube Rack",
    recordObservation: "Log Observation",
    viewExplanation: "Scientific Explanation",
    sendToEnzymeLab: "Transfer Aliquot to Enzyme Lab ➡️",
    tubeRackTitle: "Virtual Test Tube Rack",
    emptyTube: "Empty Tube",
    reagentLugolName: "Lugol's Iodine Reagent (I₂-KI)",
    reagentBiuretName: "Biuret Reagent (CuSO₄ + NaOH)",
    reagentBenedictName: "Benedict's Reagent (Alkaline Cu²⁺)",
    reagentEmulsionName: "Ethanol Emulsion Test (Ethanol + Water)",
    reagentLugolDesc: "Detects amylose helical coils in starch (producing deep blue-black color).",
    reagentBiuretDesc: "Detects peptide bonds linking amino acids in proteins (producing violet color).",
    reagentBenedictDesc: "Detects free reducing sugars; REQUIRES heating in a water bath (producing green to brick-red precipitate).",
    reagentEmulsionDesc: "Detects lipids via organic ethanol dissolution followed by milky colloidal precipitate upon water addition.",

    // Enzyme Lab
    enzymeLabTitle: "Enzyme Kinetics Reaction Chamber",
    enzymeLabSubtitle: "Manipulate physicochemical parameters and monitor reaction velocity, substrate depletion, and product yields in real time.",
    selectEnzyme: "Select Enzyme",
    reactionConditionsTitle: "Reaction Conditions",
    tempLabel: "Temperature (°C)",
    phLabel: "Medium Acidity (pH)",
    substrateConcLabel: "Substrate Concentration [S] (mM)",
    enzymeConcLabel: "Enzyme Concentration [E] (nM)",
    durationLabel: "Reaction Duration (Minutes)",
    startReaction: "Start Reaction",
    pauseReaction: "Pause",
    resetReaction: "Reset",
    reactionProgress: "Reaction Kinetic Progress",
    chartSubstrateProduct: "Substrate [S] & Product [P] Dynamics vs Time",
    chartRateVsTemp: "Initial Velocity v₀ vs Temperature (°C)",
    chartRateVsPh: "Initial Velocity v₀ vs pH Profile",
    currentRate: "Initial Rate v₀",
    substrateRemaining: "Residual Substrate",
    productFormed: "Formed Product",
    conversionYield: "Conversion Yield",
    compareConditions: "Compare Two Experimental Runs",
    sendDigestedToFoodTest: "🧪 Send Digested Sample to Food Test Lab",

    // Lab Report
    reportTitle: "Virtual Lab Journal & Report",
    reportSubtitle: "Review empirical observations and generate a comprehensive scientific lab report ready for print or export.",
    tabObservationLog: "Observation Log Table",
    tabFullReport: "Structured Lab Report",
    exportCsv: "Export CSV Data",
    printReport: "Print / Save PDF",
    saveReport: "Save Report",
    clearLog: "Clear Journal",
    noObservationsYet: "No observations recorded yet. Run a food test or enzyme reaction and click 'Log Observation'.",
    studentNameLabel: "Investigator / Student Name",
    dateLabel: "Investigation Date",
    researchQuestionLabel: "Research Question",
    hypothesisLabel: "Working Scientific Hypothesis",
    independentVarLabel: "Independent Variable",
    dependentVarLabel: "Dependent Variable",
    controlledVarLabel: "Controlled Variables",
    materialsLabel: "Materials & Virtual Reagents",
    procedureLabel: "Experimental Procedure Summary",
    discussionLabel: "Scientific Discussion & Kinetic Analysis",
    conclusionLabel: "Empirical Conclusion",
    limitationsLabel: "Computational Model Limitations & Assumptions",

    // Checkpoints
    checkpointTitle: "Concept Mastery Checkpoint",
    checkAnswer: "Verify Answer",
    retry: "Retry",
    correctBadge: "Exact & Defensible! 🎉",
    incorrectBadge: "Reconsider the Mechanism 🤔",
  },
};
