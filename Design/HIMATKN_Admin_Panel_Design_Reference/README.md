# HIMATKN Admin Panel Design Reference

Static HTML/CSS/JS untuk acuan desain. Bukan implementasi Next.js dan tidak terhubung ke FastAPI.

Prinsip desain:
- Mempertahankan visual Figma HIMATKN: dark green, cream/off-white, gold, serif heading, sans-serif UI.
- Sidebar dan topbar identik pada setiap section sehingga panel tidak berubah layout ketika berpindah halaman.
- Ikon menggunakan Lucide secara konsisten. Tidak memakai brand/avatar berbasis huruf.
- 404 adalah state visitor/public untuk URL yang tidak ditemukan. 404 bukan menu Admin Panel.
- 403 adalah state authorization untuk area admin.
- Loading, empty, dan error tersedia sebagai acuan.
- Data di HTML adalah placeholder desain.

Modul yang dijadikan acuan dari backend canonical:
admins, roles, permissions, admin_roles, role_permissions, auth_sessions,
periods, divisions, positions, members, news, news_images, tags, news_tags,
programs, agendas, documents, site_settings, notifications,
notification_recipients, activity_logs, visitor_logs.

Media/Galeri hanya acuan UI. Jangan menambah entity/tabel backend hanya berdasarkan mockup jika backend final belum menyediakan entity tersebut.
