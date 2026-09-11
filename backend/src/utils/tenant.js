const isLegacyAdmin = (user) => {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  const legacyEmails = [
    'admin@loanflow.com',
    'salmankhandwork@gmail.com',
    'salmankhanwork@gmail.com',
    'samitha0786@gmail.com',
    'samitha121986@gmail.com',
    'v4nexustech@gmail.com',
    'jeevaamarimuthu8@gmail.com'
  ];
  return (
    user.phone === '6380372501' ||
    user.phone === '09342298949' ||
    user.phone === '9342298949' ||
    legacyEmails.includes(user.email?.toLowerCase?.() || '')
  );
};

/**
 * Returns the effective admin ID for the requesting user.
 * For ADMIN: their own id.
 * For AGENT: their adminId (the admin they belong to).
 */
const resolveAdminId = (user) => {
  if (!user) return null;
  if (user.role === 'ADMIN') return user.id;
  if (user.role === 'AGENT') return user.adminId || null;
  return null;
};

/**
 * Throws a 403 error if the resource's adminId does not match the
 * requesting user's resolved admin ID.
 * Legacy admins bypass this check and can access all records.
 * Records with null adminId are only accessible to legacy admins.
 *
 * @param {object} resource - The DB record (must have an adminId field)
 * @param {object} user - req.user from auth middleware
 * @param {string} resourceName - Human-readable name for error messages
 */
const assertOwnership = (resource, user, resourceName = 'Resource') => {
  if (!resource) return; // 404 handled by caller
  if (isLegacyAdmin(user)) return; // Legacy admin sees everything

  const effectiveAdminId = resolveAdminId(user);
  if (!effectiveAdminId) {
    const err = new Error('Cannot resolve admin identity for ownership check.');
    err.statusCode = 403;
    throw err;
  }

  // If the record has no adminId it's a legacy unowned record — only legacy admin can touch it
  if (!resource.adminId) {
    const err = new Error(`Access denied. This ${resourceName} is not assigned to any admin workspace.`);
    err.statusCode = 403;
    throw err;
  }

  if (resource.adminId !== effectiveAdminId) {
    const err = new Error(`Access denied. This ${resourceName} belongs to a different admin workspace.`);
    err.statusCode = 403;
    throw err;
  }
};

const getCustomerFilter = (user) => {
  if (!user) return { id: '__NONE__' };
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    if (isLegacyAdmin(user)) {
      return {};
    }
    return {
      OR: [
        { adminId: user.id },
        { creatorId: user.id },
        { adminId: null }
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
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    if (isLegacyAdmin(user)) {
      return {};
    }
    return {
      OR: [
        { adminId: user.id },
        { creatorId: user.id },
        { adminId: null },
        { customer: { OR: [{ adminId: user.id }, { creatorId: user.id }, { adminId: null }] } }
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
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    if (isLegacyAdmin(user)) {
      return {};
    }
    return {
      OR: [
        { adminId: user.id },
        { creatorId: user.id },
        { adminId: null }
      ]
    };
  }
  return { id: user.id };
};

module.exports = {
  isLegacyAdmin,
  resolveAdminId,
  assertOwnership,
  getCustomerFilter,
  getLoanFilter,
  getUserFilter
};

