import React from 'react';
import { Box, Typography, Paper, Alert, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DependencyGraph, DependencyNode, DependencyEdge } from '../../../types';

// DependencyGraphVisualizer component
const DependencyGraphVisualizer: React.FC<{ graph: DependencyGraph }> = ({ graph }) => {
  const theme = useTheme();
  
  if (graph.nodes.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%' 
      }}>
        <Typography variant="body1" color="text.secondary">
          No sections found. Add sections to visualize dependencies.
        </Typography>
      </Box>
    );
  }
  
  // Build a hierarchical structure for visualization
  const buildDependencyTree = () => {
    // Get all section nodes (both main and nested)
    const allSectionNodes = graph.nodes.filter(node => node.type === 'section');
    
    // Map of section IDs to their dependency info
    const dependencyMap: Record<string, {
      node: DependencyNode;
      dependsOn: Array<{
        fieldNode: DependencyNode;
        sectionNode: DependencyNode;
        condition: string;
      }>;
      children: string[];
      isNested: boolean;
      parentSection?: string;
    }> = {};
    
    // Initialize the map with all sections
    allSectionNodes.forEach(node => {
      // Determine if this is a nested section
      const isNested = !!node.parentId;
      
      dependencyMap[node.id] = {
        node,
        dependsOn: [],
        children: [],
        isNested,
        parentSection: node.parentId
      };
    });
    
    // Add dependencies based on edges
    graph.edges.forEach(edge => {
      const sourceNode = graph.nodes.find(n => n.id === edge.source);
      const targetNode = graph.nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode || sourceNode.type !== 'section') return;
      
      // Find the section that contains this field
      if (targetNode.type === 'field' && targetNode.parentId) {
        const fieldSectionNode = graph.nodes.find(n => n.id === targetNode.parentId);
        
        if (fieldSectionNode && dependencyMap[sourceNode.id]) {
          dependencyMap[sourceNode.id].dependsOn.push({
            fieldNode: targetNode,
            sectionNode: fieldSectionNode,
            condition: edge.condition || ''
          });
          
          // Record parent-child relationship
          if (dependencyMap[fieldSectionNode.id]) {
            dependencyMap[fieldSectionNode.id].children.push(sourceNode.id);
          }
        }
      }
    });
    
    return dependencyMap;
  };
  
  const dependencyTree = buildDependencyTree();
  
  // Find root nodes (sections that don't depend on any other sections and aren't nested sections)
  const rootNodes = Object.keys(dependencyTree).filter(nodeId => 
    dependencyTree[nodeId].dependsOn.length === 0 && 
    !dependencyTree[nodeId].isNested
  );
  
  // Recursive component to render a node and its children
  const renderNode = (nodeId: string, level: number = 0, visited: Set<string> = new Set()) => {
    // Prevent circular rendering
    if (visited.has(nodeId)) {
      return (
        <Box key={`cycle-${nodeId}`} sx={{ ml: level * 3, mt: 1, color: 'error.main' }}>
          <Typography variant="body2">Circular dependency detected!</Typography>
        </Box>
      );
    }
    
    const nodeInfo = dependencyTree[nodeId];
    if (!nodeInfo) return null;
    
    const newVisited = new Set(visited);
    newVisited.add(nodeId);
    
    // Find nested sections that belong to this section
    const nestedSections = Object.keys(dependencyTree).filter(id => 
      dependencyTree[id].isNested && dependencyTree[id].parentSection === nodeId
    );
    
    return (
      <Box key={nodeId} sx={{ mb: 2 }}>
        {/* Node representation */}
        <Paper 
          elevation={1}
          sx={{ 
            p: 2, 
            borderRadius: '8px',
            backgroundColor: level === 0 
              ? 'background.paper' 
              : nodeInfo.isNested
                ? alpha(theme.palette.info.light, 0.1)
                : alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: level > 0 ? 1 : 3,
            borderLeft: `4px solid ${
              nodeInfo.isNested ? theme.palette.info.main :
              level === 0 ? theme.palette.primary.main : 
              level === 1 ? theme.palette.secondary.main :
              theme.palette.success.main
            }`,
            ml: level * 3
          }}
        >
          <Typography variant="subtitle1" fontWeight="medium" sx={{
            color: nodeInfo.isNested ? theme.palette.info.dark : 'inherit'
          }}>
            {nodeInfo.isNested ? '↳ ' : ''}{nodeInfo.node.label}
            {nodeInfo.isNested && <Typography component="span" variant="caption" sx={{ ml: 1 }}>
              (Nested Section)
            </Typography>}
          </Typography>
          
          {/* Display dependencies */}
          {nodeInfo.dependsOn.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 'medium' }}>
                Depends on:
              </Typography>
              {nodeInfo.dependsOn.map((dep, idx) => (
                <Box 
                  key={`dep-${idx}`} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mt: 0.5,
                    pl: 1,
                    borderLeft: `2px solid ${alpha(theme.palette.divider, 0.5)}`
                  }}
                >
                  <ArrowBackIcon 
                    sx={{ 
                      mr: 1, 
                      fontSize: '0.9rem', 
                      color: theme.palette.text.secondary 
                    }} 
                  />
                  <Typography variant="body2">
                    Field <strong>{dep.fieldNode.label}</strong> from 
                    {dependencyTree[dep.sectionNode.id]?.isNested ? ' nested section ' : ' section '}
                    "{dep.sectionNode.label}"
                    {dep.condition && <span style={{ color: theme.palette.info.main }}> {dep.condition}</span>}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
        
        {/* Render nested sections belonging to this section */}
        {nestedSections.length > 0 && (
          <Box sx={{ ml: level * 3 + 2, mt: 1, mb: 1 }}>
            <Box 
              sx={{ 
                height: '20px',
                borderLeft: `2px dashed ${theme.palette.info.main}`,
                ml: 2
              }} 
            />
            {nestedSections.map(nestedId => renderNode(nestedId, level + 1, newVisited))}
          </Box>
        )}
        
        {/* Connection line to dependent sections */}
        {dependencyTree[nodeId].children.filter(id => !dependencyTree[id].isNested).length > 0 && (
          <Box 
            sx={{ 
              height: '20px', 
              ml: level * 3 + 2, 
              borderLeft: `2px dashed ${theme.palette.divider}` 
            }} 
          />
        )}
        
        {/* Render sections that depend on this one (but not nested sections) */}
        {dependencyTree[nodeId].children
          .filter(id => !dependencyTree[id].isNested)
          .map(childId => renderNode(childId, level + 1, newVisited))}
      </Box>
    );
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Section Dependency Tree</Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        This visualization shows how sections and nested sections depend on fields from other sections.
        Sections at the top are independent, while sections below depend on fields from sections above.
      </Typography>
      
      {rootNodes.length === 0 ? (
        <Alert severity="warning" sx={{ mt: 2 }}>
          No root sections found. There might be circular dependencies in your form structure.
        </Alert>
      ) : (
        <Box sx={{ mt: 2 }}>
          {rootNodes.map(nodeId => renderNode(nodeId))}
        </Box>
      )}
      
      {/* Legend */}
      <Paper sx={{ mt: 3, p: 2, backgroundColor: alpha(theme.palette.background.paper, 0.7) }}>
        <Typography variant="subtitle2" gutterBottom>Legend:</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: theme.palette.primary.main, mr: 1 }} />
            <Typography variant="body2">Root sections (don't depend on any fields)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: theme.palette.secondary.main, mr: 1 }} />
            <Typography variant="body2">Level 1 dependent sections</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: theme.palette.success.main, mr: 1 }} />
            <Typography variant="body2">Deeper level dependent sections</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: theme.palette.info.main, mr: 1 }} />
            <Typography variant="body2">Nested sections</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

// Main DependenciesTab component
const DependenciesTab: React.FC<{ dependencyGraph: DependencyGraph }> = ({ dependencyGraph }) => {
  return (
    <Box sx={{ 
      height: '100%', 
      p: 2, 
      backgroundColor: 'grey.50',
      overflow: 'hidden'
    }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          height: '100%', 
          borderRadius: 2,
          overflow: 'auto'
        }}
      >
        <DependencyGraphVisualizer graph={dependencyGraph} />
      </Paper>
    </Box>
  );
};

export default DependenciesTab;
