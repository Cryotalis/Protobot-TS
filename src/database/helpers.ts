import { database } from './database.js';

export function isContributor(userID: string) {
    return Boolean(database.contributors.find(user => user.get('id') === userID))
}

export function isBlacklisted(userID: string) {
    return Boolean(database.blacklist.find(user => user.get('id') === userID))
}