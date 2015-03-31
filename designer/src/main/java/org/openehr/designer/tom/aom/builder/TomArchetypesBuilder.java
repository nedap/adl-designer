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

package org.openehr.designer.tom.aom.builder;

import com.google.common.base.Joiner;
import org.openehr.adl.FlatArchetypeProvider;
import org.openehr.adl.am.AmQuery;
import org.openehr.adl.am.mixin.AmMixins;
import org.openehr.designer.tom.*;
import org.openehr.designer.tom.constraint.CComplexObjectTom;
import org.openehr.jaxb.am.*;
import org.openehr.jaxb.rm.MultiplicityInterval;
import org.openehr.jaxb.rm.ResourceAnnotationNodeItems;
import org.openehr.jaxb.rm.ResourceAnnotationNodes;
import org.openehr.jaxb.rm.ResourceAnnotations;

import javax.annotation.Nullable;
import java.util.*;

import static com.google.common.base.MoreObjects.firstNonNull;
import static org.openehr.adl.rm.RmObjectFactory.*;
import static org.openehr.designer.WtUtils.overrideNodeId;

/**
 * @author Marko Pipan
 */
class TomArchetypesBuilder {
    private final FlatArchetypeProvider flatArchetypeProvider;
    private final List<DifferentialArchetype> targetArchetypes;
    private FlatArchetype archetypeParent;
    private DifferentialArchetype archetype;
    private TomConstraintsBuilder constraintsBuilder;
    private final List<String> parentPathSegments = new ArrayList<>();
    private final List<String> newPathSegments = new ArrayList<>();

    private int specializationDepth;
    private int nextNodeId = 1;

    public TomArchetypesBuilder(FlatArchetypeProvider flatArchetypeProvider,
                                List<DifferentialArchetype> targetArchetypes) {
        this.flatArchetypeProvider = flatArchetypeProvider;
        this.targetArchetypes = targetArchetypes;
    }

    DifferentialArchetype build(ArchetypeRootTom archetypeTom) {
        boolean isTemplate = archetypeTom instanceof TemplateTom;
        specializationDepth = archetypeTom.getNodeId().split("\\.").length;

        archetypeParent = flatArchetypeProvider.getFlatArchetype(archetypeTom.getParentArchetypeId());

        archetype = new DifferentialArchetype();
        archetype.setIsTemplate(isTemplate);
        archetype.setIsOverlay(!isTemplate);
        archetype.setAdlVersion("1.5");
//        archetype.setConcept(archetypeTom.getNodeId());
        archetype.setOriginalLanguage(archetypeParent.getOriginalLanguage());
        archetype.getTranslations().addAll(archetypeParent.getTranslations());
        archetype.setParentArchetypeId(newArchetypeId(archetypeTom.getParentArchetypeId()));
        archetype.setArchetypeId(newArchetypeId(archetypeTom.getArchetypeId()));
        archetype.setOntology(new ArchetypeOntology());

        targetArchetypes.add(archetype);

        constraintsBuilder = new TomConstraintsBuilder(archetypeParent, archetype);
        archetype.setDefinition(parseDefinition(archetypeTom));
        return archetype;
    }

    private CComplexObject parseDefinition(ArchetypeRootTom tom) {
        final String newNodeId = overrideNodeId(tom.getNodeId());
        CComplexObject result = new CComplexObject();
        result.setOccurrences(newMultiplicityInterval(1, 1));
        result.setNodeId(newNodeId);
        result.setRmTypeName(tom.getRmType());
        addTermToOntology(newNodeId, tom.getTerms());
        if (tom.getOccurrences() != null) {
            result.setOccurrences(newMultiplicityInterval(tom.getOccurrences().getLower(), tom.getOccurrences().getUpper()));
        }

        addChildren(tom, result);
        return result;
    }

    private void addChildren(AbstractItemTom tom, CComplexObject result) {
        Map<String, CAttribute> existingAttributes = new HashMap<>();

        for (AbstractItemTom childTom : firstNonNull(tom.getItems(), Collections.<AbstractItemTom>emptyList())) {
            String parentPath = childTom.getPath();
            String newPath = childTom.getPath();
            if (childTom.getNodeId() != null) {
                parentPath += "[" + childTom.getNodeId() + "]";
                newPath += "[" + overrideNodeId(childTom.getNodeId()) + "]";
            }
            parentPathSegments.add(parentPath);
            newPathSegments.add(newPath);

            CAttribute attribute = existingAttributes.get(childTom.getPath());
            if (attribute == null) {
                attribute = new CAttribute();
                attribute.setDifferentialPath(childTom.getPath());
                result.getAttributes().add(attribute);
                existingAttributes.put(childTom.getPath(), attribute);
            }
            attribute.getChildren().add(parseItem(childTom));

            parentPathSegments.remove(parentPathSegments.size() - 1);
            newPathSegments.remove(newPathSegments.size() - 1);
        }
    }


    private void addTermToOntology(String nodeId, Map<String, LocalizedNameTom> terms) {
        if (terms == null) return;
        for (Map.Entry<String, LocalizedNameTom> entry : terms.entrySet()) {
            CodeDefinitionSet cds = getCodeDefinitionSetForLanguage(entry.getKey());
            ArchetypeTerm at = new ArchetypeTerm();
            at.setCode(nodeId);
            at.getItems().add(newStringDictionaryItem("text", entry.getValue().getText()));
            if (entry.getValue().getDescription() != null) {
                at.getItems().add(newStringDictionaryItem("description", entry.getValue().getDescription()));
            }
            cds.getItems().add(at);
        }
    }

    private CodeDefinitionSet getCodeDefinitionSetForLanguage(String language) {
        for (CodeDefinitionSet cds : archetype.getOntology().getTermDefinitions()) {
            if (cds.getLanguage().equals(language)) return cds;
        }
        CodeDefinitionSet cds = new CodeDefinitionSet();
        cds.setLanguage(language);
        archetype.getOntology().getTermDefinitions().add(cds);
        return cds;
    }


    private CObject parseItem(AbstractItemTom tom) {
        final CObject result;
        if (tom instanceof ArchetypeRootTom) {
            result = parseArchetypeTom((ArchetypeRootTom) tom);
        } else if (tom instanceof ItemTom) {
            result = parseItemTom((ItemTom) tom);
        } else {
            throw new IllegalStateException("Unknown tom item class: " + tom.getClass().getName());
        }

        addAnnotations(result, tom);
        return result;

    }

    private void addAnnotations(CObject result, AbstractItemTom tom) {
        if (tom.getAnnotations() == null) return;

        String rmPath = Joiner.on("").join(newPathSegments);
        for (Map.Entry<String, Map<String, String>> languageEntry : tom.getAnnotations().entrySet()) {
            String lang = languageEntry.getKey();
            ResourceAnnotationNodes annotationsSet = getOrCreateAnnotationsSet(lang);
            annotationsSet.setLanguage(lang);
            Map<String, String> annotations = languageEntry.getValue();
            if (!annotations.isEmpty()) {
                ResourceAnnotationNodeItems annotation = new ResourceAnnotationNodeItems();
                annotation.setPath(rmPath);
                for (Map.Entry<String, String> entry : annotations.entrySet()) {
                    annotation.getItems().add(newStringDictionaryItem(entry.getKey(), entry.getValue()));
                }
                annotationsSet.getItems().add(annotation);
            }
        }
    }

    private ResourceAnnotationNodes getOrCreateAnnotationsSet(String lang) {
        if (archetype.getAnnotations() == null) {
            archetype.setAnnotations(new ResourceAnnotations());
        }
        Optional<ResourceAnnotationNodes> opt = archetype.getAnnotations().getItems().stream()
                .filter(a -> a.getLanguage().equals(lang))
                .findFirst();

        if (opt.isPresent()) {
            return opt.get();
        } else {
            ResourceAnnotationNodes result = new ResourceAnnotationNodes();
            result.setLanguage(lang);
            archetype.getAnnotations().getItems().add(result);
            return result;
        }
    }

    private CComplexObject parseItemTom(ItemTom tom) {
        final String newNodeId = overrideNodeId(tom.getNodeId());

        CComplexObject result = new CComplexObject();
        result.setRmTypeName(tom.getRmType());
        result.setNodeId(newNodeId);

        String parentRmPath = Joiner.on("").join(parentPathSegments);
        CObject parentConstraint = AmQuery.get(archetypeParent, parentRmPath);


        // Add occurrences if the differ from parent
        if (tom.getOccurrences() != null) {
            MultiplicityInterval newOccurrences = newMultiplicityInterval(tom.getOccurrences().getLower(), tom.getOccurrences().getUpper());
            if (parentConstraint.getOccurrences() != null) {
                if (!AmMixins.of(parentConstraint.getOccurrences()).isEqualTo(newOccurrences)) {
                    result.setOccurrences(newOccurrences);
                }
            }
        }
        //result.setOccurrences(); // todo set occurrences
        addTermToOntology(newNodeId, tom.getTerms());
        addChildren(tom, result);


        if (tom.getConstraints() != null) {

            CObject parentDataConstraint;
            CComplexObject target;

            if (tom.getDataAttribute() != null) {
                parentDataConstraint = AmQuery.get(parentConstraint, tom.getDataAttribute());

                target = new CComplexObject();
                target.setRmTypeName(parentDataConstraint.getRmTypeName());
                final String newConstraintNodeId = overrideNodeId(parentDataConstraint.getNodeId());
                target.setNodeId(newConstraintNodeId);

                CAttribute attr = new CAttribute();
                attr.setRmAttributeName(tom.getDataAttribute());
                attr.getChildren().add(target);
                result.getAttributes().add(attr);
            } else {
                parentDataConstraint = parentConstraint;
                target = result;
            }
            if (parentDataConstraint instanceof CComplexObject) {
                constraintsBuilder.build(target, (CComplexObjectTom) tom.getConstraints(), (CComplexObject) parentDataConstraint);
            }
        }

        return result;
    }

    private CArchetypeRoot parseArchetypeTom(ArchetypeRootTom tom) {
        CArchetypeRoot result = new CArchetypeRoot();

        DifferentialArchetype overlayArchetype = new TomArchetypesBuilder(flatArchetypeProvider, targetArchetypes).build(tom);

        result.setArchetypeRef(overlayArchetype.getArchetypeId().getValue());
        result.setRmTypeName(tom.getRmType());
        result.setNodeId(overlayArchetype.getDefinition().getNodeId());
        return result;
    }

    private String newSpecializedNodeId(@Nullable String parentNode) {
        StringBuilder result;
        int specialization;
        if (parentNode == null) {
            result = new StringBuilder("id");
            specialization = 0;
        } else {
            result = new StringBuilder(parentNode);
            specialization = parentNode.split("\\.").length - 1;
        }
        for (; specialization < specializationDepth; specialization++) {
            result.append("0.");
        }
        result.append(nextNodeId++);
        return result.toString();
    }
}
