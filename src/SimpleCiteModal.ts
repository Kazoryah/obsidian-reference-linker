import { App, SuggestModal } from 'obsidian';
import { ZoteroItem } from './zotero/ZoteroItem';
import { ReferenceLinker } from './ReferenceLinker';

export class SimpleCiteModal extends SuggestModal<ZoteroItem> {
    plugin: ReferenceLinker;

    constructor(app: App, plugin: ReferenceLinker) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() {
        const { inputEl } = this;

        inputEl.empty();
    }

    onClose() {
        const { inputEl } = this;
        inputEl.empty();
    }

    renderSuggestion(reference: ZoteroItem, el: HTMLElement) {
        el.createEl("div", { text: reference.getTitle() });
        el.createEl("small", { text: reference.getAuthors() });
    }

    getSuggestions(query: string): ZoteroItem[] | Promise<ZoteroItem[]> {
        return this.plugin.zoteroAdapter.searchEverything(query)
            .then((items: ZoteroItem[]) =>
                Object.fromEntries(items.map(x => [x.getCiteKey(), x]))
            )
            .then((items) => Object.values(items));
    }
    
    private newFilePath(citeKey: string) : string {
        return `${this.plugin.settings.referenceNotesFolder}/${citeKey}.md`
    }

    private fileExists(newFilePath: string) : boolean {
        return this.app.vault.getFiles().filter(
            file => file.path == newFilePath
        ).length > 0
    }

    async onChooseSuggestion(item: ZoteroItem, evt: MouseEvent | KeyboardEvent) {
        let content = item.getCiteKey();
        const editor = this.app.workspace.activeEditor?.editor
        const currentFile = this.app.workspace.getActiveFile()
        
        if (currentFile === null || editor === undefined) return;

        const newFilePath = this.newFilePath(item.getCiteKey());
        if (this.fileExists(newFilePath)) {
            content = `[[${newFilePath}|[@${content}]]]`;
        }
        else {
            content =  `[@${content}]`;
        }

        editor.replaceRange(
            content,
            {
                line: editor.getCursor().line,
                ch: editor.getCursor().ch,
            },
        );

        editor.setCursor({
            line: editor.getCursor().line,
            ch: editor.getCursor().ch + content.length,
        })
    }
}
