import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  // Register the command
  console.log('Congratulations, your extension "files-to-markdown" is now active!');
  const disposable = vscode.commands.registerCommand(
    'extension.exportSelectedFilesToMarkdown',
    async (uri: vscode.Uri, uris: vscode.Uri[]) => {
      try {
        vscode.window.showInformationMessage('Exporting files to markdown...');
        
        // Handle both single and multiple selection cases
        let filesToProcess: vscode.Uri[] = [];
        
        if (uri && uris && uris.length > 0) {
          // Context menu with multiple files selected
          filesToProcess = uris;
        } else if (uri) {
          // Context menu with single file
          filesToProcess = [uri];
        } else {
          // Command palette case - show file picker
          const selectedFiles = await getSelectedFiles();
          if (!selectedFiles || selectedFiles.length === 0) {
            vscode.window.showInformationMessage('No files selected.');
            return;
          }
          filesToProcess = selectedFiles;
        }

        // Prepare final markdown
        let markdownOutput = '';
        
        for (const fileUri of filesToProcess) {
          const relativePath = vscode.workspace.asRelativePath(fileUri);
          const fileContent = await fs.promises.readFile(fileUri.fsPath, 'utf-8');

          markdownOutput += `## ${relativePath}\n`;
          markdownOutput += '```\n' + fileContent + '\n```\n\n';
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
