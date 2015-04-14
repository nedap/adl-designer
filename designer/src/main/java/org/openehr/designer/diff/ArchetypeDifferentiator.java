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

package org.openehr.designer.diff;

import org.openehr.adl.util.AdlUtils;
import org.openehr.adl.util.ArchetypeWrapper;
import org.openehr.jaxb.am.*;

import javax.annotation.Nullable;
import java.util.*;
import java.util.stream.Collectors;

import static org.openehr.designer.diff.NodeIdDifferentiator.getSpecializationDepth;

/**
 * @author markopi
 */
public class ArchetypeDifferentiator {
    private final FlatArchetype flatParent;
    private final FlatArchetype flatChild;
    private final ArchetypeWrapper flatParentWrapper;
    private final int archetypeSpecializationDepth;

    private ArchetypeDifferentiator(@Nullable FlatArchetype flatParent, FlatArchetype flatChild) {
        this.flatParent = flatParent;
        this.flatChild = flatChild;
        this.flatParentWrapper = flatParent != null ? new ArchetypeWrapper(flatParent) : null;
        this.archetypeSpecializationDepth = getSpecializationDepth(flatChild.getDefinition().getNodeId());
    }

    public static DifferentialArchetype differentiate(@Nullable FlatArchetype flatParent, FlatArchetype flatChild) {
        return new ArchetypeDifferentiator(flatParent, flatChild).build();
    }

    private DifferentialArchetype build() {
        DifferentialArchetype diffChild = AdlUtils.createDifferentialArchetypeClone(flatChild);
        if (flatParent == null) {
            return diffChild; // no differentiation needed
        }
        pruneUnspecializedNodes(diffChild.getDefinition());

        makeDifferentialPaths(diffChild.getDefinition());

        removeUnspecializedTermDefinitions(diffChild);
        removeUnspecializedTermBindings(diffChild);
        removeUnspecializedValueSets(diffChild);

        return diffChild;
    }

    private void removeUnspecializedValueSets(DifferentialArchetype diffChild) {

        for (Iterator<ValueSetItem> iterator = diffChild.getOntology().getValueSets().iterator(); iterator.hasNext(); ) {
            ValueSetItem valueSetItem = iterator.next();
            List<String> parentMembers = flatParentWrapper.getValueSet(valueSetItem.getId());
            if (parentMembers != null && parentMembers.equals(valueSetItem.getMembers())) {
                iterator.remove();
            }
        }

    }

    private void removeUnspecializedTermDefinitions(DifferentialArchetype diffChild) {
        ArchetypeWrapper diffChildWrapper = new ArchetypeWrapper(diffChild);
        List<String> languages = diffChild.getOntology().getTermDefinitions().stream()
                .map(CodeDefinitionSet::getLanguage)
                .collect(Collectors.toList());

        if (diffChild.getOntology().getTermDefinitions().isEmpty()) return;
        List<String> termIds = diffChild.getOntology().getTermDefinitions().get(0).getItems().stream()
                .map(ArchetypeTerm::getCode)
                .collect(Collectors.toList());

        Set<String> termsToKeep = new HashSet<>();

        termLoop:
        for (String termId : termIds) {
            if (getSpecializationDepth(termId) == archetypeSpecializationDepth) {
                termsToKeep.add(termId);
                continue;
            }
            for (String language : languages) {
                Map<String, String> diffTerm = diffChildWrapper.getTerm(language, termId);
                Map<String, String> parentTerm = flatParentWrapper.getTerm(language, termId);
                if (diffTerm != null && !diffTerm.equals(parentTerm)) {
                    termsToKeep.add(termId);
                    continue termLoop;
                }
            }
        }

        for (CodeDefinitionSet codeDefinitionSet : diffChild.getOntology().getTermDefinitions()) {
            for (Iterator<ArchetypeTerm> iterator = codeDefinitionSet.getItems().iterator(); iterator.hasNext(); ) {
                ArchetypeTerm at = iterator.next();
                if (!termsToKeep.contains(at.getCode())) {
                    iterator.remove();
                }
            }
        }
    }

    private void removeUnspecializedTermBindings(DifferentialArchetype diffChild) {
        if (diffChild.getOntology().getTermBindings().isEmpty()) return;

        for (Iterator<TermBindingSet> tbsIterator = diffChild.getOntology().getTermBindings().iterator(); tbsIterator.hasNext(); ) {
            TermBindingSet termBindingSet = tbsIterator.next();
            for (Iterator<TermBindingItem> tbiIterator = termBindingSet.getItems().iterator(); tbiIterator.hasNext(); ) {
                TermBindingItem termBindingItem = tbiIterator.next();
                if (getSpecializationDepth(termBindingItem.getCode()) == archetypeSpecializationDepth) continue;
                if (Objects.equals(
                        termBindingItem.getValue(),
                        flatParentWrapper.getTerminologyBinding(termBindingSet.getTerminology(), termBindingItem.getCode()))) {
                    tbiIterator.remove();
                }
            }
            if (termBindingSet.getItems().isEmpty()) {
                tbsIterator.remove();
            }

        }
    }

    private void makeDifferentialPaths(CObject cobject) {
        if (!(cobject instanceof CComplexObject)) return;
        CComplexObject cobj = (CComplexObject) cobject;
        for (CAttribute cAttribute : cobj.getAttributes()) {
            makeDifferentialPaths(cAttribute);
        }
    }

    private void makeDifferentialPaths(CAttribute cattr) {
        cattr.getChildren().forEach(this::makeDifferentialPaths);
        if (isIntermediate(cattr)) {
            CComplexObject cchild = (CComplexObject) cattr.getChildren().get(0);
            CAttribute cChildAttr = cchild.getAttributes().get(0);
            if (cChildAttr.getDifferentialPath() == null) {
                cattr.setDifferentialPath("/" + cattr.getRmAttributeName() + "[" + cchild.getNodeId() + "]/"
                        + cChildAttr.getRmAttributeName());
            } else {
                cattr.setDifferentialPath("/" + cattr.getRmAttributeName() + "[" + cchild.getNodeId() + "]"
                        + cChildAttr.getDifferentialPath());
            }
            cattr.setRmAttributeName(null);
            cattr.getChildren().clear();
            cattr.getChildren().addAll(cChildAttr.getChildren());
        }

    }

    private boolean isIntermediate(CAttribute cattr) {
        if (cattr.getChildren().size() != 1) return false;
        if (!isIntermediate(cattr.getChildren().get(0))) return false;
        return true;

    }

    private boolean isIntermediate(CObject cobject) {
        if (!(cobject instanceof CComplexObject)) return false;
        CComplexObject cobj = (CComplexObject) cobject;
        if (!cobj.getAttributeTuples().isEmpty()) return false;
        if (cobj.getNodeId() == null) return false;
        int nodeSpecializationDepth = NodeIdDifferentiator.getSpecializationDepth(cobj.getNodeId());
        if (nodeSpecializationDepth == archetypeSpecializationDepth) return false;
        if (cobj.getAttributes().size() != 1) return false;
        return true;
    }

    /**
     * Prune nodes that are not specialized and do not have any specialized children. Allows node_id==null on children
     * of specialized nodes.
     *
     * @param cobj object to check
     * @return prune if the object should be removed, keep if it should be kept, undetermined if it not known yet
     */
    private Prune pruneUnspecializedNodes(CObject cobj) {
        Prune result = Prune.undetermined;
        if (cobj instanceof CComplexObject) {
            CComplexObject cComplexObject = (CComplexObject) cobj;
            for (Iterator<CAttribute> attrIterator = cComplexObject.getAttributes().iterator(); attrIterator.hasNext(); ) {
                CAttribute attribute = attrIterator.next();
                for (Iterator<CObject> childIterator = attribute.getChildren().iterator(); childIterator.hasNext(); ) {
                    CObject childConstraint = childIterator.next();
                    Prune pruneChild = pruneUnspecializedNodes(childConstraint);
                    if (pruneChild == Prune.prune) {
                        childIterator.remove();
                    } else if (pruneChild == Prune.keep) {
                        result = Prune.keep;
                    }
                }

                if (attribute.getChildren().isEmpty()) {
                    attrIterator.remove();
                }
            }
        }
        if (result != Prune.undetermined) {
            return result;
        }

        if (cobj.getNodeId() != null) {
            if (cobj.getNodeId().startsWith("openEHR-")) {
                result = Prune.keep;
            } else {
                int nodeSpecializationDepth = getSpecializationDepth(cobj.getNodeId());
                if (nodeSpecializationDepth < archetypeSpecializationDepth) {
                    result = Prune.prune;
                } else {
                    result = Prune.keep;
                }
            }
        }
        return result;
    }

    private enum Prune {
        prune,
        keep,
        undetermined
    }

}
