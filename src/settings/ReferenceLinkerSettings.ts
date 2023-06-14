import { ZoteroBridgeSettings, DEFAULT_SETTINGS as ZOTERO_BRIDGE_DEFAULT_SETTINGS } from './ZoteroBridgeSettings';

export interface PluginSettings {
    zoteroBridgeSettings: ZoteroBridgeSettings;
    templatePath: string;
    referenceNotesFolder: string;
    PDFFolder: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
    templatePath: "",
    zoteroBridgeSettings: ZOTERO_BRIDGE_DEFAULT_SETTINGS,
    referenceNotesFolder: "",
    PDFFolder: "",
}
