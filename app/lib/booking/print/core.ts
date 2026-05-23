"use client";

export function openPrintWindowAndPrint(params: {
  title: string;
  html: string;
}) {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank", "width=1100,height=900");

  if (!printWindow) {
    alert("Unable to open print window. Please allow popups.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${params.title}</title>
        <meta charset="utf-8" />
        <style>
          * {
            box-sizing: border-box;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #0f172a;
            font-family: Arial, Helvetica, sans-serif;
          }

          body {
            padding: 24px;
          }

          .ticket-shell {
            width: 100%;
            max-width: 980px;
            margin: 0 auto;
            border: 1px solid #dbe3ec;
            border-radius: 22px;
            overflow: hidden;
            background: #ffffff;
          }

          .ticket-top {
            padding: 22px 24px;
            border-bottom: 1px solid #e5e7eb;
            background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
          }

          .brand-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }

          .brand {
            font-size: 26px;
            font-weight: 900;
            letter-spacing: 0.5px;
          }

          .status-pill {
            padding: 8px 14px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 800;
            background: #dcfce7;
            color: #15803d;
          }

          .title {
            margin: 14px 0 6px;
            font-size: 24px;
            font-weight: 900;
            line-height: 1.25;
          }

          .subtitle {
            font-size: 13px;
            color: #475569;
            font-weight: 600;
          }

          .section {
            padding: 22px 24px;
            border-bottom: 1px solid #e5e7eb;
          }

          .section:last-child {
            border-bottom: none;
          }

          .section-title {
            margin: 0 0 14px;
            font-size: 16px;
            font-weight: 900;
            color: #111827;
          }

          .grid-2 {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }

          .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
          }

          .info-card {
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 14px;
            background: #ffffff;
          }

          .label {
            font-size: 11px;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }

          .value {
            font-size: 14px;
            font-weight: 800;
            color: #111827;
            line-height: 1.5;
            word-break: break-word;
          }

          .route-card {
            border: 1px solid #dbe3ec;
            border-radius: 18px;
            padding: 16px;
            background: #ffffff;
          }

          .route-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 12px;
          }

          .route-airline {
            font-size: 15px;
            font-weight: 900;
            color: #0f172a;
          }

          .route-flight {
            font-size: 12px;
            font-weight: 800;
            color: #475569;
          }

          .route-grid {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 10px;
            align-items: center;
          }

          .route-point {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .route-code {
            font-size: 24px;
            font-weight: 900;
            color: #111827;
          }

          .route-city {
            font-size: 13px;
            font-weight: 700;
            color: #475569;
          }

          .route-time {
            font-size: 14px;
            font-weight: 800;
            color: #111827;
          }

          .route-arrow {
            font-size: 18px;
            font-weight: 900;
            color: #2563eb;
            padding: 0 8px;
          }

          .passenger-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            overflow: hidden;
          }

          .passenger-table th,
          .passenger-table td {
            text-align: left;
            padding: 12px 14px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
          }

          .passenger-table th {
            background: #f8fafc;
            font-weight: 900;
            color: #334155;
          }

          .passenger-table td {
            font-weight: 700;
            color: #111827;
          }

          .passenger-table tr:last-child td {
            border-bottom: none;
          }

          .fare-box {
            border: 1px solid #dbe3ec;
            border-radius: 18px;
            padding: 16px;
            background: #f8fafc;
          }

          .fare-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 8px 0;
            font-size: 13px;
            font-weight: 700;
            color: #334155;
          }

          .fare-total {
            border-top: 1px dashed #cbd5e1;
            margin-top: 8px;
            padding-top: 12px;
            font-size: 16px;
            font-weight: 900;
            color: #0f172a;
          }

          .footer-note {
            font-size: 12px;
            line-height: 1.7;
            color: #475569;
            font-weight: 600;
          }

          @media print {
            body {
              padding: 0;
            }

            .ticket-shell {
              border: none;
              border-radius: 0;
              max-width: 100%;
            }
          }
        </style>
      </head>
      <body>
        ${params.html}
        <script>
          window.onload = function () {
            setTimeout(function () {
              window.print();
            }, 250);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}