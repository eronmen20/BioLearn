"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, FlaskConical, ShieldAlert, Sparkles, CheckCircle2, ChevronRight, BookOpen } from "lucide-react";
import { useLangStore } from "@/lib/lang-store";

interface BiochemProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule?: "food" | "enzyme";
}

export function BiochemProcedureModal({
  isOpen,
  onClose,
  activeModule = "food",
}: BiochemProcedureModalProps) {
  const { lang } = useLangStore();

  const isFood = activeModule === "food";

  const data = isFood
    ? {
        title: lang === "en" ? "Qualitative Food Biomolecule Testing" : "Uji Kualitatif Biomolekul Makanan",
        subtitle:
          lang === "en"
            ? "Laboratory standard procedures for identifying starch, proteins, reducing sugars, and lipids."
            : "Prosedur standar laboratorium untuk mengidentifikasi amilum, protein, gula pereduksi, dan lipid.",
        diffBadge: lang === "en" ? "🟡 Medium" : "🟡 Sedang",
        tools:
          lang === "en"
            ? [
                "Glass test tubes",
                "Virtual test tube rack",
                "Dropper pipette",
                "Boiling water bath (100°C)",
                "Test tube clamp",
                "Mixer / vortex shaker",
              ]
            : [
                "Tabung reaksi kaca",
                "Rak tabung reaksi virtual",
                "Pipet tetes kaca",
                "Penangas air mendidih (100°C)",
                "Penjepit tabung reaksi",
                "Tabung pengocok / vortex",
              ],
        materials:
          lang === "en"
            ? [
                "Lugol's reagent (Iodine/KI)",
                "Biuret reagent (CuSO₄ + NaOH)",
                "Benedict's reagent",
                "Ethanol 95%",
                "Distilled water (Aquades)",
                "Predefined food extracts",
              ]
            : [
                "Reagen Lugol (Iodium/KI)",
                "Reagen Biuret (CuSO₄ + NaOH)",
                "Reagen Benedict",
                "Etanol 95%",
                "Akuades (Air Suling)",
                "Ekstrak sampel bahan makanan",
              ],
        steps:
          lang === "en"
            ? [
                {
                  step: 1,
                  title: "Sample Preparation",
                  desc: "Take a clean test tube from the virtual rack and transfer 2 mL of the food sample extract you wish to investigate.",
                },
                {
                  step: 2,
                  title: "Diagnostic Reagent Selection",
                  desc: "Select the specific reagent suited to your target biomolecule: Lugol for starch, Biuret for proteins, Benedict for reducing sugars, or Ethanol for lipids.",
                },
                {
                  step: 3,
                  title: "Dispense Reagent",
                  desc: "Position the dropper pipette directly over the selected test tube and dispense 3–5 drops of the diagnostic reagent.",
                },
                {
                  step: 4,
                  title: "Special Reaction Treatments",
                  desc: "For Benedict's test, heat the tube in a boiling water bath (100°C) for 2–3 minutes. For the lipid emulsion test, add equal volume of distilled water and shake vigorously.",
                },
                {
                  step: 5,
                  title: "Observe Color & Emulsion Transition",
                  desc: "Carefully inspect the visual liquid appearance, color shifts, precipitate formation, or emulsion turbidity in the test tube.",
                },
                {
                  step: 6,
                  title: "Interpret & Record to Journal",
                  desc: "Compare observed colors against standard laboratory indicator criteria, evaluate qualitative diagnostic status, and log the findings to your scientific lab report.",
                },
              ]
            : [
                {
                  step: 1,
                  title: "Persiapan Sampel Uji",
                  desc: "Ambil tabung reaksi bersih dari rak tabung dan masukkan 2 mL larutan ekstrak bahan makanan yang ingin diuji.",
                },
                {
                  step: 2,
                  title: "Pemilihan Reagen Diagnostik",
                  desc: "Tentukan biomolekul target dan pilih reagen yang sesuai: Lugol untuk amilum, Biuret untuk protein, Benedict untuk gula pereduksi, atau Etanol untuk lipid.",
                },
                {
                  step: 3,
                  title: "Teteskan Reagen Uji",
                  desc: "Arahkan pipet tetes tepat di atas mulut tabung reaksi terpilih lalu teteskan 3–5 tetes larutan reagen penguji.",
                },
                {
                  step: 4,
                  title: "Perlakuan Reaksi Khusus",
                  desc: "Untuk uji Benedict, panaskan tabung dalam penangas air mendidih (100°C) selama 2–3 menit. Untuk uji emulsi lemak, tambahkan akuades sama banyak lalu kocok tabung reaksi.",
                },
                {
                  step: 5,
                  title: "Amati Perubahan Warna & Emulsi",
                  desc: "Amati perubahan visual warna larutan, terbentuknya endapan warna, atau timbulnya kekeruhan emulsi pada tabung reaksi.",
                },
                {
                  step: 6,
                  title: "Interpretasi & Catat ke Jurnal",
                  desc: "Bandingkan warna teramati dengan tabel standar reaksi laboratorium, tentukan simpulan kualitatif, lalu simpan ke lembar jurnal praktikum.",
                },
              ],
        tableRows: [
          {
            reagent: lang === "en" ? "Lugol (Iodine)" : "Lugol (Iodium)",
            target: lang === "en" ? "Starch (Amylose)" : "Amilum / Pati",
            posColor: "#1e1b4b",
            posText: lang === "en" ? "Blue-black / Deep Navy" : "Biru Kehitaman / Pekat",
            negText: lang === "en" ? "Amber / Yellow (Reagent color)" : "Kuning / Cokelat Reagen",
          },
          {
            reagent: "Biuret",
            target: lang === "en" ? "Peptide Bonds (Protein)" : "Ikatan Peptida (Protein)",
            posColor: "#7c3aed",
            posText: lang === "en" ? "Violet / Purple Complex" : "Ungu / Violet Khas",
            negText: lang === "en" ? "Light Blue (Reagent baseline)" : "Biru Muda Terang",
          },
          {
            reagent: "Benedict",
            target: lang === "en" ? "Reducing Sugars (Monosaccharides)" : "Gula Pereduksi",
            posColor: "#ea580c",
            posText: lang === "en" ? "Green → Yellow → Brick Red" : "Hijau → Kuning → Merah Bata",
            negText: lang === "en" ? "Clear Blue (No precipitate)" : "Biru Jernih (Tanpa endapan)",
          },
          {
            reagent: lang === "en" ? "Ethanol Emulsion" : "Emulsi Etanol",
            target: lang === "en" ? "Lipids / Triglycerides" : "Lemak / Lipid",
            posColor: "#f1f5f9",
            posText: lang === "en" ? "Milky white cloudy emulsion" : "Emulsi putih keruh seperti susu",
            negText: lang === "en" ? "Clear transparent solution" : "Larutan jernih homogen",
          },
        ],
        safety:
          lang === "en"
            ? "Wear lab coats and safety goggles. Handle Biuret reagent with care (contains concentrated sodium hydroxide). Use safety tongs when transferring heated tubes from the water bath."
            : "Gunakan jas lab dan kacamata pelindung. Tangani reagen Biuret secara hati-hati (mengandung natrium hidroksida kuat). Selalu gunakan penjepit tabung saat mengambil tabung dari penangas air panas.",
      }
    : {
        title: lang === "en" ? "Enzyme Kinetics & Catalysis Lab" : "Praktikum Kinetika & Reaksi Enzim",
        subtitle:
          lang === "en"
            ? "Laboratory standard procedures for investigating temperature, pH, and substrate concentration on enzyme activity."
            : "Prosedur standar laboratorium untuk menyelidiki pengaruh suhu, pH, dan konsentrasi terhadap aktivitas enzim.",
        diffBadge: lang === "en" ? "🟡 Medium" : "🟡 Sedang",
        tools:
          lang === "en"
            ? [
                "Digital spectrophotometer",
                "Temperature-controlled incubator",
                "Digital pH meter",
                "Enzyme reaction cuvettes",
                "Precision micropipettes",
                "Chronometer / timer",
              ]
            : [
                "Spektrofotometer digital",
                "Inkubator suhu terkontrol",
                "pH meter digital",
                "Kuvet reaksi enzimatik",
                "Mikropipet presisi",
                "Kronometer / pencatat waktu",
              ],
        materials:
          lang === "en"
            ? [
                "Salivary/pancreatic Amylase",
                "Gastric Pepsin / Protease",
                "Pancreatic Lipase",
                "Starch / Protein / Lipid substrates",
                "Buffer solutions (pH 2.0 to 10.0)",
                "Enzyme-stopping reagents",
              ]
            : [
                "Amilase saliva/pankreas",
                "Protease / Pepsin",
                "Lipase pankreas",
                "Substrat pati / protein / lipid",
                "Larutan penyangga buffer (pH 2.0–10.0)",
                "Reagen penghenti reaksi enzim",
              ],
        steps:
          lang === "en"
            ? [
                {
                  step: 1,
                  title: "Enzyme & Substrate Selection",
                  desc: "Select the specific biological enzyme (Amylase, Protease, or Lipase) and ensure the complementary macromolecule substrate is loaded.",
                },
                {
                  step: 2,
                  title: "Environmental Conditions Setup",
                  desc: "Adjust reaction temperature (0–80°C) and pH level (1–14) to assess physiological optima versus denaturation limits.",
                },
                {
                  step: 3,
                  title: "Concentration & Duration Configuration",
                  desc: "Configure initial substrate concentration [S], enzyme concentration [E], and simulated incubation period (5–60 minutes).",
                },
                {
                  step: 4,
                  title: "Execute Catalytic Reaction",
                  desc: "Start the reaction run and watch the simulated Michaelis-Menten kinetics, product generation, and substrate depletion progress.",
                },
                {
                  step: 5,
                  title: "Analyze & Export Hydrolyzed Aliquots",
                  desc: "Examine peak reaction velocity (v), temperature denaturation, and transfer the digested sample back to the Food Lab for confirmation testing.",
                },
              ]
            : [
                {
                  step: 1,
                  title: "Pemilihan Enzim & Substrat",
                  desc: "Pilih enzim hidrolase spesifik (Amilase, Protease, atau Lipase) dan pastikan substrat biomolekul yang cocok telah dimuat.",
                },
                {
                  step: 2,
                  title: "Pengaturan Suhu & pH Reaksi",
                  desc: "Atur suhu reaksi (0–80°C) dan derajat keasaman pH (1–14) untuk menyelidiki titik optimum aktivitas dan batas denaturasi enzim.",
                },
                {
                  step: 3,
                  title: "Konfigurasi Konsentrasi & Waktu",
                  desc: "Tentukan konsentrasi awal substrat [S], konsentrasi enzim [E], serta durasi waktu reaksi (5–60 menit).",
                },
                {
                  step: 4,
                  title: "Jalankan Reaksi Katalisis",
                  desc: "Mulai simulasi reaksi dan amati kinetika Michaelis-Menten, laju pembentukan produk, serta pengurangan substrat.",
                },
                {
                  step: 5,
                  title: "Analisis Kinetika & Uji Ulang Alikuot",
                  desc: "Evaluasi laju kecepatan reaksi (v), amati dampak denaturasi termal, dan kirim alikuot hasil hidrolisis ke Lab Makanan untuk uji ulang.",
                },
              ],
        tableRows: [
          {
            reagent: lang === "en" ? "Amylase" : "Amilase",
            target: lang === "en" ? "Starch → Maltose & Glucose" : "Pati → Maltosa & Glukosa",
            posColor: "#3b82f6",
            posText: lang === "en" ? "Optimum ~37°C, pH 6.8" : "Optimum ~37°C, pH 6.8",
            negText: lang === "en" ? "Denatures >60°C or pH <4.5" : "Denaturasi >60°C atau pH <4.5",
          },
          {
            reagent: lang === "en" ? "Protease (Pepsin)" : "Protease (Pepsin)",
            target: lang === "en" ? "Proteins → Peptides / Amino Acids" : "Protein → Peptida & Asam Amino",
            posColor: "#8b5cf6",
            posText: lang === "en" ? "Optimum ~37°C, pH 2.0" : "Optimum ~37°C, pH 2.0",
            negText: lang === "en" ? "Inactivated in neutral/alkaline pH" : "Inaktif pada pH netral/basa",
          },
          {
            reagent: lang === "en" ? "Lipase" : "Lipase",
            target: lang === "en" ? "Triglycerides → Fatty Acids & Glycerol" : "Trigliserida → Asam Lemak & Gliserol",
            posColor: "#10b981",
            posText: lang === "en" ? "Optimum ~37°C, pH 8.0" : "Optimum ~37°C, pH 8.0",
            negText: lang === "en" ? "Denatures >55°C or acidic pH" : "Denaturasi >55°C atau pH asam",
          },
        ],
        safety:
          lang === "en"
            ? "Maintain strict temperature stabilization. Store biological enzyme stock solutions on ice prior to incubation to preserve catalytic conformation."
            : "Jaga stabilitas suhu penangas. Selalu simpan stok larutan enzim biologis dalam wadah es sebelum direaksikan agar konformasi katalitik tetap terjaga.",
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Dialog Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative w-full max-w-3xl bg-surface border border-border shadow-2xl rounded-3xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-border bg-gradient-to-r from-bg-alt/70 via-surface to-bg-alt/40 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 text-white flex items-center justify-center font-extrabold text-xl shadow-sm shrink-0">
                  📋
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-ink">{data.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber/15 text-ink border border-amber/30">
                      {data.diffBadge}
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-tight mt-0.5">{data.subtitle}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-bg-alt hover:bg-border text-muted hover:text-ink flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close procedure"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-ink">
              {/* Tools & Materials Box */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-accent" />
                  <span>{lang === "en" ? "Apparatus & Materials" : "Alat & Bahan Praktikum"}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Tools */}
                  <div className="p-3.5 rounded-2xl bg-bg-alt/60 border border-border/60">
                    <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-2">
                      🧰 {lang === "en" ? "Apparatus & Tools" : "Alat Laboratorium"}
                    </span>
                    <ul className="space-y-1.5 text-xs text-ink/80">
                      {data.tools.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Materials */}
                  <div className="p-3.5 rounded-2xl bg-bg-alt/60 border border-border/60">
                    <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-2">
                      🧪 {lang === "en" ? "Reagents & Solutions" : "Bahan & Reagen"}
                    </span>
                    <ul className="space-y-1.5 text-xs text-ink/80">
                      {data.materials.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Procedure */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <span>
                    {lang === "en"
                      ? `Work Protocol (${data.steps.length} Steps)`
                      : `Langkah Praktikum (${data.steps.length} Langkah Kerja)`}
                  </span>
                </h4>
                <ol className="space-y-2.5">
                  {data.steps.map((s) => (
                    <li
                      key={s.step}
                      className="flex items-start gap-3 p-3 rounded-2xl bg-bg-alt/50 border border-border/50 hover:border-accent/30 transition-colors"
                    >
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-accent to-purple-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                        {s.step}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-xs font-bold text-ink leading-snug">{s.title}</p>
                        <p className="text-xs text-muted leading-relaxed mt-0.5">{s.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Standard Indicators Reference Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>{lang === "en" ? "Standard Reaction Indicators" : "Tabel Standar Indikator Reaksi"}</span>
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-border shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-bg-alt text-muted text-[11px] uppercase font-bold border-b border-border">
                      <tr>
                        <th className="p-2.5 sm:p-3">{lang === "en" ? "Reagent / Test" : "Reagen Uji"}</th>
                        <th className="p-2.5 sm:p-3">{lang === "en" ? "Target" : "Target Biomolekul"}</th>
                        <th className="p-2.5 sm:p-3">{lang === "en" ? "Positive Observation" : "Hasil Positif (+)"}</th>
                        <th className="p-2.5 sm:p-3">{lang === "en" ? "Negative Observation" : "Hasil Negatif (-)"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {data.tableRows.map((row, i) => (
                        <tr key={i} className="hover:bg-bg-alt/40 transition-colors">
                          <td className="p-2.5 sm:p-3 font-bold text-ink whitespace-nowrap">{row.reagent}</td>
                          <td className="p-2.5 sm:p-3 text-muted">{row.target}</td>
                          <td className="p-2.5 sm:p-3 font-bold text-ink">
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                                style={{ backgroundColor: row.posColor }}
                              />
                              <span>{row.posText}</span>
                            </span>
                          </td>
                          <td className="p-2.5 sm:p-3 text-muted">{row.negText}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lab Safety Warning Note */}
              <div className="p-4 rounded-2xl bg-amber/10 border-2 border-amber/30 text-xs leading-relaxed flex items-start gap-3 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-amber/20 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <strong className="block font-extrabold text-ink text-xs mb-1">
                    {lang === "en" ? "Laboratory Safety Note (K3):" : "Keselamatan Kerja Laboratorium (K3):"}
                  </strong>
                  <p className="text-ink/80 text-xs leading-relaxed font-medium">
                    {data.safety}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer with Close Button */}
            <div className="p-4 border-t border-border bg-bg-alt/40 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-muted">
                {lang === "en" ? "Follow steps in sequence for authentic results." : "Ikuti langkah sesuai urutan untuk hasil yang valid."}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent-dark transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {lang === "en" ? "Close Procedure" : "Tutup Prosedur"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
