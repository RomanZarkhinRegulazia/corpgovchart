import * as go from 'gojs';
import type { NodeData, LinkData } from './types';

export function initDiagram(divId: string, nodeDataArray: NodeData[], linkDataArray: LinkData[]) {
    const $: any = go.GraphObject.make;

    // Clean previous diagram if exists
    const existingDiagram = go.Diagram.fromDiv(divId);
    if (existingDiagram) existingDiagram.div = null;

    const myDiagram = $(go.Diagram, divId, {
        "undoManager.isEnabled": true,
        // (a) Bright Grey Grid
        "grid.visible": true,
        grid: $(go.Panel, "Grid",
            $(go.Shape, "LineH", { stroke: "#F5F5F5", strokeWidth: 1 }),
            $(go.Shape, "LineV", { stroke: "#F5F5F5", strokeWidth: 1 })
        ),
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

    // The Context Menu Object (Nodes)
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
            ),
            makeButton("Delete Node",
                function (e, obj) {
                    const button = obj as go.GraphObject;
                    const ad = button.part as go.Adornment;
                    const part = ad.adornedPart;
                    if (part !== null) {
                        e.diagram.startTransaction("Delete Node");
                        e.diagram.remove(part);
                        e.diagram.commitTransaction("Delete Node");
                    }
                }
            )
        );

    // Context Menu for Links
    const linkContextMenu =
        $("ContextMenu",
            makeButton("Delete Link",
                function (e, obj) {
                    const button = obj as go.GraphObject;
                    const ad = button.part as go.Adornment;
                    const part = ad.adornedPart;
                    if (part !== null) {
                        e.diagram.startTransaction("Delete Link");
                        e.diagram.remove(part);
                        e.diagram.commitTransaction("Delete Link");
                    }
                }
            )
        );

    // --- 1. NODE TEMPLATES (THE BOXES) ---

    // Default Template (Employees)
    myDiagram.nodeTemplateMap.add("Employee",
        $(go.Node, "Auto",
            {
                contextMenu: partContextMenu
                // linkable properties moved to Shape to avoid conflict
            },
            $(go.Shape, "RoundedRectangle",
                {
                    name: "SHAPE", fill: "white", stroke: "#888", strokeWidth: 1,
                    portId: "",          // Default port
                    toLinkable: true,    // Receive links
                    fromLinkable: false  // No dragging links from body
                }
            ),
            $(go.Panel, "Vertical", { margin: 8 },
                $(go.TextBlock, { font: "bold 12pt sans-serif", stroke: "#333", margin: 2, editable: true }, new go.Binding("text", "title")),
                $(go.TextBlock, { font: "10pt sans-serif", stroke: "#555", editable: true }, new go.Binding("text", "name")),
                $(go.TextBlock, { font: "8pt sans-serif", stroke: "#999", editable: true }, new go.Binding("text", "key")),
                // THE PORT (Link Handle)
                $(go.Shape, "Circle",
                    {
                        width: 8, height: 8,
                        fill: "#666", stroke: null,
                        alignment: go.Spot.Bottom, // Place at bottom
                        portId: "out",           // ID for the port
                        fromLinkable: true,      // Allow dragging NEW links from here
                        cursor: "pointer"        // Visual cue
                    }
                )
            )
        )
    );

    // Board Template (Directors) - Different Color
    myDiagram.nodeTemplateMap.add("Board",
        $(go.Node, "Auto",
            {
                contextMenu: partContextMenu
                // linkable props moved
            },
            $(go.Shape, "RoundedRectangle",
                {
                    name: "SHAPE", fill: "#e1f5fe", stroke: "#0277bd", strokeWidth: 2,
                    portId: "",
                    toLinkable: true,
                    fromLinkable: false
                }
            ),
            $(go.Panel, "Vertical", { margin: 8 },
                $(go.TextBlock, { font: "bold 12pt sans-serif", stroke: "#01579b", margin: 2, editable: true }, new go.Binding("text", "title")),
                $(go.TextBlock, { font: "10pt sans-serif", stroke: "#0277bd", editable: true }, new go.Binding("text", "name")),
                $(go.TextBlock, { font: "8pt sans-serif", stroke: "#0288d1", editable: true }, new go.Binding("text", "key")),
                // THE PORT (Link Handle)
                $(go.Shape, "Circle",
                    {
                        width: 8, height: 8,
                        fill: "#0277bd", stroke: null,
                        alignment: go.Spot.Bottom,
                        portId: "out",
                        fromLinkable: true,
                        cursor: "pointer"
                    }
                )
            )
        )
    );

    // --- 2. LINK TEMPLATES (THE LINES) ---

    // Standard Hierarchy: ORTHOGONAL
    myDiagram.linkTemplate =
        $(go.Link,
            {
                routing: go.Link.Orthogonal,
                corner: 5,
                relinkableFrom: true,
                relinkableTo: true,
                contextMenu: linkContextMenu
            },
            $(go.Shape, { strokeWidth: 2, stroke: "#444" }),
            $(go.Shape, { toArrow: "Standard", stroke: null, fill: "#444" })
        );

    // Reporting Lines: BEZIER (Curved & Dotted)
    myDiagram.linkTemplateMap.add("Dotted",
        $(go.Link,
            {
                curve: go.Link.Bezier,
                curviness: 40,
                relinkableFrom: true,
                relinkableTo: true,
                contextMenu: linkContextMenu
            },
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
