// state.js - State Management untuk Sistem Informasi SKP
// SATU SUMBER DATA untuk seluruh sistem (mahasiswa, draft, pengajuan, validasi, aktivitas).
// Semua data disimpan dalam satu object state di localStorage (skp_app_state), supaya
// data yang sama terlihat di semua tab/role dan tidak ikut terhapus saat logout
// (logout hanya membersihkan sessionStorage, yaitu sesi login per-tab).
// Akun pengguna (dummyAccounts) juga didefinisikan di sini agar semua halaman
// (login, dashboard, detail-pengajuan, dll) bisa melakukan lookup nama/NIM/prodi dari email yang sama.

(function() {
    const STATE_KEY = 'skp_app_state';
    const TARGET_POIN = 100;

    // ============================================================
    // AKUN PENGGUNA (sumber tunggal — dipakai login.html & lookup identitas)
    // ============================================================
    const DUMMY_ACCOUNTS = {
        'mahasiswa1@plai.ac.id': {
            fullName: 'Gergorius Vernando Susanto',
            role: 'Mahasiswa',
            roleKey: 'mahasiswa',
            password: '12345',
            dashboardUrl: 'dashboard-mahasiswa.html',
            avatar: 'GV',
            nim: '2024001',
            prodi: 'Sains Data Terapan'
        },
        'mahasiswa2@plai.ac.id': {
            fullName: 'Siti Aisyah Al Humaira',
            role: 'Mahasiswa',
            roleKey: 'mahasiswa',
            password: '12345',
            dashboardUrl: 'dashboard-mahasiswa.html',
            avatar: 'SA',
            nim: '2024002',
            prodi: 'Sains Data Terapan'
        },
        // ================================================================
        // Mahasiswa tambahan — dipakai sebagai DATA monitoring saja
        // (lintas program studi & angkatan) agar filter pada dashboard/laporan
        // Wakil Direktur dan Kaprodi dapat diuji dan didemokan.
        // Angkatan diturunkan dari 4 digit pertama NIM.
        //
        // Ditandai `dataOnly: true` sehingga TIDAK ditampilkan pada daftar
        // pemilih akun Google di halaman login (daftar itu hanya memuat akun
        // peragaan utama). Mereka tetap dapat login lewat form email/kata sandi
        // bila sewaktu-waktu diperlukan untuk pengujian.
        // ================================================================

        // --- Angkatan 2024 (paling senior; menjadi fokus pemantauan SKPI) ---
        'mahasiswa3@plai.ac.id': {
            fullName: 'Raden Bagus Khalid Izza Mahendra',
            role: 'Mahasiswa', roleKey: 'mahasiswa', password: '12345',
            dashboardUrl: 'dashboard-mahasiswa.html',
            avatar: 'RB', nim: '2024003', prodi: 'Rekayasa Keamanan Siber',
            dataOnly: true
        },
        'mahasiswa4@plai.ac.id': {
            fullName: 'Siti Aisyah',
            role: 'Mahasiswa', roleKey: 'mahasiswa', password: '12345',
            dashboardUrl: 'dashboard-mahasiswa.html',
            avatar: 'SA', nim: '2024004', prodi: 'Rekayasa Keamanan Siber',
            dataOnly: true
        },
        'mahasiswa5@plai.ac.id': {
            fullName: 'Yudha Arikusuma',
            role: 'Mahasiswa', roleKey: 'mahasiswa', password: '12345',
            dashboardUrl: 'dashboard-mahasiswa.html',
            avatar: 'YA', nim: '2024005', prodi: 'Kecerdasan Buatan & Robotik',
            dataOnly: true
        },
        'mahasiswa6@plai.ac.id': {
            fullName: 'Muhammad Ibnu Sina Nur Amanullah',
            role: 'Mahasiswa', roleKey: 'mahasiswa', password: '12345',
            dashboardUrl: 'dashboard-mahasiswa.html',
            avatar: 'MI', nim: '2024006', prodi: 'Kecerdasan Buatan & Robotik',
            dataOnly: true
        },

        // --- Angkatan 2025 (satu tingkat di bawah) ---
        'mahasiswa7@plai.ac.id': {
            fullName: 'Ibrahim Al Muhsin',
            role: 'Mahasiswa', roleKey: 'mahasiswa', password: '12345',
            dashboardUrl: 'dashboard-mahasiswa.html',
            avatar: 'IA', nim: '2025001', prodi: 'Sains Data Terapan',
            dataOnly: true
        },
        'mahasiswa8@plai.ac.id': {
            fullName: 'Jasmine Nur Faizah',
            role: 'Mahasiswa', roleKey: 'mahasiswa', password: '12345',
            dashboardUrl: 'dashboard-mahasiswa.html',
            avatar: 'JN', nim: '2025002', prodi: 'Rekayasa Keamanan Siber',
            dataOnly: true
        },
        'mahasiswa9@plai.ac.id': {
            fullName: 'Gandi Ilmi Hadhi',
            role: 'Mahasiswa', roleKey: 'mahasiswa', password: '12345',
            dashboardUrl: 'dashboard-mahasiswa.html',
            avatar: 'GI', nim: '2025003', prodi: 'Kecerdasan Buatan & Robotik',
            dataOnly: true
        },

        'adminmhs@plai.ac.id': {
            fullName: 'Habib Gili Ajiwinata, M.Pd.',
            role: 'Admin Kemahasiswaan',
            roleKey: 'admin-kemahasiswaan',
            password: '12345',
            dashboardUrl: 'dashboard-admin.html',
            avatar: 'SN',
            nip: '198501012010011001',
            prodi: 'Bidang Kemahasiswaan'
        },
        'kaprodi@plai.ac.id': {
            fullName: 'Dr. Musthofa Ridlwan, S.Kom., M.Kom.',
            role: 'Kaprodi',
            roleKey: 'kaprodi',
            password: '12345',
            dashboardUrl: 'dashboard-kaprodi.html',
            avatar: 'MR',
            nip: '198001012008011001',
            prodi: 'Sains Data Terapan'
        },
        'wadir@plai.ac.id': {
            fullName: 'Prof. Dr. Ir. M. Raihan Rivansyah, M.Sc.',
            role: 'Wakil Direktur',
            roleKey: 'wakil-direktur',
            password: '12345',
            dashboardUrl: 'dashboard-wadir.html',
            avatar: 'MR',
            nip: '197501012005011001',
            prodi: 'Bidang Akademik'
        },
        'direktur@plai.ac.id': {
            fullName: 'Prof. Dr. Ir. Naja Nurdin, M.Eng.',
            role: 'Direktur',
            roleKey: 'direktur',
            password: '12345',
            dashboardUrl: 'dashboard-direktur.html',
            avatar: 'NJ',
            nip: '197001012000011001',
            prodi: 'Politeknik AI LPI'
        },
        'lsi@plai.ac.id': {
            fullName: 'Karolina Ida Dangku, S.Pd., M.T.',
            role: 'Tim LSI',
            roleKey: 'tim-lsi',
            password: '12345',
            dashboardUrl: 'dashboard-lsi.html',
            avatar: 'KI',
            nip: '199001012015011001',
            prodi: 'Lembaga Sistem Informasi'
        }
    };

    function getAccountByEmail(email) {
        if (!email) return null;
        const accounts = getAllAccounts();
        return accounts[email.toLowerCase()] || null;
    }

    function getAllAccounts() {
        // Baca dari state agar perubahan oleh Tim LSI (tambah/ubah/nonaktif)
        // ikut terlihat. Fallback ke seed bila state belum terbentuk.
        const state = getState();
        return (state && state.accounts) ? state.accounts : DUMMY_ACCOUNTS;
    }

    // ============================================================
    // MANAJEMEN PENGGUNA (RBAC) — fungsi eksklusif Tim LSI (FR-12).
    // Menambah pengguna, mengubah peran, dan menonaktifkan/mengaktifkan akun.
    // Setiap perubahan dicatat ke Audit Trail (FR-21) dengan data before/after.
    // ============================================================
    const LABEL_ROLE = {
        'mahasiswa': 'Mahasiswa',
        'admin-kemahasiswaan': 'Admin Kemahasiswaan',
        'kaprodi': 'Kaprodi',
        'wakil-direktur': 'Wakil Direktur',
        'direktur': 'Direktur',
        'tim-lsi': 'Tim LSI'
    };

    // Halaman tujuan setelah login untuk tiap peran (dipakai saat Tim LSI
    // menambah pengguna atau mengubah peran, agar dashboardUrl akun ikut benar).
    const DASHBOARD_URL = {
        'mahasiswa': 'dashboard-mahasiswa.html',
        'admin-kemahasiswaan': 'dashboard-admin.html',
        'kaprodi': 'dashboard-kaprodi.html',
        'wakil-direktur': 'dashboard-wadir.html',
        'direktur': 'dashboard-direktur.html',
        'tim-lsi': 'dashboard-lsi.html'
    };

    function addAccount(data, aktor, aktorRole) {
        const state = getState();
        const email = (data.email || '').toLowerCase().trim();

        if (!email || !data.fullName || !data.roleKey) {
            return { ok: false, error: 'Data tidak lengkap.' };
        }
        if (!email.endsWith('@plai.ac.id')) {
            return { ok: false, error: 'Email harus menggunakan domain @plai.ac.id.' };
        }
        if (state.accounts[email]) {
            return { ok: false, error: 'Email sudah terdaftar.' };
        }

        const inisial = data.fullName.split(' ').filter(Boolean).slice(0, 2)
            .map(n => n[0]).join('').toUpperCase();

        const akun = {
            fullName: data.fullName.trim(),
            role: LABEL_ROLE[data.roleKey] || data.roleKey,
            roleKey: data.roleKey,
            password: data.password || '12345',
            dashboardUrl: DASHBOARD_URL[data.roleKey] || 'dashboard-mahasiswa.html',
            avatar: inisial,
            aktif: true
        };
        if (data.roleKey === 'mahasiswa') {
            akun.nim = data.nim || '';
            akun.prodi = data.prodi || '';
        } else {
            akun.nip = data.nip || '';
            akun.prodi = data.prodi || LABEL_ROLE[data.roleKey] || '';
        }

        state.accounts[email] = akun;
        pushAuditTrail(state, {
            aktor, aktorRole,
            aksi: 'Menambah Pengguna Baru',
            entitas: 'Akun', entitasId: email,
            dataSebelum: null,
            dataSesudah: `${akun.fullName} (${akun.role}) ditambahkan sebagai pengguna baru.`,
            keterangan: 'Penambahan pengguna melalui manajemen RBAC.'
        });
        setState(state);
        return { ok: true, akun };
    }

    function updateAccountRole(email, roleBaru, aktor, aktorRole) {
        const state = getState();
        email = (email || '').toLowerCase();
        const akun = state.accounts[email];
        if (!akun) return { ok: false, error: 'Akun tidak ditemukan.' };
        if (akun.roleKey === roleBaru) return { ok: false, error: 'Peran tidak berubah.' };

        const roleLama = akun.role;
        akun.roleKey = roleBaru;
        akun.role = LABEL_ROLE[roleBaru] || roleBaru;
        akun.dashboardUrl = DASHBOARD_URL[roleBaru] || 'dashboard-mahasiswa.html';

        pushAuditTrail(state, {
            aktor, aktorRole,
            aksi: 'Mengubah Peran Pengguna',
            entitas: 'Akun', entitasId: email,
            dataSebelum: `Peran: ${roleLama}`,
            dataSesudah: `Peran: ${akun.role}`,
            keterangan: `Peran ${akun.fullName} diubah dari ${roleLama} menjadi ${akun.role}.`
        });
        setState(state);
        return { ok: true, akun };
    }

    function toggleAccountActive(email, aktor, aktorRole) {
        const state = getState();
        email = (email || '').toLowerCase();
        const akun = state.accounts[email];
        if (!akun) return { ok: false, error: 'Akun tidak ditemukan.' };

        // Akun dianggap aktif bila properti 'aktif' tidak di-set false.
        const sedangAktif = akun.aktif !== false;
        akun.aktif = !sedangAktif;

        pushAuditTrail(state, {
            aktor, aktorRole,
            aksi: akun.aktif ? 'Mengaktifkan Akun' : 'Menonaktifkan Akun',
            entitas: 'Akun', entitasId: email,
            dataSebelum: `Status: ${sedangAktif ? 'Aktif' : 'Nonaktif'}`,
            dataSesudah: `Status: ${akun.aktif ? 'Aktif' : 'Nonaktif'}`,
            keterangan: `Status akun ${akun.fullName} diubah.`
        });
        setState(state);
        return { ok: true, akun };
    }

    function isAccountActive(email) {
        const akun = getAccountByEmail(email);
        return !!akun && akun.aktif !== false;
    }

    // ============================================================
    // MASTER ATURAN SKP (default) — kategori, tingkat, dan bobot poin.
    // Disimpan sebagai DATA DI DALAM STATE (state.masterSKP), bukan konstanta statis,
    // supaya Admin Kemahasiswaan dapat menambah/mengubah/menonaktifkan lewat
    // master-data-skp.html, dan seluruh halaman lain (pengajuan.html, dashboard,
    // dll) otomatis mengikuti tanpa perubahan kode program (sesuai FR-15).
    // ============================================================
    function getDefaultMasterSKP() {
        return [
            {
                id: 'KAT-01', kode: 'prestasi-akademik', nama: 'Prestasi Akademik', aktif: true,
                deskripsi: 'Penelitian, publikasi, dan kegiatan akademik lain di luar perkuliahan reguler.',
                tingkat: [
                    { id: 'internal', nama: 'Internal', poin: 10 },
                    { id: 'regional', nama: 'Regional', poin: 15 },
                    { id: 'nasional', nama: 'Nasional', poin: 20 },
                    { id: 'internasional', nama: 'Internasional', poin: 25 }
                ]
            },
            {
                id: 'KAT-02', kode: 'prestasi-organisasi', nama: 'Prestasi Organisasi', aktif: true,
                deskripsi: 'Keaktifan dan jabatan dalam organisasi kemahasiswaan.',
                tingkat: [
                    { id: 'internal', nama: 'Internal', poin: 8 },
                    { id: 'regional', nama: 'Regional', poin: 12 },
                    { id: 'nasional', nama: 'Nasional', poin: 16 },
                    { id: 'internasional', nama: 'Internasional', poin: 20 }
                ]
            },
            {
                id: 'KAT-03', kode: 'prestasi-kompetisi', nama: 'Prestasi Kompetisi', aktif: true,
                deskripsi: 'Partisipasi atau kejuaraan pada lomba/kompetisi.',
                tingkat: [
                    { id: 'internal', nama: 'Internal', poin: 12 },
                    { id: 'regional', nama: 'Regional', poin: 18 },
                    { id: 'nasional', nama: 'Nasional', poin: 24 },
                    { id: 'internasional', nama: 'Internasional', poin: 30 }
                ]
            }
        ];
    }

    // Daftar Peran Mahasiswa dalam kegiatan (FR-15), juga dapat dikelola Admin
    function getDefaultPeranList() {
        return [
            { id: 'peserta', nama: 'Peserta', aktif: true },
            { id: 'pemateri', nama: 'Pemateri', aktif: true },
            { id: 'juara-1', nama: 'Juara 1', aktif: true },
            { id: 'juara-2', nama: 'Juara 2', aktif: true },
            { id: 'juara-3', nama: 'Juara 3', aktif: true },
            { id: 'panitia', nama: 'Panitia', aktif: true },
            { id: 'pengurus', nama: 'Pengurus', aktif: true }
        ];
    }

    // ============================================================
    // KONFIGURASI WORKFLOW VALIDASI (default) — disimpan sebagai data di state
    // (state.workflowConfig), agar Admin Kemahasiswaan/Tim LSI dapat mengubah
    // urutan tahap & validator per kategori lewat konfigurasi-workflow.html
    // tanpa perubahan kode program (FR-22, AB-17, AB-18).
    // ============================================================
    function getDefaultWorkflowConfig() {
        return {
            'prestasi-akademik':   ['Mahasiswa', 'Kaprodi', 'Admin Kemahasiswaan'],
            'prestasi-organisasi': ['Mahasiswa', 'Admin Kemahasiswaan'],
            'prestasi-kompetisi':  ['Mahasiswa', 'Kaprodi', 'Wakil Direktur']
        };
    }

    // ============================================================
    // PERIODE AKADEMIK (default) — entitas baru sesuai FR-25.
    // Hanya boleh ada satu periode berstatus 'Aktif' dalam satu waktu.
    // ============================================================
    function getDefaultPeriode() {
        return [
            {
                id: 'PRD-2026-1',
                nama: '2026/2027 Ganjil',
                tanggalMulai: '2026-08-01',
                tanggalSelesai: '2027-01-31',
                status: 'Aktif'
            }
        ];
    }

    // buildWorkflow menerima 'workflowConfig' secara eksplisit (bukan mengambil
    // dari getState()) supaya bisa dipanggil saat state itu sendiri sedang
    // dibentuk pertama kali (lihat enrichDummyPengajuan & getDefaultState),
    // tanpa menyebabkan pemanggilan melingkar.
    function buildWorkflow(kategori, workflowConfig) {
        const cfg = workflowConfig || getDefaultWorkflowConfig();
        const roles = cfg[kategori] || ['Mahasiswa', 'Admin Kemahasiswaan'];
        return roles.map((role, i) => ({
            role,
            status: i === 0 ? 'completed' : (i === 1 ? 'active' : 'pending'),
            date: i === 0 ? new Date().toISOString() : null
        }));
    }

    // Versi publik yang otomatis membaca workflowConfig TERKINI dari state
    // (mengikuti perubahan yang dibuat Admin lewat konfigurasi-workflow.html).
    // Dipakai oleh halaman lain (pengajuan.html, dashboard, dll) sehingga
    // semuanya otomatis sinkron tanpa perubahan kode program.
    function getWorkflowForKategori(kategori) {
        const state = getState();
        return (state.workflowConfig && state.workflowConfig[kategori]) || ['Mahasiswa', 'Admin Kemahasiswaan'];
    }

    // Ambil bobot poin dari Master Aturan SKP TERKINI di state (mengikuti
    // perubahan yang dibuat Admin lewat master-data-skp.html).
    function getBobotPoin(kategoriKode, tingkatId) {
        const state = getState();
        const kat = (state.masterSKP || []).find(k => k.kode === kategoriKode);
        if (!kat) return 0;
        const tk = (kat.tingkat || []).find(t => t.id === tingkatId);
        return tk ? tk.poin : 0;
    }

    // Daftar kategori SKP yang masih aktif (untuk dropdown di formulir pengajuan)
    function getActiveKategoriSKP() {
        const state = getState();
        return (state.masterSKP || []).filter(k => k.aktif);
    }

    // ============================================================
    // DATA DUMMY PENGAJUAN — supaya tampilan tidak kosong di awal,
    // tetapi tetap berada di state yang sama dengan data baru hasil aksi user.
    // ============================================================
    const DUMMY_PENGAJUAN = [
        { id: 'SKP-2023-001', email: 'mahasiswa1@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Penelitian Dosen', penyelenggara: 'LPPM', lokasi: 'Kampus', tglMulai: '2023-05-08', tglSelesai: '2023-05-10', tingkatText: 'Nasional', poin: 20, estimasiPoin: 20, status: 'Disetujui', tanggal: '2023-05-10', validator: 'Kaprodi', deskripsi: 'Keterlibatan dalam penelitian dosen.', file: 'sertifikat-penelitian.pdf' },
        { id: 'SKP-2023-002', email: 'mahasiswa1@plai.ac.id', kategori: 'prestasi-organisasi', kategoriText: 'Organisasi', judul: 'Ketua BEM', penyelenggara: 'BEM Kampus', lokasi: 'Kampus', tglMulai: '2023-06-01', tglSelesai: '2023-06-15', tingkatText: 'Internal', poin: 15, estimasiPoin: 15, status: 'Disetujui', tanggal: '2023-06-15', validator: 'Admin Kemahasiswaan', deskripsi: 'Menjabat sebagai Ketua BEM periode berjalan.', file: 'sk-ketua-bem.pdf' },
        { id: 'SKP-2023-003', email: 'mahasiswa1@plai.ac.id', kategori: 'prestasi-kompetisi', kategoriText: 'Kompetisi', judul: 'Juara 2 Hackathon', penyelenggara: 'Kemendikbud', lokasi: 'Jakarta', tglMulai: '2023-07-18', tglSelesai: '2023-07-20', tingkatText: 'Nasional', poin: 25, estimasiPoin: 25, status: 'Ditolak', tanggal: '2023-07-20', validator: 'Wakil Direktur', deskripsi: 'Meraih juara 2 pada kompetisi hackathon nasional.', file: 'sertifikat-hackathon.pdf' },
        { id: 'SKP-2023-004', email: 'mahasiswa1@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Publikasi Artikel Ilmiah Nasional', penyelenggara: 'APTIKOM', lokasi: 'Bandung', tglMulai: '2023-08-05', tglSelesai: '2023-08-05', tingkatText: 'Nasional', poin: 10, estimasiPoin: 10, status: 'Disetujui', tanggal: '2023-08-05', validator: 'Admin Kemahasiswaan', deskripsi: 'Peserta seminar nasional teknologi.', file: 'sertifikat-seminar.pdf' },
        { id: 'SKP-2023-007', email: 'mahasiswa1@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Tutor Sebaya Pemrograman Dasar', penyelenggara: 'UKM Coding', lokasi: 'Kampus', tglMulai: '2023-09-12', tglSelesai: '2023-09-12', tingkatText: 'Internal', poin: 5, estimasiPoin: 5, status: 'Disetujui', tanggal: '2023-09-12', validator: 'Admin Kemahasiswaan', deskripsi: 'Peserta workshop pemrograman dasar tingkat internal.', file: 'sertifikat-workshop.pdf' },
        { id: 'SKP-2023-005', email: 'mahasiswa2@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Riset Kecerdasan Buatan bersama Dosen', penyelenggara: 'LPPM', lokasi: 'Kampus', tglMulai: '2023-08-28', tglSelesai: '2023-09-01', tingkatText: 'Internal', poin: 12, estimasiPoin: 12, status: 'Revisi', tanggal: '2023-09-01', validator: 'Kaprodi', deskripsi: 'Pelatihan implementasi kecerdasan buatan.', file: 'sertifikat-pelatihan-ai.pdf' },

        // ============================================================
        // Pengajuan BERJALAN (belum final) — sengaja ditambahkan supaya
        // antrean Admin Kemahasiswaan (dashboard-admin.html & validasi-admin.html)
        // tidak kosong di awal dan bisa langsung disimulasikan validasinya.
        // ============================================================
        { id: 'SKP-2026-101', email: 'mahasiswa1@plai.ac.id', kategori: 'prestasi-organisasi', kategoriText: 'Prestasi Organisasi', judul: 'Koordinator Divisi Acara Himpunan Mahasiswa', penyelenggara: 'Himpunan Mahasiswa Sains Data', lokasi: 'Kampus', tglMulai: '2026-06-20', tglSelesai: '2026-06-22', tingkatText: 'Internal', poin: 8, estimasiPoin: 8, status: 'Sedang Diverifikasi', tanggal: '2026-07-02', validator: '-', deskripsi: 'Bertanggung jawab mengoordinasikan divisi acara pada kegiatan himpunan mahasiswa.', file: 'sk-koordinator-acara.pdf' },
        { id: 'SKP-2026-105', email: 'mahasiswa1@plai.ac.id', kategori: 'prestasi-organisasi', kategoriText: 'Prestasi Organisasi', judul: 'Bakti Sosial Desa Binaan Semester Ganjil', penyelenggara: 'LPPM', lokasi: 'Desa Binaan Sleman', tglMulai: '2026-06-25', tglSelesai: '2026-06-27', tingkatText: 'Regional', poin: 12, estimasiPoin: 12, status: 'Sedang Diverifikasi', tanggal: '2026-07-03', validator: '-', deskripsi: 'Partisipasi dalam program bakti sosial dan edukasi digital di desa binaan.', file: 'dokumentasi-baksos.pdf' },
        { id: 'SKP-2026-103', email: 'mahasiswa2@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Riset Machine Learning Terapan bersama Dosen', penyelenggara: 'Pusat Pengembangan Karir', lokasi: 'Kampus', tglMulai: '2026-06-15', tglSelesai: '2026-06-18', tingkatText: 'Internal', poin: 6, estimasiPoin: 6, status: 'Sedang Diverifikasi', tanggal: '2026-06-30', validator: '-', deskripsi: 'Pelatihan penerapan machine learning untuk studi kasus industri.', file: 'sertifikat-pelatihan-ml.pdf' },
        {
            id: 'SKP-2026-102', email: 'mahasiswa1@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Asisten Riset Dosen Bidang Data Mining', penyelenggara: 'LPPM', lokasi: 'Kampus', tglMulai: '2026-05-01', tglSelesai: '2026-06-30', tingkatText: 'Nasional', poin: 20, estimasiPoin: 20, status: 'Pending Admin Kemahasiswaan', tanggal: '2026-07-05', validator: 'Kaprodi', deskripsi: 'Menjadi asisten riset dosen dalam proyek penelitian data mining.', file: 'surat-tugas-asisten-riset.pdf',
            // Contoh pengajuan yang sudah melewati tahap Kaprodi dan kini menunggu
            // giliran Admin Kemahasiswaan — mendemonstrasikan workflow multi-aktor.
            workflow: [
                { role: 'Mahasiswa', status: 'completed', date: '2026-07-01T08:00:00.000Z' },
                { role: 'Kaprodi', status: 'completed', date: '2026-07-04T10:00:00.000Z' },
                { role: 'Admin Kemahasiswaan', status: 'active', date: null }
            ],
            timeline: [
                { title: 'Pengajuan dibuat', date: '2026-07-01T08:00:00.000Z' },
                { title: 'Disetujui oleh Kaprodi, diteruskan ke Admin Kemahasiswaan', date: '2026-07-04T10:00:00.000Z' }
            ],
            riwayat: [
                { tanggal: '2026-07-01T08:00:00.000Z', status: 'Sedang Diverifikasi', validator: 'Sistem', keterangan: 'Pengajuan dibuat' },
                { tanggal: '2026-07-04T10:00:00.000Z', status: 'Pending Admin Kemahasiswaan', validator: 'Kaprodi', keterangan: 'Setujui oleh Kaprodi' }
            ],
            catatan: [
                { author: 'Kaprodi', text: 'Relevan secara akademik dan dokumen lengkap. Diteruskan ke Admin Kemahasiswaan untuk verifikasi akhir.', date: '2026-07-04T10:00:00.000Z' }
            ]
        },
        {
            // Menunggu giliran KAPRODI (Prestasi Akademik: Mahasiswa → Kaprodi → Admin Kemahasiswaan)
            id: 'SKP-2026-106', email: 'mahasiswa2@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Publikasi Jurnal Nasional Terakreditasi Sinta 3', penyelenggara: 'Jurnal JUTIF', lokasi: 'Daring', tglMulai: '2026-06-01', tglSelesai: '2026-06-20', tingkatText: 'Nasional', poin: 25, estimasiPoin: 25, status: 'Sedang Diverifikasi', tanggal: '2026-07-06', validator: 'Kaprodi', deskripsi: 'Publikasi artikel ilmiah sebagai penulis pertama pada jurnal nasional terakreditasi.', file: 'bukti-publikasi-jurnal.pdf',
            workflow: [
                { role: 'Mahasiswa', status: 'completed', date: '2026-07-06T08:00:00.000Z' },
                { role: 'Kaprodi', status: 'active', date: null },
                { role: 'Admin Kemahasiswaan', status: 'pending', date: null }
            ],
            timeline: [
                { title: 'Pengajuan dibuat', date: '2026-07-06T08:00:00.000Z' },
                { title: 'Menunggu verifikasi Kaprodi', date: '2026-07-06T08:05:00.000Z' }
            ],
            riwayat: [
                { tanggal: '2026-07-06T08:00:00.000Z', status: 'Sedang Diverifikasi', validator: 'Sistem', keterangan: 'Pengajuan dibuat' }
            ],
            catatan: []
        },
        {
            // Menunggu giliran KAPRODI (Prestasi Kompetisi: Mahasiswa → Kaprodi → Wakil Direktur)
            id: 'SKP-2026-107', email: 'mahasiswa1@plai.ac.id', kategori: 'prestasi-kompetisi', kategoriText: 'Prestasi Kompetisi', judul: 'Juara 2 Lomba Data Science Nasional', penyelenggara: 'Kemdikbudristek', lokasi: 'Jakarta', tglMulai: '2026-06-10', tglSelesai: '2026-06-12', tingkatText: 'Nasional', poin: 30, estimasiPoin: 30, status: 'Sedang Diverifikasi', tanggal: '2026-07-07', validator: 'Kaprodi', deskripsi: 'Meraih juara 2 pada kompetisi data science tingkat nasional.', file: 'sertifikat-juara-2.pdf',
            workflow: [
                { role: 'Mahasiswa', status: 'completed', date: '2026-07-07T09:00:00.000Z' },
                { role: 'Kaprodi', status: 'active', date: null },
                { role: 'Wakil Direktur', status: 'pending', date: null }
            ],
            timeline: [
                { title: 'Pengajuan dibuat', date: '2026-07-07T09:00:00.000Z' },
                { title: 'Menunggu verifikasi Kaprodi', date: '2026-07-07T09:05:00.000Z' }
            ],
            riwayat: [
                { tanggal: '2026-07-07T09:00:00.000Z', status: 'Sedang Diverifikasi', validator: 'Sistem', keterangan: 'Pengajuan dibuat' }
            ],
            catatan: []
        },

        // ================================================================
        // Riwayat prestasi mahasiswa2 (Siti) yang sudah DISETUJUI.
        // Total 25+15+30+15+18+15 = 118 poin (melewati target 100).
        //
        // Dulu data ini baru dibuat saat Siti login (seed di login.html).
        // Akibatnya, bila Kaprodi/Admin membuka dashboard sebelum Siti pernah
        // login, Siti tampak 0 poin dan "belum memenuhi target" — monitoring
        // Kaprodi (FR-17) jadi keliru. Karena itu datanya dipindah ke sini
        // agar selalu tersedia, tidak bergantung urutan login.
        //
        // Status 'Disetujui' akan otomatis ditandai selesai di semua tahap
        // workflow oleh enrichDummyPengajuan().
        // ================================================================
        { id: 'SKP-2024-001', email: 'mahasiswa2@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Publikasi Jurnal Nasional Terakreditasi', penyelenggara: 'LPPM', lokasi: 'Kampus', tglMulai: '2024-01-05', tglSelesai: '2024-01-10', tingkatText: 'Nasional', poin: 25, estimasiPoin: 25, status: 'Disetujui', tanggal: '2024-01-10', validator: 'Kaprodi', deskripsi: 'Publikasi artikel ilmiah pada jurnal nasional terakreditasi.', file: 'bukti-publikasi.pdf' },
        { id: 'SKP-2024-002', email: 'mahasiswa2@plai.ac.id', kategori: 'prestasi-organisasi', kategoriText: 'Prestasi Organisasi', judul: 'Ketua BEM Politeknik', penyelenggara: 'BEM', lokasi: 'Kampus', tglMulai: '2024-02-01', tglSelesai: '2024-02-15', tingkatText: 'Internal', poin: 15, estimasiPoin: 15, status: 'Disetujui', tanggal: '2024-02-15', validator: 'Admin Kemahasiswaan', deskripsi: 'Menjabat sebagai Ketua Badan Eksekutif Mahasiswa.', file: 'sk-ketua-bem.pdf' },
        { id: 'SKP-2024-003', email: 'mahasiswa2@plai.ac.id', kategori: 'prestasi-kompetisi', kategoriText: 'Prestasi Kompetisi', judul: 'Juara 1 Hackathon Nasional', penyelenggara: 'Kemdikbudristek', lokasi: 'Jakarta', tglMulai: '2024-03-18', tglSelesai: '2024-03-20', tingkatText: 'Nasional', poin: 30, estimasiPoin: 30, status: 'Disetujui', tanggal: '2024-03-20', validator: 'Wakil Direktur', deskripsi: 'Meraih juara 1 pada hackathon tingkat nasional.', file: 'sertifikat-juara-1.pdf' },
        { id: 'SKP-2024-004', email: 'mahasiswa2@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Publikasi Jurnal Internasional AI', penyelenggara: 'IEEE', lokasi: 'Bali', tglMulai: '2024-04-05', tglSelesai: '2024-04-05', tingkatText: 'Internasional', poin: 15, estimasiPoin: 15, status: 'Disetujui', tanggal: '2024-04-05', validator: 'Admin Kemahasiswaan', deskripsi: 'Peserta seminar internasional bidang kecerdasan buatan.', file: 'sertifikat-seminar-internasional.pdf' },
        { id: 'SKP-2024-005', email: 'mahasiswa2@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Asisten Riset Data Science', penyelenggara: 'Digitalent', lokasi: 'Daring', tglMulai: '2024-05-01', tglSelesai: '2024-05-10', tingkatText: 'Nasional', poin: 18, estimasiPoin: 18, status: 'Disetujui', tanggal: '2024-05-10', validator: 'Admin Kemahasiswaan', deskripsi: 'Pelatihan intensif data science bersertifikat.', file: 'sertifikat-datascience.pdf' },
        { id: 'SKP-2024-006', email: 'mahasiswa2@plai.ac.id', kategori: 'prestasi-organisasi', kategoriText: 'Prestasi Organisasi', judul: 'Pengabdian Masyarakat Desa Binaan', penyelenggara: 'LPPM', lokasi: 'Sleman', tglMulai: '2024-05-20', tglSelesai: '2024-06-01', tingkatText: 'Regional', poin: 15, estimasiPoin: 15, status: 'Disetujui', tanggal: '2024-06-01', validator: 'Admin Kemahasiswaan', deskripsi: 'Program pengabdian masyarakat di desa binaan kampus.', file: 'sertifikat-pengabdian.pdf' },

        // ================================================================
        // Riwayat prestasi mahasiswa lintas prodi & angkatan (data monitoring).
        // Poin sengaja dibuat bervariasi terhadap target 100:
        //   Angkatan 2024 (senior) : Raden Bagus 105 (sudah), Siti Aisyah 60 (belum),
        //                            Yudha 112 (sudah), M. Ibnu Sina 35 (belum)
        //   Angkatan 2025          : Ibrahim 45, Jasmine 70 (belum), Gandi 100 (sudah)
        // Mahasiswa senior yang BELUM memenuhi menjadi peringatan bagi pimpinan,
        // karena SKPI mereka terancam tidak terbit saat kelulusan.
        // ================================================================

        // -- Raden Bagus Khalid Izza Mahendra (2024003) = 45+35+25 = 105 --
        { id: 'SKP-2024-201', email: 'mahasiswa3@plai.ac.id', kategori: 'prestasi-kompetisi', kategoriText: 'Prestasi Kompetisi', judul: 'Juara 1 Capture The Flag Nasional', penyelenggara: 'BSSN', lokasi: 'Jakarta', tglMulai: '2024-04-10', tglSelesai: '2024-04-12', tingkatText: 'Nasional', poin: 45, estimasiPoin: 45, status: 'Disetujui', tanggal: '2024-04-12', validator: 'Wakil Direktur', deskripsi: 'Juara 1 kompetisi keamanan siber tingkat nasional.', file: 'sertifikat-ctf.pdf' },
        { id: 'SKP-2024-202', email: 'mahasiswa3@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Publikasi Jurnal Keamanan Siber', penyelenggara: 'LPPM', lokasi: 'Kampus', tglMulai: '2024-06-01', tglSelesai: '2024-06-20', tingkatText: 'Nasional', poin: 35, estimasiPoin: 35, status: 'Disetujui', tanggal: '2024-06-20', validator: 'Kaprodi', deskripsi: 'Artikel ilmiah bidang keamanan siber.', file: 'bukti-jurnal.pdf' },
        { id: 'SKP-2024-203', email: 'mahasiswa3@plai.ac.id', kategori: 'prestasi-organisasi', kategoriText: 'Prestasi Organisasi', judul: 'Ketua Komunitas Cyber Security', penyelenggara: 'UKM', lokasi: 'Kampus', tglMulai: '2024-08-01', tglSelesai: '2024-12-01', tingkatText: 'Internal', poin: 25, estimasiPoin: 25, status: 'Disetujui', tanggal: '2024-12-01', validator: 'Admin Kemahasiswaan', deskripsi: 'Memimpin komunitas keamanan siber kampus.', file: 'sk-ketua.pdf' },

        // -- Siti Aisyah (2024004) = 20+20+20 = 60 (BELUM memenuhi) --
        { id: 'SKP-2024-211', email: 'mahasiswa4@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Publikasi Ilmiah Keamanan Data', penyelenggara: 'BSSN', lokasi: 'Bandung', tglMulai: '2024-03-05', tglSelesai: '2024-03-05', tingkatText: 'Nasional', poin: 20, estimasiPoin: 20, status: 'Disetujui', tanggal: '2024-03-05', validator: 'Admin Kemahasiswaan', deskripsi: 'Peserta seminar nasional keamanan data.', file: 'sertifikat-seminar.pdf' },
        { id: 'SKP-2024-212', email: 'mahasiswa4@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Riset Ethical Hacking Terapan', penyelenggara: 'Digitalent', lokasi: 'Daring', tglMulai: '2024-05-01', tglSelesai: '2024-05-14', tingkatText: 'Nasional', poin: 20, estimasiPoin: 20, status: 'Disetujui', tanggal: '2024-05-14', validator: 'Admin Kemahasiswaan', deskripsi: 'Pelatihan ethical hacking bersertifikat.', file: 'sertifikat-hacking.pdf' },
        { id: 'SKP-2024-213', email: 'mahasiswa4@plai.ac.id', kategori: 'prestasi-organisasi', kategoriText: 'Prestasi Organisasi', judul: 'Sekretaris HIMA Keamanan Siber', penyelenggara: 'HIMA', lokasi: 'Kampus', tglMulai: '2024-08-01', tglSelesai: '2024-12-01', tingkatText: 'Internal', poin: 20, estimasiPoin: 20, status: 'Disetujui', tanggal: '2024-12-01', validator: 'Admin Kemahasiswaan', deskripsi: 'Pengurus himpunan mahasiswa.', file: 'sk-sekretaris.pdf' },

        // -- Yudha Arikusuma (2024005) = 50+32+30 = 112 --
        { id: 'SKP-2024-221', email: 'mahasiswa5@plai.ac.id', kategori: 'prestasi-kompetisi', kategoriText: 'Prestasi Kompetisi', judul: 'Juara 1 Kontes Robot Indonesia', penyelenggara: 'Kemdikbudristek', lokasi: 'Surabaya', tglMulai: '2024-07-10', tglSelesai: '2024-07-14', tingkatText: 'Nasional', poin: 50, estimasiPoin: 50, status: 'Disetujui', tanggal: '2024-07-14', validator: 'Wakil Direktur', deskripsi: 'Juara 1 kontes robot tingkat nasional.', file: 'sertifikat-kri.pdf' },
        { id: 'SKP-2024-222', email: 'mahasiswa5@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Asisten Riset Robotika', penyelenggara: 'LPPM', lokasi: 'Kampus', tglMulai: '2024-02-01', tglSelesai: '2024-06-30', tingkatText: 'Internal', poin: 32, estimasiPoin: 32, status: 'Disetujui', tanggal: '2024-06-30', validator: 'Kaprodi', deskripsi: 'Asisten riset pada laboratorium robotika.', file: 'surat-tugas.pdf' },
        { id: 'SKP-2024-223', email: 'mahasiswa5@plai.ac.id', kategori: 'prestasi-organisasi', kategoriText: 'Prestasi Organisasi', judul: 'Pengajaran Robotika untuk Siswa SMK', penyelenggara: 'LPPM', lokasi: 'Klaten', tglMulai: '2024-09-01', tglSelesai: '2024-09-10', tingkatText: 'Regional', poin: 30, estimasiPoin: 30, status: 'Disetujui', tanggal: '2024-09-10', validator: 'Admin Kemahasiswaan', deskripsi: 'Mengajar dasar robotika kepada siswa SMK.', file: 'laporan-pengabdian.pdf' },

        // -- Muhammad Ibnu Sina Nur Amanullah (2024006) = 15+20 = 35 (BELUM memenuhi) --
        { id: 'SKP-2024-231', email: 'mahasiswa6@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Publikasi Ilmiah Kecerdasan Buatan', penyelenggara: 'HIMTI', lokasi: 'Yogyakarta', tglMulai: '2024-04-20', tglSelesai: '2024-04-20', tingkatText: 'Nasional', poin: 15, estimasiPoin: 15, status: 'Disetujui', tanggal: '2024-04-20', validator: 'Admin Kemahasiswaan', deskripsi: 'Peserta seminar kecerdasan buatan.', file: 'sertifikat-seminar-ai.pdf' },
        { id: 'SKP-2024-232', email: 'mahasiswa6@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Asisten Riset Machine Learning', penyelenggara: 'Digitalent', lokasi: 'Daring', tglMulai: '2024-06-01', tglSelesai: '2024-06-14', tingkatText: 'Nasional', poin: 20, estimasiPoin: 20, status: 'Disetujui', tanggal: '2024-06-14', validator: 'Admin Kemahasiswaan', deskripsi: 'Pelatihan dasar machine learning.', file: 'sertifikat-ml.pdf' },

        // -- Ibrahim Al Muhsin (2025001) = 20+15+10 = 45 --
        { id: 'SKP-2025-101', email: 'mahasiswa7@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Riset Python untuk Data Science', penyelenggara: 'Digitalent', lokasi: 'Daring', tglMulai: '2025-03-01', tglSelesai: '2025-03-14', tingkatText: 'Nasional', poin: 20, estimasiPoin: 20, status: 'Disetujui', tanggal: '2025-03-14', validator: 'Admin Kemahasiswaan', deskripsi: 'Pelatihan Python tingkat dasar.', file: 'sertifikat-python.pdf' },
        { id: 'SKP-2025-102', email: 'mahasiswa7@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Publikasi Ilmiah Big Data', penyelenggara: 'APTIKOM', lokasi: 'Semarang', tglMulai: '2025-05-08', tglSelesai: '2025-05-08', tingkatText: 'Nasional', poin: 15, estimasiPoin: 15, status: 'Disetujui', tanggal: '2025-05-08', validator: 'Admin Kemahasiswaan', deskripsi: 'Peserta seminar big data.', file: 'sertifikat-bigdata.pdf' },
        { id: 'SKP-2025-103', email: 'mahasiswa7@plai.ac.id', kategori: 'prestasi-organisasi', kategoriText: 'Prestasi Organisasi', judul: 'Anggota Divisi Riset HIMA', penyelenggara: 'HIMA', lokasi: 'Kampus', tglMulai: '2025-08-01', tglSelesai: '2025-12-01', tingkatText: 'Internal', poin: 10, estimasiPoin: 10, status: 'Disetujui', tanggal: '2025-12-01', validator: 'Admin Kemahasiswaan', deskripsi: 'Anggota divisi riset himpunan mahasiswa.', file: 'sk-anggota.pdf' },

        // -- Jasmine Nur Faizah (2025002) = 30+20+20 = 70 --
        { id: 'SKP-2025-111', email: 'mahasiswa8@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Finalis Lomba Karya Tulis Ilmiah', penyelenggara: 'Kemdikbudristek', lokasi: 'Malang', tglMulai: '2025-04-02', tglSelesai: '2025-04-04', tingkatText: 'Nasional', poin: 30, estimasiPoin: 30, status: 'Disetujui', tanggal: '2025-04-04', validator: 'Kaprodi', deskripsi: 'Finalis lomba karya tulis ilmiah nasional.', file: 'sertifikat-lkti.pdf' },
        { id: 'SKP-2025-112', email: 'mahasiswa8@plai.ac.id', kategori: 'prestasi-organisasi', kategoriText: 'Prestasi Organisasi', judul: 'Bendahara UKM Cyber', penyelenggara: 'UKM', lokasi: 'Kampus', tglMulai: '2025-08-01', tglSelesai: '2025-12-01', tingkatText: 'Internal', poin: 20, estimasiPoin: 20, status: 'Disetujui', tanggal: '2025-12-01', validator: 'Admin Kemahasiswaan', deskripsi: 'Bendahara unit kegiatan mahasiswa.', file: 'sk-bendahara.pdf' },
        { id: 'SKP-2025-113', email: 'mahasiswa8@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Riset Terapan Jaringan Komputer', penyelenggara: 'Cisco Academy', lokasi: 'Kampus', tglMulai: '2025-09-01', tglSelesai: '2025-09-20', tingkatText: 'Nasional', poin: 20, estimasiPoin: 20, status: 'Disetujui', tanggal: '2025-09-20', validator: 'Admin Kemahasiswaan', deskripsi: 'Pelatihan jaringan komputer bersertifikat.', file: 'sertifikat-jaringan.pdf' },

        // -- Gandi Ilmi Hadhi (2025003) = 40+30+30 = 100 (pas memenuhi target) --
        { id: 'SKP-2025-121', email: 'mahasiswa9@plai.ac.id', kategori: 'prestasi-kompetisi', kategoriText: 'Prestasi Kompetisi', judul: 'Juara 2 Lomba Robot Line Follower', penyelenggara: 'Kemdikbudristek', lokasi: 'Bandung', tglMulai: '2025-06-11', tglSelesai: '2025-06-13', tingkatText: 'Nasional', poin: 40, estimasiPoin: 40, status: 'Disetujui', tanggal: '2025-06-13', validator: 'Wakil Direktur', deskripsi: 'Juara 2 kompetisi robot line follower.', file: 'sertifikat-robot.pdf' },
        { id: 'SKP-2025-122', email: 'mahasiswa9@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Asisten Praktikum Kecerdasan Buatan', penyelenggara: 'Program Studi', lokasi: 'Kampus', tglMulai: '2025-02-01', tglSelesai: '2025-06-30', tingkatText: 'Internal', poin: 30, estimasiPoin: 30, status: 'Disetujui', tanggal: '2025-06-30', validator: 'Kaprodi', deskripsi: 'Asisten praktikum mata kuliah kecerdasan buatan.', file: 'surat-tugas-asisten.pdf' },
        { id: 'SKP-2025-123', email: 'mahasiswa9@plai.ac.id', kategori: 'prestasi-organisasi', kategoriText: 'Prestasi Organisasi', judul: 'Sosialisasi AI untuk Guru SMA', penyelenggara: 'LPPM', lokasi: 'Bantul', tglMulai: '2025-10-05', tglSelesai: '2025-10-12', tingkatText: 'Regional', poin: 30, estimasiPoin: 30, status: 'Disetujui', tanggal: '2025-10-12', validator: 'Admin Kemahasiswaan', deskripsi: 'Sosialisasi pemanfaatan AI kepada guru SMA.', file: 'laporan-sosialisasi.pdf' },


        // Pengajuan Prestasi Kompetisi yang SUDAH lolos Kaprodi dan kini menunggu
        // keputusan Wakil Direktur (validator tahap akhir, FR-18).
        {
            id: 'SKP-2026-108', email: 'mahasiswa5@plai.ac.id', kategori: 'prestasi-kompetisi', kategoriText: 'Prestasi Kompetisi', judul: 'Juara 3 Kontes Robot Terbang Indonesia', penyelenggara: 'Kemdikbudristek', lokasi: 'Bali', tglMulai: '2026-06-20', tglSelesai: '2026-06-23', tingkatText: 'Nasional', poin: 35, estimasiPoin: 35, status: 'Pending Wakil Direktur', tanggal: '2026-07-06', validator: 'Wakil Direktur', deskripsi: 'Meraih juara 3 pada kontes robot terbang tingkat nasional.', file: 'sertifikat-krti.pdf',
            workflow: [
                { role: 'Mahasiswa', status: 'completed', date: '2026-07-06T08:00:00.000Z' },
                { role: 'Kaprodi', status: 'completed', date: '2026-07-06T13:00:00.000Z' },
                { role: 'Wakil Direktur', status: 'active', date: null }
            ],
            timeline: [
                { title: 'Pengajuan dibuat', date: '2026-07-06T08:00:00.000Z' },
                { title: 'Disetujui oleh Kaprodi', date: '2026-07-06T13:00:00.000Z' },
                { title: 'Menunggu verifikasi Wakil Direktur', date: '2026-07-06T13:05:00.000Z' }
            ],
            riwayat: [
                { tanggal: '2026-07-06T08:00:00.000Z', status: 'Sedang Diverifikasi', validator: 'Sistem', keterangan: 'Pengajuan dibuat' },
                { tanggal: '2026-07-06T13:00:00.000Z', status: 'Pending Wakil Direktur', validator: 'Kaprodi', keterangan: 'Disetujui oleh Kaprodi, diteruskan ke Wakil Direktur' }
            ],
            catatan: []
        },

        {
            id: 'SKP-2026-104', email: 'mahasiswa2@plai.ac.id', kategori: 'prestasi-akademik', kategoriText: 'Prestasi Akademik', judul: 'Asisten Praktikum Basis Data', penyelenggara: 'Program Studi', lokasi: 'Kampus', tglMulai: '2026-06-28', tglSelesai: '2026-06-28', tingkatText: 'Internal', poin: 10, estimasiPoin: 10, status: 'Revisi', tanggal: '2026-07-01', validator: 'Kaprodi', deskripsi: 'Menjadi asisten praktikum mata kuliah Basis Data selama satu semester.', file: 'sk-asisten-praktikum-blur.jpg',
            // Workflow eksplisit (bukan auto "semua selesai") supaya jelas tahap
            // mana yang meminta revisi — konsisten dengan perilaku validasiPengajuan.
            // Prestasi Akademik = 3 tahap (Mahasiswa -> Kaprodi -> Admin), revisi
            // terjadi di tahap Kaprodi.
            workflow: [
                { role: 'Mahasiswa', status: 'completed', date: '2026-07-01T08:00:00.000Z' },
                { role: 'Kaprodi', status: 'revisi', date: '2026-07-01T14:00:00.000Z' },
                { role: 'Admin Kemahasiswaan', status: 'pending', date: null }
            ],
            catatan: [
                { author: 'Admin Kemahasiswaan', text: 'Sertifikat yang diunggah masih buram. Mohon unggah ulang hasil pindai yang lebih jelas.', date: '2026-07-01T14:00:00.000Z' }
            ]
        }
    ];

    // Lengkapi data dummy dengan workflow/timeline/riwayat/catatan/dokumen
    // supaya detail-pengajuan.html punya data nyata tanpa perlu dummy lokal sendiri.
    //
    // Catatan: jika sebuah entri dummy SUDAH menyertakan workflow/timeline/riwayat
    // sendiri (dipakai untuk pengajuan yang sengaja diseed dalam kondisi "sedang
    // berjalan di tengah workflow", mis. sudah lolos Kaprodi dan kini menunggu
    // Admin Kemahasiswaan), nilai tersebut dipakai apa adanya dan TIDAK ditimpa
    // oleh logika default di bawah — supaya kondisi antrean bisa disimulasikan
    // secara akurat untuk keperluan demo validasi (bukan hanya status final).
    function enrichDummyPengajuan(list) {
        return list.map(p => {
            let wf = p.workflow || buildWorkflow(p.kategori);
            if (!p.workflow && (p.status === 'Disetujui' || p.status === 'Ditolak' || p.status === 'Revisi')) {
                // Untuk data dummy final tanpa workflow custom, tandai semua tahap selesai.
                wf = wf.map(node => ({ ...node, status: 'completed', date: p.tanggal }));
            }
            return {
                ...p,
                workflow: wf,
                timeline: p.timeline || [
                    { title: 'Pengajuan dibuat', date: p.tanggal + 'T08:00:00.000Z' },
                    { title: `${p.status === 'Disetujui' ? 'Disetujui' : p.status === 'Ditolak' ? 'Ditolak' : p.status === 'Revisi' ? 'Diminta revisi' : 'Diverifikasi'} oleh ${p.validator}`, date: p.tanggal + 'T15:00:00.000Z' }
                ],
                riwayat: p.riwayat || [
                    { tanggal: p.tanggal + 'T08:00:00.000Z', status: 'Sedang Diverifikasi', validator: 'Sistem', keterangan: 'Pengajuan dibuat' },
                    { tanggal: p.tanggal + 'T15:00:00.000Z', status: p.status, validator: p.validator, keterangan: `${p.status} oleh ${p.validator}` }
                ],
                catatan: p.catatan || [],
                dokumen: p.dokumen || (p.file ? [p.file] : [])
            };
        });
    }

    function getDefaultState() {
        return {
            // Catatan: tidak ada lagi 'totalPoin' global. Poin dihitung per
            // mahasiswa via getTotalPoin(email) dari pengajuan Disetujui miliknya.
            targetPoin: TARGET_POIN,
            // Akun pengguna kini menjadi BAGIAN DARI STATE (bukan konstanta),
            // agar Tim LSI dapat menambah pengguna, mengubah peran, dan
            // menonaktifkan akun (RBAC, FR-12). DUMMY_ACCOUNTS dipakai sebagai
            // data awal (seed) saat sistem pertama kali diinisialisasi.
            accounts: JSON.parse(JSON.stringify(DUMMY_ACCOUNTS)),
            drafts: getDefaultDrafts(),
            pengajuan: enrichDummyPengajuan(JSON.parse(JSON.stringify(DUMMY_PENGAJUAN))),
            preferences: { darkMode: false, emailNotif: true, systemNotif: true, animasi: true },
            notifikasi: [],
            aktivitas: getDefaultAktivitas(), // activity log ringan: { tipe, judul, detail, waktu, ikon, warna }
            // ---- Data baru untuk peran Admin Kemahasiswaan (sesuai SRS) ----
            masterSKP: getDefaultMasterSKP(),         // Master Aturan SKP: kategori, tingkat, bobot poin
            peranList: getDefaultPeranList(),         // Daftar peran mahasiswa dalam kegiatan
            workflowConfig: getDefaultWorkflowConfig(), // Konfigurasi alur validasi per kategori
            periode: getDefaultPeriode(),             // Periode akademik
            auditTrail: getDefaultAuditTrail()        // Log audit formal: immutable, before/after
        };
    }

    // ============================================================
    // AUDIT TRAIL — log formal terpisah dari 'aktivitas' (yang sifatnya
    // ringan untuk UI dashboard). Audit Trail mencatat aktor, aksi, entitas,
    // serta data sebelum/sesudah perubahan (AB-23, AB-24), dan TIDAK PERNAH
    // dihapus/diubah oleh fungsi manapun setelah ditulis (immutable by convention).
    // ============================================================
    function getDefaultAuditTrail() {
        const now = Date.now();
        return [
            {
                id: 'AUD-seed-1',
                waktu: new Date(now - 3600000 * 40).toISOString(),
                aktor: 'Sistem',
                aktorRole: 'sistem',
                aksi: 'Inisialisasi Master Aturan SKP',
                entitas: 'MasterSKP',
                entitasId: '-',
                dataSebelum: null,
                dataSesudah: '6 kategori SKP dimuat sebagai konfigurasi awal sistem.',
                keterangan: 'Pemuatan data acuan awal saat sistem pertama kali disiapkan.'
            },
            {
                id: 'AUD-seed-2',
                waktu: new Date(now - 3600000 * 30).toISOString(),
                aktor: 'Habib Gili Ajiwinata, M.Pd.',
                aktorRole: 'admin-kemahasiswaan',
                aksi: 'Mengaktifkan Periode Akademik',
                entitas: 'PeriodeAkademik',
                entitasId: 'PRD-2026-1',
                dataSebelum: 'Belum ada periode aktif',
                dataSesudah: 'Periode 2026/2027 Ganjil diaktifkan (01 Agu 2026 — 31 Jan 2027)',
                keterangan: 'Pembukaan periode pengajuan klaim SKP semester ganjil.'
            }
        ];
    }

    function pushAuditTrail(state, entry) {
        if (!state.auditTrail) state.auditTrail = [];
        state.auditTrail.unshift({
            id: 'AUD-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            waktu: new Date().toISOString(),
            ...entry
        });
        // Audit Trail tidak dipotong/disusutkan secara otomatis (AB-23: permanen).
        // Untuk prototype, dibatasi agar sessionStorage tidak membengkak tak terbatas.
        if (state.auditTrail.length > 200) state.auditTrail = state.auditTrail.slice(0, 200);
    }

    function getAuditTrail() {
        const state = getState();
        return state.auditTrail || [];
    }

    // Mencatat penerbitan SKPI ke Audit Trail (FR-21). Dipanggil dari skpi.html
    // saat mahasiswa menerbitkan/mengunduh dokumen SKPI. Idempoten per nomor
    // dokumen agar tidak menumpuk bila tombol ditekan berulang dalam satu sesi
    // data (satu nomor SKPI = satu catatan penerbitan).
    function catatPenerbitanSKPI(data, aktor, aktorRole) {
        const state = getState();
        const nomor = (data && data.nomor) ? data.nomor : '-';
        const sudahAda = (state.auditTrail || []).some(
            a => a.aksi === 'Penerbitan SKPI' && a.entitasId === nomor
        );
        if (sudahAda) { return { ok: true, sudahTercatat: true }; }

        pushAuditTrail(state, {
            aktor: aktor || 'Mahasiswa',
            aktorRole: aktorRole || 'mahasiswa',
            aksi: 'Penerbitan SKPI',
            entitas: 'SKPI', entitasId: nomor,
            dataSebelum: null,
            dataSesudah: `SKPI diterbitkan dengan total ${data && data.totalPoin != null ? data.totalPoin : '-'} poin SKP` +
                         (data && data.nama ? ` untuk ${data.nama}` : '') + '.',
            keterangan: 'Dokumen SKPI diterbitkan sebagai pendamping ijazah.'
        });
        setState(state);
        return { ok: true };
    }

    // Draft dummy supaya halaman draft.html tidak terlihat kosong di awal.
    function getDefaultDrafts() {
        const now = new Date();
        return [
            {
                id: 'DRF-2026-001',
                email: 'mahasiswa1@plai.ac.id',
                kategori: 'prestasi-akademik',
                kategoriText: 'Prestasi Akademik',
                judul: 'Penelitian AI Kuantum',
                penyelenggara: 'LPPM',
                tglMulai: '2026-02-01',
                tglSelesai: '2026-02-10',
                lokasi: 'Kampus',
                tingkat: 'nasional',
                tingkatText: 'Nasional',
                estimasiPoin: 20,
                deskripsi: 'Penelitian dosen muda',
                file: 'sertifikat.pdf',
                status: 'Siap Dikirim',
                tanggalDibuat: new Date(now.getTime() - 86400000).toISOString(),
                terakhirDiubah: new Date(now.getTime() - 86400000).toISOString()
            },
            {
                id: 'DRF-2026-002',
                email: 'mahasiswa1@plai.ac.id',
                kategori: 'prestasi-kompetisi',
                kategoriText: 'Prestasi Kompetisi',
                judul: 'Kompetisi Data Science',
                penyelenggara: 'Kemendikbud',
                tglMulai: '2026-03-01',
                tglSelesai: '',
                lokasi: 'Jakarta',
                tingkat: 'internasional',
                tingkatText: 'Internasional',
                estimasiPoin: 30,
                deskripsi: '',
                file: '',
                status: 'Belum Lengkap',
                tanggalDibuat: now.toISOString(),
                terakhirDiubah: now.toISOString()
            },
            {
                id: 'DRF-2026-003',
                email: 'mahasiswa1@plai.ac.id',
                kategori: 'prestasi-organisasi',
                kategoriText: 'Prestasi Organisasi',
                judul: 'Ketua BEM',
                penyelenggara: '',
                tglMulai: '',
                tglSelesai: '',
                lokasi: 'Kampus',
                tingkat: 'internal',
                tingkatText: 'Internal',
                estimasiPoin: 8,
                deskripsi: 'Periode 2026',
                file: '',
                status: 'Draft',
                tanggalDibuat: new Date(now.getTime() - 172800000).toISOString(),
                terakhirDiubah: new Date(now.getTime() - 172800000).toISOString()
            },
            {
                id: 'DRF-2026-004',
                email: 'mahasiswa2@plai.ac.id',
                kategori: 'prestasi-akademik',
                kategoriText: 'Prestasi Akademik',
                judul: 'Publikasi Artikel Ilmiah Teknologi',
                penyelenggara: 'APTIKOM',
                tglMulai: '2026-04-05',
                tglSelesai: '2026-04-05',
                lokasi: 'Bandung',
                tingkat: 'nasional',
                tingkatText: 'Nasional',
                estimasiPoin: 10,
                deskripsi: 'Publikasi artikel ilmiah pada prosiding nasional.',
                file: 'sertifikat.jpg',
                status: 'Siap Dikirim',
                tanggalDibuat: new Date(now.getTime() - 259200000).toISOString(),
                terakhirDiubah: new Date(now.getTime() - 100000000).toISOString()
            },
            {
                id: 'DRF-2026-005',
                email: 'mahasiswa1@plai.ac.id',
                kategori: 'prestasi-akademik',
                kategoriText: 'Prestasi Akademik',
                judul: 'Asisten Riset UI/UX Design',
                penyelenggara: 'Skilvul',
                tglMulai: '2026-05-10',
                tglSelesai: '2026-05-14',
                lokasi: 'Online',
                tingkat: 'nasional',
                tingkatText: 'Nasional',
                estimasiPoin: 12,
                deskripsi: 'Pelatihan intensif UI/UX design untuk mahasiswa.',
                file: 'sertifikat-uiux.pdf',
                status: 'Siap Dikirim',
                tanggalDibuat: new Date(now.getTime() - 259200000).toISOString(),
                terakhirDiubah: new Date(now.getTime() - 216000000).toISOString()
            },
            {
                id: 'DRF-2026-006',
                email: 'mahasiswa1@plai.ac.id',
                kategori: 'prestasi-kompetisi',
                kategoriText: 'Prestasi Kompetisi',
                judul: 'Lomba Business Case Competition',
                penyelenggara: '',
                tglMulai: '2026-05-20',
                tglSelesai: '',
                lokasi: 'Surabaya',
                tingkat: 'regional',
                tingkatText: 'Regional',
                estimasiPoin: 18,
                deskripsi: '',
                file: '',
                status: 'Belum Lengkap',
                tanggalDibuat: new Date(now.getTime() - 43200000).toISOString(),
                terakhirDiubah: new Date(now.getTime() - 43200000).toISOString()
            }
        ];
    }

    // Aktivitas dummy awal supaya "Aktivitas Terbaru" tidak kosong sebelum user beraksi.
    function getDefaultAktivitas() {
        const now = Date.now();
        return [
            { id: 'ACT-seed-4', tipe: 'sistem', judul: 'Periode akademik dibuka', detail: 'Periode akademik 2026/2027 Ganjil resmi dibuka.', ikon: 'fa-calendar-check', warna: 'info', waktu: new Date(now - 3600000 * 30).toISOString(), email: null },
            { id: 'ACT-seed-3', tipe: 'validasi', judul: 'Pengajuan disetujui', detail: 'Pengajuan "Seminar Nasional" (SKP-2023-004) telah disetujui. +10 poin ditambahkan.', ikon: 'fa-circle-check', warna: 'success', waktu: new Date(now - 3600000 * 20).toISOString(), email: 'mahasiswa1@plai.ac.id' },
            { id: 'ACT-seed-2', tipe: 'validasi', judul: 'Pengajuan direvisi', detail: 'Pengajuan "Pelatihan AI" (SKP-2023-005) diminta untuk direvisi oleh Kaprodi.', ikon: 'fa-pen-to-square', warna: 'warning', waktu: new Date(now - 3600000 * 10).toISOString(), email: 'mahasiswa2@plai.ac.id' },
            { id: 'ACT-seed-1', tipe: 'draft', judul: 'Draft disimpan', detail: 'Draft "Kompetisi Data Science" berhasil disimpan.', ikon: 'fa-file-pen', warna: 'warning', waktu: new Date(now - 3600000 * 2).toISOString(), email: 'mahasiswa1@plai.ac.id' }
        ];
    }

    function initState() {
        const state = getDefaultState();
        setState(state);
        return state;
    }

    function getState() {
        try {
            // PENTING: state aplikasi (pengajuan, draft, poin, dst) memakai
            // localStorage, BUKAN sessionStorage. Sesi login (skp_user_session)
            // tetap di sessionStorage supaya tiap tab browser bisa login sebagai
            // peran berbeda secara bersamaan (mis. tab 1 = mahasiswa, tab 2 =
            // admin, untuk keperluan demo). Tapi DATA-nya harus localStorage
            // supaya: (1) tidak ikut terhapus saat logout (yang memanggil
            // sessionStorage.clear()), dan (2) pengajuan yang baru dibuat
            // mahasiswa di satu tab langsung terlihat saat admin membuka/
            // refresh tab lain — inilah yang membuat alur "mahasiswa
            // mengajukan -> admin memvalidasi -> poin bertambah" bisa
            // didemonstrasikan lintas tab/role sesuai workflow di SRS.
            const raw = localStorage.getItem(STATE_KEY);
            if (raw) {
                const state = JSON.parse(raw);
                if (!state.pengajuan) state.pengajuan = enrichDummyPengajuan(JSON.parse(JSON.stringify(DUMMY_PENGAJUAN)));
                if (!state.drafts) state.drafts = getDefaultDrafts();
                if (state.targetPoin === undefined) state.targetPoin = TARGET_POIN;
                if (!state.preferences) state.preferences = { darkMode: false, emailNotif: true, systemNotif: true, animasi: true };
                if (!state.notifikasi) state.notifikasi = [];
                if (!state.aktivitas) state.aktivitas = getDefaultAktivitas();
                // Backward-compatibility: sesi yang sudah berjalan sebelum field ini
                // ada (mis. browser belum reload) tetap mendapat nilai default.
                if (!state.masterSKP) state.masterSKP = getDefaultMasterSKP();
                if (!state.peranList) state.peranList = getDefaultPeranList();
                if (!state.workflowConfig) state.workflowConfig = getDefaultWorkflowConfig();
                if (!state.periode) state.periode = getDefaultPeriode();
                if (!state.auditTrail) state.auditTrail = getDefaultAuditTrail();
                return state;
            }
        } catch (e) {
            console.warn('Error reading state, reinitializing');
        }
        return initState();
    }

    function setState(state) {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    }

    function getCurrentSession() {
        try {
            return JSON.parse(sessionStorage.getItem('skp_user_session'));
        } catch (e) {
            return null;
        }
    }

    // ------------------- Activity Log -------------------
    // 'email' bersifat opsional: aktivitas bertipe 'sistem' (mis. pembukaan periode
    // akademik) sengaja tidak diikat ke satu email tertentu, supaya tetap relevan
    // ditampilkan ke semua pengguna.
    function pushAktivitas(state, tipe, judul, detail, ikon, warna, email) {
        state.aktivitas.unshift({
            id: 'ACT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            tipe,       // 'pengajuan' | 'draft' | 'validasi' | 'sistem'
            judul,
            detail,
            ikon: ikon || 'fa-circle-dot',
            warna: warna || 'info',
            waktu: new Date().toISOString(),
            email: email || null
        });
        if (state.aktivitas.length > 30) state.aktivitas = state.aktivitas.slice(0, 30);
    }

    function addAktivitas(tipe, judul, detail, ikon, warna, email) {
        const state = getState();
        pushAktivitas(state, tipe, judul, detail, ikon, warna, email);
        setState(state);
    }

    // ------------------- Draft -------------------
    function addDraft(draft) {
        const state = getState();
        if (!draft.id) draft.id = 'DRF-' + Date.now();
        const session = getCurrentSession();
        draft.email = draft.email || (session ? session.email : 'unknown@plai.ac.id');
        draft.tanggalDibuat = draft.tanggalDibuat || new Date().toISOString();
        draft.terakhirDiubah = new Date().toISOString();
        state.drafts.push(draft);
        // Catat aktivitas
        pushAktivitas(state, 'draft', 'Draft disimpan',
            `Draft "${draft.judul || draft.kategoriText || draft.kategori || 'Pengajuan'}" berhasil disimpan.`,
            'fa-file-pen', 'warning', draft.email);
        setState(state);
        return draft;
    }

    function updateDraft(draftId, updates) {
        const state = getState();
        const idx = state.drafts.findIndex(d => d.id === draftId);
        if (idx === -1) return null;
        state.drafts[idx] = { ...state.drafts[idx], ...updates, terakhirDiubah: new Date().toISOString() };
        pushAktivitas(state, 'draft', 'Draft diperbarui',
            `Draft "${state.drafts[idx].judul || state.drafts[idx].kategoriText || 'Pengajuan'}" berhasil diperbarui.`,
            'fa-file-pen', 'warning', state.drafts[idx].email);
        setState(state);
        return state.drafts[idx];
    }

    function removeDraft(draftId, silent) {
        const state = getState();
        const draft = state.drafts.find(d => d.id === draftId);
        state.drafts = state.drafts.filter(d => d.id !== draftId);
        if (draft && !silent) {
            pushAktivitas(state, 'draft', 'Draft dihapus',
                `Draft "${draft.judul || draft.kategoriText || draft.kategori || 'Pengajuan'}" telah dihapus.`,
                'fa-trash', 'danger', draft.email);
        }
        setState(state);
    }

    function getDraftById(id) {
        const state = getState();
        return state.drafts.find(d => d.id === id) || null;
    }

    // ------------------- Pengajuan -------------------
    // Pengajuan baru SELALU berstatus 'Sedang Diverifikasi' dan menunggu
    // keputusan MANUSIA (validator pertama sesuai workflow kategori terkait —
    // lihat buildWorkflow/getWorkflowForKategori). Tidak ada lagi persetujuan
    // otomatis berbasis timer; poin SKP hanya bertambah setelah validator
    // benar-benar menyetujui lewat AppState.validasiPengajuan (dipanggil dari
    // detail-pengajuan.html).
    function addPengajuan(pengajuan) {
        const state = getState();
        if (!pengajuan.id) pengajuan.id = 'SKP-' + Date.now();
        pengajuan.status = 'Sedang Diverifikasi';
        pengajuan.tanggal = pengajuan.tanggal || new Date().toISOString().slice(0, 10);
        pengajuan.validator = '-';
        if (!pengajuan.poin) pengajuan.poin = pengajuan.estimasiPoin || 0;

        // Ambil email dari session
        const session = getCurrentSession();
        pengajuan.email = pengajuan.email || (session ? session.email : 'unknown@plai.ac.id');

        // Lengkapi data pendukung agar detail-pengajuan.html punya sesuatu untuk ditampilkan.
        // Pakai workflowConfig TERKINI (hasil konfigurasi Admin yang sedang berlaku),
        // bukan default statis, sesuai AB-17: perubahan konfigurasi berlaku untuk
        // pengajuan baru.
        pengajuan.workflow = pengajuan.workflow || buildWorkflow(pengajuan.kategori, state.workflowConfig);
        pengajuan.timeline = pengajuan.timeline || [
            { title: 'Pengajuan dibuat', date: new Date().toISOString() },
            { title: `Masuk antrean ${(pengajuan.workflow[1] || {}).role || 'Validator'}`, date: new Date().toISOString() }
        ];
        pengajuan.riwayat = pengajuan.riwayat || [
            { tanggal: new Date().toISOString(), status: 'Sedang Diverifikasi', validator: 'Sistem', keterangan: 'Pengajuan dibuat' }
        ];
        pengajuan.catatan = pengajuan.catatan || [];
        pengajuan.dokumen = pengajuan.dokumen || (pengajuan.file ? [pengajuan.file] : []);

        state.pengajuan.push(pengajuan);

        // Notifikasi
        state.notifikasi.push({
            pesan: `Pengajuan baru "${pengajuan.judul || pengajuan.kategori}" telah dikirim dan sedang diverifikasi.`,
            waktu: new Date().toISOString(),
            dibaca: false
        });

        // Activity log
        pushAktivitas(state, 'pengajuan', 'Pengajuan dikirim',
            `Pengajuan "${pengajuan.judul || pengajuan.kategori || 'SKP'}" (${pengajuan.id}) berhasil dikirim dan sedang diverifikasi.`,
            'fa-paper-plane', 'info', pengajuan.email);

        // Audit Trail formal (FR-21): pengajuan klaim adalah pergerakan penting
        // pertama dalam siklus hidup sebuah SKP, jadi wajib tercatat sejak awal —
        // bukan hanya saat validasi. Aktor adalah mahasiswa yang mengajukan.
        const namaPengaju = (session && session.fullName) ? session.fullName : (pengajuan.email || 'Mahasiswa');
        pushAuditTrail(state, {
            aktor: namaPengaju,
            aktorRole: 'mahasiswa',
            aksi: 'Pengajuan Klaim SKP',
            entitas: 'Pengajuan', entitasId: pengajuan.id,
            dataSebelum: null,
            dataSesudah: `"${pengajuan.judul || pengajuan.kategori}" (${pengajuan.kategoriText || pengajuan.kategori}) diajukan, status awal: Sedang Diverifikasi.`,
            keterangan: 'Mahasiswa mengajukan klaim SKP baru untuk diverifikasi sesuai alur workflow.'
        });

        setState(state);
        return pengajuan;
    }

    function getPengajuanById(id) {
        const state = getState();
        return state.pengajuan.find(p => p.id === id) || null;
    }

    // Total poin SKP untuk SATU mahasiswa tertentu (berdasarkan email).
    // Poin dihitung dari pengajuan miliknya yang sudah berstatus 'Disetujui'.
    // Ini menggantikan variabel state.totalPoin global yang keliru — dengan
    // pendekatan ini, tiap mahasiswa punya total sendiri yang akurat dan
    // otomatis bertambah hanya ketika pengajuan miliknya divalidasi.
    function getTotalPoin(email) {
        const state = getState();
        if (!email) return 0;
        return state.pengajuan
            .filter(p => p.email === email && p.status === 'Disetujui')
            .reduce((sum, p) => sum + (p.poin || p.estimasiPoin || 0), 0);
    }

    // Update pengajuan tertentu (dipakai detail-pengajuan.html untuk aksi Setujui/Revisi/Tolak/Catatan)
    function updatePengajuan(id, updates) {
        const state = getState();
        const idx = state.pengajuan.findIndex(p => p.id === id);
        if (idx === -1) return null;
        state.pengajuan[idx] = { ...state.pengajuan[idx], ...updates };
        setState(state);
        return state.pengajuan[idx];
    }

    // Aksi validasi oleh Kaprodi/Admin Kemahasiswaan/Wakil Direktur dari detail-pengajuan.html
    function validasiPengajuan(id, action, validatorRole, validatorName, catatanText) {
        const state = getState();
        const idx = state.pengajuan.findIndex(p => p.id === id);
        if (idx === -1) return null;
        const pengajuan = state.pengajuan[idx];

        // NFR-08 / AB-12: data yang sudah disetujui pada tahap akhir terkunci,
        // tidak dapat dimodifikasi oleh siapapun (termasuk validator lain).
        const statusTerkunci = ['Disetujui', 'Ditolak'];
        if (statusTerkunci.includes(pengajuan.status)) {
            return { error: `Pengajuan berstatus "${pengajuan.status}" sudah final dan tidak dapat diubah lagi.` };
        }

        const now = new Date().toISOString();
        const statusSebelum = pengajuan.status;

        let newStatus = pengajuan.status;
        let poinDitambahkan = 0;

        if (action === 'Setujui') {
            const wf = pengajuan.workflow || [];
            const currentIdx = wf.findIndex(w => w.role === validatorRole);
            const isLastStep = currentIdx === wf.length - 1;
            if (isLastStep) {
                newStatus = 'Disetujui';
                poinDitambahkan = pengajuan.poin || pengajuan.estimasiPoin || 0;
            } else {
                const nextRole = wf[currentIdx + 1] ? wf[currentIdx + 1].role : 'Admin Kemahasiswaan';
                newStatus = 'Pending ' + nextRole;
            }
            pengajuan.workflow = wf.map((w, i) => {
                if (w.role === validatorRole) return { ...w, status: 'completed', date: now };
                if (i === currentIdx + 1) return { ...w, status: 'active' };
                return w;
            });
        } else if (action === 'Revisi') {
            newStatus = 'Revisi';
            // Tandai tahap validator ini sebagai 'revisi' (bukan lagi 'active')
            // supaya pengajuan ini TIDAK lagi muncul di antrean validator yang
            // sama (giliran kini kembali ke Mahasiswa untuk memperbaiki), tanpa
            // menandainya 'completed' yang bisa menyiratkan seolah sudah lolos.
            const wfRevisi = pengajuan.workflow || [];
            pengajuan.workflow = wfRevisi.map(w =>
                w.role === validatorRole ? { ...w, status: 'revisi', date: now } : w
            );
        } else if (action === 'Tolak') {
            newStatus = 'Ditolak';
        }

        pengajuan.status = newStatus;
        pengajuan.validator = validatorName;
        pengajuan.timeline = pengajuan.timeline || [];
        pengajuan.timeline.push({ title: `${action} oleh ${validatorRole}`, date: now });
        pengajuan.riwayat = pengajuan.riwayat || [];
        pengajuan.riwayat.push({ tanggal: now, status: newStatus, validator: validatorName, keterangan: `${action} oleh ${validatorRole}` });
        if (catatanText) {
            pengajuan.catatan = pengajuan.catatan || [];
            pengajuan.catatan.push({ author: validatorName, text: catatanText, date: now });
        }

        // Catatan: tidak perlu lagi menambah state.totalPoin global. Poin tiap
        // mahasiswa dihitung dinamis oleh getTotalPoin(email) dari pengajuan
        // berstatus 'Disetujui' miliknya. Karena status pengajuan ini baru saja
        // diubah menjadi 'Disetujui' di atas, poin mahasiswa otomatis ikut
        // terhitung benar tanpa penjumlahan manual (yang dulu keliru karena
        // dibagikan ke semua mahasiswa).
        state.pengajuan[idx] = pengajuan;

        state.notifikasi.push({
            pesan: `Pengajuan Anda (${pengajuan.id}) ${action === 'Setujui' ? 'disetujui' : action === 'Revisi' ? 'diminta direvisi' : 'ditolak'} oleh ${validatorName}.`,
            waktu: now,
            dibaca: false,
            email: pengajuan.email
        });

        pushAktivitas(state, 'validasi', `Pengajuan ${action === 'Setujui' ? 'disetujui' : action === 'Revisi' ? 'direvisi' : 'ditolak'}`,
            `Pengajuan "${pengajuan.judul || pengajuan.kategori}" (${pengajuan.id}) ${action.toLowerCase()} oleh ${validatorRole}.`,
            action === 'Setujui' ? 'fa-circle-check' : action === 'Revisi' ? 'fa-pen-to-square' : 'fa-xmark-circle',
            action === 'Setujui' ? 'success' : action === 'Revisi' ? 'warning' : 'danger',
            pengajuan.email);

        // Audit Trail formal (AB-24): setiap keputusan validasi wajib tercatat.
        pushAuditTrail(state, {
            aktor: validatorName,
            aktorRole: validatorRole,
            aksi: `Validasi: ${action}`,
            entitas: 'Pengajuan', entitasId: pengajuan.id,
            dataSebelum: `status: ${statusSebelum}`,
            dataSesudah: `status: ${newStatus}` + (poinDitambahkan > 0 ? `, +${poinDitambahkan} poin` : ''),
            keterangan: catatanText || (action === 'Setujui' && newStatus === 'Disetujui' ? 'Disetujui pada tahap akhir workflow, poin SKP diakumulasikan otomatis.' : '')
        });

        setState(state);
        return pengajuan;
    }

    function tambahCatatan(id, author, text) {
        const state = getState();
        const idx = state.pengajuan.findIndex(p => p.id === id);
        if (idx === -1) return null;
        state.pengajuan[idx].catatan = state.pengajuan[idx].catatan || [];
        state.pengajuan[idx].catatan.push({ author, text, date: new Date().toISOString() });
        setState(state);
        return state.pengajuan[idx];
    }

    // ============================================================
    // MASTER ATURAN SKP — CRUD oleh Admin Kemahasiswaan (FR-15, Use Case
    // "Mengelola Master Data SKP"). 'aktor' adalah nama lengkap pengguna yang
    // melakukan perubahan, dipakai untuk Audit Trail (AB-23/24).
    // ============================================================
    function addKategoriSKP(data, aktor, aktorRole) {
        const state = getState();
        const id = 'KAT-' + Date.now();
        const kategoriBaru = {
            id,
            kode: data.kode,
            nama: data.nama,
            deskripsi: data.deskripsi || '',
            aktif: true,
            tingkat: data.tingkat || [
                { id: 'internal', nama: 'Internal', poin: 0 },
                { id: 'regional', nama: 'Regional', poin: 0 },
                { id: 'nasional', nama: 'Nasional', poin: 0 },
                { id: 'internasional', nama: 'Internasional', poin: 0 }
            ]
        };
        state.masterSKP.push(kategoriBaru);
        pushAuditTrail(state, {
            aktor, aktorRole,
            aksi: 'Menambah Kategori SKP',
            entitas: 'MasterSKP', entitasId: id,
            dataSebelum: null,
            dataSesudah: `Kategori "${kategoriBaru.nama}" (${kategoriBaru.kode}) ditambahkan.`,
            keterangan: 'Kategori baru akan tersedia untuk pengajuan klaim berikutnya.'
        });
        pushAktivitas(state, 'sistem', 'Master Data SKP diperbarui',
            `Kategori "${kategoriBaru.nama}" ditambahkan ke Master Aturan SKP.`,
            'fa-layer-group', 'info', null);
        setState(state);
        return kategoriBaru;
    }

    function updateKategoriSKP(id, updates, aktor, aktorRole) {
        const state = getState();
        const idx = state.masterSKP.findIndex(k => k.id === id);
        if (idx === -1) return null;
        const before = JSON.parse(JSON.stringify(state.masterSKP[idx]));
        state.masterSKP[idx] = { ...state.masterSKP[idx], ...updates };
        pushAuditTrail(state, {
            aktor, aktorRole,
            aksi: 'Mengubah Kategori SKP',
            entitas: 'MasterSKP', entitasId: id,
            dataSebelum: `${before.nama}: ${(before.tingkat || []).map(t => t.nama + '=' + t.poin).join(', ')}`,
            dataSesudah: `${state.masterSKP[idx].nama}: ${(state.masterSKP[idx].tingkat || []).map(t => t.nama + '=' + t.poin).join(', ')}`,
            keterangan: 'Perubahan ini hanya berlaku untuk pengajuan klaim baru (AB-13), tidak berlaku surut.'
        });
        pushAktivitas(state, 'sistem', 'Master Data SKP diperbarui',
            `Bobot poin kategori "${state.masterSKP[idx].nama}" diperbarui oleh ${aktor}.`,
            'fa-layer-group', 'warning', null);
        setState(state);
        return state.masterSKP[idx];
    }

    // Menonaktifkan (bukan menghapus) kategori — data historis tetap utuh (AB-14)
    function toggleKategoriSKP(id, aktif, aktor, aktorRole) {
        const state = getState();
        const idx = state.masterSKP.findIndex(k => k.id === id);
        if (idx === -1) return null;
        state.masterSKP[idx].aktif = aktif;
        pushAuditTrail(state, {
            aktor, aktorRole,
            aksi: aktif ? 'Mengaktifkan Kembali Kategori SKP' : 'Menonaktifkan Kategori SKP',
            entitas: 'MasterSKP', entitasId: id,
            dataSebelum: `aktif: ${!aktif}`,
            dataSesudah: `aktif: ${aktif}`,
            keterangan: 'Kategori yang dinonaktifkan tidak muncul di formulir pengajuan baru, namun data historis tetap tersimpan.'
        });
        setState(state);
        return state.masterSKP[idx];
    }

    function getMasterSKP() {
        const state = getState();
        return state.masterSKP || [];
    }

    function getPeranList() {
        const state = getState();
        return state.peranList || [];
    }

    function addPeran(nama, aktor, aktorRole) {
        const state = getState();
        const id = nama.toLowerCase().replace(/\s+/g, '-');
        if ((state.peranList || []).some(p => p.id === id)) return null;
        const peranBaru = { id, nama, aktif: true };
        state.peranList.push(peranBaru);
        pushAuditTrail(state, {
            aktor, aktorRole,
            aksi: 'Menambah Peran Mahasiswa',
            entitas: 'PeranList', entitasId: id,
            dataSebelum: null,
            dataSesudah: `Peran "${nama}" ditambahkan.`,
            keterangan: ''
        });
        setState(state);
        return peranBaru;
    }

    // ============================================================
    // KONFIGURASI WORKFLOW VALIDASI — oleh Admin Kemahasiswaan / Tim LSI
    // (FR-22, Use Case "Konfigurasi Workflow Validasi"). Menyimpan juga riwayat
    // konfigurasi sebelumnya untuk keperluan rollback (lihat Notes and Issues
    // pada use case terkait).
    // ============================================================
    function getWorkflowConfig() {
        const state = getState();
        return state.workflowConfig || getDefaultWorkflowConfig();
    }

    function updateWorkflowConfig(kategoriKode, urutanRole, aktor, aktorRole) {
        const state = getState();
        if (!urutanRole || urutanRole.length === 0) {
            return { error: 'Workflow harus memiliki minimal satu tahap validasi.' };
        }
        const before = (state.workflowConfig[kategoriKode] || []).join(' → ');
        // Simpan riwayat konfigurasi sebelumnya untuk rollback
        state.workflowConfigHistory = state.workflowConfigHistory || [];
        state.workflowConfigHistory.unshift({
            id: 'WFH-' + Date.now(),
            kategoriKode,
            urutanSebelum: state.workflowConfig[kategoriKode] || [],
            waktu: new Date().toISOString(),
            aktor
        });
        if (state.workflowConfigHistory.length > 50) state.workflowConfigHistory = state.workflowConfigHistory.slice(0, 50);

        state.workflowConfig[kategoriKode] = urutanRole;
        const after = urutanRole.join(' → ');

        pushAuditTrail(state, {
            aktor, aktorRole,
            aksi: 'Mengubah Konfigurasi Workflow Validasi',
            entitas: 'WorkflowConfig', entitasId: kategoriKode,
            dataSebelum: before,
            dataSesudah: after,
            keterangan: 'Perubahan ini hanya berlaku untuk pengajuan baru (AB-17), tidak berlaku surut terhadap pengajuan yang sedang berjalan.'
        });
        pushAktivitas(state, 'sistem', 'Konfigurasi Workflow diperbarui',
            `Alur validasi kategori "${kategoriKode}" diubah menjadi: ${after}.`,
            'fa-diagram-project', 'warning', null);

        setState(state);
        return { success: true, workflowConfig: state.workflowConfig };
    }

    function getWorkflowConfigHistory() {
        const state = getState();
        return state.workflowConfigHistory || [];
    }

    // ============================================================
    // PERIODE AKADEMIK — oleh Admin Kemahasiswaan (FR-25, Use Case
    // "Mengelola Periode Akademik"). Hanya satu periode boleh aktif (AB-15).
    // ============================================================
    function getPeriodeList() {
        const state = getState();
        return state.periode || [];
    }

    function getPeriodeAktif() {
        const state = getState();
        return (state.periode || []).find(p => p.status === 'Aktif') || null;
    }

    function addPeriode(data, aktor, aktorRole) {
        const state = getState();
        if (new Date(data.tanggalSelesai) < new Date(data.tanggalMulai)) {
            return { error: 'Tanggal berakhir tidak boleh lebih awal dari tanggal mulai.' };
        }
        const adaAktif = (state.periode || []).some(p => p.status === 'Aktif');
        if (adaAktif && data.langsungAktifkan) {
            return { error: 'Masih ada periode aktif. Tutup periode aktif terlebih dahulu sebelum mengaktifkan periode baru.' };
        }
        const id = 'PRD-' + Date.now();
        const periodeBaru = {
            id,
            nama: data.nama,
            tanggalMulai: data.tanggalMulai,
            tanggalSelesai: data.tanggalSelesai,
            status: data.langsungAktifkan ? 'Aktif' : 'Draft'
        };
        state.periode.push(periodeBaru);

        pushAuditTrail(state, {
            aktor, aktorRole,
            aksi: 'Menambah Periode Akademik',
            entitas: 'PeriodeAkademik', entitasId: id,
            dataSebelum: null,
            dataSesudah: `Periode "${periodeBaru.nama}" (${periodeBaru.tanggalMulai} s/d ${periodeBaru.tanggalSelesai}), status: ${periodeBaru.status}`,
            keterangan: ''
        });

        if (periodeBaru.status === 'Aktif') {
            pushAktivitas(state, 'sistem', 'Periode akademik dibuka',
                `Periode akademik "${periodeBaru.nama}" resmi dibuka.`,
                'fa-calendar-check', 'info', null);
        }

        setState(state);
        return { success: true, periode: periodeBaru };
    }

    function tutupPeriode(id, aktor, aktorRole) {
        const state = getState();
        const idx = state.periode.findIndex(p => p.id === id);
        if (idx === -1) return null;
        state.periode[idx].status = 'Ditutup';

        pushAuditTrail(state, {
            aktor, aktorRole,
            aksi: 'Menutup Periode Akademik',
            entitas: 'PeriodeAkademik', entitasId: id,
            dataSebelum: 'status: Aktif',
            dataSesudah: 'status: Ditutup',
            keterangan: 'Pengajuan klaim baru untuk periode ini dinonaktifkan. Pengajuan yang sedang berjalan tetap dapat diproses hingga selesai.'
        });
        pushAktivitas(state, 'sistem', 'Periode akademik ditutup',
            `Periode akademik "${state.periode[idx].nama}" telah ditutup.`,
            'fa-calendar-xmark', 'warning', null);

        setState(state);
        return state.periode[idx];
    }

    function aktifkanPeriode(id, aktor, aktorRole) {
        const state = getState();
        const target = state.periode.find(p => p.id === id);
        if (!target) return { error: 'Periode tidak ditemukan.' };
        const adaAktifLain = state.periode.some(p => p.status === 'Aktif' && p.id !== id);
        if (adaAktifLain) {
            return { error: 'Masih ada periode lain yang aktif. Tutup periode tersebut terlebih dahulu.' };
        }
        target.status = 'Aktif';

        pushAuditTrail(state, {
            aktor, aktorRole,
            aksi: 'Mengaktifkan Periode Akademik',
            entitas: 'PeriodeAkademik', entitasId: id,
            dataSebelum: 'status: Draft/Ditutup',
            dataSesudah: 'status: Aktif',
            keterangan: ''
        });
        pushAktivitas(state, 'sistem', 'Periode akademik dibuka',
            `Periode akademik "${target.nama}" resmi dibuka.`,
            'fa-calendar-check', 'info', null);

        setState(state);
        return { success: true, periode: target };
    }

    // ------------------- Toast -------------------
    function showToast(message, type = 'success') {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ------------------- Reset -------------------
    function resetState() {
        localStorage.removeItem(STATE_KEY);
        initState();
    }

    // Ekspos ke global
    window.AppState = {
        initState,
        getState,
        setState,
        getCurrentSession,
        // akun
        getAccountByEmail,
        getAllAccounts,
        addAccount,
        updateAccountRole,
        toggleAccountActive,
        isAccountActive,
        LABEL_ROLE,
        // workflow (alur validator per kategori)
        buildWorkflow,
        getWorkflowForKategori,
        getWorkflowConfig,
        updateWorkflowConfig,
        getWorkflowConfigHistory,
        // master aturan SKP
        getMasterSKP,
        getActiveKategoriSKP,
        getBobotPoin,
        addKategoriSKP,
        updateKategoriSKP,
        toggleKategoriSKP,
        getPeranList,
        addPeran,
        // periode akademik
        getPeriodeList,
        getPeriodeAktif,
        addPeriode,
        tutupPeriode,
        aktifkanPeriode,
        // audit trail
        getAuditTrail,
        catatPenerbitanSKPI,
        // draft
        addDraft,
        updateDraft,
        removeDraft,
        getDraftById,
        // pengajuan
        addPengajuan,
        getPengajuanById,
        getTotalPoin,
        updatePengajuan,
        validasiPengajuan,
        tambahCatatan,
        // aktivitas
        addAktivitas,
        // util
        showToast,
        resetState,
        DUMMY_PENGAJUAN,
        TARGET_POIN
    };
})();
