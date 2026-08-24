const fs = require('fs');
const PdfPrinter = require('pdfmake');

// Setup pdfmake fonts
const fonts = {
  Roboto: {
    normal: 'node_modules/pdfmake/build/vfs_fonts.js' // We need actual TTF files or just use standard fonts.
  }
};
// Wait, pdfmake requires TTF files for server-side generation.
// Let's use the standard fonts that pdfmake supports out of the box if possible, or use pdfkit directly which supports standard PDF fonts without TTF files.
// Actually, pdfmake by default requires Roboto TTF files to be provided when used in Node.js.
// Let's switch back to `pdfkit` since it has built-in standard fonts (Helvetica, Times, Courier) and is much easier to use in Node without fetching TTF files!
