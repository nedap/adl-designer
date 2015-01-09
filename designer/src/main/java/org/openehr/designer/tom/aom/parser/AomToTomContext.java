/*
 * ADL2-core
 * Copyright (c) 2013-2014 Marand d.o.o. (www.marand.com)
 *
 * This file is part of ADL2-core.
 *
 * ADL2-core is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
