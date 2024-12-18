const docx = require("docx");
const ExcelJS = require("exceljs");
const fs = require("fs");

const generateFile = async (req) => {
  const { message, format } = req.body;

  if (!message || !format) {
    throw new Error("Message and format are required");
  }

  try {
    if (format === "document") {
      const doc = new docx.Document({
        sections: [
          {
            properties: {},
            children: [
              new docx.Paragraph({
                children: [new docx.TextRun(message)],
              }),
            ],
          },
        ],
      });

      const docBuffer = await docx.Packer.toBuffer(doc);
      return docBuffer; // Return the buffer to be sent in the response
    } else if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet 1");

      worksheet.addRow([message]);

      const excelBuffer = await workbook.xlsx.writeBuffer();
      return excelBuffer; // Return the buffer to be sent in the response
    } else {
      throw new Error(
        'Invalid format. Only "document" or "excel" are allowed.'
      );
    }
  } catch (error) {
    throw error; // Propagate error to the caller
  }
};

module.exports = { generateFile };
