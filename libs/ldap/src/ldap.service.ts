import { Injectable } from '@nestjs/common';
import * as ldap from 'ldapjs';
import * as process from "process";
import * as assert from "assert";
import * as crypto from "crypto";

@Injectable()
export class LdapService {
  private readonly userBaseDN: string;
  private readonly groupBaseDN: string;
  private readonly ldapUsername: string;
  private readonly ldapPassword: string;
  private readonly defaultGroups: string[];

  private client: ldap.Client;

  constructor() {
    this.userBaseDN = process.env.LDAP_USER_BASEDN;
    this.groupBaseDN = process.env.LDAP_GROUP_BASEDN;
    this.ldapUsername = process.env.LDAP_USERNAME;
    this.ldapPassword = process.env.LDAP_PASSWORD;
    this.defaultGroups = process.env.LDAP_DEFAULT_USER_GROUPS.split(',')

    this.client = ldap.createClient({ url: process.env.LDAP_URL });

    this.start();
  }

  async createUser(user) {
    const username = `${user.firstName}.${user.lastName}`;
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
      homeDirectory: `/home/users/${username.toLowerCase()}`,
      userPassword: passwordHash,
      title: 'unknown',
      objectClass: ["posixAccount", "top", "inetOrgPerson"],
    };

    return new Promise((resolve, reject) => {
      this.client.add(userDN, userData, (err) => {
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

  async getUserMaxUidNumber(): Promise<number> {
    const searchOpts = {
      scope: 'sub',
      filter: '(objectClass=posixAccount)', // фільтр для пошуку користувачів
      attributes: ['uidNumber'], // атрибут, значення якого будуть отримані
    };

    return new Promise((resolve, reject) => {
      let maxUidNumber = 0;

      this.client.search(this.userBaseDN, searchOpts, (err, res) => {
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
    const change = new ldap.Change({
      operation: 'add',
      modification: new ldap.Attribute({
        type: 'uniqueMember',
        values: [userDN]
      })
    });

    await this.client.modify(groupDN, change, (err) => {
      if (err) {
        throw new Error(err)
      }
    });
  }

  start() {
    this.client.bind(this.ldapUsername, this.ldapPassword, (err) => {
      assert.ifError(err);
    });
  }
}
