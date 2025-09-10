class PDFConverter {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.worker = null;
        // Load OpenAI API key from localStorage
        this.openaiApiKey = localStorage.getItem('openaiApiKey') || '';
        // Load branding configuration
        this.rfqCounter = this.getRfqCounter();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.processingSection = document.getElementById('processingSection');
        this.resultSection = document.getElementById('resultSection');
        this.errorSection = document.getElementById('errorSection');
        this.processingStatus = document.getElementById('processingStatus');
        this.progressFill = document.getElementById('progressFill');
        this.textPreview = document.getElementById('textPreview');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.newFileBtn = document.getElementById('newFileBtn');
        this.retryBtn = document.getElementById('retryBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.templateRadios = document.querySelectorAll('input[name="template"]');
        
        // RFQ number input
        this.rfqNumberInput = document.getElementById('rfqNumberInput');
        this.setRfqNumberBtn = document.getElementById('setRfqNumberBtn');
        
        
        // Store templates
        this.dleTemplate = this.getBuiltInDLETemplate();
        this.sosTemplate = null; // Will be loaded dynamically when needed
        this.customRfqNumber = null;
        this.htmlTemplate = null;
    }

    setupEventListeners() {
        // Upload area events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));

        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/pdf') {
                this.handleFileSelect(file);
            }
        });

        // Button events
        this.downloadBtn.addEventListener('click', () => this.downloadResult());
        this.newFileBtn.addEventListener('click', () => this.resetApp());
        this.retryBtn.addEventListener('click', () => this.resetApp());
        
        // RFQ number setting
        this.setRfqNumberBtn.addEventListener('click', () => this.setCustomRfqNumber());

        // Load saved settings
        this.loadSavedSettings();
    }

    loadSavedSettings() {
        // Load custom RFQ number
        const savedRfqNumber = localStorage.getItem('customRfqNumber');
        if (savedRfqNumber) {
            this.customRfqNumber = savedRfqNumber;
            this.rfqNumberInput.value = savedRfqNumber;
        }
    }


    getRfqCounter() {
        const counter = localStorage.getItem('rfqCounter');
        return counter ? parseInt(counter) : 1;
    }

    incrementRfqCounter() {
        this.rfqCounter++;
        localStorage.setItem('rfqCounter', this.rfqCounter.toString());
        return this.rfqCounter;
    }

    getSelectedTemplate() {
        const selected = document.querySelector('input[name="template"]:checked');
        const template = selected ? selected.value : 'DLE';
        console.log('Selected template:', template);
        return template;
    }

    generateRfqNumber(company) {
        if (this.customRfqNumber) {
            return this.customRfqNumber;
        }
        const year = new Date().getFullYear();
        const counter = this.incrementRfqCounter();
        return `${company}-RFQ-${year}-${counter.toString().padStart(4, '0')}`;
    }

    getCurrentDate() {
        return new Date().toLocaleDateString('en-US');
    }

    getDueDate() {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 10);
        return dueDate.toLocaleDateString('en-US');
    }

    getBuiltInDLETemplate() {
        return `=== RFQ DLE - REQUEST FOR QUOTATION ===
RFQ Number: {RFQ_NUMBER}
Creation Date: {CREATION_DATE}
Due Date: {DUE_DATE}
===============================================

GENERAL INFORMATION:
Company: DLE
RFQ Number: {RFQ_NUMBER}
Creation Date: {CREATION_DATE}
Due Date: {DUE_DATE}
Status: PENDING

1. Scope of Supply:

{TABLE_DATA}

REQUEST DETAILS:
Product/Service: {PRODUCT}
Quantity: {QUANTITY}
Specifications: {SPECIFICATIONS}
Budget Range: {BUDGET}
Delivery Date: {DUE_DATE}

PROCESSED ORIGINAL TEXT:
{EXTRACTED_TEXT}

===============================================
Auto-generated document - DLE
Company standard format
===============================================`;
    }

    async getBuiltInSOSTemplate() {
        try {
            console.log('Loading SOS template from reference file...');

            // Try to load the reference template file
            const response = await fetch('./rfq_dynamic_templateSOS_html.html');
            if (response.ok) {
                const templateContent = await response.text();
                console.log('Successfully loaded SOS reference template');
                console.log('Template length:', templateContent.length, 'characters');
                return templateContent;
            } else {
                console.warn('Failed to load reference template, using fallback template');
                return this.getFallbackSOSTemplate();
            }
        } catch (error) {
            console.warn('Error loading reference template:', error);
            console.log('Using fallback SOS template');
            return this.getFallbackSOSTemplate();
        }
    }

    getFallbackSOSTemplate() {
        // Fallback template in case the reference file can't be loaded
        return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Request for Quotation – Dynamic Template</title>
  <style>
    :root {
      --accent: #0f172a;
      --muted: #64748b;
      --border: #e2e8f0;
      --bg: #ffffff;
      --brand: #1f2937;
    }
    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      margin: 0;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
      color: #0b1020;
      background: var(--bg);
      line-height: 1.4;
    }
    .sheet { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 18mm; background: white; border: 1px solid var(--border); position: relative; }
    header.brand { display: grid; grid-template-columns: 96px 1fr; gap: 16px; align-items: center; border-bottom: 2px solid var(--border); padding-bottom: 12px; margin-bottom: 16px; }
    header .logo { width: 96px; height: 96px; object-fit: contain; border-radius: 8px; border: 1px solid var(--border); background:#fff; }
    .brand-block h1 { margin: 0; font-size: 20px; letter-spacing: .2px; color: var(--brand); }
    .brand-block .meta { color: var(--muted); font-size: 12px; margin-top: 2px; }
    .actions { text-align: right; margin-bottom: 8px; }
    .btn { display: inline-block; border: 1px solid var(--border); padding: 6px 10px; border-radius: 8px; background:#f8fafc; cursor: pointer; font-size: 12px; }
    .rfq-title { text-align: center; margin: 12px 0 6px; }
    .rfq-title h2 { margin: 0; font-size: 22px; letter-spacing: .3px; }
    .subnote { text-align: center; font-size: 12px; color: var(--muted); margin-bottom: 6px; }
    .due { text-align: right; font-size: 12px; margin: 6px 0 10px; }
    .section-title { margin: 16px 0 8px; font-size: 16px; border-bottom: 2px solid var(--border); padding-bottom: 4px; }
    .items th, .items td { border: 1px solid var(--border); padding: 6px 8px; }
    .items thead th { background: #f8fafc; }
    .signoff { margin-top: 24px; }
    .signoff .company { font-weight: 700; }
    .signature-img { width: 85mm; height: auto; object-fit: contain; display:block; margin: 6mm 0 2mm; }
    footer { border-top: 2px solid var(--border); margin-top: 20px; padding-top: 8px; font-size: 11px; color: var(--muted); display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 8px; }
    .footer-qr { width: 20mm; height: auto; object-fit: contain; justify-self: end; }
    @media print { body { background: white; } .sheet { border: none; box-shadow: none; } .actions { display: none !important; } @page { size: A4; margin: 14mm; }  } .sheet { border: none; box-shadow: none; } .actions { display: none !important; } @page { size: A4; margin: 14mm; } }
  </style>
</head>
<body>
  <div class="actions">
    <button class="btn" onclick="window.print()">Download as PDF</button>
  </div>

  <article class="sheet" id="document">
    <header class="brand">
      <img id="logo" class="logo" alt="Company Logo" src="https://lh3.googleusercontent.com/d/1cirv2ggrxg98gbkIn2XFPRZhfvMk3u4w?t=123456789" />
      <div class="brand-block">
        <h1 data-field="company_name">Superb Oil Stream and Services Ltd. (SOS)</h1>
        <div class="meta">
          <span data-field="company_address">Ferris Building No.1 Floor 1 Triq San Luqa, G'Mangia Pieta. PTA 1020 – Malta</span>
        </div>
      </div>
    </header>

    <div class="rfq-title">
      <h2>REQUEST FOR QUOTATION No. <span data-field="rfq_number">{RFQ_NUMBER}</span></h2>
    </div>
    <div class="subnote">(This is not a purchase order)</div>
    <div class="due">Due Date: <strong><span data-field="due_date">{DUE_DATE}</span></strong></div>

    <h3 class="section-title">Scope of Supply</h3>
    <table class="items">
      <thead>
        <tr><th>ID</th><th>Description</th><th>U.M</th><th>Qty</th><th>Note</th></tr>
      </thead>
      <tbody id="items-body">{TABLE_DATA}</tbody>
    </table>

    <div class="signoff">
      <p>Yours sincerely,</p>
      <p class="company">Superb Oil and Stream Service LTD</p>
      <!-- Signature above the title -->
      <img id="signature_img" class="signature-img" src="https://drive.google.com/thumbnail?id=12KeRfpOvajA6uZ5KmAC7vcVuBzcF3iLl&t=123456789" alt="Signature Sabri" />
      <p><span data-field="signatory_title">Managing Director</span></p>
      <p><span data-field="signatory_name">Sabri Rezk</span></p>
    </div>
    <!-- Seal fixed at bottom-right -->


    <footer>
      <div>
        <strong>Superb Oil Stream and Services Ltd. (SOS)</strong><br/>
        <span>Ferris Building No.1 Floor 1 Triq San Luqa, G'Mangia Pieta. PTA 1020 – Malta</span>
      </div>
      <!-- QR placed in footer (right side) -->
      <img id="qr_img" class="footer-qr" src="https://lh3.googleusercontent.com/d/1lHXE3ni-JXLEmQXk02oT3ZR6lXbn3-0Z?t=123456789" alt="QR Code" />
    </footer>
  </article>

  <script>
    function setImageWithFallback(imgEl, url){
      if(!imgEl || !url) return;
      var m = url.match(/\/d\/([\\w-]+)/) || url.match(/[?&]id=([\\w-]+)/);
      var id = m ? m[1] : null;
      var candidates = id ? [
        'https://drive.google.com/uc?export=view&id=' + id,
        'https://drive.google.com/thumbnail?id=' + id + '&sz=w2000',
        'https://drive.google.com/uc?export=download&id=' + id
      ] : [url];
      var i = 0;
      function next(){ if(i >= candidates.length) return; imgEl.onerror = function(){ i++; next(); }; imgEl.src = candidates[i]; }
      next();
    }

    (function(){
      var DEFAULT_ASSETS = {
        logo_url: 'https://drive.google.com/file/d/1cirv2ggrxg98gbkIn2XFPRZhfvMk3u4w/view?usp=sharing',
        signature_url: 'https://drive.google.com/file/d/12KeRfpOvajA6uZ5KmAC7vcVuBzcF3iLl/view?usp=sharing',
        seal_url: 'https://drive.google.com/file/d/1VjTDdhUVZ5LUqViRJ0rvAPrRdk03AMpa/view?usp=sharing',
        qr_url: 'https://drive.google.com/file/d/1lHXE3ni-JXLEmQXk02oT3ZR6lXbn3-0Z/view?usp=sharing'
      };
      window.RFQ_DATA = Object.assign({}, DEFAULT_ASSETS, window.RFQ_DATA || {});

      setImageWithFallback(document.getElementById('logo'), window.RFQ_DATA.logo_url);
      setImageWithFallback(document.getElementById('signature_img'), window.RFQ_DATA.signature_url);
      setImageWithFallback(document.getElementById('seal_img'), window.RFQ_DATA.seal_url);
      setImageWithFallback(document.getElementById('qr_img'), window.RFQ_DATA.qr_url);
    })();
  </script>
</body>
</html>`;
    }



    setCustomRfqNumber() {
        const rfqNumber = this.rfqNumberInput.value.trim();
        if (rfqNumber) {
            this.customRfqNumber = rfqNumber;
            localStorage.setItem('customRfqNumber', rfqNumber);
            this.rfqNumberInput.style.borderColor = '#4CAF50';
            alert('RFQ number set successfully!');
        } else {
            alert('Please enter a valid RFQ number');
        }
    }




    async readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsArrayBuffer(file);
        });
    }


    async handleFileSelect(file) {
        if (!file || file.type !== 'application/pdf') {
            this.showError('Please select a valid PDF file.');
            return;
        }

        this.showProcessing();
        this.updateProgress(0, 'Starting processing...');

        try {
            // Initialize PDF.js worker
            if (!this.worker) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }

            // Read file as array buffer
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            this.updateProgress(20, 'Loading PDF...');

            // Load PDF document
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            this.updateProgress(40, 'Extracting text from PDF...');

            // Extract text from all pages
            let extractedText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                extractedText += pageText + '\n';
                this.updateProgress(40 + (i / pdf.numPages) * 30, `Processing page ${i} of ${pdf.numPages}...`);
            }

            // Check if text extraction was successful
            if (extractedText.trim().length < 50) {
                this.updateProgress(70, 'Insufficient text detected, applying OCR...');
                extractedText = await this.performOCR(file);
            }

            this.updateProgress(90, 'Improving extraction with AI...');
            
            // Use OpenAI to improve and structure the extracted text
            const improvedText = await this.improveTextWithAI(extractedText);
            
            this.updateProgress(95, 'Reformatting to standard format...');
            
            // Format text according to company standards
            const company = this.getSelectedTemplate();
            const formattedText = await this.formatToCompanyStandard(improvedText, company);
            
            this.updateProgress(100, 'Processing completed');
            
            // Store the formatted text for download
            this.formattedText = formattedText;
            this.selectedCompany = company;
            
            // Show result
            setTimeout(() => {
                this.showResult(formattedText, company);
            }, 500);

        } catch (error) {
            console.error('Error processing PDF:', error);
            this.showError('Error processing PDF. Please try with another file.');
        }
    }

    async performOCR(file) {
        try {
            this.updateProgress(75, 'Initializing OCR...');
            
            // Convert PDF to images for OCR
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // For simplicity, we'll use a basic approach
            // In a real implementation, you'd convert PDF pages to images first
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            let ocrText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                this.updateProgress(75 + (i / pdf.numPages) * 15, `Applying OCR to page ${i}...`);
                
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });
                
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                await page.render({
                    canvasContext: ctx,
                    viewport: viewport
                }).promise;
                
                // Convert canvas to image data for OCR
                const imageData = canvas.toDataURL('image/png');
                
                // Use Tesseract.js for OCR
                const { data: { text } } = await Tesseract.recognize(imageData, 'eng', {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            this.updateProgress(75 + (i / pdf.numPages) * 15, `OCR: ${Math.round(m.progress * 100)}%`);
                        }
                    }
                });
                
                ocrText += text + '\n';
            }
            
            return ocrText;
        } catch (error) {
            console.error('OCR Error:', error);
            throw new Error('Error in OCR processing');
        }
    }

    async improveTextWithAI(text) {
        try {
            // If no API key provided, skip API call and return cleaned text
            if (!this.openaiApiKey) {
                return text.replace(/\s+/g, ' ').trim();
            }
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an assistant specialized in extracting and structuring information from PDF documents. Your task is to clean, organize and structure the extracted text to make it easy to read and process. Extract key information such as: products/services, quantities, specifications, dates, prices, and any relevant data. Organize the information in a clear and structured way. When you find products or items, list them with their quantities and specifications. Be very specific about product descriptions and names.'
                        },
                        {
                            role: 'user',
                            content: `Please process and structure the following text extracted from a PDF. Extract all products/items with their quantities and specifications. For each item, provide a clear description, quantity, and unit of measure:\n\n${text}`
                        }
                    ],
                    max_tokens: 2000,
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                throw new Error('OpenAI API error');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI Error:', error);
            // If OpenAI fails, return the original cleaned text
            return text.replace(/\s+/g, ' ').trim();
        }
    }

    async formatToCompanyStandard(text, company) {
        const rfqNumber = this.generateRfqNumber(company);
        const currentDate = this.getCurrentDate();
        const dueDate = this.getDueDate();
        
        // Use built-in template - SOS uses HTML template, DLE uses text template
        if (company === 'SOS') {
            console.log('Using SOS template...');
            // Load SOS template if not already loaded
            if (!this.sosTemplate) {
                console.log('Loading SOS template...');
                this.sosTemplate = await this.getBuiltInSOSTemplate();
            } else {
                console.log('Using cached SOS template');
            }
            console.log('SOS template length:', this.sosTemplate ? this.sosTemplate.length : 'null');
            return this.formatWithHtmlTemplate(text, rfqNumber, currentDate, dueDate, company, this.sosTemplate);
        } else {
            console.log('Using DLE template...');
            return this.formatWithCustomTemplate(text, rfqNumber, currentDate, dueDate, company, this.dleTemplate);
        }
    }

    formatWithHtmlTemplate(text, rfqNumber, currentDate, dueDate, company, htmlTemplate) {
        // Extract structured data and create table
        const structuredData = this.extractStructuredData(text);
        const tableData = this.createScopeTable(text);
        
        // Replace placeholders in the HTML template with actual values
        let formattedHtml = htmlTemplate
            .replace(/\{RFQ_NUMBER\}/g, rfqNumber)
            .replace(/\{CREATION_DATE\}/g, currentDate)
            .replace(/\{DUE_DATE\}/g, dueDate)
            .replace(/\{COMPANY\}/g, company)
            .replace(/\{EXTRACTED_TEXT\}/g, text)
            .replace(/\{TABLE_DATA\}/g, tableData)
            .replace(/\{PRODUCT\}/g, structuredData.product || 'To be specified')
            .replace(/\{QUANTITY\}/g, structuredData.quantity || 'To be specified')
            .replace(/\{SPECIFICATIONS\}/g, structuredData.specifications || 'To be specified')
            .replace(/\{BUDGET\}/g, structuredData.budget || 'To be specified');
        
        return formattedHtml;
    }


    formatWithCustomTemplate(text, rfqNumber, currentDate, dueDate, company, template) {
        // Extract structured data and create table
        const structuredData = this.extractStructuredData(text);
        const tableData = this.createScopeTable(text);
        
        // Replace placeholders in the template with actual values
        let formattedText = template
            .replace(/\{RFQ_NUMBER\}/g, rfqNumber)
            .replace(/\{CREATION_DATE\}/g, currentDate)
            .replace(/\{DUE_DATE\}/g, dueDate)
            .replace(/\{COMPANY\}/g, company)
            .replace(/\{EXTRACTED_TEXT\}/g, text)
            .replace(/\{TABLE_DATA\}/g, tableData);
        
        // Add structured data if template doesn't have it
        formattedText = formattedText.replace(/\{PRODUCT\}/g, structuredData.product || 'To be specified')
            .replace(/\{QUANTITY\}/g, structuredData.quantity || 'To be specified')
            .replace(/\{SPECIFICATIONS\}/g, structuredData.specifications || 'To be specified')
            .replace(/\{BUDGET\}/g, structuredData.budget || 'To be specified');
        
        return formattedText;
    }

    createScopeTable(text) {
        // Extract items from the text and create a table
        const items = this.extractItemsFromText(text);
        
        if (items.length === 0) {
            return `<tr>
                <td>1</td>
                <td>To be specified</td>
                <td>No</td>
                <td>-</td>
                <td></td>
            </tr>`;
        }
        
        let tableRows = '';
        
        items.forEach((item, index) => {
            const id = index + 1;
            const description = item.description || 'To be specified';
            const unit = item.unit || 'No';
            const quantity = item.quantity || '-';
            const note = item.note || '';
            
            tableRows += `
                <tr>
                    <td>${id}</td>
                    <td>${description}</td>
                    <td>${unit}</td>
                    <td>${quantity}</td>
                    <td>${note}</td>
                </tr>`;
        });
        
        return tableRows;
    }

    extractItemsFromText(text) {
        const items = [];
        
        // Split text into lines and look for product patterns
        const lines = text.split('\n');
        let currentItem = null;
        
        // First pass: look for clear product-quantity patterns
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Look for lines that contain both description and quantity
            const productQuantityMatch = line.match(/(.+?)\s+(\d+)\s*(pcs?|units?|pieces?|each|ea|no|nos?|kg|kgm|m|meters?|ft|feet|in|inches?|cm|mm|liter|liters?|gal|gallon|lb|lbs|pound|pounds?)/i);
            
                if (productQuantityMatch) {
                const description = productQuantityMatch[1].trim();
                const quantity = productQuantityMatch[2];
                const unit = productQuantityMatch[3] || 'No';
                
                // Clean up description
                const cleanDescription = description.replace(/[^\w\s\-\.]/g, '').trim();
                
                if (cleanDescription.length > 3) {
                    items.push({
                        description: cleanDescription,
                        unit: unit,
                        quantity: quantity,
                        note: ''
                    });
                }
            }
        }
        
        // Second pass: look for separate quantity and description lines
        if (items.length === 0) {
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Look for quantity patterns
                const quantityMatch = line.match(/(\d+)\s*(pcs?|units?|pieces?|each|ea|no|nos?|kg|kgm|m|meters?|ft|feet|in|inches?|cm|mm|liter|liters?|gal|gallon|lb|lbs|pound|pounds?)/i);
                
                if (quantityMatch) {
                    const quantity = quantityMatch[1];
                    const unit = quantityMatch[2] || 'No';
                    
                    // Look for description in previous or next lines
                    let description = 'To be specified';
                    
                    // Check previous line
                    if (i > 0) {
                        const prevLine = lines[i - 1].trim();
                        if (prevLine.length > 5 && prevLine.length < 100 && !prevLine.match(/^\d+$/) && !prevLine.match(/^[A-Z\s]+$/)) {
                            description = prevLine.replace(/[^\w\s\-\.]/g, '').trim();
                        }
                    }
                    
                    // Check next line if previous didn't work
                    if (description === 'To be specified' && i < lines.length - 1) {
                        const nextLine = lines[i + 1].trim();
                        if (nextLine.length > 5 && nextLine.length < 100 && !nextLine.match(/^\d+$/) && !nextLine.match(/^[A-Z\s]+$/)) {
                            description = nextLine.replace(/[^\w\s\-\.]/g, '').trim();
                        }
                    }
                    
                    if (description !== 'To be specified') {
                        items.push({
                            description: description,
                            unit: unit,
                            quantity: quantity,
                            note: ''
                        });
                    }
                }
            }
        }
        
        // Third pass: look for any remaining product-like descriptions
        if (items.length === 0) {
            const productKeywords = ['laptop', 'computer', 'mouse', 'keyboard', 'monitor', 'cable', 'adapter', 'charger', 'battery', 'printer', 'scanner', 'tablet', 'phone', 'headset', 'speaker', 'camera', 'software', 'license', 'service', 'support', 'maintenance', 'installation', 'training'];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (line.length > 10 && line.length < 100) {
                    const lowerLine = line.toLowerCase();
                    const hasProductKeyword = productKeywords.some(keyword => lowerLine.includes(keyword));
                    
                    if (hasProductKeyword) {
                        items.push({
                            description: line.replace(/[^\w\s\-\.]/g, '').trim(),
                            unit: 'No',
                            quantity: '-',
                            note: ''
                        });
                    }
                }
            }
        }
        
        // If still no items found, create a default one
        if (items.length === 0) {
            items.push({
                description: 'To be specified',
                unit: 'No',
                quantity: '-',
                note: ''
            });
        }
        
        return items;
    }

    formatDLE(text, rfqNumber, currentDate, dueDate) {
        // Specific format for DLE
        const structuredData = this.extractStructuredData(text);
        const tableData = this.createScopeTable(text);
        
        return `=== RFQ DLE - REQUEST FOR QUOTATION ===
RFQ Number: ${rfqNumber}
Creation Date: ${currentDate}
Due Date: ${dueDate}
===============================================

GENERAL INFORMATION:
${this.createTable([
    ['RFQ Number', rfqNumber],
    ['Company', 'DLE'],
    ['Creation Date', currentDate],
    ['Due Date', dueDate],
    ['Status', 'PENDING']
])}

1. Scope of Supply:

${tableData}

REQUEST DETAILS:
${this.createTable([
    ['Product/Service', structuredData.product || 'To be specified'],
    ['Quantity', structuredData.quantity || 'To be specified'],
    ['Specifications', structuredData.specifications || 'To be specified'],
    ['Budget Range', structuredData.budget || 'To be specified'],
    ['Delivery Date', structuredData.delivery || dueDate]
])}

PROCESSED ORIGINAL TEXT:
${text}

===============================================
Auto-generated document - DLE
Company standard format
===============================================`;
    }

    formatSOS(text, rfqNumber, currentDate, dueDate) {
        // Specific format for SOS
        const structuredData = this.extractStructuredData(text);
        const tableData = this.createScopeTable(text);
        
        return `=== RFQ SOS - REQUEST FOR QUOTATION ===
RFQ Number: ${rfqNumber}
Creation Date: ${currentDate}
Due Date: ${dueDate}
===============================================

GENERAL INFORMATION:
${this.createTable([
    ['RFQ Number', rfqNumber],
    ['Company', 'SOS'],
    ['Creation Date', currentDate],
    ['Due Date', dueDate],
    ['Status', 'PENDING']
])}

1. Scope of Supply:

${tableData}

REQUEST DETAILS:
${this.createTable([
    ['Product/Service', structuredData.product || 'To be specified'],
    ['Quantity', structuredData.quantity || 'To be specified'],
    ['Specifications', structuredData.specifications || 'To be specified'],
    ['Budget Range', structuredData.budget || 'To be specified'],
    ['Delivery Date', structuredData.delivery || dueDate]
])}

PROCESSED ORIGINAL TEXT:
${text}

===============================================
Auto-generated document - SOS
Company standard format
===============================================`;
    }

    extractStructuredData(text) {
        // Extract structured information from text using patterns
        const data = {};
        
        // Search for quantities
        const quantityMatch = text.match(/(\d+)\s*(pcs?|units?|pieces?)/i);
        if (quantityMatch) {
            data.quantity = quantityMatch[0];
        }
        
        // Search for products/services (common keywords)
        const productKeywords = ['product', 'service', 'item', 'material', 'equipment', 'component'];
        for (const keyword of productKeywords) {
            const regex = new RegExp(`${keyword}[\\s:]+([^\\n\\r]{10,50})`, 'i');
            const match = text.match(regex);
            if (match) {
                data.product = match[1].trim();
                break;
            }
        }
        
        // Search for specifications
        const specKeywords = ['specification', 'detail', 'requirement', 'description', 'spec'];
        for (const keyword of specKeywords) {
            const regex = new RegExp(`${keyword}[\\s:]+([^\\n\\r]{20,100})`, 'i');
            const match = text.match(regex);
            if (match) {
                data.specifications = match[1].trim();
                break;
            }
        }
        
        // Search for budget
        const budgetMatch = text.match(/(\$|€|USD|EUR|GBP)[\\s]*([\\d,]+)/i);
        if (budgetMatch) {
            data.budget = budgetMatch[0];
        }
        
        return data;
    }

    createTable(rows) {
        let table = '<table class="rfq-table">\n';
        rows.forEach(row => {
            table += `  <tr>\n    <th>${row[0]}</th>\n    <td>${row[1]}</td>\n  </tr>\n`;
        });
        table += '</table>';
        return table;
    }

    updateProgress(percentage, status) {
        this.progressFill.style.width = `${percentage}%`;
        this.processingStatus.textContent = status;
    }

    showProcessing() {
        this.uploadArea.style.display = 'none';
        this.resultSection.style.display = 'none';
        this.errorSection.style.display = 'none';
        this.processingSection.style.display = 'block';
    }

    showResult(text, company) {
        this.processingSection.style.display = 'none';
        this.resultSection.style.display = 'block';
        
        // Show RFQ information
        const rfqNumber = this.generateRfqNumber(company);
        const currentDate = this.getCurrentDate();
        const dueDate = this.getDueDate();
        
        // Create preview with structured information
        let preview;
        if (company === 'SOS') {
            // For SOS (HTML template), show the actual HTML content
            preview = `
                <div class="rfq-info">
                    <h4>📋 RFQ Generated: ${rfqNumber}</h4>
                    <p><strong>Company:</strong> ${company}</p>
                    <p><strong>Creation Date:</strong> ${currentDate}</p>
                    <p><strong>Due Date:</strong> ${dueDate}</p>
                </div>
                <div class="text-preview" style="border: 1px solid #ddd; padding: 0; background: white; max-height: 460px; overflow-y: auto;">
                    <div id="sosEditor" contenteditable="true" style="min-height:420px; outline: none;"></div>
                    <div style="display:flex; gap:8px; padding:8px; border-top:1px solid #eee; background:#fafafa;">
                        <button id="applyHtmlChanges" class="btn btn-primary">Apply changes</button>
                        <span style="font-size:12px; color:#666;">You can edit the HTML above before downloading.</span>
                    </div>
                </div>
            `;
        } else {
            // For DLE (text template), show text preview
            preview = `
                <div class="rfq-info">
                    <h4>📋 RFQ Generated: ${rfqNumber}</h4>
                    <p><strong>Company:</strong> ${company}</p>
                    <p><strong>Creation Date:</strong> ${currentDate}</p>
                    <p><strong>Due Date:</strong> ${dueDate}</p>
                </div>
                <div class="text-preview">
                    ${text.replace(/\n/g, '<br>').substring(0, 2000)}${text.length > 2000 ? '...' : ''}
                </div>
            `;
        }
        
        this.textPreview.innerHTML = preview;

        // If SOS, load the HTML into the live editor and wire Apply button
        if (company === 'SOS') {
            const editor = document.getElementById('sosEditor');
            if (editor) {
                editor.innerText = text;
            }
            const applyBtn = document.getElementById('applyHtmlChanges');
            if (applyBtn) {
                applyBtn.addEventListener('click', () => {
                    const edited = editor ? editor.innerText : text;
                    // Save edited HTML as the content to be downloaded
                    this.formattedText = edited;
                    alert('Changes applied. Now you can download as PDF/HTML.');
                });
            }
        }
    }

    showError(message) {
        this.processingSection.style.display = 'none';
        this.resultSection.style.display = 'none';
        this.errorSection.style.display = 'block';
        this.errorMessage.textContent = message;
    }

    downloadResult() {
        if (!this.formattedText) return;
        
        const company = this.getSelectedTemplate();
        const rfqNumber = this.generateRfqNumber(company);
        
        // If using SOS (HTML template) or custom template, generate PDF and HTML
        if (company === 'SOS' || this.customTemplate) {
            this.downloadHtmlAsPdf(this.formattedText, company, rfqNumber);
        } else {
            // Fallback to Word document for DLE
            this.downloadWordDocument(this.formattedText, company, rfqNumber);
        }
        
        // Always create HTML document for backup
        let htmlContent;
        if (company === 'SOS') {
            // For SOS, use the formatted template directly (already complete HTML)
            console.log('Downloading SOS template HTML - using formatted template directly');
            htmlContent = this.formattedText;
        } else {
            // For DLE, create a new HTML document wrapper
            console.log('Downloading DLE template HTML - wrapping in HTML document');
            htmlContent = this.createHTMLDocument(this.formattedText, company, rfqNumber);
        }
        
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${rfqNumber}_RFQ.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    createHTMLDocument(content, company, rfqNumber) {
        const headerText = 'Request for Quotation';
        const footerText = `Auto-generated document - ${company} | Company standard format`;
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RFQ ${rfqNumber}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #667eea;
            margin-bottom: 10px;
        }
        .info-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .info-section h3 {
            color: #667eea;
            margin-bottom: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }
        th {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            font-weight: 600;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        tr:hover {
            background: #f8f9fa;
        }
        tr:last-child td {
            border-bottom: none;
        }
        .scope-table {
            margin: 20px 0;
        }
        .scope-table table {
            border: 1px solid #ddd;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 0.9rem;
        }
        pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            white-space: pre-wrap;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${headerText}</h1>
        <p>RFQ ${rfqNumber} | Company: ${company} | Generated: ${new Date().toLocaleDateString()}</p>
        <div style="clear:both;"></div>
    </div>
    
    <div class="content">
        ${this.formatContentForHTML(content)}
    </div>
    
    <div class="footer">
        <p>Auto-generated document - ${company} | Company standard format</p>
    </div>
</body>
</html>`;
    }

    formatContentForHTML(content) {
        // Convert markdown-style tables to HTML tables
        let htmlContent = content;
        
        // Convert markdown tables to HTML
        const tableRegex = /\|(.+?)\|/g;
        const tables = content.match(/\|.*\|/g);
        
        if (tables) {
            tables.forEach(table => {
                const rows = table.split('\n').filter(row => row.trim().includes('|'));
                if (rows.length > 1) {
                    let htmlTable = '<table class="scope-table">\n';
                    
                    rows.forEach((row, index) => {
                        const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
                        if (cells.length > 0) {
                            if (index === 0) {
                                // Header row
                                htmlTable += '  <thead>\n    <tr>\n';
                                cells.forEach(cell => {
                                    htmlTable += `      <th>${cell}</th>\n`;
                                });
                                htmlTable += '    </tr>\n  </thead>\n';
                            } else if (index === 1) {
                                // Skip separator row
                                return;
                            } else {
                                // Data row
                                if (index === 2) {
                                    htmlTable += '  <tbody>\n';
                                }
                                htmlTable += '    <tr>\n';
                                cells.forEach(cell => {
                                    htmlTable += `      <td>${cell}</td>\n`;
                                });
                                htmlTable += '    </tr>\n';
                            }
                        }
                    });
                    
                    htmlTable += '  </tbody>\n</table>';
                    htmlContent = htmlContent.replace(table, htmlTable);
                }
            });
        }
        
        // Convert line breaks to HTML
        htmlContent = htmlContent.replace(/\n/g, '<br>');
        
        return htmlContent;
    }

    async downloadWordDocument(content, company, rfqNumber) {
        try {
            // Create a proper Word document using the built-in template
            const template = company === 'DLE' ? this.dleTemplate : this.sosTemplate;
            
            // Use the template structure and replace placeholders
            const processedContent = this.formatWithCustomTemplate(
                content, 
                rfqNumber, 
                this.getCurrentDate(), 
                this.getDueDate(), 
                company, 
                template
            );
            
            // Create a proper Word document using HTML that Word can read
            const wordContent = this.createProperWordDocument(processedContent, company, rfqNumber);
            
            const blob = new Blob([wordContent], { 
                type: 'application/msword' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${rfqNumber}_RFQ.doc`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error creating Word document:', error);
            // Fallback to HTML download
            this.downloadHTMLVersion(content, company, rfqNumber);
        }
    }

    // Debug function to test PDF generation
    async testPdfGeneration() {
        console.log('=== PDF GENERATION TEST ===');

        const testHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Test</title>
                <style>body { font-family: Arial; padding: 20px; }</style>
            </head>
            <body>
                <h1>PDF Test</h1>
                <p>This is a simple test.</p>
            </body>
            </html>
        `;

        try {
            const container = document.createElement('div');
            container.innerHTML = testHtml;
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            document.body.appendChild(container);

            const opt = {
                margin: 10,
                filename: 'TEST_PDF.pdf',
                html2canvas: { scale: 1 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(container).save();
            document.body.removeChild(container);

            console.log('✅ PDF test successful!');
            alert('PDF test passed! Basic PDF generation works.');
        } catch (error) {
            console.error('❌ PDF test failed:', error);
            alert('PDF test failed. Check console for details.');
        }
    }

    async downloadHtmlAsPdf(htmlContent, company, rfqNumber) {
        try {
            console.log('Starting PDF generation for:', rfqNumber);
            console.log('HTML content length:', htmlContent.length);
            console.log('First 500 characters:', htmlContent.substring(0, 500));

            // Create a simple container and inject the HTML directly
            const container = document.createElement('div');
            container.innerHTML = htmlContent;
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '-9999px';
            container.style.width = '800px'; // Fixed width for PDF
            container.style.backgroundColor = '#ffffff';
            document.body.appendChild(container);

            console.log('Container created and added to DOM');

            // Wait for images to load
            const images = container.querySelectorAll('img');
            console.log('Found', images.length, 'images to wait for');

            if (images.length > 0) {
                await Promise.all(Array.from(images).map(img => {
                    return new Promise((resolve) => {
                        if (img.complete && img.naturalHeight > 0) {
                            console.log('Image already loaded:', img.src);
                            resolve();
                        } else {
                            img.onload = () => {
                                console.log('Image loaded:', img.src);
                                resolve();
                            };
                            img.onerror = () => {
                                console.warn('Image failed to load:', img.src);
                                resolve(); // Don't block PDF generation
                            };
                            // Timeout after 5 seconds
                            setTimeout(resolve, 5000);
                        }
                    });
                }));
                console.log('All images processed');
            }

            // Wait a bit more for layout
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Find the main content element
            const mainElement = container.querySelector('#document') || container.querySelector('article') || container;
            console.log('Main element for PDF:', mainElement.tagName, mainElement.id);

            // Configure simple PDF options
            const opt = {
                margin: 15,
                filename: `${rfqNumber}_RFQ.pdf`,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: {
                    scale: 1,
                    useCORS: false,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    width: 794,
                    height: 1123
                },
                jsPDF: {
                    unit: 'px',
                    format: [794, 1123], // A4 dimensions
                    orientation: 'portrait'
                }
            };

            console.log('PDF options configured:', opt);
            console.log('Starting PDF generation...');

            await html2pdf().set(opt).from(mainElement).save();

            console.log('PDF generated successfully!');

            // Clean up
            document.body.removeChild(container);

        } catch (error) {
            console.error('PDF generation failed:', error);
            console.error('Error details:', error.message);

            // Last resort: try with minimal HTML
            try {
                console.log('Attempting minimal PDF fallback...');
                const minimalContainer = document.createElement('div');
                minimalContainer.innerHTML = `
                    <div style="font-family: Arial, sans-serif; padding: 40px; background: white;">
                        <h1 style="color: #333; margin-bottom: 20px;">RFQ ${rfqNumber}</h1>
                        <p style="font-size: 14px; color: #666;">Company: ${company}</p>
                        <p style="font-size: 14px; color: #666;">Generated: ${new Date().toLocaleString()}</p>
                        <p style="margin-top: 30px; font-size: 12px; color: #999;">PDF generation completed</p>
                    </div>
                `;
                minimalContainer.style.position = 'absolute';
                minimalContainer.style.left = '-9999px';
                minimalContainer.style.top = '-9999px';
                document.body.appendChild(minimalContainer);

                const minimalOpt = {
                    margin: 20,
                    filename: `${rfqNumber}_MINIMAL_RFQ.pdf`,
                    html2canvas: { scale: 1 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                await html2pdf().set(minimalOpt).from(minimalContainer).save();
                document.body.removeChild(minimalContainer);

                console.log('Minimal PDF fallback successful');
                alert('PDF generated with basic formatting. Full template PDF had issues.');

            } catch (minimalError) {
                console.error('Minimal PDF also failed:', minimalError);
                alert('PDF generation failed completely. HTML version downloaded instead.');
                this.downloadHTMLVersion(htmlContent, company, rfqNumber);
            }
        }
    }

    // Turn a full HTML string into a renderable container for html2pdf
    createPdfContainerFromHtml(htmlContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const container = document.createElement('div');
        container.style.width = '210mm';
        container.style.minHeight = '297mm';
        container.style.background = '#ffffff';

        // Collect inline styles from <head>
        const head = doc.querySelector('head');
        if (head) {
            const styleTags = head.querySelectorAll('style');
            if (styleTags.length > 0) {
                const mergedStyle = document.createElement('style');
                let cssText = '';
                styleTags.forEach(s => { cssText += s.textContent + '\n'; });
                mergedStyle.textContent = cssText;
                container.appendChild(mergedStyle);
            }
        }

        // Insert body content
        const body = doc.querySelector('body');
        if (body) {
            // Copy only the inner content of body
            const wrapper = document.createElement('div');
            wrapper.innerHTML = body.innerHTML;
            container.appendChild(wrapper);
        } else {
            // Fallback: use the raw content
            container.innerHTML = htmlContent;
        }

        return container;
    }

    downloadHTMLVersion(content, company, rfqNumber) {
        // Create an HTML version that can be opened in Word
        const htmlContent = this.createHTMLDocument(content, company, rfqNumber);
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${rfqNumber}_RFQ.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    createProperWordDocument(content, company, rfqNumber) {
        // Create a Word-compatible HTML document
        return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="UTF-8">
    <title>RFQ ${rfqNumber}</title>
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>90</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            margin: 1in;
            color: #000;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .info-section {
            margin: 20px 0;
        }
        .info-section h3 {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 10px;
            color: #000;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #000;
            font-size: 10pt;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>RFQ ${rfqNumber}</h1>
        <p>Company: ${company} | Generated: ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="content">
        ${this.formatContentForWord(content)}
    </div>
    
    <div class="footer">
        <p>Auto-generated document - ${company} | Company standard format</p>
    </div>
</body>
</html>`;
    }

    createWordDocument(content, company, rfqNumber) {
        return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="UTF-8">
    <title>RFQ ${rfqNumber}</title>
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>90</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            margin: 1in;
            color: #000;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .info-section {
            margin: 20px 0;
        }
        .info-section h3 {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 10px;
            color: #000;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #000;
            font-size: 10pt;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>RFQ ${rfqNumber}</h1>
        <p>Company: ${company} | Generated: ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="content">
        ${this.formatContentForWord(content)}
    </div>
    
    <div class="footer">
        <p>Auto-generated document - ${company} | Company standard format</p>
    </div>
</body>
</html>`;
    }

    formatContentForWord(content) {
        // Convert markdown-style tables to Word-compatible HTML tables
        let wordContent = content;
        
        // Convert markdown tables to HTML
        const tableRegex = /\|(.+?)\|/g;
        const tables = content.match(/\|.*\|/g);
        
        if (tables) {
            tables.forEach(table => {
                const rows = table.split('\n').filter(row => row.trim().includes('|'));
                if (rows.length > 1) {
                    let htmlTable = '<table>\n';
                    
                    rows.forEach((row, index) => {
                        const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
                        if (cells.length > 0) {
                            if (index === 0) {
                                // Header row
                                htmlTable += '  <tr>\n';
                                cells.forEach(cell => {
                                    htmlTable += `    <th>${cell}</th>\n`;
                                });
                                htmlTable += '  </tr>\n';
                            } else if (index === 1) {
                                // Skip separator row
                                return;
                            } else {
                                // Data row
                                htmlTable += '  <tr>\n';
                                cells.forEach(cell => {
                                    htmlTable += `    <td>${cell}</td>\n`;
                                });
                                htmlTable += '  </tr>\n';
                            }
                        }
                    });
                    
                    htmlTable += '</table>';
                    wordContent = wordContent.replace(table, htmlTable);
                }
            });
        }
        
        // Convert line breaks to HTML
        wordContent = wordContent.replace(/\n/g, '<br>');
        
        return wordContent;
    }

    resetApp() {
        this.uploadArea.style.display = 'block';
        this.processingSection.style.display = 'none';
        this.resultSection.style.display = 'none';
        this.errorSection.style.display = 'none';
        this.fileInput.value = '';
        this.formattedText = null;
        this.progressFill.style.width = '0%';
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PDFConverter();
});
