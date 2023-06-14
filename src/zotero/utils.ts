import XRegExp from 'xregexp';
// @ts-ignore
import ucs2decode from 'punycode2/ucs2/decode';

import { skipWords } from '../settings/Preferences';
import { Creator } from './ZoteroItem';

type Names = {
    firstName: string,
    lastName: string,
    fullName: string,
}

export function stripQuotes(name: string): string {
    if (!name) return '';

    if (name.length >= 2 && name[0] === '"' && name[name.length - 1] === '"')
        return name.slice(1, -1);

    return name;
}

export function titleWords(
    title: string,
    options: {
        transliterate?: boolean,
        skipWords?: boolean,
    } = {},
): string[] {
    const regExp = '[\\p{L}\\p{Nd}\\{Pc}\\p{M}]+(-[\\p{L}\\p{Nd}\\{Pc}\\p{M}]+)*'
    let words: string[] = XRegExp.matchChain(title, [XRegExp(regExp, 'g')])
        .map((word: string) => word.replace(/-/g, ''))
        .filter((word: string) =>
            word
            && !(options.skipWords
            && ucs2decode(word).length === 1)
        );

    if (options.skipWords) {
        words = words.filter(
            (word: string) => !skipWords.has(word.toLowerCase())
        );
    }

    return words
}

export function normalizeName(creator: Creator) : Names {
    const names : Names = {
        firstName: creator.firstName || '',
        lastName: creator.lastName || '',
        fullName: creator.name || '',
    }

    if (creator.name && (!creator.firstName || !creator.lastName)) {
        const delimiter = creator.name.indexOf(' ');
        names.firstName = creator.name.substring(0, delimiter + 1).trim();
        names.lastName = creator.name.substring(delimiter).trim();
        names.fullName = creator.name;
    } else {
        names.fullName = `${names.firstName} ${names.lastName}`;
    }

    return names;
}