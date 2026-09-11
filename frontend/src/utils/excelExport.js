import * as XLSX from 'xlsx';

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

/**
 * Calculate optimal column widths based on cell content length
 */
function calculateColWidths(headers, dataRows) {
  const colWidths = headers.map((header, colIndex) => {
    let maxLen = String(header || '').length;
    dataRows.forEach(row => {
      const cellVal = row[colIndex] !== undefined && row[colIndex] !== null ? String(row[colIndex]) : '';
      if (cellVal.length > maxLen) {
        maxLen = cellVal.length;
      }
    });
    // Set padding and clamp between 10 and 50
    return { wch: Math.min(Math.max(maxLen + 3, 11), 50) };
  });
  return colWidths;
}

/**
 * Build and download a multi-sheet Excel (.xlsx) file with highlighted & titled columns
 * for all app data: Summary, Customers, Loans, Repayments, Payments, Audit Logs
 */
export function exportFullDataToExcel(exportData, filenamePrefix = 'Finance_App_Data_Backup') {
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

  const wb = XLSX.utils.book_new();

  /* ═══════════════════════════════════════════════════════════════════════════
     1. SUMMARY SHEET
     ═══════════════════════════════════════════════════════════════════════════ */
  const totalPrincipal = loans.reduce((acc, l) => acc + (Number(l.principalAmount) || 0), 0);
  const totalPayable = loans.reduce((acc, l) => acc + (Number(l.totalPayable) || 0), 0);
  const totalInterest = loans.reduce((acc, l) => acc + (Number(l.totalInterest) || 0), 0);
  const totalCollected = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const activeLoansCount = loans.filter(l => l.status === 'ACTIVE').length;
  const closedLoansCount = loans.filter(l => l.status === 'CLOSED').length;

  const summaryRows = [
    ['FINANCE MANAGEMENT SYSTEM - DATA EXTRACTION & BACKUP REPORT'],
    [`Generated At: ${formatDateTime(exportedAt)}`, '', `Admin / Organization: ${adminName} (${adminEmail})`],
    [''],
    ['CATEGORY / DATASET', 'RECORD COUNT', 'TOTAL AMOUNT (₹)', 'STATUS / KEY HIGHLIGHTS'],
    ['Customers (வாடிக்கையாளர்கள்)', customers.length, '-', `${customers.filter(c => c.isActive).length} Active Customers`],
    ['Loans (கடன் கணக்குகள்)', loans.length, `₹${totalPrincipal.toLocaleString('en-IN')}`, `${activeLoansCount} Active, ${closedLoansCount} Closed Loans`],
    ['Total Expected Recovery', '-', `₹${totalPayable.toLocaleString('en-IN')}`, `Expected Interest: ₹${totalInterest.toLocaleString('en-IN')}`],
    ['Repayment Schedule Dues', repayments.length, '-', `${repayments.filter(r => r.status === 'PAID').length} Paid, ${repayments.filter(r => r.status === 'OVERDUE').length} Overdue`],
    ['Payment Collections (வசூல்)', payments.length, `₹${totalCollected.toLocaleString('en-IN')}`, `Total payments collected & verified`],
    ['Audit Logs (பதிவுகள்)', auditLogs.length, '-', `System action audit trails`],
    [''],
    ['INSTRUCTIONS & NOTES:'],
    ['1. This workbook contains comprehensive structured data sheets: Customers, Loans, Repayments, Payments, and Audit Logs.'],
    ['2. All monetary amounts are in Indian Rupees (INR ₹).'],
    ['3. Dates and times are formatted in standard Indian Time (en-IN).'],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [
    { wch: 34 },
    { wch: 18 },
    { wch: 24 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  /* ═══════════════════════════════════════════════════════════════════════════
     2. CUSTOMERS SHEET
     ═══════════════════════════════════════════════════════════════════════════ */
  const customerHeaders = [
    'S.No',
    'Customer ID',
    'Full Name',
    'Mobile Phone',
    'Email Address',
    'City / Village',
    'Full Address',
    'ID Type',
    'ID Number',
    'Guarantor (Jamin) Name',
    'Guarantor Phone',
    'Guarantor Relationship',
    'Guarantor ID Type',
    'Guarantor ID Number',
    'Guarantor Address',
    'GPS Latitude',
    'GPS Longitude',
    'Notification Pref',
    'Account Status',
    'Registered Date',
  ];

  const customerRows = customers.map((c, i) => [
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

  const wsCustomers = XLSX.utils.aoa_to_sheet([customerHeaders, ...customerRows]);
  wsCustomers['!cols'] = calculateColWidths(customerHeaders, customerRows);
  XLSX.utils.book_append_sheet(wb, wsCustomers, 'Customers');

  /* ═══════════════════════════════════════════════════════════════════════════
     3. LOANS SHEET
     ═══════════════════════════════════════════════════════════════════════════ */
  const loanHeaders = [
    'S.No',
    'Loan Number',
    'Customer Name',
    'Customer Phone',
    'City',
    'Principal Amount (₹)',
    'Interest Rate (% p.a.)',
    'Loan Type / Scheme',
    'Tenure',
    'Tenure Unit',
    'Installment Due (₹)',
    'Total Interest (₹)',
    'Total Payable (₹)',
    'Processing Fee (₹)',
    'Interest Collected (₹)',
    'Outstanding Principal (₹)',
    'Status',
    'Agent Name',
    'Agent Phone',
    'Start Date',
    'Maturity Date',
    'Disbursed Date',
    'Created Date',
  ];

  const loanRows = loans.map((l, i) => [
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

  const wsLoans = XLSX.utils.aoa_to_sheet([loanHeaders, ...loanRows]);
  wsLoans['!cols'] = calculateColWidths(loanHeaders, loanRows);
  XLSX.utils.book_append_sheet(wb, wsLoans, 'Loans');

  /* ═══════════════════════════════════════════════════════════════════════════
     4. REPAYMENTS SHEET
     ═══════════════════════════════════════════════════════════════════════════ */
  const repaymentHeaders = [
    'S.No',
    'Loan Number',
    'Customer Name',
    'Customer Phone',
    'Loan Type',
    'Installment #',
    'Week / Day #',
    'Due Date',
    'Due Amount (₹)',
    'Principal Component (₹)',
    'Interest Component (₹)',
    'Paid Amount (₹)',
    'Balance Due (₹)',
    'Status',
    'Paid Date',
    'Penalty Amount (₹)',
    'Penalty Paid (₹)',
    'Penalty Status',
  ];

  const repaymentRows = repayments.map((r, i) => {
    const dueAmt = Number(r.dueAmount) || 0;
    const paidAmt = Number(r.paidAmount) || 0;
    const balance = Math.max(0, dueAmt - paidAmt);
    return [
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
    ];
  });

  const wsRepayments = XLSX.utils.aoa_to_sheet([repaymentHeaders, ...repaymentRows]);
  wsRepayments['!cols'] = calculateColWidths(repaymentHeaders, repaymentRows);
  XLSX.utils.book_append_sheet(wb, wsRepayments, 'Repayments');

  /* ═══════════════════════════════════════════════════════════════════════════
     5. PAYMENTS SHEET
     ═══════════════════════════════════════════════════════════════════════════ */
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

  const paymentRows = payments.map((p, i) => [
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

  const wsPayments = XLSX.utils.aoa_to_sheet([paymentHeaders, ...paymentRows]);
  wsPayments['!cols'] = calculateColWidths(paymentHeaders, paymentRows);
  XLSX.utils.book_append_sheet(wb, wsPayments, 'Payments');

  /* ═══════════════════════════════════════════════════════════════════════════
     6. AUDIT LOGS SHEET
     ═══════════════════════════════════════════════════════════════════════════ */
  const auditHeaders = [
    'S.No',
    'Log ID',
    'Action',
    'Entity Type',
    'Entity ID',
    'User Name',
    'User Email',
    'IP Address',
    'Details / Payload',
    'Timestamp',
  ];

  const auditRows = auditLogs.map((a, i) => [
    i + 1,
    a.id || '-',
    a.action || '-',
    a.entity || '-',
    a.entityId || '-',
    a.user?.name || 'System',
    a.user?.email || '-',
    a.ipAddress || '-',
    typeof a.details === 'object' ? JSON.stringify(a.details) : (a.details || '-'),
    formatDateTime(a.createdAt),
  ]);

  const wsAudit = XLSX.utils.aoa_to_sheet([auditHeaders, ...auditRows]);
  wsAudit['!cols'] = calculateColWidths(auditHeaders, auditRows);
  XLSX.utils.book_append_sheet(wb, wsAudit, 'Audit_Logs');

  /* ═══════════════════════════════════════════════════════════════════════════
     GENERATE & DOWNLOAD FILE
     ═══════════════════════════════════════════════════════════════════════════ */
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const finalFilename = `${filenamePrefix}_${dateStr}.xlsx`;

  XLSX.writeFile(wb, finalFilename);

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
