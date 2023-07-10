import { Plugin } from 'obsidian';
import { ZoteroAdapter } from './zotero/ZoteroAdapter'
import { ReferenceLinkerSettingTab } from './settings/ReferenceLinkerSettingTab';
import { PluginSettings, DEFAULT_SETTINGS } from './settings/ReferenceLinkerSettings';
import { LinkerModal } from './LinkerModal';
import { ImportModal } from './ImportModal';
import { SimpleCiteModal } from './SimpleCiteModal';


export class ReferenceLinker extends Plugin {
    settings: PluginSettings
    zoteroAdapter: ZoteroAdapter
    
    async onload(): Promise<void> {
        await this.loadSettings();

        this.zoteroAdapter = new ZoteroAdapter(this.settings.zoteroBridgeSettings)

		this.addSettingTab(new ReferenceLinkerSettingTab(this.app, this));

        this.addCommand({
            id: 'list-references',
            name: 'List References',
            callback: () => {
                new LinkerModal(this.app, this).open();
            }
        })

        this.addCommand({
            id: 'import-annotations',
            name: "Import Annotations",
            editorCallback: () => {
                new ImportModal(this.app, this).open();
            }
        })
        
        this.addCommand({
            id: 'cite-simple-reference',
            name: "Cite Simple Reference",
            editorCallback: () => {
                new SimpleCiteModal(this.app, this).open();
            }
        })

        // TODO: allow choosing file name/path for annotation loading
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
