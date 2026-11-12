import { GovernmentDraftItem } from '../../types';

/**
 * Exports a GovernmentDraftItem to a Microsoft Word-compatible (.doc) document.
 * Preserves Nepali fonts (Noto Sans Devanagari / Kalimati / Arial), tables,
 * official letterhead, subject styling, and multi-tier signature blocks.
 */
export function exportToDocx(draft: GovernmentDraftItem): void {
  const sanitize = (text: string = '') =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br/>');

  const contentHtml = draft.content
    .split('\n\n')
    .map((p) => `<p style="margin: 6pt 0; text-align: justify; text-justify: inter-word; line-height: 1.6;">${sanitize(p)}</p>`)
    .join('');

  // Meeting Minutes Specific Section
  let meetingHtml = '';
  if (draft.docType === 'minute' && draft.meetingDetails) {
    const md = draft.meetingDetails;
    meetingHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 12pt 0; font-size: 11pt;">
        <tr style="background-color: #f1f5f9;">
          <td style="padding: 6pt; border: 1pt solid #cbd5e1; font-weight: bold; width: 25%;">बैठक मिति र समय:</td>
          <td style="padding: 6pt; border: 1pt solid #cbd5e1;">${sanitize(md.meetingDateBs)} (${sanitize(md.meetingTime)})</td>
        </tr>
        <tr>
          <td style="padding: 6pt; border: 1pt solid #cbd5e1; font-weight: bold;">स्थान र अध्यक्षता:</td>
          <td style="padding: 6pt; border: 1pt solid #cbd5e1;">${sanitize(md.meetingVenue)} | ${sanitize(md.chairperson)}</td>
        </tr>
      </table>

      <h4 style="margin: 10pt 0 4pt 0; font-size: 11.5pt;">उपस्थित महानुभावहरू:</h4>
      <ol style="margin: 4pt 0 12pt 20pt; padding: 0;">
        ${md.attendees.map((a) => `<li style="margin: 2pt 0;">${sanitize(a)}</li>`).join('')}
      </ol>

      <h4 style="margin: 10pt 0 4pt 0; font-size: 11.5pt;">कार्यसूची तथा निर्णयहरू:</h4>
      <table style="width: 100%; border-collapse: collapse; margin: 8pt 0; font-size: 11pt;">
        <thead>
          <tr style="background-color: #e2e8f0;">
            <th style="padding: 6pt; border: 1pt solid #94a3b8; text-align: left; width: 20%;">प्रस्ताव नं.</th>
            <th style="padding: 6pt; border: 1pt solid #94a3b8; text-align: left; width: 35%;">प्रस्तावित विषय</th>
            <th style="padding: 6pt; border: 1pt solid #94a3b8; text-align: left; width: 45%;">गरिएको सर्वसम्मत निर्णय</th>
          </tr>
        </thead>
        <tbody>
          ${md.decisions
            .map(
              (d) => `
            <tr>
              <td style="padding: 6pt; border: 1pt solid #cbd5e1; font-weight: bold;">${sanitize(d.agendaNo)}</td>
              <td style="padding: 6pt; border: 1pt solid #cbd5e1;">${sanitize(d.agendaTitle)}</td>
              <td style="padding: 6pt; border: 1pt solid #cbd5e1;">${sanitize(d.decisionText)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  // Report Specific Section
  let reportHtml = '';
  if (draft.docType === 'report' && draft.reportDetails) {
    const rd = draft.reportDetails;
    reportHtml = `
      <div style="margin: 12pt 0; font-size: 11pt;">
        <h4 style="margin: 8pt 0 2pt 0; font-weight: bold;">१. पृष्ठभूमि (Background):</h4>
        <p style="margin: 2pt 0 8pt 0; line-height: 1.5;">${sanitize(rd.background)}</p>

        <h4 style="margin: 8pt 0 2pt 0; font-weight: bold;">२. निरीक्षण तथा अध्ययनका उद्देश्यहरू:</h4>
        <ul style="margin: 2pt 0 8pt 18pt;">
          ${rd.objectives.map((o) => `<li style="margin: 2pt 0;">${sanitize(o)}</li>`).join('')}
        </ul>

        <h4 style="margin: 8pt 0 2pt 0; font-weight: bold;">३. मुख्य निष्कर्षहरू (Key Findings):</h4>
        <ul style="margin: 2pt 0 8pt 18pt;">
          ${rd.keyFindings.map((f) => `<li style="margin: 2pt 0;">${sanitize(f)}</li>`).join('')}
        </ul>

        <h4 style="margin: 8pt 0 2pt 0; font-weight: bold;">४. सुधारका लागि सिफारिसहरू (Recommendations):</h4>
        <ul style="margin: 2pt 0 8pt 18pt;">
          ${rd.recommendations.map((r) => `<li style="margin: 2pt 0;">${sanitize(r)}</li>`).join('')}
        </ul>

        <h4 style="margin: 8pt 0 2pt 0; font-weight: bold;">५. निष्कर्ष (Conclusion):</h4>
        <p style="margin: 2pt 0 8pt 0; line-height: 1.5;">${sanitize(rd.conclusion)}</p>
      </div>
    `;
  }

  // Signature Block
  let signaturesHtml = '';
  if (draft.docType === 'tippani') {
    signaturesHtml = `
      <table style="width: 100%; margin-top: 35pt; font-size: 10.5pt; border-collapse: collapse;">
        <tr>
          <td style="width: 33%; vertical-align: top; padding-right: 12pt;">
            <p style="font-weight: bold; margin: 0 0 4pt 0; color: #173B63;">पेश गर्ने:</p>
            <p style="margin: 25pt 0 0 0;">................................................</p>
            <p style="font-weight: bold; margin: 2pt 0 0 0;">${sanitize(draft.drafter.name)}</p>
            <p style="margin: 1pt 0 0 0; color: #555;">${sanitize(draft.drafter.designation)}</p>
            <p style="margin: 1pt 0 0 0; color: #777;">मिति: ${sanitize(draft.drafter.dateBs)}</p>
          </td>

          <td style="width: 33%; vertical-align: top; padding: 0 8pt;">
            ${
              draft.reviewer
                ? `
              <p style="font-weight: bold; margin: 0 0 4pt 0; color: #173B63;">राय / सिफारिस:</p>
              <p style="margin: 0 0 4pt 0; font-style: italic; color: #444; font-size: 10pt;">"${sanitize(draft.reviewer.remarks || 'स्वीकृतिका लागि सिफारिस छ।')}"</p>
              <p style="margin: 15pt 0 0 0;">................................................</p>
              <p style="font-weight: bold; margin: 2pt 0 0 0;">${sanitize(draft.reviewer.name)}</p>
              <p style="margin: 1pt 0 0 0; color: #555;">${sanitize(draft.reviewer.designation)}</p>
              <p style="margin: 1pt 0 0 0; color: #777;">मिति: ${sanitize(draft.reviewer.dateBs)}</p>
            `
                : ''
            }
          </td>

          <td style="width: 34%; vertical-align: top; padding-left: 12pt;">
            <p style="font-weight: bold; margin: 0 0 4pt 0; color: #173B63;">निर्णय / आदेश:</p>
            <p style="margin: 0 0 4pt 0; font-weight: bold; color: #0F766E;">
              [ ${draft.approver.decisionStatus === 'APPROVED' ? '✔' : ' '} ] स्वीकृत
              &nbsp;&nbsp;
              [ ${draft.approver.decisionStatus === 'AMENDED' ? '✔' : ' '} ] संशोधन
            </p>
            ${draft.approver.decisionNote ? `<p style="margin: 2pt 0 4pt 0; font-size: 9.5pt; color: #333;">"${sanitize(draft.approver.decisionNote)}"</p>` : ''}
            <p style="margin: 15pt 0 0 0;">................................................</p>
            <p style="font-weight: bold; margin: 2pt 0 0 0;">${sanitize(draft.approver.name)}</p>
            <p style="margin: 1pt 0 0 0; color: #555;">${sanitize(draft.approver.designation)}</p>
            <p style="margin: 1pt 0 0 0; color: #777;">मिति: ${sanitize(draft.approver.dateBs)}</p>
          </td>
        </tr>
      </table>
    `;
  } else {
    signaturesHtml = `
      <table style="width: 100%; margin-top: 30pt; font-size: 11pt; border-collapse: collapse;">
        <tr>
          <td style="width: 55%; vertical-align: top;">
            ${
              draft.carbonCopies && draft.carbonCopies.length > 0
                ? `
              <p style="font-weight: bold; margin: 0 0 4pt 0; font-size: 10pt; text-decoration: underline;">बोधार्थ (CC):</p>
              <ul style="margin: 0 0 0 16pt; padding: 0; font-size: 9.5pt; color: #475569;">
                ${draft.carbonCopies.map((cc) => `<li style="margin: 2pt 0;">${sanitize(cc)}</li>`).join('')}
              </ul>
            `
                : ''
            }
          </td>
          <td style="width: 45%; text-align: right; vertical-align: top;">
            <p style="margin: 30pt 0 0 0;">................................................</p>
            <p style="font-weight: bold; margin: 2pt 0 0 0; font-size: 11pt;">${sanitize(draft.approver.name)}</p>
            <p style="margin: 1pt 0 0 0; color: #333;">${sanitize(draft.approver.designation)}</p>
            <p style="margin: 1pt 0 0 0; color: #666; font-size: 10pt;">${sanitize(draft.departmentOrDivision)}</p>
            <p style="margin: 1pt 0 0 0; color: #666; font-size: 10pt;">मिति: ${sanitize(draft.dateBs)}</p>
          </td>
        </tr>
      </table>
    `;
  }

  const fullWordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${sanitize(draft.subject)}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 595.3pt 841.9pt; /* A4 */
          margin: 72pt 72pt 72pt 72pt; /* 1 inch */
          mso-header-margin: 36pt;
          mso-footer-margin: 36pt;
          mso-paper-source: 0;
        }
        div.Section1 {
          page: Section1;
        }
        body {
          font-family: 'Noto Sans Devanagari', 'Kalimati', 'Kokila', Arial, sans-serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #0f172a;
          background-color: #ffffff;
        }
        h1, h2, h3, h4 {
          font-family: 'Noto Sans Devanagari', 'Kalimati', Arial, sans-serif;
          color: #173B63;
        }
        .header-center {
          text-align: center;
          margin-bottom: 8pt;
        }
        .meta-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12pt;
          font-size: 11pt;
        }
        .subject-box {
          font-weight: bold;
          font-size: 13pt;
          margin: 14pt 0 10pt 0;
          text-align: center;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        <!-- Official Government Header -->
        <div class="header-center">
          <p style="margin: 0; font-size: 11pt; font-weight: bold; color: #dc2626;">🇳🇵 ${sanitize(draft.governmentTier)}</p>
          <h2 style="margin: 2pt 0; font-size: 15pt; font-weight: bold; color: #173B63;">${sanitize(draft.ministryOrEntity)}</h2>
          <h3 style="margin: 1pt 0; font-size: 12.5pt; font-weight: bold; color: #334155;">${sanitize(draft.departmentOrDivision)}</h3>
          ${draft.branchName ? `<p style="margin: 1pt 0; font-size: 11pt; color: #475569;">${sanitize(draft.branchName)}</p>` : ''}
          <p style="margin: 1pt 0 8pt 0; font-size: 10.5pt; color: #64748b;">${sanitize(draft.officeName)}</p>
          <hr style="border: none; border-top: 2pt solid #173B63; margin: 4pt 0 8pt 0;"/>
        </div>

        <!-- Meta Dispatch & Date Table -->
        <table class="meta-table">
          <tr>
            <td style="width: 50%; text-align: left;">
              ${draft.letterNo ? `<p style="margin: 0;">पत्र संख्या: <strong>${sanitize(draft.letterNo)}</strong></p>` : ''}
              ${draft.dispatchNo ? `<p style="margin: 2pt 0;">चलानी नम्बर: <strong>${sanitize(draft.dispatchNo)}</strong></p>` : ''}
            </td>
            <td style="width: 50%; text-align: right;">
              <p style="margin: 0;">मिति: <strong>${sanitize(draft.dateBs)}</strong></p>
              ${draft.urgency !== 'साधारण' ? `<p style="margin: 2pt 0; color: #b91c1c; font-weight: bold;">[${sanitize(draft.urgency)}]</p>` : ''}
            </td>
          </tr>
        </table>

        <!-- Recipient Block -->
        ${
          draft.recipient
            ? `
          <div style="margin: 8pt 0 12pt 0; font-size: 11.5pt;">
            <p style="margin: 0; font-weight: bold;">${sanitize(draft.recipient)}</p>
            ${draft.recipientDesignation ? `<p style="margin: 1pt 0;">${sanitize(draft.recipientDesignation)}</p>` : ''}
            ${draft.recipientOffice ? `<p style="margin: 1pt 0;">${sanitize(draft.recipientOffice)}</p>` : ''}
          </div>
        `
            : ''
        }

        <!-- Document Type / Subject -->
        <div class="subject-box">
          विषय: ${sanitize(draft.subject)}
        </div>

        ${
          draft.docType === 'tippani'
            ? '<p style="margin: 8pt 0 10pt 0; font-weight: bold; font-size: 12pt;">श्रीमान्,</p>'
            : ''
        }

        <!-- Legal Basis Banner if specified -->
        ${
          draft.legalBasis
            ? `
          <div style="background-color: #f8fafc; border-left: 3pt solid #0F766E; padding: 4pt 8pt; margin: 6pt 0 12pt 0; font-size: 10.5pt; color: #0F766E;">
            <strong>कानुनी आधार:</strong> ${sanitize(draft.legalBasis)}
          </div>
        `
            : ''
        }

        <!-- Main Body -->
        <div style="font-size: 11.5pt;">
          ${contentHtml}
        </div>

        <!-- Meeting / Report Extensions -->
        ${meetingHtml}
        ${reportHtml}

        <!-- Signatures & CC Block -->
        ${signaturesHtml}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([fullWordHtml], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  const fileName = `${draft.docType}_${draft.subject.slice(0, 30).replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_')}_${draft.dateBs}.doc`;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

/**
 * Triggers official print window.
 * Configured with @media print CSS to print clean A4 government letters.
 */
export function printOfficialDocument(): void {
  window.print();
}
