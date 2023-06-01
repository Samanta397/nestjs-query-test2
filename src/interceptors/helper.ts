export const isQueryForMultipleEntity = (queryName) => {
  return queryName === 'users' || queryName === 'roles' || queryName === 'permissions'
}

export const isQueryForSimpleEntity = (queryName) => {
  return queryName === 'user' || queryName === 'role' || queryName === 'permission'
}

export const isRelationsMutation = (queryName) => {
  return queryName === 'addPermissionsToUser' || queryName === 'setPermissionsOnUser' || queryName === 'addRolesToUser' || queryName === 'setRolesOnUser';
}

export const relationsLogging = (queryName, ids, roleService, permissionService) => {
  if (queryName === 'addPermissionsToUser' || queryName === 'setPermissionsOnUser' ) {
   return getEntityNames(ids, permissionService)
      .then(data => {
        return {
          entity: 'permissions',
          entityNames: data
        }
      })
  }

  if (queryName === 'addRolesToUser' || queryName === 'setRolesOnUser' ) {
    return getEntityNames(ids, roleService)
      .then(data => {
        return {
          entity: 'roles',
          entityNames: data
        }
      })
  }
}


export const getEntityNames = (ids, service) => {
  return Promise.all(
    ids.map(id => service.getAdditionalInfo(id))
  ).then(results => {
    return results
  })
}