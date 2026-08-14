export const getAdminApkPageHtml = (): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin APK Management - CHOICE Electricals</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-blue: #087FEF;
            --dark-blue: #0B3B82;
            --light-blue: #EAF5FF;
            --text-main: #1F2937;
            --text-muted: #6B7280;
            --bg-color: #F8FAFC;
            --card-bg: #FFFFFF;
            --border-color: #E5E7EB;
            --danger-red: #EF4444;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-main);
            line-height: 1.5;
            min-height: 100vh;
        }

        /* NAVBAR */
        .navbar {
            background-color: var(--dark-blue);
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 12px rgba(11, 59, 130, 0.1);
        }

        .brand-container {
            display: flex;
            align-items: center;
            gap: 12px;
            color: #FFFFFF;
            font-weight: 800;
            font-size: 18px;
        }

        .brand-icon {
            width: 38px;
            height: 38px;
            background: linear-gradient(135deg, var(--primary-blue), var(--dark-blue));
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            font-weight: 800;
            font-size: 18px;
        }

        .nav-right {
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .btn-link {
            color: #FFFFFF;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            background: rgba(255,255,255,0.15);
            padding: 6px 14px;
            border-radius: 10px;
        }

        /* CONTAINER */
        .container {
            max-width: 900px;
            margin: 32px auto;
            padding: 0 20px;
        }

        .card {
            background: var(--card-bg);
            border-radius: 20px;
            padding: 28px;
            border: 1px solid var(--border-color);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
            margin-bottom: 24px;
        }

        .card-title {
            font-size: 18px;
            font-weight: 800;
            color: var(--dark-blue);
            margin-bottom: 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        /* AUTH SECTION */
        .auth-box {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
        }

        .input-field {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            font-size: 14px;
            outline: none;
            font-family: inherit;
        }

        .input-field:focus {
            border-color: var(--primary-blue);
            box-shadow: 0 0 0 3px rgba(8, 127, 239, 0.15);
        }

        .btn-primary {
            background-color: var(--primary-blue);
            color: #FFFFFF;
            font-weight: 700;
            padding: 12px 20px;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
            white-space: nowrap;
        }

        .btn-primary:hover {
            background-color: var(--dark-blue);
        }

        .btn-danger {
            background-color: var(--danger-red);
            color: #FFFFFF;
            font-weight: 700;
            padding: 8px 14px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
        }

        /* FORM GRID */
        .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 16px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .form-group.full {
            grid-column: span 2;
        }

        label {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-main);
        }

        textarea.input-field {
            resize: vertical;
            min-height: 80px;
        }

        /* FILE DROP ZONE */
        .file-drop {
            border: 2px dashed var(--primary-blue);
            background-color: var(--light-blue);
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            cursor: pointer;
            transition: border-color 0.2s;
        }

        .file-drop input {
            display: none;
        }

        .file-text {
            font-size: 14px;
            font-weight: 600;
            color: var(--primary-blue);
        }

        /* STATUS BANNER */
        .status-banner {
            padding: 12px 16px;
            border-radius: 12px;
            margin-bottom: 16px;
            font-size: 14px;
            font-weight: 600;
            display: none;
        }

        .status-banner.success {
            background-color: #DEF7EC;
            color: #03543F;
            border: 1px solid #BCF0DA;
            display: block;
        }

        .status-banner.error {
            background-color: #FDE8E8;
            color: #9B1C1C;
            border: 1px solid #FBD5D5;
            display: block;
        }

        /* RELEASES TABLE */
        .table-responsive {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 14px;
        }

        th {
            background-color: var(--light-blue);
            color: var(--dark-blue);
            font-weight: 700;
            padding: 12px 16px;
            border-bottom: 1px solid var(--border-color);
        }

        td {
            padding: 14px 16px;
            border-bottom: 1px solid var(--border-color);
            color: var(--text-main);
        }

        .badge-latest {
            background-color: #059669;
            color: #FFFFFF;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 700;
        }

        @media (max-width: 600px) {
            .form-grid {
                grid-template-columns: 1fr;
            }
            .form-group.full {
                grid-column: span 1;
            }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="brand-container">
            <div class="brand-icon">C</div>
            <span>CHOICE Electricals Admin</span>
        </div>
        <div class="nav-right">
            <a href="/download" target="_blank" class="btn-link">View Public Download Page</a>
        </div>
    </nav>

    <div class="container">
        <!-- AUTHENTICATION TOKEN CARD -->
        <div class="card">
            <div class="card-title">Admin Authorization</div>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px;">
                Enter your Admin JWT Token or Admin Credentials to upload or manage APK releases.
            </p>
            <div class="auth-box">
                <input type="password" id="authToken" class="input-field" placeholder="Enter Admin Token (or login token)">
                <button class="btn-primary" onclick="saveToken()">Save Token</button>
            </div>
            <div id="authStatus" style="font-size: 12px; font-weight: 600; color: #059669; display: none;">
                ✓ Token saved in browser storage
            </div>
        </div>

        <!-- STATUS MESSAGE BANNER -->
        <div id="statusBanner" class="status-banner"></div>

        <!-- UPLOAD NEW APK CARD -->
        <div class="card">
            <div class="card-title">Upload New APK Release</div>
            
            <form id="uploadForm" onsubmit="handleUpload(event)">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Version Name *</label>
                        <input type="text" id="versionName" class="input-field" placeholder="e.g. 1.0.0" required>
                    </div>
                    <div class="form-group">
                        <label>Version Code</label>
                        <input type="number" id="versionCode" class="input-field" placeholder="e.g. 6" value="1">
                    </div>
                    <div class="form-group">
                        <label>Minimum Android Version</label>
                        <input type="text" id="minimumAndroidVersion" class="input-field" value="Android 5.0 (Lollipop)+">
                    </div>
                    <div class="form-group">
                        <label>App Name</label>
                        <input type="text" id="appName" class="input-field" value="CHOICE Electricals POS">
                    </div>
                    <div class="form-group full">
                        <label>Release Notes</label>
                        <textarea id="releaseNotes" class="input-field" placeholder="Describe new features or improvements in this release..."></textarea>
                    </div>
                </div>

                <div class="form-group full" style="margin-bottom: 18px;">
                    <label>Select APK File (.apk) *</label>
                    <div class="file-drop" onclick="document.getElementById('apkFileInput').click()">
                        <input type="file" id="apkFileInput" accept=".apk" onchange="updateFileName(this)">
                        <div class="file-text" id="fileText">📁 Click to choose APK file (.apk)</div>
                    </div>
                </div>

                <button type="submit" class="btn-primary" id="uploadBtn" style="width: 100%; padding: 14px;">
                    Upload & Publish Release
                </button>
            </form>
        </div>

        <!-- RELEASES HISTORY CARD -->
        <div class="card">
            <div class="card-title">APK Releases History</div>
            <div class="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Version</th>
                            <th>File Name</th>
                            <th>Size</th>
                            <th>Downloads</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="releasesTableBody">
                        <tr>
                            <td colspan="7" style="text-align: center; color: var(--text-muted);">Loading releases...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('authToken').value = localStorage.getItem('adminToken') || '';
        if (localStorage.getItem('adminToken')) {
            document.getElementById('authStatus').style.display = 'block';
        }

        function saveToken() {
            const token = document.getElementById('authToken').value.trim();
            if (token) {
                localStorage.setItem('adminToken', token);
                document.getElementById('authStatus').style.display = 'block';
                showBanner('Admin token saved successfully!', 'success');
                loadReleases();
            } else {
                localStorage.removeItem('adminToken');
                document.getElementById('authStatus').style.display = 'none';
            }
        }

        function updateFileName(input) {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
                document.getElementById('fileText').textContent = 'Selected: ' + file.name + ' (' + sizeMb + ' MB)';
            }
        }

        function showBanner(msg, type) {
            const banner = document.getElementById('statusBanner');
            banner.textContent = msg;
            banner.className = 'status-banner ' + type;
            setTimeout(() => {
                banner.className = 'status-banner';
            }, 6000);
        }

        async function handleUpload(e) {
            e.preventDefault();

            const token = localStorage.getItem('adminToken');
            if (!token) {
                showBanner('Please enter your Admin Token in the Authorization section above!', 'error');
                return;
            }

            const fileInput = document.getElementById('apkFileInput');
            if (!fileInput.files || !fileInput.files[0]) {
                showBanner('Please select a valid .apk file to upload!', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('apk', fileInput.files[0]);
            formData.append('versionName', document.getElementById('versionName').value.trim());
            formData.append('versionCode', document.getElementById('versionCode').value.trim());
            formData.append('minimumAndroidVersion', document.getElementById('minimumAndroidVersion').value.trim());
            formData.append('appName', document.getElementById('appName').value.trim());
            formData.append('releaseNotes', document.getElementById('releaseNotes').value.trim());

            const btn = document.getElementById('uploadBtn');
            btn.disabled = true;
            btn.textContent = 'Uploading APK File... Please Wait';

            try {
                const res = await fetch('/api/apk/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    body: formData
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Upload failed');

                showBanner('✓ APK release uploaded and published successfully!', 'success');
                document.getElementById('uploadForm').reset();
                document.getElementById('fileText').textContent = '📁 Click to choose APK file (.apk)';
                loadReleases();
            } catch (err) {
                showBanner('Error: ' + err.message, 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Upload & Publish Release';
            }
        }

        async function loadReleases() {
            const token = localStorage.getItem('adminToken');
            try {
                const res = await fetch('/api/apk/releases', {
                    headers: token ? { 'Authorization': 'Bearer ' + token } : {}
                });

                if (!res.ok) {
                    const latestRes = await fetch('/api/apk/latest');
                    if (latestRes.ok) {
                        const latest = await latestRes.json();
                        renderTable([latest]);
                    }
                    return;
                }

                const data = await res.json();
                renderTable(data);
            } catch (err) {
                console.error(err);
            }
        }

        function renderTable(releases) {
            const tbody = document.getElementById('releasesTableBody');
            if (!releases || releases.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No APK releases uploaded yet.</td></tr>';
                return;
            }

            tbody.innerHTML = releases.map(r => {
                const sizeMb = (r.fileSize / (1024 * 1024)).toFixed(1);
                const dateStr = new Date(r.releaseDate || r.createdAt).toLocaleDateString();
                const latestBadge = r.isLatest ? '<span class="badge-latest">LATEST</span>' : '<span style="color:#9CA3AF;font-size:12px">OLD</span>';

                return \`<tr>
                    <td><strong>v\${r.versionName}</strong></td>
                    <td>\${r.originalFileName || r.fileName}</td>
                    <td>\${sizeMb} MB</td>
                    <td>\${r.downloadsCount || 0}</td>
                    <td>\${dateStr}</td>
                    <td>\${latestBadge}</td>
                    <td>
                        <button class="btn-danger" onclick="deleteRelease('\${r._id}')">Delete</button>
                    </td>
                </tr>\`;
            }).join('');
        }

        async function deleteRelease(id) {
            if (!confirm('Are you sure you want to delete this APK release?')) return;
            const token = localStorage.getItem('adminToken');
            if (!token) {
                alert('Please enter your Admin Token first!');
                return;
            }

            try {
                const res = await fetch('/api/apk/' + id, {
                    method: 'DELETE',
                    headers: { 'Authorization': 'Bearer ' + token }
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Delete failed');

                showBanner('APK release deleted successfully', 'success');
                loadReleases();
            } catch (err) {
                showBanner('Error: ' + err.message, 'error');
            }
        }

        loadReleases();
    </script>
</body>
</html>`;
};
