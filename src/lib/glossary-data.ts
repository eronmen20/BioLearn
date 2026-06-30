export interface GlossaryTerm {
  term: { id: string; en: string };
  def: { id: string; en: string };
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: { id: "Nukleus", en: "Nucleus" },
    def: {
      id: "Organel yang mengandung DNA dan mengontrol aktivitas sel.",
      en: "Organelle containing DNA that controls cell activities.",
    },
  },
  {
    term: { id: "Mitokondria", en: "Mitochondria" },
    def: {
      id: "Organel tempat respirasi seluler, menghasilkan ATP sebagai energi.",
      en: "Organelle for cellular respiration, producing ATP energy.",
    },
  },
  {
    term: { id: "Ribosom", en: "Ribosome" },
    def: {
      id: "Organel tempat sintesis protein berlangsung.",
      en: "Organelle where protein synthesis occurs.",
    },
  },
  {
    term: { id: "Fotosintesis", en: "Photosynthesis" },
    def: {
      id: "Proses tumbuhan mengubah CO₂ dan air menjadi glukosa dan O₂ dengan bantuan cahaya.",
      en: "Process by which plants convert CO₂ and water into glucose and O₂ using light.",
    },
  },
  {
    term: { id: "Amilase", en: "Amylase" },
    def: {
      id: "Enzim yang mengubah amilum/pati menjadi maltosa.",
      en: "Enzyme that converts starch into maltose.",
    },
  },
  {
    term: { id: "Enzim", en: "Enzyme" },
    def: {
      id: "Protein yang berfungsi sebagai katalisator biologis, mempercepat reaksi kimia.",
      en: "Proteins that act as biological catalysts, speeding up chemical reactions.",
    },
  },
  {
    term: { id: "DNA", en: "DNA" },
    def: {
      id: "Asam deoksiribonukleat, molekul pembawa informasi genetik.",
      en: "Deoxyribonucleic acid, the molecule carrying genetic information.",
    },
  },
  {
    term: { id: "RNA", en: "RNA" },
    def: {
      id: "Asam ribonukleat, berperan dalam sintesis protein.",
      en: "Ribonucleic acid, involved in protein synthesis.",
    },
  },
  {
    term: { id: "Kodon", en: "Codon" },
    def: {
      id: "Urutan 3 basa nitrogen pada mRNA yang mengkode satu asam amino.",
      en: "A sequence of 3 nitrogen bases on mRNA that codes for one amino acid.",
    },
  },
  {
    term: { id: "Seleksi Alam", en: "Natural Selection" },
    def: {
      id: "Mekanisme evolusi di mana organisme dengan sifat adaptif lebih mampu bertahan dan bereproduksi.",
      en: "Evolution mechanism where organisms with adaptive traits survive and reproduce better.",
    },
  },
  {
    term: { id: "Homeostasis", en: "Homeostasis" },
    def: {
      id: "Kemampuan organisme mempertahankan kondisi internal yang stabil.",
      en: "The ability of an organism to maintain stable internal conditions.",
    },
  },
  {
    term: { id: "Hormon", en: "Hormone" },
    def: {
      id: "Zat kimia yang diproduksi oleh kelenjar endokrin dan mengatur berbagai fungsi tubuh.",
      en: "Chemical substances produced by endocrine glands that regulate body functions.",
    },
  },
  {
    term: { id: "Sinaps", en: "Synapse" },
    def: {
      id: "Celah antar neuron tempat transmisi impuls melalui neurotransmitter.",
      en: "Gap between neurons where impulses are transmitted via neurotransmitters.",
    },
  },
  {
    term: { id: "Ekosistem", en: "Ecosystem" },
    def: {
      id: "Interaksi antara makhluk hidup (biotik) dan lingkungan fisiknya (abiotik).",
      en: "Interaction between living organisms (biotic) and their physical environment (abiotic).",
    },
  },
  {
    term: { id: "Gen", en: "Gene" },
    def: {
      id: "Segmen DNA yang mengkode sifat tertentu dan diwariskan.",
      en: "A segment of DNA that codes for a specific trait and is inherited.",
    },
  },
  {
    term: { id: "Mutasi", en: "Mutation" },
    def: {
      id: "Perubahan permanen pada urutan DNA yang dapat diwariskan.",
      en: "A permanent change in DNA sequence that can be inherited.",
    },
  },
  {
    term: { id: "Metabolisme", en: "Metabolism" },
    def: {
      id: "Keseluruhan reaksi kimia dalam tubuh untuk mempertahankan kehidupan.",
      en: "All chemical reactions in the body that sustain life.",
    },
  },
  {
    term: { id: "Aterosklerosis", en: "Atherosclerosis" },
    def: {
      id: "Pengerasan dan penyempitan pembuluh darah arteri akibat penumpukan plak.",
      en: "Hardening and narrowing of arteries due to plaque buildup.",
    },
  },
  {
    term: { id: "Bakteri", en: "Bacteria" },
    def: {
      id: "Mikroorganisme prokariotik uniseluler yang termasuk kingdom Monera.",
      en: "Unicellular prokaryotic microorganisms belonging to kingdom Monera.",
    },
  },
  {
    term: { id: "Peptidoglikan", en: "Peptidoglycan" },
    def: {
      id: "Polimer penyusun dinding sel bakteri yang memberikan kekuatan struktural.",
      en: "Polymer that makes up bacterial cell walls, providing structural strength.",
    },
  },
  {
    term: { id: "Plasmid", en: "Plasmid" },
    def: {
      id: "DNA sirkuler kecil di luar kromosom bakteri, sering membawa gen resistensi antibiotik.",
      en: "Small circular DNA outside bacterial chromosome, often carrying antibiotic resistance genes.",
    },
  },
  {
    term: { id: "Endospora", en: "Endospore" },
    def: {
      id: "Bentuk dorman bakteri yang tahan terhadap kondisi ekstrem seperti panas dan kekeringan.",
      en: "Dormant form of bacteria resistant to extreme conditions like heat and drought.",
    },
  },
  {
    term: { id: "Konjugasi", en: "Conjugation" },
    def: {
      id: "Transfer materi genetik antar bakteri melalui kontak langsung menggunakan pili.",
      en: "Transfer of genetic material between bacteria through direct contact using pili.",
    },
  },
  {
    term: { id: "Gram Positif", en: "Gram Positive" },
    def: {
      id: "Bakteri dengan dinding peptidoglikan tebal yang menyerap pewarna kristal violet dan tampak ungu.",
      en: "Bacteria with thick peptidoglycan wall that absorbs crystal violet dye and appears purple.",
    },
  },
];