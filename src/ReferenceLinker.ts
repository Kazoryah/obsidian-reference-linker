import { Plugin } from 'obsidian';
import { ZoteroAdapter } from './zotero/ZoteroAdapter'
import { ReferenceLinkerSettingTab } from './settings/ReferenceLinkerSettingTab';
import { PluginSettings, DEFAULT_SETTINGS } from './settings/ReferenceLinkerSettings';
import { LinkerModal } from './LinkerModal';


export class ReferenceLinker extends Plugin {
    settings: PluginSettings
    zoteroAdapter: ZoteroAdapter
    
    async onload(): Promise<void> {
        await this.loadSettings();

        this.zoteroAdapter = new ZoteroAdapter(this.settings.zoteroBridgeSettings)

		this.addSettingTab(new ReferenceLinkerSettingTab(this.app, this));

        this.addCommand({
            id: 'list-references',
            name: 'List references',
            callback: () => {
                new LinkerModal(this.app, this).open()
            }
        })

        // TODO: add command to load annotations in current page
        // TODO: allows choosing file name/path for annotation loading
    }

    onunload(): void {
    }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
