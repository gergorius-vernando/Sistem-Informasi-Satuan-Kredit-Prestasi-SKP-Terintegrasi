// state.js - State Management untuk Sistem Informasi SKP
// SATU SUMBER DATA untuk seluruh sistem (mahasiswa, draft, pengajuan, validasi, aktivitas).
// Semua data disimpan dalam satu object state di sessionStorage (skp_app_state).
// Akun pengguna (dummyAccounts) juga didefinisikan di sini agar semua halaman
// (login, dashboard, detail-pengajuan, dll) bisa melakukan lookup nama/NIM/prodi dari email yang sama.

(function() {
    const STATE_KEY = 'skp_app_state';
    const TARGET_POIN = 100;
    const DURATION_VALIDASI = 30000; // 30 detik

    // ============================================================
    // AKUN PENGGUNA (sumber tunggal — dipakai login.html & lookup identitas)
    // ============================================================
    const DUMMY_ACCOUNTS = {
        'mahasiswa1@plai.ac.id': {
            fullName: 'Ahmad Fauzi Rahman',
            role: 'Mahasiswa',
            roleKey: 'mahasiswa',
            password: '12345',
            dashboardUrl: 'dashboard-mahasiswa.html',
            avatar: 'AF',
            nim: '2024001',
            prodi: 'Teknik Informatika'
        },
        'mahasiswa2@plai.ac.id': {
            fullName: 'Dewi Sartika Putri',
            role: 'Mahasiswa',
            roleKey: 'mahasiswa',
            password: '12345',
            dashboardUrl: 'dashboard-mahasiswa.html',
            avatar: 'DP',
            nim: '2024002',
            prodi: 'Sistem Informasi'
        },
        'adminmhs@plai.ac.id': {
            fullName: 'Dra. Siti Nurhaliza, M.Pd.',
            role: 'Admin Kemahasiswaan',
            roleKey: 'admin-kemahasiswaan',
            password: '12345',
            dashboardUrl: 'dashboard-admin.html',
            avatar: 'SN',
            nip: '198501012010011001',
            prodi: 'Bagian Kemahasiswaan'
        },
        'kaprodi@plai.ac.id': {
            fullName: 'Dr. Budi Santoso, S.Kom., M.Kom.',
            role: 'Kaprodi',
            roleKey: 'kaprodi',
            password: '12345',
            dashboardUrl: 'dashboard-kaprodi.html',
            avatar: 'BS',
            nip: '198001012008011001',
            prodi: 'Teknik Informatika'
        },
        'wadir@plai.ac.id': {
            fullName: 'Prof. Dr. Ir. Haryono, M.Sc.',
            role: 'Wakil Direktur',
            roleKey: 'wakil-direktur',
            password: '12345',
            dashboardUrl: 'dashboard-wadir.html',
            avatar: 'HY',
            nip: '197501012005011001',
            prodi: 'Bidang Akademik'
        },
        'direktur@plai.ac.id': {
            fullName: 'Prof. Dr. Ir. Rachmat Wijaya, M.Eng.',
            role: 'Direktur',
            roleKey: 'direktur',
            password: '12345',
            dashboardUrl: 'dashboard-direktur.html',
            avatar: 'RW',
            nip: '197001012000011001',
            prodi: 'Politeknik AI LPI'
        },
        'lsi@plai.ac.id': {
            fullName: 'Rina Anggraeni, S.Pd., M.T.',
            role: 'Tim LSI',
            roleKey: 'tim-lsi',
            password: '12345',
            dashboardUrl: 'dashboard-timlsi.html',
            avatar: 'RA',
            nip: '199001012015011001',
            prodi: 'Lembaga Sertifikasi Internal'
        }
    };

    function getAccountByEmail(email) {
        if (!email) return null;
        return DUMMY_ACCOUNTS[email.toLowerCase()] || null;
    }

    function getAllAccounts() {
        return DUMMY_ACCOUNTS;
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
            },
            {
                id: 'KAT-04', kode: 'seminar', nama: 'Seminar', aktif: true,
                deskripsi: 'Partisipasi sebagai peserta, pemateri, atau panitia seminar.',
                tingkat: [
                    { id: 'internal', nama: 'Internal', poin: 5 },
                    { id: 'regional', nama: 'Regional', poin: 7 },
                    { id: 'nasional', nama: 'Nasional', poin: 10 },
                    { id: 'internasional', nama: 'Internasional', poin: 15 }
                ]
            },
            {
                id: 'KAT-05', kode: 'pelatihan', nama: 'Pelatihan', aktif: true,
                deskripsi: 'Pelatihan atau workshop peningkatan kompetensi.',
                tingkat: [
                    { id: 'internal', nama: 'Internal', poin: 6 },
                    { id: 'regional', nama: 'Regional', poin: 9 },
                    { id: 'nasional', nama: 'Nasional', poin: 12 },
                    { id: 'internasional', nama: 'Internasional', poin: 18 }
                ]
            },
            {
                id: 'KAT-06', kode: 'pengabdian', nama: 'Pengabdian', aktif: true,
                deskripsi: 'Kegiatan pengabdian kepada masyarakat.',
                tingkat: [
                    { id: 'internal', nama: 'Internal', poin: 8 },
                    { id: 'regional', nama: 'Regional', poin: 12 },
                    { id: 'nasional', nama: 'Nasional', poin: 16 },
                    { id: 'internasional', nama: 'Internasional', poin: 20 }
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
            'prestasi-kompetisi':  ['Mahasiswa', 'Kaprodi', 'Wakil Direktur'],
            'seminar':             ['Mahasiswa', 'Admin Kemahasiswaan'],
            'pelatihan':           ['Mahasiswa', 'Admin Kemahasiswaan'],
            'pengabdian':          ['Mahasiswa', 'Admin Kemahasiswaan']
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
        { id: 'SKP-2023-004', email: 'mahasiswa1@plai.ac.id', kategori: 'seminar', kategoriText: 'Seminar', judul: 'Seminar Nasional', penyelenggara: 'APTIKOM', lokasi: 'Bandung', tglMulai: '2023-08-05', tglSelesai: '2023-08-05', tingkatText: 'Nasional', poin: 10, estimasiPoin: 10, status: 'Disetujui', tanggal: '2023-08-05', validator: 'Admin Kemahasiswaan', deskripsi: 'Peserta seminar nasional teknologi.', file: 'sertifikat-seminar.pdf' },
        { id: 'SKP-2023-005', email: 'mahasiswa2@plai.ac.id', kategori: 'pelatihan', kategoriText: 'Pelatihan', judul: 'Pelatihan AI', penyelenggara: 'LPPM', lokasi: 'Kampus', tglMulai: '2023-08-28', tglSelesai: '2023-09-01', tingkatText: 'Internal', poin: 12, estimasiPoin: 12, status: 'Revisi', tanggal: '2023-09-01', validator: 'Kaprodi', deskripsi: 'Pelatihan implementasi kecerdasan buatan.', file: 'sertifikat-pelatihan-ai.pdf' },
        { id: 'SKP-2023-006', email: 'mahasiswa2@plai.ac.id', kategori: 'pengabdian', kategoriText: 'Pengabdian', judul: 'Pengabdian Desa', penyelenggara: 'LPPM', lokasi: 'Desa Binaan', tglMulai: '2023-10-08', tglSelesai: '2023-10-12', tingkatText: 'Regional', poin: 18, estimasiPoin: 18, status: 'Disetujui', tanggal: '2023-10-12', validator: 'Admin Kemahasiswaan', deskripsi: 'Program pengabdian masyarakat di desa binaan.', file: 'sertifikat-pengabdian.pdf' }
    ];

    // Lengkapi data dummy dengan workflow/timeline/riwayat/catatan/dokumen
    // supaya detail-pengajuan.html punya data nyata tanpa perlu dummy lokal sendiri.
    function enrichDummyPengajuan(list) {
        return list.map(p => {
            const wf = buildWorkflow(p.kategori).map(node => {
                // Untuk data dummy yang sudah final, tandai workflow sesuai status akhir
                if (p.status === 'Disetujui' || p.status === 'Ditolak' || p.status === 'Revisi') {
                    return { ...node, status: 'completed', date: p.tanggal };
                }
                return node;
            });
            return {
                ...p,
                validasiMulai: null,
                workflow: wf,
                timeline: [
                    { title: 'Pengajuan dibuat', date: p.tanggal + 'T08:00:00.000Z' },
                    { title: `${p.status === 'Disetujui' ? 'Disetujui' : p.status === 'Ditolak' ? 'Ditolak' : p.status === 'Revisi' ? 'Diminta revisi' : 'Diverifikasi'} oleh ${p.validator}`, date: p.tanggal + 'T15:00:00.000Z' }
                ],
                riwayat: [
                    { tanggal: p.tanggal + 'T08:00:00.000Z', status: 'Sedang Diverifikasi', validator: 'Sistem', keterangan: 'Pengajuan dibuat' },
                    { tanggal: p.tanggal + 'T15:00:00.000Z', status: p.status, validator: p.validator, keterangan: `${p.status} oleh ${p.validator}` }
                ],
                catatan: [],
                dokumen: p.file ? [p.file] : []
            };
        });
    }

    function getDefaultState() {
        return {
            totalPoin: 50,
            targetPoin: TARGET_POIN,
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
                aktor: 'Dra. Siti Nurhaliza, M.Pd.',
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
                kategori: 'seminar',
                kategoriText: 'Seminar',
                judul: 'Seminar Nasional Teknologi',
                penyelenggara: 'APTIKOM',
                tglMulai: '2026-04-05',
                tglSelesai: '2026-04-05',
                lokasi: 'Bandung',
                tingkat: 'nasional',
                tingkatText: 'Nasional',
                estimasiPoin: 10,
                deskripsi: 'Peserta',
                file: 'sertifikat.jpg',
                status: 'Siap Dikirim',
                tanggalDibuat: new Date(now.getTime() - 259200000).toISOString(),
                terakhirDiubah: new Date(now.getTime() - 100000000).toISOString()
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
            const raw = sessionStorage.getItem(STATE_KEY);
            if (raw) {
                const state = JSON.parse(raw);
                if (!state.pengajuan) state.pengajuan = enrichDummyPengajuan(JSON.parse(JSON.stringify(DUMMY_PENGAJUAN)));
                if (!state.drafts) state.drafts = getDefaultDrafts();
                if (state.totalPoin === undefined) state.totalPoin = 50;
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
        sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
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
    function addPengajuan(pengajuan) {
        const state = getState();
        if (!pengajuan.id) pengajuan.id = 'SKP-' + Date.now();
        pengajuan.status = 'Sedang Diverifikasi';
        pengajuan.validasiMulai = Date.now();
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

        setState(state);
        return pengajuan;
    }

    function getPengajuanById(id) {
        const state = getState();
        return state.pengajuan.find(p => p.id === id) || null;
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
        } else if (action === 'Tolak') {
            newStatus = 'Ditolak';
        }

        pengajuan.status = newStatus;
        pengajuan.validator = validatorName;
        pengajuan.validasiMulai = null; // hentikan auto-validasi timer karena sudah ditangani manual
        pengajuan.timeline = pengajuan.timeline || [];
        pengajuan.timeline.push({ title: `${action} oleh ${validatorRole}`, date: now });
        pengajuan.riwayat = pengajuan.riwayat || [];
        pengajuan.riwayat.push({ tanggal: now, status: newStatus, validator: validatorName, keterangan: `${action} oleh ${validatorRole}` });
        if (catatanText) {
            pengajuan.catatan = pengajuan.catatan || [];
            pengajuan.catatan.push({ author: validatorName, text: catatanText, date: now });
        }

        if (poinDitambahkan > 0) {
            state.totalPoin += poinDitambahkan;
        }

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

    // ------------------- Validasi Otomatis (timer mahasiswa) -------------------
    function checkAndUpdateValidasi() {
        const state = getState();
        let updated = false;
        let poinDitambahkan = 0;
        const now = Date.now();

        state.pengajuan.forEach(p => {
            if (p.status === 'Sedang Diverifikasi' && p.validasiMulai) {
                const elapsed = now - p.validasiMulai;
                if (elapsed >= DURATION_VALIDASI) {
                    p.status = 'Disetujui';
                    p.validator = 'Sistem (Auto)';
                    poinDitambahkan += p.poin || p.estimasiPoin || 0;
                    updated = true;

                    // activity log
                    pushAktivitas(state, 'validasi', 'Pengajuan disetujui',
                        `Pengajuan "${p.judul || p.kategori || p.id}" telah disetujui. +${p.poin || p.estimasiPoin || 0} poin ditambahkan.`,
                        'fa-circle-check', 'success', p.email);

                    // riwayat & timeline ikut diperbarui agar detail-pengajuan.html konsisten
                    p.timeline = p.timeline || [];
                    p.timeline.push({ title: 'Disetujui oleh Sistem (Auto)', date: new Date().toISOString() });
                    p.riwayat = p.riwayat || [];
                    p.riwayat.push({ tanggal: new Date().toISOString(), status: 'Disetujui', validator: 'Sistem (Auto)', keterangan: 'Disetujui otomatis oleh sistem' });

                    // Audit Trail formal — ditandai jelas sebagai simulasi prototype,
                    // bukan perilaku produksi (di produksi, persetujuan selalu memerlukan
                    // keputusan manusia sesuai workflow yang dikonfigurasi).
                    pushAuditTrail(state, {
                        aktor: 'Sistem (Auto)',
                        aktorRole: 'sistem',
                        aksi: 'Validasi: Setujui (otomatis — simulasi prototype)',
                        entitas: 'Pengajuan', entitasId: p.id,
                        dataSebelum: 'status: Sedang Diverifikasi',
                        dataSesudah: `status: Disetujui, +${p.poin || p.estimasiPoin || 0} poin`,
                        keterangan: 'Persetujuan otomatis demi kebutuhan demonstrasi prototype (timer 30 detik). Pada implementasi produksi, tahap ini memerlukan keputusan validator manusia.'
                    });

                    // Notifikasi
                    state.notifikasi.push({
                        pesan: `Pengajuan "${p.judul || p.kategori}" telah disetujui. +${p.poin || p.estimasiPoin} poin ditambahkan.`,
                        waktu: new Date().toISOString(),
                        dibaca: false
                    });
                }
            }
        });

        if (updated) {
            state.totalPoin += poinDitambahkan;
            setState(state);
        }
        return updated;
    }

    function getSisaWaktuValidasi(pengajuanId) {
        const state = getState();
        const p = state.pengajuan.find(item => item.id === pengajuanId);
        if (!p || p.status !== 'Sedang Diverifikasi' || !p.validasiMulai) return null;
        const elapsed = Date.now() - p.validasiMulai;
        return Math.max(0, DURATION_VALIDASI - elapsed);
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
        sessionStorage.removeItem(STATE_KEY);
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
        // draft
        addDraft,
        updateDraft,
        removeDraft,
        getDraftById,
        // pengajuan
        addPengajuan,
        getPengajuanById,
        updatePengajuan,
        validasiPengajuan,
        tambahCatatan,
        // validasi otomatis
        checkAndUpdateValidasi,
        getSisaWaktuValidasi,
        // aktivitas
        addAktivitas,
        // util
        showToast,
        resetState,
        DUMMY_PENGAJUAN,
        TARGET_POIN,
        DURATION_VALIDASI
    };
})();
