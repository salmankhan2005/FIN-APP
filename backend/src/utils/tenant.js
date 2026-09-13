/**
 * Tenant & Admin Workspace Isolation Utility
 * 
 * Ensures strict multi-tenant data isolation:
 * Each admin credential operates in their own isolated session and workspace.
 * An admin CANNOT see or access another admin's user credentials, customers, loans, or reports.
 */

/**
 * Legacy admin check.
 * Strictly false for all standard admin sessions to ensure complete isolation.
 */
const isLegacyAdmin = (user) => {
  return false;
};

/**
 * Returns the effective admin ID for the requesting user.
 * - For ADMIN / SUPER_ADMIN: their own id.
 * - For AGENT: their assigned adminId.
 */
const resolveAdminId = (user) => {
  if (!user) return null;
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return user.id;
  if (user.role === 'AGENT') return user.adminId || null;
  return null;
};

/**
 * Enforces ownership: Throws 403 error if the resource's adminId
 * does not match the requesting user's resolved admin ID.
 *
 * @param {object} resource - The DB record (with adminId and/or creatorId field)
 * @param {object} user - req.user from auth middleware
 * @param {string} resourceName - Human-readable name for error messages
 */
const assertOwnership = (resource, user, resourceName = 'Resource') => {
  if (!resource) return; // 404 handled by caller

  const effectiveAdminId = resolveAdminId(user);
  if (!effectiveAdminId) {
    const err = new Error('Cannot resolve admin identity for ownership check.');
    err.statusCode = 403;
    throw err;
  }

  const resourceAdminId = resource.adminId || resource.creatorId;
  if (resourceAdminId && resourceAdminId !== effectiveAdminId) {
    const err = new Error(`Access denied. This ${resourceName} belongs to a different admin workspace.`);
    err.statusCode = 403;
    throw err;
  }
};

/**
 * Customer query filter:
 * - ADMIN: only customers belonging to this admin's workspace (adminId: user.id or creatorId: user.id)
 * - AGENT: only customers under their admin workspace
 * - CUSTOMER: only their own customer record
 */
const getCustomerFilter = (user) => {
  if (!user) return { id: '__NONE__' };
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
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

/**
 * Loan query filter:
 * - ADMIN: only loans belonging to this admin's workspace
 * - AGENT: only loans under their admin workspace
 * - CUSTOMER: only their own loans
 */
const getLoanFilter = (user) => {
  if (!user) return { id: '__NONE__' };
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
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

/**
 * User / Staff query filter:
 * - ADMIN: sees ONLY their own user record and agents/users created in their workspace.
 *   CRITICAL: Never shows other admin credentials!
 * - AGENT: sees themselves and their admin workspace
 */
const getUserFilter = (user) => {
  if (!user) return { id: '__NONE__' };
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    return {
      OR: [
        { id: user.id },
        { adminId: user.id },
        { creatorId: user.id }
      ],
      NOT: {
        AND: [
          { role: 'ADMIN' },
          { id: { not: user.id } }
        ]
      }
    };
  }
  if (user.role === 'AGENT') {
    const adminId = user.adminId;
    if (adminId) {
      return {
        OR: [
          { id: user.id },
          { id: adminId },
          { adminId }
        ]
      };
    }
    return { id: user.id };
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
