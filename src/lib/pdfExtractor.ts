import { Fact } from "./mockData";
import { v4 as uuidv4 } from "uuid";

export async function extractFactsFromPDF(file: File): Promise<Fact[]> {
  // Read the PDF file
  const arrayBuffer = await file.arrayBuffer();
  const text = await extractTextFromPDF(arrayBuffer);
  console.log("Extracted text:", text); // Debug log

  // Extract key information using regex patterns
  const facts: Fact[] = [];

  // Extract lease dates
  const leaseDates = text.match(
    /(?:lease\s+period:|from\s+)?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s*(?:to|through|-)\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i
  );
  if (leaseDates) {
    facts.push({
      id: uuidv4(),
      label: "Lease Period",
      value: `${leaseDates[1]} to ${leaseDates[2]}`,
      confidence: 0.95,
      isEdited: false,
    });
  }

  // Extract contract type and purpose
  const contractTypes = text.match(
    /(?:LEASE[- ]?CONTRACT|BUY[- ]?OUT[- ]?AGREEMENT|RENTAL[- ]?AGREEMENT)(?:[^\n.]*)/i
  );
  if (contractTypes) {
    facts.push({
      id: uuidv4(),
      label: "Agreement Type",
      value: contractTypes[0].trim(),
      confidence: 0.92,
      isEdited: false,
    });
  }

  // Extract form number/identifier
  const formNumber = text.match(
    /(?:form|document)[- ]?(?:number|id|#)?[- ]?(\d+)/i
  );
  if (formNumber) {
    facts.push({
      id: uuidv4(),
      label: "Form Number",
      value: formNumber[1],
      confidence: 0.97,
      isEdited: false,
    });
  }

  // Extract property or asset description
  const propertyDesc = text.match(/(?:property|premises|asset)[^\n.]+/i);
  if (propertyDesc) {
    facts.push({
      id: uuidv4(),
      label: "Property Description",
      value: propertyDesc[0].trim(),
      confidence: 0.85,
      isEdited: false,
    });
  }

  // Extract monetary values (rent, fees, etc.)
  const moneyValues = text.match(/\$\s*[\d,]+(?:\.\d{2})?/g);
  if (moneyValues && moneyValues.length > 0) {
    facts.push({
      id: uuidv4(),
      label: "Payment Amount",
      value: moneyValues[0],
      confidence: 0.88,
      isEdited: false,
    });
  }

  return facts;
}

import * as pdfjsLib from "pdfjs-dist";

// Use the worker from the public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

interface TextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
}

interface TextContent {
  items: TextItem[];
  styles: Record<string, unknown>;
}

export async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  // Worker is set globally above for Vite compatibility
  try {
    // Load the PDF document (workerSrc is set globally above)
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = "";

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = (await page.getTextContent()) as TextContent;
      const pageText = content.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
}
