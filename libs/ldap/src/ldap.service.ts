import {Injectable} from '@nestjs/common';
import * as ldap from 'ldapjs';
import * as process from "process";
import * as assert from "assert";
import {getModifyObj} from "@app/ldap/utils/getModifyObj";
import {createHashPassword} from "@app/ldap/utils/createHashPassword";
import {getBinaryFileFromUrl} from "@app/ldap/utils/getBinaryFileFromUrl";

@Injectable()
export class LdapService {
  private readonly userBaseDN: string;
  private readonly groupBaseDN: string;
  private readonly ldapUsername: string;
  private readonly ldapPassword: string;
  private readonly defaultGroups: string[];

  private ldapClient: ldap.Client;

  constructor() {
    this.userBaseDN = process.env.LDAP_USER_BASEDN;
    this.groupBaseDN = process.env.LDAP_GROUP_BASEDN;
    this.ldapUsername = process.env.LDAP_USERNAME;
    this.ldapPassword = process.env.LDAP_PASSWORD;
    this.defaultGroups = process.env.LDAP_DEFAULT_USER_GROUPS.split(',')

    this.ldapClient = ldap.createClient({ url: process.env.LDAP_URL });

    this.start();
  }

  //create user
  async createUser(user) {
    const username = `${user.firstName}.${user.lastName}`.toLowerCase();
    const cn = `${user.firstName} ${user.lastName}`;
    const passwordHash = createHashPassword(user.password)
    const uidNumber = await this.getMaxUidNumber();
    const userDN = `cn=${cn},${this.userBaseDN}`;

    const userData = {
      cn: cn,
      sn: user.lastName,
      uid: username,
      givenName: user.firstName,
      mobile: user.phone,
      uidNumber: uidNumber,
      mail: `${username}@devit.group`,
      gidNumber: '500',
      homeDirectory: `/home/users/${username}`,
      userPassword: passwordHash,
      title: 'unknown',
      objectClass: ["posixAccount", "top", "inetOrgPerson"],
    };

    return new Promise((resolve, reject) => {
      this.ldapClient.add(userDN, userData, (err) => {
        if (err) {
          reject(err);
        } else {
          this.defaultGroups.forEach(group => {
            this.addUserToGroup(cn, group)
          })

          const user = this.getUser(uidNumber);
          resolve(user)
        }
      });
    })

  }

  //get user by uuid
  async getUser(uuid) {
    const searchOpts = {
      scope: 'sub',
      filter: `(uidNumber=${uuid})`,
    };

    const searchResult = await this.search(this.userBaseDN, searchOpts);

    return searchResult.reduce((acc, propObj) => {
      acc[propObj.type] = propObj.values.length === 1 ? propObj.values[0] : propObj.values
      return acc
    }, {})
  }

  //update user by uuid
  async updateUser(uuid, updateObj) {
    const {cn} = await this.getUser(uuid);
    const userDN = `cn=${cn},${this.userBaseDN}`;
    const { lastName, phone } = updateObj;

    const mutableArr = [
      {type: 'sn', values: lastName},
      {type: 'mobile', values: phone}
    ];

    const changeObj = getModifyObj('replace', mutableArr)

    await this.modify(userDN, changeObj)
    return await this.getUser(uuid);
  }

  //change user password
  async updateUserPassword(uuid, newPassword): Promise<boolean> {
    const {cn} = await this.getUser(uuid);
    const userDN = `cn=${cn},${this.userBaseDN}`;
    const newPasswordHash = createHashPassword(newPassword);

    const changeObj = getModifyObj('replace', {
      type: 'userPassword',
      values: newPasswordHash
    });

    await this.modify(userDN, changeObj)
    return await this.getUser(uuid);
  }

  //deactivate user (remove all groups and add to "deactivated" group)
  async deactivateUser(uuid): Promise<boolean> {
    const groups = await this.getUserGroups(uuid);
    const user = await this.getUser(uuid);

    groups.forEach(group => {
      this.deleteUserFromGroup(uuid, group)
    })

   return await this.addUserToGroup(user.cn, 'deactivated');
  }

  //restore user (add groups and remove from "deactivated" group)
  async restoreUser(uuid, groups): Promise<boolean> {
    const user = await this.getUser(uuid);

    groups.split(',').forEach(group => {
      this.addUserToGroup(user.cn, group)
    });

    return this.deleteUserFromGroup(uuid, 'deactivated');
  }

  //add user to group
  async addUserToGroup(userName, groupName): Promise<boolean> {
    const  userDN = `cn=${userName},${this.userBaseDN}`;
    const  groupDN = `cn=${groupName},${this.groupBaseDN}`;

    const changeObj = getModifyObj('add', {
      type: 'uniqueMember',
      values: [userDN]
    })

    return await this.modify(groupDN, changeObj)
  }

  //delete user from group
  async deleteUserFromGroup(uuid, groupName): Promise<boolean> {
    const {cn} = await this.getUser(uuid);
    const userDN = `cn=${cn},${this.userBaseDN}`;
    const groupDN = `cn=${groupName},${this.groupBaseDN}`

    const changeObj = getModifyObj('delete', {
      type: 'uniqueMember',
      values: userDN
    });

    return await this.modify(groupDN, changeObj);
  }

  //get all groups the user belongs to
  async getUserGroups(uuid): Promise<string[]> {
    const searchOpts = {
      scope: 'sub',
      filter: `(uidNumber=${uuid})`,
      attributes: ['memberOf']
    };

    const searchResult = await this.search(this.userBaseDN, searchOpts);

    return searchResult[0].values.reduce((acc, group) => {
      acc.push(group.split(',')[0].slice(3))
      return acc
    }, [])
  }

  //get all existing groups
  async getAllGroups(): Promise<string[]> {
    const searchOpts = {
      scope: 'sub',
      filter: '(objectClass=groupOfUniqueNames)',
      attributes: ['cn']
    };

    return new Promise((resolve, reject) => {
      let groupNames = [];
      this.ldapClient.search(this.groupBaseDN, searchOpts, (err, res) => {
        assert.ifError(err);

        res.on('searchEntry', function (entry) {
          groupNames.push(entry.pojo.attributes[0].values[0]);
        });

        res.on('error', function (err) {
          reject(err);
        });

        res.on('end', (result) => {
          if (result.status === 0) {
            resolve(groupNames);
          } else {
            reject(new Error(`LDAP search failed with result code ${result.status}`));
          }
        })
      })
    });
  }

  //get the highest value of uidNumber
  async getMaxUidNumber(): Promise<number> {
    const searchOpts = {
      scope: 'sub',
      filter: '(objectClass=posixAccount)',
      attributes: ['uidNumber'],
    };

    return new Promise((resolve, reject) => {
      let maxUidNumber = 0;

      this.ldapClient.search(this.userBaseDN, searchOpts, (err, res) => {
        assert.ifError(err);

        res.on('searchEntry', function (entry) {
          const uidNumber = parseInt(entry.pojo.attributes[0].values[0]);
          if (uidNumber > maxUidNumber) {
            maxUidNumber = uidNumber;
          }
        });

        res.on('error', function (err) {
          reject(err);
        });

        res.on('end', (result) => {
          if (result.status === 0) {
            resolve(maxUidNumber + 1);
          } else {
            reject(new Error(`LDAP search failed with result code ${result.status}`));
          }
        })
      })
    });
  }

  async addUserPhoto(uuid, url) {
    const {cn, description, jpegPhoto} = await this.getUser(uuid);
    const userDN = `cn=${cn},${this.userBaseDN}`;
    const modifyMethod = description ? 'replace' : 'add';
    const file = await getBinaryFileFromUrl(url);

    const mutableObj = [
      {
        type: 'description',
        values: url
      },
      {
        type: 'jpegPhoto',
        values: file
      }
    ]

    const changeObj = getModifyObj(modifyMethod, mutableObj);

    await this.modify(userDN, changeObj)
  }

  async search(searchBaseDN, searchOpts): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.ldapClient.search(searchBaseDN, searchOpts, (err, res) => {
        assert.ifError(err);

        res.on('searchEntry', function (entry) {
          resolve(entry.pojo.attributes);
        });

        res.on('error', function (err) {
          reject(err);
        });
      })
    });
  }

  async modify(modifyDN, changeOpts): Promise<boolean> {
    return await this.ldapClient.modify(modifyDN, changeOpts, (err) => !err);
  }

  start() {
    this.ldapClient.bind(this.ldapUsername, this.ldapPassword, (err) => {
      assert.ifError(err);
    });
  }
}
