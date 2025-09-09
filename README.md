# 📋 RFQ Converter

A professional web application that converts client PDF RFQs into your company's standard format using AI processing and integrated HTML templates.

## 🚀 Features

- **🏢 Built-in Company Templates**: DLE and SOS formats integrated
- **🤖 AI-Powered Processing**: OpenAI integration for enhanced text extraction
- **📄 Professional Output**: High-quality PDFs with company branding
- **🔍 OCR Technology**: Handles both scanned and digital PDFs
- **📊 Automatic Table Generation**: Extracts products and creates structured tables
- **🎨 Company Branding**: Logo, signature, and corporate styling preserved

## 📁 Files

- `index.html` - Main application interface
- `script.js` - Core application logic with AI processing
- `styles.css` - Application styling
- `rfq_dynamic_templateSOS_html.html` - Professional SOS template
- `template_example.txt` - Example template with placeholders
- `FINAL_INSTRUCTIONS.md` - Complete usage instructions

## 🎯 Quick Start

### 1. **Open Application**
```bash
# Open index.html in your browser
open index.html
```

### 2. **Select Company**
- **SOS** (Recommended): Professional HTML template with logo and signature
- **DLE**: Standard text-based format

### 3. **Process PDF**
1. Upload client's RFQ PDF
2. Wait for AI processing
3. Download professional PDF and HTML

## 🏢 Company Templates

### **SOS Template (Recommended)**
- ✅ **Professional HTML Design**: Logo, signature, QR code
- ✅ **Company Branding**: Superb Oil Stream and Services Ltd.
- ✅ **Automatic Table**: ID, Description, U.M, Qty, Note
- ✅ **PDF Output**: High-quality, print-ready
- ✅ **Malta Address**: Complete company information

### **DLE Template**
- ✅ **Standard Format**: Text-based template
- ✅ **Word Compatible**: .doc format output
- ✅ **HTML Backup**: Always available

## 🔧 Configuration

### **OpenAI API Key (Optional)**
- **Purpose**: Enhanced text processing
- **Storage**: Local browser storage
- **Benefit**: Better product extraction and structuring

### **Custom RFQ Number**
- **Format**: `SOS-RFQ-2025-0001`
- **Automatic**: Generated if not specified
- **Storage**: Saved for future use

### **Branding Options**
- **Logo**: Upload company logo
- **Header/Footer**: Custom text
- **Storage**: Local browser storage

## 📊 Template Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{RFQ_NUMBER}` | RFQ number |
| `{CREATION_DATE}` | Creation date |
| `{DUE_DATE}` | Due date (+10 days) |
| `{COMPANY}` | Company name |
| `{TABLE_DATA}` | Product table (HTML) |
| `{EXTRACTED_TEXT}` | Full extracted text |
| `{PRODUCT}` | Product/service |
| `{QUANTITY}` | Quantity |
| `{SPECIFICATIONS}` | Specifications |
| `{BUDGET}` | Budget range |

## 🎨 SOS Template Features

```
┌─────────────────────────────────────┐
│ [LOGO] Superb Oil Stream and        │
│        Services Ltd. (SOS)          │
│        Malta Address                │
├─────────────────────────────────────┤
│        REQUEST FOR QUOTATION        │
│              No. {RFQ_NUMBER}       │
│        Due Date: {DUE_DATE}         │
├─────────────────────────────────────┤
│ Scope of Supply                     │
│ ┌─────┬─────────────┬─────┬─────┬───┐ │
│ │ ID  │ Description │ U.M │ Qty │Note│ │
│ ├─────┼─────────────┼─────┼─────┼───┤ │
│ │ 1   │ {TABLE_DATA}│     │     │   │ │
│ └─────┴─────────────┴─────┴─────┴───┘ │
├─────────────────────────────────────┤
│ Yours sincerely,                    │
│ Superb Oil and Stream Service LTD   │
│ [SIGNATURE]                         │
│ Managing Director                   │
│ Sabri Rezk                          │
├─────────────────────────────────────┤
│ Company Info        [QR CODE]       │
└─────────────────────────────────────┘
```

## 🔧 Technologies Used

- **PDF.js**: PDF text extraction
- **Tesseract.js**: OCR for scanned documents
- **html2pdf.js**: HTML to PDF conversion
- **OpenAI GPT-4o-mini**: AI text processing
- **HTML5/CSS3/JavaScript**: Modern web interface
- **Client-side Processing**: All processing in browser

## 💡 Tips for Best Results

1. **Use SOS Template**: Best results with professional formatting
2. **Set OpenAI API Key**: Improves text extraction quality
3. **Clear PDFs**: Better OCR with high-quality scans
4. **Test First**: Try with sample PDF before important documents

## 🔍 Troubleshooting

- **PDF Issues**: Ensure valid PDF file under 10MB
- **Missing Data**: AI processing may need improvement
- **Download Problems**: Use HTML version as backup
- **Template Issues**: Check placeholder syntax

## 🚀 Usage Examples

### **Basic Usage**
1. Open `index.html`
2. Select SOS company
3. Upload client PDF
4. Download professional RFQ

### **With API Key**
1. Set OpenAI API key in settings
2. Process PDF for enhanced extraction
3. Get better product descriptions

### **Custom Branding**
1. Upload company logo
2. Set header/footer text
3. Generate branded RFQs

## 📈 Benefits

- ✅ **Professional Output**: Company-branded documents
- ✅ **Time Saving**: Automatic processing
- ✅ **Consistent Format**: Standardized RFQs
- ✅ **No Word Issues**: Direct PDF generation
- ✅ **Logo Preservation**: Company branding maintained
- ✅ **Signature Included**: Professional signatures
- ✅ **QR Code**: Verification and tracking

## 🎉 Ready to Use!

Your RFQ Converter provides:
- **Professional SOS template** with logo and signature
- **AI-powered extraction** for accurate data
- **High-quality PDFs** ready for clients
- **No Word compatibility issues**
- **Complete company branding**

---

**Start converting RFQs professionally today!** 🚀