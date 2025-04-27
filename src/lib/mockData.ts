
// This file contains mock data for demonstration purposes
import { v4 as uuidv4 } from 'uuid';

export interface Fact {
  id: string;
  label: string;
  value: string;
  confidence: number;
  isEdited: boolean;
}

export interface ClassMatch {
  id: string;
  name: string;
  description: string;
  matchConfidence: number;
  memberCount: number;
  source: string;
  datePosted?: string;
  url: string;
}

export interface ComplaintSection {
  id: string;
  title: string;
  content: string;
  isEditable: boolean;
}

export interface ExportFile {
  name: string;
  type: "pdf" | "csv" | "zip";
  status: "ready" | "generating" | "error";
  size?: number;
}

// Generate mock extracted facts from a document
export const generateMockFacts = (): Fact[] => {
  return [
    {
      id: uuidv4(),
      label: "Product Name",
      value: "TechPro 5000 Tablet",
      confidence: 0.95,
      isEdited: false,
    },
    {
      id: uuidv4(),
      label: "Purchase Date",
      value: "2023-09-15",
      confidence: 0.92,
      isEdited: false,
    },
    {
      id: uuidv4(),
      label: "Amount Paid",
      value: "$899.99",
      confidence: 0.89,
      isEdited: false,
    },
    {
      id: uuidv4(),
      label: "Serial Number",
      value: "TP5K-2023-87651234",
      confidence: 0.97,
      isEdited: false,
    },
    {
      id: uuidv4(),
      label: "Issue Description",
      value: "Device battery consistently overheats during normal use, causing the casing to warp and making the device unusable. Customer service was contacted on 10/02/2023 but refused to honor warranty.",
      confidence: 0.85,
      isEdited: false,
    },
    {
      id: uuidv4(),
      label: "Vendor",
      value: "TechGiant Electronics Inc.",
      confidence: 0.94,
      isEdited: false,
    },
  ];
};

// Generate mock class action matches
export function generateMockClassMatches(): ClassMatch[] {
  return [
    {
      id: uuidv4(),
      name: "Data Privacy Class Action",
      description: "Class action lawsuit regarding unauthorized data collection and sharing.",
      matchConfidence: 0.85,
      memberCount: 1200,
      source: "privacylaw.com",
      datePosted: "2025-03-15",
      url: "https://example.com/privacy-case"
    },
    {
      id: uuidv4(),
      name: "Consumer Protection Lawsuit",
      description: "Lawsuit about misleading product claims and pricing practices.",
      matchConfidence: 0.75,
      memberCount: 800,
      source: "consumerwatch.org",
      datePosted: "2025-04-01",
      url: "https://example.com/consumer-case"
    },
    {
      id: uuidv4(),
      name: "Employment Rights Case",
      description: "Class action regarding unpaid overtime and labor law violations.",
      matchConfidence: 0.65,
      memberCount: 500,
      source: "workersrights.net",
      datePosted: "2025-04-10",
      url: "https://example.com/employment-case"
    },
  ];
};

// Generate mock complaint sections
export const generateMockComplaintSections = (): ComplaintSection[] => {
  return [
    {
      id: "section-intro",
      title: "INTRODUCTION",
      content: "This action seeks to remedy the damages sustained by Plaintiff and the proposed class members as a result of TechGiant Electronics Inc.'s defective TechPro 5000 tablets and subsequent denial of warranty claims. The tablets suffer from a severe battery defect that causes overheating, warping of the device casing, and ultimately renders the devices unusable.",
      isEditable: true,
    },
    {
      id: "section-parties",
      title: "PARTIES",
      content: '1. Plaintiff Jane Doe is a natural person and citizen of Texas, residing in Travis County.\n\n2. Defendant TechGiant Electronics Inc. ("TechGiant") is a Delaware corporation with its principal place of business at 1000 Tech Way, San Jose, California 95110.',
      isEditable: true,
    },
    {
      id: "section-jurisdiction",
      title: "JURISDICTION AND VENUE",
      content: "3. This Court has subject matter jurisdiction over this action pursuant to 28 U.S.C. § 1332(d) because there are more than 100 class members, the aggregate amount in controversy exceeds $5,000,000.00, exclusive of interest, fees, and costs, and at least one class member is a citizen of a state different from Defendants.\n\n4. Venue is proper in this judicial district pursuant to 28 U.S.C. § 1391 because Defendant conducts substantial business in this district, and a substantial part of the events giving rise to Plaintiff's claims took place within this judicial district.",
      isEditable: false,
    },
    {
      id: "section-facts",
      title: "FACTUAL ALLEGATIONS",
      content: '5. In September 2023, Plaintiff purchased a TechPro 5000 tablet for $899.99 from TechGiant\'s authorized retailer.\n\n6. Within three weeks of purchase, Plaintiff noticed the device becoming excessively hot during normal use.\n\n7. By October 2023, the tablet\'s back panel began to warp due to the heat, rendering the device unstable when placed on flat surfaces.\n\n8. On October 2, 2023, Plaintiff contacted TechGiant customer service to report the issue and request warranty service.\n\n9. Despite the device being within the one-year warranty period, TechGiant representatives claimed the damage was due to "user mishandling" and refused to replace or repair the device.\n\n10. Subsequent investigation reveals that thousands of TechPro 5000 users have reported identical issues on TechGiant\'s support forums and on social media platforms.',
      isEditable: true,
    },
    {
      id: "section-class",
      title: "CLASS ACTION ALLEGATIONS",
      content: "11. Plaintiff brings this action on behalf of herself and on behalf of all others similarly situated pursuant to Rule 23 of the Federal Rules of Civil Procedure.\n\n12. The proposed Class is defined as: All persons in the United States who purchased a TechPro 5000 tablet within the applicable statute of limitations period.\n\n13. The proposed Class meets all requirements for class certification, including numerosity, commonality, typicality, adequacy, predominance, and superiority.",
      isEditable: false,
    },
    {
      id: "section-claims",
      title: "CAUSES OF ACTION",
      content: 'COUNT I: BREACH OF EXPRESS WARRANTY\n\n14. Plaintiff incorporates by reference all preceding allegations as though fully set forth herein.\n\n15. TechGiant expressly warranted that the TechPro 5000 tablets were free from defects in materials and workmanship under normal use for a period of one year from the date of purchase.\n\n16. The battery defect in the TechPro 5000 tablets manifested within the warranty period.\n\n17. TechGiant breached its express warranty by refusing to honor warranty claims for the defective tablets.\n\nCOUNT II: VIOLATION OF THE MAGNUSON-MOSS WARRANTY ACT\n\n18. Plaintiff incorporates by reference all preceding allegations as though fully set forth herein.\n\n19. The TechPro 5000 tablets are consumer products as defined in 15 U.S.C. § 2301(1).\n\n20. TechGiant is a supplier and warrantor as defined in 15 U.S.C. § 2301(4) and (5).\n\n21. TechGiant\'s refusal to honor its warranty constitutes a violation of the Magnuson-Moss Warranty Act, 15 U.S.C. § 2301 et seq.',
      isEditable: true,
    },
    {
      id: "section-prayer",
      title: "PRAYER FOR RELIEF",
      content: 'WHEREFORE, Plaintiff, individually and on behalf of the Class, prays for the following relief:\n\nA. Certification of the proposed Class;\n\nB. Appointment of Plaintiff as representative of the Class;\n\nC. Appointment of Plaintiff\'s counsel as counsel for the Class;\n\nD. A declaration that TechGiant\'s actions constitute breach of express warranty;\n\nE. An award of actual, compensatory, and statutory damages;\n\nF. An order requiring TechGiant to replace all defective TechPro 5000 tablets or provide a full refund of the purchase price;\n\nG. An award of reasonable attorneys\' fees and costs;\n\nH. Such other and further relief as the Court deems just and proper.',
      isEditable: false,
    }
  ];
};

// Generate mock export files
export const generateMockExportFiles = (): ExportFile[] => {
  return [
    {
      name: "Complaint.pdf",
      type: "pdf",
      status: "ready",
      size: 458752, // ~448 KB
    },
    {
      name: "Exhibits.pdf",
      type: "pdf",
      status: "ready",
      size: 1024000, // ~1000 KB
    },
    {
      name: "EvidenceIndex.csv",
      type: "csv",
      status: "ready",
      size: 2048, // ~2 KB
    }
  ];
};
