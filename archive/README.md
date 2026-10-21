# BioLearn Feature Archive

Folder ini menyimpan fitur-fitur yang diarsipkan sementara.

## Daftar Arsip
- `archive/features/biohots.zip`: Fitur **BioHOTS** (Bedah Soal UTBK/TKA) lengkap beserta komponen frontend, API, data seed, dan patch integrasi UI.

---

## Cara Restore BioHOTS
Jika ingin mengaktifkan kembali fitur BioHOTS saat materi sudah lengkap, jalankan perintah berikut di PowerShell di root proyek:

```powershell
# 1. Ekstrak zip sementara
Expand-Archive -Path "archive\features\biohots.zip" -DestinationPath "archive\temp_biohots" -Force

# 2. Salin kembali file kode ke src
Copy-Item -Recurse -Force "archive\temp_biohots\src\*" "src"

# 3. Terapkan patch navigasi UI
git apply "archive\temp_biohots\ui_integrations.patch"

# 4. Bersihkan folder sementara
Remove-Item -Recurse -Force "archive\temp_biohots"
```
Setelah itu jalankan `npm run dev` dan fitur langsung aktif kembali seperti semula.
