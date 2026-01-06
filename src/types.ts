export interface CsvRow {
    'תפקיד': string;
    'שם': string;
    'ת.ז': string;
    'למי כפוף': string;
    'למי מדווח': string;
    [key: string]: string; // Allow flexible columns if needed
}

export interface NodeData {
    key: string;
    name: string;
    title: string;
    parent: string;
    category: string;
}

export interface LinkData {
    from: string;
    to: string;
    category?: string;
}
