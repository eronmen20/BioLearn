"use client";

import Link from "next/link";
import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Camera,
  Eye,
  Grid,
  Info,
  Layers,
  Maximize2,
  Minimize2,
  Move,
  Plus,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sparkles,
  Sun,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Lock,
  X,
} from "lucide-react";
import { useLangStore } from "@/lib/lang-store";
import { useAuthStore } from "@/lib/auth-store";
import { useIsMounted } from "@/lib/use-is-mounted";

export interface SpecimenHotspot {
  id: string;
  nameId: string;
  nameEn: string;
  descId: string;
  descEn: string;
  x: number; // Persentase posisi 0-100 pada preparat
  y: number;
}

export interface Specimen {
  id: string;
  nameId: string;
  nameEn: string;
  latinName?: string;
  category: "tumbuhan" | "hewan" | "mikroba" | "custom";
  descriptionId: string;
  descriptionEn: string;
  imageUrl: string;
  recommendedMag: number; // 4, 10, 40, atau 100
  hotspots?: SpecimenHotspot[];
  targetFocus: number; // Nilai fokus optimal
}

const DEFAULT_SPECIMENS: Specimen[] = [
  {
    id: "bawang",
    nameId: "Sel Epidermis Bawang Merah",
    nameEn: "Onion Epidermal Cells",
    latinName: "Allium cepa",
    category: "tumbuhan",
    descriptionId:
      "Lapisan tipis epidermis bagian dalam umbi lapis bawang merah. Memperlihatkan susunan sel berbentuk persegi panjang rapi seperti susunan batu bata, dinding sel tebal, nukleus di tepi, dan rongga vakuola besar.",
    descriptionEn:
      "Thin epidermal peel of onion bulb showing neat brick-like rectangular plant cells, rigid cell walls, peripheral nuclei, and large central vacuoles.",
    imageUrl: "/images/preparat/bawang.svg",
    recommendedMag: 10,
    targetFocus: 0,
    hotspots: [
      {
        id: "dinding",
        nameId: "Dinding Sel (Cell Wall)",
        nameEn: "Cell Wall",
        descId: "Lapisan kaku pelindung luar yang tersusun dari selulosa, memberikan bentuk tetap pada sel tumbuhan.",
        descEn: "Rigid outer protective layer composed of cellulose, maintaining structural integrity.",
        x: 48,
        y: 22,
      },
      {
        id: "nukleus",
        nameId: "Nukleus / Inti Sel",
        nameEn: "Nucleus",
        descId: "Organel bulat berwarna gelap di tepi sel yang mengandung materi genetik (DNA) dan mengontrol aktivitas sel.",
        descEn: "Dark spherical organelle located peripherally, harboring DNA and governing cellular processes.",
        x: 73,
        y: 27,
      },
      {
        id: "sitoplasma",
        nameId: "Sitoplasma & Vakuola",
        nameEn: "Cytoplasm & Vacuole",
        descId: "Matriks cairan tempat metabolisme berlangsung serta vakuola besar penyimpan cairan dan pigmen antosianin.",
        descEn: "Gel-like matrix supporting organelles and large vacuole holding fluids and anthocyanin pigments.",
        x: 41,
        y: 46,
      },
    ],
  },
  {
    id: "stomata",
    nameId: "Stomata Daun",
    nameEn: "Leaf Stomata",
    latinName: "Rhoeo discolor",
    category: "tumbuhan",
    descriptionId:
      "Aparatus stomata pada permukaan abaksial daun. Terdiri dari sepasang sel penjaga berbentuk ginjal yang mengapit celah porus stoma, dikelilingi oleh sel-sel tetangga epidermis berlekuk.",
    descriptionEn:
      "Stomatal complex on leaf lower epidermis: a pair of kidney-shaped guard cells bounding the central stoma aperture, encircled by puzzle-shaped epidermal cells.",
    imageUrl: "/images/preparat/stomata.svg",
    recommendedMag: 40,
    targetFocus: 0,
    hotspots: [
      {
        id: "guard-cell",
        nameId: "Sel Penjaga (Guard Cell)",
        nameEn: "Guard Cells",
        descId: "Sepasang sel berbentuk ginjal yang dapat membesar/mengecil untuk mengatur buka-tutupnya porus stomata.",
        descEn: "Pair of specialized reniform cells regulating aperture expansion via turgor changes.",
        x: 47,
        y: 48,
      },
      {
        id: "porus",
        nameId: "Porus Stoma (Celah Stomata)",
        nameEn: "Stomatal Pore",
        descId: "Celah lubang tempat terjadinya pertukaran gas O2, CO2, serta transpirasi uap air.",
        descEn: "Central microscopic aperture for CO2/O2 exchange and transpirational water loss.",
        x: 50,
        y: 48,
      },
      {
        id: "kloroplas",
        nameId: "Kloroplas Sel Penjaga",
        nameEn: "Guard Cell Chloroplasts",
        descId: "Butir-butir hijau organel fotosintesis yang hanya ditemukan pada sel penjaga, tidak pada sel epidermis umum.",
        descEn: "Green photosynthetic plastids uniquely present within guard cells, absent in ordinary epidermal cells.",
        x: 56,
        y: 44,
      },
      {
        id: "tetangga",
        nameId: "Sel Tetangga / Epidermis",
        nameEn: "Subsidiary Epidermal Cells",
        descId: "Sel-sel pelindung daun berbentuk lekukan puzzle yang mengelilingi aparatus stomata.",
        descEn: "Interlocking jigsaw-like epidermal pavement cells enclosing the stomatal complex.",
        x: 28,
        y: 12,
      },
    ],
  },
  {
    id: "embrio-ayam",
    nameId: "Embrio Ayam (Whole Mount)",
    nameEn: "Chick Embryo (48-72 Hours)",
    latinName: "Gallus gallus domesticus",
    category: "hewan",
    descriptionId:
      "Preparat utuh (whole mount) perkembangan embrio ayam usia inkubasi 48–72 jam. Memperlihatkan lengkung tubuh (torsi dan fleksi), vesikula otak, cawan optik bakal mata, tabung jantung tubular berdenyut, dan deretan somit mesoderm.",
    descriptionEn:
      "Whole mount chick embryo at 48-72h of incubation displaying body torsion, primary brain vesicles, optic cups, s-shaped tubular heart, and paired segmental somites.",
    imageUrl: "/images/preparat/embrio-ayam.svg",
    recommendedMag: 4,
    targetFocus: 0,
    hotspots: [
      {
        id: "otak",
        nameId: "Vesikula Otak (Brain Vesicles)",
        nameEn: "Brain Vesicles",
        descId: "Perkembangan awal sistem saraf pusat yang terbagi atas prosensefalon, mesensefalon, dan rombensefalon.",
        descEn: "Early cranial neuroepithelium expanding into forebrain, midbrain, and hindbrain vesicles.",
        x: 51,
        y: 20,
      },
      {
        id: "mata",
        nameId: "Cawan Optik & Bakal Lensa",
        nameEn: "Optic Cup & Lens Vesicle",
        descId: "Evaginasi jaringan otak yang membentuk cawan optik retina dan vesikula bakal lensa mata.",
        descEn: "Optic vesicle invagination giving rise to sensory retina and lens primordium.",
        x: 43,
        y: 25,
      },
      {
        id: "jantung",
        nameId: "Tabung Jantung (Tubular Heart)",
        nameEn: "Primitive Heart Loop",
        descId: "Organ fungsional pertama embrio yang berdenyut aktif memompa darah ke pembuluh vitelin kuning telur.",
        descEn: "First functional embryonic organ actively looping to circulate blood through extraembryonic vitelline vessels.",
        x: 47,
        y: 44,
      },
      {
        id: "somit",
        nameId: "Deretan Somit (Somites)",
        nameEn: "Segmental Somites",
        descId: "Blok-blok mesoderm segmental di kanan-kiri tabung saraf yang akan berkembang menjadi ruas tulang belakang dan otot rangka.",
        descEn: "Bilateral paired mesodermal blocks that differentiate into vertebrae, ribs, and skeletal musculature.",
        x: 51,
        y: 60,
      },
    ],
  },
  {
    id: "sel-darah",
    nameId: "Apusan Darah Manusia",
    nameEn: "Human Blood Smear",
    latinName: "Homo sapiens",
    category: "hewan",
    descriptionId:
      "Apusan darah tepi dengan pewarnaan Giemsa/Wright. Memperlihatkan mayoritas eritrosit (sel darah merah) bikonkaf tanpa inti, leukosit neutrofil dengan inti berlobus khas, limfosit berinti bundar padat, dan fragmen trombosit.",
    descriptionEn:
      "Peripheral blood film displaying abundant biconcave enucleated erythrocytes, multilobed neutrophils, dense spherical lymphocytes, and clustered thrombocytes.",
    imageUrl: "/images/preparat/sel-darah.svg",
    recommendedMag: 40,
    targetFocus: 0,
    hotspots: [
      {
        id: "eritrosit",
        nameId: "Eritrosit (Sel Darah Merah)",
        nameEn: "Erythrocyte (Red Blood Cell)",
        descId: "Cakram bikonkaf tanpa inti berisi hemoglobin untuk mentranspor oksigen ke seluruh tubuh.",
        descEn: "Anucleate biconcave disc packed with hemoglobin for respiratory gas transport.",
        x: 22,
        y: 22,
      },
      {
        id: "neutrofil",
        nameId: "Neutrofil (Leukosit Granulosit)",
        nameEn: "Neutrophil (WBC)",
        descId: "Sel darah putih terbanyak dengan inti khas berlobus 3–5, berperan sebagai fagositosis garis depan infeksi bakteri.",
        descEn: "Most abundant leukocyte characterized by 3-5 nuclear lobes, performing frontline phagocytosis.",
        x: 44,
        y: 32,
      },
      {
        id: "limfosit",
        nameId: "Limfosit (Agranulosit)",
        nameEn: "Lymphocyte",
        descId: "Sel imun adaptif berinti besar bulat padat yang hampir memenuhi seluruh volume sel (penghasil antibodi & sel T).",
        descEn: "Adaptive immune cell harboring a dense spherical nucleus filling most of the cell volume.",
        x: 56,
        y: 50,
      },
      {
        id: "trombosit",
        nameId: "Trombosit (Keping Darah)",
        nameEn: "Platelets (Thrombocytes)",
        descId: "Fragmen sitoplasma kecil dari megakariosit yang berfungsi dalam proses pembekuan darah (hemostasis).",
        descEn: "Small cytoplasmic cellular fragments essential for blood clotting and hemostasis.",
        x: 68,
        y: 42,
      },
    ],
  },
];

const OBJECTIVES = [
  { mag: 4, label: "4x", ringColor: "#ef4444", total: "40x", titleId: "Scanning", titleEn: "Scanning" },
  { mag: 10, label: "10x", ringColor: "#eab308", total: "100x", titleId: "Perbesaran Rendah", titleEn: "Low Power" },
  { mag: 40, label: "40x", ringColor: "#3b82f6", total: "400x", titleId: "Perbesaran Tinggi", titleEn: "High Power" },
  { mag: 100, label: "100x", ringColor: "#10b981", total: "1000x", titleId: "Imersi Minyak", titleEn: "Oil Immersion" },
];

export function VirtualMicroscopeSimulation() {
  const { lang } = useLangStore();
  const { isAuthenticated } = useAuthStore();
  const mounted = useIsMounted();
  const isGuest = mounted && !isAuthenticated;

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [lockedSpecimenTitle, setLockedSpecimenTitle] = useState("");

  // State Preparat
  const [specimens, setSpecimens] = useState<Specimen[]>(DEFAULT_SPECIMENS);
  const [activeSpecimenId, setActiveSpecimenId] = useState<string>("bawang");

  // State Optik Mikroskop
  const [mag, setMag] = useState<number>(10);
  const [coarseFocus, setCoarseFocus] = useState<number>(-7);
  const [fineFocus, setFineFocus] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(100);
  const [lightFilter, setLightFilter] = useState<"natural" | "blue" | "warm">("natural");

  // State Meja Preparat (Translasi X dan Y)
  const [stageX, setStageX] = useState<number>(0);
  const [stageY, setStageY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // State Overlay & Fitur
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [activeHotspot, setActiveHotspot] = useState<SpecimenHotspot | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(true);

  // Ambil preparat yang dipublikasikan oleh Admin via API
  useEffect(() => {
    let isMounted = true;
    async function fetchPublicSpecimens() {
      try {
        const res = await fetch("/api/mikroskop");
        if (!res.ok) return;
        const data = await res.json();
        if (data?.specimens && Array.isArray(data.specimens) && data.specimens.length > 0) {
          // Map DB keys to component Specimen interface
          const mapped: Specimen[] = data.specimens.map((item: any) => ({
            id: item.id,
            nameId: item.name_id || item.nameId || "Tanpa Nama",
            nameEn: item.name_en || item.nameEn || item.name_id || "Untitled",
            latinName: item.latin_name || item.latinName || "",
            category: item.category || "tumbuhan",
            descriptionId: item.description_id || item.descriptionId || "",
            descriptionEn: item.description_en || item.descriptionEn || "",
            imageUrl: item.image_url || item.imageUrl || "/images/preparat/bawang.svg",
            recommendedMag: Number(item.recommended_mag || item.recommendedMag) || 10,
            targetFocus: Number(item.target_focus ?? item.targetFocus ?? 0),
            hotspots: Array.isArray(item.hotspots)
              ? item.hotspots.map((h: any) => ({
                  id: h.id,
                  nameId: h.name_id || h.nameId || "",
                  nameEn: h.name_en || h.nameEn || h.name_id || "",
                  descId: h.desc_id || h.descId || "",
                  descEn: h.desc_en || h.descEn || "",
                  x: Number(h.x) || 50,
                  y: Number(h.y) || 50,
                }))
              : [],
          }));

          if (isMounted) {
            setSpecimens(mapped);
            // Default active specimen if active one not in list
            if (!mapped.some((s) => s.id === activeSpecimenId)) {
              setActiveSpecimenId(mapped[0].id);
              setMag(mapped[0].recommendedMag);
            }
          }
        }
      } catch (err) {
        console.warn("Using default specimens fallback:", err);
      } finally {
        if (isMounted) setIsLoadingApi(false);
      }
    }

    fetchPublicSpecimens();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeSpecimen = specimens.find((s) => s.id === activeSpecimenId) || specimens[0] || DEFAULT_SPECIMENS[0];

  // Hitung total fokus dan keburaman secara smooth (kontinu murni dari - ke + tanpa snap)
  // Pergeseran fokus gabungan: coarse + fine (skala mikro)
  const totalFocus = coarseFocus + fineFocus / 10;
  // Sensitivitas kedalaman fokus (depth of field) bergantung pada perbesaran lensa
  const focusTolerance = mag === 4 ? 2.5 : mag === 10 ? 1.4 : mag === 40 ? 0.7 : 0.35;
  const focusDiff = Math.abs(totalFocus - activeSpecimen.targetFocus);
  
  // Status fokus tajam (untuk memunculkan indikator & pin organel)
  const isInFocus = focusDiff <= focusTolerance;
  
  // Blur bergradasi halus (smooth) dari minus ekstrem (-15) lewat titik optimal (0) sampai plus ekstrem (+15)
  // Tidak ada lompatan mendadak (zero snapping) sehingga siswa merasakan efek putaran knob mekanik mikroskop asli
  const blurPx = Math.min(20, Math.max(0, (focusDiff * 1.35) * (mag >= 40 ? 1.25 : 1.0)));

  // Reset stage & fokus saat ganti preparat (dimulai dari kondisi belum fokus agar siswa memutar knob)
  const handleSelectSpecimen = (id: string) => {
    const idx = specimens.findIndex((s) => s.id === id);
    if (isGuest && idx >= 2) {
      const target = specimens[idx];
      setLockedSpecimenTitle(lang === "en" ? target?.nameEn || "Specimen" : target?.nameId || "Preparat");
      setShowAuthModal(true);
      return;
    }
    setActiveSpecimenId(id);
    const target = specimens.find((s) => s.id === id);
    if (target) {
      setMag(target.recommendedMag);
      setCoarseFocus(-8);
      setFineFocus(0);
      setStageX(0);
      setStageY(0);
      setActiveHotspot(null);
    }
  };

  // Mouse drag pada lensa untuk navigasi preparat
  const handleMouseDown = (e: ReactMouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - stageX, y: e.clientY - stageY };
  };

  const handleMouseMove = (e: ReactMouseEvent) => {
    if (!isDragging) return;
    // Skala geser menyesuaikan perbesaran lensa (semakin zoom, semakin halus)
    const factor = mag / 10;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    // Batas translasi maksimum ±180px
    setStageX(Math.max(-220, Math.min(220, newX)));
    setStageY(Math.max(-220, Math.min(220, newY)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset kontrol mikroskop
  const handleResetControls = () => {
    setCoarseFocus(-8);
    setFineFocus(0);
    setStageX(0);
    setStageY(0);
    setBrightness(100);
    setLightFilter("natural");
  };

  // Capture Snapshot
  const handleCaptureSnapshot = () => {
    setCapturedImages((prev) => [activeSpecimen.imageUrl, ...prev.slice(0, 5)]);
  };

  // Warna filter cahaya
  const filterStyles: Record<string, string> = {
    natural: "hue-rotate-0",
    blue: "hue-rotate-190 saturate-125 contrast-105",
    warm: "sepia-[0.35] saturate-110",
  };

  return (
    <div className="animate-fade-in-up max-w-6xl mx-auto pb-12">
      {/* Tombol Back */}
      <Link
        href="/biolab"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        BioLab
      </Link>

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-2xl sm:text-3xl">🔬</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-ink">
              {lang === "en" ? "Virtual Microscope Lab" : "Laboratorium Mikroskop Virtual"}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
              Interactive Dry-Lab
            </span>
          </div>
          <p className="text-muted text-xs sm:text-sm max-w-2xl">
            {lang === "en"
              ? "Examine biological specimens with realistic optical controls: revolving objectives, coarse/fine focusing, stage translation, and curated specimen slides."
              : "Amati preparat biologi dengan kontrol optik nyata: lensa revolver, pengatur fokus makro/mikro, pergeseran meja preparat, dan preparat terkurasi."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetControls}
            title={lang === "en" ? "Reset controls" : "Reset posisi optik"}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-muted hover:text-ink bg-surface border border-border-light rounded-xl hover:bg-bg-alt transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{lang === "en" ? "Reset Focus" : "Reset Fokus"}</span>
          </button>
        </div>
      </div>

      {/* Grid Utama: Kiri Viewport Mikroskop (Sticky), Kanan Panel Kontrol */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Eyepiece / Viewport Mikroskop (Lg: Col-7, Sticky agar tidak ter-scroll) */}
        <div className="lg:col-span-7 lg:sticky lg:top-20 z-10 bg-card border border-border-light rounded-3xl p-4 sm:p-6 shadow-sm">
          {/* Status Bar Atas Lensa */}
          <div className="flex items-center justify-between mb-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-accent" />
                {lang === "en" ? activeSpecimen.nameEn : activeSpecimen.nameId}
              </span>
              {activeSpecimen.latinName && (
                <span className="text-[11px] text-muted italic hidden sm:inline">
                  ({activeSpecimen.latinName})
                </span>
              )}
            </div>

            {/* Indikator Fokus */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] transition-colors ${
                isInFocus
                  ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-600 border border-amber-500/30"
              }`}
            >
              {isInFocus ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lang === "en" ? "In Focus (Sharp)" : "Fokus Tajam"}
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  {lang === "en" ? "Out of Focus" : "Buram (Atur Fokus)"}
                </>
              )}
            </div>
          </div>

          {/* VIEWPORT OKULER BULAT MIKROSKOP */}
          <div className="relative mx-auto w-full max-w-[420px] aspect-square rounded-full bg-black p-3.5 shadow-2xl overflow-hidden select-none border-8 border-gray-900 ring-4 ring-gray-700/50">
            {/* Viewport Lensa Melingkar */}
            <div
              className="relative w-full h-full rounded-full overflow-hidden cursor-grab active:cursor-grabbing bg-slate-950 flex items-center justify-center"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Gambar Preparat yang Ditranslasikan & Diberi Efek Optik */}
              <div
                className={`w-full h-full relative transition-all duration-100 ease-out ${filterStyles[lightFilter]}`}
                style={{
                  transform: `translate(${stageX}px, ${stageY}px) scale(${mag / 4})`,
                  filter: `blur(${blurPx}px) brightness(${brightness}%)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeSpecimen.imageUrl}
                  alt={activeSpecimen.nameId}
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />

                {/* Hotspot Anotasi Organel (Hanya aktif bila preparat fokus) */}
                {showHotspots &&
                  isInFocus &&
                  activeSpecimen.hotspots?.map((spot) => (
                    <button
                      key={spot.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHotspot(spot);
                      }}
                      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-accent/90 border-2 border-white shadow-lg flex items-center justify-center text-white hover:scale-125 transition-transform z-20 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/85 text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {lang === "en" ? spot.nameEn : spot.nameId}
                      </span>
                    </button>
                  ))}
              </div>

              {/* Efek Vignette / Lingkaran Diafragma Lensa Mikroskop */}
              <div className="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.85)] border-[12px] border-black/80" />

              {/* Refleksi Kaca Lensa Okuler (Realistis) */}
              <div className="absolute top-2 left-6 w-32 h-16 rounded-full bg-gradient-to-b from-white/10 to-transparent transform -rotate-45 pointer-events-none" />

              {/* Overlay Grid Skala Mikrometer (Graticule) */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Garis Silang Crosshair Tengah */}
                  <div className="w-full h-[1px] bg-red-500/40 absolute" />
                  <div className="h-full w-[1px] bg-red-500/40 absolute" />
                  {/* Skala Mikrometer Graduasi */}
                  <div className="w-56 h-56 border border-red-500/30 rounded-full absolute flex items-center justify-center">
                    <span className="text-[9px] text-red-500/70 absolute top-1 font-mono">100 μm</span>
                    <span className="text-[9px] text-red-500/70 absolute bottom-1 font-mono">100 μm</span>
                  </div>
                  <div className="w-28 h-28 border border-red-500/25 rounded-full absolute flex items-center justify-center">
                    <span className="text-[8px] text-red-500/60 absolute top-0.5 font-mono">50 μm</span>
                  </div>
                  {/* Titik Tengah Okuler */}
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 absolute" />
                </div>
              )}
            </div>
          </div>

          {/* Quick Toolbar Bawah Viewport */}
          <div className="flex items-center justify-between mt-4 px-2 text-xs">
            {/* Navigasi Meja Preparat (Drag Helper) */}
            <div className="flex items-center gap-2 text-muted">
              <Move className="w-4 h-4 text-accent" />
              <span className="text-[11px]">
                {lang === "en"
                  ? "Click & drag inside lens to pan specimen"
                  : "Klik & geser preparat di dalam lensa"}
              </span>
            </div>

            {/* Tombol Aksi Snapshot & Grid */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  showGrid
                    ? "bg-accent/15 text-accent border-accent/30"
                    : "bg-surface border-border-light text-muted hover:text-ink"
                }`}
                title={lang === "en" ? "Toggle Micrometer Graticule" : "Tampilkan Skala Grid"}
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>

              <button
                onClick={() => setShowHotspots(!showHotspots)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  showHotspots
                    ? "bg-accent/15 text-accent border-accent/30"
                    : "bg-surface border-border-light text-muted hover:text-ink"
                }`}
                title={lang === "en" ? "Toggle Anatomical Labels" : "Label Bagian"}
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === "en" ? "Labels" : "Anotasi"}</span>
              </button>

              <button
                onClick={handleCaptureSnapshot}
                className="p-2 rounded-xl border border-border-light bg-surface text-muted hover:text-ink hover:bg-bg-alt flex items-center gap-1.5 transition-colors"
                title={lang === "en" ? "Capture Snapshot" : "Ambil Foto Preparat"}
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === "en" ? "Capture" : "Foto"}</span>
              </button>
            </div>
          </div>

          {/* Pop-up Keterangan Hotspot Aktif */}
          <AnimatePresence>
            {activeHotspot && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-3 p-3.5 rounded-2xl bg-accent/10 border border-accent/30 text-ink text-xs flex items-start justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-accent mb-0.5">
                    🔍 {lang === "en" ? activeHotspot.nameEn : activeHotspot.nameId}
                  </p>
                  <p className="text-muted leading-relaxed">
                    {lang === "en" ? activeHotspot.descEn : activeHotspot.descId}
                  </p>
                </div>
                <button
                  onClick={() => setActiveHotspot(null)}
                  className="text-muted hover:text-ink font-bold text-sm px-1.5"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Kolom Kanan: Panel Kontrol Lensa, Fokus, & Pemilihan Preparat (Lg: Col-5) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Pemilihan Preparat (Specimen Selector) */}
          <div className="bg-card border border-border-light rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="specimen-select" className="font-extrabold text-sm text-ink flex items-center gap-2">
                <span>📂</span>
                <span>{lang === "en" ? "Select Specimen" : "Pilih Preparat"}</span>
              </label>
              <span className="text-[11px] font-medium text-muted px-2 py-0.5 rounded-full bg-surface border border-border-light">
                {specimens.length} {lang === "en" ? "specimens" : "preparat"}
              </span>
            </div>

            {/* Dropdown Select Preparat */}
            <div className="relative">
              <select
                id="specimen-select"
                value={activeSpecimenId}
                onChange={(e) => handleSelectSpecimen(e.target.value)}
                className="w-full appearance-none px-3.5 py-3 pr-10 rounded-2xl border border-border-light bg-surface text-ink text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all cursor-pointer shadow-xs"
              >
                {specimens.map((spec, idx) => {
                  const isLocked = isGuest && idx >= 2;
                  const name = lang === "en" ? spec.nameEn : spec.nameId;
                  return (
                    <option key={spec.id} value={spec.id} className="bg-surface text-ink py-1">
                      {isLocked ? "🔒 " : ""}{name}
                      {spec.latinName ? ` (${spec.latinName})` : ""}
                      {isLocked ? (lang === "en" ? " [Locked - Members Only]" : " [Terkunci - Khusus Akun]") : ""}
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Info Singkat Preparat Terpilih */}
            <div className="p-3.5 rounded-2xl bg-bg-alt/70 border border-border-light/60 text-xs space-y-1.5">
              <div>
                <p className="font-bold text-ink leading-snug">
                  {lang === "en" ? activeSpecimen.nameEn : activeSpecimen.nameId}
                </p>
                {activeSpecimen.latinName && (
                  <p className="text-[11px] text-muted italic font-serif mt-0.5">
                    {activeSpecimen.latinName}
                  </p>
                )}
              </div>
              <p className="text-muted leading-relaxed line-clamp-3 text-[11px] pt-0.5">
                {lang === "en" ? activeSpecimen.descriptionEn : activeSpecimen.descriptionId}
              </p>
            </div>

            {/* Guest Teaser Banner for Microscope */}
            {isGuest && (
              <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between gap-2.5">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>2 Preparat Sampel Gratis</span>
                  </p>
                  <p className="text-[11px] text-muted leading-tight mt-0.5 truncate">
                    Daftar akun gratis untuk membuka seluruh preparat.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLockedSpecimenTitle(lang === "en" ? "Full Specimen Collection" : "Semua Preparat Lanjutan");
                    setShowAuthModal(true);
                  }}
                  className="px-3 py-1.5 bg-accent text-white text-xs font-bold rounded-xl shrink-0 hover:bg-accent-dark transition-colors shadow-xs"
                >
                  Daftar
                </button>
              </div>
            )}
          </div>

          {/* 2. Revolver Lensa Objektif (4x, 10x, 40x, 100x) */}
          <div className="bg-card border border-border-light rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                ⚙️ {lang === "en" ? "Revolving Nosepiece" : "Revolver Lensa Objektif"}
              </h3>
              <span className="text-xs font-mono font-bold text-accent">
                {OBJECTIVES.find((o) => o.mag === mag)?.total} (Okuler 10x)
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {OBJECTIVES.map((obj) => {
                const isActive = mag === obj.mag;
                return (
                  <button
                    key={obj.mag}
                    onClick={() => setMag(obj.mag)}
                    className={`py-3 px-2 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                      isActive
                        ? "bg-accent text-white font-bold border-accent shadow-md scale-105"
                        : "bg-surface border-border-light text-ink hover:bg-bg-alt"
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full mb-1.5"
                      style={{ backgroundColor: obj.ringColor }}
                    />
                    <span className="text-sm font-extrabold">{obj.label}</span>
                    <span className="text-[9px] opacity-80 mt-0.5">
                      {lang === "en" ? obj.titleEn : obj.titleId}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Pengatur Fokus Makrometer & Mikrometer */}
          <div className="bg-card border border-border-light rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
              🎛️ {lang === "en" ? "Focus Adjustment Knobs" : "Knob Pengatur Fokus"}
            </h3>

            {/* Makrometer (Coarse Focus) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-ink">
                  {lang === "en" ? "Coarse Focus (Makrometer)" : "Fokus Kasar (Makrometer)"}
                </span>
                <span className="font-mono text-muted text-[11px]">{coarseFocus > 0 ? `+${coarseFocus.toFixed(1)}` : coarseFocus.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-15"
                max="15"
                step="0.1"
                value={coarseFocus}
                onChange={(e) => setCoarseFocus(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted font-medium mt-0.5">
                <span>−15 (Bawah)</span>
                <span>0</span>
                <span>+15 (Atas)</span>
              </div>
            </div>

            {/* Mikrometer (Fine Focus) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-ink">
                  {lang === "en" ? "Fine Focus (Mikrometer)" : "Fokus Halus (Mikrometer)"}
                </span>
                <span className="font-mono text-muted text-[11px]">{fineFocus > 0 ? `+${fineFocus.toFixed(1)}` : fineFocus.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.05"
                value={fineFocus}
                onChange={(e) => setFineFocus(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted font-medium mt-0.5">
                <span>−10</span>
                <span>0</span>
                <span>+10</span>
              </div>
            </div>
          </div>

          {/* 4. Pengatur Pencahayaan & Kondensor */}
          <div className="bg-card border border-border-light rounded-3xl p-5 shadow-sm space-y-3.5">
            <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              {lang === "en" ? "Illumination & Diaphragm" : "Pencahayaan & Diafragma"}
            </h3>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-muted">
                  {lang === "en" ? "Lamp Brightness" : "Intensitas Cahaya"}
                </span>
                <span className="font-mono text-muted">{brightness}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="160"
                step="5"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Filter Warna Cahaya */}
            <div>
              <span className="text-xs text-muted block mb-1.5">
                {lang === "en" ? "Condenser Light Filter" : "Filter Warna Kondensor"}
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setLightFilter("natural")}
                  className={`py-1.5 px-2 rounded-xl text-xs border font-semibold ${
                    lightFilter === "natural"
                      ? "bg-accent/15 border-accent text-accent"
                      : "bg-surface border-border-light text-muted hover:text-ink"
                  }`}
                >
                  {lang === "en" ? "Neutral" : "Netral"}
                </button>
                <button
                  onClick={() => setLightFilter("blue")}
                  className={`py-1.5 px-2 rounded-xl text-xs border font-semibold ${
                    lightFilter === "blue"
                      ? "bg-sky-500/15 border-sky-500 text-sky-600"
                      : "bg-surface border-border-light text-muted hover:text-ink"
                  }`}
                >
                  {lang === "en" ? "Blue Light" : "Biru Siang"}
                </button>
                <button
                  onClick={() => setLightFilter("warm")}
                  className={`py-1.5 px-2 rounded-xl text-xs border font-semibold ${
                    lightFilter === "warm"
                      ? "bg-amber-500/15 border-amber-500 text-amber-700"
                      : "bg-surface border-border-light text-muted hover:text-ink"
                  }`}
                >
                  {lang === "en" ? "Warm" : "Kuning"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ajakan Daftar untuk Tamu saat memilih preparat terkunci */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-border/80 overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-muted hover:text-ink hover:bg-bg-alt transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 text-xl shadow-inner">
                  🔬
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-500/10 px-2 py-0.5 rounded-full">
                    Khusus Akun Siswa
                  </span>
                  <h3 className="text-lg font-bold text-ink mt-0.5">
                    Buka Semua Preparat Mikroskop
                  </h3>
                </div>
              </div>

              <p className="text-xs text-muted leading-relaxed mb-4">
                Spesimen <strong className="text-ink">{lockedSpecimenTitle}</strong> dan preparat mikroskopis lainnya memerlukan akun BioLearn. Buat akun gratis sekarang untuk membuka semua preparat!
              </p>

              <div className="space-y-2 p-3.5 rounded-2xl bg-bg-alt/70 border border-border/60 mb-5 text-xs text-ink">
                <div className="flex items-center gap-2">
                  <span>🔬</span>
                  <span>Akses seluruh preparat tumbuhan, hewan, embrio, & bakteri</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔍</span>
                  <span>Eksplorasi organel sel dengan perbesaran hingga 100x</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🧪</span>
                  <span>Akses seluruh modul praktikum interaktif BioLab</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/login?mode=register&redirect=/biolab/mikroskop"
                  className="w-full py-3 px-4 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 text-center"
                >
                  <Sparkles className="w-4 h-4" />
                  Daftar Akun Gratis Sekarang (30 Detik)
                </Link>
                <Link
                  href="/login?mode=login&redirect=/biolab/mikroskop"
                  className="w-full py-2.5 px-4 bg-surface hover:bg-bg-alt border border-border text-ink font-semibold rounded-xl text-xs sm:text-sm transition-all text-center block"
                >
                  Sudah Memiliki Akun? Masuk di Sini
                </Link>
              </div>

              <div className="mt-3 text-center">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-[11px] text-muted hover:text-ink underline transition-colors"
                >
                  Nanti saja, tetap amati preparat gratis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
