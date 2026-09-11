import ExcelJS from 'exceljs';

/**
 * Format a Date to readable string (e.g. 11-Sep-2026 01:15 PM)
 */
function formatDateTime(d) {
  if (!d) return '-';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '-';
  }
}

function formatDate(d) {
  if (!d) return '-';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

// Thin border helper
const thinBorder = {
  top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
  right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
};

/**
 * Apply styling to a title banner row spanning across all columns
 */
function styleBannerRow(worksheet, rowNumber, text, bgColorArgb, endColLetter = 'Z') {
  worksheet.mergeCells(`A${rowNumber}:${endColLetter}${rowNumber}`);
  const row = worksheet.getRow(rowNumber);
  row.height = 32;
  const cell = row.getCell(1);
  cell.value = text;
  cell.font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColorArgb } };
  cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
}

/**
 * Apply styling to a header row
 */
function styleHeaderRow(worksheet, rowNumber, headerBgArgb) {
  const row = worksheet.getRow(rowNumber);
  row.height = 26;
  row.eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBgArgb } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: false };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FFFFFFFF' } },
      left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } },
      right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
    };
  });
}

/**
 * Auto-fit column widths with padding and minimum width
 */
function autoFitColumns(worksheet, minWidth = 12) {
  worksheet.columns.forEach((column) => {
    let maxLength = minWidth;
    column.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
      // Ignore merged banner rows for width calculation
      if (rowNumber <= 2) return;
      const cellVal = cell.value ? String(cell.value) : '';
      if (cellVal.length > maxLength) {
        maxLength = cellVal.length;
      }
    });
    column.width = Math.min(Math.max(maxLength + 4, minWidth), 52);
  });
}

/**
 * Build and download a visually stunning, colored multi-sheet Excel (.xlsx) file
 * using ExcelJS with highlighted headers, color-coded status badges, and zebra striping.
 */
export async function exportFullDataToExcel(exportData, filenamePrefix = 'Finance_App_Data_Backup') {
  if (!exportData) {
    throw new Error('No data available to export');
  }

  const {
    exportedAt = new Date().toISOString(),
    adminName = 'Admin',
    adminEmail = '',
    customers = [],
    loans = [],
    repayments = [],
    payments = [],
    auditLogs = [],
  } = exportData;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Finova Finance App';
  workbook.lastModifiedBy = adminName || 'Admin';
  workbook.created = new Date();
  workbook.modified = new Date();

  /* ═══════════════════════════════════════════════════════════════════════════
     1. SUMMARY SHEET (Emerald / Navy Theme)
     ═══════════════════════════════════════════════════════════════════════════ */
  const wsSummary = workbook.addWorksheet('📊 Summary', {
    views: [{ showGridLines: true }],
    properties: { tabColor: { argb: 'FF059669' } },
  });

  const totalPrincipal = loans.reduce((acc, l) => acc + (Number(l.principalAmount) || 0), 0);
  const totalPayable = loans.reduce((acc, l) => acc + (Number(l.totalPayable) || 0), 0);
  const totalInterest = loans.reduce((acc, l) => acc + (Number(l.totalInterest) || 0), 0);
  const totalCollected = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const activeLoansCount = loans.filter((l) => l.status === 'ACTIVE').length;
  const closedLoansCount = loans.filter((l) => l.status === 'CLOSED').length;
  const activeCustomersCount = customers.filter((c) => c.isActive).length;

  // Title Banner
  styleBannerRow(wsSummary, 1, '💎 FINANCE MANAGEMENT SYSTEM — COMPLETE DATA BACKUP & AUDIT REPORT', 'FF1E293B', 'D');

  // Subtitle metadata
  wsSummary.mergeCells('A2:D2');
  const subRow = wsSummary.getRow(2);
  subRow.height = 22;
  const subCell = subRow.getCell(1);
  subCell.value = `Exported on: ${formatDateTime(exportedAt)}   |   Admin: ${adminName} (${adminEmail})   |   Status: Verified`;
  subCell.font = { name: 'Segoe UI', size: 9.5, italic: true, color: { argb: 'FF475569' } };
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

  // Empty row
  wsSummary.addRow([]);

  // Table Headers
  const summaryHeaderRow = wsSummary.addRow(['CATEGORY / DATASET', 'RECORD COUNT', 'TOTAL AMOUNT (₹)', 'KEY HIGHLIGHTS & STATUS']);
  styleHeaderRow(wsSummary, summaryHeaderRow.number, 'FF065F46');

  const summaryData = [
    ['👥 Customers (வாடிக்கையாளர்கள்)', customers.length, '—', `${activeCustomersCount} Active KYC Verified Accounts`, 'FFEFF6FF'],
    ['🏦 Loans (கடன் கணக்குகள்)', loans.length, totalPrincipal, `${activeLoansCount} Active, ${closedLoansCount} Closed Contracts`, 'FFFAF5FF'],
    ['📈 Total Expected Recovery', '—', totalPayable, `Expected Interest Earnings: ₹${totalInterest.toLocaleString('en-IN')}`, 'FFECFDF5'],
    ['🔄 Repayment Schedule Dues', repayments.length, '—', `${repayments.filter((r) => r.status === 'PAID').length} Paid, ${repayments.filter((r) => r.status === 'OVERDUE').length} Overdue`, 'FFFFFBEB'],
    ['💳 Payment Collections (வசூல்)', payments.length, totalCollected, 'Total Collections Received & Verified', 'FFF0FDF4'],
    ['📝 Audit Logs (பதிவுகள்)', auditLogs.length, '—', 'System Security & Administrative Action Trails', 'FFF8FAFC'],
  ];

  summaryData.forEach(([cat, count, amt, desc, bg]) => {
    const r = wsSummary.addRow([cat, count, typeof amt === 'number' ? amt : amt, desc]);
    r.height = 24;
    r.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF1E293B' }, bold: colNum === 1 || colNum === 3 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.border = thinBorder;
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNum === 1 ? 'left' : colNum === 2 ? 'center' : colNum === 3 ? 'right' : 'left',
      };
      if (colNum === 3 && typeof amt === 'number') {
        cell.numFmt = '₹#,##0.00';
      }
    });
  });

  // Notes section
  wsSummary.addRow([]);
  const noteRow = wsSummary.addRow(['ℹ️ INSTRUCTIONS & DATA INTEGRITY:']);
  noteRow.getCell(1).font = { bold: true, color: { argb: 'FF1E40AF' } };
  const notes = [
    '• Each tab at the bottom contains a distinct dataset (Customers, Loans, Repayments, Payments, Audit Logs) with dedicated color-coded columns.',
    '• All currency figures are in Indian National Rupees (INR ₹).',
    '• Status badges in each sheet are color-coded (Green = Active/Paid, Red = Overdue/Defaulted, Amber = Pending).',
  ];
  notes.forEach((n) => {
    const nr = wsSummary.addRow([n]);
    nr.getCell(1).font = { size: 9, color: { argb: 'FF64748B' } };
  });

  autoFitColumns(wsSummary, 16);

  /* ═══════════════════════════════════════════════════════════════════════════
     2. CUSTOMERS SHEET (Royal Blue Theme)
     ═══════════════════════════════════════════════════════════════════════════ */
  const wsCustomers = workbook.addWorksheet('👥 Customers', {
    views: [{ showGridLines: true, state: 'frozen', ySplit: 3 }],
    properties: { tabColor: { argb: 'FF2563EB' } },
  });

  styleBannerRow(wsCustomers, 1, '👥 CUSTOMER DIRECTORY & KYC RECORDS (வாடிக்கையாளர்கள் விபரம்)', 'FF1E40AF', 'T');

  const customerHeaders = [
    'S.No',
    'Customer ID',
    'Full Name',
    'Mobile Phone',
    'Email Address',
    'City / Village',
    'Full Address',
    'ID Type',
    'ID / Aadhaar Number',
    'Guarantor (Jamin) Name',
    'Guarantor Phone',
    'Guarantor Relation',
    'Guarantor ID Type',
    'Guarantor ID Number',
    'Guarantor Address',
    'GPS Latitude',
    'GPS Longitude',
    'Notification Pref',
    'Account Status',
    'Registered Date',
  ];

  const custHeaderRow = wsCustomers.addRow(customerHeaders);
  styleHeaderRow(wsCustomers, custHeaderRow.number, 'FF2563EB');

  customers.forEach((c, i) => {
    const isEven = i % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF0F7FF';
    const r = wsCustomers.addRow([
      i + 1,
      c.id || '-',
      c.name || '-',
      c.phone || c.user?.phone || '-',
      c.email || c.user?.email || '-',
      c.city || '-',
      c.address || '-',
      c.idType || 'AADHAR',
      c.idNumber || '-',
      c.jaminName || '-',
      c.jaminPhone || '-',
      c.jaminRelationship || '-',
      c.jaminIdType || '-',
      c.jaminIdNumber || '-',
      c.jaminAddress || '-',
      c.latitude || '-',
      c.longitude || '-',
      c.notificationPref || 'BOTH',
      c.isActive ? 'ACTIVE' : 'INACTIVE',
      formatDate(c.createdAt),
    ]);
    r.height = 22;
    r.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF1E293B' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      cell.border = thinBorder;
      cell.alignment = {
        vertical: 'middle',
        horizontal: [1, 4, 8, 9, 11, 13, 14, 16, 17, 18, 19, 20].includes(colNum) ? 'center' : 'left',
      };
      // Highlight Status Badge
      if (colNum === 19) {
        if (c.isActive) {
          cell.font = { bold: true, color: { argb: 'FF15803D' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
        } else {
          cell.font = { bold: true, color: { argb: 'FFB91C1C' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
        }
      }
      // Highlight Customer Name
      if (colNum === 3) {
        cell.font = { bold: true, color: { argb: 'FF1E40AF' } };
      }
    });
  });

  autoFitColumns(wsCustomers, 12);

  /* ═══════════════════════════════════════════════════════════════════════════
     3. LOANS SHEET (Purple Theme)
     ═══════════════════════════════════════════════════════════════════════════ */
  const wsLoans = workbook.addWorksheet('🏦 Loans', {
    views: [{ showGridLines: true, state: 'frozen', ySplit: 3 }],
    properties: { tabColor: { argb: 'FF7C3AED' } },
  });

  styleBannerRow(wsLoans, 1, '🏦 LOAN PORTFOLIO & RECOVERY CONTRACTS (கடன் கணக்குகள் விபரம்)', 'FF581C87', 'W');

  const loanHeaders = [
    'S.No',
    'Loan Number',
    'Customer Name',
    'Customer Phone',
    'City',
    'Principal Amount (₹)',
    'Interest Rate (% p.a.)',
    'Loan Scheme',
    'Tenure',
    'Tenure Unit',
    'Installment Due (₹)',
    'Total Interest (₹)',
    'Total Payable (₹)',
    'Processing Fee (₹)',
    'Interest Collected (₹)',
    'Outstanding Principal (₹)',
    'Loan Status',
    'Assigned Agent',
    'Agent Phone',
    'Start Date',
    'Maturity Date',
    'Disbursed Date',
    'Created Date',
  ];

  const loanHeaderRow = wsLoans.addRow(loanHeaders);
  styleHeaderRow(wsLoans, loanHeaderRow.number, 'FF7C3AED');

  loans.forEach((l, i) => {
    const isEven = i % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF5F3FF';
    const r = wsLoans.addRow([
      i + 1,
      l.loanNumber || '-',
      l.customer?.name || '-',
      l.customer?.phone || '-',
      l.customer?.city || '-',
      Number(l.principalAmount) || 0,
      Number(l.interestRate) || 0,
      l.interestType || 'FLAT',
      Number(l.tenure) || 0,
      l.tenureUnit || 'MONTHS',
      Number(l.installmentAmount) || 0,
      Number(l.totalInterest) || 0,
      Number(l.totalPayable) || 0,
      Number(l.processingFee) || 0,
      Number(l.interestCollected) || 0,
      l.outstandingPrincipal !== null && l.outstandingPrincipal !== undefined ? Number(l.outstandingPrincipal) : Number(l.principalAmount),
      l.status || 'ACTIVE',
      l.agent?.name || '-',
      l.agent?.phone || '-',
      formatDate(l.startDate),
      formatDate(l.endDate),
      formatDate(l.disbursedAt),
      formatDate(l.createdAt),
    ]);
    r.height = 22;
    r.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF1E293B' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      cell.border = thinBorder;
      // Formatting
      if ([6, 11, 12, 13, 14, 15, 16].includes(colNum)) {
        cell.numFmt = '₹#,##0.00';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        cell.font = { bold: colNum === 6 || colNum === 13 };
      } else if (colNum === 7) {
        cell.numFmt = '0.00"%"';
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if ([1, 2, 4, 8, 9, 10, 17, 20, 21, 22, 23].includes(colNum)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }

      // Highlight Loan Number
      if (colNum === 2) {
        cell.font = { bold: true, color: { argb: 'FF6D28D9' } };
      }

      // Highlight Loan Status
      if (colNum === 17) {
        if (l.status === 'ACTIVE') {
          cell.font = { bold: true, color: { argb: 'FF15803D' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
        } else if (l.status === 'CLOSED') {
          cell.font = { bold: true, color: { argb: 'FF475569' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
        } else if (l.status === 'DEFAULTED') {
          cell.font = { bold: true, color: { argb: 'FFB91C1C' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
        }
      }
    });
  });

  autoFitColumns(wsLoans, 13);

  /* ═══════════════════════════════════════════════════════════════════════════
     4. REPAYMENTS SHEET (Amber / Orange Theme)
     ═══════════════════════════════════════════════════════════════════════════ */
  const wsRepayments = workbook.addWorksheet('🔄 Repayments', {
    views: [{ showGridLines: true, state: 'frozen', ySplit: 3 }],
    properties: { tabColor: { argb: 'FFD97706' } },
  });

  styleBannerRow(wsRepayments, 1, '🔄 REPAYMENT SCHEDULE & INSTALLMENT SCHEDULE (தவணை அட்டவணை)', 'FF92400E', 'R');

  const repaymentHeaders = [
    'S.No',
    'Loan Number',
    'Customer Name',
    'Customer Phone',
    'Loan Scheme',
    'Installment #',
    'Week / Day #',
    'Due Date',
    'Due Amount (₹)',
    'Principal (₹)',
    'Interest (₹)',
    'Paid Amount (₹)',
    'Balance Due (₹)',
    'Payment Status',
    'Paid Date',
    'Penalty Amount (₹)',
    'Penalty Paid (₹)',
    'Penalty Status',
  ];

  const repHeaderRow = wsRepayments.addRow(repaymentHeaders);
  styleHeaderRow(wsRepayments, repHeaderRow.number, 'FFD97706');

  repayments.forEach((r, i) => {
    const isEven = i % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFFFFBEB';
    const dueAmt = Number(r.dueAmount) || 0;
    const paidAmt = Number(r.paidAmount) || 0;
    const balance = Math.max(0, dueAmt - paidAmt);
    const row = wsRepayments.addRow([
      i + 1,
      r.loan?.loanNumber || '-',
      r.loan?.customer?.name || '-',
      r.loan?.customer?.phone || '-',
      r.loan?.interestType || '-',
      r.installmentNo ?? '-',
      r.weekNo ? `Week ${r.weekNo}` : r.dayNo ? `Day ${r.dayNo}` : '-',
      formatDate(r.dueDate),
      dueAmt,
      Number(r.principal) || 0,
      Number(r.interest) || 0,
      paidAmt,
      balance,
      r.status || 'PENDING',
      formatDate(r.paidAt),
      Number(r.penaltyAmount) || 0,
      Number(r.penaltyPaid) || 0,
      r.penaltyStatus || 'NONE',
    ]);
    row.height = 21;
    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF1E293B' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      cell.border = thinBorder;
      // Numbers
      if ([9, 10, 11, 12, 13, 16, 17].includes(colNum)) {
        cell.numFmt = '₹#,##0.00';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        if (colNum === 13 && balance > 0) {
          cell.font = { bold: true, color: { argb: 'FFDC2626' } };
        }
      } else if ([1, 2, 4, 5, 6, 7, 8, 14, 15, 18].includes(colNum)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }

      // Highlight Status
      if (colNum === 14) {
        if (r.status === 'PAID') {
          cell.font = { bold: true, color: { argb: 'FF15803D' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
        } else if (r.status === 'OVERDUE') {
          cell.font = { bold: true, color: { argb: 'FFB91C1C' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
        } else if (r.status === 'PARTIAL') {
          cell.font = { bold: true, color: { argb: 'FFC2410C' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEDD5' } };
        } else {
          cell.font = { bold: true, color: { argb: 'FFB45309' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
        }
      }
    });
  });

  autoFitColumns(wsRepayments, 12);

  /* ═══════════════════════════════════════════════════════════════════════════
     5. PAYMENTS SHEET (Emerald Green Theme)
     ═══════════════════════════════════════════════════════════════════════════ */
  const wsPayments = workbook.addWorksheet('💳 Payments', {
    views: [{ showGridLines: true, state: 'frozen', ySplit: 3 }],
    properties: { tabColor: { argb: 'FF10B981' } },
  });

  styleBannerRow(wsPayments, 1, '💳 PAYMENT TRANSACTIONS & CASH COLLECTIONS (வசூல் பதிவுகள்)', 'FF065F46', 'M');

  const paymentHeaders = [
    'S.No',
    'Payment ID',
    'Loan Number',
    'Customer Name',
    'Customer Phone',
    'Installment #',
    'Amount Received (₹)',
    'Payment Mode',
    'Payment Type',
    'Collected By',
    'Collector Phone',
    'Collection Date & Time',
    'Reference / Notes',
  ];

  const payHeaderRow = wsPayments.addRow(paymentHeaders);
  styleHeaderRow(wsPayments, payHeaderRow.number, 'FF059669');

  payments.forEach((p, i) => {
    const isEven = i % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF0FDF4';
    const row = wsPayments.addRow([
      i + 1,
      p.id || '-',
      p.repayment?.loan?.loanNumber || '-',
      p.repayment?.loan?.customer?.name || '-',
      p.repayment?.loan?.customer?.phone || '-',
      p.repayment?.installmentNo ?? '-',
      Number(p.amount) || 0,
      p.paymentMode || 'CASH',
      p.paymentType || 'INTEREST',
      p.collectedBy?.name || 'Admin',
      p.collectedBy?.phone || '-',
      formatDateTime(p.collectedAt),
      [p.reference, p.notes].filter(Boolean).join(' | ') || '-',
    ]);
    row.height = 22;
    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF1E293B' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      cell.border = thinBorder;
      // Amount Highlight
      if (colNum === 7) {
        cell.numFmt = '₹#,##0.00';
        cell.font = { bold: true, color: { argb: 'FF047857' } };
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
      } else if ([1, 2, 3, 5, 6, 8, 9, 11, 12].includes(colNum)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }

      // Payment Mode Tag
      if (colNum === 8) {
        cell.font = { bold: true, color: { argb: 'FF0F766E' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFBF1' } };
      }
    });
  });

  autoFitColumns(wsPayments, 13);

  /* ═══════════════════════════════════════════════════════════════════════════
     6. AUDIT LOGS SHEET (Slate Gray Theme)
     ═══════════════════════════════════════════════════════════════════════════ */
  const wsAudit = workbook.addWorksheet('📝 Audit Logs', {
    views: [{ showGridLines: true, state: 'frozen', ySplit: 3 }],
    properties: { tabColor: { argb: 'FF64748B' } },
  });

  styleBannerRow(wsAudit, 1, '📝 SYSTEM AUDIT TRAILS & SECURITY LOGS (செயல்பாட்டு பதிவுகள்)', 'FF1E293B', 'J');

  const auditHeaders = [
    'S.No',
    'Log ID',
    'Action',
    'Entity Type',
    'Entity ID',
    'Performed By User',
    'User Email',
    'IP Address',
    'Details / Payload',
    'Timestamp',
  ];

  const auditHeaderRow = wsAudit.addRow(auditHeaders);
  styleHeaderRow(wsAudit, auditHeaderRow.number, 'FF475569');

  auditLogs.forEach((a, i) => {
    const isEven = i % 2 === 0;
    const rowBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC';
    const row = wsAudit.addRow([
      i + 1,
      a.id || '-',
      a.action || '-',
      a.entity || '-',
      a.entityId || '-',
      a.user?.name || 'System',
      a.user?.email || '-',
      a.ipAddress || '-',
      typeof a.details === 'object' ? JSON.stringify(a.details) : a.details || '-',
      formatDateTime(a.createdAt),
    ]);
    row.height = 21;
    row.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: 'FF1E293B' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      cell.border = thinBorder;
      cell.alignment = {
        vertical: 'middle',
        horizontal: [1, 2, 3, 4, 5, 8, 10].includes(colNum) ? 'center' : 'left',
      };
      if (colNum === 3) {
        cell.font = { bold: true, color: { argb: 'FF0284C7' } };
      }
    });
  });

  autoFitColumns(wsAudit, 12);

  /* ═══════════════════════════════════════════════════════════════════════════
     GENERATE BUFFER & TRIGGER BROWSER DOWNLOAD
     ═══════════════════════════════════════════════════════════════════════════ */
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const finalFilename = `${filenamePrefix}_${dateStr}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = finalFilename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);

  return {
    filename: finalFilename,
    counts: {
      customers: customers.length,
      loans: loans.length,
      repayments: repayments.length,
      payments: payments.length,
      auditLogs: auditLogs.length,
    },
  };
}
