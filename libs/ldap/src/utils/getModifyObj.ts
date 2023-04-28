import * as ldap from 'ldapjs';

export const getModifyObj = (operation, obj) => {

  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (item.values) {
        return getModifyObj(operation, item)
      }
    })
  }

  return new ldap.Change({
    operation: operation,
    modification: new ldap.Attribute(obj)
  });
}
