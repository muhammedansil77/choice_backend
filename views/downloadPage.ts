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
                <svg class="logo-icon" viewBox="0 0 24 24">
                    <path d="M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z"/>
                </svg>
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
