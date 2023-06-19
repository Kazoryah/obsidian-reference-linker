import { Annotation } from './pdf/PDFManager'

export function formatAnnotations(annotations: Annotation[]) : string {
    let render = "\n\n## Annotations\n\n";
    for (const annotation of annotations) {
        render += `<mark style="background: ${annotation.highlight.color};">`;
        render += `${annotation.highlight.text}</mark>`;
        render += `\n>_Page ${annotation.page}_\n\n`;
    }

    return render;
}