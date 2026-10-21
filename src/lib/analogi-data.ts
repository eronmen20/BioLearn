export interface AnalogiItem {
  id: string;
  term: string;
  scientificName?: string;
  analogyTitle: string;
  emoji: string;
  story: string;
  termEn?: string;
  analogyTitleEn?: string;
  storyEn?: string;
}

export interface AnalogiGroup {
  babId: string;
  subKey: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  items: AnalogiItem[];
}

export const ANALOGI_DATABASE: AnalogiGroup[] = [
  // ──────────────────────────────────────────
  // BAB BAKTERI
  // ──────────────────────────────────────────
  {
    babId: "bakteri",
    subKey: "sub.bakteri1",
    title: "Ibaratnya Begini 💡",
    titleEn: "Picture It Like This 💡",
    subtitle: "Biar nggak pusing sama istilah kaku, bayangin karakteristik bakteri lewat analogi ini:",
    subtitleEn: "To understand bacterial traits easily, imagine them through these everyday analogies:",
    items: [
      {
        id: "prokariotik-studio",
        term: "Sel Prokariotik",
        scientificName: "Tanpa Membran Inti",
        analogyTitle: "Kamar Kos Tipe Studio Minimalis",
        emoji: "🏠",
        story: "Di sel eukariotik (seperti manusia), ada sekat kamar tidur khusus DNA (nukleus). Nah kalau bakteri itu ibarat kamar kos tipe studio: ruangannya plong tanpa sekat. DNA sirkulernya santai mengapung di tengah ruangan (nukleoid) bersama perabotan sel lainnya.",
        termEn: "Prokaryotic Cell",
        analogyTitleEn: "Minimalist Studio Apartment",
        storyEn: "Unlike human cells with separate walled rooms for DNA (nucleus), bacteria are like open studio apartments. Their circular DNA floats freely in the center (nucleoid) alongside other cell gear.",
      },
      {
        id: "ukuran-mikro",
        term: "Ukuran Mikroskopis (0,5–5 μm)",
        scientificName: "Skala Sel Bakteri",
        analogyTitle: "Butiran Pasir di Lapangan Bola",
        emoji: "🔬",
        story: "Saking kecilnya bakteri, di satu ujung runcing jarum pentul saja bisa berkumpul ratusan ribu hingga jutaan bakteri berpesta tanpa berdesakan.",
        termEn: "Microscopic Size (0.5–5 μm)",
        analogyTitleEn: "Grain of Sand on a Soccer Field",
        storyEn: "Bacteria are so tiny that hundreds of thousands can gather and party on the single tip of a sewing needle without feeling cramped.",
      },
      {
        id: "dinding-peptidoglikan",
        term: "Dinding Sel Peptidoglikan",
        scientificName: "Pelindung Bentuk Sel",
        analogyTitle: "Rangka Beton Tahan Gempa",
        emoji: "🧱",
        story: "Bakteri sering menyerap air dari lingkungan sekitarnya. Tanpa rangka dinding peptidoglikan yang kokoh seperti beton bertulang, sel bakteri bakal gampang menggelembung dan meletus.",
        termEn: "Peptidoglycan Cell Wall",
        analogyTitleEn: "Earthquake-Proof Concrete Frame",
        storyEn: "Bacteria constantly absorb water. Without a tough peptidoglycan wall acting like reinforced concrete, the cell would over-inflate and burst.",
      },
    ],
  },
  {
    babId: "bakteri",
    subKey: "sub.bakteri2",
    title: "Ibaratnya Begini 💡",
    titleEn: "Picture It Like This 💡",
    subtitle: "Pahami fungsi tiap organel dan bagian bakteri lewat perumpamaan berikut:",
    subtitleEn: "Understand each bacterial organelle through these real-world comparisons:",
    items: [
      {
        id: "plasmid-flashdisk",
        term: "Plasmid",
        scientificName: "Cincin DNA Ekstrakromosomal",
        analogyTitle: "Flashdisk Berisi Cheat Game",
        emoji: "💾",
        story: "Bakteri punya hardisk utama berisi panduan hidup (DNA nukleoid). Tapi plasmid ini seperti flashdisk kecil terpisah berisi cheat rahasia, misalnya resep kebal antibiotik. Enaknya lagi, flashdisk ini bisa di-copy dan dipinjamkan ke teman bakteri lainnya.",
        termEn: "Plasmid",
        analogyTitleEn: "USB Drive with Secret Cheat Codes",
        storyEn: "Bacteria have a main hard drive (nucleoid DNA), but plasmids are like portable USB drives holding special cheat codes, like antibiotic resistance recipes, which can be easily shared.",
      },
      {
        id: "kapsul-jas-hujan",
        term: "Kapsul Lendir",
        scientificName: "Lapisan Polisakarida Terluar",
        analogyTitle: "Jas Hujan Super Licin",
        emoji: "🧥",
        story: "Kapsul lendir di luar bakteri itu seperti jas hujan berlapis sabun. Saat sel darah putih imun tubuh mau menangkap dan memangsa bakteri patogen, mereka malah terpeleset karena permukaannya yang sangat licin.",
        termEn: "Slime Capsule",
        analogyTitleEn: "Slippery Raincoat",
        storyEn: "The outer capsule is like a soap-coated raincoat. When immune white blood cells try to grab and swallow pathogenic bacteria, they slip right off.",
      },
      {
        id: "pilus-kabel-data",
        term: "Pilus Seks (Jembatan)",
        scientificName: "Pili Konjugasi",
        analogyTitle: "Kabel Data Transfer File",
        emoji: "🔌",
        story: "Saat satu bakteri mau membagikan salinan plasmid ke bakteri lain, dia memanjangkan saluran mirip pipa kecil yang bertindak persis seperti kabel data penghubung dua perangkat.",
        termEn: "Sex Pilus",
        analogyTitleEn: "Data Transfer Cable",
        storyEn: "When one bacterium wants to share its plasmid with another, it extends a tiny conduit that works just like a USB cable connecting two computers.",
      },
      {
        id: "endospora-bunker",
        term: "Endospora",
        scientificName: "Bentuk Pertahanan Diri",
        analogyTitle: "Bunker Kiamat Tahan Nuklir",
        emoji: "🛡️",
        story: "Saat cuaca di luar sangat mengerikan (kekeringan ekstrem, radiasi, atau panas membara), bakteri mengemas DNA intinya di dalam kapsul baja tebal yang disebut endospora. Bakteri bisa 'mati suri' di bunker ini selama puluhan tahun sampai kondisi luar kembali nyaman.",
        termEn: "Endospore",
        analogyTitleEn: "Fallout Survival Bunker",
        storyEn: "When outer conditions turn extreme (drought, boiling heat, chemical threats), bacteria lock their DNA inside an armored bunker called an endospore, hibernating for decades until safety returns.",
      },
      {
        id: "flagela-baling-baling",
        term: "Flagela",
        scientificName: "Alat Gerak Sel",
        analogyTitle: "Baling-baling Mesin Tempel Kapal",
        emoji: "🛥️",
        story: "Flagela bukan sekadar ekor yang melambai, tapi benar-benar punya motor putar biologis di pangkalnya yang berputar ratusan kali per detik untuk mendorong bakteri meluncur menuju sumber nutrisi.",
        termEn: "Flagella",
        analogyTitleEn: "Boat Outboard Motor Propeller",
        storyEn: "Flagella are genuine rotary motors spinning hundreds of times per second at their base, propelling the bacterium directly toward food sources.",
      },
    ],
  },
  {
    babId: "bakteri",
    subKey: "sub.bakteri3",
    title: "Ibaratnya Begini 💡",
    titleEn: "Picture It Like This 💡",
    subtitle: "Cara bakteri berkembang biak dan berbagi gen ternyata seru kalau dibayangkan seperti ini:",
    subtitleEn: "How bacteria multiply and share genes becomes fascinating with these stories:",
    items: [
      {
        id: "pembelahan-biner-fotokopi",
        term: "Pembelahan Biner",
        scientificName: "Reproduksi Aseksual",
        analogyTitle: "Mesin Fotokopi Otomatis Super Cepat",
        emoji: "🖨️",
        story: "Bakteri tidak butuh pasangan untuk punya keturunan. Satu sel cukup menduplikasi DNA-nya, lalu membelah di tengah menjadi dua kloningan identik. Proses ini hanya makan waktu 20 menit, makanya semangkuk sup yang ditinggal semalam bisa dipenuhi jutaan bakteri.",
        termEn: "Binary Fission",
        analogyTitleEn: "High-Speed Photocopy Machine",
        storyEn: "Bacteria need no partner. One cell replicates its DNA and divides in half into two identical clones in just 20 minutes, which is why food left out overnight teems with bacteria by morning.",
      },
      {
        id: "transformasi-looting",
        term: "Transformasi Genetik",
        scientificName: "Penyerapan DNA Bebas",
        analogyTitle: "Looting Senjata Jatuh di Game Battle Royale",
        emoji: "🎮",
        story: "Saat ada bakteri lain yang mati dan hancur di sekitarnya, potongan DNA-nya berserakan di tanah. Bakteri yang masih hidup bisa memungut (looting) serpihan DNA itu dan memasukkannya ke tubuh sendiri untuk mendapatkan kemampuan baru.",
        termEn: "Genetic Transformation",
        analogyTitleEn: "Looting Dropped Weapons in Battle Royale",
        storyEn: "When a nearby bacterium dies and breaks apart, its DNA fragments scatter around. Surviving bacteria can pick up (loot) those scraps and incorporate them to gain brand-new abilities.",
      },
      {
        id: "transduksi-kurir-nyasar",
        term: "Transduksi",
        scientificName: "Transfer via Bakteriofag",
        analogyTitle: "Kurir Paket Salah Masuk Kotak",
        emoji: "📦",
        story: "Virus bakteriofag menginfeksi bakteri A, lalu saat merakit diri, virus tersebut tidak sengaja membungkus potongan DNA bakteri A. Ketika virus itu terbang dan menyuntikkan isinya ke bakteri B, bakteri B malah menerima potongan gen dari bakteri A.",
        termEn: "Transduction",
        analogyTitleEn: "Courier Delivering the Wrong Package",
        storyEn: "A bacteriophage virus mistakenly packs a piece of bacterium A's DNA into its capsule. When it attacks bacterium B, bacterium B accidentally receives genetic gifts from bacterium A.",
      },
    ],
  },
  {
    babId: "bakteri",
    subKey: "sub.bakteri4",
    title: "Ibaratnya Begini 💡",
    titleEn: "Picture It Like This 💡",
    subtitle: "Pahami perbedaan Gram positif/negatif dan peran bakteri lewat analogi ini:",
    subtitleEn: "Understand Gram staining differences and bacterial roles clearly:",
    items: [
      {
        id: "gram-jaket",
        term: "Gram Positif vs Gram Negatif",
        scientificName: "Struktur Dinding & Pewarnaan",
        analogyTitle: "Kaos Wol Tebal vs Jaket Parasut Berlapis",
        emoji: "🧥",
        story: "Gram positif punya dinding peptidoglikan sangat tebal dan empuk seperti kaos rajut wol, sehingga mudah menyerap dan menahan pewarna ungu kristal violet. Sebaliknya, Gram negatif punya dinding tipis tapi dilapisi membran luar tahan air mirip jaket parasut, sehingga pewarna ungu mudah luntur dan bakteri tampak merah saat diwarnai safranin.",
        termEn: "Gram-Positive vs Gram-Negative",
        analogyTitleEn: "Thick Wool Sweater vs Layered Windbreaker",
        storyEn: "Gram-positive bacteria have thick, absorbent peptidoglycan walls like a wool sweater, locking in purple dye. Gram-negative bacteria have thin walls covered by a slippery outer membrane like a raincoat, resisting standard dyes and appearing red.",
      },
      {
        id: "peran-probiotik",
        term: "Bakteri Baik (Probiotik)",
        scientificName: "Misalnya Lactobacillus di Usus",
        analogyTitle: "Tetangga Ramah Penjaga Kompleks",
        emoji: "🤝",
        story: "Tidak semua bakteri itu musuh. Triliunan bakteri di usus kita bertindak seperti tetangga ramah yang memenuhi seluruh kavling perumahan. Karena semua rumah sudah ditempati bakteri baik, bakteri jahat penyebab diare tidak punya tempat untuk mampir dan menempel.",
        termEn: "Beneficial Bacteria (Probiotics)",
        analogyTitleEn: "Friendly Neighborhood Watch",
        storyEn: "Trillions of gut bacteria act like a friendly neighborhood watch occupying every vacant lot, leaving no room for harmful invaders to settle down and cause infections.",
      },
    ],
  },

  // ──────────────────────────────────────────
  // BAB SEL
  // ──────────────────────────────────────────
  {
    babId: "sel",
    subKey: "sub.sel1",
    title: "Ibaratnya Begini 💡",
    titleEn: "Picture It Like This 💡",
    subtitle: "Bayangkan sel hewan dan tumbuhan seperti kota metropolitan modern:",
    subtitleEn: "Picture plant and animal cells like a bustling modern metropolis:",
    items: [
      {
        id: "nukleus-direktur",
        term: "Nukleus (Inti Sel)",
        scientificName: "Pusat Kendali Genetik",
        analogyTitle: "Ruang Direktur Utama & Brankas Master",
        emoji: "👑",
        story: "Nukleus adalah ruang kantor kepala eksekutif. Di dalam brankasnya tersimpan cetak biru master DNA lengkap seluruh operasional pabrik tubuh. Dari ruangan ini, perintah dikirim ke seluruh organel sel.",
        termEn: "Nucleus",
        analogyTitleEn: "CEO Office & Blueprint Vault",
        storyEn: "The nucleus is the master office containing all the master architectural blueprints (DNA) and directing every department across the cellular city.",
      },
      {
        id: "mitokondria-pltu",
        term: "Mitokondria",
        scientificName: "Respirasi Seluler & ATP",
        analogyTitle: "Pembangkit Listrik Kota (PLTU)",
        emoji: "⚡",
        story: "Mitokondria membakar bahan bakar makanan (glukosa) bersama oksigen untuk menghasilkan baterai energi siap pakai bernama ATP. Tanpa pembangkit listrik ini, semua aktivitas sel akan mati lampu.",
        termEn: "Mitochondria",
        analogyTitleEn: "Metropolitan Power Plant",
        storyEn: "Mitochondria burn fuel (glucose) with oxygen to produce ready-to-use biological energy currency (ATP), keeping the entire cellular city powered up.",
      },
      {
        id: "golgi-kantor-pos",
        term: "Aparatus Golgi",
        scientificName: "Sekresi & Modifikasi Protein",
        analogyTitle: "Gudang Ekspedisi & Packing Kurir",
        emoji: "📦",
        story: "Setelah protein dirakit oleh ribosom, paket protein tersebut dikirim ke Aparatus Golgi. Di sini protein disortir, dimodifikasi, ditempeli label alamat, lalu dibungkus rapi sebelum dikirim ke luar sel.",
        termEn: "Golgi Apparatus",
        analogyTitleEn: "Sorting & Shipping Hub",
        storyEn: "After proteins are manufactured, they arrive at the Golgi hub to be inspected, labeled, packaged, and shipped out to their destinations.",
      },
      {
        id: "lisosom-truk-sampah",
        term: "Lisosom",
        scientificName: "Pencernaan Intraseluler",
        analogyTitle: "Dinas Kebersihan & Truk Sampah Daur Ulang",
        emoji: "♻️",
        story: "Lisosom dilengkapi enzim pencerna asam yang kuat. Tugasnya menelan organel yang sudah rusak atau bakteri penyusup, lalu mencacahnya menjadi bahan dasar yang bisa didaur ulang kembali.",
        termEn: "Lysosome",
        analogyTitleEn: "Recycling & Sanitation Department",
        storyEn: "Packed with digestive enzymes, lysosomes patrol the cell to break down worn-out parts and foreign invaders, recycling useful raw materials.",
      },
    ],
  },

  // ──────────────────────────────────────────
  // BAB VIRUS
  // ──────────────────────────────────────────
  {
    babId: "virus",
    subKey: "sub.virus1",
    title: "Ibaratnya Begini 💡",
    titleEn: "Picture It Like This 💡",
    subtitle: "Pahami sifat misterius virus lewat perumpamaan berikut:",
    subtitleEn: "Grasp the mysterious nature of viruses through these relatable pictures:",
    items: [
      {
        id: "virus-file-flashdisk",
        term: "Sifat Aseluler Virus",
        scientificName: "Bukan Sel Hidup Mandiri",
        analogyTitle: "File Malware Tanpa Komputer",
        emoji: "💾",
        story: "Virus itu bukan makhluk hidup mandiri karena tidak punya mesin sel atau metabolisme. Dia ibarat file malware di dalam flashdisk: saat tergeletak di meja, dia benda mati pasif. Tapi begitu dicolokkan ke komputer inang (sel hidup), barulah kode jahatnya bekerja membajak seluruh sistem.",
        termEn: "Acellular Nature of Viruses",
        analogyTitleEn: "Malware File Without a Computer",
        storyEn: "A virus isn't a standalone living creature because it lacks cellular machinery. It's like malware on a flash drive: completely inert when sitting on a desk, but hijack-capable the moment it enters a host computer.",
      },
      {
        id: "litik-lisogenik",
        term: "Daur Litik vs Lisogenik",
        scientificName: "Siklus Replikasi Virus",
        analogyTitle: "Perampok Kasar vs Mata-mata Tidur",
        emoji: "🕵️",
        story: "Daur litik itu seperti perampok terang-terangan yang mendobrak masuk, merampok bahan sel untuk merakit virus baru, lalu meledakkan rumahnya seketika. Daur lisogenik itu seperti agen mata-mata rahasia yang menyusup tenang dan ikut hidup di DNA inang bertahun-tahun tanpa gejala, sampai suatu hari kondisi inang melemah baru dia bangun meledakkan sel.",
        termEn: "Lytic vs Lysogenic Cycle",
        analogyTitleEn: "Smash-and-Grab Robber vs Sleeper Agent Spy",
        storyEn: "The lytic cycle is a smash-and-grab raid that forces the cell to produce viruses and bursts it open. The lysogenic cycle is a sleeper agent quietly inserting its code into the host DNA for years, waiting for immunity to drop before striking.",
      },
    ],
  },
];

export function getAnalogiForSub(babId: string, subKey?: string, subIdx?: number): AnalogiGroup | null {
  if (!babId) return null;
  // Match by babId and subKey
  if (subKey) {
    const found = ANALOGI_DATABASE.find(
      (g) => g.babId === babId && (g.subKey === subKey || g.subKey === `sub.${babId}${subIdx !== undefined ? subIdx + 1 : ""}`)
    );
    if (found) return found;
  }
  // Fallback by index sub.<babId><idx+1>
  if (subIdx !== undefined) {
    const fallbackKey = `sub.${babId}${subIdx + 1}`;
    const found = ANALOGI_DATABASE.find((g) => g.babId === babId && g.subKey === fallbackKey);
    if (found) return found;
  }
  return null;
}
