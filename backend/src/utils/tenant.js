const isLegacyAdmin = (user) => {
  if (!user) return false;
  return user.phone === '6380372501' || user.email === 'admin@loanflow.com';
};

const getCustomerFilter = (user) => {
  if (!user) return { id: '__NONE__' };
  if (user.role === 'ADMIN') {
    if (isLegacyAdmin(user)) {
      return {
        OR: [
          { adminId: user.id },
          { creatorId: user.id },
          { adminId: null }
        ]
      };
    }
    return {
      OR: [
        { adminId: user.id },
        { creatorId: user.id }
      ]
    };
  }
  if (user.role === 'AGENT') {
    const adminId = user.adminId;
    if (adminId) {
      return {
        OR: [
          { adminId },
          { creatorId: adminId }
        ]
      };
    }
    return { creatorId: user.id };
  }
  if (user.role === 'CUSTOMER') {
    return {
      OR: [
        { userId: user.id },
        ...(user.phone ? [{ phone: user.phone }] : [])
      ]
    };
  }
  return { id: '__NONE__' };
};

const getLoanFilter = (user) => {
  if (!user) return { id: '__NONE__' };
  if (user.role === 'ADMIN') {
    if (isLegacyAdmin(user)) {
      return {
        OR: [
          { adminId: user.id },
          { creatorId: user.id },
          { adminId: null, customer: { OR: [{ adminId: user.id }, { creatorId: user.id }, { adminId: null }] } }
        ]
      };
    }
    return {
      OR: [
        { adminId: user.id },
        { creatorId: user.id },
        { customer: { OR: [{ adminId: user.id }, { creatorId: user.id }] } }
      ]
    };
  }
  if (user.role === 'AGENT') {
    const adminId = user.adminId;
    if (adminId) {
      return {
        OR: [
          { adminId },
          { creatorId: adminId },
          { customer: { OR: [{ adminId }, { creatorId: adminId }] } }
        ]
      };
    }
    return { creatorId: user.id };
  }
  if (user.role === 'CUSTOMER') {
    return {
      customer: {
        OR: [
          { userId: user.id },
          ...(user.phone ? [{ phone: user.phone }] : [])
        ]
      }
    };
  }
  return { id: '__NONE__' };
};

const getUserFilter = (user) => {
  if (!user) return { id: '__NONE__' };
  if (user.role === 'ADMIN') {
    if (isLegacyAdmin(user)) {
      return {
        OR: [
          { adminId: user.id },
          { creatorId: user.id },
          { adminId: null }
        ]
      };
    }
    return {
      OR: [
        { adminId: user.id },
        { creatorId: user.id }
      ]
    };
  }
  return { id: user.id };
};

module.exports = {
  isLegacyAdmin,
  getCustomerFilter,
  getLoanFilter,
  getUserFilter
};
