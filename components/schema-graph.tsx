"use client";

import React, { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import ReactFlow, {
    Controls,
    MiniMap,
    Background,
    Node,
    Edge,
    Handle,
    Position,
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ForeignKey {
    column: string;
    referenced_table: string;
    table_name: string;
}

interface SchemaGraphProps {
    tables: string[];
    tableColumns: Record<string, { column_name: string; data_type: string }[]>;
    foreignKeys: ForeignKey[];
}

const getDagreLayout = (nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setGraph({
        rankdir: "TB",
        nodesep: 80,
        edgesep: 40,
        ranksep: 120,
    });
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {
            width: 400,
            height: node.data.columns.length * 30 + 90,
        });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    return nodes.map((node) => ({
        ...node,
        position: {
            x: dagreGraph.node(node.id).x,
            y: dagreGraph.node(node.id).y,
        },
        draggable: true,
    }));
};

interface CustomNodeProps {
    data: {
        label: string;
        columns: { column_name: string; data_type: string }[];
    };
}

const CustomNode = ({ data }: CustomNodeProps) => {
    const router = useRouter();

    return (
        <div className="group min-w-[320px] max-w-[400px] overflow-hidden rounded-xl border bg-card shadow-lg transition-all hover:shadow-xl">
            <Handle
                type="target"
                position={Position.Top}
                className="h-3 w-3 rounded-full border-2 border-muted bg-background"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="h-3 w-3 rounded-full border-2 border-muted bg-background"
            />

            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 rounded-lg bg-muted px-3 py-2">
                        <h3 className="font-semibold tracking-tight text-foreground">{data.label}</h3>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0 overflow-hidden transition-colors hover:text-primary"
                        onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/tables/${data.label}`);
                        }}
                    >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Open table details</span>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-lg border bg-background">
                    <table className="w-full">
                        <tbody className="divide-y text-sm">
                            {data.columns.map((col) => (
                                <tr key={col.column_name}>
                                    <td className="px-3 py-2 font-medium text-foreground">{col.column_name}</td>
                                    <td className="px-3 py-2 text-right text-muted-foreground">{col.data_type}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default function SchemaGraph({ tables, tableColumns, foreignKeys }: SchemaGraphProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const initialNodes: Node[] = useMemo(
        () =>
            tables.map((table) => ({
                id: table,
                type: "customNode",
                data: {
                    label: table,
                    columns: tableColumns[table] || [],
                },
                position: { x: 0, y: 0 },
                draggable: true,
            })),
        [tables, tableColumns]
    );

    const initialEdges: Edge[] = useMemo(
        () =>
            foreignKeys.map((fk) => ({
                id: `${fk.table_name}-${fk.column}-${fk.referenced_table}`,
                source: fk.referenced_table,
                target: fk.table_name,
                label: fk.column,
                animated: true,
                type: "smoothstep",
                style: { strokeWidth: 2, stroke: "#6b7280" },
            })),
        [foreignKeys]
    );

    const dagreNodes = useMemo(() => getDagreLayout(initialNodes, initialEdges), [initialNodes, initialEdges]);

    const [nodes, , onNodesChange] = useNodesState(dagreNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    const nodeTypes = useMemo(() => ({ customNode: CustomNode }), []);

    return (
        <ReactFlowProvider>
            <div ref={containerRef} className="relative w-full h-[85vh] border rounded-lg shadow bg-gray-100">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                    nodeTypes={nodeTypes}
                >
                    <Controls />
                    <MiniMap />
                    <Background />
                </ReactFlow>
            </div>
        </ReactFlowProvider>
    );
}
