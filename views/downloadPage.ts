export const getDownloadPageHtml = (): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download CHOICE Electricals POS APK</title>
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
            --bg-color: #FFFFFF;
            --card-bg: #FFFFFF;
            --border-color: #E5E7EB;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #F8FAFC;
            color: var(--text-main);
            line-height: 1.5;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* HEADER */
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
            text-decoration: none;
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
            box-shadow: 0 2px 8px rgba(8, 127, 239, 0.3);
        }

        .brand-text {
            color: #FFFFFF;
            font-weight: 800;
            font-size: 18px;
            letter-spacing: 0.5px;
        }

        .nav-badge {
            background: rgba(255, 255, 255, 0.15);
            color: #FFFFFF;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }

        /* MAIN CONTAINER */
        .main-content {
            flex: 1;
            max-width: 680px;
            width: 100%;
            margin: 40px auto;
            padding: 0 20px;
        }

        .app-card {
            background: var(--card-bg);
            border-radius: 24px;
            padding: 36px 28px;
            border: 1px solid var(--border-color);
            box-shadow: 0 10px 30px rgba(11, 59, 130, 0.05);
            text-align: center;
        }

        /* APP LOGO EMBLEM */
        .logo-box {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, var(--primary-blue), var(--dark-blue));
            border-radius: 24px;
            margin: 0 auto 20px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 12px 28px rgba(8, 127, 239, 0.25);
            position: relative;
        }

        .logo-icon {
            width: 56px;
            height: 56px;
            fill: #FBBF24;
        }

        .app-title {
            font-size: 26px;
            font-weight: 800;
            color: var(--dark-blue);
            margin-bottom: 6px;
        }

        .app-subtitle {
            font-size: 15px;
            color: var(--text-muted);
            margin-bottom: 28px;
            max-width: 480px;
            margin-left: auto;
            margin-right: auto;
        }

        /* METADATA GRID */
        .meta-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            background-color: var(--light-blue);
            padding: 20px;
            border-radius: 16px;
            margin-bottom: 28px;
            text-align: left;
        }

        .meta-item {
            display: flex;
            flex-direction: column;
        }

        .meta-label {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;

        }

        .meta-value {
            font-size: 15px;
            font-weight: 700;
            color: var(--dark-blue);
            margin-top: 2px;
        }

        /* DOWNLOAD BUTTON */
        .btn-download {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            width: 100%;
            padding: 18px 24px;
            background-color: var(--primary-blue);
            color: #FFFFFF;
            font-size: 18px;
            font-weight: 700;
            border: none;
            border-radius: 16px;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 8px 20px rgba(8, 127, 239, 0.3);
        }

        .btn-download:hover {
            background-color: var(--dark-blue);
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(11, 59, 130, 0.35);
        }

        .btn-download:active {
            transform: translateY(0);
        }

        .btn-icon {
            width: 22px;
            height: 22px;
            fill: #FFFFFF;
        }

        /* NOTICE BOX */
        .security-notice {
            margin-top: 24px;
            padding: 14px 18px;
            background-color: #FFFBEB;
            border: 1px solid #FDE68A;
            border-radius: 14px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            text-align: left;
        }

        .notice-icon {
            width: 20px;
            height: 20px;
            fill: #D97706;
            flex-shrink: 0;
            margin-top: 2px;
        }

        .notice-text {
            font-size: 13px;
            color: #92400E;
            line-height: 1.45;
        }

        /* RELEASE NOTES BOX */
        .notes-box {
            margin-top: 24px;
            padding: 18px;
            background-color: #F8FAFC;
            border-radius: 14px;
            border: 1px solid var(--border-color);
            text-align: left;
        }

        .notes-title {
            font-size: 13px;
            font-weight: 700;
            color: var(--dark-blue);
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .notes-content {
            font-size: 14px;
            color: var(--text-muted);
            line-height: 1.5;
        }

        /* FOOTER */
        .footer {
            padding: 24px;
            text-align: center;
            font-size: 13px;
            color: var(--text-muted);
            border-top: 1px solid var(--border-color);
            background-color: #FFFFFF;
        }

        @media (max-width: 480px) {
            .app-card {
                padding: 28px 18px;
            }
            .meta-grid {
                grid-template-columns: 1fr;
                gap: 14px;
            }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <a href="#" class="brand-container">
            <div class="brand-icon">C</div>
            <span class="brand-text">CHOICE ELECTRICALS</span>
        </a>
        <span class="nav-badge">Official Distribution</span>
    </nav>

    <main class="main-content">
        <div class="app-card">
            <!-- EMBLEM LOGO -->
            <div class="logo-box">
                <img src="data:image/png;base64,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" alt="Choice Electricals" style="width: 80px; height: 80px; border-radius: 20px; object-fit: contain; display: block;" />
            </div>

            <h1 class="app-title" id="appTitle">CHOICE Electricals POS</h1>
            <p class="app-subtitle">Electrical shop POS and business management application for orders, inventory, and sales.</p>

            <!-- METADATA GRID -->
            <div class="meta-grid">
                <div class="meta-item">
                    <span class="meta-label">Version</span>
                    <span class="meta-value" id="versionVal">Loading...</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">File Size</span>
                    <span class="meta-value" id="sizeVal">Loading...</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Platform</span>
                    <span class="meta-value" id="platformVal">Android 5.0+</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Updated</span>
                    <span class="meta-value" id="dateVal">Loading...</span>
                </div>
            </div>

            <!-- DOWNLOAD BUTTON -->
            <a href="/download/file" class="btn-download" id="downloadBtn">
                <svg class="btn-icon" viewBox="0 0 24 24">
                    <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                </svg>
                <span>Download APK</span>
            </a>

            <!-- RELEASE NOTES -->
            <div class="notes-box" id="notesBox" style="display: none;">
                <div class="notes-title">What's New in this Version</div>
                <div class="notes-content" id="notesVal">General performance updates and bug fixes.</div>
            </div>

            <!-- SECURITY NOTICE -->
            <div class="security-notice">
                <svg class="notice-icon" viewBox="0 0 24 24">
                    <path d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z"/>
                </svg>
                <div class="notice-text">
                    <strong>Installation Note:</strong> Android may ask you to allow installation from unknown sources. Only install APK files downloaded directly from your official CHOICE Electricals website.
                </div>
            </div>
        </div>
    </main>

    <footer class="footer">
        CHOICE Electricals &copy; 2026. All rights reserved.
    </footer>

    <script>
        async function fetchLatestRelease() {
            try {
                const res = await fetch('/api/apk/latest');
                if (!res.ok) throw new Error('No release info');
                const data = await res.json();

                document.getElementById('versionVal').textContent = 'v' + (data.versionName || '1.0.0');
                
                const mb = (data.fileSize / (1024 * 1024)).toFixed(1);
                document.getElementById('sizeVal').textContent = mb + ' MB';
                
                if (data.minimumAndroidVersion) {
                    document.getElementById('platformVal').textContent = data.minimumAndroidVersion;
                }

                if (data.releaseDate) {
                    const date = new Date(data.releaseDate);
                    document.getElementById('dateVal').textContent = date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                }

                if (data.releaseNotes) {
                    document.getElementById('notesVal').textContent = data.releaseNotes;
                    document.getElementById('notesBox').style.display = 'block';
                }
            } catch (err) {
                console.log('Using default download route');
                document.getElementById('versionVal').textContent = 'v1.0.0';
                document.getElementById('sizeVal').textContent = '50.2 MB';
                document.getElementById('dateVal').textContent = 'Latest Build';
            }
        }

        fetchLatestRelease();
    </script>
</body>
</html>`;
};
