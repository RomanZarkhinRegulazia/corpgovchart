import Papa from 'papaparse';
import { initDiagram } from './chart';
import type { CsvRow, NodeData, LinkData } from './types';

const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;

function log(msg: string) {
  console.log(msg);
  if (statusDiv) statusDiv.textContent = msg;
}

if (fileInput) {
  fileInput.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      log("Parsing file: " + file.name);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: "UTF-8",
        complete: (results) => {
          log("Rows found: " + results.data.length);
          if (results.meta.fields) console.log("Headers:", results.meta.fields);

          if (results.errors && results.errors.length > 0) {
            console.error("Parse errors:", results.errors);
            log("Error: " + results.errors[0].message);
            return;
          }
          const data = results.data as CsvRow[];
          try {
            processData(data);
            log("Chart rendered successfully.");
          } catch (e: any) {
            console.error(e);
            log("Error processing: " + e.message);
          }
        },
        error: (error: any) => {
          console.error("CSV Error:", error);
          log("Error parsing CSV: " + error.message);
        }
      });
    }
  });
}

function processData(rows: CsvRow[]) {
  // 1. Prepare Data
  const nodeDataArray: NodeData[] = [];
  const linkDataArray: LinkData[] = [];

  function clean(str: any): string {
    return (str === null || str === undefined) ? "" : String(str).trim();
  }

  // Helper to find key ignoring BOM or whitespace
  function getKey(r: CsvRow, keyName: string): string {
    const exact = r[keyName];
    if (exact !== undefined) return exact;
    // Fallback: search for key ending with keyName (handles BOM)
    const foundKey = Object.keys(r).find(k => k.trim().endsWith(keyName));
    return foundKey ? r[foundKey] : "";
  }

  // Pass 1: Build Nodes
  rows.forEach(row => {
    const role = clean(getKey(row, 'תפקיד')).replace(/"/g, '');
    const name = clean(getKey(row, 'שם'));
    const uid = clean(getKey(row, 'ת.ז'));
    const managerRef = clean(getKey(row, 'למי כפוף'));

    // Determine Category
    let category = "Employee";
    // Simple check
    if (role.includes("דירקטור")) {
      category = "Board";
    }

    // Find Parent
    let parentId = "";
    if (managerRef) {
      const parentByRole = rows.find(r => clean(getKey(r, 'תפקיד')).includes(managerRef));
      if (parentByRole) {
        parentId = clean(getKey(parentByRole, 'ת.ז'));
      } else {
        const parentById = rows.find(r => clean(getKey(r, 'ת.ז')) === managerRef);
        if (parentById) {
          parentId = clean(getKey(parentById, 'ת.ז'));
        }
      }
    }

    nodeDataArray.push({
      key: uid,
      name: name,
      title: role,
      parent: parentId,
      category: category
    });
  });

  // Pass 2: Dotted Links
  rows.forEach(row => {
    const uid = clean(getKey(row, 'ת.ז'));
    const dottedRef = clean(getKey(row, 'למי מדווח'));

    if (dottedRef) {
      let targetId = "";
      const targetByRole = rows.find(r => clean(getKey(r, 'תפקיד')).includes(dottedRef));
      if (targetByRole) {
        targetId = clean(getKey(targetByRole, 'ת.ז'));
      } else {
        const targetById = rows.find(r => clean(getKey(r, 'ת.ז')) === dottedRef);
        if (targetById) {
          targetId = clean(getKey(targetById, 'ת.ז'));
        }
      }

      if (targetId) {
        linkDataArray.push({
          from: targetId,
          to: uid,
          category: "Dotted"
        });
      }
    }
  });

  // Initialize Diagram
  initDiagram("myDiagramDiv", nodeDataArray, linkDataArray);
}
