/**
 * CodePTIT Helper - Download Module
 * Handles testcase file downloads
 */

CPH.Download = (() => {
  'use strict';

  /**
   * Trigger download of a text file
   */
  const downloadFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
  };

  /**
   * Download input.txt and output.txt for all testcases
   */
  const downloadTestcases = () => {
    const testcases = CPH.Parser.getTestcases();
    if (!testcases.length) return false;

    const code = CPH.Parser.getCodeFromTitle() || 'problem';

    if (testcases.length === 1) {
      downloadFile(`${code}_input.txt`, testcases[0].input);
      downloadFile(`${code}_output.txt`, testcases[0].output);
    } else {
      testcases.forEach((tc, idx) => {
        downloadFile(`${code}_input_${idx + 1}.txt`, tc.input);
        downloadFile(`${code}_output_${idx + 1}.txt`, tc.output);
      });
    }
    return true;
  };

  /**
   * Download problem as a zip (uses JSZip if available, otherwise individual files)
   */
  const downloadProblemPack = () => {
    const data = CPH.Parser.getProblemData();
    if (!data.code) return false;

    // Download individual files
    downloadFile(`${data.code}_problem.md`, data.markdown || data.text);

    const testcases = data.testcases;
    if (testcases.length) {
      testcases.forEach((tc, idx) => {
        const suffix = testcases.length > 1 ? `_${idx + 1}` : '';
        downloadFile(`${data.code}_input${suffix}.txt`, tc.input);
        downloadFile(`${data.code}_output${suffix}.txt`, tc.output);
      });
    }

    return true;
  };

  return {
    downloadFile,
    downloadTestcases,
    downloadProblemPack,
  };
})();
