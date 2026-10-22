"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Zap,
  Activity,
  Layers,
  FlaskConical,
  CheckCircle2,
  Clock,
  Gauge,
  Compass,
  ArrowRight,
} from "lucide-react";

interface DigestiveInteractiveProps {
  lang: "id" | "en";
}

type TabType = "organ" | "transit" | "stimulus" | "enzim";

interface OrganDetail {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  badge: string;
  badgeEn: string;
  desc: string;
  descEn: string;
  enzymes: string[];
  enzymesEn: string[];
  stimulus: string;
  stimulusEn: string;
  criticalAnalysis: string;
  criticalAnalysisEn: string;
}

const ORGANS: OrganDetail[] = [
  {
    id: "mulut",
    name: "Mulut & Kelenjar Saliva",
    nameEn: "Mouth & Salivary Glands",
    emoji: "👄",
    badge: "Mekanis & Kimiawi Awal",
    badgeEn: "Mechanical & Initial Chemical",
    desc: "Gigi memotong dan mengunyah makanan (mastikasi), lidah membolak-balik dan membentuk bolus makanan, serta 3 pasang kelenjar ludah (parotis, submandibularis, sublingualis) mensekresi saliva berpelumas musin.",
    descEn: "Teeth masticate food, tongue manipulates and shapes the food bolus, and 3 pairs of salivary glands secrete mucus-lubricated saliva.",
    enzymes: [
      "Ptialin (Alfa-Amilase Saliva) - memutus ikatan alfa-1,4 amilum menjadi maltosa & dekstrin (pH optimum 6.8–7.0)",
      "Lisozim & Antibodi IgA - melisiskan dinding sel bakteri patogen sebagai pertahanan kimiawi",
    ],
    enzymesEn: [
      "Salivary Amylase (Ptyalin) - cleaves alpha-1,4 starch bonds into maltose & dextrin (optimal pH 6.8–7.0)",
      "Lysozyme & Secretory IgA - lyses bacterial cell walls as chemical defense",
    ],
    stimulus: "Aroma, visual rasa makanan, serta sentuhan mekanik kunyah merangsang saraf kranial parasimpatis memicu sekresi saliva.",
    stimulusEn: "Aroma, food sight, and masticatory mechanoreceptors stimulate cranial parasympathetic nerves to trigger salivation.",
    criticalAnalysis: "Mengapa mengunyah nasi putih perlahan-lahan menghasilkan rasa manis di lidah? Enzim ptialin menghidrolisis ikatan glikosidik amilum yang hambar menjadi maltosa, yaitu disakarida yang berasa manis alami.",
    criticalAnalysisEn: "Why does chewing white rice slowly taste sweet? Salivary ptyalin hydrolyzes tasteless starch chains into maltose, a naturally sweet-tasting disaccharide.",
  },
  {
    id: "epiglotis",
    name: "Faring & Katup Epiglotis",
    nameEn: "Pharynx & Epiglottic Gate",
    emoji: "🛡️",
    badge: "Gerbang Pemisah Saluran",
    badgeEn: "Airway Crossing Valve",
    desc: "Persimpangan anatomis antara saluran pernapasan (laring/trakea) di bagian anterior dan saluran pencernaan (esofagus) di bagian posterior. Epiglotis bertindak sebagai katup tulang rawan elastis pelindung laring.",
    descEn: "Anatomical crossing between the anterior airway (larynx/trachea) and posterior digestive tract (esophagus). The epiglottis functions as an elastic cartilaginous safety valve.",
    enzymes: ["Tidak ada enzim pencernaan (saluran transit refleks)"],
    enzymesEn: ["No digestive enzymes (reflex transit channel)"],
    stimulus: "Sentuhan bolus makanan pada dinding orofaring memicu pusat menelan di medula oblongata mengawali refleks deglutisi involunter.",
    stimulusEn: "Bolus contact with oropharyngeal mechanoreceptors triggers the swallowing center in medulla oblongata, initiating deglutition.",
    criticalAnalysis: "Saat seseorang berbicara atau tertawa sambil makan, pita suara terbuka dan epiglotis terlambat menutup laring. Bolus makanan dapat masuk ke trakea dan segera memicu refleks batuk eksplosif protektif untuk mencegah asfiksia.",
    criticalAnalysisEn: "Talking or laughing while eating keeps vocal cords open, delaying epiglottic closure. Food slips into the trachea, triggering an explosive protective cough reflex to prevent asphyxiation.",
  },
  {
    id: "esofagus",
    name: "Kerongkongan (Esofagus) & LES",
    nameEn: "Esophagus & LES Sphincter",
    emoji: "🔄",
    badge: "Pendorong Motilitas Peristaltik",
    badgeEn: "Peristaltic Motility Driver",
    desc: "Tabung muskular sepanjang ~25 cm dengan 4 lapisan konsentris. Memiliki sfingter gastroesofageal (LES) di perbatasan lambung yang berkontraksi tonik untuk mencegah regurgitasi refluks asam.",
    descEn: "A ~25 cm muscular tube with 4 concentric layers. Features the Lower Esophageal Sphincter (LES) maintaining tonic pressure against acid reflux.",
    enzymes: ["Musin (lendir pelicin gesekan bolus tanpa aktivitas hidrolisis)"],
    enzymesEn: ["Mucin (lubricating mucus protecting mucosal epithelium)"],
    stimulus: "Peregangan dinding lumen esofagus oleh bolus mengaktifkan Pleksus Auerbach memicu gelombang kontraksi peristaltik primer dan sekunder.",
    stimulusEn: "Esophageal wall distension by bolus activates Auerbach plexus, firing primary and secondary peristaltic waves.",
    criticalAnalysis: "Bahkan jika seseorang menelan makanan dalam posisi terbalik atau di ruang angkasa tanpa gravitasi, bolus tetap dapat tiba di lambung karena didorong oleh gelombang aktif kontraksi otot melingkar dan longitudinal.",
    criticalAnalysisEn: "Even upside down or in zero gravity, peristaltic contractions push the food bolus safely into the stomach through active muscular coordination.",
  },
  {
    id: "lambung",
    name: "Lambung (Ventrikulus)",
    nameEn: "Stomach (Ventrikel)",
    emoji: "🫄",
    badge: "Digesti Kimiawi Protein & Asam",
    badgeEn: "Protein Hydrolysis & Acid Chyme",
    desc: "Organ kantung berotot tebal dengan lipatan rugae internal. Sel parietal memproduksi Asam Klorida (HCl pekat pH 1.5–2.0) & Faktor Intrinsik; sel chief memproduksi pepsinogen; sel mukoid memproduksi lendir alkali protektif.",
    descEn: "Muscular J-shaped reservoir with rugae folds. Parietal cells secrete HCl (pH 1.5–2.0) & Intrinsic Factor; chief cells secrete pepsinogen; mucoid cells secrete an alkaline barrier.",
    enzymes: [
      "Pepsin (diaktifkan HCl dari pepsinogen) - memotong protein jadi pepton",
      "Lipase Gastrik - hidrolisis lipid minor rantai pendek",
      "Renin - menggumpalkan kasein susu pada mamalia muda",
    ],
    enzymesEn: [
      "Pepsin (activated from pepsinogen by HCl) - cleaves proteins into peptones",
      "Gastric Lipase - minor short-chain lipid hydrolysis",
      "Rennin - curdles milk casein in young mammals",
    ],
    stimulus: "Stimulus sefalik (aroma/pikiran) + distensi mekanik dinding lambung + peptida makanan merangsang pelepasan hormon Gastrin dari sel G.",
    stimulusEn: "Cephalic cues + gastric wall stretch + dietary peptides stimulate Gastrin release from G cells.",
    criticalAnalysis: "Mengapa dinding lambung tidak mencerna dirinya sendiri? Lapisan mukus tebal yang kaya ion bikarbonat (HCO₃⁻) menciptakan mantel netral (pH ~7.0) tepat di atas membran sel epitel, menahan asam pH 1.5 di lumen.",
    criticalAnalysisEn: "Why doesn't the stomach autodigest? A dense bicarbonate-rich mucus blanket maintains a neutral pH 7.0 buffer right at the epithelial surface, holding back lumen pH 1.5 acid.",
  },
  {
    id: "hati-empedu",
    name: "Hati & Kantung Empedu",
    nameEn: "Liver & Gallbladder",
    emoji: "🫁",
    badge: "Pabrik Emulsifikasi Lemak",
    badgeEn: "Lipid Emulsification Facility",
    desc: "Hati memproduksi 500–1000 mL cairan empedu setiap hari. Kantung empedu menampung dan memekatkan empedu 5–10 kali lipat, melepaskannya ke duodenum saat kimus berlemak tiba.",
    descEn: "Liver synthesizes 500–1000 mL bile daily. The gallbladder stores and concentrates bile 5–10x, discharging it into duodenum upon fatty chyme arrival.",
    enzymes: [
      "Garam Empedu (Kolat & Deoksikolat) - bukan enzim, melainkan molekul amfifatik pengemulsi lemak",
      "Pigmen Empedu (Bilirubin & Biliverdin) - produk ekskresi pemecahan hemoglobin eritrosit tua",
    ],
    enzymesEn: [
      "Bile Salts (Cholate & Deoxycholate) - amphiphilic lipid emulsifiers, not enzymes",
      "Bile Pigments (Bilirubin & Biliverdin) - excretion products of senescent erythrocyte hemoglobin",
    ],
    stimulus: "Asam lemak dan kimus asam di duodenum merangsang pelepasan hormon Kolesistokinin (CCK), memicu kontraksi kantung empedu dan relaksasi sfingter Oddi.",
    stimulusEn: "Duodenal fatty acids trigger Cholecystokinin (CCK) release, inducing gallbladder contraction and sphincter of Oddi relaxation.",
    criticalAnalysis: "Lipase pankreas adalah enzim larut air. Tanpa garam empedu, molekul lemak menggumpal besar sehingga lipase tidak bisa menjangkau substrat. Emulsifikasi mengubah lemak menjadi misel mikroskopis.",
    criticalAnalysisEn: "Pancreatic lipase is water-soluble. Without bile salts, fat globules clump together undigested. Emulsification converts fat into micro-micelles, expanding contact area exponentially.",
  },
  {
    id: "pankreas",
    name: "Pankreas (Eksokrin & Endokrin)",
    nameEn: "Pancreas (Exocrine & Endocrine)",
    emoji: "🧬",
    badge: "Katalisator Enzimatis Utama",
    badgeEn: "Master Enzymatic Factory",
    desc: "Kelenjar ganda di lekukan duodenum. Bagian eksokrin menghasilkan 1.5 L getah pankreas kaya NaHCO₃ penetral asam dan enzim lengkap. Bagian endokrin (Pulau Langerhans) memproduksi hormon insulin dan glukagon.",
    descEn: "Dual gland resting in duodenal C-loop. Exocrine acinar cells secrete NaHCO₃-rich neutralizing juice and complete enzymes. Endocrine islets produce insulin and glucagon.",
    enzymes: [
      "Tripsinogen & Kimotripsinogen - protease pemotong polipeptida",
      "Lipase Pankreas (Steapsin) - memecah trigliserida jadi asam lemak & monogliserida",
      "Amilase Pankreas (Amilopsin) - menghidrolisis pati sisa jadi maltosa",
      "Nuklease - memotong DNA/RNA makanan jadi nukleotida",
    ],
    enzymesEn: [
      "Trypsinogen & Chymotrypsinogen - master protein-cleaving endopeptidases",
      "Pancreatic Lipase - hydrolyzes triglycerides into free fatty acids & monoglycerides",
      "Pancreatic Amylase - breaks down remaining starch into maltose",
      "Nucleases - cleaves nucleic acids into nucleotides",
    ],
    stimulus: "Asam lambung memicu pelepasan hormon Sekretin (keluarkan getah NaHCO₃), sedangkan lemak/peptida memicu hormon CCK (keluarkan enzim zimogen).",
    stimulusEn: "Gastric acid stimulates Secretin (releases NaHCO₃), while peptides/lipids trigger CCK (releases digestive enzymes).",
    criticalAnalysis: "Enzim protease disintesis dalam bentuk zimogen inaktif (tripsinogen). Begitu sampai di usus, enterokinase brush border memotongnya menjadi tripsin aktif. Mekanisme ini mencegah autodigesti pankreas (pankreatitis).",
    criticalAnalysisEn: "Proteases are packaged as inactive zymogens (trypsinogen). Once in duodenum, enterokinase activates trypsin, preventing dangerous autodigestion of pancreatic tissue (pancreatitis).",
  },
  {
    id: "usus-halus",
    name: "Usus Halus (Vili & Brush Border)",
    nameEn: "Small Intestine (Villi & Microvilli)",
    emoji: "🔬",
    badge: "Pusat Absorpsi 90% Sari Makanan",
    badgeEn: "90% Nutrient Absorption Hub",
    desc: "Terdiri atas Duodenum (25 cm), Jejunum (1–2.5 m), dan Ileum (3–4 m). Memiliki 3 lapis lipatan (plika, vili, mikrovili) yang memperluas area penyerapan hingga 600× (~200–250 m² setara lapangan tenis).",
    descEn: "Divided into Duodenum (25 cm), Jejunum (1–2.5 m), and Ileum (3–4 m). Three levels of mucosal folding expand surface area 600× (~200–250 m²).",
    enzymes: [
      "Disakaridase (Maltase, Sukrase, Laktase) - hidrolisis disakarida jadi monosakarida",
      "Peptidase / Erepsin - memotong peptida kecil jadi asam amino bebas",
      "Enterokinase - bioaktivator pengaktif tripsinogen pankreas",
    ],
    enzymesEn: [
      "Disaccharidases (Maltase, Sucrase, Lactase) - hydroylyzes disaccharides into monosaccharides",
      "Peptidases - cleaves small peptides into free amino acids",
      "Enterokinase - mucosal bioactivator of pancreatic trypsinogen",
    ],
    stimulus: "Peregangan lumen oleh kimus dan regulasi Sistem Saraf Enterik (ENS) memicu gerak segmentasi lokal dan peristaltik pencampuran.",
    stimulusEn: "Chyme distension and enteric nervous system (ENS) circuits trigger local segmentation and peristalsis.",
    criticalAnalysis: "Mengapa ada dua jalur penyerapan berbeda? Nutrien larut air (glukosa, asam amino) langsung masuk kapiler vena porta ke hati. Namun lipid berbentuk kilomikron berukuran terlalu besar untuk dinding kapiler darah, sehingga wajib diserap ke pembuluh limfe lakteal.",
    criticalAnalysisEn: "Why two separate absorption pathways? Water-soluble nutrients enter portal capillaries heading directly to the liver. Bulky lipid chylomicrons cannot cross continuous blood capillaries, so they must enter open-ended lymphatic lacteals.",
  },
  {
    id: "kolon",
    name: "Usus Besar (Kolon) & Mikrobiota",
    nameEn: "Large Intestine (Colon) & Microbiome",
    emoji: "🦠",
    badge: "Reabsorpsi Air & Fermentasi Simbiotik",
    badgeEn: "Water Reabsorption & Fermentation",
    desc: "Menyerap kembali 1.5–2.0 liter air dan elektrolit per hari, memadatkan feses, dan menjadi ekosistem triliunan bakteri simbiotik anaerob yang menguntungkan tubuh.",
    descEn: "Recovers 1.5–2.0 liters of water and electrolytes daily, compacts feces, and harbors trillions of symbiotic gut microflora.",
    enzymes: [
      "Bukan enzim manusia, melainkan enzim fermentasi selulolitik mikroba simbion (mensintesis SCFA, Vitamin K, dan Biotin)",
    ],
    enzymesEn: [
      "Bacterial enzymes ferment indigestible fiber into short-chain fatty acids (SCFAs), Vitamin K, and Biotin",
    ],
    stimulus: "Refleks gastrokolik: masuknya makanan ke lambung mengirim sinyal saraf otonom ke kolon untuk memicu kontraksi massa mendorong feses ke arah rektum.",
    stimulusEn: "Gastrocolic reflex: gastric distension sends autonomic signals stimulating mass colonic movements toward the rectum.",
    criticalAnalysis: "Penggunaan antibiotik spektrum luas yang berlebihan dapat memusnahkan mikrobiota baik kolon. Akibatnya timbul diare berat dan defisiensi vitamin K karena hilangnya bakteri pensintesis vitamin esensial ini.",
    criticalAnalysisEn: "Overuse of broad-spectrum antibiotics eradicates symbiotic gut microflora, triggering opportunistic diarrhea and Vitamin K deficiency from lost microbial synthesis.",
  },
];

interface TransitStep {
  step: number;
  organ: string;
  organEn: string;
  action: string;
  actionEn: string;
  pH: string;
  duration: string;
  mechanics: string;
  detail: string;
  detailEn: string;
  bolusForm: string;
  bolusFormEn: string;
}

const TRANSIT_STEPS: TransitStep[] = [
  {
    step: 1,
    organ: "Rongga Mulut & Gigi",
    organEn: "Oral Cavity & Teeth",
    action: "Mastikasi & Salivasi Awal",
    actionEn: "Mastication & Initial Salivation",
    pH: "pH 6.8–7.0 (Netral)",
    duration: "10–30 Detik",
    mechanics: "Pengunyahan Otot Rangka + Ptialin",
    detail: "Gigi memotong dan menggilas makanan secara mekanik. Air liur membasahi makanan dengan musin dan memulai hidrolisis enzimatik amilum menjadi maltosa.",
    detailEn: "Teeth physically crush food mechanically. Saliva lubricates with mucin and initiates enzymatic cleavage of starch to maltose.",
    bolusForm: "Gumpalan Bolus Halus Berpelumas",
    bolusFormEn: "Lubricated Food Bolus",
  },
  {
    step: 2,
    organ: "Faring & Katup Epiglotis",
    organEn: "Pharynx & Epiglottis",
    action: "Refleks Deglutisi (Menelan)",
    actionEn: "Deglutition Reflex (Swallowing)",
    pH: "pH 6.8–7.0 (Netral)",
    duration: "1–2 Detik",
    mechanics: "Penutupan Refleks Tulang Rawan Laring",
    detail: "Lidah mendorong bolus ke belakang. Katup epiglotis menekuk secara otomatis menutup pintu laring (trakea), memastikan bolus terarah masuk ke esofagus.",
    detailEn: "Tongue propels bolus backward. Epiglottis automatically folds over the larynx, preventing aspiration into the airway.",
    bolusForm: "Bolus Terarah Menuju Esofagus",
    bolusFormEn: "Bolus Directed to Esophagus",
  },
  {
    step: 3,
    organ: "Esofagus & LES",
    organEn: "Esophagus & LES Sphincter",
    action: "Gelombang Peristaltik Aktif",
    actionEn: "Active Peristaltic Waves",
    pH: "pH 6.8–7.0 (Netral)",
    duration: "5–8 Detik",
    mechanics: "Kontraksi Otot Sirkuler & Longitudinal",
    detail: "Otot polos dinding kerongkongan memijat bolus ke distal dengan kecepatan konstan. Sfingter LES di ujung bawah membuka sejenak untuk meloloskan bolus ke lambung.",
    detailEn: "Smooth muscle rings contract behind bolus while relaxing ahead. The Lower Esophageal Sphincter (LES) opens transiently to welcome the bolus.",
    bolusForm: "Bolus Bergerak Terkompresi",
    bolusFormEn: "Compressed Propelled Bolus",
  },
  {
    step: 4,
    organ: "Lambung (Ventrikulus)",
    organEn: "Stomach (Ventrikel)",
    action: "Pengadukan Kimus Asam & Pepsin",
    actionEn: "Acidic Chyme Churning & Pepsin",
    pH: "pH 1.5–2.0 (Sangat Asam)",
    duration: "2–4 Jam",
    mechanics: "Kontraksi 3 Lapisan Otot Muskularis",
    detail: "Tiga lapisan otot lambung (oblik, sirkuler, longitudinal) meremas bolus menjadi bubur semi-cair (kimus). Asam HCl mendenaturasi kuman dan pepsin memotong protein menjadi pepton.",
    detailEn: "Three muscle layers churn bolus into acidic fluid chyme. Concentrated HCl denatures proteins and pepsin digests them into peptones.",
    bolusForm: "Kimus Asam Cair (Chyme)",
    bolusFormEn: "Acidic Liquid Chyme",
  },
  {
    step: 5,
    organ: "Duodenum (Usus 12 Jari)",
    organEn: "Duodenum",
    action: "Netralisasi Bikarbonat & Emulsi",
    actionEn: "Bicarbonate Buffering & Bile Emulsion",
    pH: "pH 7.5–8.2 (Alkali / Basa)",
    duration: "30–60 Menit",
    mechanics: "Muara Bersama Ampula Vateri",
    detail: "Natrium bikarbonat (NaHCO₃) pankreas menaikkan pH dari 2 ke 8. Cairan empedu memecah molekul lemak menjadi tetesan misel, mengawali serangan tripsin dan lipase.",
    detailEn: "Pancreatic NaHCO₃ elevates pH from 2 to 8. Bile salts emulsify lipids into micelles, enabling rapid lipase and trypsin hydrolysis.",
    bolusForm: "Kimus Basa Teremulsi",
    bolusFormEn: "Emulsified Alkaline Chyme",
  },
  {
    step: 6,
    organ: "Jejunum & Ileum",
    organEn: "Jejunum & Ileum",
    action: "Absorpsi Masif Vili (Amplifikasi 600×)",
    actionEn: "Massive Villus Absorption (600× Area)",
    pH: "pH 7.5–8.0 (Alkali Lemah)",
    duration: "3–5 Jam",
    mechanics: "Kotranspor Na⁺ & Pembuluh Lakteal",
    detail: "Jutaan vili dan mikrovili menyerap glukosa dan asam amino langsung ke kapiler darah vena porta ke hati, serta menyerap asam lemak kilomikron ke pembuluh limfe lakteal dada.",
    detailEn: "Millions of villi and microvilli absorb glucose and amino acids into portal blood, and pack lipids into chylomicrons destined for lacteal lymph.",
    bolusForm: "Sari Makanan Terserap (Sisa Cair)",
    bolusFormEn: "Absorbed Nutrients & Fluid Residue",
  },
  {
    step: 7,
    organ: "Usus Besar (Kolon) & Rektum",
    organEn: "Colon & Rectum",
    action: "Reabsorpsi Air & Pembentukan Feses",
    actionEn: "Water Recovery & Fecal Compaction",
    pH: "pH 6.5–7.0 (Netral Lemah)",
    duration: "12–24 Jam",
    mechanics: "Fermentasi Mikrobiota & Sfingter Sadar",
    detail: "Kolon menyerap kembali 90% sisa air dan elektrolit. Triliunan bakteri mensintesis Vitamin K. Feses dipadatkan dan disimpan di rektum hingga refleks defekasi sadar dimulai.",
    detailEn: "Colon recovers 90% water and electrolytes. Gut microbes synthesize Vitamin K. Feces is compacted and held until voluntary defecation occurs.",
    bolusForm: "Feses Semi-Padat Siap Defekasi",
    bolusFormEn: "Formed Semi-Solid Feces",
  },
];

interface StimulusScenario {
  id: string;
  title: string;
  titleEn: string;
  type: "internal" | "eksternal";
  iconEmoji: string;
  trigger: string;
  triggerEn: string;
  receptor: string;
  receptorEn: string;
  organResponse: string;
  organResponseEn: string;
  outcome: string;
  outcomeEn: string;
  criticalAnalysis: string;
  criticalAnalysisEn: string;
}

const STIMULUS_SCENARIOS: StimulusScenario[] = [
  {
    id: "pedas-kapsaisin",
    title: "Konsumsi Makanan Super Pedas (Kapsaisin Cabai)",
    titleEn: "Extreme Spicy Food Ingestion (Chili Capsaicin)",
    type: "eksternal",
    iconEmoji: "🌶️",
    trigger: "Senyawa kimia kapsaisin dari cabai masuk ke lumen saluran cerna.",
    triggerEn: "Capsaicin compound from chili peppers contacts the gut mucosa.",
    receptor: "Reseptor Nyeri TRPV1 pada ujung serabut saraf sensorik mukosa usus.",
    receptorEn: "TRPV1 vanilloid pain receptors located on intestinal nerve endings.",
    organResponse: "Saraf Enterik (ENS) menginterpretasikan sinyal sebagai zat iritan beracun: memicu hiper-peristaltik kilat dan sekresi cairan lumen masif.",
    organResponseEn: "Enteric nervous system registers a toxic threat: triggers emergency hyper-motility and massive water secretion.",
    outcome: "Diare Akut Defensif: Kram melilit perut dan pengeluaran feses cair panas untuk membilas iritan keluar.",
    outcomeEn: "Acute Defensive Diarrhea: Severe cramping and watery evacuation to flush out noxious chemicals.",
    criticalAnalysis: "Diare setelah makan pedas bukanlah kegagalan organ, melainkan mekanisme adaptasi protektif tubuh yang sangat cerdas untuk meminimalkan durasi kontak zat toksik dengan sel enterosit usus.",
    criticalAnalysisEn: "Post-spicy diarrhea is not organ failure, but an evolutionary protective reflex designed to shorten mucosal exposure to chemical irritants.",
  },
  {
    id: "asam-duodenum",
    title: "Kimus Sangat Asam (pH 2) Menyemprot ke Duodenum",
    titleEn: "Acidic Chyme Jet (pH 2) Enters Duodenum",
    type: "internal",
    iconEmoji: "🧪",
    trigger: "Sfingter pilorus membuka sesaat, menyemprotkan kimus lambung ber-HCl ke dalam usus 12 jari.",
    triggerEn: "Pyloric sphincter opens, injecting hydrochloric chyme into duodenal lumen.",
    receptor: "Kemosensor Sel S enteroendokrin di mukosa duodenum mendeteksi pH lumen < 4.5.",
    receptorEn: "Enteroendocrine S cells in duodenal mucosa detect acidity below pH 4.5.",
    organResponse: "Sel S mensekresi hormon Sekretin ke peredaran darah → merangsang sel duktus pankreas memompa getah kaya Natrium Bikarbonat (NaHCO₃).",
    organResponseEn: "S cells release Secretin into bloodstream → stimulates pancreatic duct cells to flood lumen with bicarbonate (NaHCO₃).",
    outcome: "Netralisasi Kimus Kilat: pH lumen duodenum melonjak dari ~2 menjadi 7.8–8.2 dalam hitungan menit.",
    outcomeEn: "Rapid Acid Neutralization: Duodenal pH jumps from ~2 to 7.8–8.2 within minutes.",
    criticalAnalysis: "Enzim pankreas (tripsin, amilase, lipase) akan rusak permanen akibat denaturasi jika suasana tetap asam. Regulasi hormon sekretin adalah pilar penting homeostasis stimulus internal.",
    criticalAnalysisEn: "Pancreatic enzymes denature irreversibly in acid. Secretin-driven bicarbonate buffering is a hallmark of internal stimulus feedback homeostasis.",
  },
  {
    id: "stres-kecemasan",
    title: "Stres Mental Akut & Kecemasan Menjelang Ujian",
    titleEn: "Acute Psychological Stress & Exam Anxiety",
    type: "eksternal",
    iconEmoji: "🧠",
    trigger: "Kecemasan psikologis di korteks serebri dan amigdala otak.",
    triggerEn: "Psychological anxiety in cerebral cortex and amygdala.",
    receptor: "Sumbu Otak-Usus (Gut-Brain Axis) via Serabut Saraf Simpatis Otonom.",
    receptorEn: "Gut-Brain Axis via Sympathetic Nervous System and Adrenal Axis.",
    organResponse: "Saraf simpatis aktif dominan: aliran darah dialihkan dari usus ke otot rangka, sfingter menegang, motilitas usus menjadi spastik tak beraturan.",
    organResponseEn: "Sympathetic dominance shunts blood away from viscera to muscles, causing spastic gut motility and sphincter spasms.",
    outcome: "Gejala Perut Melilit Tiba-Tiba, rasa kembung begah, atau diare gugup sebelum ujian.",
    outcomeEn: "Sudden abdominal cramps, butterflies, bloating, or nervous exam diarrhea.",
    criticalAnalysis: "Saluran cerna memiliki lebih dari 500 juta neuron (ENS) yang berkomunikasi dua arah via Nervus Vagus dengan otak pusat. Kondisi emosional eksternal secara nyata mendikte motilitas fisik organ dalam.",
    criticalAnalysisEn: "Housing >500 million neurons, the gut's ENS communicates bidirectionally via the vagus nerve, directly translating emotional states into visceral motor responses.",
  },
  {
    id: "fase-sefalik",
    title: "Melihat & Mencium Aroma Makanan Lezat",
    titleEn: "Visual & Olfactory Food Appetizing Cues",
    type: "eksternal",
    iconEmoji: "🍲",
    trigger: "Mata melihat tampilan visual makanan menggugah selera atau hidung menghirup aroma sedap masakan.",
    triggerEn: "Eyes see appetizing dish or nasal receptors inhale cooking aromas.",
    receptor: "Fotoreseptor Retina Mata & Reseptor Olfaktori Rongga Hidung.",
    receptorEn: "Retinal photoreceptors and nasal olfactory receptors.",
    organResponse: "Medula oblongata mengirimkan impuls eferen via Nervus Vagus (CN X - Parasimpatis) ke kelenjar ludah dan lambung.",
    organResponseEn: "Brainstem dispatches parasympathetic vagal signals to salivary glands and gastric parietal cells.",
    outcome: "Fase Sefalik: Mulut berair (salivasi deras) dan sel parietal mulai memompa HCl sebelum sesuap pun makanan masuk ke mulut!",
    outcomeEn: "Cephalic Phase: Mouth waters copiously and stomach pumps acid prior to ingestion!",
    criticalAnalysis: "Tubuh manusia tidak menunggu makanan tiba secara pasif, melainkan melakukan persiapan antisipatif (feed-forward regulation) untuk memaksimalkan efisiensi enzimatik saat bolus tiba.",
    criticalAnalysisEn: "The human digestive system anticipates ingestion through feed-forward regulation, priming optimal enzymatic conditions before food reaches the stomach.",
  },
];

export function DigestiveInteractiveSection({ lang }: DigestiveInteractiveProps) {
  const [activeTab, setActiveTab] = useState<TabType>("organ");
  const [selectedOrgan, setSelectedOrgan] = useState<OrganDetail>(ORGANS[0]);
  const [transitStepIdx, setTransitStepIdx] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [selectedStimulus, setSelectedStimulus] = useState<StimulusScenario>(STIMULUS_SCENARIOS[0]);
  const [selectedNutrient, setSelectedNutrient] = useState<"karbohidrat" | "protein" | "lemak">("karbohidrat");

  // Auto-play timer for bolus transit simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlay) {
      timer = setInterval(() => {
        setTransitStepIdx((prev) => (prev + 1) % TRANSIT_STEPS.length);
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isAutoPlay]);

  const currentTransit = TRANSIT_STEPS[transitStepIdx];

  return (
    <div className="mb-8 rounded-3xl border border-border/70 bg-surface shadow-card overflow-hidden transition-colors">
      {/* ── Top Branded Header (BioLearn Concept Theme) ── */}
      <div className="relative p-5 sm:p-6 bg-gradient-to-br from-accent via-accent-dark to-[#4834d4] text-white overflow-hidden">
        {/* Subtle decorative background icons */}
        <div className="absolute -top-3 right-6 text-7xl opacity-15 pointer-events-none select-none">🧬</div>
        <div className="absolute bottom-1 right-28 text-5xl opacity-10 pointer-events-none select-none">🧪</div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/25 shrink-0">
              🫄
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white shadow-xs">
                  {lang === "en" ? "Interactive Lab" : "Laboratorium Interaktif"}
                </span>
                <span className="text-xs font-semibold text-white/90 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  {lang === "en" ? "Digestive Physiology, Motility & Stimulus Reflex" : "Fisiologi Organ, Motilitas, & Respons Stimulus"}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight mt-1 text-white">
                {lang === "en"
                  ? "Digestive System Simulator & Neuro-Endocrine Reflex Lab"
                  : "Simulator Interaktif Sistem Pencernaan & Respons Stimulus"}
              </h2>
            </div>
          </div>
        </div>

        {/* ── Tab Navigation (Clean Translucent Pills) ── */}
        <div className="relative z-10 flex flex-wrap gap-1.5 mt-5 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/15">
          <button
            type="button"
            onClick={() => { setActiveTab("organ"); setIsAutoPlay(false); }}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "organ"
                ? "bg-white text-accent-dark shadow-sm"
                : "text-white/85 hover:text-white hover:bg-white/15"
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === "en" ? "Organ Anatomy" : "Eksplorasi Organ"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("transit")}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "transit"
                ? "bg-white text-accent-dark shadow-sm"
                : "text-white/85 hover:text-white hover:bg-white/15"
            }`}
          >
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === "en" ? "Transit & Peristalsis" : "Transit & Peristaltik"}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("stimulus"); setIsAutoPlay(false); }}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "stimulus"
                ? "bg-white text-accent-dark shadow-sm"
                : "text-white/85 hover:text-white hover:bg-white/15"
            }`}
          >
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === "en" ? "Stimulus Reflex (CP)" : "Respon Stimulus (CP)"}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("enzim"); setIsAutoPlay(false); }}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "enzim"
                ? "bg-white text-accent-dark shadow-sm"
                : "text-white/85 hover:text-white hover:bg-white/15"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === "en" ? "Enzyme Digestion" : "Kinetika Enzim"}</span>
          </button>
        </div>
      </div>

      {/* ── Main Interactive Content Body ── */}
      <div className="p-5 sm:p-6">
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: ORGAN EXPLORATION                                            */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "organ" && (
          <div className="space-y-4">
            {/* Top Organ Selector Bar (Dropdown + Quick Navigation) */}
            <div className="bg-surface-2/70 p-3 sm:p-4 rounded-2xl border border-border/70 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
                <label htmlFor="organ-select" className="text-xs font-bold text-ink shrink-0 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-accent" />
                  <span>{lang === "en" ? "Select Organ:" : "Pilih Organ:"}</span>
                </label>
                <div className="relative flex-1 max-w-sm">
                  <select
                    id="organ-select"
                    value={selectedOrgan.id}
                    onChange={(e) => {
                      const found = ORGANS.find((o) => o.id === e.target.value);
                      if (found) setSelectedOrgan(found);
                    }}
                    className="w-full appearance-none pl-3.5 pr-9 py-2 rounded-xl text-xs sm:text-[13px] font-bold bg-surface border border-border/80 text-ink shadow-xs hover:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer transition-all"
                  >
                    {ORGANS.map((organ, idx) => (
                      <option key={organ.id} value={organ.id}>
                        {organ.emoji} {idx + 1}. {lang === "en" ? organ.nameEn : organ.name} — ({lang === "en" ? organ.badgeEn : organ.badge})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Prev / Next Quick Nav Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-medium text-muted mr-1 hidden sm:inline">
                  {ORGANS.findIndex((o) => o.id === selectedOrgan.id) + 1} / {ORGANS.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const idx = ORGANS.findIndex((o) => o.id === selectedOrgan.id);
                    const prevIdx = idx > 0 ? idx - 1 : ORGANS.length - 1;
                    setSelectedOrgan(ORGANS[prevIdx]);
                  }}
                  className="p-2 rounded-xl bg-surface border border-border/70 hover:bg-bg-alt text-ink transition-colors cursor-pointer"
                  title="Organ Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const idx = ORGANS.findIndex((o) => o.id === selectedOrgan.id);
                    const nextIdx = (idx + 1) % ORGANS.length;
                    setSelectedOrgan(ORGANS[nextIdx]);
                  }}
                  className="p-2 rounded-xl bg-surface border border-border/70 hover:bg-bg-alt text-ink transition-colors cursor-pointer"
                  title="Organ Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Organ Chips Row */}
              <div className="w-full flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 border-t border-border/40">
                {ORGANS.map((organ) => {
                  const isSelected = selectedOrgan.id === organ.id;
                  return (
                    <button
                      key={organ.id}
                      type="button"
                      onClick={() => setSelectedOrgan(organ)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                        isSelected
                          ? "bg-accent text-white shadow-xs font-bold scale-[1.02]"
                          : "bg-surface border border-border/60 text-muted hover:text-ink hover:border-accent/40"
                      }`}
                    >
                      <span>{organ.emoji}</span>
                      <span>{lang === "en" ? organ.nameEn.split(" ")[0] : organ.name.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Organ Detail Card (2-Column Grid Layout - Low Scroll) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedOrgan.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="rounded-2xl sm:rounded-3xl border border-border/70 bg-surface p-5 sm:p-6 space-y-4 shadow-card"
              >
                {/* Card Header */}
                <div className="flex items-center gap-3.5 border-b border-border/60 pb-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-border/60 shadow-2xs flex items-center justify-center text-2xl shrink-0">
                    {selectedOrgan.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/15">
                      {lang === "en" ? selectedOrgan.badgeEn : selectedOrgan.badge}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-ink mt-0.5 truncate">
                      {lang === "en" ? selectedOrgan.nameEn : selectedOrgan.name}
                    </h3>
                  </div>
                </div>

                {/* 2-Column Responsive Bento Grid (Compact & Low Scrolling) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                  {/* Left Column: Struktur & Stimulus */}
                  <div className="space-y-3.5 flex flex-col">
                    {/* Description Box */}
                    <div className="p-4 rounded-2xl bg-surface-2/60 border border-border/60 space-y-1.5 flex-1">
                      <h5 className="text-xs font-bold uppercase text-muted tracking-wider flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-accent" />
                        {lang === "en" ? "Anatomy & Physiology:" : "Struktur & Fisiologi Organ:"}
                      </h5>
                      <p className="text-xs sm:text-[13px] text-ink/90 leading-relaxed font-normal">
                        {lang === "en" ? selectedOrgan.descEn : selectedOrgan.desc}
                      </p>
                    </div>

                    {/* Stimulus Trigger Box */}
                    <div className="p-4 rounded-2xl bg-amber-500/[0.06] border border-amber-500/20 space-y-1">
                      <h5 className="text-xs font-bold uppercase text-amber-700 dark:text-amber-300 tracking-wider flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        {lang === "en" ? "Triggering Stimulus:" : "Stimulus Pemicu Refleks:"}
                      </h5>
                      <p className="text-xs sm:text-[13px] text-ink leading-relaxed font-normal">
                        {lang === "en" ? selectedOrgan.stimulusEn : selectedOrgan.stimulus}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Enzim & HOTS */}
                  <div className="space-y-3.5 flex flex-col">
                    {/* Secretions / Enzymes Box */}
                    <div className="p-4 rounded-2xl bg-accent/[0.04] border border-accent/15 space-y-2 flex-1">
                      <h5 className="text-xs font-bold uppercase text-accent-dark dark:text-accent-light tracking-wider flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-accent" />
                        {lang === "en" ? "Secretions & Enzymes Involved:" : "Enzim & Getah Pencernaan Terkait:"}
                      </h5>
                      <ul className="space-y-1.5">
                        {(lang === "en" ? selectedOrgan.enzymesEn : selectedOrgan.enzymes).map((enz, i) => (
                          <li key={i} className="text-xs sm:text-[13px] text-ink flex items-start gap-2 font-normal">
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                            <span>{enz}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* HOTS Critical Thinking Question Box */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/[0.06] via-purple-500/[0.02] to-surface border border-accent/20 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">💡</span>
                        <h5 className="text-xs font-bold uppercase text-accent-dark dark:text-accent-light tracking-wider">
                          {lang === "en" ? "HOTS Analysis & Clinical Correlation:" : "Analisis Kritis & Klinis (HOTS):"}
                        </h5>
                      </div>
                      <p className="text-xs sm:text-[13px] text-ink/90 leading-relaxed font-normal">
                        {lang === "en" ? selectedOrgan.criticalAnalysisEn : selectedOrgan.criticalAnalysis}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: TRANSIT & PERISTALSIS                                         */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "transit" && (
          <div className="space-y-5">
            {/* Simulation Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-2/60 p-3.5 rounded-2xl border border-border/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink">
                  {lang === "en" ? "Stage Position:" : "Tahap Perjalanan Makanan:"}
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-accent text-white shadow-xs">
                  {transitStepIdx + 1} / {TRANSIT_STEPS.length}
                </span>
                <span className="hidden sm:inline-block text-xs font-medium text-muted ml-1">
                  ({currentTransit.bolusForm})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Auto-Play Toggle */}
                <button
                  type="button"
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    isAutoPlay
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "bg-accent hover:bg-accent-dark text-white"
                  }`}
                >
                  {isAutoPlay ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>{lang === "en" ? "Pause" : "Jeda Otomatis"}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{lang === "en" ? "Auto-Play" : "Putar Otomatis"}</span>
                    </>
                  )}
                </button>

                {/* Prev Step */}
                <button
                  type="button"
                  onClick={() => {
                    setTransitStepIdx((prev) => (prev > 0 ? prev - 1 : TRANSIT_STEPS.length - 1));
                    setIsAutoPlay(false);
                  }}
                  className="p-2 rounded-xl text-xs font-bold bg-surface border border-border/60 hover:bg-bg-alt text-ink flex items-center justify-center cursor-pointer"
                  title="Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Next Step */}
                <button
                  type="button"
                  onClick={() => {
                    setTransitStepIdx((prev) => (prev + 1) % TRANSIT_STEPS.length);
                    setIsAutoPlay(false);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-surface border border-border/60 hover:bg-bg-alt text-ink flex items-center gap-1 cursor-pointer"
                >
                  <span>{lang === "en" ? "Next" : "Lanjut"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Reset */}
                <button
                  type="button"
                  onClick={() => { setTransitStepIdx(0); setIsAutoPlay(false); }}
                  className="p-2 rounded-xl text-muted hover:text-ink hover:bg-bg-alt transition-colors cursor-pointer border border-border/60"
                  title="Reset dari Mulut"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stepper Grid (7 Stages) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {TRANSIT_STEPS.map((s, idx) => {
                const isActive = transitStepIdx === idx;
                const isPassed = transitStepIdx > idx;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => { setTransitStepIdx(idx); setIsAutoPlay(false); }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer relative ${
                      isActive
                        ? "bg-accent text-white border-accent shadow-xs scale-[1.02]"
                        : isPassed
                        ? "bg-accent/[0.08] text-accent border-accent/25 hover:border-accent/40"
                        : "bg-surface text-muted border-border/60 hover:border-border hover:text-ink hover:bg-bg-alt"
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-85">
                      Tahap {s.step}
                    </div>
                    <div className="text-xs font-bold truncate mt-0.5">
                      {lang === "en" ? s.organEn : s.organ}
                    </div>
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white shadow-xs animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Current Step Spotlight Card */}
            <div className="rounded-2xl sm:rounded-3xl border border-border/70 bg-surface overflow-hidden shadow-card">
              {/* Header Bar */}
              <div className="px-5 sm:px-6 py-4 bg-surface-2/70 border-b border-border/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-accent text-white font-extrabold flex items-center justify-center text-xs shadow-xs shrink-0">
                    0{currentTransit.step}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                      {lang === "en" ? `Step ${currentTransit.step} of 7` : `Tahap ${currentTransit.step} dari 7`}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-ink">
                      {lang === "en" ? currentTransit.organEn : currentTransit.organ} — {lang === "en" ? currentTransit.actionEn : currentTransit.action}
                    </h3>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/15">
                  {currentTransit.bolusForm}
                </div>
              </div>

              {/* Body Details */}
              <div className="p-5 sm:p-6 space-y-4">
                {/* 3 Parameter Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Parameter 1: pH */}
                  <div className="p-3 rounded-xl bg-surface-2/70 border border-border/60 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                      <Gauge className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase text-muted">Kondisi pH</div>
                      <div className="text-xs font-bold text-ink truncate">{currentTransit.pH}</div>
                    </div>
                  </div>

                  {/* Parameter 2: Duration */}
                  <div className="p-3 rounded-xl bg-surface-2/70 border border-border/60 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase text-muted">Durasi Transit</div>
                      <div className="text-xs font-bold text-ink truncate">{currentTransit.duration}</div>
                    </div>
                  </div>

                  {/* Parameter 3: Mechanics */}
                  <div className="p-3 rounded-xl bg-surface-2/70 border border-border/60 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase text-muted">Mekanisme Utama</div>
                      <div className="text-xs font-bold text-ink truncate">{currentTransit.mechanics}</div>
                    </div>
                  </div>
                </div>

                {/* Detailed Action Explanation */}
                <div className="p-4 rounded-2xl bg-surface-2/60 border border-border/60 space-y-1">
                  <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-accent" />
                    <span>Penjelasan Mekanisme Motilitas &amp; Pencernaan:</span>
                  </h4>
                  <p className="text-xs sm:text-[13.5px] text-ink/90 leading-relaxed font-normal">
                    {lang === "en" ? currentTransit.detailEn : currentTransit.detail}
                  </p>
                </div>

                {/* Visual Peristaltic Pathway Track */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-ink">
                    <span className="flex items-center gap-1">
                      <span>Perjalanan Bolus Makanan</span>
                      <ArrowRight className="w-3.5 h-3.5 text-accent" />
                    </span>
                    <span className="text-[11px] font-medium text-muted">
                      {Math.round(((transitStepIdx + 1) / TRANSIT_STEPS.length) * 100)}% Saluran Terlewati
                    </span>
                  </div>

                  {/* Progress Bar Line */}
                  <div className="w-full h-2 rounded-full bg-surface-2 border border-border/60 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-accent to-accent-dark rounded-full"
                      initial={false}
                      animate={{ width: `${((transitStepIdx + 1) / TRANSIT_STEPS.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  {/* Visual Node Chain */}
                  <div className="p-3 rounded-2xl bg-surface-2/60 border border-border/60 flex items-center justify-between gap-1 overflow-x-auto">
                    {TRANSIT_STEPS.map((s, idx) => {
                      const isCurrent = transitStepIdx === idx;
                      const isPast = transitStepIdx > idx;
                      return (
                        <div key={s.step} className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => { setTransitStepIdx(idx); setIsAutoPlay(false); }}
                            className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                              isCurrent
                                ? "bg-accent text-white shadow-xs scale-105"
                                : isPast
                                ? "bg-accent/15 text-accent border border-accent/25"
                                : "bg-surface border border-border/60 text-muted hover:text-ink"
                            }`}
                            title={s.organ}
                          >
                            {s.step}
                          </button>
                          {idx < TRANSIT_STEPS.length - 1 && (
                            <div className={`w-3 sm:w-6 h-0.5 ${isPast ? "bg-accent" : "bg-border"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: STIMULUS RESPONSE (CP ALIGNED)                                */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "stimulus" && (
          <div className="space-y-5">
            {/* CP Banner */}
            <div className="p-4 rounded-2xl bg-accent/[0.05] border border-accent/20 text-xs sm:text-sm text-ink leading-relaxed">
              <span className="font-bold text-accent-dark dark:text-accent-light block sm:inline mr-1">
                🎯 Capaian Pembelajaran (CP Biologi):
              </span>
              <span>
                {lang === "en"
                  ? "Analyze the interrelatedness among organ systems in responding to internal and external stimuli (neuro-endocrine reflexes and protective feedback mechanisms)."
                  : "Menganalisis keterkaitan antar sistem organ dalam tubuh untuk merespons stimulus internal dan eksternal (refleks protektif, koordinasi neuro-endokrin, dan homeostasis)."}
              </span>
            </div>

            {/* Stimulus Scenario Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {STIMULUS_SCENARIOS.map((sc) => {
                const isSelected = selectedStimulus.id === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSelectedStimulus(sc)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-accent text-white border-accent shadow-xs"
                        : "bg-surface hover:bg-bg-alt border-border/70 text-ink hover:border-accent/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-2xl">{sc.iconEmoji}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-white/25 text-white"
                            : sc.type === "internal"
                            ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                        }`}
                      >
                        {sc.type === "internal" ? "Internal" : "Eksternal"}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold leading-snug line-clamp-2">
                      {lang === "en" ? sc.titleEn : sc.title}
                    </h4>
                  </button>
                );
              })}
            </div>

            {/* 3-Step Cascade Flow */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedStimulus.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/70 bg-surface shadow-card space-y-4"
              >
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-border/60 pb-3.5">
                  <span className="text-3xl p-2 rounded-2xl bg-surface-2 border border-border/60 shadow-2xs shrink-0">
                    {selectedStimulus.iconEmoji}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/15">
                      Stimulus {selectedStimulus.type === "internal" ? "Internal" : "Eksternal"}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-ink mt-1">
                      {lang === "en" ? selectedStimulus.titleEn : selectedStimulus.title}
                    </h3>
                  </div>
                </div>

                {/* 3 Cascade Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Step 1: Stimulus & Receptor */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                      <span>Stimulus &amp; Reseptor</span>
                    </div>
                    <p className="text-xs text-ink leading-relaxed">
                      <strong className="text-ink font-semibold">Pemicu:</strong> {lang === "en" ? selectedStimulus.triggerEn : selectedStimulus.trigger}
                    </p>
                    <p className="text-xs text-ink/85 leading-relaxed">
                      <strong className="text-ink font-semibold">Reseptor:</strong> {lang === "en" ? selectedStimulus.receptorEn : selectedStimulus.receptor}
                    </p>
                  </div>

                  {/* Step 2: Organ Coordination */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                      <span>Koordinasi Antar-Sistem</span>
                    </div>
                    <p className="text-xs text-ink font-normal leading-relaxed">
                      {lang === "en" ? selectedStimulus.organResponseEn : selectedStimulus.organResponse}
                    </p>
                  </div>

                  {/* Step 3: Body Outcome */}
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                      <span>Respons Fisiologis Tubuh</span>
                    </div>
                    <p className="text-xs text-ink font-medium leading-relaxed">
                      {lang === "en" ? selectedStimulus.outcomeEn : selectedStimulus.outcome}
                    </p>
                  </div>
                </div>

                {/* HOTS Critical Thinking Question Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-accent/[0.05] via-purple-500/[0.02] to-surface border border-accent/20 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💡</span>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-accent-dark dark:text-accent-light">
                      {lang === "en" ? "Critical Thinking Analysis (HOTS):" : "Analisis Berpikir Kritis Siswa (HOTS):"}
                    </h5>
                  </div>
                  <p className="text-xs sm:text-[13.5px] text-ink/90 leading-relaxed font-normal">
                    {lang === "en" ? selectedStimulus.criticalAnalysisEn : selectedStimulus.criticalAnalysis}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: ENZYME DIGESTION & HYDROLYSIS                                 */}
        {/* ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "enzim" && (
          <div className="space-y-5">
            {/* Nutrient Toggle Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedNutrient("karbohidrat")}
                className={`py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  selectedNutrient === "karbohidrat"
                    ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                    : "bg-surface border-border/70 text-ink hover:bg-bg-alt hover:border-amber-400"
                }`}
              >
                <span>🌾</span>
                <span>Karbohidrat (Amilum)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedNutrient("protein")}
                className={`py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  selectedNutrient === "protein"
                    ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                    : "bg-surface border-border/70 text-ink hover:bg-bg-alt hover:border-rose-400"
                }`}
              >
                <span>🥩</span>
                <span>Protein (Polipeptida)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedNutrient("lemak")}
                className={`py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                  selectedNutrient === "lemak"
                    ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                    : "bg-surface border-border/70 text-ink hover:bg-bg-alt hover:border-teal-400"
                }`}
              >
                <span>🥑</span>
                <span>Lipid / Lemak (Trigliserida)</span>
              </button>
            </div>

            {/* Carbohydrate Flow */}
            {selectedNutrient === "karbohidrat" && (
              <div className="space-y-3">
                {/* Stage 1: Mouth */}
                <div className="p-4 rounded-2xl border border-border/70 bg-surface shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-ink">Tahap 1: Rongga Mulut (pH 6.8–7.0)</span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      Ptialin (Amilase Saliva)
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-ink/90 font-normal leading-relaxed">
                    Ptialin memutus ikatan alfa-1,4-glikosidik pada pati matang (amilum) menjadi molekul disakarida <strong>Maltosa</strong> dan oligosakarida dekstrin.
                  </p>
                </div>

                {/* Stage 2: Stomach */}
                <div className="p-4 rounded-2xl border border-border/70 bg-surface shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-ink">Tahap 2: Lambung (pH 1.5–2.0)</span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-surface-2 text-muted border border-border/60">
                      Inaktif Sementara
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-ink/90 font-normal leading-relaxed">
                    Keasaman ekstrem asam klorida (HCl) mendenaturasi enzim ptialin. Tidak ada pencernaan kimiawi karbohidrat di lambung sampai kimus memasuki usus halus.
                  </p>
                </div>

                {/* Stage 3: Small Intestine */}
                <div className="p-4 rounded-2xl border border-border/70 bg-surface shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-ink">Tahap 3: Usus Halus (pH 7.5–8.2)</span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/15">
                      Amilase Pankreas &amp; Disakaridase Usus
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-ink/90 font-normal leading-relaxed">
                    Amilase pankreas menyelesaikan hidrolisis sisa pati jadi maltosa. Enzim brush border usus (<strong>maltase, sukrase, laktase</strong>) menuntaskan pemecahan disakarida menjadi monosakarida: <strong>Glukosa, Fruktosa, dan Galaktosa</strong>.
                  </p>
                </div>

                {/* Absorption Route Callout */}
                <div className="p-4 rounded-2xl bg-accent/[0.04] border border-accent/20 text-xs sm:text-[13px] text-ink space-y-1">
                  <div className="font-bold text-accent-dark dark:text-accent-light flex items-center gap-1.5">
                    <span>🩸</span>
                    <span>Jalur Absorpsi Vili ke Sirkulasi:</span>
                  </div>
                  <p className="leading-relaxed font-normal text-ink/90">
                    Glukosa dan galaktosa diserap melintasi membran enterosit melalui transpor aktif sekunder <strong>Kotranspor Na⁺-Glukosa (SGLT1)</strong> ke kapiler darah vili → dialirkan via <strong>Vena Porta Hepatika langsung ke Hati</strong> untuk disimpan sebagai glikogen.
                  </p>
                </div>
              </div>
            )}

            {/* Protein Flow */}
            {selectedNutrient === "protein" && (
              <div className="space-y-3">
                {/* Stage 1: Mouth */}
                <div className="p-4 rounded-2xl border border-border/70 bg-surface shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-ink">Tahap 1: Rongga Mulut (pH 6.8–7.0)</span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-surface-2 text-muted border border-border/60">
                      Hanya Mekanis Kunyah
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-ink/90 font-normal leading-relaxed">
                    Gigi memotong dan mengoyak serat protein secara mekanik. Saliva manusia tidak mengandung enzim protease.
                  </p>
                </div>

                {/* Stage 2: Stomach */}
                <div className="p-4 rounded-2xl border border-border/70 bg-surface shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-ink">Tahap 2: Lambung (pH 1.5–2.0)</span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                      HCl &amp; Pepsin Aktif
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-ink/90 font-normal leading-relaxed">
                    Asam HCl mendenaturasi lipatan struktur tersier protein, lalu enzim Pepsin memotong ikatan peptida rantai panjang menjadi potongan fragmen <strong>Pepton dan Polipeptida</strong> pendek.
                  </p>
                </div>

                {/* Stage 3: Small Intestine */}
                <div className="p-4 rounded-2xl border border-border/70 bg-surface shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-ink">Tahap 3: Usus Halus (pH 7.5–8.2)</span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/15">
                      Tripsin, Kimotripsin, &amp; Peptidase
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-ink/90 font-normal leading-relaxed">
                    Tripsin dan Kimotripsin memotong ikatan internal (endopeptidase), sedangkan Karboksipeptidase dan Aminopeptidase memotong asam amino ujung (eksopeptidase) menghasilkan <strong>Asam Amino Bebas</strong>.
                  </p>
                </div>

                {/* Absorption Route Callout */}
                <div className="p-4 rounded-2xl bg-accent/[0.04] border border-accent/20 text-xs sm:text-[13px] text-ink space-y-1">
                  <div className="font-bold text-accent-dark dark:text-accent-light flex items-center gap-1.5">
                    <span>🩸</span>
                    <span>Jalur Absorpsi Vili ke Sirkulasi:</span>
                  </div>
                  <p className="leading-relaxed font-normal text-ink/90">
                    Asam amino bebas diserap enterosit melalui kotranspor Na⁺ menuju kapiler darah vili → bermuara ke <strong>Vena Porta Hepatika ke Hati</strong> untuk sintesis albumin, enzim tubuh, dan perbaikan jaringan.
                  </p>
                </div>
              </div>
            )}

            {/* Lipid Flow */}
            {selectedNutrient === "lemak" && (
              <div className="space-y-3">
                {/* Stage 1: Mouth & Stomach */}
                <div className="p-4 rounded-2xl border border-border/70 bg-surface shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-ink">Tahap 1 &amp; 2: Mulut &amp; Lambung</span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-surface-2 text-muted border border-border/60">
                      Lipase Lingual (Minor &lt;10%)
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-ink/90 font-normal leading-relaxed">
                    Hanya terjadi hidrolisis minimal karena molekul lipid masih menggumpal besar dan tidak larut dalam fase air asam lambung.
                  </p>
                </div>

                {/* Stage 2: Duodenum Emulsion */}
                <div className="p-4 rounded-2xl border border-border/70 bg-surface shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-ink">Tahap Kunci: Duodenum (Emulsifikasi)</span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      Garam Empedu Hati
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-ink/90 font-normal leading-relaxed">
                    Garam empedu amfifatik menurunkan tegangan permukaan, memecah gumpalan lipid besar menjadi tetesan emulsi mikroskopis (misel), melipatgandakan area kontak hidrolisis secara drastis.
                  </p>
                </div>

                {/* Stage 3: Small Intestine Lipolysis */}
                <div className="p-4 rounded-2xl border border-border/70 bg-surface shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-ink">Tahap 3: Usus Halus (Lipolisis Pankreas)</span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/15">
                      Lipase Pankreas (Steapsin)
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-ink/90 font-normal leading-relaxed">
                    Lipase pankreas memecah trigliserida teremulsi menjadi <strong>Monogliserida dan 2 Asam Lemak Bebas</strong>. Di dalam enterosit, lemak dirakit ulang bersama protein apolipoprotein membentuk partikel <strong>Kilomikron</strong>.
                  </p>
                </div>

                {/* Special Lymphatic Absorption Route Callout */}
                <div className="p-4 rounded-2xl bg-accent/[0.04] border border-accent/20 text-xs sm:text-[13px] text-ink space-y-1">
                  <div className="font-bold text-accent-dark dark:text-accent-light flex items-center gap-1.5">
                    <span>💧</span>
                    <span>Jalur Khusus Pembuluh Limfe Lakteal:</span>
                  </div>
                  <p className="leading-relaxed font-normal text-ink/90">
                    Partikel kilomikron terlalu besar untuk menembus kapiler darah biasa; ia diserap masuk ke <strong>Pembuluh Limfe Lakteal Buntu</strong> di dalam vili → dialirkan via <em>Duktus Torasikus</em> dada langsung ke vena subklavia kiri tanpa melewati hati terlebih dahulu!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
