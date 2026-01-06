import * as go from 'gojs';
import type { NodeData, LinkData } from './types';

export function initDiagram(divId: string, nodeDataArray: NodeData[], linkDataArray: LinkData[]) {
    const $: any = go.GraphObject.make;

    // Clean previous diagram if exists
    const existingDiagram = go.Diagram.fromDiv(divId);
    if (existingDiagram) existingDiagram.div = null;

    const myDiagram = $(go.Diagram, divId, {
        "undoManager.isEnabled": true,
        layout: $(go.TreeLayout, {
            angle: 90,
            layerSpacing: 50,
            nodeSpacing: 50,
            alternateAngle: 90,
            alternateLayerSpacing: 50,
            alternateNodeSpacing: 50
        })
    });

    // --- CONTEXT MENU DEFINITION ---

    // Helper to create buttons
    function makeButton(text: string, action: (e: go.InputEvent, obj: go.GraphObject) => void, visiblePredicate?: (obj: go.GraphObject) => boolean) {
        return $("ContextMenuButton",
            $(go.TextBlock, text),
            { click: action },
            visiblePredicate ? new go.Binding("visible", "", visiblePredicate).ofObject() : {}
        );
    }

    // The Context Menu Object
    const partContextMenu =
        $("ContextMenu",
            makeButton("Change Color",
                function (e, obj) {
                    const button = obj as go.GraphObject;
                    const ad = button.part as go.Adornment;
                    const node = ad.adornedPart as go.Node;
                    if (node === null) return;
                    e.diagram.startTransaction("Change Color");
                    const shape = node.findObject("SHAPE") as go.Shape;
                    if (shape !== null) {
                        // Toggle between current and yellow
                        if (shape.fill === "#fff59d") {
                            shape.fill = "white";
                        } else {
                            shape.fill = "#fff59d";
                        }
                    }
                    e.diagram.commitTransaction("Change Color");
                }
            ),
            makeButton("Show Details",
                function (_, obj) {
                    const button = obj as go.GraphObject;
                    const ad = button.part as go.Adornment;
                    const node = ad.adornedPart as go.Node;
                    if (node === null) return;
                    const data = node.data as NodeData;
                    alert("Details:\nName: " + data.name + "\nRole: " + data.title + "\nID: " + data.key);
                }
            )
        );

    // --- 1. NODE TEMPLATES (THE BOXES) ---

    // Default Template (Employees)
    myDiagram.nodeTemplateMap.add("Employee",
        $(go.Node, "Auto",
            { contextMenu: partContextMenu },
            $(go.Shape, "RoundedRectangle", { name: "SHAPE", fill: "white", stroke: "#888", strokeWidth: 1 }),
            $(go.Panel, "Vertical", { margin: 8 },
                $(go.TextBlock, { font: "bold 12pt sans-serif", stroke: "#333", margin: 2, editable: true }, new go.Binding("text", "title")),
                $(go.TextBlock, { font: "10pt sans-serif", stroke: "#555", editable: true }, new go.Binding("text", "name")),
                $(go.TextBlock, { font: "8pt sans-serif", stroke: "#999", editable: true }, new go.Binding("text", "key"))
            )
        )
    );

    // Board Template (Directors) - Different Color
    myDiagram.nodeTemplateMap.add("Board",
        $(go.Node, "Auto",
            { contextMenu: partContextMenu },
            $(go.Shape, "RoundedRectangle", { name: "SHAPE", fill: "#e1f5fe", stroke: "#0277bd", strokeWidth: 2 }),
            $(go.Panel, "Vertical", { margin: 8 },
                $(go.TextBlock, { font: "bold 12pt sans-serif", stroke: "#01579b", margin: 2, editable: true }, new go.Binding("text", "title")),
                $(go.TextBlock, { font: "10pt sans-serif", stroke: "#0277bd", editable: true }, new go.Binding("text", "name")),
                $(go.TextBlock, { font: "8pt sans-serif", stroke: "#0288d1", editable: true }, new go.Binding("text", "key"))
            )
        )
    );

    // --- 2. LINK TEMPLATES (THE LINES) ---

    // Standard Hierarchy: ORTHOGONAL
    myDiagram.linkTemplate =
        $(go.Link,
            { routing: go.Link.Orthogonal, corner: 5 },
            $(go.Shape, { strokeWidth: 2, stroke: "#444" }),
            $(go.Shape, { toArrow: "Standard", stroke: null, fill: "#444" })
        );

    // Reporting Lines: BEZIER (Curved & Dotted)
    myDiagram.linkTemplateMap.add("Dotted",
        $(go.Link,
            { curve: go.Link.Bezier, curviness: 40 },
            $(go.Shape, { strokeWidth: 2, stroke: "#e53935", strokeDashArray: [6, 3] }),
            $(go.Shape, { toArrow: "OpenTriangle", stroke: "#e53935", strokeWidth: 2 })
        )
    );

    // --- 3. MODEL ---
    myDiagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

    // Auto-generate hierarchy links from 'parent' data
    nodeDataArray.forEach(node => {
        if (node.parent) {
            (myDiagram.model as go.GraphLinksModel).addLinkData({ from: node.parent, to: node.key });
        }
    });

    return myDiagram;
}
