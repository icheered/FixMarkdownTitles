import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Command to toggle auto-format on save
    let toggleAutoFormatCommand = vscode.commands.registerCommand('markdownTitleFormatter.toggleMarkdownTitleAutoFormat', () => {
        const config = vscode.workspace.getConfiguration('markdownTitleFormatter');
        const currentValue = config.get<boolean>('autoFormatOnSave', false);
        config.update('autoFormatOnSave', !currentValue, vscode.ConfigurationTarget.Global);

        const newState = currentValue ? 'disabled' : 'enabled';
        vscode.window.showInformationMessage(`Markdown auto-format on save ${newState}`);
    });

    // Register document save event listener
    let onSaveListener = vscode.workspace.onWillSaveTextDocument(event => {
        if (event.document.languageId === 'markdown') {
            const config = vscode.workspace.getConfiguration('markdownTitleFormatter');
            const autoFormatEnabled = config.get<boolean>('autoFormatOnSave', false);

            if (autoFormatEnabled) {
                const edit = formatAllTitlesInDocument(event.document);
                if (edit) {
                    event.waitUntil(Promise.resolve([edit]));
                }
            }
        }
    });

    context.subscriptions.push(toggleAutoFormatCommand);
    context.subscriptions.push(onSaveListener);
}

function formatAllTitlesInDocument(document: vscode.TextDocument): vscode.TextEdit | null {
    const edits: vscode.TextEdit[] = [];
    const lineCount = document.lineCount;

    for (let i = 0; i < lineCount - 2; i++) {
        // Check for pattern: empty line, title line, underline line, empty line
        const prevLine = i > 0 ? document.lineAt(i - 1) : null;
        const titleLine = document.lineAt(i);
        const underlineLine = document.lineAt(i + 1);
        const nextLine = i + 2 < lineCount ? document.lineAt(i + 2) : null;

        // Check if this matches our title pattern
        if (isTitlePattern(prevLine, titleLine, underlineLine, nextLine)) {
            const titleText = titleLine.text.trim();
            const underlineText = underlineLine.text.trim();

            // Determine if it should be = or - based on existing underline
            const underlineChar = underlineText.startsWith('=') ? '=' : '-';
            const correctUnderline = underlineChar.repeat(titleText.length);

            // Check if we need to make changes
            const needsTitleTrim = titleLine.text !== titleText;
            const needsUnderlineFix = underlineText !== correctUnderline;

            if (needsTitleTrim || needsUnderlineFix) {
                // Replace both title and underline lines
                const replaceRange = new vscode.Range(
                    titleLine.range.start,
                    underlineLine.range.end
                );
                const newText = `${titleText}\n${correctUnderline}`;
                edits.push(vscode.TextEdit.replace(replaceRange, newText));
            }
        }
    }

    // Return a single edit that combines all changes
    if (edits.length > 0) {
        // Create a WorkspaceEdit to combine all the individual edits
        const combinedEdit = new vscode.WorkspaceEdit();
        edits.forEach(edit => {
            combinedEdit.replace(document.uri, edit.range, edit.newText);
        });

        // Apply the combined edit
        vscode.workspace.applyEdit(combinedEdit);
    }

    return null; // We handle the edit application ourselves
}

function isTitlePattern(
    prevLine: vscode.TextLine | null,
    titleLine: vscode.TextLine,
    underlineLine: vscode.TextLine,
    nextLine: vscode.TextLine | null
): boolean {
    // Check if previous line is empty (or we're at the start)
    const prevEmpty = !prevLine || prevLine.text.trim().length === 0;

    // Check if title line has content
    const titleHasContent = titleLine.text.trim().length > 0;

    // Check if underline line contains only = or - characters
    const underlineText = underlineLine.text.trim();
    const isValidUnderline = underlineText.length > 0 && /^[=\-]+$/.test(underlineText);

    // Check if next line is empty (or we're at the end)
    const nextEmpty = !nextLine || nextLine.text.trim().length === 0;

    return prevEmpty && titleHasContent && isValidUnderline && nextEmpty;
}

export function deactivate() { }