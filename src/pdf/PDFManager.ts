import { loadPdfJs} from 'obsidian';
import * as fs from 'fs';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { ReferenceLinker } from '../ReferenceLinker';
import { extractHighlight } from './utils';

interface Highlight {
    text: string;
    color: string;
}

// function rgbToHex(color: number[]) {
//     const [red, green, blue] = color
//     const rgb = (red << 16) | (green << 8) | (blue << 0);
//     return '#' + (0x1000000 + rgb).toString(16).slice(1);
// }

function rgbToRgba(color: number[]) {
    const [red, green, blue] = color
    return `rgba(${red}, ${green}, ${blue}, 0.5)`
}

export interface Annotation {
    highlight: Highlight,
    author: string,
    modificationDate: string, // https://www.verypdf.com/pdfinfoeditor/pdf-date-format.htm
    page: number,
}

export class PDFManager {
    plugin: ReferenceLinker

    constructor(plugin: ReferenceLinker) {
        this.plugin = plugin;
    }

    async getHighlights(basename: string) : Promise<Annotation[]> {
        const reader = fs.readFileSync(
            `${this.plugin.settings.PDFFolder}/${basename}.pdf`
        )
        const loader = await loadPdfJs();
        const pdf : PDFDocumentProxy = await loader.getDocument(reader).promise

        const parsedAnnotations : Annotation[] = []

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
                parsedAnnotations.push({
                    highlight: {
                        color: rgbToRgba(annotation.color),
                        text: highlightedText,
                    },
                    modificationDate: annotation.modificationDate,
                    author: annotation.titleObj.str,
                    page: i,
                })
            }
        }

        return parsedAnnotations;
    }
}