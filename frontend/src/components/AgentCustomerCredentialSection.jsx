import { useState, useEffect } from 'react';
import { customersAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  KeyRound, Sparkles, Send, CheckCircle2, ShieldCheck,
  Phone, Lock, User, Search, Smartphone, RefreshCw,
  ExternalLink, Check, Copy, AlertCircle, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AgentCustomerCredentialSection({ preselectedCustomerId = null }) {
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoadingCustomers(true);
    customersAPI.list({ limit: 200 })
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.customers || []);
        setCustomers(list);
        if (preselectedCustomerId) {
          const found = list.find(c => c.id === preselectedCustomerId);
          if (found) {
            handleSelect(found);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoadingCustomers(false));
  }, [preselectedCustomerId]);

  const handleSelect = (customer) => {
    setSelectedCustomer(customer);
    setPhone(customer.phone || '');
    setPassword('');
    setSuccessResult(null);
    setShowDropdown(false);
    setSearchTerm('');
  };

  const handleGeneratePin = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setPassword(pin);
  };

  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      toast.error('Please select a customer first');
      return;
    }
    if (!password || password.trim().length < 4) {
      toast.error('Password must be at least 4 characters long');
      return;
    }

    setSubmitting(true);
    try {
      const res = await customersAPI.setCredentials(selectedCustomer.id, {
        phone: phone.trim(),
        password: password.trim()
      });

      toast.success(res.message || 'Credentials set & Super Admin indicated!');
      setSuccessResult({
        customer: selectedCustomer,
        phone: phone.trim(),
        password: password.trim(),
        indicatedToAdmin: res.data?.indicatedToAdmin
      });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!successResult) return;
    const text = `Mobile: ${successResult.phone}\nPassword: ${successResult.password}\nPortal: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!successResult) return;
    const portalUrl = `${window.location.origin}/login`;
    const message = `Hello *${successResult.customer.name}*,\n\nYour *Finova Customer Portal* mobile access has been set up:\n\n📱 *Mobile Number:* ${successResult.phone}\n🔑 *Password / PIN:* ${successResult.password}\n🏷️ *Login Category:* Customer\n\nLogin here: ${portalUrl}\n\nTrack your active loans, weekly schedules, and receipts 24/7!`;
    const encoded = encodeURI(message);
    window.open(`https://wa.me/91${successResult.phone.replace(/\D/g, '')}?text=${encoded}`, '_blank');
  };

  const handleReset = () => {
    setSelectedCustomer(null);
    setPhone('');
    setPassword('');
    setSuccessResult(null);
    setSearchTerm('');
  };

  const filteredCustomers = customers.filter(c => {
    const q = searchTerm.toLowerCase();
    return c.name?.toLowerCase().includes(q) || (c.phone && c.phone.includes(q));
  });

  return (
    <div style={{
      background: 'var(--bg-card, #ffffff)',
      border: '1px solid rgba(16, 185, 129, 0.25)',
      borderRadius: '18px',
      padding: '24px',
      boxShadow: '0 4px 20px -2px rgba(16, 185, 129, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
      marginBottom: '24px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-subtle, rgba(0,0,0,0.06))',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.25) 100%)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
          }}>
            <KeyRound size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                Customer App Credentials
              </h3>
              <span style={{
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#059669',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                Field Agent Portal
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>
              Set customer login phone & password • Automatically alerts Super Admin
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          padding: '6px 12px',
          borderRadius: '100px',
          fontSize: '11px',
          fontWeight: 600,
          color: '#d97706'
        }}>
          <ShieldCheck size={14} color="#d97706" />
          <span>Super Admin Indication Live</span>
        </div>
      </div>

      {successResult ? (
        /* Success Screen */
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(59, 130, 246, 0.04) 100%)',
          border: '1.5px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px'
          }}>
            <CheckCircle2 size={26} />
          </div>

          <h4 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
            Credentials Configured Successfully!
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)', margin: '0 0 14px' }}>
            Customer <strong>{successResult.customer.name}</strong> can now log in under the <strong>Customer</strong> tab on the mobile app.
          </p>

          <div style={{
            maxWidth: '440px',
            margin: '0 auto 14px',
            background: 'var(--bg-primary, #f8fafc)',
            border: '1px solid var(--border-default, #e2e8f0)',
            borderRadius: '12px',
            padding: '12px 18px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>Target Customer</span>
              <strong style={{ fontSize: '13px', color: 'var(--text-primary, #0f172a)' }}>{successResult.customer.name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>Mobile (Login ID)</span>
              <strong style={{ fontSize: '14px', fontFamily: 'monospace', color: 'var(--text-primary, #0f172a)' }}>{successResult.phone}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>Password / PIN</span>
              <strong style={{ fontSize: '15px', fontFamily: 'monospace', color: '#10b981', letterSpacing: '1px' }}>{successResult.password}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px dashed var(--border-subtle, #cbd5e1)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>Login Category</span>
              <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
                Customer (Passbook)
              </span>
            </div>
          </div>

          <div style={{
            fontSize: '11px',
            color: '#059669',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '8px',
            padding: '8px 12px',
            maxWidth: '440px',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>Super Admin has received an automated notification alert in the header</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#25D366',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
              }}
            >
              <Send size={16} /> Share via WhatsApp
            </button>

            <button
              type="button"
              onClick={handleCopyCredentials}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--bg-primary, #f8fafc)',
                color: 'var(--text-primary, #0f172a)',
                border: '1px solid var(--border-default, #e2e8f0)',
                borderRadius: '10px',
                padding: '10px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy Credentials'}
            </button>

            <button
              type="button"
              onClick={handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                color: 'var(--text-muted, #64748b)',
                border: 'none',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Create for Another Customer
            </button>
          </div>
        </div>
      ) : (
        /* Form Section */
        <form onSubmit={handleSaveCredentials}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* Column 1: Choose Customer */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-primary, #0f172a)',
                marginBottom: '8px'
              }}>
                1. Select Customer
              </label>

              {selectedCustomer ? (
                /* Selected Customer Chip */
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1.5px solid #10b981',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#10b981',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '14px'
                    }}>
                      {selectedCustomer.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary, #0f172a)' }}>
                        {selectedCustomer.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>
                        📱 {selectedCustomer.phone}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '4px 8px'
                    }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                /* Searchable Dropdown Container */
                <div style={{ position: 'relative' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-primary, #f8fafc)',
                    border: '1.5px solid var(--border-default, #e2e8f0)',
                    borderRadius: '12px',
                    padding: '0 12px',
                    height: '44px',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                  }}>
                    <Search size={16} color="var(--text-muted, #64748b)" style={{ marginRight: '8px', flexShrink: 0 }} />
                    <input
                      type="text"
                      placeholder="Search customer by name or phone..."
                      value={searchTerm}
                      onChange={e => {
                        setSearchTerm(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: '13px',
                        color: 'var(--text-primary, #0f172a)'
                      }}
                    />
                  </div>

                  {showDropdown && (
                    <>
                      <div
                        style={{ position: 'fixed', inset: 0, zIndex: 20 }}
                        onClick={() => setShowDropdown(false)}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        right: 0,
                        zIndex: 30,
                        background: 'var(--bg-card, #ffffff)',
                        border: '1px solid var(--border-default, #e2e8f0)',
                        borderRadius: '12px',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.15)'
                      }}>
                        {loadingCustomers ? (
                          <div style={{ padding: '14px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                            Loading customer directory...
                          </div>
                        ) : filteredCustomers.length === 0 ? (
                          <div style={{ padding: '14px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                            No customers found for "{searchTerm}"
                          </div>
                        ) : (
                          filteredCustomers.map(c => (
                            <div
                              key={c.id}
                              onClick={() => handleSelect(c)}
                              style={{
                                padding: '10px 14px',
                                borderBottom: '1px solid var(--border-subtle, rgba(0,0,0,0.04))',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'background 0.15s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.06)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary, #0f172a)' }}>
                                  {c.name}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
                                  📱 {c.phone}
                                </div>
                              </div>
                              {c.loans?.length > 0 && (
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  background: 'rgba(16, 185, 129, 0.12)',
                                  color: '#059669',
                                  padding: '2px 6px',
                                  borderRadius: '6px'
                                }}>
                                  {c.loans.length} Loan{c.loans.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', marginTop: '6px' }}>
                Pick the customer from your active borrower list.
              </div>
            </div>

            {/* Column 2: Credentials Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Phone Input */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-primary, #0f172a)',
                  marginBottom: '8px'
                }}>
                  2. Customer Mobile (Login ID)
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: selectedCustomer ? 'var(--bg-primary, #f8fafc)' : 'rgba(0,0,0,0.02)',
                  border: '1.5px solid var(--border-default, #e2e8f0)',
                  borderRadius: '12px',
                  padding: '0 12px',
                  height: '44px'
                }}>
                  <Phone size={16} color="var(--text-muted, #64748b)" style={{ marginRight: '8px', flexShrink: 0 }} />
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    disabled={!selectedCustomer}
                    required
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: '13px',
                      color: 'var(--text-primary, #0f172a)'
                    }}
                  />
                </div>
              </div>

              {/* Password / PIN Input with Auto-Generate */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-primary, #0f172a)',
                    margin: 0
                  }}>
                    3. Password / 6-Digit PIN
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePin}
                    disabled={!selectedCustomer}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#059669',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: selectedCustomer ? 'pointer' : 'not-allowed',
                      opacity: selectedCustomer ? 1 : 0.5
                    }}
                  >
                    <Sparkles size={12} /> Auto-Generate PIN
                  </button>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: selectedCustomer ? 'var(--bg-primary, #f8fafc)' : 'rgba(0,0,0,0.02)',
                  border: '1.5px solid var(--border-default, #e2e8f0)',
                  borderRadius: '12px',
                  padding: '0 12px',
                  height: '44px'
                }}>
                  <Lock size={16} color="var(--text-muted, #64748b)" style={{ marginRight: '8px', flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Enter custom password or click Auto-Generate"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={!selectedCustomer}
                    required
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: '14px',
                      letterSpacing: password ? '1px' : 'normal',
                      fontFamily: password ? 'monospace' : 'inherit',
                      color: 'var(--text-primary, #0f172a)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle, rgba(0,0,0,0.06))'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>
              {selectedCustomer ? (
                <span>Configuring access for <strong>{selectedCustomer.name}</strong></span>
              ) : (
                <span>⚠️ Please select a customer above to activate credential creation</span>
              )}
            </div>

            <button
              type="submit"
              disabled={!selectedCustomer || submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: selectedCustomer ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(0,0,0,0.1)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '11px 22px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: selectedCustomer && !submitting ? 'pointer' : 'not-allowed',
                boxShadow: selectedCustomer ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <KeyRound size={16} />
              {submitting ? 'Setting Credentials...' : 'Generate & Notify Super Admin'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
