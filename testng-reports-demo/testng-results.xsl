<?xml version="1.0" encoding="UTF-8"?>
<!--
  testng-results.xsl
  ══════════════════
  XSLT 1.0 stylesheet to transform TestNG's testng-results.xml
  into a styled, human-readable HTML report.

  Applied by ANT:  ant report
  Output:          target/surefire-reports/XSLT_Report.html

  XPath reference:
    Summary     → /testng-results/@total | @passed | @failed | @skipped
    Test rows   → //test-method[not(@is-config)]          (real tests only)
    Config rows → //test-method[@is-config='true']        (setUp/tearDown)
    Class name  → parent::class/@name
    Exception   → exception/message  (CDATA — use normalize-space())
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="html" indent="yes" encoding="UTF-8"/>

  <!-- ═══════════════════════════════════════════════════════════════════════
       ROOT TEMPLATE
       ═══════════════════════════════════════════════════════════════════════ -->
  <xsl:template match="/">
    <html lang="en">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Samadhaan &#8212; TestNG XSLT Report</title>
      <style>
        /* ── Reset ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: #0f172a;
          color: #e2e8f0;
          padding: 32px 24px;
          min-height: 100vh;
          line-height: 1.5;
        }

        /* ── Header ── */
        .header {
          background: linear-gradient(135deg, #1e3a5f 0%, #0e4d91 100%);
          border-radius: 12px;
          padding: 28px 32px;
          margin-bottom: 32px;
          border: 1px solid #1d4ed8;
          box-shadow: 0 4px 24px rgba(14, 165, 233, 0.2);
        }
        .header h1 {
          font-size: 26px;
          font-weight: 800;
          color: #38bdf8;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }
        .header p { color: #94a3b8; font-size: 13px; }
        .header .meta { color: #64748b; font-size: 12px; margin-top: 8px; }

        /* ── Summary Cards ── */
        .summary {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }
        .card {
          flex: 1;
          min-width: 150px;
          background: #1e293b;
          border-radius: 10px;
          padding: 20px 24px;
          border: 1px solid #334155;
          text-align: center;
        }
        .card .label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748b;
          margin-bottom: 10px;
        }
        .card .value { font-size: 42px; font-weight: 900; line-height: 1; }
        .card.total  .value { color: #38bdf8; }
        .card.passed .value { color: #22c55e; }
        .card.failed .value { color: #ef4444; }
        .card.skip   .value { color: #f59e0b; }

        /* ── Section heading ── */
        h2 {
          font-size: 16px;
          font-weight: 700;
          color: #94a3b8;
          margin-bottom: 14px;
          padding-bottom: 8px;
          border-bottom: 1px solid #334155;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        /* ── Table ── */
        .table-wrap {
          overflow-x: auto;
          margin-bottom: 36px;
          border-radius: 10px;
          border: 1px solid #334155;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: #1e293b;
        }
        thead tr { background: #0f172a; }
        th {
          padding: 11px 16px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #64748b;
          text-align: left;
          border-bottom: 2px solid #334155;
          white-space: nowrap;
        }
        td {
          padding: 11px 16px;
          font-size: 13px;
          color: #cbd5e1;
          border-bottom: 1px solid #263347;
          vertical-align: top;
          word-break: break-word;
        }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr:hover { background: #243249; transition: background 0.15s; }

        /* ── Status Badges ── */
        .badge {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .pass { background: rgba(34,197,94,0.12); color: #22c55e; border: 1px solid #22c55e; }
        .fail { background: rgba(239,68,68,0.12);  color: #ef4444; border: 1px solid #ef4444; }
        .skip { background: rgba(245,158,11,0.12); color: #f59e0b; border: 1px solid #f59e0b; }

        /* ── Exception block ── */
        .exception-msg {
          font-size: 12px;
          color: #fca5a5;
          background: rgba(239,68,68,0.07);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 6px;
          padding: 8px 12px;
          margin-top: 4px;
          white-space: pre-wrap;
          word-break: break-word;
        }

        /* ── Footer ── */
        .footer {
          text-align: center;
          color: #475569;
          font-size: 12px;
          margin-top: 12px;
          padding-top: 16px;
          border-top: 1px solid #1e293b;
        }
      </style>
    </head>
    <body>

      <!-- ── Header ── -->
      <div class="header">
        <h1>&#9654; Samadhaan &#8212; TestNG XSLT Report</h1>
        <p>Automated UI test results for the Samadhaan Complaint Management System</p>
        <p class="meta">
          Suite: <xsl:value-of select="/testng-results/suite/@name"/> &#160;|&#160;
          Duration: <xsl:value-of select="/testng-results/suite/@duration-ms"/> ms &#160;|&#160;
          Started: <xsl:value-of select="/testng-results/suite/@started-at"/>
        </p>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           SUMMARY CARDS — read directly from root element attributes
           /testng-results/@total | @passed | @failed | @skipped
           ══════════════════════════════════════════════════════════════════ -->
      <div class="summary">
        <div class="card total">
          <div class="label">Total Tests</div>
          <div class="value"><xsl:value-of select="/testng-results/@total"/></div>
        </div>
        <div class="card passed">
          <div class="label">Passed</div>
          <div class="value"><xsl:value-of select="/testng-results/@passed"/></div>
        </div>
        <div class="card failed">
          <div class="label">Failed</div>
          <div class="value"><xsl:value-of select="/testng-results/@failed"/></div>
        </div>
        <div class="card skip">
          <div class="label">Skipped</div>
          <div class="value"><xsl:value-of select="/testng-results/@skipped"/></div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           TEST RESULTS TABLE
           Select only real test methods:
             //test-method[not(@is-config)]
           Config methods (setUp / tearDown) carry is-config="true" and
           must be excluded. Real test methods have NO is-config attribute.
           ══════════════════════════════════════════════════════════════════ -->
      <h2>Test Results</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Test Method</th>
              <th>Class</th>
              <th>Description</th>
              <th>Duration (ms)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="//test-method[not(@is-config)]">
              <xsl:sort select="@started-at" order="ascending"/>
              <tr>
                <!-- Row number -->
                <td><xsl:value-of select="position()"/></td>

                <!-- Method name -->
                <td><xsl:value-of select="@name"/></td>

                <!-- Class: parent of test-method is class element -->
                <td>
                  <xsl:value-of select="parent::class/@name"/>
                </td>

                <!-- Description attribute (may be empty) -->
                <td>
                  <xsl:choose>
                    <xsl:when test="string-length(normalize-space(@description)) > 0">
                      <xsl:value-of select="@description"/>
                    </xsl:when>
                    <xsl:otherwise>&#8212;</xsl:otherwise>
                  </xsl:choose>
                </td>

                <!-- Duration in ms -->
                <td><xsl:value-of select="@duration-ms"/> ms</td>

                <!-- Status badge -->
                <td>
                  <xsl:choose>
                    <xsl:when test="@status='PASS'">
                      <span class="badge pass">PASS</span>
                    </xsl:when>
                    <xsl:when test="@status='FAIL'">
                      <span class="badge fail">FAIL</span>
                    </xsl:when>
                    <xsl:otherwise>
                      <span class="badge skip">SKIP</span>
                    </xsl:otherwise>
                  </xsl:choose>
                </td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           FAILURE DETAILS (only rendered when failures exist)
           exception/message contains CDATA — normalize-space() strips it.
           ══════════════════════════════════════════════════════════════════ -->
      <xsl:if test="count(//test-method[@status='FAIL' and not(@is-config)]) > 0">
        <h2>Failure Details</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Test Method</th>
                <th>Exception Class</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="//test-method[@status='FAIL' and not(@is-config)]">
                <tr>
                  <td><xsl:value-of select="@name"/></td>
                  <td>
                    <xsl:choose>
                      <xsl:when test="exception/@class">
                        <xsl:value-of select="exception/@class"/>
                      </xsl:when>
                      <xsl:otherwise>&#8212;</xsl:otherwise>
                    </xsl:choose>
                  </td>
                  <td>
                    <xsl:choose>
                      <xsl:when test="string-length(normalize-space(exception/message)) > 0">
                        <div class="exception-msg">
                          <xsl:value-of select="normalize-space(exception/message)"/>
                        </div>
                      </xsl:when>
                      <xsl:otherwise>&#8212;</xsl:otherwise>
                    </xsl:choose>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </xsl:if>

      <!-- ── Footer ── -->
      <div class="footer">
        Generated by TestNG + ANT XSLT Transform &#8212; Samadhaan Complaint Management System
      </div>

    </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
