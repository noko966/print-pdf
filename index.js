function attachStyleForPDF() {
    return new Promise((resolve, reject) => {
        let lnk = document.createElement('link');
        let antiCache = Date.now();
        lnk.setAttribute('href', `./print_styles.css?${antiCache}`)
        lnk.setAttribute('id', 'create-pdf')
        lnk.setAttribute('rel', 'stylesheet')
        lnk.setAttribute('type', 'text/css');

        lnk.onload = resolve;
        lnk.onerror = reject;

        document.head.appendChild(lnk);
    });
}

function removePdfStyle() {
    let lnk = document.getElementById('create-pdf');
    lnk.remove();
}


function extractContent (){
    let content = [];


    function traverseNodes(node) {

        if (checkForTextNodeAndAct(node)) {
            //console.log(node.innerText);
            txt = node.innerText;
;            content.push({ type: 'text', text: node.innerText.trim() });
            return;
        }

        if (node.hasChildNodes()) {
            node.childNodes.forEach(traverseNodes);
        }


    }

    // Initialize traversal from the given element
    traverseNodes(element);

    return content;
}

function createPDF() {
    attachStyleForPDF();
    var contentTag = document.getElementById('content');
    var doc = new window.jspdf.jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    })

    const selectedFont = "Helvetica"; // Standard font
    const selectedFontSize = 12; // Example font size in points
    doc.setFont(selectedFont);
    doc.setFontSize(selectedFontSize);

    const content = extractContent(contentTag);


    console.log(content)


    // Calculate the width of the text area (A4 width - margins)
    const marginLeft = 10;
    const marginRight = 10;
    const pageWidth = 210; // A4 width in mm
    const textWidth = pageWidth - marginLeft - marginRight;

    let startY = 10; // Initialize startY for the first line
    const lineHeight = 10; // Line height in mm
    const paragraphSpacing = 4; // Additional space between paragraphs in mm
    content.forEach(item => {
        if (item.type === 'text') {
            let cleanedText = item.text.replace(/[^\x20-\x7E\t\r]+|\n+/g, ' ').replace(/[ ]+/g, ' ');
            const lines = doc.splitTextToSize(cleanedText, textWidth);

            lines.forEach((line, index) => {
                // Check space before adding text, consider moving to new page only if it's the first line of a new paragraph
                if (startY + lineHeight > 297 - 20 && index === 0) {
                    doc.addPage(); // Add a new page
                    startY = 10; // Reset startY for the new page
                }
                if (index === 0 || startY + lineHeight <= 297 - 20) { // Add line if it's the first line or if it fits
                    doc.text(line, marginLeft, startY);
                    startY += lineHeight; // Move startY down for the next line
                }
            });

            if (startY + lineHeight <= 297 - 20) { // Only add paragraph spacing if the next line fits
                startY += paragraphSpacing; // Add extra spacing after each paragraph
            }
        } else if (item.type === 'image') {
            // Scale image to fit page width while maintaining aspect ratio
            let w = 190; // Width to fit content area
            let h = w * item.height / item.width; // Scaled height to maintain aspect ratio

            // Check if adding an image would overflow the page, considering the scaled height
            if (startY + h > 297 - 20) {
                doc.addPage(); // Add a new page
                startY = 10; // Reset startY for the new page
            }

            // Add the image within the current context (current page or new page if overflowed)
            doc.addImage(item.src, 'PNG', marginLeft, startY, w, h);
            startY += h + paragraphSpacing; // Move startY down after the image and add some spacing
        }
    });


    // Save the PDF
    doc.save('text-a4.pdf');

    removePdfStyle(); // Placeholder for your existing function
}