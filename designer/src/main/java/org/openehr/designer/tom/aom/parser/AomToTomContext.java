package org.openehr.designer.tom.aom.parser;

import org.openehr.adl.util.ArchetypeWrapper;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Marko Pipan
 */
public class AomToTomContext {
    private List<Node> nodes = new ArrayList<>();

    public List<Node> getNodes() {
        return nodes;
    }
    public void push(Node node) {
        nodes.add(node);
    }
    public void pop() {
        nodes.remove(nodes.size()-1);
    }

    public Node node() {
        return nodes.get(nodes.size()-1);
    }

    public static class Node {
        private String pathFromArchetypeRoot;
        private String path;
        private ArchetypeWrapper overlayArchetype;
        private ArchetypeWrapper parentArchetype;
        private ArchetypeWrapper flatOverlayArchetype;


        public Node() {
        }

        public Node(Node node) {
            this.path=node.path;
            this.overlayArchetype=node.overlayArchetype;
            this.parentArchetype=node.parentArchetype;
            this.flatOverlayArchetype=node.flatOverlayArchetype;
            this.pathFromArchetypeRoot =node.pathFromArchetypeRoot;
        }

        public String getPathFromArchetypeRoot() {
            return pathFromArchetypeRoot;
        }

        public void setPathFromArchetypeRoot(String pathFromArchetypeRoot) {
            this.pathFromArchetypeRoot = pathFromArchetypeRoot;
        }

        public String getPath() {
            return path;
        }

        public void setPath(String path) {
            this.path = path;
        }

        public ArchetypeWrapper getOverlayArchetype() {
            return overlayArchetype;
        }

        public void setOverlayArchetype(ArchetypeWrapper overlayArchetype) {
            this.overlayArchetype = overlayArchetype;
        }

        public ArchetypeWrapper getParentArchetype() {
            return parentArchetype;
        }

        public void setParentArchetype(ArchetypeWrapper parentArchetype) {
            this.parentArchetype = parentArchetype;
        }

        public ArchetypeWrapper getFlatOverlayArchetype() {
            return flatOverlayArchetype;
        }

        public void setFlatOverlayArchetype(ArchetypeWrapper flatOverlayArchetype) {
            this.flatOverlayArchetype = flatOverlayArchetype;
        }
    }
}
