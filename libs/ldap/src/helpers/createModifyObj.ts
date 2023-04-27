import * as ldap from 'ldapjs';

export const createModifyObj = (operation, obj) => {
  return new ldap.Change({
    operation: operation,
    modification: new ldap.Attribute(obj)
  });
}