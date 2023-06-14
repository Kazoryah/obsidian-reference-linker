import { App, Notice, SuggestModal, TFile, loadPdfJs} from 'obsidian';
import { ZoteroItem } from './zotero/ZoteroItem';
import * as njk from 'nunjucks';
import { DateTime } from 'luxon';
import { ReferenceLinker } from './ReferenceLinker';
import * as fs from 'fs';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { extractHighlight } from './utils';

export class LinkerModal extends SuggestModal<ZoteroItem> {
    plugin: ReferenceLinker;
    template: TFile;
    _env: njk.Environment;

    constructor(app: App, plugin: ReferenceLinker) {
        super(app);
        this.plugin = plugin;
        this.updateTemplate();

        this._env = new njk.Environment();
        this._env.addFilter('dateFormat', (input: string, format: string) => {
            const datetime = DateTime.fromJSDate(new Date(input));
            return datetime.toFormat(format);
        });
        this._env.addFilter('remove', (input: string, chars: string[]) => {
            chars.forEach(char => input = input.replace(char, ""));
            return input;
        });
    }

    updateTemplate() {
        // TODO: do something when empty list
        this.template = this.app.vault.getFiles().filter(
            file => file.path === this.plugin.settings.templatePath
        )[0];
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
        return this.plugin.zoteroAdapter.searchEverything(query);
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
        const content = await this.app.vault.read(this.template);
        const render = this._env.renderString(content, {
            ...item.raw,
            authors: item.getAuthors(),
            citeKey: item.getCiteKey(),
        });

        const newFilePath = this.newFilePath(item.getCiteKey());
        if (this.fileExists(newFilePath)) {
            // TODO only go to file
            new Notice("File already exists!");
            return;
        }

        this.app.vault.create(newFilePath, render);
        this.app

        const reader = fs.readFileSync(
            `${this.plugin.settings.PDFFolder}/${item.getCiteKey()}.pdf`
        )
        const loader = await loadPdfJs();
        const pdf : PDFDocumentProxy = await loader.getDocument(reader).promise

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            let annotations = await page.getAnnotations();
            const content = await page.getTextContent();  // default: no MarkedContent
            const items = <TextItem[]>content.items;
            items.sort(function (a1, a2) {							
                if (a1.transform[5] > a2.transform[5]) return -1    // y coord. descending
                if (a1.transform[5] < a2.transform[5]) return 1
                if (a1.transform[4] > a2.transform[4]) return 1    // x coord. ascending
                if (a1.transform[4] < a2.transform[4]) return -1				
                return 0
            })

            annotations = annotations.filter(
                ann => ann.subtype == "Highlight"
            )

            for (const annotation of annotations) {
                const highlightedText = extractHighlight(annotation, items)
                console.log(highlightedText)
                console.log(annotation.color)
                console.log(annotation.creationDate)
                console.log(annotation.id)
                console.log(annotation.modificationDate)
            }
        }
    }
}
