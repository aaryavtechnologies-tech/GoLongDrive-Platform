// src/helpers/init.helper.js

const Role = require('../models/Role.model');
const Permission = require('../models/Permission.model');
const Admin = require('../models/Admin.model');

const defaultModules = ['Dashboard', 'Drivers', 'Customers', 'Bookings', 'Payments', 'Coupons', 'CMS', 'Reports', 'Settings', 'Roles'];
const defaultActions = ['create', 'read', 'update', 'delete', 'manage'];

const initializeSystem = async () => {
  try {
    // 1. Seed Permissions
    const permissionIds = [];
    for (const mod of defaultModules) {
      for (const action of defaultActions) {
        let perm = await Permission.findOne({ module: mod, action });
        if (!perm) {
          perm = await Permission.create({ module: mod, action, description: `Can ${action} ${mod}` });
        }
        permissionIds.push(perm._id);
      }
    }

    // 2. Seed Super Admin Role
    let superAdminRole = await Role.findOne({ name: 'Super Admin' });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: 'Super Admin',
        description: 'Has full access to all modules',
        isSystem: true,
        permissions: permissionIds
      });
      console.log('✅ Super Admin Role created');
    }

    // 3. Migrate existing Admins to Super Admin
    const adminsWithoutRole = await Admin.find({ roleId: { $exists: false } });
    for (const admin of adminsWithoutRole) {
      admin.roleId = superAdminRole._id;
      await admin.save({ validateBeforeSave: false });
    }
    if (adminsWithoutRole.length > 0) {
      console.log(`✅ Migrated ${adminsWithoutRole.length} existing admins to Super Admin role`);
    }

  } catch (error) {
    console.error('❌ System Initialization Failed:', error.message);
  }
};

module.exports = { initializeSystem };
