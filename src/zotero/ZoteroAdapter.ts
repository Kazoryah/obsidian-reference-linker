import { request, Notice } from 'obsidian';
import { ZoteroBridgeSettings } from '../settings/ZoteroBridgeSettings'
import { ZoteroItem } from './ZoteroItem';

export class ZoteroAdapter {
    settings: ZoteroBridgeSettings

    constructor(settings: ZoteroBridgeSettings) {
        this.settings = settings;
    }

    get baseUrl(): string {
        return `http://${this.settings.host}:${this.settings.port}/zotserver`;
    }

    public searchEverything(query: string) : Promise<ZoteroItem[]> {
        return this.search([{
            condition: 'quicksearch-everything',
            value: query
        }])
    }

    public search(conditions: any[]) : Promise<ZoteroItem[]> {
        return request({
            url: `${this.baseUrl}/search`,
            method: 'post',
            contentType: 'application/json',
            body: JSON.stringify(conditions)
        })
            .then(JSON.parse)
            .then((items: any[]) => items.filter(item => !['attachment', 'note'].includes(item.itemType)).map(item => new ZoteroItem(item)))
            .then((items: any[]) => items.reverse())
            .catch(() => {
                new Notice(`Couldn't connect to Zotero, please check the app is open and ZotServer is installed`);
                return [];
            });
    }
}
