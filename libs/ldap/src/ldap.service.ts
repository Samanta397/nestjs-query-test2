import { Injectable } from '@nestjs/common';
import * as ldap from 'ldapjs';
import * as process from "process";
import * as assert from "assert";
import * as crypto from "crypto";
import {createModifyObj} from "@app/ldap/helpers/createModifyObj";

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

  async createUser(user) {
    const username = `${user.firstName}.${user.lastName}`.toLowerCase();
    const cn = `${user.firstName} ${user.lastName}`;
    const hash = crypto.createHash('md5').update(user.password).digest("hex");
    const passwordHash = `{MD5}${Buffer.from(hash, 'hex').toString('base64')}`;
    const uidNumber = await this.getUserMaxUidNumber();
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
            this.addUserToGroup(userDN, `cn=${group},${this.groupBaseDN}`)
          })

          resolve(uidNumber)
        }
      });
    })

  }

  async getUserByUUID(uuid) {
    let user = null;
    const searchOpts = {
      scope: 'sub',
      filter: `(uidNumber=${uuid})`,
    };

    const searchResult = await this.search(this.userBaseDN, searchOpts);

    // @ts-ignore
    user = searchResult.attributes.reduce((acc, propObj) => {
      acc[propObj.type] = propObj.values.length === 1 ? propObj.values[0] : propObj.values
      return acc
    }, {})

    return user;
  }

  async updateUserByUUID(uuid, updateObj) {
    const {cn} = await this.getUserByUUID(uuid);
    const userDN = `cn=${cn},${this.userBaseDN}`;
    const { lastName, phone } = updateObj;
    let snChangeObj = null;
    let mobileChangeObj = null;
    let changeObj = [];

    if (lastName) {
      snChangeObj = createModifyObj('replace', {
        type: 'sn',
        values: lastName
      })
      changeObj.push(snChangeObj)
    }

    if (phone) {
      mobileChangeObj = createModifyObj('replace', {
        type: 'mobile',
        values: phone
      })
      changeObj.push(mobileChangeObj)
    }

    await this.modify(userDN, changeObj)

    return await this.getUserByUUID(uuid);
  }

  async deleteUserByUUID(uuid) {
    const {cn} = await this.getUserByUUID(uuid);
    const userDN = `cn=${cn},${this.userBaseDN}`;

    this.ldapClient.del(userDN, function (err) {
      if (err) {
        throw new Error(err)
      }
    });
  }

  async getUserMaxUidNumber(): Promise<number> {
    const searchOpts = {
      scope: 'sub',
      filter: '(objectClass=posixAccount)', // фільтр для пошуку користувачів
      attributes: ['uidNumber'], // атрибут, значення якого будуть отримані
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

  async addUserToGroup(userDN, groupDN) {
    const changeObj = createModifyObj('add', {
      type: 'uniqueMember',
      values: [userDN]
    })

    await this.modify(groupDN, changeObj)
  }

  async search(searchBaseDN, searchOpts) {
    return new Promise((resolve, reject) => {
      this.ldapClient.search(searchBaseDN, searchOpts, (err, res) => {
        assert.ifError(err);

        res.on('searchEntry', function (entry) {
          resolve(entry.pojo);
        });

        res.on('error', function (err) {
          reject(err);
        });
      })
    });
  }

  async modify(modifyDN, changeOpts) {
    await this.ldapClient.modify(modifyDN, changeOpts, (err) => {
      if (err) {
        throw new Error(err)
      }
    });
  }



  start() {
    this.ldapClient.bind(this.ldapUsername, this.ldapPassword, (err) => {
      assert.ifError(err);
    });
  }
}
