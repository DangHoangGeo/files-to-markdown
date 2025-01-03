import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  // Register the command
  const disposable = vscode.commands.registerCommand(
    'extension.exportSelectedFilesToMarkdown',
    async (uriList: vscode.Uri[] | undefined) => {
      try {
        // If no uriList is provided, we can attempt to get the selected items from the Explorer
        if (!uriList || uriList.length === 0) {
          uriList = await getSelectedFiles();
        }

        if (!uriList || uriList.length === 0) {
          vscode.window.showInformationMessage('No files selected.');
          return;
        }

        // Prepare final markdown
        let markdownOutput = '';
        
        for (const fileUri of uriList) {
          const relativePath = vscode.workspace.asRelativePath(fileUri);
          const fileContent = await fs.promises.readFile(fileUri.fsPath, 'utf-8');

          markdownOutput += `## ${relativePath}\n`;
          markdownOutput += `\`\`\`\\n${fileContent}\n\`\`\`\n\n`;
        }

        // Create a new untitled document with the combined markdown content
        const doc = await vscode.workspace.openTextDocument({
          content: markdownOutput,
          language: 'markdown'
        });
        vscode.window.showTextDocument(doc);
      } catch (error: any) {
        vscode.window.showErrorMessage(`Error exporting files: ${error.message || error}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

/**
 * If the URIs are not passed in, attempt to get them from the Explorer's selected items.
 */
async function getSelectedFiles(): Promise<vscode.Uri[] | undefined> {
  const selectedResources = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: true,
    openLabel: 'Export these files to markdown'
  });

  return selectedResources;
}

export function deactivate() {
  // Cleanup if needed
}
