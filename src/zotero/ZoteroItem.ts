// https://github.dev/vanakat/zotero-bridge
// https://github.com/retorquere/zotero-better-bibtex/blob/master/content/key-manager/formatter.ts

import { sprintf } from 'sprintf-js'

import { titleWords, normalizeName, stripQuotes } from './utils'


type CreatorType = 'author' | 'contributor' | 'editor' | 'reviewedAuthor' | 'translator'

export type Creator = {
    creatorType: CreatorType,
    name?: string,
    firstName?: string,
    lastName?: string,
}

export interface ZoteroRawItem {
    itemType: string
    key: string
    title?: string
    creators?: Creator[]
    abstractNote?: string
    publicationTitle?: string
    volume?: string
    issue?: string
    pages?: string
    date?: string
    series?: string
    seriesTitle?: string
    seriesText?: string
    journalAbbreviation?: string
    language?: string
    DOI?: string
    ISSN?: string
    shortTitle?: string
    url?: string
    accessDate?: string
    archive?: string
    archiveLocation?: string
    libraryCatalog?: string
    callNumber?: string
    rights?: string
    extra?: string
    tags?: string[]
    collections?: string[]
}

export class ZoteroItem {
    raw: ZoteroRawItem;

    constructor(raw: ZoteroRawItem) {
        this.raw = raw;
    }
    
    getTitle() : string {
        return this.raw.title || '';
    }

    cleanTitle() : string {
        return titleWords(
            this.raw.title || "", { skipWords: false }
        ).join(' ');
    }

    getAuthors() : string {
        if (!this.raw.creators) return '';

        return this.raw.creators
            .filter(creator => creator.creatorType === 'author')
            .map(creator => normalizeName(creator).fullName)
            .join(", ");
    }

    private authorsList(template: string): string[] {
        if (!this.raw.creators) return [];

        return this.raw.creators
            .filter(creator => creator.creatorType === 'author')
            .map(normalizeName)
            .map(name => sprintf(template, {
                f: stripQuotes(name.lastName.split(' ').join('')),
            }))
    }
    
    firstAuthorFamilyName(n = 0): string {
        const family = n ? `%(f).${n}s` : '%(f)s';
        const authors = this.authorsList(family);

        return authors.first() || '';
    }

    getCiteKey() : string {
        const titleSplit = this.cleanTitle().split(' ');
        const firstWord = titleSplit[0].charAt(0).toUpperCase()
            + titleSplit[0].slice(1);

        const firstLetters = titleSplit.map(
            item => item.slice(0, 1).toUpperCase()
        ).slice(1, 3).join('');

        const date = new Date(this.raw.date || "")

        return this.firstAuthorFamilyName()
            + date.getFullYear()
            + firstWord
            + firstLetters
    }
}
